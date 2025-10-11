# app.py

import os
from flask import Flask, jsonify, request, abort
from flask_cors import CORS 
import psycopg2
import subprocess

app = Flask(__name__)
CORS(app)


DB_URI = os.environ.get('DB_URI', 'postgresql://postgres:postgrespw@postgres-service:5432/devopsbox')

def get_db_connection():
    
    conn = psycopg2.connect(DB_URI, connect_timeout=5)
    return conn
    
@app.route('/api/stats')
def get_challenge_stats():
    """Retrieves challenge status counts (pending, active, completed)."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        
        cur.execute("SELECT status, COUNT(*) FROM challenges GROUP BY status;")
        
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        stats = {status: count for status, count in rows}
        
        return jsonify({
            "completed": stats.get('completed', 0),
            "active": stats.get('active', 0),
            "pending": stats.get('pending', 0)
        })
    except Exception as e:
        return jsonify({"error": f"Database query for stats failed: {str(e)}"}), 500

@app.route('/api/health')
@app.route('/health')
def health():
    """Checks the application health and database connection status."""
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({"status": "OK"}), 200
    except Exception as e:
        return jsonify({"status": "ERROR", "details": f"DB connection failed: {str(e)}"}), 500

@app.route('/api/challenges')
@app.route('/challenges')
def get_challenges():
    """Retrieves all challenges from the database."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT id, title, category, difficulty, description, status FROM challenges;")
        
        rows = cur.fetchall()
        
        challenges = [{
            "id": r[0], 
            "title": r[1], 
            "category": r[2], 
            "difficulty": r[3], 
            "description": r[4], 
            "status": r[5]
        } for r in rows]
        
        cur.close()
        conn.close()
      
        return jsonify(challenges) 
    except Exception as e:
        return jsonify({"error": f"Database query failed: {str(e)}"}), 500

@app.route('/api/challenges/<int:challenge_id>')
@app.route('/challenges/<int:challenge_id>')
def challenge_details(challenge_id):
    """Retrieves details for a single challenge."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "SELECT id, title, category, difficulty, description, status FROM challenges WHERE id=%s;", 
            (challenge_id,)
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if row:
            return jsonify({
                "id": row[0], 
                "title": row[1], 
                "category": row[2], 
                "difficulty": row[3], 
                "description": row[4], 
                "status": row[5]
            })
        else:
            return jsonify({"error": "Challenge not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/start/<int:challenge_id>', methods=['POST'])
@app.route('/start/<int:challenge_id>', methods=['POST'])
def start_challenge(challenge_id):
    """
    Starts the challenge setup script and updates the database status.
    This is the core logic for provisioning the environment.
    """
    conn = None 
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        
        cur.execute("SELECT status, title FROM challenges WHERE id=%s;", (challenge_id,))
        row = cur.fetchone()
        
        if not row:
            return jsonify({"error": "Challenge not found"}), 404
            
        current_status = row[0]
        challenge_title = row[1]

        
        if current_status == "active":
            return jsonify({
                "message": f"Challenge '{challenge_title}' environment is already active.",
                "status": "active"
            }), 200
            
        script_path = f"sandbox/challenge_{challenge_id}/setup.sh"
        print(f"Executing script: {script_path}")
        
        result = subprocess.run(
            ["bash", script_path],
            capture_output=True,
            text=True
        )

        
        if result.returncode == 0:
            new_status = "active"
            cur.execute("UPDATE challenges SET status = %s WHERE id = %s;", (new_status, challenge_id))
            conn.commit()
            
            return jsonify({
                "message": f"Environment for Challenge '{challenge_title}' successfully launched.",
                "status": new_status,
                "output": result.stdout
            }), 200
        else:
           
            new_status = "setup_failed"
            cur.execute("UPDATE challenges SET status = %s WHERE id = %s;", (new_status, challenge_id))
            conn.commit()
            
            return jsonify({
                "error": "Challenge setup failed.",
                "details": f"Script failed with exit code {result.returncode}",
                "stdout": result.stdout,
                "stderr": result.stderr
            }), 500 

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()

@app.route('/api/validate/<int:challenge_id>', methods=['POST'])
@app.route('/validate/<int:challenge_id>', methods=['POST'])
def validate_challenge(challenge_id):
    """
    Validates the challenge by running its sandbox/validate.sh script.
    """
    conn = None 
    cur = None
    try:
        script_path = f"sandbox/challenge_{challenge_id}/validate.sh"
        if not os.path.exists(script_path):
            return jsonify({"error": f"Validation script not found for challenge {challenge_id}"}), 404

        result = subprocess.run(
            ["bash", script_path],
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            conn = get_db_connection()
            cur = conn.cursor()
            
            update_sql = "UPDATE challenges SET status = 'completed' WHERE id = %s;"
            cur.execute(update_sql, (challenge_id,))
            
            conn.commit()
            return jsonify({
                "status": "success",
                "message": result.stdout.strip()
            }), 200
        else:
            return jsonify({
                "status": "failed",
                "error": result.stderr.strip(),
                "message": result.stdout.strip()
            }), 400

    except Exception as e:
        return jsonify({"error": f"Validation failed: {str(e)}"}), 500
    finally:
       
        if cur is not None: cur.close()
        if conn is not None: conn.close()    
@app.route('/api/run-command', methods=['POST'])
def run_command():
    """
    Executes a safe command inside the workspace.
    Request body: {"command": "ls /workspace/challenges/1"}
    """
    data = request.get_json()
    if not data or "command" not in data:
        return jsonify({"error": "Command not provided"}), 400

    command = data["command"]

    
    forbidden = ["rm", "shutdown", "reboot"]
    if any(bad in command for bad in forbidden):
        return jsonify({"error": "Forbidden command"}), 403
    full_command = f". /etc/profile.d/devopsbox_profile.sh && {command}"
    try:
        result = subprocess.run(
            full_command, 
            shell=True, 
            capture_output=True, 
            text=True, 
            cwd="/app" 
        )
        return jsonify({
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/read-file', methods=['GET'])
def read_file():
    """
    Reads a file inside /workspace and returns its contents.
    Query param: ?path=/workspace/challenge_1/broken-ci.yml
    """
    file_path = request.args.get("path")
    if not file_path:
        return jsonify({"error": "Path required"}), 400

   
    if not file_path.startswith("/workspace/"):
        return jsonify({"error": "Access outside /workspace not allowed"}), 403

    
    if not os.path.exists(file_path):
        return jsonify({"error": f"File not found: {file_path}"}), 404

    try:
        with open(file_path, "r") as f:
            content = f.read()
        return jsonify({"path": file_path, "content": content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/edit-file', methods=['POST'])
def edit_file():
    """
    Allows editing of a file in the /workspace directory.
    Request JSON:
      {
        "path": "/workspace/challenge_1/broken-ci.yml",
        "content": "<new file contents>"
      }
    """
    data = request.get_json()
    if not data or "path" not in data or "content" not in data:
        return jsonify({"error": "Both 'path' and 'content' are required."}), 400

    file_path = data["path"]
    content = data["content"]

   
    if not file_path.startswith("/workspace/"):
        return jsonify({"error": "Editing outside /workspace is not allowed."}), 403

    try:
        
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(content)

        return jsonify({
            "status": "success",
            "message": f"File '{file_path}' updated successfully."
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to edit file: {str(e)}"}), 500
        
@app.route('/api/reset/<int:challenge_id>', methods=['POST'])
@app.route('/reset/<int:challenge_id>', methods=['POST'])
def reset_challenge(challenge_id):
    
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT title FROM challenges WHERE id=%s;", (challenge_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Challenge not found"}), 404

        challenge_title = row[0]
        challenge_name = f"challenge-{challenge_id}"
        script_path = f"sandbox/challenge_{challenge_id}/setup.sh"
        workspace_dir = f"/workspace/challenge_{challenge_id}"

        if not os.path.exists(script_path):
            return jsonify({"error": f"Setup script not found for challenge {challenge_id}"}), 404

        cleanup_cmds = [
            ["kubectl", "delete", "configmap", f"{challenge_name}-config", "--ignore-not-found=true"],
            ["kubectl", "delete", "pod", "-l", f"app={challenge_name}", "--ignore-not-found=true"],
            ["kubectl", "delete", "svc", "-l", f"app={challenge_name}", "--ignore-not-found=true"]
        ]
        for cmd in cleanup_cmds:
            subprocess.run(cmd, capture_output=True, text=True)

       
        if os.path.exists(workspace_dir):
            subprocess.run(["rm", "-rf", workspace_dir], check=False)

        result = subprocess.run(
            ["bash", script_path],
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            
            cur.execute("UPDATE challenges SET status = 'pending' WHERE id = %s;", (challenge_id,))
            conn.commit()

            return jsonify({
                "message": f"Challenge '{challenge_title}' reset successfully and environment re-initialized.",
                "status": "pending",
                "output": result.stdout
            }), 200
        else:
            return jsonify({
                "error": "Challenge reset failed during setup.",
                "stderr": result.stderr,
                "stdout": result.stdout
            }), 500

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


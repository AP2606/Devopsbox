# app.py

import os
from flask import Flask, jsonify, request, abort
from flask_cors import CORS 
import psycopg2
import subprocess

app = Flask(__name__)
# Enable CORS for development
CORS(app)

# Corrected string literal for the fallback DB_URI
DB_URI = os.environ.get('DB_URI', 'postgresql://postgres:postgrespw@postgres-service:5432/devopsbox')

def get_db_connection():
    # Added connection timeout for resilience
    conn = psycopg2.connect(DB_URI, connect_timeout=5)
    return conn
    
@app.route('/api/stats')
def get_challenge_stats():
    """Retrieves challenge status counts (pending, active, completed)."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Query to count challenges grouped by their status
        cur.execute("SELECT status, COUNT(*) FROM challenges GROUP BY status;")
        
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        # Format results into a simple dictionary structure
        stats = {status: count for status, count in rows}
        
        # Ensure all three categories are present, even if count is 0
        return jsonify({
            "completed": stats.get('completed', 0),
            "active": stats.get('active', 0),
            "pending": stats.get('pending', 0)
        })
    except Exception as e:
        return jsonify({"error": f"Database query for stats failed: {str(e)}"}), 500

# ROUTE FIX: Supporting both /api/health (if rewrite fails) and /health (if rewrite works)
@app.route('/api/health')
@app.route('/health')
def health():
    """Checks the application health and database connection status."""
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({"status": "OK"}), 200
    except Exception as e:
        # Note: If this fails, the DB connection failed (but postgres is up).
        return jsonify({"status": "ERROR", "details": f"DB connection failed: {str(e)}"}), 500

# ROUTE FIX: Supporting both /api/challenges (if rewrite fails) and /challenges (if rewrite works)
@app.route('/api/challenges')
@app.route('/challenges')
def get_challenges():
    """Retrieves all challenges from the database."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Select all 6 columns to match the initialized 'challenges' table schema.
        cur.execute("SELECT id, title, category, difficulty, description, status FROM challenges;")
        
        rows = cur.fetchall()
        
        # Map the results to a dictionary structure
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
        # NOTE: Returning the list of challenges directly, not wrapped in a "challenges" key
        # to simplify frontend consumption, matching the expected array response.
        return jsonify(challenges) 
    except Exception as e:
        return jsonify({"error": f"Database query failed: {str(e)}"}), 500

# ROUTE FIX: Supporting both route styles for challenge details
@app.route('/api/challenges/<int:challenge_id>')
@app.route('/challenges/<int:challenge_id>')
def challenge_details(challenge_id):
    """Retrieves details for a single challenge."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Select all columns for the challenge details view.
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

# ROUTE FIX: Supporting both route styles for starting a challenge
@app.route('/api/start/<int:challenge_id>', methods=['POST'])
@app.route('/start/<int:challenge_id>', methods=['POST'])
def start_challenge(challenge_id):
    """
    Starts the challenge setup script and updates the database status.
    This is the core logic for provisioning the environment.
    """
    conn = None # Initialize conn outside the try block
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # 1. Check if challenge exists and get current status
        cur.execute("SELECT status, title FROM challenges WHERE id=%s;", (challenge_id,))
        row = cur.fetchone()
        
        if not row:
            return jsonify({"error": "Challenge not found"}), 404
            
        current_status = row[0]
        challenge_title = row[1]

        # 2. Prevent re-launching an active environment (Idempotency)
        if current_status == "active":
            return jsonify({
                "message": f"Challenge '{challenge_title}' environment is already active.",
                "status": "active"
            }), 200
            
        # 3. Execute the setup script
        script_path = f"sandbox/challenge_{challenge_id}/setup.sh"
        print(f"Executing script: {script_path}")
        
        result = subprocess.run(
            ["bash", script_path],
            capture_output=True,
            text=True
        )

        # 4. Check exit code and update DB status accordingly
        if result.returncode == 0:
            new_status = "active"
            # Update status in the database
            cur.execute("UPDATE challenges SET status = %s WHERE id = %s;", (new_status, challenge_id))
            conn.commit()
            
            return jsonify({
                "message": f"Environment for Challenge '{challenge_title}' successfully launched.",
                "status": new_status,
                "output": result.stdout
            }), 200
        else:
            # Script failed to execute successfully
            new_status = "setup_failed"
            # Update status to failed so the user knows they need to intervene
            cur.execute("UPDATE challenges SET status = %s WHERE id = %s;", (new_status, challenge_id))
            conn.commit()
            
            # Return detailed error (stdout and stderr) for debugging
            return jsonify({
                "error": "Challenge setup failed.",
                "details": f"Script failed with exit code {result.returncode}",
                "stdout": result.stdout,
                "stderr": result.stderr
            }), 500 # Use 500 for a server-side execution failure

    except Exception as e:
        # Handle exceptions during database ops or other runtime errors
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    finally:
        # Ensure database cursor and connection are closed
        if cur: cur.close()
        if conn: conn.close()

@app.route('/api/validate/<int:challenge_id>', methods=['POST'])
@app.route('/validate/<int:challenge_id>', methods=['POST'])
def validate_challenge(challenge_id):
    """
    Validates the challenge by running its sandbox/validate.sh script.
    """
    conn = None # Initialize conn outside the try block
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
            
            # 1. Update the status to 'completed' in the challenges table
            update_sql = "UPDATE challenges SET status = 'completed' WHERE id = %s;"
            cur.execute(update_sql, (challenge_id,))
            
            # 2. COMMIT the transaction to make the change permanent
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
        # Ensure database cursor and connection are closed
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

    # (Optional) Safety filter: prevent dangerous commands
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
            cwd="/app" # FIXED: Changed from /workspace to /app
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

    # Security check: only allow access inside /workspace
    if not file_path.startswith("/workspace/"):
        return jsonify({"error": "Access outside /workspace not allowed"}), 403

    # Check for file existence
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

    # Security check: only allow edits inside /workspace
    if not file_path.startswith("/workspace/"):
        return jsonify({"error": "Editing outside /workspace is not allowed."}), 403

    try:
        # Ensure the directory exists before trying to write the file
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
    """
    Resets the challenge by re-running setup.sh and marking status as pending.
    Useful for retrying after failed/incorrect attempts.
    """
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Check if challenge exists
        cur.execute("SELECT title FROM challenges WHERE id=%s;", (challenge_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Challenge not found"}), 404

        challenge_title = row[0]
        script_path = f"sandbox/challenge_{challenge_id}/setup.sh"

        if not os.path.exists(script_path):
            return jsonify({"error": f"Setup script not found for challenge {challenge_id}"}), 404

        # Re-run setup.sh
        result = subprocess.run(
            ["bash", script_path],
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            # Reset status in DB
            cur.execute("UPDATE challenges SET status = 'pending' WHERE id = %s;", (challenge_id,))
            conn.commit()

            return jsonify({
                "message": f"Challenge '{challenge_title}' reset successfully. Back to pending.",
                "status": "pending",
                "output": result.stdout
            }), 200
        else:
            return jsonify({
                "error": "Challenge reset failed.",
                "stderr": result.stderr,
                "stdout": result.stdout
            }), 500

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    finally:
        if cur: cur.close()
        if conn: conn.close()


    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


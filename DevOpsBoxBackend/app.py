import os
from flask import Flask, jsonify, request
import psycopg2
import subprocess

app = Flask(__name__)

# Corrected string literal for the fallback DB_URI
DB_URI = os.environ.get('DB_URI', 'postgresql://postgres:postgrespw@postgres-service:5432/devopsbox')

def get_db_connection():
    # Added connection timeout for resilience
    conn = psycopg2.connect(DB_URI, connect_timeout=5)
    return conn

@app.route('/api/health')
def health():
    """Checks the application health and database connection status."""
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({"status": "OK"}), 200
    except Exception as e:
        # Note: If this fails, the DB connection failed (but postgres is up).
        return jsonify({"status": "ERROR", "details": f"DB connection failed: {str(e)}"}), 500

@app.route('/api/challenges')
def get_challenges():
    """Retrieves all challenges from the database."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # FIX: Select all 6 columns to match the initialized 'challenges' table schema.
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
        return jsonify({"challenges": challenges})
    except Exception as e:
        return jsonify({"error": f"Database query failed: {str(e)}"}), 500

@app.route('/api/challenges/<int:challenge_id>')
def challenge_details(challenge_id):
    """Retrieves details for a single challenge."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # FIX: Select 'title' instead of 'name' and include all required columns.
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
def start_challenge(challenge_id):
    """Starts the challenge setup script."""
    try:
        # Run the corresponding sandbox setup script
        result = subprocess.run(
            ["bash", f"sandbox/challenge_{challenge_id}/setup.sh"],
            capture_output=True,
            text=True
        )
        return jsonify({"message": result.stdout})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


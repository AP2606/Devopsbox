from flask import Flask, jsonify, request
import os
import psycopg2
import subprocess

app = Flask(__name__)

DB_URI = os.environ.get('DB_URI', 'postgresql://postgres:password@postgres:5432/devopsbox')

def get_db_connection():
    conn = psycopg2.connect(DB_URI)
    return conn

@app.route('/health')
def health():
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({"status": "OK"}), 200
    except Exception as e:
        return jsonify({"status": "ERROR", "details": str(e)}), 500

@app.route('/challenges')
def get_challenges():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, name, status FROM challenges;")
        rows = cur.fetchall()
        challenges = [{"id": r[0], "name": r[1], "status": r[2]} for r in rows]
        cur.close()
        conn.close()
        return jsonify({"challenges": challenges})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/challenges/<int:challenge_id>')
def challenge_details(challenge_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, name, status FROM challenges WHERE id=%s;", (challenge_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return jsonify({"id": row[0], "name": row[1], "status": row[2]})
        else:
            return jsonify({"error": "Challenge not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/start/<int:challenge_id>', methods=['POST'])
def start_challenge(challenge_id):
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

import os
import psycopg2

DB_URI = os.environ.get('DB_URI', 'postgresql://postgres:postgrespw@postgres-service:5432/devopsbox
')

def init_db():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    # Create challenges table with all relevant fields
    cur.execute("""
        CREATE TABLE IF NOT EXISTS challenges (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL,
            difficulty VARCHAR(20) NOT NULL,
            description TEXT NOT NULL,
            status VARCHAR(50) NOT NULL
        );
    """)
    
    # Check if table is empty
    cur.execute("SELECT COUNT(*) FROM challenges;")
    count = cur.fetchone()[0]
    
    if count == 0:
        # Insert actual final project challenges
        challenges = [
            (
                "Fix Broken CI Pipeline",
                "CI/CD",
                "Medium",
                "The CI pipeline is failing due to misconfigured steps. Identify the issue and fix the pipeline to pass all stages.",
                "pending"
            ),
            (
                "Debug Dockerfile",
                "Docker",
                "Easy",
                "The Dockerfile used to build the application image has errors. Identify and correct the Dockerfile so the image builds successfully.",
                "pending"
            ),
            (
                "Kubernetes Misconfigured Deployment",
                "Kubernetes",
                "Hard",
                "A Kubernetes deployment is not functioning due to misconfiguration. Debug and fix the deployment so the pods start correctly and are accessible.",
                "pending"
            )
        ]
        
        for title, category, difficulty, description, status in challenges:
            cur.execute(
                "INSERT INTO challenges (title, category, difficulty, description, status) VALUES (%s, %s, %s, %s, %s);",
                (title, category, difficulty, description, status)
            )
    
    conn.commit()
    cur.close()
    conn.close()
    print("Database initialized with final project challenges ✅")

if __name__ == '__main__':
    init_db()

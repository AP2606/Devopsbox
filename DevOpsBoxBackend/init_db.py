import os
import psycopg2
import sys
import time

# FIX: Corrected the unterminated string literal on the default DB_URI value.
# The string must be terminated on the same line.
DB_URI = os.environ.get('DB_URI', 'postgresql://postgres:postgrespw@postgres-service:5432/devopsbox')

def init_db():
    print("Attempting database connection for initialization...")
    # Add a simple retry logic in case the Postgres service is momentarily unavailable
    max_retries = 5
    for attempt in range(max_retries):
        try:
            conn = psycopg2.connect(DB_URI)
            cur = conn.cursor()
            print(f"Connection successful on attempt {attempt + 1}.")
            
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
                print("Inserting initial challenge data...")
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
                print("Initial challenges inserted.")
            else:
                print(f"Challenges table already contains {count} entries. Skipping insertion.")
            
            conn.commit()
            cur.close()
            conn.close()
            print("Database initialization complete. ✅")
            return
        except psycopg2.OperationalError as e:
            if attempt < max_retries - 1:
                print(f"Database connection failed (Attempt {attempt + 1}/{max_retries}). Retrying in 5 seconds... Error: {e}")
                time.sleep(5)
            else:
                print("Failed to initialize database after maximum retries.")
                sys.exit(1)
        except Exception as e:
             print(f"An unexpected error occurred during initialization: {e}")
             sys.exit(1)


if __name__ == '__main__':
    init_db()


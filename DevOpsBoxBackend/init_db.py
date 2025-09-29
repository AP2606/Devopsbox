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
                # Insert specific, detailed challenges for the DevOpsBox project
                challenges = [
                    (
                        "Fix Broken CI Pipeline",
                        "CI/CD",
                        "Medium",
                        "**Scenario:** The CI pipeline is failing on the 'build' stage due to an incorrect variable being referenced in the configuration file, preventing the creation of the final Docker image tag. **Goal:** Identify the faulty variable reference in the CI configuration and correct the path so the build completes successfully.",
                        "pending"
                    ),
                    (
                        "Optimize Inefficient Dockerfile",
                        "Docker",
                        "Easy",
                        "**Scenario:** The current application image is over 1GB, increasing deployment time and storage costs. This is often due to installing unnecessary dependencies in the final image layer. **Goal:** Refactor the existing Dockerfile using multi-stage builds and best practices (like placing 'RUN' commands efficiently) to reduce the final image size below 100MB.",
                        "pending"
                    ),
                    (
                        "Resolve CrashLoopBackOff",
                        "Kubernetes",
                        "Hard",
                        "**Scenario:** A critical Kubernetes service deployment is stuck in a `CrashLoopBackOff` state. Initial checks show the image is correct, but the pod never stays up. **Goal:** Debug the failing pod using `kubectl logs` and `kubectl describe`. The root cause is an incorrect command defined in the deployment YAML's container `args`. Correct the YAML and reapply the deployment to bring the service online.",
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

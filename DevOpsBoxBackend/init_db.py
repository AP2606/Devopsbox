import os
import psycopg2

DB_URI = os.environ.get('DB_URI', 'postgresql://postgres:password@postgres:5432/devopsbox')

def init_db():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    # Create challenges table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS challenges (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            status VARCHAR(20)
        );
    """)
    
    # Insert default challenges if empty
    cur.execute("SELECT COUNT(*) FROM challenges;")
    count = cur.fetchone()[0]
    if count == 0:
        challenges = [
            ("Challenge 1", "pending"),
            ("Challenge 2", "pending"),
            ("Challenge 3", "pending")
        ]
        for name, status in challenges:
            cur.execute("INSERT INTO challenges (name, status) VALUES (%s, %s);", (name, status))
    
    conn.commit()
    cur.close()
    conn.close()
    print("Database initialized with challenges ✅")

if __name__ == '__main__':
    init_db()

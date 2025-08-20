from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Dummy challenge data for midsem demo
CHALLENGES = [
    {"id": 1, "title": "Fix Broken CI Pipeline", "category": "CI/CD", "difficulty": "Medium", "status": "pending"},
    {"id": 2, "title": "Debug Dockerfile", "category": "Docker", "difficulty": "Easy", "status": "pending"},
    {"id": 3, "title": "Kubernetes Misconfigured Deployment", "category": "Kubernetes", "difficulty": "Hard", "status": "pending"}
]

@app.get("/")
def root():
    return jsonify({"service": "DevOpsBox Backend", "status": "ok"})

@app.get("/api/health")
def health():
    return jsonify({"status": "healthy"})

@app.get("/api/challenges")
def challenges():
    return jsonify(CHALLENGES)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
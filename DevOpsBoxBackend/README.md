# DevOpsBox Backend (Midsem)
Simple Flask API that serves dummy challenges for the DevOpsBox frontend.

## Run locally
```bash
pip install -r requirements.txt
python app.py
# Open http://localhost:5000/api/challenges
```

## Docker
```bash
docker build -t <dockerhub-user>/devopsbox-backend:midsem .
docker run -p 5000:5000 <dockerhub-user>/devopsbox-backend:midsem
```
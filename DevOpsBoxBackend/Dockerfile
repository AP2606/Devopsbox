FROM python:3.11-slim

WORKDIR /app
COPY app/ /app/

RUN pip install --no-cache-dir -r requirements.txt

ENV DB_URI=${DB_URI}

EXPOSE 5000
CMD ["python", "app.py"]

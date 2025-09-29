FROM python:3.11-slim
ARG DB_URI
WORKDIR /app
COPY . /app/

RUN pip install --no-cache-dir -r requirements.txt

ENV DB_URI=${DB_URI}

EXPOSE 5000
CMD ["python", "app.py"]

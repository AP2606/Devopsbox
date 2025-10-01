FROM python:3.11-slim
# Install system dependencies (curl, nano, vim, kubectl)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        nano \
        vim \
        kubectl \
    && rm -rf /var/lib/apt/lists/*
    
ARG DB_URI
WORKDIR /app
COPY profile /etc/profile.d/devopsbox_profile.sh
COPY . /app/

RUN pip install --no-cache-dir -r requirements.txt

ENV DB_URI=${DB_URI}

EXPOSE 5000
CMD ["python", "app.py"]

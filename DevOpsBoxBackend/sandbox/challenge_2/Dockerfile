FROM ubuntu:20.04

This setup is inefficient because it uses multiple layers unnecessarily
and doesn't leverage multi-stage builds, leading to a large final image size.
Install dependencies and tools
RUN apt-get update
RUN apt-get install -y python3 python3-pip gcc make git curl

Clean up apt lists (This step is slightly optimized but still causes a large initial layer)
RUN rm -rf /var/lib/apt/lists/*

Copy application files
COPY requirements.txt /app/
COPY app.py /app/
WORKDIR /app

Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

CMD ["python3", "app.py"]

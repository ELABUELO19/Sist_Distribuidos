FROM python:3.9-slim

WORKDIR /app

COPY . /app
COPY cache_pb2.py /app/
COPY cache_pb2_grpc.py /app/

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 50051

CMD ["python", "grpc_server.py"]

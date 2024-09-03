import grpc
from concurrent import futures
import redis
import time

# Aquí iría la implementación de tu servidor gRPC

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    # Aquí debes agregar los servicios gRPC
    server.add_insecure_port('[::]:50051')
    server.start()
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()


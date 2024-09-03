#Dockerfile 

FROM python:3.9-slim

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo de requerimientos y la aplicación
COPY requirements.txt requirements.txt
COPY server.py server.py

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Exponer el puerto gRPC
EXPOSE 50051

# Comando para correr el servidor gRPC
CMD ["python", "server.py"]


# Usar una imagen base de Python
FROM python:3.9-slim

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo de requerimientos y la aplicación
COPY requirements.txt requirements.txt
COPY generator.py generator.py

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Comando para correr el generador
CMD ["python", "generator.py"]


# Usa una imagen oficial de Node.js como base
FROM node:18-slim

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install --no-cache

# Copia el resto de los archivos de la aplicación
COPY . .

# Expone el puerto en el que corre la aplicación
EXPOSE 5000

# Comando para iniciar la API
CMD ["npm", "start"]

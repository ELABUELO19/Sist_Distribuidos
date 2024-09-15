# Utiliza una imagen base oficial de Node.js
FROM node:18

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar el package.json y package-lock.json (si existe) para instalar dependencias primero
COPY package*.json ./

# Instalar las dependencias (incluir @grpc/grpc-js, @grpc/proto-loader, redis, etc.)
RUN npm install

# Copiar el resto de la aplicación (código fuente) al directorio de trabajo
COPY . .

# Exponer el puerto que utilizará la aplicación (el puerto de tu API, por ejemplo 5000)
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD [ "node", "app.js" ]

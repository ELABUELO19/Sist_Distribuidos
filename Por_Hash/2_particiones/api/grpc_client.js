const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Cargar el archivo .proto
const PROTO_PATH = path.join(__dirname, 'cache.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const cacheProto = grpc.loadPackageDefinition(packageDefinition).cache;

// Función para obtener la resolución DNS
function getDnsResolution(domain) {
    return new Promise((resolve, reject) => {
        // Crear el canal y el stub del cliente
        const client = new cacheProto.DNSResolver('grpc_server:50051', grpc.credentials.createInsecure());

        // Llamada a la función gRPC con el dominio
        client.Resolve({ domain }, (error, response) => {
            if (error) {
                return reject(error);
            }
            resolve(response.ip);
        });
    });
}

module.exports = { getDnsResolution };


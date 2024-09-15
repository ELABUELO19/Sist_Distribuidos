const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Cargar el archivo .proto
const packageDefinition = protoLoader.loadSync('path_to_dns.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

// Crear la definición del paquete gRPC
const dnsProto = grpc.loadPackageDefinition(packageDefinition).dnsPackage;

// Crear el cliente gRPC
const client = new dnsProto.DNSService('localhost:50051', grpc.credentials.createInsecure());

function getDNSResolution(domain) {
    return new Promise((resolve, reject) => {
        const request = { domain };

        // Llamar al método GetDNSResolution del servidor gRPC
        client.GetDNSResolution(request, (error, response) => {
            if (error) {
                return reject(error);
            }
            resolve(response.ip);
        });
    });
}

// Ejemplo de uso del cliente gRPC
getDNSResolution('example.com')
    .then(ip => console.log(`IP de example.com: ${ip}`))
    .catch(err => console.error(err));

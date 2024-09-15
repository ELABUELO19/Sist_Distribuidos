const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const redis = require('redis');
const crypto = require('crypto');

// Cargar el archivo .proto
const packageDefinition = protoLoader.loadSync('path_to_proto/dns.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const dnsProto = grpc.loadPackageDefinition(packageDefinition).DNSResolver;

// Configurar conexión a Redis
const redisClients = [
    redis.createClient({ host: 'redis1', port: 6379 })
];

// Función para obtener instancia de Redis basada en el dominio
function getRedisInstance(domain) {
    const hash = crypto.createHash('md5').update(domain).digest('hex');
    const hashValue = parseInt(hash, 16);
    return redisClients[hashValue % redisClients.length];
}

// Implementación del servicio gRPC DNSResolver
function resolveDomain(call, callback) {
    const domain = call.request.domain;
    const redisInstance = getRedisInstance(domain);

    // Verificar si el dominio está en cache Redis
    redisInstance.hget('dns_cache', domain, (err, cachedIp) => {
        if (cachedIp) {
            return callback(null, { ip: cachedIp.toString(), source: 'cache' });
        }

        // Simular la resolución DNS (aquí se puede integrar una lógica real de DNS)
        const resolvedIp = "8.8.8.8";  // Simulación de la IP

        // Almacenar en la caché de Redis
        redisInstance.hset('dns_cache', domain, resolvedIp);
        callback(null, { ip: resolvedIp, source: 'grpc' });
    });
}

// Función para iniciar el servidor gRPC
function startServer() {
    const server = new grpc.Server();
    server.addService(dnsProto.service, { Resolve: resolveDomain });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        console.log('Servidor gRPC escuchando en el puerto 50051');
        server.start();
    });
}

startServer();

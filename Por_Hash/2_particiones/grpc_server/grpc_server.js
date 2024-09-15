const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const Redis = require('ioredis');
const crypto = require('crypto');

// Cargar el archivo .proto
const PROTO_PATH = './cache.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const cacheProto = grpc.loadPackageDefinition(packageDefinition).cache;

// Conexión a Redis
const redisClients = [
  new Redis({ host: 'redis1', port: 6379 }),
  new Redis({ host: 'redis2', port: 6379 })
];

// Seleccionar la instancia de Redis según el hash del dominio
function getRedisInstance(domain) {
  const hash = crypto.createHash('md5').update(domain).digest('hex');
  const hashValue = parseInt(hash, 16);
  return redisClients[hashValue % redisClients.length];
}

// Implementación del servicio DNSResolver
function resolve(call, callback) {
  const domain = call.request.domain;
  const redisInstance = getRedisInstance(domain);

  redisInstance.hget('dns_cache', domain, (err, cachedIp) => {
    if (err) {
      callback(err);
      return;
    }

    if (cachedIp) {
      callback(null, { ip: cachedIp, source: 'cache' });
    } else {
      // Simulación de resolución DNS
      const resolvedIp = '8.8.8.8'; // IP simulada

      redisInstance.hset('dns_cache', domain, resolvedIp, (err) => {
        if (err) {
          callback(err);
          return;
        }

        callback(null, { ip: resolvedIp, source: 'grpc' });
      });
    }
  });
}

// Crear y ejecutar el servidor gRPC
function main() {
  const server = new grpc.Server();
  server.addService(cacheProto.DNSResolver.service, { resolve });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Servidor gRPC ejecutándose en el puerto 50051');
    server.start();
  });
}

main();


const express = require('express');
const redis = require('redis');
const crypto = require('crypto');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const app = express();
app.use(express.json());

// Crear clientes Redis
const redisClients = [
    redis.createClient({ host: 'redis1', port: 6379 }),
    redis.createClient({ host: 'redis2', port: 6380 }),
];

// Seleccionar una instancia de Redis en función del hash del dominio
function getRedisInstance(domain) {
    const hash = crypto.createHash('md5').update(domain).digest('hex');
    const hashValue = parseInt(hash, 16);
    return redisClients[hashValue % redisClients.length];
}

// Cargar el archivo de definición proto para gRPC
const packageDefinition = protoLoader.loadSync('path_to_dns_proto_file.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const dnsProto = grpc.loadPackageDefinition(packageDefinition).dnsPackage;
const client = new dnsProto.DNSService('localhost:50051', grpc.credentials.createInsecure());

app.post('/resolve', (req, res) => {
    const domain = req.body.domain;

    if (!domain) {
        return res.status(400).json({ error: 'No domain provided' });
    }

    const redisInstance = getRedisInstance(domain);

    // Verificar si el dominio está en la caché
    redisInstance.hget('dns_cache', domain, (err, cachedIp) => {
        if (cachedIp) {
            return res.json({ domain, ip: cachedIp, source: 'cache' });
        }

        // Si no está en caché, consultar al servidor gRPC
        client.getDNSResolution({ domain }, (err, response) => {
            if (err) {
                return res.status(500).json({ error: 'gRPC error' });
            }

            const resolvedIp = response.ip;
            redisInstance.hset('dns_cache', domain, resolvedIp);

            return res.json({ domain, ip: resolvedIp, source: 'grpc' });
        });
    });
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});

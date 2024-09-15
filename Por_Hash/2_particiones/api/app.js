const express = require('express');
const redis = require('redis');
const crypto = require('crypto');
const grpcClient = require('./grpc_client');  // El archivo del cliente gRPC

const app = express();
app.use(express.json());

// Conexión a Redis
const redisClients = [
    redis.createClient({ host: 'redis1', port: 6379 }),
    redis.createClient({ host: 'redis2', port: 6380 })
];

// Función para obtener una instancia de Redis según el hash del dominio
function getRedisInstance(domain) {
    const hash = crypto.createHash('md5').update(domain).digest('hex');
    const hashValue = parseInt(hash, 16);
    return redisClients[hashValue % redisClients.length];
}

app.post('/resolve', async (req, res) => {
    const { domain } = req.body;

    if (!domain) {
        return res.status(400).json({ error: 'No domain provided' });
    }

    const redisInstance = getRedisInstance(domain);

    // Verificar si el dominio está en la caché
    redisInstance.hget('dns_cache', domain, async (err, cachedIp) => {
        if (cachedIp) {
            return res.status(200).json({ domain, ip: cachedIp, source: 'cache' });
        }

        // Si no está en la caché, llamar a gRPC
        const resolvedIp = await grpcClient.getDnsResolution(domain);

        // Guardar el resultado en Redis
        redisInstance.hset('dns_cache', domain, resolvedIp);

        res.status(200).json({ domain, ip: resolvedIp, source: 'grpc' });
    });
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});


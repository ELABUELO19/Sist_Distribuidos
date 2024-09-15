const dns = require('dns');
const redis = require('redis');

// Asumimos que el cliente Redis ya está creado y conectado
const cache = redis.createClient({
    host: 'localhost',
    port: 6379
});

async function resolveDomain(domain) {
    try {
        // Primero revisamos si el dominio ya está en el caché
        const cachedIp = await cache.get(domain);

        if (cachedIp) {
            console.log(`Cache HIT para ${domain}: ${cachedIp}`);
            return cachedIp;
        } else {
            console.log(`Cache MISS para ${domain}. Realizando consulta DNS...`);
            return new Promise((resolve, reject) => {
                dns.resolve4(domain, (err, addresses) => {
                    if (err) {
                        if (err.code === 'ENOTFOUND') {
                            console.log(`Dominio ${domain} no encontrado.`);
                            resolve(null);
                        } else {
                            console.error(`Error resolviendo ${domain}: ${err}`);
                            resolve(null);
                        }
                    } else {
                        const ip = addresses[0];
                        // Almacenar el resultado en Redis (con TTL de 1 hora)
                        cache.set(domain, ip, {
                            EX: 3600
                        });
                        resolve(ip);
                    }
                });
            });
        }
    } catch (error) {
        console.error(`Error en resolveDomain: ${error}`);
        return null;
    }
}

module.exports = { resolveDomain };

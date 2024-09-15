const redis = require('redis');
const dns = require('dns');
const fs = require('fs');
const csv = require('csv-parser');

// Crear cliente Redis
const cache = redis.createClient({
    host: 'localhost',
    port: 6379
});

// Conectar a Redis
cache.connect().then(() => {
    console.log('Conectado a Redis');
}).catch((err) => {
    console.error('Error conectando a Redis:', err);
});

// Función para resolver dominio
async function resolveDomain(domain) {
    try {
        // Revisar si el dominio está en caché
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
                        // Guardar el resultado en el caché con expiración de 1 hora
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

// Cargar y procesar el dataset
const results = [];
fs.createReadStream('C:\\Users\\Nicolas\\Documents\\Sistema_distribuido\\Tarea1\\Data\\domains.csv')
    .pipe(csv(['domain']))
    .on('data', (data) => results.push(data))
    .on('end', async () => {
        console.log(results.slice(0, 5)); // Mostrar los primeros 5 registros

        // Limitar el dataset a 1000 dominios para las pruebas
        const limitedDataset = results.slice(0, 1000);

        for (const row of limitedDataset) {
            await resolveDomain(row.domain);
        }

        // Cerrar la conexión a Redis cuando terminemos
        await cache.quit();
    });


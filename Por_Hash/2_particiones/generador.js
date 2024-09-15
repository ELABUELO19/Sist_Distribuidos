const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');
const { performance } = require('perf_hooks');

// Ruta al archivo CSV que contiene los dominios
const csvFilePath = path.join('/home/mati/Tarea1-Distribuidos-main/DataSet/Dataset.csv');

// URL de la API (modifícala si es necesario)
const apiUrl = 'http://localhost:5000/resolve';

// Iniciar la medición del tiempo
const startTime = performance.now();

// Leer el archivo CSV y realizar las consultas
fs.createReadStream(csvFilePath)
  .pipe(csv({ headers: false, maxRows: 10000 }))
  .on('data', async (row) => {
    const domain = row[0];  // La primera (y única) columna contiene los dominios
    const payload = { domain };

    try {
      const response = await axios.post(apiUrl, payload);
      if (response.status === 200) {
        const data = response.data;
        console.log(`Dominio: ${data.domain}, IP: ${data.ip}, Origen: ${data.source}`);
      } else {
        console.log(`Error al consultar el dominio ${domain}: ${response.status}`);
      }
    } catch (error) {
      console.log(`Error al procesar el dominio ${domain}: ${error.message}`);
    }
  })
  .on('end', () => {
    // Finalizar la medición del tiempo
    const endTime = performance.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`Tiempo total para realizar todas las consultas: ${totalTime} segundos`);
  });


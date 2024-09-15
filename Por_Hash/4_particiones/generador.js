const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Ruta al archivo CSV que contiene los dominios
const csvFilePath = path.join('/home/mati/Tarea1-Distribuidos-main/DataSet/Dataset.csv');

// URL de la API (modifícala si es necesario)
const url = 'http://localhost:5000/resolve';

// Función para medir el tiempo de las consultas
const startTime = Date.now();

// Leer el archivo CSV y procesar cada dominio
const processCSV = () => {
  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv({ headers: false, maxRows: 10000 }))  // Limitar a 10,000 filas
    .on('data', (row) => {
      results.push(row[0]);  // Obtener el dominio de la primera (y única) columna
    })
    .on('end', () => {
      // Realizar las consultas a la API
      makeRequests(results);
    });
};

// Función para realizar las consultas a la API
const makeRequests = async (domains) => {
  for (const domain of domains) {
    const payload = { domain };

    try {
      const response = await axios.post(url, payload);

      if (response.status === 200) {
        const data = response.data;
        console.log(`Dominio: ${data.domain}, IP: ${data.ip}, Origen: ${data.source}`);
      } else {
        console.log(`Error al consultar el dominio ${domain}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error al procesar el dominio ${domain}: ${error.message}`);
    }
  }

  // Medir el tiempo final
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;  // Convertir a segundos

  console.log(`Tiempo total para realizar todas las consultas: ${totalTime.toFixed(2)} segundos`);
};

// Iniciar el proceso leyendo el archivo CSV
processCSV();

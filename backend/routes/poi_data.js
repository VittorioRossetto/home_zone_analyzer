const router = require('express').Router();
const pool = require("../db");
const fs = require('fs').promises;


// Function to check if the table exists
async function checkTableExists(client) {
    const result = await client.query(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'poi_data'
        );
    `);
    return result.rows[0].exists; // true if the table exists, false otherwise
  }
  
// Call the POST method on the /api/poi_data endpoint to insert the GeoJSON data into the database
router.post('/api/poi_data', async (req, res) => {
    const geojson_data = req.body; // Assuming the GeoJSON data is sent in the request body
  
    try {
        const geojson_data = JSON.parse(await fs.readFile('geojson/PoI_complete.geojson', 'utf8'));
        // Connect to the database
        const client = await pool.connect();
        const tableExists = await checkTableExists(client);
        
        // Check if the table exists
        if (!tableExists) {
            // Create the table if it doesn't exist
            await client.query(`
                CREATE TABLE poi_data (
                    nome_area VARCHAR(255),
                    tipologia_punto_di_interesse VARCHAR(255),
                    nome_punto_di_interesse VARCHAR(255),
                    five_min BOOLEAN,
                    ten_min BOOLEAN,
                    fifteen_min BOOLEAN,
                    latitude FLOAT,
                    longitude FLOAT
                )
            `);
    
            // Insert data into the database from the GeoJSON file using a loop
            for (const feature of geojson_data['features']) {
                const properties = feature['properties']; // Extract the properties object
                const coordinates = feature['geometry']['coordinates']; // Extract the coordinates array
                // Insert the data into the database
                await client.query(`
                    INSERT INTO poi_data (nome_area, tipologia_punto_di_interesse, nome_punto_di_interesse, five_min, ten_min, fifteen_min, latitude, longitude)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                    properties['nome_area'],
                    properties['tipologia_punto_di_interesse'],
                    properties['nome_punto_di_interesse'],
                    properties['5_min'] === 'Sì',
                    properties['10_min'] === 'Sì',
                    properties['15_min'] === 'Sì',
                    coordinates[1], // Latitude
                    coordinates[0]  // Longitude
                ]);
            }
        
            res.send('GeoJSON data stored successfully'); // Send a success message
        } else {
            res.send('Table already exists, no data inserted.'); // Send a message if the table already exists
        }
    } catch (error) {
      console.error('Failed to process request:', error);
      res.status(500).send('Error processing request');
    }
});

// Call the GET method on the /api/poi_data endpoint to retrieve all the points of interest
router.get("/api/poi_data", async (req, res) => {
    try {
        const poi = await pool.query("SELECT * FROM poi_data"); // Query the database to retrieve all the points of interest
        // Convert the data to GeoJSON format with the required properties and coordinates
        const geoJsonData = {
            type: "FeatureCollection",
            features: poi.rows.map(row => ({
                type: "Feature",
                properties: {
                    nome_punto_di_interesse: row.nome_punto_di_interesse,
                    tipologia_punto_di_interesse: row.tipologia_punto_di_interesse,
                    nome_area: row.nome_area,
                    '5_min': row.five_min,
                    '10_min': row.ten_min,
                    '15_min': row.fifteen_min,
                },
                geometry: {
                    type: "Point",
                    coordinates: [row.longitude, row.latitude]
                }
            }))
        };
        res.json(geoJsonData); // Return the points of interest as a GeoJSON object
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;
const router = require('express').Router();
const pool = require("../db");

// Call the GET method on the /api/lista_immobili endpoint to retrieve all the immobili
router.get("/api/lista_immobili", async (req, res) => {
    try {
        // Query the database to retrieve all the immobili
        const lista_immobili = await pool.query("SELECT * FROM lista_immobili_candidati");
        res.json(lista_immobili.rows); // Return the immobili as a JSON object
    } catch (err) {
        console.error(err.message);
    }
});

// Call the POST method on the /api/lista_immobili endpoint to insert a new immobile
router.post("/api/lista_immobili", async (req, res) => {
    try {
        // Extract the immobile object from the request body
        const immobile = Object.values(req.body);
        const columns = Object.keys(req.body);
        // Quote column names to handle special characters and reserved words
        const quotedColumns = columns.map(column => `"${column}"`).join(", ");
        // Create placeholders for the values to be inserted
        const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
        
        // Correctly creating the CREATE TABLE query with quoted column names
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS lista_immobili_candidati (
                id SERIAL PRIMARY KEY,
                ${columns.map(column => `"${column}" TEXT`).join(", ")}
            )
        `;

        // Execute the CREATE TABLE query
        await pool.query(createTableQuery);

        // Correctly creating the INSERT INTO query with quoted column names and placeholders
        const query = `INSERT INTO lista_immobili_candidati (${quotedColumns}) VALUES (${placeholders}) RETURNING *`;

        const newImmobile = await pool.query(query, immobile); // Execute the INSERT INTO query
        console.log(newImmobile.rows[0]); // Log the new immobile to the console

        res.json(newImmobile.rows[0]); // Return the new immobile as a JSON object
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;
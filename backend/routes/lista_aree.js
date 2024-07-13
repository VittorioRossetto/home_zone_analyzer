const router = require('express').Router();
const pool = require("../db");

// Call the GET method on the /api/lista_aree endpoint to retrieve all the areas
router.get("/api/lista_aree", async (req, res) => {
    try {
        // Query the database to retrieve all the areas
        const lista_aree = await pool.query("SELECT * FROM lista_aree_candidate");
        res.json(lista_aree.rows); // Return the areas as a JSON object
    } catch (err) {
        console.error(err.message);
    }
});

// Call the POST method on the /api/lista_aree endpoint to insert a new area
router.post("/api/lista_aree", async (req, res) => {
    try {
        // Extract the area object from the request body
        const area = Object.values(req.body);
        const columns = Object.keys(req.body);
        // Quote column names to handle special characters and reserved words
        const quotedColumns = columns.map(column => `"${column}"`).join(", ");
        const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
        
        // Creating the CREATE TABLE query with column names quoted and separated by commas
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS lista_aree_candidate (
                id SERIAL PRIMARY KEY,
                ${columns.map(column => `"${column}" TEXT`).join(", ")}
            )
        `;

        await pool.query(createTableQuery); // Execute the CREATE TABLE query
        
        // Creating the INSERT INTO query with quoted column names and placeholders
        const query = `INSERT INTO lista_aree_candidate (${quotedColumns}) VALUES (${placeholders}) RETURNING *`;
        // Execute the INSERT INTO query
        const newArea = await pool.query(query, area);
        console.log(newArea.rows[0]); // Log the new area to the console

        res.json(newArea.rows[0]); // Return the new area as a JSON object
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;
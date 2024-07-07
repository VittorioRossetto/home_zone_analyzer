const router = require('express').Router();
const pool = require("../db");

router.get("/api/lista_aree", async (req, res) => {
    try {
        const lista_aree = await pool.query("SELECT * FROM lista_aree_candidate");
        res.json(lista_aree.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.post("/api/lista_aree", async (req, res) => {
    try {
        const area = Object.values(req.body);
        const columns = Object.keys(req.body);
        // Quote column names to handle special characters and reserved words
        const quotedColumns = columns.map(column => `"${column}"`).join(", ");
        const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
        
        // Correctly creating the CREATE TABLE query with quoted column names
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS lista_aree_candidate (
                id SERIAL PRIMARY KEY,
                ${columns.map(column => `"${column}" TEXT`).join(", ")}
            )
        `;

        await pool.query(createTableQuery);

        const query = `INSERT INTO lista_aree_candidate (${quotedColumns}) VALUES (${placeholders}) RETURNING *`;

        const newArea = await pool.query(query, area);
        console.log(newArea.rows[0]);

        res.json(newArea.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;
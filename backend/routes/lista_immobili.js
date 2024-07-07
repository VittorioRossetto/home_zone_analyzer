const router = require('express').Router();
const pool = require("../db");

router.get("/api/lista_immobili", async (req, res) => {
    try {
        const lista_immobili = await pool.query("SELECT * FROM lista_immobili_candidati");
        res.json(lista_immobili.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.post("/api/lista_immobili", async (req, res) => {
    try {
        const immobile = Object.values(req.body);
        const columns = Object.keys(req.body);
        // Quote column names to handle special characters and reserved words
        const quotedColumns = columns.map(column => `"${column}"`).join(", ");
        const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
        
        // Correctly creating the CREATE TABLE query with quoted column names
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS lista_immobili_candidati (
                id SERIAL PRIMARY KEY,
                ${columns.map(column => `"${column}" TEXT`).join(", ")}
            )
        `;

        await pool.query(createTableQuery);

        const query = `INSERT INTO lista_immobili_candidati (${quotedColumns}) VALUES (${placeholders}) RETURNING *`;

        const newImmobile = await pool.query(query, immobile);
        console.log(newImmobile.rows[0]);

        res.json(newImmobile.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;
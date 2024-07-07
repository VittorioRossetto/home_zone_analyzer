const router = require('express').Router();
const pool = require("../db");

router.get("/api/survey", async (req, res) => {
    try {
        res.json("Hello World");
    } catch (err) {
        console.error(err.message);
    }
});

router.post("/api/survey", async (req, res) => {
    try {
        const preferences = Object.values(req.body);
        const columns = Object.keys(req.body);
        // Quote column names to handle special characters and reserved words
        const quotedColumns = columns.map(column => `"${column}"`).join(", ");
        const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
        
        // Correctly creating the CREATE TABLE query with quoted column names
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS preferences (
                id SERIAL PRIMARY KEY,
                ${columns.map(column => `"${column}" TEXT`).join(", ")}
            )
        `;

        await pool.query(createTableQuery);

        const query = `INSERT INTO preferences (${quotedColumns}) VALUES (${placeholders}) RETURNING *`;

        const newPreference = await pool.query(query, preferences);
        console.log(newPreference.rows[0]);

        res.json(newPreference.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;
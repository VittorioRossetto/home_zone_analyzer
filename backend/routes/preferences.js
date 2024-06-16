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
        res.json(preferences);
        const newPreference = await pool.query(
            "INSERT INTO preferences (palestra, chiesa, scuola, uni, ospedale, parco, cinema, bus, parcheggio, treno) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
            preferences
        );

        res.json(newPreference.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;
const router = require('express').Router();
const pool = require("../db");

router.get("/api/hello", async (req, res) => {
    try {
        res.json("Hello World");
    } catch (err) {
        console.error(err.message);
    }
});

router.post("/api/hello", async (req, res) => {
    try {
        res.json("Hello World");
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;
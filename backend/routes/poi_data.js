const router = require('express').Router();
const pool = require("../db");

router.get("/api/poi_data", async (req, res) => {
    try {
        const poi = await pool.query("SELECT * FROM poi_data");
        // Convert the data to GeoJSON
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
        res.json(geoJsonData);
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;
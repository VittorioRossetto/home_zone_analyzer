const express = require('express');
const cors = require('cors');
const app = express();
const pool = require("./db");

//middleware
app.use(express.json());
app.use(cors());

//ROUTES
app.use("/data", require("./routes/hello"));
app.use("/data", require("./routes/preferences"));


app.listen(9000, () => 
    {
        console.log("server started on http://localhost:9000/");
    }
);
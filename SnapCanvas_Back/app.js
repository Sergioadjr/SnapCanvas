require("dotenv").config();

const express = require("express")
const path = require("path")
const cors = require("cors")

const port = process.env.PORT;

const app = express()

// Config JSON e form data response
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// CORS 
app.use(cors({credentials:true, origin: "http://localhost:3000"}));


// Diretório upload
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// DB
require("./config/db.js")

// Rotas
const router = require("./routes/Router.js")

app.use(router);

app.listen(port, () => {
    console.log(`Aplicativo rodando na porta ${port}`);
});


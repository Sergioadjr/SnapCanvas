const mongoose = require("mongoose");
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

// conexão - 1FVoG1EapDNfPU19
const conn = async () => {
    try {
        const dbConn = await mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.jo8kniv.mongodb.net/?retryWrites=true&w=majority`);
        console.log("Conectado ao banco");

        return dbConn;
    } catch (error) {
        console.log(error);
    }
}

conn()

module.exports=conn;
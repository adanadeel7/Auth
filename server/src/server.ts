import app from "./app.js";
import dotenv from 'dotenv'
import ConnectToDB from "./config/db.js";
import http from 'http'
dotenv.config()

async function startServer() {
    await ConnectToDB()
    const server = http.createServer(app)

    server.listen(process.env.PORT, ()=> { 
        console.log(`server is running at ${process.env.PORT}`)
    })
}

startServer().catch(err => { 
    console.error('Error while starting the server', err)
    process.exit(1)
})
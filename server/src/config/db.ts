import mongoose from "mongoose";


 async function ConnectToDB() {
    try { 
        const mongouri = process.env.MONGO_URI
        if (!mongouri ) { 
            throw Error("Mongo URI Not defined")
        }

        console.log('MongoDB connection successful')

        await mongoose.connect(mongouri)
    } catch(err) { 
        console.error('Mongodb Connection error!')
        process.exit(1)
    }
}


export default ConnectToDB; 
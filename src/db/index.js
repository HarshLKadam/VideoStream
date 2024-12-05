import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n mongodb connected !! DB HOST: ${connectionInstance.connection.host}`)

 // have to learn about connection instance functnaliities

    } catch (error) {
        console.log(`MongoDB connection Failed / ConenctDB Error:`, error)
        process.exit(1)
// have to learn about process.exit method and how the throw works
    }
}

export default connectDB
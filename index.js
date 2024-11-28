import express from "express"
import dotenv from 'dotenv'
import connectDB from "./db/index.js";

const app=express();

dotenv.config({
    path:'/.env'
})

connectDB()

// import mongoose from "mongoose"
// import {DB_NAME} from "./constants.js";
// (async()=>{
//     try{
//        await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

//        app.on("error",(error)=>{
//         console.log("Error:", error);
//             throw error
//        })
//        app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on port${process.env.PORT}`)
//        })
//     }
   
//     catch(error){
//         console.log('Error :',error)
//     }
// }
// ) 
// ()



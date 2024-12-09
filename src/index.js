import express from "express"
import connectDB from "../db/index.js";

import dotenv from 'dotenv'
dotenv.config({
    path:'/.env'
})

const app=express();

connectDB()
.then(()=>{
    app.listen(process.env.PORT ||8000,()=>{
        console.log(`server is runnig on PORT ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log(`MongoDB Connection Error !! ${error}`)
})










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



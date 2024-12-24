import mongoose, { model } from "mongoose";
import { Schema } from "mongoose";
import { type } from "os";

const SubscriptionSchema=new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, //one who is subscribing 
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,//to whom subscriber is subscribing 
        ref:"User"
    },

},{
    timestamps:true
})

export const Subscription=model("Subscription",SubscriptionSchema)

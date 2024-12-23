import  {apiError}  from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js"

//res is refered as _ 
export const verifyJWT=asyncHandler(async(req,_,next)=>{
   try {
     // i have this in req.header in postman 
    const token= req.cookies?.accessToken  || req.header("Authorization")?.replace("Bearer ","")
    
    if(!token){
     throw new apiError(401, "unauthorized request")
    }
 
    const decodedToken= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
    const user= await User.findById(decodedToken?._id).select(
         '-password -refreshToken'
     )
     
     if(!user){
         throw new apiError(401,"Invalid Access Token")
     }
 
     req.user=user
     next()
   } catch (error) {
        throw new apiError(401,error?.message || "Invalid access Token")
   }

})

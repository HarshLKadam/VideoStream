const asyncHandler=(requestHandler)=>{
     (req,res,next)=>{
        promise.resolve(requestHandler(req,res,next))
        .catch((error)=> next(err))
     }
}


export {asyncHandler}

// const asyncHandler=(func)=> { async()=>{ } }

// const asyncHandler=(func)=>async(req,res,next)=>{
//     try{
//         await func(req,res,next)
//     } catch(error){
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }

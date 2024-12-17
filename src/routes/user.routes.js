import {Router} from 'express'
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

//creating the instance of router
const router=Router()

// on register post method will work
router.route("/register").post(
    //use a multer method to upload the files
   upload.fields([
    {
        name:'avatar',
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
   ]),
   //the name of controller which handle that route
    registerUser
)

export default router;
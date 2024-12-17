import multer from 'multer';

//primary use of multer is to upload the data 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname )
    }
  })
  
 export const upload = multer({
     storage,
    })

const path = require ('path');
const multer = require ('multer');
//photo storage
const photoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,path.join(__dirname,"../images"));
    },
    filename: function (req, file, cb) {
        if(file){
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
        else{
            cb(null,false);
        }
        
    }
});

//photo upload middleware
const photoUpload = multer({
    storage: photoStorage,
    fileFilter: function (req, file, cb) { // Update parameter name to 'file'
      if (file.mimetype.startsWith('image')) { 
        cb(null, true);
      } else {
        cb({ message: 'unsupported file format' }, false);
      }
    },
    limits: {
      fileSize: 1024 * 1024,
    },
  });
  
module.exports = photoUpload;
const cloudinary = require ("cloudinary");
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryUploadImage = async (fileToUpload) => {
    try {
        const data = await cloudinary.uploader.upload(fileToUpload,{
            resource_type:'auto',
            
        });
        return(data);
    } catch (error) {
        console.log(error);
        throw new Error("Internal Server Error (cloudinary)"); 
    }
};

//cloudinary remove image
const cloudinaryRemoveImage = async (imagePublicId) => {
    try {
        const result = await cloudinary.uploader.destroy(imagePublicId);
        return(result);
    } catch (error) {
        console.log(error);
        throw new Error("Internal Server Error (cloudinary)"); 
    }
};

//cloudinary remove multiple  image
const cloudinaryRemoveMultipleImage = async (publicIds) => {//publicIds : array of publicId to delete
    try {
        const result = await cloudinary.v2.api.delete_resources(publicIds);//instruction de cloudinary api
        return(result);
    } catch (error) {
        console.log(error);//pour voir lerreur par le programmer
        throw new Error("Internal Server Error (cloudinary)"); //pour affichezr lerreur a lutilisateur 
    }
};

module.exports = {
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudinaryRemoveMultipleImage
};
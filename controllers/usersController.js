const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require ('path');
const { cloudinaryUploadImage,cloudinaryRemoveImage,cloudinaryRemoveMultipleImage } = require('../utils/cloudinary');
const fs = require ('fs');//fs file system de node pour supprimer fichier de serveur node 
const {Comment}=require('../models/Comment');
const {Post} = require('../models/Post');
/**------------------------------------------------------
 * @desc  Get All users profile
 * @route /api/users/profile
 * @method GET
 * @access private (only admin)
 *.........................................................*/
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
    //console.log(req.headers.authorization.split(' ')[1]);//split transforme string en array 
    const users = await User.find().select("-password").populate("posts");
    res.status(200).json(users);
});

/**------------------------------------------------------
 * @desc  Get user profile
 * @route /api/users/profile/:id
 * @method GET
 * @access public 
 *.........................................................*/
module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password").populate("posts");
                                                         //populate to display all posts for this user
    if(!user){
        return res.status(404).json({msg: "User not found"});
    }
    res.status(200).json(user);
});

/**-------------------------------------------------------
 * @desc  Update user profile
 * @route /api/users/profile/:id
 * @method put
 * @access private (the user update her profile himself) 
 *.........................................................*/
module.exports.updateUserProfileCtrl = asyncHandler(async (req, res) => {
    const {error} = validateUpdateUser(req.body);
    if(error){
        return res.status(400).json({msg: error.details[0].message});
    }
    if(req.body.password){
      const salt = await bcrypt.genSalt(10);
       req.body.password = await bcrypt.hash(req.body.password, salt);
    }
const updatedUser = await User.findByIdAndUpdate(req.params.id,{
$set:{
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    bio: req.body.bio
}
}, {new:true}).select('-password').populate("posts") //new:true pour afficher nouveau enregistrement exception password
    res.status(200).json(updatedUser);//populate pour avoir afficher tous les postes de ce userprofile

});

/**------------------------------------------------------
 * @desc  Get count of users 
 * @route /api/users/count
 * @method GET
 * @access private (only admin)
 *.........................................................*/
module.exports.getCountUsersCtrl = asyncHandler(async (req, res) => { 
    const count = await User.count();
    res.status(200).json(count);
});

/**------------------------------------------------------
 * @desc  upload users photo profile
 * @route /api/users/profile/upload-photo-profile
 * @method POST
 * @access private (only logged in users)
 *.........................................................*/
module.exports.profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
    //validation
    if(!req.file){
       return res.status(404).json({message:'no file provided'});
    }
    //Get the path to the image
const imagePath = path.join(__dirname,`../images/${req.file.filename}`);
    //Upload to cloudinary
const result= await cloudinaryUploadImage(imagePath);
    //console.log(result);
    //Get the user from DB
    const user = await User.findById(req.user.id);
    //Delete the old photo profile if exist
    if(user.profilePhoto.publicId!==null){
await cloudinaryRemoveImage(user.profilePhoto.publicId); 
    }
    //Change the profile photo field in the DB
    user.profilePhoto ={
        url:result.secure_url,
        publicId: result.public_id,
    }
    await user.save();
   // send response to client
    res.status(200).json({message:"Upload photo profile successfully",
    profilePhoto:{
        url:result.secure_url,
        publicId: result.public_id,
    }
    });
    //Remove image from the server
    fs.unlinkSync(imagePath);//unlink fonction pour supprimer image du serveur 
});
/**------------------------------------------------------
 * @desc  Delete  user profile (Account) 
 * @route /api/users/profile/id
 * @method Delete
 * @access private (only admin or user himself)
 *.........................................................*/
module.exports.deleteUserProfileCtrl = asyncHandler(async(req, res)=>{
    //Get the user from DB
    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({msg: "User not found"});
    }
    //Get all posts from DB
    const posts = await Post.find({user:user._id});
    //Get the publicIds from the posts
    const publicIds = posts?.map(post => post.image.publicId); 
    //Delete  all posts image from cloudinary that belong to this user
    if(publicIds?.length>0){
      await cloudinaryRemoveMultipleImage(publicIds);//Delete all posts image from cloudinary
    }
    //Delete the profile picture from cloudinary
    if(user.profilePhoto.publicId !== null){
      await cloudinaryRemoveImage(user.profilePhoto.publicId);
    }
    //Delete user posts & comments
    await Post.deleteMany({user:user._id}); 
    await Comment.deleteMany({user:user._id});

   //Delete the user himself
await User.findByIdAndDelete(req.params.id);
//send response to the client 
    res.status(200).json({msg: "User profile deleted successfully"});
});
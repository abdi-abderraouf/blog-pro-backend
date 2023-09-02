const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateEmail, validateNewPassword } = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmails");

/**------------------------------------------------------
 * @desc  Send Reset Password Link
 * @router /api/password/reset-password-link
 * @method POST
 * @access public
 *.........................................................*/
module.exports.sendResetPasswordLinkCtrl = asyncHandler(async(req,res)=>{
    //1-Validation
    const {error} = validateEmail(req.body); 
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    //2-Get the user from DB from Email 
    const user = await User.findOne({ email:req.body.email});
    if(!user){
        return res.status(404).json({message:'user with given email does not exist'})
    }
    //3-Creating VerificationToken 
    let verificationToken = await VerificationToken.findOne({userId:user._id});
    if(!verificationToken){
        verificationToken = new VerificationToken({
            userId:user.id,
            token: crypto.randomBytes(32).toString("hex"),
        });
        await verificationToken.save();
    }
    //4-Creating link 
    const link = `${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;
    //5-Creating HTML template 
    const htmlTemplate =
     `<a href='${link}'> click here to reset your password </a>`;
    //6-Sending Email
    await sendEmail(user.email, "Reset Password", htmlTemplate);
    //7-Response to the client  
    res.status(200).json({message:"Password reset link sent to your  email, Please check your email"});
})

/**------------------------------------------------------
 * @desc  Get Reset Password Link
 * @router /api/password/reset-password/:userId/:token
 * @method GET
 * @access public
 *.........................................................*/
module.exports.getResetPasswordLinkCtrl = asyncHandler(async(req,res)=>{
 const user = await User.findById(req.params.userId);
 if(!user){
    return res.status(400).json({message:"invalid link user not found"});
 } 
 const verificationToken = await VerificationToken.findOne({
    userId:user._id,
    token:req.params.token,
});
if(!verificationToken){
   return res.status(200).json({message:"invalid link"}); 
    }
res.status(200).json({message:"valid url"});
                                               
});

/*let verificationToken = await VerificationToken.findOne({userId:user._id});
if(!verificationToken){
    verificationToken = new VerificationToken({
        userId:user.id,
        token: crypto.randomBytes(32).toString("hex"),
    })
}
 res.status(200).json({message:"valid link"});                                                
});*/
/**------------------------------------------------------
 * @desc   Reset Password 
 * @router /api/password/reset-password/:userId/:token
 * @method POST
 * @access public
 *.........................................................*/
module.exports.resetPasswordCtrl=asyncHandler(async(req,res)=>{
    const {error} = validateNewPassword(req.body); 
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    const user = await User.findById(req.params.userId);
    if(!user){
        return res.status(400).json({message:'invalid link user does not exist'})
    } 
    const verificationToken = await VerificationToken.findOne({
        userId:user._id,
        token:req.params.token,   
    });
    
    if(!verificationToken){
        return res.status(400).json({message:'invalid link token does not exist'})
    } 
if(!user.isAccountVerified){
    user.isAccountVerified = true;
}
//chiffrement de new password
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(req.body.password,salt); 
user.password = hashedPassword;
await user.save();
await verificationToken.deleteOne({
    token:req.params.token,
    userId:user._id,
})
res.status(200).json({message:"password reset successfully please login"});
});
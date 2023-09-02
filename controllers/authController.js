const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateRegisterUser, validateLoginUser } = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmails");

/**------------------------------------------------------
 * @desc  Register New User
 * @router /api/auth/register
 * @method POST
 * @access public
 *.........................................................*/
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  try {
    const { error } = validateRegisterUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    await user.save();
  //Create a new VerificationToken and save it to DB 
    const verificationToken = new VerificationToken({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    });
    await verificationToken.save();
  //making the link
    const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;
  // putting the link into an html template 
    const htmlTemplate = `
      <div>
        <p>Click on the link below to verify your email</p>
        <a href='${link}'>Verify</a>
      </div>`;
  // sending email to the user
    await sendEmail(user.email, "Verify Your Email", htmlTemplate);
    res.status(201).json({ message: "We sent you an email, please verify your email address" });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ message: "An error occurred while processing your request" });
  }
});

/**------------------------------------------------------
 * @desc  login User
 * @router /api/auth/login
 * @method POST
 * @access public
 *.........................................................*/
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
    //validation 
    const { error } = validateLoginUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    //find user by email exist or not
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "user not found check your email" });
    }
    //compare password
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "invalid password" });
    }
    //sending email to verify account if not verified
    if(!user.isAccountVerified) {
      let verificationToken = await VerificationToken.findOne({
         userId:user._id, 
      });
      if(!verificationToken) { 
        verificationToken = new VerificationToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      });
      await verificationToken.save();
    } 
      //making the link
      const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;
      // putting the link into an html template 
        const htmlTemplate = `
          <div>
            <p>Click on the link below to verify your email</p>
            <a href='${link}'>Verify</a>
          </div>`;
      // sending email to the user
        await sendEmail(user.email, "Verify Your Email", htmlTemplate);
    
     return  res
     .status(400)
     .json({ message: "we sent you an email, please verify your email address " });
    }
    //send a response to client and generate token
    const token = user.generateAuthToken();
    res.status(200).json({
      _id: user.id,
      isAdmin:user.isAdmin,
      profilePhoto: user.profilePhoto,
      token,
      username: user.username
    });
});

/**------------------------------------------------------
 * @desc  Verify  User Account 
 * @router /api/auth/:userId/verify/:token
 * @method GET 
 * @access public
 *.........................................................*/
module.exports.verifyUserAccountCtrl = asyncHandler(async(req,res)=>{
  const user = await User.findById(req.params.userId);
  if(!user){
    return res.status(400).json({message:"invalid link user not exist"});
  }
  const verificationToken = await VerificationToken.findOne({
    userId:user._id,
    token: req.params.token,
  });
  if(!verificationToken){
    return res.status(400).json({message:"invalid link account not verified"});
  }
 // if all is ok : 
  user.isAccountVerified = true;//pour laisser user logged in ykonnekti 
  await user.save();//pour enregistrer les changements 
 //supprimer verification de DB pour que la verification se fait une seule fois.
 try{
 //await verificationToken.remove()
 await verificationToken.deleteOne({
  userId: user._id,
  token: req.params.token,
});
  res.status(200).json({message:"your account verified"});
} catch (error) {
  console.error("An error occurred:", error);
  return res.status(500).json({ message: "An error occurred we cant remove verifToken while processing your request" });
 } 
  
});
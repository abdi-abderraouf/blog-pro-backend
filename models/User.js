const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity");

//user schema
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://media.istockphoto.com/id/1433039224/photo/blue-user-3d-icon-person-profile-concept-isolated-on-white-background-with-social-member.jpg?s=1024x1024&w=is&k=20&c=Ny3oxWfK9DQgG1xgaI2-iYhaiErqbmbY2cjLa4F1xAE=",
        publicId: null,
      },
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    bio: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
    //pour que virtual ajoute propriete posts au userschema 
  }
);
//Populate Posts That Belongs To This User When he/she Get his/her Profile 
//afficher tous les postes d'un user lors de laffichage de son profile
//_id est l'id de user qui doit exister ds model Post 
UserSchema.virtual("posts",{
  ref: "Post",
  localField: "_id",
  foreignField: "user"
});

//generate auth token
UserSchema.methods.generateAuthToken = function () {
  // const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
  //return token;
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_SECRET
  );
};
//user models
const User = mongoose.model("User", UserSchema);
//validate Register User, on utilise  joi pour faire la validation
function validateRegisterUser(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().min(5).max(100).required().email(),
    //password: Joi.string().trim().min(8).required(), sera remplacer par un fort password
    password:passwordComplexity().required(),//renforce mot de passe
  });
  return schema.validate(obj);
}
//validate Login User  joi pour faire la validation
function validateLoginUser(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: Joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}

//validate update User  joi pour faire la validation
function validateUpdateUser(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100),
    email: Joi.string().trim().min(5).max(100).email(),
    //password: Joi.string().trim().min(8),
    password:passwordComplexity(),
    bio: Joi.string(),
  });
  return schema.validate(obj);
}

//validate Email User  joi pour faire la validation
function validateEmail(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
  });
  return schema.validate(obj);
}

//validate New Password  joi pour faire la validation
function validateNewPassword(obj) {
  const schema = Joi.object({
    password:passwordComplexity().required(),
  });
  return schema.validate(obj);
}
module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
  validateEmail,
  validateNewPassword,
};

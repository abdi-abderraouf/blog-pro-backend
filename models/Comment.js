const mongoose = require('mongoose');
const Joi = require('joi');
//Comment Schema 
const CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },},
    {
        timestamps: true
    }
);
//comment model
const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
//validate create comment
function validateCreateComment(obj){
    const schema = Joi.object({
        text: Joi.string().trim().required(),
        postId: Joi.string().required(),
    });
    return schema.validate(obj);
}
//validate update comment 
function validateUpdateComment(obj){
    const schema = Joi.object({
        text: Joi.string().trim().required(),
    });
    return schema.validate(obj);
}
module.exports={
    Comment,
    validateCreateComment,
    validateUpdateComment
}
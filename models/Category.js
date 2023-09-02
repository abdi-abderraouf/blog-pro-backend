const mongoose = require('mongoose');
const Joi = require('joi');
//Category Schema 
const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    },
    {
        timestamps: true
    }
);
//Category model
const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;
//validate Create Category
function validateCreateCategory(obj){
    const schema = Joi.object({
        title: Joi.string().trim().required()  
    });
    return schema.validate(obj);
}
module.exports={
    Category,
    validateCreateCategory
}
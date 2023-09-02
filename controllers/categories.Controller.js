const asyncHandler = require("express-async-handler");
const {Category,validateCreateModel, validateCreateCategory} = require("../models/Category");


/**------------------------------------------------------
 * @desc  Create a new category
 * @route /api/categories
 * @method POST
 * @access private (only Admin)
 *.........................................................*/
module.exports.createCategoryCtrl=asyncHandler(async(req,res) => {
   const{error}=validateCreateCategory(req.body);
   if(error){
    return res.status(400).json({message:error.details[0].message}); 
   }
   const category = await Category.create({
    title: req.body.title,
    user:req.user.id
   });
   res.status(201).json(category); 

});

/**------------------------------------------------------
 * @desc  get all categories
 * @route /api/categories
 * @method GET
 * @access public ()
 *.........................................................*/
module.exports.getCategoriesCtrl=asyncHandler(async(req,res) => {
   const categories = await Category.find();
   res.status(200).json(categories); 
});
/**------------------------------------------------------
 * @desc  delete category
 * @route /api/categories/:id
 * @method DELETE
 * @access private (only Admin)
 *.........................................................*/
module.exports.deleteCategoryCtrl=asyncHandler(async(req,res) => {
   const category = Category.find(req.params.id);
   if(!category){
      res.status(404).json({msg:'category not found'});
   }
 const categories =  await Category.findByIdAndDelete(req.params.id);
   res.status(200).json({msg:"category deleted",categoryId:categories._id}); 
});

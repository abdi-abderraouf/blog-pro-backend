const router = require('express').Router();
const {verifyTokenAndAdmin} = require ('../middlewares/verifyToken');
const {createCategoryCtrl,getCategoriesCtrl,deleteCategoryCtrl}= require('../controllers/categories.Controller');
// /api/categories
router.route('/').post(verifyTokenAndAdmin,createCategoryCtrl);
router.route('/').get(getCategoriesCtrl);
// /api/categories/:id
router.route('/:id').delete(verifyTokenAndAdmin,deleteCategoryCtrl);

module.exports = router;
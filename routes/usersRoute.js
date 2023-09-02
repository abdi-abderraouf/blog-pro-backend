const router = require('express').Router();
const {getAllUsersCtrl,getUserProfileCtrl,updateUserProfileCtrl,getCountUsersCtrl,profilePhotoUploadCtrl, deleteUserProfileCtrl}=require('../controllers/usersController');
const {verifyTokenAndAdmin,verifyTokenAndOnlyUser,verifyToken, verifyTokenAndAuthorization} = require('../middlewares/verifyToken');
const validateObjectId = require('../middlewares/validateObjectId');
const photoUpload = require ('../middlewares/photoUpload.js');
 

// /api/users/profile
router.route('/profile').get(verifyTokenAndAdmin,getAllUsersCtrl);
// /api/users/profile/id
router.route('/profile/:id').get(validateObjectId,getUserProfileCtrl)
                            .put(validateObjectId,verifyTokenAndOnlyUser,updateUserProfileCtrl)
                            .delete(validateObjectId,verifyTokenAndAuthorization,deleteUserProfileCtrl);
///api/users/profile/upload-photo-profile
router.route('/profile/upload-photo-profile').post(verifyToken,photoUpload.single("image"),profilePhotoUploadCtrl);
// /api/users/count                                                                         
router.route('/count').get(verifyTokenAndAdmin,getCountUsersCtrl);  
module.exports = router;
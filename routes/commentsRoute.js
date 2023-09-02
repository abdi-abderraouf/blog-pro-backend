const router = require("express").Router();
const {
  createCommentCtrl,
  getAllCommentsCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
} = require("../controllers/commentsController");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");
const validateIObjectId = require("../middlewares/validateObjectId");
// /api/comments
router.route("/").post(verifyToken, createCommentCtrl);
router.route("/").get(verifyTokenAndAdmin, getAllCommentsCtrl);
// /api/comments/:id
router.route("/:id").delete(validateIObjectId, verifyToken, deleteCommentCtrl);
router.route("/:id").put(validateIObjectId, verifyToken, updateCommentCtrl);

module.exports = router;

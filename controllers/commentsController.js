const asyncHandler = require("express-async-handler");
const {
  Comment,
  validateCreateComment,
  validateUpdateComment,
} = require("../models/Comment");
const { User } = require("../models/User");
/**------------------------------------------------------
 * @desc  Create a new comment
 * @route /api/comments
 * @method POST
 * @access private (only LOGGED IN user)
 *.........................................................*/
module.exports.createCommentCtrl = asyncHandler(async (req, res) => {
  const { error } = validateCreateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const profile = await User.findById(req.user.id);
  const comment = await Comment.create({
    postId: req.body.postId,
    text: req.body.text,
    username: profile.username,
    user: req.user.id,
  });
  res.status(201).json(comment);
});
/**------------------------------------------------------
 * @desc  Get All comment 
 * @route /api/comments
 * @method Get
 * @access private (only Admin)
 *.........................................................*/
module.exports.getAllCommentsCtrl = asyncHandler(async (req, res) => {
  const comments = await Comment.find().populate("user", ["-password"]);
  res.status(200).json(comments);
});
/**------------------------------------------------------
 * @desc  Delete comment
 * @route /api/comments/:id
 * @method Delete
 * @access private ( Admin or owner of the comment)
 *.........................................................*/
module.exports.deleteCommentCtrl = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return res.status(404).json({ msg: "comment not found" });
  }
  if (req.user.isAdmin || req.user.id === comment.user.toString()) {
    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "comment has been deleted" });
  } else {
    res.status(403).json({ msg: "access denied cannot deleted" });
  }
});
/**------------------------------------------------------
 * @desc  Update comment
 * @route /api/comments/:id
 * @method PUT
 * @access private ( owner of the comment)
 *.........................................................*/
module.exports.updateCommentCtrl = asyncHandler(async (req, res) => {
  const { error } = validateCreateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ msg: "comment not found" });
  }
  if (req.user.id === comment.user.toString()) {
    const commentUpdated = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          text: req.body.text,
        },
      },
      { new: true }
    );
    res.status(200).json(commentUpdated);
  } else {
    res.status(403).json({ msg: "access denied cannot updated" });
  }
});

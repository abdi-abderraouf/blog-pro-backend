const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require("../models/Post");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");
const {Comment}=require("../models/Comment");
/**------------------------------------------------------
 * @desc  Create a new post
 * @route /api/posts
 * @method POST
 * @access private (only LOGGED IN user)
 *.........................................................*/

module.exports.createPostCtrl = asyncHandler(async (req, res, next) => {
  //Validation for image
  if (!req.file) {
    res.status(400).json({ msg: "Please upload an image" });
  }
  //validation for data
  const { error } = validateCreatePost(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  //upload photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);
  //create new post and save it to DB
  // premiere methode pour enregistrer un poste
  /*const post = new Post({
        title:req.body.title,
        content:req.body.content,
        user:req.user._id,
        image:result.secure_url
    });
     await post.save();
   return res.status(200).json(post);*/
  //deuxieme methode pour enregistrer un poste
  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  //send response to the client
  res.status(201).json(post);
  //remove image from the server
  fs.unlinkSync(imagePath);
});

/**------------------------------------------------------
 * @desc  Get All post
 * @route /api/posts
 * @method GET
 * @access public
 *.........................................................*/

module.exports.getAllPostsCtrl = asyncHandler(async (req, res) => {
  //pagination
  const POST_PER_PAGE = 3;
  const { pageNumber, category } = req.query;
  let posts;
  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]); //affiche details user et naffiche pas password
  } else if (category) {
    posts = await Post.find({ category })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  }
  res.status(200).json(posts);
});
/**------------------------------------------------------
 * @desc  Get Single post
 * @route /api/posts/:id
 * @method GET
 * @access public
 *.........................................................*/

module.exports.getSinglePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
  .populate("user", [ "-password", ])
  .populate("comments");
  if (!post) {
    return res.status(404).json({ msg: "Post not found" });
  }
  res.status(200).json(post);
});
/**------------------------------------------------------
 * @desc  Get Posts Count
 * @route /api/posts/count
 * @method GET
 * @access public
 *.........................................................*/

module.exports.getPostCountCtrl = asyncHandler(async (req, res) => {
  const count = await Post.count();

  res.status(200).json(count);
});
/**------------------------------------------------------
 * @desc  Delete  post
 * @route /api/posts/:id
 * @method DELETE
 * @access private (only admin or owner of the post  )
 *.........................................................*/

module.exports.deletePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ msg: "Post not found" });
  }

  if (post.user.toString() === req.user.id || req.user.isAdmin) {
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);

    // delete all comments that belong to this post
   await Comment.deleteMany({postId:post._id});

    res
      .status(200)
      .json({ msg: "Post deleted", postitle: post.title, postId: post._id });
  }
  res.status(403).json({ msg: "Unauthorized" });
});
/**------------------------------------------------------
 * @desc  update post
 * @route /api/posts/:id
 * @method PUT
 * @access private (only owner of the post )
 *.........................................................*/

module.exports.updatePostCtrl = asyncHandler(async (req, res) => {
  //validation
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  //Get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ msg: "Post not found" });
  }
  //check if this post belong to logged in user
  if (post.user.toString() !== req.user.id) {
    res.status(403).json({ msg: "Unauthorized" });
  }
  //update post
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate("user", ["-password"])
  .populate("comments");
  //send response to client
  res.status(200).json(updatedPost);
});
/**------------------------------------------------------
 * @desc  update image post
 * @route /api/posts/update-image/:id
 * @method PUT
 * @access private (only owner of the post )
 *.........................................................*/

module.exports.updatePostImageCtrl = asyncHandler(async (req, res) => {
  //validation
  if (!req.file) {
    return res.status(400).json({ msg: "Invalid file" });
  }
  //Get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ msg: "Post not found" });
  }
  //check if this post belong to logged in user
  if (post.user.toString() !== req.user.id) {
    res.status(403).json({ msg: "Unauthorized" });
  }
  //delete the old image
  await cloudinaryRemoveImage(post.image.publicId);
  //upload new image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);
  //update image field in the DB
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  //send response to client
  res.status(200).json(updatedPost);
  //remove image from the server
  fs.unlinkSync(imagePath);
});
/**------------------------------------------------------
 * @desc  Toggle Like
 * @route /api/posts/like/:id
 * @method PUT
 * @access private (only logged in user)
 *.........................................................*/

module.exports.toggleLikeCtrl = asyncHandler(async (req, res) => {
  const loggedInUser = req.user.id;
  const { id: postId } = req.params;
  let post = await Post.findById(postId); //{id:postId}==postId
  //check if post exist
  if (!post) {
    return res.status(404).json({ msg: "Post not found" });
  }
  const isPostAlreadyLiked = post.likes.find(
    (user) => user.toString() === loggedInUser
  );
  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(postId, {
      $pull: { likes: loggedInUser }},{new: true}); //pour supprimer like 
       }
  else {
    post = await Post.findByIdAndUpdate(postId, {
      $push: { likes: loggedInUser }},{new: true}); //pour ajouter like 
  }
  res.status(200).json(post);
    });
  
  

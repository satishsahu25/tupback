const Post = require('../models/post.model.js');
const { errorHandler } = require('../utils/error.js');

const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to create a post'));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }
  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');
  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};

// controllers/post.controller.js
const cloudinary = require('cloudinary').v2;


// Make sure these are set in your env:
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: turn a Cloudinary URL into its public_id (folder/name without extension)
function getPublicIdFromUrl(url) {
  try {
    // Example: https://res.cloudinary.com/<cloud>/image/upload/v1699999999/folder/name.jpg
    const noQuery = url.split('?')[0];
    const parts = noQuery.split('/');

    // remove version segment like "v1699999999"
    const vIndex = parts.findIndex((p) => /^v\d+$/.test(p));
    const pathAfterVersion = vIndex >= 0 ? parts.slice(vIndex + 1) : parts.slice(7); 
    // slice(7) is a fallback: https://res.cloudinary.com/<cloud>/image/upload/... -> first 7 segments vary, so we rely on vIndex.

    const last = pathAfterVersion.pop();                // e.g. "name.jpg"
    const filenameNoExt = last.replace(/\.[^/.]+$/, ''); // -> "name"
    const publicIdPath = [...pathAfterVersion, filenameNoExt].join('/'); // "folder/name"
    return publicIdPath;
  } catch {
    return null;
  }
}

const deletepost = async (req, res, next) => {
  // Corrected auth check: deny only if NOT admin AND not owner
  if (!req.user?.isAdmin && req.user?.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this post'));
  }

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return next(errorHandler(404, 'Post not found'));

    // If your schema stores the image URL at post.image (adjust if different)
    if (post.image) {
      const publicId = getPublicIdFromUrl(post.image);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId); // deletes the asset
        } catch (e) {
          // Don’t block post deletion if image removal fails
          console.error('Cloudinary delete failed:', e?.message || e);
        }
      }
    }

    await Post.findByIdAndDelete(post._id);
    return res.status(200).json('The post and its image (if any) have been deleted');
  } catch (error) {
    next(error);
  }
};





// export const deletepost = async (req, res, next) => {
//   if (!req.user.isAdmin || req.user.id !== req.params.userId) {
//     return next(errorHandler(403, 'You are not allowed to delete this post'));
//   }
//   try {
//     await Post.findByIdAndDelete(req.params.postId);
//     res.status(200).json('The post has been deleted');
//   } catch (error) {
//     next(error);
//   }
// };

const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this post'));
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

module.exports={
  create,
  getposts,
  deletepost,
  updatepost
};
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import Post from '../models/Post.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const SUBJECTS = [
  'Mathematics 3',
  'Operating System',
  'Analysis and Design of Algorithm',
  'Computer Architecture and Organisation',
  'Software Development'
];

// GET /api/posts - Feed, Paginated + Filter by subject
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.subject && SUBJECTS.includes(req.query.subject)) {
      filter.subject = req.query.subject;
    }

    const posts = await Post.find(filter)
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(posts);
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/posts/user/:id - User profile posts
router.get('/user/:id', requireAuth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Fetch user posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/posts - Create Post or Tweet
router.post('/', requireAuth, async (req, res) => {
  try {
    const { type, imageBase64, caption, subject } = req.body;

    if (!caption) {
      return res.status(400).json({ error: 'Caption is required' });
    }
    if (caption.length > 280) {
      return res.status(400).json({ error: 'Caption must be 280 characters or less' });
    }
    if (!subject || !SUBJECTS.includes(subject)) {
      return res.status(400).json({ error: 'Valid subject is required' });
    }

    let imageUrl = null;

    // Only upload image for 'post' type
    if (type === 'post') {
      if (!imageBase64) {
        return res.status(400).json({ error: 'Image is required for posts' });
      }

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
        folder: 'assignment_feed'
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newPost = new Post({
      userId: req.user._id,
      type: type || 'post',
      imageUrl,
      caption,
      subject
    });

    await newPost.save();
    await newPost.populate('userId', 'name');

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Create post error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to create post' });
  }
});

// DELETE /api/posts/:id - Delete Post
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete image from Cloudinary if it exists
    if (post.imageUrl) {
      try {
        const urlParts = post.imageUrl.split('/');
        const folderAndFile = urlParts.slice(-2).join('/');
        const publicId = folderAndFile.replace(/\.[^/.]+$/, '');

        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        });

        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error('Cloudinary delete error (continuing):', cloudErr.message);
      }
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error.message || error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;

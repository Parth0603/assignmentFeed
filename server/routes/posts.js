import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import Post from '../models/Post.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/posts - Feed, Paginated
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
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

// POST /api/posts - Create Post
router.post('/', requireAuth, async (req, res) => {
  try {
    const { imageBase64, caption } = req.body;

    if (!imageBase64 || !caption) {
      return res.status(400).json({ error: 'Image and caption are required' });
    }

    if (caption.length > 280) {
      return res.status(400).json({ error: 'Caption must be 280 characters or less' });
    }

    // Configure Cloudinary at request time (after dotenv has loaded)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Upload to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: 'assignment_feed'
    });

    const newPost = new Post({
      userId: req.user._id,
      imageUrl: uploadResponse.secure_url,
      caption: caption
    });

    await newPost.save();

    // Populate user info before returning
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

    // Only the owner can delete
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete image from Cloudinary
    // URL looks like: https://res.cloudinary.com/.../assignment_feed/abc123.jpg
    // public_id is: assignment_feed/abc123
    try {
      const urlParts = post.imageUrl.split('/');
      const folderAndFile = urlParts.slice(-2).join('/'); // "assignment_feed/abc123.jpg"
      const publicId = folderAndFile.replace(/\.[^/.]+$/, ''); // remove extension
      
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      await cloudinary.uploader.destroy(publicId);
    } catch (cloudErr) {
      console.error('Cloudinary delete error (continuing):', cloudErr.message);
      // Still delete from DB even if Cloudinary fails
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error.message || error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;

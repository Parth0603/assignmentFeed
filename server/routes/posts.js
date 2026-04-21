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

// GET /api/posts/upload-signature - Get signature for Cloudinary direct upload
router.get('/upload-signature', requireAuth, (req, res) => {
  try {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: 'assignment_feed' },
      process.env.CLOUDINARY_API_SECRET
    );
    res.json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({ error: 'Failed to generate upload signature' });
  }
});

// POST /api/posts - Create Post or Tweet
router.post('/', requireAuth, async (req, res) => {
  try {
    const { type, imageUrl, fileUrl, caption, subject } = req.body;

    if (!caption) {
      return res.status(400).json({ error: 'Caption is required' });
    }
    if (caption.length > 280) {
      return res.status(400).json({ error: 'Caption must be 280 characters or less' });
    }
    if (!subject || !SUBJECTS.includes(subject)) {
      return res.status(400).json({ error: 'Valid subject is required' });
    }
    if (type === 'post' && !imageUrl) {
      return res.status(400).json({ error: 'Image URL is required for posts' });
    }
    if (type === 'pdf' && !fileUrl) {
      return res.status(400).json({ error: 'PDF URL is required for pdf posts' });
    }

    const newPost = new Post({
      userId: req.user._id,
      type: type || 'post',
      imageUrl,
      fileUrl,
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

    // Delete image or pdf from Cloudinary if it exists
    const urlToDelete = post.imageUrl || post.fileUrl;
    if (urlToDelete) {
      try {
        const urlParts = urlToDelete.split('/');
        const folderAndFile = urlParts.slice(-2).join('/');
        const publicId = folderAndFile.replace(/\.[^/.]+$/, '');

        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        });

        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        }
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

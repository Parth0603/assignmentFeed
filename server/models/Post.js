import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['post', 'tweet', 'pdf'], default: 'post' },
  imageUrl: { type: String }, // optional for tweets
  fileUrl: { type: String },  // optional for pdfs
  caption: { type: String, required: true, maxlength: 280 },
  subject: { 
    type: String, 
    required: true,
    enum: [
      'Mathematics 3',
      'Operating System',
      'Analysis and Design of Algorithm',
      'Computer Architecture and Organisation',
      'Software Development'
    ]
  }
}, { timestamps: true });

export default mongoose.model('Post', postSchema);

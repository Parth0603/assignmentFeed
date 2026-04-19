import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  caption: { type: String, required: true, maxlength: 280 }
}, { timestamps: true });

export default mongoose.model('Post', postSchema);

import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema;

const reviewSchema = new mongoose.Schema({
    user: { type: ObjectId, ref: 'User', required: true },
    product: { type: ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);

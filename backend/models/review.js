import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true,
            required: true
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: true
        }
    },
    { timestamps: true }
);

export const Review =  mongoose.model('Review', reviewSchema);

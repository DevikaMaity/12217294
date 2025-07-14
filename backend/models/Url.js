import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
    {
    originalUrl: { 
        type: String, 
        required: true 
    },
    shortUrl: { 
        type: String, 
        required: true, 
        unique: true 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    validity: {
        type: Number,
        default: 30, // minutes
        required: true
    },
    expiry: {
        type: Date,
        required: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    isCustomShortcode: {
        type: Boolean,
        default: false
    }
}, 
{
    timestamps: true
}
);

// Index for expiry to help with cleanup
urlSchema.index({ expiry: 1 });

export default mongoose.model('Url', urlSchema); 
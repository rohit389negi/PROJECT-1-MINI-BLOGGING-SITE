const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: 'Title is required',
        trim:true
    },
    body: {
        type: String,
        required: 'Body is required',
        trim:true
    },
    authorId: {
        type: ObjectId,
        ref: 'Author'
    },
    tags: [String],
    category: {
        type: String,
        required: 'category is required',
        trim:true
    },
    subcategory: [String],
    deletedAt: {
        type: Date,
        dafault: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        dafault: null
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Blog', blogSchema)

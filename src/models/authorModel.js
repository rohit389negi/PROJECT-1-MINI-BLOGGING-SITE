const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({

    fname: {
        type: String,
        required: 'First name is required',
        trim: true,
    },
    lname: {
        type: String,
        required: 'Last Name is required',
        trim:true
    },
    title: {
        type: String,
        required: 'Title is required',
        enum: ['Mr', 'Mrs', 'Miss']
    },
    email: {
        type: String,
        required: 'E-mail is required',
        unique: true
    },
    password: {
        type: String,
        required: 'Password is required'
    }
}, { timestamps: true })

module.exports = mongoose.model('Author', authorSchema)

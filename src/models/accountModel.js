const mongoose = require('mongoose')

const accountSchema = new mongoose.Schema({

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
    roleType: {
        type: String,
        required: 'roleType is required',
        enum: ['admin', 'user', 'guest']
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

module.exports = mongoose.model('account', accountSchema)

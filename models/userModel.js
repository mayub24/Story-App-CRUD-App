const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username:
    {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true,
        unique: true
    },
    password:
    {
        type: String,
        required: true
    },
    profilePic:
    {
        type: String,
        default: 'default.jpg'
    },
    date:
    {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('users', userSchema);
const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title:
    {
        type: String,
        required: true
    },
    description:
    {
        type: String,
        required: true
    },
    privacy:
    {
        type: String,
        default: 'public',
        enum: ['public', 'private']
    },
    createdAt:
    {
        type: Date,
        default: Date.now
    },
    users:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
})

module.exports = mongoose.model('tasks', taskSchema);
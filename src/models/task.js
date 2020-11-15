const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
      description: {
        type: String,
        required: true,
        trim: true
      },
      completed: {
        type: Boolean,
        default: false
      },
      ownerID: {
        type: mongoose.Schema.Types.ObjectID,   //objectID
        required: true,
        ref: 'User' //reference for user model
      }
},{
  timestamps: true
})




const Task = mongoose.model('Task',taskSchema)

module.exports = Task

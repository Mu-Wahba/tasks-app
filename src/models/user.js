const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
      name: {
          type: String,
          required: true,
          trim: true
      },
      email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
          if(!validator.isEmail(value)){
            throw new Error('Invalid Email')
          }
        }
      },
      password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value){
          if (value.toLowerCase().includes('password')){
            throw new Error("password can't contain Password")
          }
        }
      },
      age: {
          type: Number,
          default: 8,
          validate(value){
            if(value < 0){
              throw new Error('Age must be a positive number')
            }
          }
      },
      tokens: [{
        token: {
         type: String,
        required: true
      }
    }],
    avatar: {
      type: Buffer
    }
},{
  timestamps: true
})

//virtual property called tasks  not stored in the database
userSchema.virtual('tasks',{
  ref: 'Task',
  localField: '_id',
  foreignField: 'ownerID'
})


userSchema.methods.toJSON =  function (){
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  return userObject
}

//create generateAuthToken fn to generatee tokens (instances methods)
userSchema.methods.generateAuthToken = async function (){
      const user = this
      //generate jwt
      const token = jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET)
      user.tokens = user.tokens.concat({token: token})
      await user.save()
      return token
}

//create findByCredentials fn for ligin (Model methods)
userSchema.statics.findByCredentials = async (email, password) => {
  //find user by email first then compare the passwords hashs
  const user = await User.findOne({email: email})
  if (!user) {
    throw new Error('Unable to login!?????')
  }
  //if user exists, then check the password
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch){
    throw new Error('Unable to login!')
  }
  //return user if email is found  and password matches
  return user
}


userSchema.pre('save',async function(next){
  const user = this
  if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

//delete tasks ince you delete the user
userSchema.pre('remove', async function(next){
      const user = this
      //load task module above
      await Task.deleteMany({ownerID: user._id})

      next()
})

const User = mongoose.model('User',userSchema)

module.exports = User

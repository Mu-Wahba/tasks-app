const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')



const userOneId = new mongoose.Types.ObjectId() //generate object id for the test user
//user for test
const userOne = {
  _id: userOneId,
  name: "wahba",
  email: "wahbamail@gmail.com",
  password: "secretpass",
  tokens: [{
    token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
  }]
}


const userTwoId = new mongoose.Types.ObjectId() //generate object id for the test user
const userTwo = {
  _id: userTwoId,
  name: "wahba22",
  email: "mailwahba@gmail.com",
  password: "secretpass22",
  tokens: [{
    token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
  }]
}


const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "First Task",
  completed: false,
  ownerID: userOne._id
}

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Second Task",
  completed: true,
  ownerID: userOne._id
}

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Third Task",
  completed: true,
  ownerID: userTwo._id
}

const configureDB = async () => {
  await User.deleteMany() //delete all users
  await new User(userOne).save()   //create a specific one for testing
  await new User(userTwo).save()   //create a specific one for testing
  await Task.deleteMany()
  await new Task(taskOne).save()
  await new Task(taskTwo).save()
  await new Task(taskThree).save()


}

module.exports = {
  userOneId,
  userOne,
  configureDB
}

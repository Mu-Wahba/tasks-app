const express = require('express')

const Task = require('../models/task')
const auth = require('../middleware/auth')

//create a router
const router = new express.Router()


//post a task
router.post('/tasks', auth ,async (req,res)=>{
    //const task = new Task(req.body)
    const task = new Task({
      ...req.body,
      ownerID: req.user._id
    })
    try {
      await task.save()
      res.status(201).send(task)
    } catch (e) {
      res.status(400).send(e.message)
    }
    // task.save()
    // .then(() => {res.status(201).send(task)}) //201 more correct to create resources, check http status codes
    // .catch((er) => {res.status(400).send(er.message)})
})

router.get('/tasks', auth ,async (req,res) => {
try {
    // const task = await Task.find({ ownerID: req.user._id})
   //  res.status(200).send(task)
  const match = {}
  const sort ={}
  if(req.query.completed){
    match.completed = req.query.completed
  }

  if (req.query.sortBy){
      const parts = req.query.sortBy.split(':')
       sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }
   await req.user.populate({
     path: 'tasks',
     match: match,
     options: {
       limit: parseInt(req.query.limit),
       skip: parseInt(req.query.skip),
        sort: sort
     }}).execPopulate()
   res.status(200).send(req.user.tasks)

}
catch (e) {
  console.log(e);
  res.status(400).send()
}
})



router.get('/tasksall' ,async (req,res) => {
try {
  const task = await Task.find({})

  res.status(200).send(task)
}
catch (e) {
  res.status(400).send()
}
})


//get task by id
router.get('/tasks/:id', auth ,async (req,res) => {
    const _id = req.params.id
    try {
      const task = await Task.findOne({ _id: _id , ownerID: req.user._id})
      console.log(task);
      if (!task){
        return res.status(404).send("Task not found!")
      }
      res.status(200).send(task)
    } catch (e) {
      res.status(500).send("Error")
    }
    // Task.findById(_id)
    // .then(task => {
    //   if(!task){
    //     return res.status(400).send()
    //   }
    //   res.status(200).send(task)})
    //   .catch(e => res.status(400).send(e))

})

//update task by it's // id
router.patch('/tasks/:id',auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ["description", "completed"]
  //if updates only have allowed updates
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update)) //return true if all are true
  if (!isValidOperation){
    return res.status(400).send({'error': "invalid Field update"})
  }
  const _id = req.params.id
try {
//  const task = await Task.findByIdAndUpdate(_id,req.body,{new: true,runValidators: true})

  const task = await Task.findOne({_id,ownerID: req.user._id})
  if (!task){
    return res.status(404).send()
  }
  updates.forEach(update => task[update] = req.body[update])
  await task.save()
  res.status(200).send(task)
} catch(e) {
  res.status(400).send(e)
}
  // Task.findByIdAndUpdate(_id,req.body,{new: true})
  // .then((task) => res.status(200).send(task))
  // .catch((e) => res.status(400))

})

//delete task by id
router.delete('/tasks/:id',auth, async(req,res)=> {
    try {
      //task to be deleted
      const task = await Task.findOneAndDelete({_id: req.params.id, ownerID: req.user._id})
      if (!task) {
        return res.status(404).send("Task Not Found !") //12bytes but not exist
      }
      res.status(200).send(task)
    } catch(e) {
      res.status(500).send("Invalid Task id !") //not 12 bytes id
    }
})

module.exports = router

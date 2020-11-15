const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail,sendCancelEmail} = require('../emails/account')
//https://mongoosejs.com/docs/queries.html


router.post('/users', async (req, res) => {
      const user = new User(req.body)
      try {
          await user.save()
          //send Welcome email
          sendWelcomeEmail(user.email,user.name)
          const token = await user.generateAuthToken()
          res.status(201).send({user, token})
      } catch (e) {
        console.log(e);
          res.status(404).send(e)
      }
      // user.save()
      // .then((user) => {res.status(201).send(user)})
      // .catch((er)=> {
      //   res.status(400)
      //   res.send(er.message)
      //   // res.status(400).send(er.message) chaining the methods
      // })
})


//login users
router.post('/users/login', async (req, res)=> {
  try {
      //create fn to get user by credentials (findByCredentials) in model
      const user = await User.findByCredentials(req.body.email,req.body.password)
      //generate token to be sent to user
      const token = await user.generateAuthToken()
      res.send({user: user , token:token })
  }catch(e) {
    console.log(e)
    res.status(400).send()
  }

})


router.post('/users/logout',auth, async (req, res) => {
    try {
      req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token
      })
      await req.user.save()
      res.send()
    }catch (e){
      res.status(500).send()
    }
})

router.post('/users/logoutAll',auth, async (req, res) => {
    try {
      req.user.tokens = []
      await req.user.save()
      res.send()
    }catch (e){
      res.status(500).send()
    }
})


router.get('/users/me',auth, async (req,res) => {
  res.send(req.user)
})


//Update existing user
//ypdate your own user profile
router.patch('/users/me', auth ,async (req, res) => {

  const updates = Object.keys(req.body)
  const allowedUpdates = ['name','email','password','age']
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update)
  })

if (!isValidOperation){
  return res.status(400).send({'error': "invalid Field update"})
}

  const _id = req.params.id
  try {
      updates.forEach(update => {
          req.user[update] = req.body[update]
      })
      //save the user
      await req.user.save()
      res.send(req.user)
  } catch (e){
      res.status(400).send()
  }
})

//delete your own profile
router.delete('/users/me', auth ,async (req,res)=>{
try {
  await req.user.remove()
  sendCancelEmail(req.user.email,req.user.name)

  res.status(200).send(req.user)
} catch(e) {
  res.status(500).send()
}

})



//uplaod avatar
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb){
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload word jpg|jpeg|png'))
    }
    cb(undefined,true)
    // cb(new Error('file must be PDF'))
  }
})


router.post('/users/me/avatar',auth,upload.single('avatar'),async (req, res) => {
  //Avatar pics customization
  const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
  // req.user.avatar = req.file.buffer //uploaded file
  req.user.avatar = buffer //uploaded file

  await req.user.save()
  res.send()
},(error, req,res,next) => {
  res.status(400).send({error: error.message})

})

//delete my avatar
router.delete('/users/me/avatar', auth ,async (req,res)=>{
  req.user.avatar =  undefined
  await req.user.save()
  res.send()

})

//get profile avatar
router.get('users/:id/avatar', async (req,res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar){
      throw new Error()
    }
    res.set('Content-Type','image/png') 
    res.send(user.avatar)
  }catch(e){
    res.status(404).send()
  }
})


module.exports = router

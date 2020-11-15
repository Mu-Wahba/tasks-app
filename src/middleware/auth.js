const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next) => {
  try {
      const token = req.header('Authorization').replace('Bearer ','') //Bearer dfmvkldfmlm..
      // console.log(token)
      const decoded = jwt.verify(token,process.env.JWT_SECRET)
      //find the user with id and has the token still stored in tokens.token array, (token deleted on sign out)
      const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
      if (!user){
          throw new Error()
      }
      req.token = token
      req.user = user
      next() //run the route handler
  } catch(e) {
      res.status(404).send({error: 'Please Authenticate'})
  }
}


module.exports = auth

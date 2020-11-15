const request = require('supertest')
const User = require('../src/models/user')
const app = require('../src/app')
const {userOneId, userOne , configureDB } = require('./fixtures/db')

beforeEach(configureDB)


//Advanced assertions -> you could get the response and start more advanced assertion on the response body
test('Sign up new user Test',async()=> {
    const response = await request(app)
                          .post('/users')
                          .send({
                                    name: "wahba2",
                                    email: "mail@gmail.com",
                                    password: "secretpass"
                                  })
                          .expect(201)
    // console.log(response.body);
    //Assertion that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    //Assertion about the response
    // expect(response.body.user.name).toBe('wahba2') OR general one below
    expect(response.body).toMatchObject({
      user: {
        name: "wahba2",
        email: "mail@gmail.com"
      },
      token: user.tokens[0].token
    })
    //check password not stored as plain text
    expect(user.password).not.toBe('secretpass')
})


//Advanced one -> check token is stord in the database
test('login existing user Test', async ()=> {
  const response = await request(app)
        .post('/users/login')
        .send({
              email: userOne.email,
              password: userOne.password
            })
      .expect(200)

      const user = await User.findById(response.body.user._id)
      console.log(user);
      expect(response.body.token).toBe(user.tokens[1].token)
})


test('login failure user Test', async ()=> {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: "dddd" //Wrong Password
  }).expect(400)  //Got 400 Error
})


test('Get profile for user Test', async()=>{
  await request(app)
        .get('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('NOT Get profile for unauthenticated users Test', async()=>{
  await request(app)
        .get('/users/me')
        //.set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
})

//DElete accounts
test('Delete user Test', async()=>{
  await request(app)
        .delete('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
 //Assert Null REsponse
 const user = await User.findById(userOneId)
 expect(user).toBeNull()
})

test('NOT Delete user if not authenticated Test', async()=>{
  await request(app)
        .delete('/users/me')
        // .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
})


test('Upload avatar img Test', async ()=> {
  await request(app)
        .post('/users/me/avatar')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)
        const user =  await User.findById(userOneId)
        //Check type is a buffer
        expect(user.avatar).toEqual(expect.any(Buffer)) //any Buffer
})


test('Update valid user field', async ()=> {
  await request(app)
        .patch('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({
          name: "WAHBA"
        })
        .expect(200)
        //check user name is set WAHBAAA
        const user =  await User.findById(userOneId)
        expect(user.name).toBe('WAHBA')
})


test('NOT Update invalid user field', async ()=> {
  await request(app)
        .patch('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({
          notname: "NOT-WAHBAAA"
        })
        .expect(400)
})

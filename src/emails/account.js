const sgMail = require('@sendgrid/mail')


//const sendgridAPIKey = 'xxxxxxxxxxxxxx' getting from config/dev.env
const sendgridAPIKey = process.env.SENDGRID_API_KEY
sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (email, name) => {
  // console.log(sendgridAPIKey);

  sgMail.send({
    to: email,
    from: 'myemail@gmail.com',
    subject: 'Thanks and Welcome !',
    text: `Hello ${name} welcome to the Application`
  })
}


const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'myemail@gmail.com',
    subject: 'Whyyyyyyy :( ?!',
    text: `Good bye ${name}, hope to see you again! `
  })
}


module.exports = {
  sendWelcomeEmail: sendWelcomeEmail,
  sendCancelEmail
}

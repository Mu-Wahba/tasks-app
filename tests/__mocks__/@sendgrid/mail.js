//we are going to mock sendgrid functioality here to not send emails or so in testing const sgMail = require('@sendgrid/mail')
//sendgrid would stop sending emails to save the usage and not overload email account
module.exports = {
    setApiKey(){

    },
    send(){

    }
}

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: '72c7ba171fb1d3',
        pass: '1b72d061384510'
    }
});

var mailOptions = {
    from: 'pvrtech2014@gmail.com',
    to: 'jain.veerbahadur@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
};


module.exports = {
    sendMail: () => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}

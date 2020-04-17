var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');

// var transporter = nodemailer.createTransport({
//     host: "smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//         user: '72c7ba171fb1d3',
//         pass: '1b72d061384510'
//     }
// });

// var mailOptions = {
//     from: 'pvrtech2014@gmail.com',
//     to: 'jain.veerbahadur@gmail.com',
//     subject: 'Sending Email using Node.js',
//     text: 'That was easy!'
// };

// let testAccount = nodemailer.createTestAccount();



// var transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true,
//     auth: {
//         user: 'pvrtech2014@gmail.com',
//         pass: 'PVRtech@2014'
//     }
// });

// var smtpTransport = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//         user: "pvrtech2014@gmail.com",
//         clientId: "968914822814-aagbim952s74so2dh35f8a9ph8r0gt5l.apps.googleusercontent.com",
//         clientSecret: "E2xk1dH7bZbJXDHc07sZSAoY",
//         refreshToken: "1//04bhjbjSRZumgCgYIARAAGAQSNwF-L9IrT7RpXiYqMSb522F5qSL7djZ1yGi64naohbsqwNjndUdnNBRfXFpCHJffQ-5WEB8r3qI"
//     }
// });


// var mailOptions = {
//     from: 'pvrtech2014@gmail.com',
//     to: 'jain.veerbahadur@gmail.com',
//     subject: 'Sending Email using Node.js',
//     text: 'That was easy!'
// };


// module.exports = {
//     sendMail: () => {
//         let nodemailerTransporter = nodemailer.createTransport({
//             host: "smtp.ethereal.email",
//             port: 587,
//             secure: false, // true for 465, false for other ports
//             auth: {
//                 user: testAccount.user, // generated ethereal user
//                 pass: testAccount.pass // generated ethereal password
//             }
//         });

//         nodemailerTransporter.sendMail(mailOptions, function (error, info) {
//             if (error) {
//                 console.log(error);
//             } else {
//                 console.log('Email sent: ' + info.response);
//             }
//         });
//     }
// }

//Approach with less secure - Temporary


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pvrtech2014@gmail.com',
        pass: 'PVRtech@2014'
    }
});

module.exports = {
    sendMail: function (user) {
        try {
            const emailToken = jwt.sign({
                user: user.id
            }, "EMAIL_SECRET",
                {
                    expiresIn: '1d'
                });

            const url = `http://localhost:9090/verify-email/${emailToken}`;
            console.log(url);

            var mailOptions = {
                from: 'pvrtech2014@gmail.com',
                to: user.local.email,
                subject: 'Confirm email',
                text: `Please click this link to confirm your email: <a href="${url}">${url}</a>`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    user.local.emailVerified = true;
                    console.log("Email send: " + info.response);
                }
            })
        } catch (e) {
            console.log(e)
        }

        return user;
    }
}
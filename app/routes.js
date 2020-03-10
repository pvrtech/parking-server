var Parking = require('../app/models/parking');
var CarDetails = require('../app/models/cardetails');
var User = require('../app/models/user');
var Mailer = require('../app/mailer');

module.exports = function (app, passport, jwt) {
    // normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function (req, res) {
        res.send('No API specified');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function (req, res) {
        res.send({
            user: req.user
        });
    });

    // PARING SECTION =======================
    app.get('/parking-list', isLoggedIn, function (req, res) {
        Parking.find({ userid: req.user._id }, function (err, parking) {
            if (err)
                return next();
            res.send({
                parking
            })
        });
    });

    app.post('/add-parking', isLoggedIn, function (req, res) {
        var newparking = new Parking({ name: req.body.name, type: req.body.type, userid: req.user._id, location: req.body.location });
        newparking.save(function (err) {
            if (err)
                return next();
            res.send({
                success: true
            })
        });
    });

    app.delete('/delete-parking', isLoggedIn, function (req, res) {
        Parking.delete({ userid: req.user._id }, function (err, parking) {
            if (err)
                return next();
            res.send({
                parkings: parking
            })
        });
    });

    app.post('/update-parking', function (req, res) {
        res.send("API not yet implemented!!");
    });

    app.post('/search-parking', function (req, res) {
        res.send("API not yet implemented!!");
    });

    app.post('/book-parking', function (req, res) {
        res.send("API not yet implemented!!");
    });

    app.post('/cancel-parking', function (req, res) {
        res.send("API not yet implemented!!");
    });

    app.get('/api-list', function (req, res) {
        res.json({
            "login": "post",
            "login-otp": "post",
            "generate-otp": "post",
            "signup": "post",
            "parking-list": "get",
            "add-parking": "post",
            "delete-parking": "delete",
            "update-parking": "post",
            "search-parking": "post",
            "book-parking": "post",
            "cancel-parking": "post",
            "check-mobile": "post",
            "verify-mobile": "post",
            "check-email": "post",
            "verify-email": "post"
        })
    });

    // LOGOUT ==============================
    app.get('/logout', isLoggedIn, function (req, res) {
        req.logout();
        req.session.destroy(function (err) {
            res.send('You are logged out!');
            // res.render('/'); //Inside a callback… bulletproof!
        });
        // res.send('You are logged out!');
    });

    // VERIFY MOBILE NUMBER =================
    app.post('/check-mobile', function (req, res) {
        let mobileNo = req.body.mobileNo;
        User.find({ "local.mobileNo": mobileNo }, function (err, user) {
            if (err)
                return next();

            if (user && user.length > 0) {
                res.send({
                    error: true,
                    errorMsg: "Phone number already registered!"
                })
            } else {
                res.send({
                    success: true
                })
            }
        });
    });

    app.post('/verify-mobile', function (req, res) {
        res.send("API not yet implemented!!");
    });

    // VERIFY EMAIL =================
    app.post('/check-email', function (req, res) {
        let email = req.body.email;
        User.find({ "local.email": email }, function (err, user) {
            if (err)
                return next();

            if (user && user.length > 0) {
                res.send({
                    error: true,
                    errorMsg: "Email already registered!"
                })
            } else {
                res.send({
                    success: true
                })
            }
        });
    });

    app.get('/verify-email', function (req, res) {
        Mailer.sendMail();
        // send email link which will further process the verification
        res.send("API not yet implemented!!");
    });

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // locally --------------------------------
    // LOGIN ===============================
    // show the login form
    app.get('/login', function (req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', { session: true }), loginSuccess, function (req, res) {
        res.send("Something is wrong!!");
    });

    // process the login form via OTP
    app.post('/login-otp', function (req, res) {
        res.send("API not yet implemented!!");
    });

    // generate and send the OTP
    app.post('/generate-otp', function (req, res) {
        res.send("API not yet implemented!!");
    });

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function (req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup'), function (req, res) {
        res.json({ id: req.user.id, username: req.user.username });
    });

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // locally --------------------------------
    app.get('/connect/local', function (req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function (req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function (err) {
            res.render('/profile');
        });
    });

    function loginSuccess(req, res, next) {
        // if user is found and password is right
        // create a token
        var token = jwt.sign(req.user, app.get('superSecret'), {
            expiresInMinutes: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
        });
    }
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.send("You are not authorized");
}

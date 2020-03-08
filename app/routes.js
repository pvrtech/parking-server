var Parking = require('../app/models/parking');
var DressCombo = require('../app/models/dressCombo');
var RecentDress = require('../app/models/recentDress');
var User = require('../app/models/user');

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

    // DRESS SECTION =======================
    app.get('/parking', isLoggedIn, function (req, res) {
        Parking.find({ userid: req.user._id }, function (err, parking) {
            if (err)
                return next();
            res.send({
                parkings: parking
            })
        });
    });

    app.post('/parking', isLoggedIn, function (req, res) {
        var newparking = new Parking({ name: req.body.name, type: req.body.type, userid: req.body.userid, location: req.body.location });
        newparking.save(function (err) {
            if (err)
                return next();
            res.send({
                parking: "added"
            })
        });
    });

    app.delete('/parking', isLoggedIn, function (req, res) {
        Parking.delete({ userid: req.user._id }, function (err, parking) {
            if (err)
                return next();
            res.send({
                parkings: parking
            })
        });
    });

    app.post('/selectdress', isLoggedIn, function (req, res) {
        var today = new Date();
        var newdress = new RecentDress({ userid: req.body.userid, dressid: req.body.dressid, comboid: req.body.comboid, events: req.body.events, lastweardate: today });
        newdress.save(function (err) {
            if (err)
                return next();
            res.send({
                dress: "added"
            })
        });
    });

    app.post('/createcombo', isLoggedIn, function (req, res) {
        var today = new Date();
        var newdress = new DressCombo({ userid: req.body.userid, dressid: req.body.dressid, comboid: req.body.comboid, events: req.body.events, type: req.body.type });
        newdress.save(function (err) {
            if (err)
                return next();
            res.send({
                dress: "added"
            })
        });
    })

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
    app.post('/verify/mobile', function (req, res) {
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
    })

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
    }
        //failureFlash : true // allow flash messages
    );

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function (req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup'), function (req, res) {
        res.json({ id: req.user.id, username: req.user.username });
    });

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter', { scope: 'email' }));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));


    // google ---------------------------------

    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

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

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope: 'email' }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', { scope: 'email' }));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));


    // google ---------------------------------

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
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

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function (req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function (err) {
            res.render('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function (req, res) {
        var user = req.user;
        user.twitter.token = undefined;
        user.save(function (err) {
            res.render('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function (req, res) {
        var user = req.user;
        user.google.token = undefined;
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

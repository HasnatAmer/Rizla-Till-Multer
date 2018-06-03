var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var passport = require('passport');




const mongoose = require('mongoose');
// Load Idea Model
var Idea = require('../model/vid');

//Load userdata model
var usermodel = require('../model/userdata');
//Load passport.js file
var passporta = require('../config/passport')(passport);




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'PARWAAZ' });
});

/* GET home page. */
router.get('/add', function(req, res, next) {

    res.render('add', { title: 'Express' });
});
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'PARWAAZ' });
});


router.post('/added', function(req, res, next) {
//validations
    errors=[];
    if(!req.body.title) { errors.push({text:"Title Error, Please enter  valid title"});}

    if(!req.body.details){errors.push({text:"Details Error, Please enter valid details"});}

    if(errors.length>0)
    {
        res.render('add',{errors:errors , title:req.body.title , details:req.body.details});

    }
    else {

        var v = new Idea;
        console.log(req.body);
        v.titl=req.body.title;
        v.detail=req.body.details;
        v.save();
        res.redirect('/idea'); }
});

router.get('/idea',function(req,res,next)
{
    Idea.find().then(function(Idea1) {
        res.render('idea',{ideas:Idea1});
    });

});

router.get('/delete/:id', function(req, res, next) {
    var id = req.params.id;
    Idea.findOneAndRemove({_id:id}).then(function (err)  {

        if(err)
        {
            console.log(err);
            req.flash('success_msg','IdeaEO HAS REMOVED');
            res.redirect('/idea');
        }
        else {
            // console.log(doc);

            res.render('/');
        }
    })
});
router.get('/edit/:id', function(req, res, next) {
    var id = req.params.id;
    Idea.findOne({_id:id}).then(function (doc,err)  {

        if(err)
        {
            // console.log(err);

            res.redirect('/');
        }
        else {
            // console.log(doc);
            res.render('edit', {s: doc});
        }
    })
});

//edit process
router.post('/edited/:id',function(req,res,next)
{

    Idea.findOne({
        _id: req.params.id
    })
        .then(function(idea ) {
            // new values
            idea.titl = req.body.title;
            idea.detail = req.body.details;

            idea.save()
                .then(function(idea ) {
                    res.redirect('/idea');
                })
        });
});

//Login Router

router.get('/registration',function(req,res,next)
{
    res.render('registration');
});

// Register Validations, flashing when click on submit
router.post('/register', function(req,res,next) {
        // console.log(req.body);
        // res.send('User has been registered');
  var errors2 = [];
    if(req.body.password != req.body.password2){
        errors2.push({text:'Passwords do not match'});
    }

    if(req.body.password.length < 4){
        errors2.push({text:'Password must be at least 4 characters'});
    }

    if(errors2.length > 0) {
        errors2.push({text:'Number of errors greater than 0 '});
        req.flash('errors2',errors2);
        res.render('registration', {

            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            password2: req.body.password2
        });
    }
    else {
        usermodel.findOne({email: req.body.email})
            .then(function(user) {
            if(user){
                req.flash('error_msg', 'Email already regsitered');
                res.redirect('login');
            } else {
                const newUser = new usermodel({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newUser.password, salt, function(err, hash)  {
            if(err) throw err;
        newUser.password = hash;
        newUser.save()
            .then(function(user) {
            req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('login');
    })
    .catch(function(err) {
            console.log(err);
        return;
    });
    });
    });
    }
    });
    }
});

router.get('/login',function(req,res,next)
{
    res.render('login');
    // Idea.find().then(function(Idea1) {
    //     res.render('idea',{ideas:Idea1});
    // });

});

router.post('/loggedin',function(req,res,next)
{
  // res.send('USER HAS LOOGED IN');
        passport.authenticate('local', {
        successRedirect:'/idea',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});
router.get('/logout',function(req,res,next){
    req.logout();
    req.flash('success_msg','LOGGED OUT');
    res.redirect('login');
});


module.exports = router;

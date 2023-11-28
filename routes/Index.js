// Login and Logout Functionality
const express = require('express');
const router = express.Router();
const userDB = require('../models/userModel');
const taskModel = require('../models/taskModel');
const access = require('../middleware/access');
const bcrypt = require('bcryptjs');

// GET LOGIN PAGE
router.get('/login', access.givePermission, async (req, res) => {
    res.render('all/login');
})


router.get('/home', (req, res) => {
    res.render('all/home');
})

// POST LOGIN
router.post('/login', access.givePermission, async (req, res) => {

    let errz = [];

    try {
        let currentUser = await userDB.findOne({ username: req.body.username });
        if (currentUser == null) {
            errz.push('User not valid.');
            res.render('all/login',
                {
                    errors: errz
                })
        }
        else if (currentUser.username == null) {
            errz.push(`${req.body.username} not found.`);
            res.render('all/login',
                {
                    errors: errz
                })
        }
        else {
            const { password } = currentUser;
            const checkPass = await bcrypt.compareSync(req.body.password, password); // checking if typed password == password already present

            if (checkPass) {
                // So if the passwords match, create session
                req.body.user = currentUser;

                // NUMBER 1 STEP
                req.session.user = currentUser;
                req.session.userLogin = currentUser._id;
            }
            else {
                console.log(checkPass);
                errz.push('Password is incorrect');
                console.log(req.body.password);
                console.log(errz);
                res.render('all/login',
                    {
                        errors: errz
                    })
            }
        }

        // after everuthing else is true, then redirect to dashboard
        if (errz.length == 0) {
            res.redirect('/dashboard');
            console.log(req.session);
        }

    } catch (err) {
        res.json({ err: err.message });
    }

})


router.get('/dashboard', access.redirectUser, async (req, res) => {
    try {
        // Getting the tasks based on the user thats logged in
        const userTasks = await taskModel.find({ users: req.session.userLogin }).lean();
        console.log(`User Tasks: ${userTasks}`);
        userTasks.forEach((each) => {
            console.log(each);
        })
        res.render('all/dashboard', {
            tasks: userTasks
        })
    } catch (error) {
        res.json(error);
    }

})

// CLICKING LOGOUT
router.get('/logout', access.redirectUser, (req, res) => {
    req.session.destroy();
    res.redirect('/login');
})

// Get add task page
router.get('/addTask', access.redirectUser, (req, res) => {
    res.render('all/addTask');
})


module.exports = router;
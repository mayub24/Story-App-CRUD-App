const express = require('express');
const router = express.Router();
const userDB = require('../models/userModel');
const taskModel = require('../models/taskModel');
const access = require('../middleware/access');
const bcrypt = require('bcryptjs');

// Express validator
const { check, validationResult } = require('express-validator');

// GET ALL USERS
// GET
router.get('/register', access.givePermission, async (req, res) => {
    res.render('all/register');
})


// Get users based on whos logged in
router.get('/userInfo', access.redirectUser, async (req, res) => {
    try {
        // const userTasks = await taskModel.find({ users: req.session.userLogin }).lean();
        let loggedUser = await taskModel.findOne({ users: req.session.userLogin })
            .populate('users')
            .lean();
        console.log(loggedUser.users);
        res.render('all/userInfo',
            {
                userInfo: loggedUser.users
            })
    } catch (error) {
        console.log(error);
    }
})


// GET SINGLE USER
// GET
router.get('/:id', access.redirectUser, async (req, res) => {
    try {
        let singleUser = await userDB.findById(req.params.id).lean();
        console.log(singleUser);
        res.render('all/userInfo',
            {
                userInfo: singleUser
            })
    } catch (err) {
        res.json({ err: err.message });
    }
})


// ADD USER TO DATABASE
// POST
router.post('/',
    [
        check('username', 'Username is required').not().isEmpty(), // pass when username is not empty
        check('email', 'Email format must be followed').isEmail(), // pass when email is email format
        check('password', 'Password must be minimum 8 characters').isLength({ min: 8 }),
        check('password', 'Password must be less than 16 characters').isLength({ max: 16 })
    ]
    , async (req, res) => {

        let errz = [];

        const errs = validationResult(req);

        if (!errs.isEmpty()) {
            res.render('all/register', {
                errors: errs.errors
            })
        }
        else {

            const { email, username } = req.body;

            try {
                let user = await userDB.findOne({ email });
                let userName = await userDB.findOne({ username });
    
                if (user || userName) {
                    errz.push('User already exists.');
                    console.log(errz);
                    res.render('all/register', {
                        userError: errz
                    })
                }
                else {


                    const newUser = new userDB({
                        username: req.body.username,
                        email: req.body.email,
                        password: req.body.password
                    })

                    // Bcrypt to hash password
                    let salt = await bcrypt.genSalt(10);
                    let hash = await bcrypt.hashSync(newUser.password, salt);
                    newUser.password = hash;

                    // res.json(newUser);

                    user = await newUser.save();

                    if (user) {
                        if (req.files == null) { // if no profile photo is selected,
                            user = await user.save();
                            res.redirect('/login');
                        }
                        else {
                            await req.files.pic.mv(`./public/imgs/${req.files.pic.name}`);
                            user.profilePic = req.files.pic.name;
                            user = await user.save();
                            res.redirect('/login');
                        }
                    }
                    else {
                        res.json('error');
                    }
                }

            } catch (err) {
                console.log(`Erorrs: ${err}`);
                res.render('all/register', {
                    errz: errs
                })
            }

        }

    })


// UPDATE USER INFO
// PUT
router.put('/edit/:id', access.redirectUser,
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Email format must be followed').isEmail(),
    check('password', 'Password must be minimum 8 characters').isLength({ min: 8 })
    ,
    async (req, res) => {

        const errs = validationResult(req);

        let updateUser = await userDB.findById(req.params.id).lean();

        if (!errs.isEmpty()) {
            console.log(errs);
            res.render('all/editUser', {
                errors: errs.errors,
                userInfo: updateUser
            })
        }
        else {

            try {
                if (req.files == null) { // if no profile photo is selected,

                    // Bcrypt to hash password
                    let salt = await bcrypt.genSalt(10);
                    let hash = await bcrypt.hashSync(req.body.password, salt);
                    req.body.password = hash;

                    let updateUser = await userDB.updateOne(
                        { _id: req.params.id }, req.body);

                    console.log(updateUser);
                }
                else {
                    req.files.pic.mv(`./public/imgs/${req.files.pic.name}`);
                    let updateUser = await userDB.updateOne(
                        { _id: req.params.id },
                        { $set: { profilePic: req.files.pic.name } });
                    console.log(updateUser);
                }
                res.redirect(`/users/${req.params.id}`);

            } catch (error) {
                res.json({ err: error.message });
            }

        }
    })



router.delete('/:id', async (req, res) => {
    try {
        let delUser = await userDB.findByIdAndDelete(req.params.id);
        let tasksAssociatedWithUser = await taskModel.deleteMany({ users: req.params.id }); // delete that user whos id is passed in
        console.log(delUser);
        res.json(delUser);
        console.log(tasksAssociatedWithUser);
        // console.log(`User id: ${req.params.id} has been deleted.`);
    } catch (err) {
        res.json({ err: err.message });
    }
})

// Get edit page for edititng user
router.get('/edit/:id', access.redirectUser, async (req, res) => {
    try {
        let editUser = await userDB.findById(req.params.id).lean();
        console.log(editUser);
        res.render('all/editUser',
            {
                editUserInfo: editUser
            })
    } catch (error) {
        console.log(error);
    }
})


// Posting edit page for editing user
router.post

module.exports = router;
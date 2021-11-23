const express = require('express');
const router = express.Router();
const taskModel = require('../models/taskModel');
const userModel = require('../models/userModel');
const access = require('../middleware/access');
const { check, validationResult } = require('express-validator');

// GET ALL TASKS
// GET
router.get('/', access.redirectUser, async (req, res) => {
    // When we get all tasks, we populate the usermodel with the task schema
    try {
        // let allTasks = await taskModel.findById({ _id: { $ne: [ObjectId(req.session.userLogin)] } })
        //     .populate('users') // the purpose of this is that we know which user has which tasks
        //     .lean();

        let allTasks = await taskModel.find(
            {
                users: { $ne: req.session.userLogin },
                privacy: "public"
            }

        )
            .populate('users')
            .lean();

        console.log(allTasks);

        let currentUserTasks = await taskModel.find({ users: req.session.userLogin, privacy: "public" }).lean();

        console.log(currentUserTasks);

        res.render('all/allTasks',
            {
                tasks: allTasks,
                currentTask: currentUserTasks
            })

    } catch (err) {
        console.log(err);
        res.json(err);
    }
})


// GET SINGLE TASK
// GET
router.get('/:id', access.redirectUser, async (req, res) => {
    try {
        let singleTask = await taskModel.findById(req.params.id).
            populate('users')
            .lean();
        console.log(singleTask);
        res.render('all/singleTask',
            {
                oneTask: singleTask
            })
    } catch (err) {
        console.log(err);
    }
})


// ADD TASK
// POST
router.post('/',
    [
        check('title', 'Title is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty()
    ]
    ,
    async (req, res) => {

        const errs = validationResult(req);
        if (!errs.isEmpty()) {
            res.render('all/addTask', {
                errors: errs.errors
            })
        }
        else {


            try {
                // NUMBER 2 STEP
                // Making the users property inside task Model = req.session.userLogin which is the ID for the user logged in
                req.body.users = req.session.userLogin;
                await taskModel.create(req.body);
                res.redirect('/dashboard');
            } catch (err) {
                res.json({ err: err.message });
            }
        }
    })


// Get EDIT TASK PAGE
router.get('/edit/:id', access.redirectUser, async (req, res) => {
    try {
        let singleTask = await taskModel.findById(req.params.id).lean();
        if (!singleTask) {
            res.redirect('/dashboard');
        }
        else {
            res.render('all/editTask', {
                task: singleTask
            })
        }
    } catch (err) {
        res.json({ err: err.message });
    }
})


// UPDATE TASK
// PUT
router.put('/edit/:id',
    [
        check('title', 'Title is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty()
    ],
    async (req, res) => {

        let singleTask = await taskModel.findById(req.params.id).lean();

        const errs = validationResult(req);
        if (!errs.isEmpty()) {
            res.render('all/editTask', {
                errors: errs.errors,
                task: singleTask
            })
        }
        else {
            try {
                let updateTask = await taskModel.findByIdAndUpdate(req.params.id, req.body);
                console.log(`Task has been updated!: ${updateTask}`);
                res.redirect('/dashboard');
            } catch (err) {
                res.json({ err: err.message });
            }
        }
    })


// DELETE TASK
// DELETE
router.delete('/delete/:id', async (req, res) => {
    try {
        let deleteTask = await taskModel.findByIdAndDelete(req.params.id);
        console.log(deleteTask);
        res.redirect('/dashboard');
    } catch (err) {
        res.json({ err: err.message });
    }
})



module.exports = router;
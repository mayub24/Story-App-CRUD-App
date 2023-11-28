const express = require('express');
const dotenv = require('dotenv');
const userRouter = require('./routes/Users');
const taskRouter = require('./routes/Tasks');
const otherRouters = require('./routes/Index');
const path = require('path');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
dotenv.config({ path: './config/keys.env' }); // passing the path for the env file is a MUST
// Method Override
const methodOverride = require('method-override');
// Express session
const session = require('express-session');
const { shortenPassword, formatDate, shortenDescription, checkEquality, select } = require('./helpers/hbs');

const TWO_HOURS = 1000 * 60 * 60;
const SESSION_NAME = 'sid';
const SESSION_SECRET = 'shhh';

const app = express();

// Connecting file upload to express
app.use(fileUpload());

// Replacement of bodyParser
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));

// Method override to perform PUT and DELETE
app.use(methodOverride('_method'));


// Connecting session to express
app.use(session({
    name: SESSION_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESSION_SECRET,
    cookie: {
        maxAge: TWO_HOURS,
        sameSite: true,
    }
}))

// Session Middleware
// Adding session middleware
app.use((req, res, next) => {
    res.locals.userInfo = req.session.user;
    res.locals.user = req.session.userLogin; // this means that user variable can be used anywhere now
    next();
})

// Import handlebars
const exphbs = require('express-handlebars');

// Connect DB
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://suhaib:123@cluster0.ea6epjs.mongodb.net/?retryWrites=true&w=majority');
        console.log('Connected to database...');
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
}

connectDB();


// Connecting routes
app.use('/', otherRouters);
app.use('/users', userRouter);
app.use('/tasks', taskRouter);


// Getting routes from userRouter
app.get('/', (req, res) => {
    res.redirect('/login');
})


// Connect handlebars as template engine
app.engine('.hbs',
    exphbs({
        helpers: { shortenPassword, formatDate, shortenDescription, checkEquality, select },
        defaultLayout: 'main', extname: '.hbs'
    }));

app.set('view engine', '.hbs');

// Static folder
app.use(express.static(path.join(__dirname, 'public')));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Listening on PORT: ${PORT}...`);
})

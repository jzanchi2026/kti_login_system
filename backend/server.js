if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const mysql = require('mysql-await')

console.log(process.env.MYSQL_DATABASE)

var db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: '3306',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

const initializePassport = require('./passport-config')
initializePassport(passport,
    email = async (email) => {
        //users.find(user => user.email === email)
        let sql = 'SELECT * FROM users WHERE email = ?';
        let user = await db.awaitQuery(sql, [email]);
        console.log(user);
        return user[0];
    },
    id = async (id) => {
        //users.find(user => user.email === email)
        let sql = 'SELECT * FROM users WHERE id = ?';
        let user = await db.awaitQuery(sql, [id]);
        return user[0];
    }
)

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.get('/aproval', async (req, res) => {
    let sql = 'SELECT * FROM aproval';
    let users = await db.awaitQuery(sql);

    res.render('aproval.ejs', {users: JSON.stringify(users)});
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        let sql = 'INSERT INTO aproval SET ?';
        let user = {
            userid: Date.now().toString(),
            displayName: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        };

        db.query(sql, user, (error, result) => {
            if (error) throw error;
        });

        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3000)
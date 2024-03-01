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

//my libraries
const tools = require("./libraries/tools.js")

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
        let sql = 'SELECT * FROM users WHERE email = ? AND userType >= 1';
        let user = await db.awaitQuery(sql, [email]);
        console.log("User: " + JSON.stringify(user[0]));
        return user[0];
    },
    id = async (id) => {
        //users.find(user => user.email === email)
        let sql = 'SELECT * FROM users WHERE userid = ?';
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
    console.log("body user" + req.body.user);
    console.log("req user" + req.user);

    res.render('index.ejs', { name: req.user.displayName })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/test2', async (req, res) => {
    let id = req.body.id;

    console.log(id);

    res.end(200);
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})
app.get('/addTool', checkAdmin, (req, res) => {
    res.render('addTool.ejs')
})
app.get('/tools', checkAuthenticated, async (req, res) => {
    let sql = 'SELECT toolName, toolTypeId from tool';
    let tools = await db.awaitQuery(sql);
    res.render('tools.ejs', {
        tools: tools,
        admin: req.body.userType > 1
    })
})

app.get('/tool', checkAuthenticated, async (req, res) => {
    let sql = 'SELECT toolName FROM tool WHERE toolTypeId = ?';

    let toolName = await db.awaitQuery(sql, req.query.id);
    if (toolName.length < 1) {
        res.redirect("/tools")
    } else {
        res.render('tool.ejs', {
            name: toolName[0].toolName,
            admin: req.body.userType > 1
        })
    }
})

app.get('/approval', checkNotAuthenticated, async (req, res) => {
    let sql = 'SELECT * FROM users WHERE userType = 0';
    let users = await db.awaitQuery(sql);

    res.render('approval.ejs', { users: users });
})

app.post('/addTool/', async (req, res) => {
    let id = req.body;

    console.log(JSON.stringify(req.body));
    let sql = "INSERT INTO tool SET ?"
    let tool = {
        toolName: req.body.toolName,
        amount: 0
    }

    db.query(sql, tool, (error, result) => {
        if (error) throw error;
    });

    res.redirect("/tools");
})

app.post('/approval/', async (req, res) => {
    let id = req.body.aproveid;

    console.log(id);

    let sql = 'UPDATE users SET userType = 1 WHERE userid = ?';
    db.query(sql, id, (error, result) => {
        if (error) throw error;
    });

    res.redirect("/approval");
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        let sql = 'INSERT INTO users SET ?';
        let user = {
            userid: Date.now().toString(),
            displayName: req.body.name,
            email: req.body.email,
            hashPass: hashedPassword,
            userType: 0,
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
function checkAdmin(req, res, next) {
    if (req.isAuthenticated() && req.body.userType >= 2) {
        return next()
    }

    res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3000)
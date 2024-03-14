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
const { Pool } = require('pg');

console.log(process.env.MYSQL_DATABASE)
const pool = new Pool({
    host: "ktprog.com",
    port: '1433',
    user: "ktinventory",
    password: "Keefe!2024!Invent",
    database: "ktinventory",
    max: 20,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 5000,
});

const initializePassport = require('./passport-config')
initializePassport(passport,
    email = async (email) => {
        let db = await pool.connect();
        //users.find(user => user.email === email)
        let sql = 'SELECT * FROM users WHERE email = ? AND userType > 0';
        let user = await db.awaitQuery(sql, [email]);
        console.log("User: " + JSON.stringify(user[0]));
        db.release()
        return user[0];
    },
    id = async (id) => {
        let db = await pool.connect();
        //users.find(user => user.email === email)
        let sql = 'SELECT * FROM users WHERE userid = ?';
        let user = await db.awaitQuery(sql, [id]);
        db.release()
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

app.get('/viewAdmins', checkAdmin, async (req, res) => {
    let db = await pool.connect();
    let sql = 'SELECT displayName FROM users WHERE userType = 2';
    let admins = await db.awaitQuery(sql);
    db.release();
    res.render('viewAdmins.ejs', {
        admins: admins
    });
})

app.get('/addTool', checkAdmin, (req, res) => {
    res.render('addTool.ejs')
})
app.get('/addMaterial', checkAdmin, (req, res) => {
    res.render('addMaterial.ejs')
})
app.get('/tools', checkAuthenticated, async (req, res) => {
    let sql = 'SELECT toolName, toolTypeId from tool';
    let tools = await db.awaitQuery(sql);
    res.render('tools.ejs', {
        tools: tools,
        admin: req.user.userType > 1
    })
})
app.get('/materials', checkAuthenticated, async (req, res) => {
    let db = await pool.connect();
    let sql = 'SELECT materialName, materialId from material';
    let materials = await db.awaitQuery(sql);
    db.release();
    res.render('materials.ejs', {
        materials: materials,
        admin: req.user.userType > 1
    })
})

app.get('/tool', checkAuthenticated, async (req, res) => {
    let db = await pool.connect();
    let sql = 'SELECT toolName FROM tool WHERE toolTypeId = ?';

    let toolName = await db.awaitQuery(sql, req.query.id);
    db.release();
    if (toolName.length < 1) {
        res.redirect("/tools")
    } else {
        res.render('tool.ejs', {
            name: toolName[0].toolName,
            admin: req.user.userType > 1
        })
    }
})

app.get('/material', checkAuthenticated, async (req, res) => {
    let db = await pool.connect();
    let sql = 'SELECT materialName FROM material WHERE materialId = ?';

    let materialName = await db.awaitQuery(sql, req.query.id);
    db.release();
    if (materialName.length < 1) {
        res.redirect("/materials")
    } else {
        res.render('material.ejs', {
            name: materialName[0].materialName,
            admin: req.user.userType > 1
        })
    }
})

app.get('/approval', checkNotAuthenticated, async (req, res) => {
    var db = mysql.createConnection({
        host: "http://www.ktprog.com",
        port: '1433',
        user: "ktinventory",
        password: "Keefe!2024!Invent",
        database: "ktinventory",
    });
    let sql = 'SELECT * FROM users WHERE userType = 0';
    let users = await db.awaitQuery(sql);
    db.release();

    res.render('approval.ejs', { users: users });
})


app.get('/users', async (req, res) => {
    let db = await pool.connect();
    let sql = 'SELECT * FROM users';
    let users = await db.awaitQuery(sql);
    db.release();

    res.render('users.ejs', { users: users, admin: false });
})

app.post('/addTool/', async (req, res) => {
    let sql = "INSERT INTO tool SET ?"
    let tool = {
        toolName: req.body.toolName
    }
    let db = await pool.connect();
    db.query(sql, tool, (error, result) => {
        if (error) throw error;
    });
    db.release();

    res.redirect("/tools");
})

app.post('/addMaterial/', async (req, res) => {
    let sql = "INSERT INTO material SET ?"
    let material = {
        materialName: req.body.materialName,
        amount: 0
    }

    let db = await pool.connect();
    db.query(sql, material, (error, result) => {
        if (error) throw error;
    });

    res.redirect("/materials");
})

app.post('/approval/', async (req, res) => {
    let id = req.body.aproveid;

    console.log(id);

    let sql = 'UPDATE users SET userType = 1 WHERE userid = ?';
    let db = await pool.connect();
    db.query(sql, id, (error, result) => {
        if (error) throw error;
    });
    db.release()
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

        let db = await pool.connect();
        db.query(sql, user, (error, result) => {
            if (error) throw error;
        });
        db.release()

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
    if (req.isAuthenticated() && req.user.userType >= 2) {
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
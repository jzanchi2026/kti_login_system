if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const routes = require('./util.js')
var cors = require('cors')
require("./demo.js");
const passport = require("./account.js").passport;
require("./tools.js");
const pool = routes.pool;

console.log(process.env.MYSQL_DATABASE)

const initializePassport = require('./passport-config')
initializePassport(passport,
    email = async (email) => {
        let db = await pool.awaitGetConnection();
        //users.find(user => user.email === email)
        let sql = 'SELECT * FROM users WHERE email = ? AND userType > 0';
        let user = await db.awaitQuery(sql, [email]);
        console.log("User: " + JSON.stringify(user[0]));
        db.release()
        return user[0];
    },
    id = async (id) => {
        let db = await pool.awaitGetConnection();
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
app.use(cors())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use('/', routes.router)





// API Implementation

// Tools



// End Individual Tools

// Materials

// End Materials

// Account

// End Account

// End API Implementation








app.listen(3000)

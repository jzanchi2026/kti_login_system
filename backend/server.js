if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const routes = require('./util.js')
var cors = require('cors')

require("./demo.js");
const passport = require("./account.js").passport;
require("./tools.js");
require("./materials.js");
require("./barcode.js");
const pool = routes.pool;

const initializePassport = require('./passport-config')
initializePassport(passport,
    email = async (email) => {
        let db = await pool.awaitGetConnection();
        //users.find(user => user.email === email)
        let sql = 'SELECT * FROM users WHERE email = ? AND userType > 0';
        let user = await db.awaitQuery(sql, [email]);
        db.release()
        return user[0];
    },
    id = async (id) => {
        let db = await pool.awaitGetConnection();
        //users.find(user => user.email === email)
        let sql = 'SELECT * FROM users WHERE userId = ?';
        let user = await db.awaitQuery(sql, [id]);
        db.release()
        return user[0];
    }
)
app.set('view-engine', 'ejs')
app.set('trust proxy', true);
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(flash())

const corsOptions = {
    origin: "https://gabe123545.github.io", 
    credentials: true,
};
app.use(cors(corsOptions));
// app.use(cors())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { sameSite: 'none', secure: true }, 
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use('/', routes.router)

process.on('uncaughtException', function (err) {
    console.log(err);
}); 
 
let server = app.listen(3000);
module.exports = { server, app }
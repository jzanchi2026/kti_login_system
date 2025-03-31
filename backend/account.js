const routes = require('./util.js')
const passport = require('passport')
const pool = routes.pool;

routes.router.post('/approval/', routes.checkAdmin, async (req, res) => {
  let id = req.body.aproveid;

  console.log(id);

  let sql = 'UPDATE users SET userType = 1 WHERE userid = ?';
  let db = await pool.awaitGetConnection();
  db.query(sql, id, (error, result) => {
      if (error) throw error;
  });
  db.release()
  res.redirect("/approval");
})

routes.router.post('/register', routes.checkNotAuthenticated, async (req, res) => {
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

      let db = await pool.awaitGetConnection();
      db.query(sql, user, (error, result) => {
          if (error) throw error;
      });
      db.release()

      res.redirect('/login')
  } catch {
      res.redirect('/register')
  }
})

routes.router.get('/logout', routes.checkAuthenticated, async (req, res) => {
  req.logOut((err) => {
      if (err) {
          return next(err);
      }
      res.redirect('/login');
  });
});

routes.router.delete('/logout', (req, res, next) => {
  res.append("Access-Control-Allow-Origin", "*");
  req.logOut((err) => {
      if (err) {
          return next(err);
      }
      res.redirect('/login');
  });
});

routes.router.post('/login', routes.checkNotAuthenticated, (req, res) => {
  console.log(req.body.email);
  return passport.authenticate('local', {
    successRedirect: /*'/'*/'/loginInfo',
    failureRedirect: '/loginApiFailure',
    failureFlash: true
})(req, res)});

routes.router.get('/loginInfo', routes.checkAuthenticated, (req, res) => { 
  res.send({
      login: true,
      userid: req.user.userid,
      username: req.user.displayName
  })
})

routes.router.get('/loginApiFailure', routes.checkNotAuthenticated, (req, res) => { 
  res.send({
      login: false,
      userid: 0,
      username: ""
  })
})

routes.router.get('/viewAdmins', routes.checkAdmin, async (req, res) => {
  let db = await pool.awaitGetConnection();;
  let sql = 'SELECT displayName FROM users WHERE userType = 2';
  let admins = await db.awaitQuery(sql);
  db.release();
  res.render('viewAdmins.ejs', {
      admins: admins
  });
})

module.exports = { passport };
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
          userId: Date.now().toString(),
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

    res.json({"success": true})
  } catch {
    res.json({"success": false})
  }
})

routes.router.get('/logout', routes.checkAuthenticated, async (req, res, next) => {
  req.logOut((err) => {
      if (err) {
          return next(err);
      }
      res.redirect('/login');
  });
});

routes.router.delete('/logout', (req, res, next) => {
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

routes.router.get('/loginInfo', routes.privatePage("/loginApiFailure"), (req, res) => { 
  res.send({
      login: true,
      email: req.user.email,
      userId: req.user.userId,
      username: req.user.displayName,
      userType: req.user.userType
  })
})

routes.router.get('/loginApiFailure', routes.checkNotAuthenticated, (req, res) => { 
  res.send({
      login: false,
      email: "",
      userId: 0,
      username: "",
      userType: 0
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


routes.router.post('/createClass', routes.checkAdmin, async (req, res) => {
  let db;
  try {
    db = await pool.awaitGetConnection();
    let sql = 'INSERT INTO idClass SET ?';
    let cls = {
      className: req.body.name
    };

    const result = await db.awaitQuery(sql, cls);
    // result may include insertId depending on driver
    res.json({ success: true, msg: '', insertId: result && result.insertId ? result.insertId : null });
  } catch (err) {
    console.error('Error creating class:', err);
    res.status(500).json({ success: false, msg: String(err) });
  } finally {
    if (db) db.release();
  }
})

routes.router.get('/getClasses', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM idClass';

  let data = await db.awaitQuery(sql);
  res.json(data)
  db.release();
})

routes.router.post('/assignStudentToClass', routes.checkAdmin, async (req, res) => {
  let db;
  try {
    db = await pool.awaitGetConnection();
    let sql = 'UPDATE users SET classId = ? WHERE userid = ?';
    let assignment = {
      classId: req.body.classId,
      studentId: req.body.id
    };
    const result = await db.awaitQuery(sql, [req.body.classId, req.body.id]);
    res.json({ success: true, msg: '', insertId: result && result.insertId ? result.insertId : null });
  } catch (err) {
    console.error('Error assigning student to class:', err);
    res.status(500).json({ success: false, msg: String(err) });
  } finally {
    if (db) db.release();
  } 
})
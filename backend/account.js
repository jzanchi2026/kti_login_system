const routes = require('./util.js')
const passport = require('passport')
const bcrypt = require('bcrypt')
const pool = routes.pool;

routes.router.post('/approval', routes.checkAdmin, async (req, res) => {
  let id = req.body.approveid;

  console.log(id);

  let sql = 'UPDATE users SET userType = 1 WHERE userId = ? AND shopId = ?';
  let db = await pool.awaitGetConnection();

  db.query(sql, [id, req.user.shopId], (error, result) => {
    if (error) {
      console.log(error);
      res.json({success: false, error: error});
    }
  });

  db.release()
  res.json({success: true, error: ""})
})

routes.router.post('/register', routes.checkNotAuthenticated, async (req, res) => {
  let test = 'SELECT shopId FROM shop WHERE shopCode = ?';
  let data = await db.awaitQuery(test, req.body.shopCode);

  if (data.length == 0) {
    res.status(400).send({
      success: false,
      msg: "Class does not exist"
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    let sql = 'INSERT INTO users SET ?';
    let user = {
        userId: Date.now().toString(),    
        displayName: req.body.name,
        email: req.body.email,
        hashPass: hashedPassword,
        shopId: data[0].shopId,
        userType: 0,
    };

    let db = await pool.awaitGetConnection();
    await db.query(sql, user, (error, result) => {
        if (error) {
          console.log(error);
          throw error;
        }
    });
    db.release()

    res.json({success: true, error: ""})
  } catch (e) {
    res.json({success: false, error: e})
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
      userType: req.user.userType,
      shopId: req.user.shopId
  })
})

routes.router.get('/loginApiFailure', routes.checkNotAuthenticated, (req, res) => { 
  res.send({
      login: false,
      email: "",
      userId: 0,
      username: "",
      userType: 0,
      shopId: 0
  })
})

routes.router.get('/viewAdmins', routes.checkAdmin, async (req, res) => {
  let db = await pool.awaitGetConnection();;
  let sql = 'SELECT displayName FROM users WHERE userType = 2 AND shopId = ?';
  let admins = await db.awaitQuery(sql, req.user.shopId);
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
      className: req.body.name,
      shopId: req.user.shopId
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
  let sql = 'SELECT * FROM idClass where shopId = ?';

  let data = await db.awaitQuery(sql, req.user.shopId);
  res.json(data)
  db.release();
})

routes.router.get('/getUsers', routes.checkAdmin, async (req, res) => {
  let db = await pool.awaitGetConnection();;
  let sql = 'SELECT * FROM users where shopId = ?';
  let admins = await db.awaitQuery(sql, req.user.shopId);
  
  res.json(admins)
  db.release();
})

routes.router.post('/assignStudentToClass', routes.checkAdmin, async (req, res) => {
  let db;
  try {
    db = await pool.awaitGetConnection();
    let sql = 'UPDATE users SET classId = ? WHERE userid = ? AND shopId = ?';
    const result = await db.awaitQuery(sql, [req.body.classId, req.body.id, req.user.shopId]);
    res.json({ success: true, msg: '', insertId: result && result.insertId ? result.insertId : null });
  } catch (err) {
    console.error('Error assigning student to class:', err);
    res.status(500).json({ success: false, msg: String(err) });
  } finally {
    if (db) db.release();
  } 
})
const routes = require('./util.js')
const pool = routes.pool;

routes.router.get('/', routes.checkAuthenticated, (req, res) => {
  res.redirect('/demo');
  //console.log("body user" + req.body.user);
  //console.log("req user" + req.user);

  //res.render('index.ejs', { name: req.user.displayName, userid: req.user.userid, email: req.user.email })
})

routes.router.get('/login', routes.checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

routes.router.get('/demo', routes.checkAuthenticated, (req, res) => {
    res.render('test.ejs',
        { admin: req.user.userType > 1, name: req.user.displayName, userid: req.user.userid, email: req.user.email }
    )
})

routes.router.get('/addTool', routes.checkAdmin, (req, res) => {
    res.render('addTool.ejs')
})
routes.router.get('/addMaterial', routes.checkAdmin, (req, res) => {
    res.render('addMaterial.ejs')
})
routes.router.get('/tools', routes.checkAuthenticated, async (req, res) => {
    let db = await pool.awaitGetConnection();;
    let sql = 'SELECT toolName, toolTypeId from tool';
    let tools = await db.awaitQuery(sql);
    res.render('tools.ejs', {
        tools: tools,
        admin: req.user.userType > 1
    })
})
routes.router.get('/materials', routes.checkAuthenticated, async (req, res) => {
    let db = await pool.awaitGetConnection();;
    let sql = 'SELECT materialName, materialId from material';
    let materials = await db.awaitQuery(sql);
    db.release();
    res.render('materials.ejs', {
        materials: materials,
        admin: req.user.userType > 1
    })
})

routes.router.get('/tool', routes.checkAuthenticated, async (req, res) => {
    let db = await pool.awaitGetConnection();;
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

routes.router.get('/material', routes.checkAuthenticated, async (req, res) => {
    let db = await pool.awaitGetConnection();;
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

routes.router.get('/approval', routes.checkAdmin, async (req, res) => {
  var db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM users WHERE userType = 0';
  let users = await db.awaitQuery(sql);
  db.release();

  res.render('approval.ejs', { users: users });
})


routes.router.get('/users', async (req, res) => {
  res.append("Access-Control-Allow-Origin", "*");
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM users';
  let users = await db.awaitQuery(sql);
  db.release();

  res.render('users.ejs', { users: users, admin: false });
})

routes.router.post('/addTool/', async (req, res) => {
  res.append("Access-Control-Allow-Origin", "*");
  let sql = "INSERT INTO tool SET ?"
  let tool = {
      toolName: req.body.toolName
  }
  let db = await pool.awaitGetConnection();;
  db.query(sql, tool, (error, result) => {
      if (error) throw error;
  });
  db.release();

  res.redirect("/tools");
})

routes.router.post('/addMaterial/', async (req, res) => {
  res.append("Access-Control-Allow-Origin", "*");
  let sql = "INSERT INTO material SET ?"
  let material = {
      materialName: req.body.materialName,
      amount: 0
  }

  let db = await pool.awaitGetConnection();;
  db.query(sql, material, (error, result) => {
      if (error) throw error;
  });

  res.redirect("/materials");
})

routes.router.get('/register', routes.checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

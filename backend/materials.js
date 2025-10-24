const routes = require('./util.js')
const pool = routes.pool;
// Gets details for a specific material
// https://kti.com/getMaterial?id=1
routes.router.get('/getMaterial', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM material WHERE materialTypeId = ?';

  let data = await db.awaitQuery(sql, req.query.id);
  res.send(data[0])
  db.release();
})

// Gets the list of Materials
// https://kti.com/getMaterials
routes.router.get('/getMaterials', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM material';

  let data = await db.awaitQuery(sql);
  res.send(data)
  db.release();
})

// Creates a new material type
// https://kti.com/createMaterialType?name=newMaterial
routes.router.post('/createMaterialType', routes.checkAdmin, async (req, res) => {

  let db = await pool.awaitGetConnection();
  let sql = "INSERT INTO material SET ?";
  let material = {
      materialName: req.body.name,
      quantity: req.body.quantity
  }

  console.log(material);

  let success = true;
  let msg = "";

  await db.query(sql, material, (error, result) => {
      if (error) {
          success = false;
          msg = error;
      }
      res.send({ success: success, msg: msg })
  });
  db.release();
})

routes.router.delete('/removeMaterialType', routes.checkAdmin, async (req, res) => {

  let db = await pool.awaitGetConnection();
  let sql = "DELETE FROM material WHERE materialTypeId = ?";

  let success = true;
  let msg = "";

  await db.query(sql, req.query.id, (error, result) => {
      if (error) {
          success = false;
          msg = error;
      }
      res.send({ success: success, msg: msg })
  });
  db.release();
})


// End Materials

// Individual Materials

// Gets a list of materials a particular user has taken out
// https://kti.com/getUserMaterials?id=1
routes.router.get('/getUserMaterials', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM takenMaterial WHERE accountId = ?';

  let data = await db.awaitQuery(sql, 'id' in req.query ? req.query.id : req.user.userId);
  res.send(data)
  db.release();
})

routes.router.post('/checkoutMaterial', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'INSERT INTO takenMaterial SET ?';
  let material = {
    materialTypeId: req.query.id,
    quantity: req.query.quantity,
    timeTaken: new Date().toISOString().slice(0, 19).replace('T', ' '),
    accountId: req.user.userId
  }

  let success = true;
  let msg = "";

  await db.query(sql, material, (error, result) => {
      if (error) {
          success = false;
          msg = "An unexpected error has occured, make sure you passed in all fields correctly";
      }
      res.send({ success: success, msg: msg })
  });

  db.release();
})

routes.router.post('/returnMaterial', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'INSERT INTO material SET ?';
  let material = {
    materialTypeId: req.query.id,
    quantity: req.query.quantity,
    timeTaken: new Date().toISOString().slice(0, 19).replace('T', ' '),
    accountId: req.user.userId
  }

  let success = true;
  let msg = "";

  await db.query(sql, material, (error, result) => {
      if (error) {
          success = false;
          msg = "An unexpected error has occured, make sure you passed in all fields correctly";
      }
      res.send({ success: success, msg: msg })
  });

  db.release();
})
const routes = require('./util.js')
const pool = routes.pool;
// Gets details for a specific material
// https://kti.com/getMaterial?id=1
routes.router.get('/getMaterial', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM material WHERE materialId = ? AND shopId = ?';

  let data = await db.awaitQuery(sql, [req.query.id, req.user.shopId]);
  res.send(data[0])
  db.release();
})

// Gets the list of Materials
// https://kti.com/getMaterials
routes.router.get('/getMaterials', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM material where shopId = ?';

  let data = await db.awaitQuery(sql, req.user.shopId);
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
      amount: req.body.quantity,
      currentAmount: req.body.quantity,
      shopId: req.user.shopId
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
    let test = 'SELECT * FROM material WHERE materialId = ? AND shopId = ?'
    let data = await db.awaitQuery(test, [req.query.id, req.user.shopId]);

    if (data.length == 0) {
      res.status(400).send({
        success: false,
        msg: "No such material found"
      });

      db.release();
      return;
    }

  
  let sql = "DELETE FROM material WHERE materialId = ?";

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
  let sql = 'SELECT * FROM materialHistory WHERE timeReturned IS NULL and userId = ?';

  let data = await db.awaitQuery(sql, 'id' in req.query ? req.query.id : req.user.userId);
  res.send(data)
  db.release();
})

routes.router.get('/getMaterialHistories', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT recordId, materialId, userId, takenQuantity, returnedQuantity, timeTaken, timeReturned FROM materialHistory INNER JOIN material on material.materialId = materialHistory.materialId and material.shopId = ?';

  let data = await db.awaitQuery(sql, req.user.shopId);
  res.send(data)
  db.release();
})

routes.router.get('/getMaterialHistory', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT recordId, materialId, userId, takenQuantity, returnedQuantity, timeTaken, timeReturned FROM materialHistory WHERE materialId = ? INNER JOIN material on material.materialId = materialHistory.materialId and material.shopId = ?';

  let data = await db.awaitQuery(sql, [req.query.id, req.user.shopId]);
  res.send(data)
  db.release();
})

routes.router.post('/checkoutMaterial', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();

  let test = 'SELECT * FROM material WHERE materialId = ? AND shopId = ?'
  console.log(req.query.id)
  let data = await db.awaitQuery(test, [req.query.id, req.user.shopId]);

  if (data.length == 0) {
    res.status(400).send({
      success: false,
      msg: "No such material found"
    });
  }
  else if (data[0].currentAmount < req.query.quantity) {
    res.status(400).send({
      success: false,
      msg: "Not enough quantity"
    });
  }
  else {
    let sql = 'INSERT INTO materialHistory SET ?';
    let sql2 = 'UPDATE material SET currentAmount = currentAmount - ? WHERE materialId = ?';
    let material = {
      materialId: req.query.id,
      takenQuantity: req.query.quantity,
      returnedQuantity: 0,  
      timeTaken: new Date().toISOString().slice(0, 19).replace('T', ' '),
      userId: req.user.userId
    }

    let success = true;
    let msg = "";

    await db.query(sql, material, async (error, result) => {
      if (error) {
        success = false;
        msg = "An unexpected error has occured, make sure you passed in all fields correctly";
        res.status(500).send({ success: success, msg: msg })
      }
      else {
        await db.query(sql2, [req.query.quantity, req.query.id], (error, result) => {
          if (error) {
            success = false;
            msg = "An unexpected error has occured, make sure you passed in all fields correctly";
          }

          res.status(500).send({ success: success, msg: msg })
        });
      }
    });
  }

  db.release();
})

routes.router.post('/updateMaterialQuantity', routes.checkAdmin, async (req, res) => {
  let db = await pool.awaitGetConnection();

  let test = 'SELECT * FROM material WHERE materialId = ? AND shopId = ?'
  console.log(req.query.id)
  let data = await db.awaitQuery(test, [req.query.id, req.user.shopId]);

  if (data.length == 0) {
    res.status(400).send({
      success: false,
      msg: "No such material found"
    });
  }
  else {
    let sql2 = 'UPDATE material SET currentAmount = ? WHERE materialId = ?';
    await db.query(sql, [req.query.quantity, req.query.id], async (error, result) => {
      if (error) {  
        success = false;
        msg = "An unexpected error has occured, make sure you passed in all fields correctly";
        res.status(500).send({ success: success, msg: msg })
      }
    });
  }

  db.release();
})

routes.router.post('/returnMaterial', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();

  let test = 'SELECT * FROM materialHistory WHERE materialId = ? AND userId = ? AND timeReturned IS NULL ORDER BY timeTaken DESC';
  let data = await db.awaitQuery(test, [req.query.id, req.user.userId]);

  if (data.length == 0) {
    res.status(400).send({
      success: false,
      msg: "Item not taken out by you"
    });
  }
  else if (data[0].takenQuantity < req.query.quantity) {
    res.status(400).send({
      success: false,
      msg: "Not enough quantity"
    });
  }
  else {
    let record = data[0].recordId;
    
    let sql = 'UPDATE materialHistory SET ? WHERE recordId = ?' ;
    let sql2 = 'UPDATE material SET currentAmount = currentAmount + ? WHERE materialId = ?';
    let material = {
      returnedQuantity: req.query.quantity,
      timeReturned: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }

    let success = true;
    let msg = "";

    await db.query(sql, [material, record], async (error, result) => {
      if (error) {  
        success = false;
        msg = "An unexpected error has occured, make sure you passed in all fields correctly";
        res.status(500).send({ success: success, msg: msg })
      }
      else {
        await db.query(sql2, [req.query.quantity, req.query.id], (error, result) => {
          if (error) {
            success = false;
            msg = "An unexpected error has occured, make sure you passed in all fields correctly";
          }

          res.status(500).send({ success: success, msg: msg })
        });
      }
    });
  }

  db.release();
})

routes.router.post('/forceReturnMaterial', routes.checkAdmin, async (req, res) => {
  let db = await pool.awaitGetConnection();

  let test = 'SELECT * FROM materialHistory WHERE materialId = ? AND shopId = ? AND timeReturned IS NULL ORDER BY timeTaken DESC';
  let data = await db.awaitQuery(test, [req.query.id, req.user.shopId]);

  if (data.length == 0) {
    res.status(400).send({
      success: false,
      msg: "Item not taken out"
    });
  }
  else if (data[0].takenQuantity < req.query.quantity) {
    res.status(400).send({
      success: false,
      msg: "Not enough quantity"
    });
  }
  else {
    let record = data[0].recordId;
    
    let sql = 'UPDATE materialHistory SET ? WHERE recordId = ?' ;
    let sql2 = 'UPDATE material SET currentAmount = currentAmount + ? WHERE materialId = ?';
    let material = {
      returnedQuantity: req.query.quantity,
      timeReturned: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }

    let success = true;
    let msg = "";

    await db.query(sql, [material, record], async (error, result) => {
      if (error) {  
        success = false;
        msg = "An unexpected error has occured, make sure you passed in all fields correctly";
        res.status(500).send({ success: success, msg: msg })
      }
      else {
        await db.query(sql2, [req.query.quantity, req.query.id], (error, result) => {
          if (error) {
            success = false;
            msg = "An unexpected error has occured, make sure you passed in all fields correctly";
          }

          res.status(500).send({ success: success, msg: msg })
        });
      }
    });
  }

  db.release();
})
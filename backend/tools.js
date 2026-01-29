const routes = require('./util.js')
const pool = routes.pool;
// Gets details for a specific tool
// https://kti.com/getTool?id=1
routes.router.get('/getTool', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM singleTools WHERE toolID = ? and shopId = ?';

  let data = await db.awaitQuery(sql, [req.query.id, req.user.shopId]);
  res.json(data[0])
  db.release();
})

routes.router.get('/getToolTags', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM toolTag WHERE toolId = ? INNER JOIN tag ON tag.tagId = toolTag.tagId INNER JOIN singleTools on singleTools.toolId = toolTag.toolId and singleTools.shopId = ?';

  let data = await db.awaitQuery(sql, [req.query.id, req.user.shopId]);
  res.json(data)
  db.release();
})

routes.router.get('/getTaggedTools', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM toolTag WHERE toolId = ? INNER JOIN singleTools ON singleTools.toolId = toolTag.toolId and singleTools.shopId = ?';

  let data = await db.awaitQuery(sql, [req.query.id, req.user.shopId]);
  res.json(data)
  db.release();
})


// Gets the list of tools
// https://kti.com/getTools
routes.router.get('/getTools', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM singleTools where shopId = ?';

  let data = await db.awaitQuery(sql, req.user.shopId);
  res.json(data)
  db.release();
})

routes.router.get("/getToolHistory", routes.checkAdmin, async (req, res) => {
  let db = await pool.awaitGetConnection();

  if ("userId" in req.query) {
    let sql = 'SELECT recordId, toolId, userId, timeTaken, timeReturned FROM toolHistory WHERE userId = ? INNER JOIN singleTools ON singleTools.toolId = toolHistory.toolId AND tool.shopId = ?';

    let data = await db.awaitQuery(sql, [req.query.toolId, req.user.shopId]);
    res.json(data);
  } 
  else if ("toolId" in req.query) {
    let sql = 'SELECT recordId, toolId, userId, timeTaken, timeReturned FROM toolHistory WHERE toolId = ? INNER JOIN singleTools ON singleTools.toolId = toolHistory.toolId AND singleTools.shopId = ?';

    let data = await db.awaitQuery(sql, [req.query.toolId, req.user.shopId]);
    res.json(data);
  } 
  else {
    let sql = 'SELECT recordId, toolId, userId, timeTaken, timeReturned FROM toolHistory INNER JOIN singleTools ON singleTools.toolId = toolHistory.toolId AND singleTools.shopId = ?';

    let data = await db.awaitQuery(sql, req.user.shopId); 
    res.json(data);
  }

  db.release();  
})


routes.router.get("/getMyHistory", routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();


  let sql = 'SELECT * FROM toolHistory WHERE userId = ?';

  let data = await db.awaitQuery(sql, req.user.userId); 
  res.json(data);
  
  db.release();

  
})

/* deal with later
const multer  = require('multer')
const upload = multer({ dest: 'public/images/' })
routes.router.post('/addToolPicture', upload.single('picture'), async function (req, res, next) {
  let db = await pool.awaitGetConnection();
  let sql = 'UPDATE singleTools SET toolPicture = ? WHERE toolId = ?';

  let success = true;
  let msg = "";

  await db.query(sql, [req.file, req.body.toolId], (error, result) => {
      if (error) {
          success = false;
          msg = error;
      }
      res.send({ success: success, msg: msg })
  });
  db.release();
})
*/ 

// Creates a new tool type
// https://kti.com/createToolType?name=newTool
routes.router.post('/createTool', routes.checkAdmin, async (req, res) => {

  let db = await pool.awaitGetConnection();
  let sql = "INSERT INTO singleTools SET ?";
  let tool = {
      toolName: req.body.name,
      takenBy: null,
      shopId: req.user.shopId
  }

  console.log(tool);

  let success = true;
  let msg = "";

  await db.query(sql, tool, (error, result) => {
      if (error) {
          success = false;
          msg = error;
      }
      res.send({ success: success, msg: msg })
  });
  db.release();
})

routes.router.post('/tagTool', routes.checkAdmin, async (req, res) => {

  let db = await pool.awaitGetConnection();

  let test = 'SELECT * FROM singleTools WHERE toolId = ? AND shopId = ?'
  let data = await db.awaitQuery(test, [req.query.toolId, req.user.shopId]);

  if (data.length == 0) {
    res.status(400).send({
      success: false,
      msg: "No such tool found"
    });

    db.release();
    return;
  }

  let sql = "INSERT INTO toolTag SET ?";
  let tool = {
      toolId: req.body.toolId,
      tagId: req.body.tagId
  }

  console.log(tool);

  let success = true;
  let msg = "";

  await db.query(sql, tool, (error, result) => {
      if (error) {
          success = false;
          msg = error;
      }
      res.send({ success: success, msg: msg })
  });
  db.release();
})

routes.router.delete('/removeTool', routes.checkAdmin, async (req, res) => {

  let test = 'SELECT * FROM singleTools WHERE toolId = ? AND shopId = ?'
  let data = await db.awaitQuery(test, [req.query.id, req.user.shopId]);

  if (data.length == 0) {
    res.status(400).send({
      success: false,
      msg: "No such tool found"
    });

    db.release();
    return;
  }

  let db = await pool.awaitGetConnection();
  let sql = "DELETE FROM singleTools WHERE toolId  = ?";

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


// End Tools

// Individual Tools

// Gets a list of tools a particular user has taken out
// https://kti.com/getUserTools?id=1
routes.router.get('/getUserTools', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();

  let sql = 'SELECT * FROM singleTools WHERE takenBy = ?';

  let data = await db.awaitQuery(sql, 'id' in req.query ? req.query.id : req.user.userId);
  res.json(data)

  db.release();
})

routes.router.post('/checkoutTool', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();

  let test = 'SELECT * FROM singleTools WHERE toolId = ? AND shopId = ?'
  let data = await db.awaitQuery(test, [req.query.id, req.user.shopId]);

  if (data.length == 0) {
    res.status(400).send({
      success: false,
      msg: "No such tool found"
    });

    db.release();
    return;
  }
  else if (data.takenBy != null) {
    res.status(403).send({
      success: false,
      msg: "Already taken out"
    });

    db.release();
    return;
  }

  let sql = 'UPDATE singleTools SET takenBy = ? WHERE toolID = ?';

  let success = true;
  let msg = "";

  await db.query(sql, [req.user.userId, req.query.id], async (error, result) => {
    if (error) {
      success = false;
      msg = "An unexpected error has occured, make sure you passed in all fields correctly";
    }

    else {
      let sql2 = "INSERT INTO toolHistory SET ?";

      let record = {
        toolId: req.query.id,
        userId: req.user.userId,
        timeTaken: new Date().toISOString().slice(0, 19).replace('T', ' '),
        timeReturned: null
      };

      await db.query(sql2, record, (error, result) => {
        if (error) {
          success = false;
          msg = "An unexpected error has occured, make sure you passed in all fields correctly";
        }
      });
    }

    res.json({ success: success, msg: msg })
  });

  db.release();
})

routes.router.post('/returnTool', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();

  let test = 'SELECT * FROM singleTools WHERE toolId = ? AND shopId = ?'
  let data = await db.awaitQuery(test, [req.query.id, req.user.shopId]);

  if (data.length == 0) {
    res.status(400).send({
      success: false,
      msg: "No such tool found"
    });

    db.release();
    return;
  }
  else if (data.takenBy != req.user.userId) {
    res.status(403).send({
      success: false,
      msg: "Cannot return"
    });

    db.release();
    return;
  }


  let sql = "UPDATE singleTools SET takenBy = null WHERE toolID = ?";

  let success = true;
  let msg = "";

  await db.query(sql, req.query.id, async (error, result) => {
      if (error) {
        success = false;
        msg = "An unexpected error has occured, make sure you passed in all fields correctly";
      }

      let sql2 = "UPDATE toolHistory SET timeReturned = ? WHERE recordId = (SELECT recordId FROM toolHistory WHERE toolId = ? AND timeReturned IS NULL ORDER BY recordId DESC LIMIT 1)"

      await db.query(sql2, [new Date().toISOString().slice(0, 19).replace('T', ' '), req.query.id], (error, result) => {
        if (error) {
          success = false;
          msg = "An unexpected error has occured, make sure you passed in all fields correctly";
          console.log(error);
        }
      }) 

      res.send({ success: success, msg: msg })
  });

  db.release();
})


routes.router.post('/forceReturnTool', routes.checkAdmin, async (req, res) => {
  let db = await pool.awaitGetConnection();

  let test = 'SELECT * FROM singleTools WHERE toolId = ? AND shopId = ?'
  let data = await db.awaitQuery(test, [req.query.id, req.user.shopId]);

  if (data.length == 0) {
    res.status(400).send({
      success: false,
      msg: "No such tool found"
    });

    db.release();
    return;
  }
  else if (data.takenBy == null) {
    res.status(403).send({
      success: false,
      msg: "Not taken out"
    });

    db.release();
    return;
  }


  let sql = "UPDATE singleTools SET takenBy = null WHERE toolID = ?";

  let success = true;
  let msg = "";

  await db.query(sql, req.query.id, async (error, result) => {
      if (error) {
        success = false;
        msg = "An unexpected error has occured, make sure you passed in all fields correctly";
      }

      let sql2 = "UPDATE toolHistory SET timeReturned = ? WHERE recordId = (SELECT recordId FROM toolHistory WHERE toolId = ? AND timeReturned IS NULL ORDER BY recordId DESC LIMIT 1)"

      await db.query(sql2, [new Date().toISOString().slice(0, 19).replace('T', ' '), req.query.id], (error, result) => {
        if (error) {
          success = false;
          msg = "An unexpected error has occured, make sure you passed in all fields correctly";
          console.log(error);
        }
      }) 

      res.send({ success: success, msg: msg })
  });

  db.release();
})
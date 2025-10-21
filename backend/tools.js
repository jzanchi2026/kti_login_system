const routes = require('./util.js')
const pool = routes.pool;
// Gets details for a specific tool
// https://kti.com/getTool?id=1
routes.router.get('/getTool', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM singleTools WHERE toolID = ?';

  let data = await db.awaitQuery(sql, req.query.id);
  res.json(data[0])
  db.release();
})

// Gets the list of tools
// https://kti.com/getTools
routes.router.get('/getTools', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM singleTools';

  let data = await db.awaitQuery(sql);
  res.json(data)
  db.release();
})

// Creates a new tool type
// https://kti.com/createToolType?name=newTool
routes.router.post('/createTool', routes.checkAdmin, async (req, res) => {

  let db = await pool.awaitGetConnection();
  let sql = "INSERT INTO singleTools SET ?";
  let tool = {
      toolName: req.body.name,
      takenBy: null
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

  let db = await pool.awaitGetConnection();
  let sql = "DELETE FROM tool WHERE toolID  = ?";

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

  let data = await db.awaitQuery(sql, 'id' in req.query ? req.query.id : req.user.userid);
  res.json(data)

  db.release();
})

routes.router.post('/checkoutTool', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'UPDATE singleTools SET takenBy = ? WHERE toolID = ?';

  let success = true;
  let msg = "";

  await db.query(sql, [req.user.userid, req.query.id], async (error, result) => {
    if (error) {
      success = false;
      msg = "An unexpected error has occured, make sure you passed in all fields correctly";
    }

    else {
      let sql2 = "INSERT INTO toolHistory SET ?";

      let record = {
        toolId: req.query.id,
        userId: req.user.userid,
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
  let sql = "UPDATE singleTools SET takenBy = null WHERE toolID = ?";

  let success = true;
  let msg = "";

  await db.query(sql, req.query.id, async (error, result) => {
      if (error) {
        success = false;
        msg = "An unexpected error has occured, make sure you passed in all fields correctly";
      }

      let sql2 = "UPDATE toolHistory SET timeReturned = ? WHERE recordId = (SELECT recordId FROM toolHistory WHERE toolId = ? AND timeReturned IS NULL ORDER BY ID DESC LIMIT 1)"

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

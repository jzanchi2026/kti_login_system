const routes = require('./util.js')
const pool = routes.pool;
// Gets details for a specific tool
// https://kti.com/getTool?id=1
routes.router.get('/getTool', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM tool WHERE toolTypeId = ?';

  let data = await db.awaitQuery(sql, req.query.id);
  res.send(data[0])
  db.release();
})

// Gets the list of tools
// https://kti.com/getTools
routes.router.get('/getTools', routes.checkAuthenticated, async (req, res) => {
  let db = await pool.awaitGetConnection();
  let sql = 'SELECT * FROM tool';

  let data = await db.awaitQuery(sql);
  res.send(data)
  db.release();
})

// Creates a new tool type
// https://kti.com/createToolType?name=newTool
routes.router.get('/createToolType', routes.checkAuthenticated, async (req, res) => {

  let db = await pool.awaitGetConnection();
  let sql = "INSERT INTO tool SET ?";
  let tool = {
      toolName: req.query.name
  }

  console.log(tool);

  let success = true;
  let msg = "";

  await db.query(sql, tool, (error, result) => {
      if (error) {
          success = false;
          msg = "An unexpected error has occured, make sure you passed in all fields correctly";
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
  let sql = 'SELECT * FROM takenTool WHERE accountId = ?';

  let data = await db.awaitQuery(sql, req.query.id);
  res.render('apiOut.ejs', {
      data: data
  })
  db.release();
})
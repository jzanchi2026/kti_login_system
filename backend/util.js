const express = require('express');
const router = express.Router();

// If the client prefers JSON (Accept: application/json) or requests ?format=json or ?json=1,
// override res.render to return the view locals as JSON. This makes existing routes
// that call res.render(...) return JSON without changing each handler.
router.use((req, res, next) => {
  const wantsJson = (req.accepts && req.accepts(['html', 'json']) === 'json') || req.query.format === 'json' || req.query.json === '1';
  if (wantsJson) {
    const originalRender = res.render.bind(res);
    res.render = function(view, options, callback) {
      // normalize arguments: res.render(view, options, callback) or res.render(view, callback)
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      // If no options provided, send an empty object to keep response consistent
      res.json(options || {});
    };
    // expose original render in case a route needs it
    res._originalRender = originalRender;
  }
  next();
});

const mysql = require('mysql-await')
const pool = mysql.createPool({
  host: "ktprog.com",
  user: "ktinventory",
  password: "Keefe!2024!Invent",
  database: "ktinventory",
  connectionLimit: 20,
  connectTimeout: 50000,
  acquireTimeout: 50000,
});

function checkAuthenticated(req, res, next) {

  console.log(req);
  if (req.isAuthenticated()) {
      return next()
  }

  res.redirect('/login')
}

function privatePage(redirect) {
  return function(req, res, next) {
    console.log(req);
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect(redirect)
  };
}

function checkAdmin(req, res, next) {

  if (req.isAuthenticated() && req.user.userType >= 2) {
      return next()
  }

  res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {

  if (req.isAuthenticated()) {
      return res.redirect('/')
  }
  next()
}

module.exports = { router, checkAuthenticated, privatePage, checkNotAuthenticated, checkAdmin, pool };

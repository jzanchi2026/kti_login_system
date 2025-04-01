const express = require('express');
const router = express.Router();

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

  if (req.isAuthenticated()) {
      return next()
  }

  res.redirect('/login')
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

module.exports = { router, checkAuthenticated, checkNotAuthenticated, checkAdmin, pool };

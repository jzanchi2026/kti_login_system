const express = require('express');
const router = express.Router();

const mysql = require('mysql-await')
const pool = mysql.createPool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  connectionLimit: 20,
  connectTimeout: 50000,
  acquireTimeout: 50000,
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.userType >= 1) {
      return next()
  }

  res.redirect('/login')
}

function privatePage(redirect) {
  return function(req, res, next) {
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

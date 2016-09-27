'use strict';
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var models = require('../models');
var Page = models.Page;
var User = models.User;
var db = new Sequelize('postgres://localhost:1337/wikistack', {
  logging: false
});
var Promise = require('bluebird');
//var Promise = require('sequelize').Promise.

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
router.use(express.static('public'));

router.get('/', function (req, res, next){
  User.findAll().then(function(allUsers){
    //console.log(allUsers);
    res.render('authors', {users: allUsers});
  })
});
router.get('/:userId', function(req, res, next) {

  var userPromise = User.findById(req.params.userId);
  var pagesPromise = Page.findAll({
    where: {
      authorId: req.params.userId
    }
  });

  Promise.all([
    userPromise,
    pagesPromise
  ])
  .then(function(values) {
    var user = values[0];
    var pages = values[1];
    res.render('user', { user: user, pages: pages });
  })
  .catch(next);

});
router

module.exports = router;

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

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
router.use(express.static('public'));

router.get('/', function(req, res){
  Page.findAll().then(function(allPages){
    res.render('index', {pages: allPages});
  })
});

module.exports = router;

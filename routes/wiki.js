'use strict';
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var models = require('../models');
var Page = models.Page;
var User = models.User;
var Sequelize = require('sequelize');
var db = new Sequelize('postgres://localhost:1337/wikistack', {
  logging: false
});

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
router.use(express.static('public'));

router.get('/', function(req, res, next){
  res.redirect('/');
});
router.get('/search/:tag', function(req, res, next){
  Page.findByTag(req.params.tag)
  .then(function(pages){
      res.render('index',{pages : pages} );
  })
  .catch(next);
})

router.post('/', function(req, res, next) {

  User.findOrCreate({
    where: {
      name: req.body.name,
      email: req.body.email
    }
  }).then(function (values) {
    //console.log(values[0]);
    var user = values[0];
    var tagarr = req.body.tags.split(" ");
    //console.log("here");
    //console.log(tagarr);
    var page = Page.build({
      title: req.body.title,
      content: req.body.content,
      tags: tagarr

    });

    return page.save().then(function (page) {
      return page.setAuthor(user);
    });

  }).then(function (page) {
    res.redirect(page.pageRoute);
  })
  .catch(next);
});

router.get('/add', function(req, res, next){
  res.render('addpage');
});

router.get('/:urlTitle', function(req, res, next){
  Page.findOne({
    where: {
      urlTitle: req.params.urlTitle
    },
    include: [
        {model: User, as: 'author'}
    ]

  }).then(function(foundPage){
    // page instance will have a .author property
    // as a filled in user object ({ name, email })
    if (foundPage === null) {
        res.status(404).send();
    } else {
      //console.log(foundPage);

        res.render('wikipage', {
            page: foundPage
        });
    }
  }).catch(next);
})

router.get('/:urlTitle/similar', function (req, res, next){
  Page.findOne({
    where: {
      urlTitle: req.params.urlTitle
    }
  })
  .then(function (page){
    console.log("find page!!");
    //console.log(page);

    if(page === null){
      return next(new Error("The page was not found!"));
    }

    return page.findSimilar();
  })
  .then(function (similarpage){
    console.log("find!!!");
    console.log(similarpage);
    res.render('index', { pages: similarpage});
  })
  .catch(next);
})
module.exports = router;

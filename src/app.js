const express = require('express');
const router = require('./router/router.js');
//const ejs = require('ejs');
//const bodyParser = require('body-parser');
const path = require('path');

class AppController {

  constructor() {
    this.express = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.express.use(express.json());
    this.express.set('view engine', 'ejs');
    this.express.set('views', path.join(__dirname, 'views'));
    this.express.use(express.static(path.join(__dirname, 'public')));
    this.express.use(express.static(path.join(__dirname, 'public')));
    //this.express.use(bodyParser.json());
  }

  routes() {
    this.express.use('/', router);
  }
}

//esporto come server l'ogetto express
module.exports = new AppController().express
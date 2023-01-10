const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
})

router.get('/home', (req, res) => {
    res.render('index');
})

router.get('/create', (req, res) => {
    res.render('create');
})

router.get('/myTickets', (req, res) => {
    res.render('myTickets');
})

module.exports = router;
const express = require("express");
const app = express();
const cors=require('cors')
require('dotenv').config();
require('./Db/index')
const path = require('path');
app.use(express.static(path.join(__dirname,'/build'))); 
const sign=require('./Router/Signupp')
const movie = require('./Router/movie');
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
const PORT = process.env.PORT;

app.use('/api',movie)
app.use('/api',sign)
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname,'/build/index.html')); });
app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});

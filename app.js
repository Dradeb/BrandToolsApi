const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const GridFsStorage = require(('multer-gridfs-storage'));


require('dotenv/config');
//DB CONNECTION 
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to db"))
    .catch(err => console.log(`Could not Connected to db ${process.env.MONGODB_URI} `, err));


// Storage
const storage = new GridFsStorage({
    url: process.env.MONGODB_URI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString("hex") + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads"
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({
    storage
});

app.get("/", function(req, res) {
    //when we get an http get request to the root/homepage
    res.send("BPEDIA API ");
});


//  Allow form-data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//  Allow form-data parsing

const docsRoute = require('./routes/document');
const usersRoute = require('./routes/users');



//MiddleWares

app.use('/Documents', docsRoute(upload));
app.use('/Users', usersRoute);


// DB_CONNECTION=mongodb+srv://admin:Dradeb96@brandtoolscluster.lzixc.mongodb.net/brandtools




//Listening to server
app.listen(process.env.PORT);
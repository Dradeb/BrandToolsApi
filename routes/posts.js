const express = require('express');
const router = express.Router();
const Post = require('../models/Post');



//ROUTES
router.get('/', (req, res) => {
    res.send('we are on posts');
});



router.post('/', (req, res) => {

    console.log('recieved post request');
    const post = new Post({
        title: req.body.title,
        description: req.body.description
    });

    post.save()
        .then(data => {
            res.json(data);
            res.end();
        })
        .catch(err => {
            console.log(err);
            res.json({ message: err });
            res.end();
        });
});


//exporting the route
module.exports = router;
const express = require('express');
const User = require('../models/User');
const router = express.Router();


//ROUTES 
router.post('/', (req, res) => {

    User.findOne({ email: req.body.email }, function(err, user) {
        if (err) {
            console.log(err);
        }
        if (user) {
            res.status(400).json({
                error: 'User Already exists'
            });
        } else {

            const user = new User({
                name: req.body.name,
                email: req.body.email,
                role: req.body.role,
            });
            user.save().then(data => {

                res.json(data);
                res.end();

            }).catch(err => {

                res.json({ message: err });
                res.end();
            })
        }
    })



});

//ROUTES 
router.post('/Update/:id', (req, res) => {

    const user = new User({
        _id: req.params.id,
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    });

    User.updateOne({ _id: req.params.id }, user).then(
        () => {
            res.status(201).json({
                message: 'User updated successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );

});


router.post('/Delete/:id', (req, res) => {

    User.deleteOne({ _id: req.params.id }).then(
        () => {
            res.status(200).json({
                message: 'Deleted'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );

});


router.get('/allUsers/', (req, res) => {

    User.find({}).then(
        (data) => {
            res.status(200).json(data);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );

});

router.get('/User/:id', (req, res) => {

    User.findOne({ _id: req.params.id }).then(
        (data) => {
            res.status(200).json(data);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );

});



module.exports = router;
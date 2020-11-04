const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const mongoose = require('mongoose');

const multer = require('multer');


module.exports = (upload) => {


    const connect = mongoose.connection;
    let gfs;

    connect.once('open', () => {
        gfs = new mongoose.mongo.GridFSBucket(connect.db, {
            bucketName: 'uploads'
        });
    })



    //ROUTES 
    router.post('/', (req, res) => {

        const doc = new Document({
            name: req.body.name,
            description: req.body.description,
            tags: req.body.tags,
            docType: req.body.docType

        });

        doc.save().then(data => {
            res.json(data);
            res.end();
        }).catch(err => {

            console.log(err);
            res.json({ message: err });
            res.end();
        })

    });


    /*
           POST: Upload a single doc/file to Document collection
       */
    router.post('/upload', upload.single('file'), (req, res, next) => {


            // check for existing docs
            Document.findOne({ name: req.body.name })
                .then((doc) => {
                    console.log(req.body);
                    if (doc) {
                        return res.status(200).json({
                            success: false,
                            message: 'File already exists',
                        });
                    }

                    const newDoc = new Document({
                        name: req.body.name,
                        description: req.body.description,
                        tags: req.body.tags,
                        docType: req.body.docType
                    });

                    newDoc.save()
                        .then((doc) => {

                            res.status(200).json({
                                success: true,
                                doc,
                            });
                        })
                        .catch(err => res.status(500).json(err));
                })
                .catch(err => res.status(500).json(err));
        })
        .get((req, res, next) => {
            Document.find({})
                .then(docs => {
                    res.status(200).json({
                        success: true,
                        docs,
                    });
                })
                .catch(err => res.status(500).json(err));
        });




    /*
        GET: Delete an doc from the collection
    */
    router.route('/delete/:id')
        .get((req, res, next) => {
            Document.findOne({ _id: req.params.id })
                .then((doc) => {
                    if (doc) {
                        Document.deleteOne({ _id: req.params.id })
                            .then(() => {
                                return res.status(200).json({
                                    success: true,
                                    message: `File with ID: ${req.params.id} deleted`,
                                });
                            })
                            .catch(err => { return res.status(500).json(err) });
                    } else {
                        res.status(200).json({
                            success: false,
                            message: `File with ID: ${req.params.id} not found`,
                        });
                    }
                })
                .catch(err => res.status(500).json(err));
        });

    /*
        GET: Fetch most recently added record
    */
    router.route('/recent')
        .get((req, res, next) => {
            Document.findOne({}, {}, { sort: { '_id': -1 } })
                .then((doc) => {
                    res.status(200).json({
                        success: true,
                        doc,
                    });
                })
                .catch(err => res.status(500).json(err));
        });

    /*
        POST: Upload multiple files upto 3
    */
    router.route('/multiple')
        .post(upload.array('file', 3), (req, res, next) => {
            res.status(200).json({
                success: true,
                message: `${req.files.length} files uploaded successfully`,
            });
        });

    /*
        GET: Fetches all the files in the uploads collection
    */
    router.route('/files')
        .get((req, res, next) => {
            gfs.find().toArray((err, files) => {
                if (!files || files.length === 0) {
                    return res.status(200).json({
                        success: false,
                        message: 'No files available'
                    });
                }

                files.map(file => {
                    if (file.contentType === 'doc/jpeg' || file.contentType === 'doc/png' || file.contentType === 'doc/svg') {
                        file.isDocument = true;
                    } else {
                        file.isDocument = false;
                    }
                });

                res.status(200).json({
                    success: true,
                    files,
                });
            });
        });

    /*
        GET: Fetches a particular file by filename
    */
    router.route('/file/:filename')
        .get((req, res, next) => {
            gfs.find({ filename: req.params.filename }).toArray((err, files) => {
                if (!files[0] || files.length === 0) {
                    return res.status(200).json({
                        success: false,
                        message: 'No files available',
                    });
                }

                res.status(200).json({
                    success: true,
                    file: files[0],
                });
            });
        });

    /* 
        GET: Fetches a particular doc and render on browser
    */
    router.route('/doc/:filename').get((req, res, next) => {

        gfs.find({ filename: req.params.filename }).toArray((err, files) => {
            if (!files[0] || files.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: 'No files available',
                });
            }

            if (files[0].contentType === 'doc/jpeg' || files[0].contentType === 'doc/jpg' || files[0].contentType === 'doc/png' || files[0].contentType === 'doc/svg+xml') {
                // render doc to browser
                console.log('a fiiileee');
                gfs.openDownloadStreamByName(req.params.filename).pipe(res);
            } else {
                res.status(404).json({
                    err: 'Not an doc',
                });
            }
        });
    });

    /*
        DELETE: Delete a particular file by an ID
    */
    router.route('/file/del/:id')
        .post((req, res, next) => {
            console.log(req.params.id);
            gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
                if (err) {
                    return res.status(404).json({ err: err });
                }

                res.status(200).json({
                    success: true,
                    message: `File with ID ${req.params.id} is deleted`,
                });
            });
        });


    return router;
};
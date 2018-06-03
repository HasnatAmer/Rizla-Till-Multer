var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var path = require ('path');
var crypto  = require('crypto');
var multer = require('multer');
var multergridfs = require('multer-gridfs-storage');
var gridfsstream = require('gridfs-stream');
var methodoverride = require('method-override');


var gfs;
var conn = mongoose.connection;
conn.once('open', function () {
    //Initialize Stream
     gfs = gridfsstream(conn.db,mongoose.mongo);
    gfs.collection('uploads');
});





//Create Storage Engine
var storage = new multergridfs({url: 'mongodb://localhost/test', file: function(req, file)
{
    return new Promise(function(resolve, reject){
        crypto.randomBytes(16, function(err, buf){
            if (err) {
                return reject(err);
            }
            const filename = buf.toString('hex') + path.extname(file.originalname);
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads'
            };
            resolve(fileInfo);
        });
    });
}
});

var upload = multer({storage});
// Upload your files as usual
var supload = upload.single('file');

router.post('/upload',supload,function(req,res,next) {
    // res.json({file:req.file});
    // res.send('is function tk sb theek ha ');
   res.redirect('/multi/show');
});
router.get('/imageupload',function(req,res,next){
    res.render('imageupload');
});
//SUBMIT AND SHOW IMAGE

router.get('/show',function(req,res,next) {
    gfs.files.find().toArray(function(err, files) {
        // Check if files
        if (!files || files.length === 0) {
            res.render('imageupload', { files: false });
        } else {
            files.map(function(file) {
                if (
                    file.contentType === 'image/jpeg' ||
                    file.contentType === 'image/png'
                ) {
                    file.isImage = true;
                } else {
                    file.isImage = false;
                }
            });
            res.render('imageupload', { files: files });
        }
    });
});





router.get('/files',function(req,res,next){
    gfs.files.find().toArray(function(err, files) {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }

        // Files exist
        return res.json(files);
    });
});

//Display file by Filename
router.get('/upload/:filename',function(req,res,next){
    gfs.files.findOne({filename: req.params.filename}, function (err,file)
    {
        if(!file || file.lenght===0)
        {
            return res.status(404).json({err:"NO FILES FOUND"});
        }
        else {
            return res.json(file);
        }

    })
    });
//Image will extract from Mongodb and shown to screeen
router.get('/image34/:filename',function(req,res,next){
    gfs.files.findOne({filename: req.params.filename}, function (err,file)
    {
        if(!file || file.lenght===0)
        {
            return res.status(404).json({err:"NO FILES FOUND"});
        }

//check if image
        if ( file.contentType==='image/jpeg' || file.contentType==='image/png')
        {
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else { res.status(404).json({err:"IMAGE FORMAT IS INCORRECT"})}
    })
});


module.exports = router;



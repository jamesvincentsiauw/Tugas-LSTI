var express = require('express');
var router = express.Router();
var multer = require('multer');
var storage = multer.diskStorage({
    dest:'./uploads/students/',
    filename: function (req,file,cb) {
        cb(null,file.originalname+'-'+req.headers["id-pendaftar"]+'.pdf');
    }
});
const upload = multer({storage: storage});
const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'lasti',
    host: '178.128.104.74',
    database: 'pengelolaanjalurseleksipmb',
    password: '2a099e69',
    port: 40010
});

router.get('/jadwal', function (req,res) {
    let ret;
    pool.query("SELECT * FROM jadwal",(err,result)=>{
        if (err){
            throw err
        }
        else{
            ret ={
                'jalur': 'Seleksi Mandiri',
                'results': result.rows
            };
            res.status(200).json(ret)
        }
    })
});
router.get('/requirements', function (req,res) {
    let ret;
    pool.query("SELECT * FROM requirements", (err,result)=>{
        if (err){
            throw err
        }
        else{
            ret={
                status: 200,
                message: result.rows
            };
            res.status(200).json(ret)
        }
    })
});
function verifyStudents(req){
    const id = req.headers["id-pendaftar"];
    const result = pool.query("SELECT * FROM peserta WHERE idpendaftar=$1", [id]);
    if (result.length>0){
        return true
    }
    else {
        return false
    }
}
router.post('/requirements', function (req,res) {
    let ret;
    try{
        if (verifyStudents(req)){
            const date = new Date();
            const file = '/uploads/students/' + req.headers["id-pendaftar"] + '.pdf';
            upload.single('file');
            pool.query("INSERT INTO uploadedfiles(idpendaftar,jalur,idfiles,filepath,uploadeddate,verified) VALUES ($1,$2,$3,$4,$5,$6)",[req.headers["id-pendaftar"], req.body.jalur,
                req.body.idfiles,file,date,false], (err, result) => {
                if (err){
                    ret={
                        status: err.code,
                        results: err.message
                    };
                    res.json(ret)
                }
                else{
                    ret={
                        status: 200,
                        description:'Data Uploaded',
                        results: result.rows
                    };
                    res.status(200).json(ret);
                }
            })
        }
        else {
            ret ={
                status: 401,
                results: 'Anda belum terdaftar sebagai calon mahasiswa!'
            };
            res.status(401).json(ret);
        }
    }
    catch (e) {
        ret={
            status: e.statusCode,
            description:e.message,
        };
        res.json(ret);
    }
});
router.get('/files',function (req, res) {
    let ret;
    try{
        if (verifyStudents(req)) {
            const id = req.params.id;
            pool.query("SELECT * FROM uploadedfiles WHERE idpendaftar=$1", [id], (err, result) => {
                if (err) {
                    ret={
                        status: err.code,
                        results: err.message
                    };
                    res.json(ret)
                } else {
                    if (result.rows['id']) {
                        data = {
                            id: result.rows['id'],
                            name: result.rows['name'],
                            files: result.rows
                        };
                        ret = {
                            status: 200,
                            results: data
                        };
                        res.status(200).json(ret)
                    } else {
                        ret = {
                            status: 200,
                            results: 'ID not Found'
                        };
                        res.status(200).json(ret)
                    }
                }
            })
        }
        else {
            ret ={
                status: 401,
                results: 'Anda belum terdaftar sebagai calon mahasiswa!'
            };
            res.status(401).json(ret);
        }
    }
    catch (e) {
        ret={
            status: e.statusCode,
            description:e.message,
        };
        res.json(ret);
    }
});
module.exports=router;
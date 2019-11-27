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
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});
router.get('/jadwal', function (req,res) {
    let ret;
    pool.query("SELECT * FROM jadwal", (err,result)=>{
        if (err){
            ret={
                status: err.code,
                results: err.message
            };
            res.send(ret)
        }
        else{
            ret ={
                status: 200,
                'jalur': 'Seleksi Mandiri',
                'results': result.rows
            };
            res.status(200).send(ret)
        }
    })
});
router.get('/requirements', function (req,res) {
    let ret;
    pool.query("SELECT * FROM requirements", (err,result)=>{
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
                results: result.rows
            };
            res.status(200).json(ret)
        }
    })
});
function verifyStudents(id,callback){
    pool.query("SELECT COUNT(*) FROM peserta WHERE idpendaftar=$1", [id], (err, result)=>{
        if (err){
            callback(false);
        }
        else {
            if (result.rows[0].count>0){
                callback(true);
            }
            else {
                callback(true);
            }
        }
    });
}
router.post('/requirements', function (req,res) {
    let ret;
    try{
        const id = req.query.id;
        verifyStudents(id, function (hasil) {
            if (hasil){
                const date = new Date();
                const file = '/uploads/students/' + id + '.pdf';
                upload.single('file');
                pool.query("INSERT INTO uploadedfiles(idpendaftar,jalur,idfiles,filepath,uploadeddate,verified) VALUES ($1,$2,$3,$4,$5,$6)",[id, req.body.jalur,
                    req.body.idfiles,file,date.slice(0,10),false], (err, result) => {
                    if (err){
                        ret={
                            status: 200,
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
        })
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
    const id = req.query.id;
    try{
        verifyStudents(id, function (hasil) {
            if (hasil) {
                pool.query("SELECT idfiles,filepath,uploadeddate,verified FROM uploadedfiles WHERE idpendaftar=$1", [id], (err, result) => {
                    if (err) {
                        ret = {
                            status: err.code,
                            results: err.message
                        };
                        res.json(ret)
                    } else {
                        if (result.rows.length>0) {
                            ret = {
                                status: 200,
                                identity:{
                                    idpendaftar: id,
                                    jalur: "Seleksi Mandiri"
                                },
                                results: result.rows
                            };
                            res.status(200).json(ret)
                        } else {
                            ret = {
                                status: 200,
                                results: 'Anda Belum mengupload file apapun'
                            };
                            res.status(200).json(ret)
                        }
                    }
                })
            }
            else {
                res.send("GAGAL")
            }
        })
    }
    catch (e) {
        ret={
            status: e.statusCode,
            description:e.message,
        };
        res.json(ret);
    }
});
router.get('/', function (req, res) {
    let ret;
    try{
         pool.query("SELECT username,idpendaftar,namapendaftar,tanggaldaftar,alamat,fakultas,tempattanggallahir,tingkat,jalur FROM peserta", (err,result)=>{
            if (err){
                ret={
                    status: err.code,
                    results: err.message
                };
                res.send(ret)
            }
            else{
                ret = {
                    status: 200,
                    description: 'menampilkan seluruh pendaftar',
                    results: result.rows
                };
                res.status(200).json(ret)
            }
        })
    }
    catch (e) {
        ret={
            status: e.statusCode,
            description:e.message,
        };
        res.json(ret);
    }
});
router.get('/:id', function (req, res) {
    let ret;
    try{
         pool.query("SELECT username,idpendaftar,namapendaftar,tanggaldaftar,alamat,fakultas,tempattanggallahir,tingkat,jalur FROM peserta WHERE idpendaftar=$1",[req.params.id], (err,result)=>{
            if (err){
                ret={
                    status: err.code,
                    results: err.message
                };
                res.send(ret)
            }
            else{
                ret = {
                    status: 200,
                    description: 'menampilkan pendaftar berdasarkan ID',
                    results: result.rows
                };
                res.status(200).json(ret)
            }
        })
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
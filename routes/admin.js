var express = require('express');
var router = express.Router();
var randomize = require('randomatic');
const Pool = require('pg').Pool;
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

function verifyToken(req, callback){
    if (req.query.token==="8t7aBO1Q6Y0ZcC76A"){
        callback(true)
    }
    else{
        callback(false)
    }
}
router.get('/', function (req,res) {
    let ret = {
        status: 200,
        message: 'Maaf, resources yang Anda cari tidak ada disini'
    };
    res.statusCode=200;
    res.message=ret;
    res.send(ret)
});
router.get('/pendaftar', function (req,res) {
    let ret;
    verifyToken(req,function (hasil) {
        if (hasil){
            pool.query("SELECT idpendaftar,namapendaftar,tanggaldaftar,alamat,fakultas,tempattanggallahir,tingkat FROM peserta WHERE jalur=$1",[req.query.jalur], (err,result)=>{
                if (err){
                    ret={
                        status: err.code,
                        results: err.message
                    };
                    res.send(ret)
                }
                else{
                    if (req.query.jalur!=null){
                        ret ={
                            'jalur': req.query.jalur,
                            'results': result.rows
                        };
                    }
                    else {
                        ret ={
                            'jalur': null,
                            'results': result.rows
                        };
                    }
                    res.status(200).send(ret)
                }
            })
        }
        else{
            ret = {
                status: 401,
                results: 'Maneh Sokap wak! Bukan admin maneh!'
            };
            res.status(401).json(ret)
        }
    });
});
router.post('/jadwal',function (req, res) {
    let ret;
    try {
        verifyToken(req, function (hasil) {
            if (hasil){
                const id = randomize('A0', 20);
                const tanggalMulai = req.body.tanggalMulai;
                const tanggalAkhir = req.body.tanggalAkhir;
                const kegiatan = req.body.kegiatan;
                if (tanggalMulai && tanggalAkhir && kegiatan) {
                    pool.query("INSERT INTO jadwal(id,tanggalmulai,tanggalselesai,kegiatan) VALUES ($1,$2,$3,$4)", [id, tanggalMulai, tanggalAkhir, kegiatan], err => {
                        if (err) {
                            ret={
                                status: err.code,
                                results: err.message
                            };
                            res.json(ret)
                        } else {
                            ret = {
                                status: 200,
                                description: 'Data Inserted',
                                results: {
                                    id: id,
                                    tanggalMulai: tanggalMulai,
                                    tanggalAkhir: tanggalAkhir,
                                    kegiatan: kegiatan,
                                }
                            };
                            res.status(200).json(ret)
                        }
                    })
                } else {
                    ret = {
                        status: 400,
                        results: 'Parameter Kurang'
                    };
                    res.status(400).json(ret);
                }
            }
            else{
                 ret = {
                     status: 401,
                     results: 'Maneh Sokap wak! Bukan admin maneh!'
                 };
                 res.status(401).json(ret)
            }
        });
    } catch (e) {
       ret={
           status: e.statusCode,
           description:e.message,
       };
       res.json(ret);
   }
});
router.put('/jadwal/:id',function (req,res) {
    let ret;
    try {
        verifyToken(req, function (hasil) {
            if (hasil){
                const id = req.params.id;
                const tanggalMulai = req.body.tanggalMulai;
                const tanggalAkhir = req.body.tanggalAkhir;
                const kegiatan = req.body.kegiatan;
                if (tanggalMulai && tanggalAkhir && kegiatan) {
                    pool.query("UPDATE jadwal SET tanggalmulai=$1,tanggalselesai=$2,kegiatan=$3 WHERE id=$4", [tanggalMulai, tanggalAkhir, kegiatan, id], err => {
                        if (err) {
                            ret={
                                status: err.code,
                                results: err.message
                            };
                            res.json(ret)
                        } else {
                            ret = {
                                status: 200,
                                description: 'Data Updated',
                                results: {
                                    id: id,
                                    tanggalMulai: tanggalMulai,
                                    tanggalAkhir: tanggalAkhir,
                                    kegiatan: kegiatan,
                                }
                            };
                            res.status(200).json(ret)
                        }
                    })
                }
                else{
                    ret = {
                        status: 400,
                        results: 'Parameter Kurang'
                    };
                    res.status(400).json(ret);
                }
            }
            else{
                ret = {
                    status: 401,
                    results: 'Maneh Sokap wak! Bukan admin maneh!'
                };
                res.status(401).json(ret)
            }
        });
    } catch (e) {
       ret={
           status: e.statusCode,
           description:e.message,
       };
       res.json(ret);
   }
});
router.delete('/jadwal/:id', function (req,res) {
    let ret;
    try{
        verifyToken(req, function (hasil) {
            if (hasil){
                const id = req.params.id;
                pool.query("DELETE FROM jadwal WHERE id=$1", [id], err => {
                    if (err) {
                        ret={
                            status: err.code,
                            results: err.message
                        };
                        res.json(ret)
                    } else {
                        ret = {
                            'status': 200,
                            'results': 'Data Deleted'
                        };
                        res.status(200).send(ret)
                    }
                })
            }
            else{
                ret = {
                    status: 401,
                    results: 'Maneh Sokap wak! Bukan admin maneh!'
                };
                res.status(401).json(ret)
            }
        });
    }
    catch (e) {
        ret={
            status: e.statusCode,
            description:e.message,
        };
        res.json(ret);
    }
});
module.exports = router;
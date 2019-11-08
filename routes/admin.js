var express = require('express');
var router = express.Router();
var randomize = require('randomatic');
const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'lasti',
    host: '178.128.104.74',
    database: 'pengelolaanjalurseleksipmb',
    password: '2a099e69',
    port: 40010
});

function verifyToken(req){
    if (req.headers["x-access-token"]==="877ABO1Q6Y0Z!"){
        return true
    }
    else{
        return false
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
router.post('/jadwal',function (req, res) {
    let ret;
    try {
        if (verifyToken(req)) {
            const id = randomize('A0', 20);
            const tanggalMulai = req.body.tanggalMulai;
            const tanggalAkhir = req.body.tanggalAkhir;
            const kegiatan = req.body.kegiatan;
            if (tanggalMulai && tanggalAkhir && kegiatan) {
                pool.query("INSERT INTO jadwal(id,tanggalmulai,tanggalselesai,kegiatan) VALUES ($1,$2,$3,$4)", [id, tanggalMulai, tanggalAkhir, kegiatan], err => {
                    if (err) {
                        throw err
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
    }
    catch (e) {
        res.send(e.message)
    }
});
router.put('/jadwal/:id',function (req,res) {
    let ret;
    try {
        if (verifyToken(req)) {
            const id = req.params.id;
            const tanggalMulai = req.body.tanggalMulai;
            const tanggalAkhir = req.body.tanggalAkhir;
            const kegiatan = req.body.kegiatan;
            if (tanggalMulai && tanggalAkhir && kegiatan) {
                pool.query("UPDATE jadwal SET tanggalmulai=$1,tanggalselesai=$2,kegiatan=$3 WHERE id=$4", [tanggalMulai, tanggalAkhir, kegiatan, id], err => {
                    if (err) {
                        throw err
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
            } else {
                ret = {
                    status: 400,
                    results: 'Parameter Kurang'
                };
                res.status(400).json(ret);
            }
        } else {
            ret = {
                status: 401,
                results: 'Maneh Sokap wak! Bukan admin maneh!'
            };
            res.status(401).json(ret)
        }
    } catch (e) {
        res.send(e.message)
    }
});
router.delete('/jadwal/:id', function (req,res) {
    let ret;
    try{
        if (verifyToken(req)) {
            const id = req.params.id;
            pool.query("DELETE FROM jadwal WHERE id=$1", [id], err => {
                if (err) {
                    throw err
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
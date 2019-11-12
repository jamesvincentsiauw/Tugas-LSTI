var express = require('express');
var router = express.Router();
const Pool = require('pg').Pool;
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/register', function (req, res) {
    let ret;
    try{
        const id = req.body.id;
        const namapendaftar = req.body.nama;
        const alamat = req.body.alamat;
        const fakultas = req.body.fakultas;
        const ttl = req.body.ttl;
        const tingkat = req.body.tingkat;
        const jalur = req.body.jalur;
        const date = new Date();
        pool.query("INSERT INTO peserta(idpendaftar,namapendaftar,tanggaldaftar,alamat,fakultas,tempattanggallahir,tingkat,jalur) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",[id,namapendaftar,date,alamat,fakultas,ttl,tingkat,jalur],(err, result) => {
            if (err){
                ret={
                        status: err.code,
                        results: err.message
                    };
                    res.json(ret)
            }
            else {
                ret={
                        status: 200,
                        description:'Data Inserted',
                        results: result.rows
                    };
                    res.status(200).json(ret);
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
module.exports = router;

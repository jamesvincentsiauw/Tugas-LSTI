var express = require('express');
var router = express.Router();
const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'lasti',
    host: '178.128.104.74',
    database: 'pengelolaanjalurseleksipmb',
    password: '2a099e69',
    port: 40010
});

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/register', function (req, res) {
    let ret;
    try{
        const id = req.body.id;
        const namapendaftar = req.body.nama;
        const date = new Date();
        pool.query("INSERT INTO peserta(idpendaftar,namapendaftar,tanggaldaftar) VALUES ($1,$2,$3)",[id,namapendaftar,date],(err, result) => {
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

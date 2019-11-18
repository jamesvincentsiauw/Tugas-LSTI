var express = require('express');
var router = express.Router();
var randomize = require('randomatic');
var bcrypt = require('bcrypt');
var md5 = require('md5');
const Pool = require('pg').Pool;
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

router.post('/login', function(req, res) {
    let ret;
    if (req.session.loggedIn === false || req.session.loggedIn === undefined) {
        const username = req.body.username;
        const password = md5(req.body.password);
        pool.query("SELECT * FROM peserta WHERE username=$1 AND password=$2", [username, password], (err, result) => {
            if (!err) {
                if (result.rowCount > 0) {
                    req.session.loggedIn = true;
                    req.session.user = result.rows[0];
                    ret = {
                        status: 200,
                        sessionID: req.session.id,
                        results: 'Berhasil Login ' + username,
                    };
                    res.status(200).json(ret);
                } else {
                    ret = {
                        status: 200,
                        description: 'Anda belum terdaftar sebagai user',
                    };
                    res.status(200).json(ret);
                }
            } else {
                ret = {
                    status: err.code,
                    description: err.message,
                };
                res.status(err.code).json(ret)
            }
        });
    }
    else{
        ret = {
            status: 400,
            description: 'Anda Sudah LoggedIn'
        };
        res.status(400).json(ret);
    }
    console.log(req.session)
});

router.post('/logout',function (req,res) {
    console.log(req.session.loggedIn);
    if (req.session.loggedIn === true){
        req.session.loggedIn = false;
        ret ={
            status: 200,
            results: 'Berhasil Logout',
        };
        res.status(200).json(ret);
        console.log(req.session.loggedIn)
    }
    else {
        ret ={
            status: 200,
            results: 'Anda belum Login!',
        };
        res.status(200).json(ret);
        console.log(req.session.loggedIn)
    }
});
router.post('/register', function (req, res) {
    let ret;
    try{
        pool.query("SELECT * FROM peserta WHERE username=$1",[req.body.username],(err,result)=>{
            if (!err) {
                if (result.rows.length === 0) {
                    const id = randomize('A0', 30);
                    const namapendaftar = req.body.nama;
                    const alamat = req.body.alamat;
                    const fakultas = req.body.fakultas;
                    const ttl = req.body.ttl;
                    const tingkat = req.body.tingkat;
                    const jalur = req.body.jalur;
                    const date = new Date();
                    const username = req.body.username;
                    const email = req.body.email;
                    const password = md5(req.body.password);
                    pool.query("INSERT INTO peserta(idpendaftar,namapendaftar,tanggaldaftar,alamat,fakultas,tempattanggallahir,tingkat,jalur,email,username,password) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [id, namapendaftar, date, alamat, fakultas, ttl, tingkat, jalur, email, username, password], (err, result) => {
                        if (err) {
                            ret = {
                                status: err.code,
                                results: err.message
                            };
                            res.json(ret)
                        } else {
                            ret = {
                                status: 200,
                                description: 'User Registered',
                                results: result.rows
                            };
                            res.status(200).json(ret);
                        }
                    })
                } else {
                    ret = {
                        status: 200,
                        description: 'Username Sudah Terdaftar',
                        results: []
                    };
                    res.status(200).json(ret);
                }
            }
            else{
                ret = {
                    status: err.code,
                    description: err.message
                };
                res.status(err.code).json(ret);
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
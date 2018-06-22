var express = require('express');
var bcrypt = require('bcryptjs');
var jwt =require('jsonwebtoken');

var SEED =require('../config/config').SEED;

var app=express();

var Usuario=require('../models/usuario');


// metodo para autenticarse:

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({
        email: body.email
    }, (err, ususrioDB) => {

        if (err) {
            return res.status(500).json({
                hasError: true,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!ususrioDB) {
            return res.status(400).json({
                hasError: true,               
                mensaje: 'Credenciales incorrectas',
                errors: {
                    mensaje: 'El correo es incorrecto'
                }
            });
        }
        if (!bcrypt.compareSync(body.password, ususrioDB.password)) {
            return res.status(400).json({
                hasError: true,
                mensaje: 'Credenciales incorrectas',
                errors: {
                    mensaje: 'El password es incorrecto'
                }
            });
        }
// crear un toquen
ususrioDB.password=':)';
var token =jwt.sign({usuario: ususrioDB}, SEED ,{expiresIn:14400}); // 4 horas


        res.status(200).json({
            hasError: false,
            ususrio: ususrioDB,
            token:token,
            id: ususrioDB._id
        });

    });
});













module.exports = app;
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');


// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;

const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// Login Google:
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        imp: payload.picture,
        google: true
    };

}

app.post('/google', async (req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                hasError: true,
                mensaje: 'Token no Valido',
                error: e

            });


        });

    Usuario.findOne({
            email: googleUser.email
        }, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    hasError: true,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }

            if (usuarioDB) {

                if (!usuarioDB.google) {
                    return res.status(400).json({
                        hasError: true,
                        mensaje: 'Debe usar su autenticación nomral',
                        errors: err
                    });
                } else {
                   // generar un nuevo token
                    var token = jwt.sign({
                        usuario: usuarioDB
                    }, SEED, {
                        expiresIn: 14400
                    }); // 4 horas

                    return res.status(200).json({
                        hasError: false,
                        mensaje:'El usuario ya existe',
                         usuario: usuarioDB,
                         token: token,
                         id: usuarioDB._id
                    });
                }

            } else {
                // el usuario no existe hay que crearlo
                var usuario = new Usuario();
                usuario.nombre = googleUser.nombre,
                    usuario.email = googleUser.email,
                    usuario.img = googleUser.picture,
                    usuario.google = true,
                    usuario.password = ';)';

                usuario.save((err, usuarioDB) => {
                    // generar un nuevo token
                    var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400}); // 4 horas
                    res.status(200).json({
                        hasError: false,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                    });
                });
            }
        return res.status(200).json({
            hasError: false,
            mensaje: 'Logado por Google',
            errors: err
        });
    });
// return res.status(500).json({
//     hasError: false,
//     mensaje: 'Ok logeado por googleee',
//     googleUser: googleUser
// });
});


// metodo para autenticarse Normal:

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
        ususrioDB.password = ':)';
        var token = jwt.sign({
            usuario: ususrioDB
        }, SEED, {
            expiresIn: 14400
        }); // 4 horas


        res.status(200).json({
            hasError: false,
            ususrio: ususrioDB,
            token: token,
            id: ususrioDB._id
        });

    });
});









module.exports = app;
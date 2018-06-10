var express = require('express');
var bcrypt = require('bcryptjs');


var mdAutenticacion= require('../midelwares/autenticacion');
var app=express();

var Usuario=require('../models/usuario');




// GET obtener usuarios, 
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec((err, usuarios ) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando Usuarios',
                    errors: err
                });
            }

            if (usuarios.length === 0) {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'No hay usuarios'
                });
            }
            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        });
});



//PUT Actualizr Usuario
app.put('/:id',mdAutenticacion.verificaToken , (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: ' + id + ' no existe.',
                errors: {
                    messaje: 'No existe un usuario con ese ID'
                }
            });
        }


  
// como el usuarioexiste modifico los campos:
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con el id: ' + id + ' no existe.',
                    errors: {messaje: 'No existe un usuario con ese ID'}
                });
            }
            // para no enviar el password aunque esté encriptado
            usuarioGuardado.password = ':)'; 
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });

});


//POST crear un usuario

app.post('/',mdAutenticacion.verificaToken ,(req, res) => {

    var body = req.body;

    usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });



    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken:req.usuario
        });

    });

});


// Eliminar un usuaroio:

app.delete('/:id',mdAutenticacion.verificaToken , (req , res)=>{
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar el usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: ' + id + ' no existe.',
                errors: {messaje: 'No existe un usuario con ese ID'}
            });
        }
        // si regresa un usuario es que se ha borrado, si no regresa ningún usuario es que no había ninguno
            return res.status(200).json({
                ok: true,
                usuario:usuarioBorrado
            });
    });
});


module.exports = app;
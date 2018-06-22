var express = require('express');


var mdAutenticacion= require('../midelwares/autenticacion');
var app=express();

var Medico=require('../models/medico');




// GET obtener medicos, 
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre img usuario hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario','nombre email')
        .populate('hospital')
        .exec((err, medicos ) => {

            if (err) {
                return res.status(500).json({
                    hasError: true,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            if (medicos.length === 0) {
                return res.status(200).json({
                    hasError: true,
                    mensaje: 'No hay medicoes en la base de datos'
                });
            }

            Medico.count({},(err,n_regisros)=>{
                res.status(200).json({
                    hasError: false,
                    medicos: medicos,
                    total:n_regisros
                });
            });
        });
});




//PUT Actualizr medico
app.put('/:id',[mdAutenticacion.verificaToken,
                mdAutenticacion.soloAdminRol] , (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                hasError: true,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                hasError: true,
                mensaje: 'El medico con el id: ' + id + ' no existe.',
                errors: {
                    messaje: 'No existe un medico con ese ID'
                }
            });
        }


  
// como el medico existe modifico los campos:
        medico.nombre = body.nombre;
        medico.usuario = req.usuario;
        medico.hospital = body.hospital;


        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    hasError: true,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }
           
           
            // para no enviar el password aunque esté encriptado
   
            res.status(200).json({
                hasError: false,
                medico: medicoGuardado
            });
        });

    });

});


//POST crear un medico

app.post('/',[mdAutenticacion.verificaToken,
    mdAutenticacion.soloAdminRol]  ,(req, res) => {

    var body = req.body;


    var medico = new Medico({
            nombre: body.nombre,
            img: body.img,
            usuario:req.usuario,
            hospital: body.hospital
        
        });


        medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                hasError: true,
                mensaje: 'Error al crear El Medico',
                errors: err
            });
        }

        res.status(201).json({
            hasError: false,
            medico: medicoGuardado,
            usuarioToken:req.usuario
        });

    });



});


// Eliminar un medico:

app.delete('/:id',[mdAutenticacion.verificaToken,
    mdAutenticacion.soloAdminRol]  , (req , res)=>{
    var id = req.params.id;



    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                hasError: true,
                mensaje: 'Error al Borrar el medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                hasError: true,
                mensaje: 'El medico con el id: ' + id + ' no existe.',
                errors: {messaje: 'No existe un medico con ese ID'}
            });
        }
        // si regresa un usuario es que se ha borrado, si no regresa ningún usuario es que no había ninguno
            return res.status(200).json({
                hasError: false,
                usuario:medicoBorrado
            });
    });
});


module.exports = app;
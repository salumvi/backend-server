var express = require('express');


var mdAutenticacion= require('../midelwares/autenticacion');
var app=express();

var Hospital=require('../models/hospital');




// GET obtener hospitales, 
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales ) => {

            if (err) {
                return res.status(500).json({
                    hasError: true,
                    mensaje: 'Error cargando Hospitales',
                    errors: err
                });
            }

            if (hospitales.length === 0) {
                return res.status(200).json({
                    hasError: true,
                    mensaje: 'No hay hospitales en la base de datos'
                });
            }

            Hospital.count({},(err,n_hospitales)=>{
                res.status(200).json({
                    hasError: false,
                    hospitales: hospitales,
                    total:n_hospitales
                });
            });
        });
});




//PUT Actualizr Hospital
app.put('/:id',[mdAutenticacion.verificaToken,
                mdAutenticacion.soloAdminRol] , (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                hasError: true,
                mensaje: 'Error al buscar el hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                hasError: true,
                mensaje: 'El hospital con el id: ' + id + ' no existe.',
                errors: {
                    messaje: 'No existe un hospital con ese ID'
                }
            });
        }


  
// como el hospital existe modifico los campos:
        hospital.nombre = body.nombre;
        hospital.usuario = recody._id;


        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    hasError: true,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }
           
           
            // para no enviar el password aunque esté encriptado
   
            res.status(200).json({
                hasError: false,
                hospital: hospitalGuardado
            });
        });

    });

});


//POST crear un Hospital

app.post('/',[mdAutenticacion.verificaToken,
    mdAutenticacion.soloAdminRol]  ,(req, res) => {

    var body = req.body;


    hospital = new Hospital({
            nombre: body.nombre,
            img: body.img,
            usuario:req.usuario
        
        });


        hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                hasError: true,
                mensaje: 'Error al crear Hospitas',
                errors: err
            });
        }

        res.status(201).json({
            hasError: false,
            hospital: hospitalGuardado,
            usuarioToken:req.usuario
        });

    });



});


// Eliminar un hospital:

app.delete('/:id',[mdAutenticacion.verificaToken,
    mdAutenticacion.soloAdminRol]  , (req , res)=>{
    var id = req.params.id;



    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                hasError: true,
                mensaje: 'Error al Borrar el usuario',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                hasError: true,
                mensaje: 'El hospital con el id: ' + id + ' no existe.',
                errors: {messaje: 'No existe un hopital con ese ID'}
            });
        }
        // si regresa un usuario es que se ha borrado, si no regresa ningún usuario es que no había ninguno
            return res.status(200).json({
                hasError: false,
                usuario:hospitalBorrado
            });
    });
});


module.exports = app;
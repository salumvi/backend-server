var express = require('express');
var app = express();

var Hospial = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');



// busqueda en colección de hospitales

app.get('/:coleccion/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var coleccion = req.params.coleccion;
    var regex = new RegExp(busqueda, 'i');
    var promesa;


    switch (coleccion) {
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        default:
            return res.status(200).json({
                hasError: true,
                mensaje: 'no existe ninguna colección del tipo: ' + coleccion
            });

    }


    promesa.then(data => {
        res.status(200).json({
            hasError: false,
            [coleccion]: data
        });
    });

});

// busqueda en colección de medicos

app.get('/medicos/:busqueda',(req,res,next)=>{

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    buscarMedicos(busqueda,regex)
        .then(medicos=>{
            if(medicos.length===0){
                    res.status(200).json({
                    hasError: true,
                    mensaje: 'No hay medicos por ese término'
                });
            }else{
                    res.status(200).json({
                        hasError:false,
                        medicos:medicos
                    });  
            }
        });

});


// busqueda en colección de usuarios

app.get('/usuarios/:busqueda',(req,res,next)=>{

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    buscarUsuarios(busqueda,regex)
        .then(usuarios=>{
            if(usuarios.length===0){
                    res.status(200).json({
                    hasError: true,
                    mensaje: 'No hay usuarios por ese término'
                });
            }else{
                    res.status(200).json({
                        hasError:false,
                        usuarios:usuarios
                    });  
            }
        });

});


// Busqueda en cualquier colección
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                hasError: false,
                parametro: busqueda,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuario:respuestas[2]
            });
        });

});


function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospial.find({nombre: regex})
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

            if (err) {
                reject('Error al cargar hospitales', err);
            } else {
                resolve(hospitales);
            }
        });

    });

}


function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({nombre: regex})
            .populate('usuario','nombre email')
            .populate('hospital','nombre')
            .exec((err, medicos) => {
            if (err) {
                reject('Error al cargar Medicos', err);
            } else {
                resolve(medicos);
            }
        });
    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({},'nombre email img role')
        .or([{'nombre': regex},{'email': regex}]) // Buscamos por dos campos
        .exec((err, usuario) => {

            if (err) {
                reject('Error al cargar usuario', err);
            } else {
                resolve(usuario);
            }
        });
    });
}


module.exports = app;
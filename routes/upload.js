var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();
// default options
app.use(fileUpload());

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.put('/:tipo/:id', (req, res, next) => {

    var id = req.params.id;
    var tipo = req.params.tipo;
    var tipos = ['medicos', 'hospitales', 'usuarios'];

    if (tipos.indexOf(tipo) < 0) {
        return res.status(400).json({
            hasError: true,
            mensaje: 'no es un tipo valido',
            errors: {
                message: 'No es un tipo valido de coleción'
            }
        });

    }

    if (!req.files) {
        return res.status(400).json({
            hasError: true,
            mensaje: 'Error no hay archivos que cargar',
            errors: {
                message: 'debe seleccionar una imagen'
            }
        });
    }

    // obtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    // Extensiones validas
    var extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];


    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            hasError: true,
            mensaje: 'Extension no válida',
            errors: {
                message: 'las extensiones validas son: ' + extensionesValidas.join(', ')
            }
        });
    }

    // nombre de archivo personalizado

    var nombreArchivo = `${id}-${new Date().getTime()}.${extension}`;

    // mover el achivo a una carpeta 
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                hasError: true,
                mensaje: 'Error al moveer archivo',
                errors: err
            });
        }
        moverArchivoTipo(tipo, id, nombreArchivo, res)

    });




});

function moverArchivoTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            // if (err) {
            //     return res.status(400).json({
            //         hasError: true,
            //         mensaje: 'Se ha producido un error',
            //     });
            // }
            if (!usuario) {
                return res.status(400).json({
                    hasError: true,
                    mensaje: 'El usuario no existe',
                    errors:{message: 'El usuario no existe'}
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;
            var borrado = 'KO';
            // Boramos la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
                borrado = 'OK';
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                // if (err) {
                //     res.status(500);
                // }
                usuarioActualizado.password= ':)';
                return res.status(200).json({
                    hasError: false,
                    mensaje: 'Imagen de usuario Actualizad',
                    usuario: usuarioActualizado,
                    pathViejo: pathViejo,
                    borrado: borrado
                });

            });

        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (err) {
                return res.status(400).json({
                    hasError: true,
                    mensaje: 'Se ha producido un error',
                });
            }
            if (!medico) {
                return res.status(400).json({
                    hasError: true,
                    mensaje: 'El medico no existe',
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;
            var borrado = 'KO';
            // Boramos la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
                borrado = 'OK';
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                // if (err) {
                //     res.status(500);
                // }

                return res.status(200).json({
                    hasError: false,
                    mensaje: 'Imagen de usuario Actualizad',
                    usuario: medicoActualizado,
                    pathViejo: pathViejo,
                    borrado: borrado
                });

            });

        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(400).json({
                    hasError: true,
                    mensaje: 'Se ha producido un error',
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    hasError: true,
                    mensaje: 'El hospital no existe',
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;
            var borrado = 'KO';
            // Boramos la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
                borrado = 'OK';
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                // if (err) {
                //     res.status(500);
                // }

                return res.status(200).json({
                    hasError: false,
                    mensaje: 'Imagen de hospital Actualizad',
                    usuario: hospitalActualizado,
                    pathViejo: pathViejo,
                    borrado: borrado
                });

            });

        });
    }

    // res.status(200).json({
    //     hasError: false,
    //     mensaje: 'archivo movido correctamente',

    // });
}



module.exports = app;
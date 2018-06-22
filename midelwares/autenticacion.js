var jwt =require('jsonwebtoken');

var SEED =require('../config/config').SEED;






// Vareficar token MidelWaRE

exports.verificaToken =function (req, res,next){
    var token = req.query.token;


    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                hasError: true,
                mensaje: 'Token no válido, No autorizado',
                errors: err
            });
        }

        req.usuario=decoded.usuario;
        next();

    });
};


// Verificar ADIMN_ROLE

exports.soloAdminRol = function( req,res,next){

    if(req.usuario.role!='ADMIN_ROLE'){
        return res.status(401).json({
            hasError: true,
            error: 'Acceso no autorizado, su role no puede crear Hospitales'
            
        });
    }
    next();
}

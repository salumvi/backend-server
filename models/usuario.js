var mongoose= require('mongoose');
var uniqueValidaor= require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE' , 'USER_ROLE' ],
    message: '{VALUE} no es un ROLE válido'
};



var usuarioSchema =new Schema({
    nombre: {type: String, required: [true, 'El nombre es necesario']},
    email: {type: String, unique: true, required: [true, 'El correo es necesario']},
    password: {type: String, required: [true, 'La contraseña es necesaria']},
    img: {type: String, required: false},
    role: {type: String, required: true, default: "USER_ROLE", enum: rolesValidos},
    google:{type:Boolean, default: false}

});

usuarioSchema.plugin(uniqueValidaor , { message: 'El campo {PATH} debe ser unico'});

module.exports= mongoose.model('Usuario', usuarioSchema);
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const bcrypt = require("bcrypt");

const usuariosSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    unique: true,
    trim: true,
  },
  token: String,
  expira: Date,
  imagen: String,
});

//Metodo para hashear los passwords
usuariosSchema.pre("save", async function (next) {
  //Si el password ya esta hasheado
  if (!this.isModified("password")) {
    return next(); //Detener la ejecución
  }
  //Si no esta hasheado
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});
//Envia alerta cuando un uduario ya esta registrado
usuariosSchema.post("save", function (error, doc, next) {
  // if (error.name === "MongoError" && error.code === 11000) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next("Ese correo ya esta registrado");
  } else {
    next(error);
  }
});
//Autenticar Usuarios
usuariosSchema.methods = {
  compararPassword: function (password) {
    return bcrypt.compareSync(password, this.password);
  },
};

module.exports = mongoose.model("Usuarios", usuariosSchema);

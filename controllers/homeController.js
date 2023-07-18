const mongoose = require("mongoose");
const Vacante = mongoose.model("Vacante");

exports.mostrarTrabajos = async (req, res) => {
  const vacantes = await Vacante.find();

  if (!vacantes) return next();

  res.render("home", {
    nombrePagina: "Jobs Developers",
    tagline: "Encuentra y Publica Trabajos para Desarrolladores Web",
    barra: true,
    boton: true,
    vacantes,
  });
};

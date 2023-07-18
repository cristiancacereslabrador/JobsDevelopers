//Hay dos formas de importar con mongoose
//1ra
// const Vacante = require('../models/Vacantes')
//2da
const mongoose = require("mongoose");
const Vacante = mongoose.model("Vacante");
const multer = require("multer");
const shortid = require("shortid");

exports.formularioNuevaVacante = (req, res) => {
  // res.send("funcionaaaaa");
  res.render("nueva-vacante", {
    nombrePagina: "Nueva Vacante",
    tagline: "Llena el formulario y publica tu vacante",
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
  });
};

//Agrega las vacantes a las bases de datos
exports.agregarVacante = async (req, res) => {
  const vacante = new Vacante(req.body);
  // console.log("req.body", req.body);
  //Usuario autor de la vacante
  vacante.autor = req.user._id;

  //Crear arreglo de habilidades (skills)
  vacante.skills = req.body.skills.split(",");
  // console.log("vacante", vacante);
  const nuevaVacante = await vacante.save();
  //Redireccionar
  res.redirect(`/vacantes/${nuevaVacante.url}`);
};
//Muestra una vacante
exports.mostrarVacante = async (req, res, next) => {
  const vacante = await Vacante.findOne({ url: req.params.url }).populate(
    "autor"
  );
  // console.log("vacante", vacante);

  //Si no hay resultados
  if (!vacante) return next();

  res.render("vacante", { vacante, nombrePagina: vacante.titulo, barra: true });
};

exports.formEditarVacante = async (req, res, next) => {
  const vacante = await Vacante.findOne({ url: req.params.url });

  if (!vacante) return next();

  res.render("editar-vacante", {
    vacante,
    nombrePagina: `Editar- ${vacante.titulo}`,
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
  });
};

exports.editarVacante = async (req, res) => {
  const vacanteActualizada = req.body;

  vacanteActualizada.skills = req.body.skills.split(",");

  console.log("vacanteActualizada", vacanteActualizada);

  const vacante = await Vacante.findOneAndUpdate(
    { url: req.params.url },
    vacanteActualizada,
    {
      new: true,
      runValidators: true,
    }
  );
  res.redirect(`/vacantes/${vacante.url}`);
};

//Validad y Sanitizar los campos de las nuevas vacantes
exports.validarVacante = (req, res, next) => {
  //Sanitizar los campos
  req.sanitizeBody("titulo").escape();
  req.sanitizeBody("empresa").escape();
  req.sanitizeBody("ubicacion").escape();
  req.sanitizeBody("salario").escape();
  req.sanitizeBody("contrato").escape();
  req.sanitizeBody("skills").escape();

  //Validar
  req.checkBody("titulo", "Agrega un Titulo a la Vacante").notEmpty();
  req.checkBody("empresa", "Agrega una Empresa").notEmpty();
  req.checkBody("ubicacion", "Agrega una Ubicación").notEmpty();
  req.checkBody("contrato", "Selecciona el Tipo de Contrato").notEmpty();
  req.checkBody("skills", "Agrega al menos una habilidad").notEmpty();

  const errores = req.validationErrors();
  if (errores) {
    req.flash(
      "error",
      errores.map((error) => error.msg)
    );
    res.render("nueva-vacante", {
      nombrePagina: "Nueva Vacante",
      tagline: "Llena el formulario y publica tu vacante",
      cerrarSesion: true,
      nombre: req.user.nombre,
      mensajes: req.flash(),
    });
    return;
  }
  next(); //siguiente middleware
};
//ORIGINAL
// exports.eliminarVacante = async (req, res) => {
//   const { id } = req.params;
//   const vacante = await Vacante.findById(id);
//   // console.log("vacante", vacante);
//   if (verificarAutor(vacante, req.user)) {
//     //To do bien, si es el usuario, eliminalo
//     vacante.remove();
//     res.status(200).send("Vacante Eliminada Correctamente");
//   } else {
//     //No permitido
//     res.status(403).send("Error");
//   }
//   // console.log("id", id);
// };

exports.eliminarVacante = async (req, res) => {
  const { id } = req.params;
  const vacante = await Vacante.findById(id);

  if (verificarAutor(vacante, req.user)) {
    // Eliminar la vacante de la base de datos
    await Vacante.deleteOne({ _id: id });

    res.status(200).send("Vacante eliminada correctamente");
  } else {
    res.status(403).send("Error: No tienes permiso para eliminar esta vacante");
  }
};

const verificarAutor = (vacante = {}, usuario = {}) => {
  if (!vacante.autor.equals(usuario._id)) {
    return false;
  }
  return true;
};

//Subir archivo en PDf
exports.subirCV = (req, res, next) => {
  upload(req, res, function (error) {
    // console.log("error", error);
    if (error) {
      // console.log("error", error);
      if (error instanceof multer.MulterError) {
        // return next();
        if (error.code === "LIMIT_FILE_SIZE") {
          req.flash("error", "El archivo es muy grande: máximo 100KB");
        } else {
          req.flash("error", error.message);
        }
      } else {
        // console.log("error.message", error.message);
        req.flash("error", error.message);
      }
      res.redirect("back");
      return;
    } else {
      return next();
    }
  });
  // next();
};

const configuracionMulter = {
  limits: { fileSize: 100000 },
  storage: (fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname + "../../public/uploads/cv");
    },
    filename: (req, file, cb) => {
      // console.log("file", file);
      const extension = file.mimetype.split("/")[1];
      // console.log(`${shortid.generate()}.${extension}`);
      cb(null, `${shortid.generate()}.${extension}`);
    },
  })),
  fileFilter(req, file, cb) {
    if (file.mimetype === "application/pdf") {
      //El callback se ejecuta como true o false: true cuando la imagen se acepta
      cb(null, true);
    } else {
      // cb(new Error("Formato No Válido"), false);
      cb(new Error("Formato No Válido"));
    }
  },
};

const upload = multer(configuracionMulter).single("cv");

//Almacenar los candidatos en la base de datos
exports.contactar = async (req, res, next) => {
  console.log("req.params.url", req.params.url);
  const vacante = await Vacante.findOne({ url: req.params.url });
  //Si no existe la vacante
  if (!vacante) {
    return next();
  }
  //To do esta bien, construi el nuevo objeto
  const nuevoCandidato = {
    nombre: req.body.nombre,
    email: req.body.email,
    cv: req.file.filename,
  };
  //Almacenar la vacante
  vacante.candidatos.push(nuevoCandidato);
  await vacante.save();

  //Mensajes flash y redireccion
  req.flash("correct", "Se envió tu Curriculum Correctamente");
  res.redirect("/");
};

exports.mostrarCandidatos = async (req, res, next) => {
  // console.log("req.params.id", req.params.id);
  const vacante = await Vacante.findById(req.params.id);
  // console.log("vacante", vacante);
  // console.log("vacante.autor", vacante.autor);
  // console.log("req.user._id", req.user._id);

  // console.log("typeof vacante.autor", typeof vacante.autor);
  // console.log("typeof req.user._id", typeof req.user._id);

  // return;
  if (vacante.autor != req.user._id.toString()) {
    // console.log("Es un hacker");
    return next();
  }
  if (!vacante) {
    return next();
  }
  // console.log("Pasamos la validación");
  res.render("candidatos", {
    nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    candidatos: vacante.candidatos,
  });
};

//Buscador de vacantes
exports.buscarVacantes = async (req, res) => {
  const vacantes = await Vacante.find({
    $text: {
      $search: req.body.q,
    },
  });
  // console.log("vacante", vacante);
  //Mostrar vacantes
  res.render("home", {
    nombrePagina: `Resultados para la búsqueda: ${req.body.q}`,
    barra: true,
    vacantes,
  });
};

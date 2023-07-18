const { sanitizeBody } = require("express-validator/filter");
const mongoose = require("mongoose");
const Usuarios = mongoose.model("Usuarios");
const multer = require("multer");
const shortid = require("shortid");

//Opciones de Multer
const configuracionMulter = {
  limits: { fileSize: 100000 },
  storage: (fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname + "../../public/uploads/perfiles");
    },
    filename: (req, file, cb) => {
      // console.log("file", file);
      const extension = file.mimetype.split("/")[1];
      // console.log(`${shortid.generate()}.${extension}`);
      cb(null, `${shortid.generate()}.${extension}`);
    },
  })),
  fileFilter(req, file, cb) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      //El callback se ejecuta como true o false: true cuando la imagen se acepta
      cb(null, true);
    } else {
      cb(new Error("Formato No Válido"), false);
    }
  },
};

exports.subirImagen = (req, res, next) => {
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
      res.redirect("/administracion");
      return;
    } else {
      return next();
    }
  });
  // next();
};

const upload = multer(configuracionMulter).single("imagen");

exports.formCrearCuenta = (req, res) => {
  res.render("crear-cuenta", {
    nombrePagina: "Crea tu cuenta en devJobs",
    tagline:
      "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta",
  });
};

// const { body, sanitizeBody, validationResult } = require("express-validator");

// exports.validarRegistro = async (req, res, next) => {
//   const rules = [
//     body("nombre").notEmpty().withMessage("El nombre es obligatorio").escape(),
//     body("email").isEmail().withMessage("El email debe ser válido").escape(),
//     body("password")
//       .notEmpty()
//       .withMessage("La contraseña no puede estar vacía")
//       .escape(),
//     body("confirmar")
//       .notEmpty()
//       .withMessage("Confirmar contraseña no puede estar vacío")
//       .escape()
//       .custom((value, { req }) => {
//         if (value !== req.body.password) {
//           throw new Error("Las contraseñas no coinciden");
//         }
//         return true;
//       }),
//   ];

//   await Promise.all(rules.map((validation) => validation.run(req)));

//   const errores = validationResult(req);

//   if (errores.isEmpty()) {
//     return next();
//   }

//   req.flash(
//     "error",
//     errores.array().map((error) => error.msg)
//   );

//   res.render("crear-cuenta", {
//     nombrePagina: "Crea tu cuenta en devJobs",
//     tagline:
//       "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta",
//     mensajes: req.flash(),
//   });
//   return;
// };
exports.validarRegistro = async (req, res, next) => {
  //VER 5.3.1
  //Sanitizar o mutar los datos
  req.sanitize("nombre").escape();
  req.sanitizeBody("email").escape();
  req.sanitizeBody("password").escape();
  req.sanitizeBody("confirmar").escape();
  //Validar
  req.checkBody("nombre", "El nombre es Obligatorio").notEmpty();
  req.checkBody("email", "El email debe ser válido").isEmail();
  req.checkBody("password", "El password no puede ir vacío").notEmpty();
  req.checkBody("confirmar", "Confirmar password no puede ir vacío").notEmpty();
  req
    .checkBody("confirmar", "El password es diferente")
    .equals(req.body.password);

  const errores = req.validationErrors();
  // console.log("errores", errores);
  // return;
  if (errores) {
    //Si hay errores
    // console.log("errores", errores);
    req.flash(
      "error",
      errores.map((error) => error.msg)
    );
    res.render("crear-cuenta", {
      nombrePagina: "Crea tu cuenta en devJobs",
      tagline:
        "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta",
      mensajes: req.flash(),
    });
    return;
  }
  //Si toda la validación es correcta
  next();
  //VER 5.3.1
  // const rules = [
  //   // sanitizeBody("nombre").escape(),
  //   // sanitizeBody("email").escape(),
  //   // sanitizeBody("password").escape(),
  //   // sanitizeBody("confirmar").escape(),
  //   body("nombre")
  //     .not()
  //     .isEmpty()
  //     .withMessage("El nombre es Obligatorio")
  //     .escape(),
  //   body("email").isEmail().withMessage("El email debe ser valido").escape(),
  //   body("password")
  //     .not()
  //     .isEmpty()
  //     .withMessage("El password no puede ir vacío")
  //     .escape(),
  //   body("confirmar")
  //     .not()
  //     .isEmpty()
  //     .withMessage("Confirmar password no puede ir vacío")
  //     .escape(),
  //   body("confirmar")
  //     .equals(req.body.password)
  //     .withMessage("El password es diferente")
  //     .escape(),
  // ];
  // await Promise.all(rules.map((validation) => validation.run(req)));
  // const errores = validationResult(req);

  // if (errores.isEmpty()) {
  //   return next();
  // }
  // req.flash(
  //   "error",
  //   errores.array().map((error) => error.msg)
  // );
  // res.render("crear-cuenta", {
  //   nombrePagina: "Crea tu cuenta en devJobs",
  //   tagline:
  //     "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta",
  //   mensajes: req.flash(),
  // });
  // return;
};

exports.crearUsuario = async (req, res, next) => {
  //Crear el usuario
  const usuario = new Usuarios(req.body);
  // console.log("usuario", usuario);
  // const nuevoUsuario = await usuario.save();
  try {
    await usuario.save();
    res.redirect("/iniciar-sesion");
  } catch (error) {
    // console.log("error", error);
    req.flash("error", error);
    res.redirect("/crear-cuenta");
  }
  // if (!nuevoUsuario) return next();
};

//Formulario para iniciar sesión
exports.formIniciarSesion = async (req, res) => {
  res.render("iniciar-sesion", {
    nombrePagina: "Iniciar Sesión Jobs Developers",
  });
};

//Form editar el perfil
exports.formEditarPerfil = function (req, res) {
  // console.log("editandoPerfil...");
  res.render("editar-perfil", {
    nombrePagina: "Edita tu perfil en Jobs Developers",
    usuario: req.user,
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
  });
};

//Guardar cambios editar perfil
exports.editarPerfil = async function (req, res) {
  const usuario = await Usuarios.findById(req.user._id);

  // console.log("usuario", usuario);
  usuario.nombre = req.body.nombre;
  usuario.email = req.body.email;
  if (req.body.password) usuario.password = req.body.password;
  // console.log("req.file", req.file);
  if (req.file) {
    usuario.imagen = req.file.filename;
  }
  await usuario.save();
  req.flash("correcto", "Cambios Guardados Correctamente");
  //Redirect
  res.redirect("/administracion");
};

//Sanitizar y validad formulario de editar clientes
exports.validarPerfil = (req, res, next) => {
  //Sanitizar
  req.sanitizeBody("nombre").escape();
  req.sanitizeBody("email").escape();
  if (req.body.password) {
    req.sanitizeBody("password").escape();
  }
  //Validar
  req.checkBody("nombre", "El nombre no puede ir vacío").notEmpty();
  req.checkBody("email", "El correo no puede ir vacío").notEmpty();

  const errores = req.validationErrors();
  console.log("errores?", errores);
  if (errores) {
    req.flash(
      "error",
      errores.map((error) => error.msg)
    );

    res.render("editar-perfil", {
      nombrePagina: "Edita tu perfil en Jobs Developers",
      usuario: req.user,
      cerrarSesion: true,
      nombre: req.user.nombre,
      imagen: req.user.imagen,
      mensajes: req.flash(),
    });

    return;
  }

  next(); //xtodo bien, siguente middleware!
};

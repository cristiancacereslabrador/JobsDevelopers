const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const vacantesController = require("../controllers/vacantesController");
const usuariosController = require("../controllers/usuariosController");
const authController = require("../controllers/authController");

module.exports = () => {
  // router.get("/", (req, res) => {
  //   res.send("Funciona desde el index del router");
  // });
  router.get("/", homeController.mostrarTrabajos);
  //Crear Vacantes
  router.get(
    "/vacantes/nueva",
    authController.verificarUsuario,
    vacantesController.formularioNuevaVacante
  );
  router.post(
    "/vacantes/nueva",
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.agregarVacante
  );

  //Mostrar Vacante
  router.get("/vacantes/:url", vacantesController.mostrarVacante);

  //Editar vacante
  router.get(
    "/vacantes/editar/:url",
    authController.verificarUsuario,
    vacantesController.formEditarVacante
  );
  router.post(
    "/vacantes/editar/:url",
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.editarVacante
  );

  //Eliminar vacanres
  router.delete("/vacantes/eliminar/:id", vacantesController.eliminarVacante);

  //Crear cuentas
  router.get("/crear-cuenta", usuariosController.formCrearCuenta);
  router.post(
    "/crear-cuenta",
    usuariosController.validarRegistro,
    usuariosController.crearUsuario
  );

  //Autenticar Usuarios
  router.get("/iniciar-sesion", usuariosController.formIniciarSesion);
  router.post("/iniciar-sesion", authController.autenticarUsuario);

  //Cerrar Sesion
  router.get(
    "/cerrar-sesion",
    authController.verificarUsuario,
    authController.cerrarSesion
  );

  //Resetear Password (emails)
  router.get("/reestablecer-password", authController.formReestablecerPassword);
  router.post("/reestablecer-password", authController.enviarToken);

  //Resetear Password (Almacenar en la BD)
  router.get(
    "/reestablecer-password/:token",
    authController.reestablecerPassword
  );
  router.post("/reestablecer-password/:token", authController.guardarPassword);

  //Panel administración
  router.get(
    "/administracion",
    authController.verificarUsuario,
    authController.mostrarPanel
  );

  //Editar perfil
  router.get(
    "/editar-perfil",
    authController.verificarUsuario,
    usuariosController.formEditarPerfil
  );
  router.post(
    "/editar-perfil",
    authController.verificarUsuario,
    // usuariosController.validarPerfil,
    usuariosController.subirImagen,
    usuariosController.editarPerfil
  );

  //Recibir mensajes de candidatos
  router.post(
    "/vacantes/:url",
    vacantesController.subirCV,
    vacantesController.contactar
  );

  //Muestra los candidatos por vacante
  router.get(
    "/candidatos/:id",
    authController.verificarUsuario,
    vacantesController.mostrarCandidatos
  );

  //Buscador de vacantes
  router.post("/buscador", vacantesController.buscarVacantes);

  return router;
};

const emailConfig = require("../config/email");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const util = require("util");
const path = require("path");
const handlebars = require("handlebars");

let transport = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

// Configurar el motor de plantillas Handlebars
transport.use(
  "compile",
  hbs({
    viewEngine: {
      extName: ".handlebars",
      partialsDir: path.resolve(__dirname, "../views/emails/partials"),
      layoutsDir: path.resolve(__dirname, "../views/emails/layouts"),
      defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, "../views/emails"),
    extName: ".handlebars",
  })
);

exports.enviar = async (opciones) => {
  const opcionesEmail = {
    from: "Jobs Developers <noreply@jobsdevelopers.com>",
    to: opciones.usuario.email,
    subject: opciones.subject,
    template: opciones.archivo,
    context: {
      resetUrl: opciones.resetUrl,
    },
  };
  const sendMail = util.promisify(transport.sendMail).bind(transport);
  return sendMail(opcionesEmail);
};

// const emailConfig = require("../config/email");
// const nodemailer = require("nodemailer");
// const hbs = require("nodemailer-express-handlebars");
// const util = require("util");

// let transport = nodemailer.createTransport({
//   host: emailConfig.host,
//   port: emailConfig.port,
//   auth: {
//     user: emailConfig.user,
//     pass: emailConfig.pass,
//   },
// });

// //Utilizar template de handlebars
// transport.MailMessage.use(
//   "compile",
//   hbs({
//     viewEngine: handlebars,
//     viewPath: __dirname + "/../views/emails",
//     extName: ".handlebars",
//   })
// );

// exports.enviar = async (opciones) => {
//   const opcionesEmail = {
//     from: "Jobs Developers <noreply@jobsdevelopers.com",
//     to: opciones.usuario.email,
//     subject: opciones.subject,
//     template: opciones.archivo,
//     context: {
//       resetUrl: opciones.resetUrl,
//     },
//   };
//   const sendMail = util.promisify(transport.sendMail, transport);
//   return sendMail.call(transport, opcionesEmail);
// };

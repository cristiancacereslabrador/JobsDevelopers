const mongoose = require("mongoose");
require("./config/db");
const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const router = require("./routes");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
// const MongoStore = require("connect-mongo")(session);
const bodyParser = require("body-parser");
const expressValidator = require("express-validator"); //VER 5.3.1
const flash = require("connect-flash");
const createError = require("http-errors");
const passport = require("./config/passport");
const { body, validationResult } = require("express-validator");

require("dotenv").config({ path: "variables.env" });

const app = express();

//Habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Validación de campos
app.use(expressValidator()); //VER 5.3.1
// const { check, validationResult } = require("express-validator");

//Habilitar handlebars como view
// app.engine("handlebars", exphbs({ defaultLayout: "layout" }));
app.engine(
  "handlebars",
  exphbs.engine({
    layoutsDir: "./views/layouts/",
    defaultLayout: "layout",
    helpers: require("./helpers/handlebars"),
    extname: "handlebars",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);

app.set("view engine", "handlebars");

// static files
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

// app.use(
//   session({
//     secret: process.env.SECRETO,
//     key: process.env.KEY,
//     resave: false,
//     saveUninitialized: false,
//     store: new MongoStore({ mongooseConnection: mongoose.connection }),
//   })
// );
try {
  app.use(
    session({
      secret: process.env.SECRETO,
      key: process.env.KEY,
      resave: false,
      saveUninitialized: false,
      // store: new MongoStore({ mongooseConnection: mongoose.connection }),
      store: MongoStore.create({ mongoUrl: process.env.DATABASE }),
    })
  );
} catch (error) {
  console.error("Error al crear MongoStore:", error);
}

//Inicializar passport
app.use(passport.initialize());
app.use(passport.session());
//Alertas y flash messages
app.use(flash());
//Crear nuestro middleware
app.use((req, res, next) => {
  res.locals.mensajes = req.flash();
  next();
});

app.use("/", router());

//404 pagina no existente
app.use((req, res, next) => {
  next(createError(404, "No encontrado"));
});

//Administración de los errores
app.use((error, req, res) => {
  // console.log("error", error.message);
  res.locals.mensaje = error.message;
  const status = error.status || 500;
  // console.log("error.status", error.status);
  res.locals.status = status;
  res.status(status);
  res.render("error");
});

app.listen(process.env.PUERTO);

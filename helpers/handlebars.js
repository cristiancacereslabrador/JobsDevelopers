module.exports = {
  seleccionarSkills: (seleccionadas = [], opciones) => {
    // console.log("opciones.fn()", opciones.fn());
    // console.log("seleccionadas", seleccionadas);

    const skills = [
      "HTML5",
      "CSS3",
      "CSSGrid",
      "Flexbox",
      "JavaScript",
      "jQuery",
      "Node",
      "Angular",
      "VueJS",
      "ReactJS",
      "React Hooks",
      "Redux",
      "Apollo",
      "GraphQL",
      "TypeScript",
      "PHP",
      "Laravel",
      "Symfony",
      "Python",
      "Django",
      "ORM",
      "Sequelize",
      "Mongoose",
      "SQL",
      "MVC",
      "SASS",
      "WordPress",
    ];
    let html = "";
    skills.forEach((skill) => {
      html += `<li ${
        seleccionadas.includes(skill) ? ' class="activo"' : ""
      }>${skill}</li>`;
    });
    return (opciones.fn().html = html);
  },
  tipoContrato: (seleccionado, opciones) => {
    // console.log("seleccionado", seleccionado);
    // console.log("opciones.fn()", opciones.fn());
    return opciones
      .fn(this)
      .replace(new RegExp(` value="${seleccionado}"`), '$& selected=selected"');
  },
  mostrarAlertas: (errores = {}, alertas) => {
    // console.log("errores", errores);
    // console.log("====================");
    const categoria = Object.keys(errores);
    // console.log("errores[categoria]", errores[categoria]);
    // console.log("categoria", categoria);
    let html = "";
    if (categoria.length) {
      errores[categoria].forEach((error) => {
        html += `<div class="${categoria} alerta">${error}</div>`;
      });
    }
    // console.log("html", html);
    // console.log("alertas.fn()", alertas.fn());
    return (alertas.fn().html = html);
  },
};

import axios from "axios";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
  const skills = document.querySelector(".lista-conocimientos");
  //Limpiar las alertas
  let alertas = document.querySelector(".alertas");
  if (alertas) {
    limpiarAlertas();
  }

  if (skills) {
    skills.addEventListener("click", agregarSkills);
    //Una vez estamos en editar, llamar la función
    skillsSeleccionados();
  }
  const vacantesListado = document.querySelector(".panel-administracion");

  if (vacantesListado) {
    vacantesListado.addEventListener("click", accionesListado);
  }
});

const skills = new Set();

const agregarSkills = (e) => {
  // console.log("e.target", e.target);
  if (e.target.tagName === "LI") {
    if (e.target.classList.contains("activo")) {
      //quitarlo del set y quitar la clase
      skills.delete(e.target.textContent);
      e.target.classList.remove("activo");
    } else {
      //agregarlo al set y agregar la clase
      skills.add(e.target.textContent);
      e.target.classList.add("activo");
    }
  }
  // console.log("skills", skills);
  const skillsArray = [...skills];
  document.querySelector("#skills").value = skillsArray;
};

const skillsSeleccionados = () => {
  const seleccionadas = Array.from(
    document.querySelectorAll(".lista-conocimientos .activo")
  );
  // console.log("seleccionadas", seleccionadas);

  seleccionadas.forEach((seleccionada) => {
    skills.add(seleccionada.textContent);
  });
  //Inyectarlo en el hidden
  const skillsArray = [...skills];
  document.querySelector("#skills").value = skillsArray;
};

const limpiarAlertas = () => {
  const alertas = document.querySelector(".alertas");

  const interval = setInterval(() => {
    if (alertas.children.length > 0) {
      alertas.removeChild(alertas.children[0]);
    } else if (alertas.children.length === 0) {
      alertas.parentElement.removeChild(alertas);
      clearInterval(interval);
    }
  }, 1300);
};

//Eliminar vacantes
const accionesListado = (e) => {
  e.preventDefault();
  // console.log("e.target", e.target);
  // console.log("e.target.dataset.eliminar", e.target.dataset.eliminar);
  if (e.target.dataset.eliminar) {
    //Eliminar por axios
    // return;
    Swal.fire({
      title: "¿Confirma Eliminación?",
      text: "Una vez eliminada, no se puede recuperar!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Si, eliminar!",
      cancelButtonText: "¡No, cancelar!",
    }).then((result) => {
      if (result.isConfirmed) {
        //Enviar la peticion con axios
        const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;
        // console.log("url", url);
        //Axios para eliminar el registro
        axios
          .delete(url, { params: { url } })
          .then(function (respuesta) {
            if (respuesta.status == 200) {
              // console.log("respuesta", respuesta);
              Swal.fire("Eliminado", respuesta.data, "success");
            }
            //TODO eliminar del DOM
            // console.log("e.target", e.target);
            e.target.parentElement.parentElement.parentElement.removeChild(
              e.target.parentElement.parentElement
            );
          })
          .catch(() => {
            Swal.fire({
              type: "error",
              title: "Hubo un error",
              text: "No Se pudo eliminar",
            });
          });
      }
    });
  } else if (e.target.tagName === "A") {
    console.log("e.target.tagName", e.target.tagName);
    // return;
    window.location.href = e.target.href;
  }
};

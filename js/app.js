$(document).ready(function () {
  var beforeInstallPrompt = null;

  if (/(android|iphone|ipad)/i.test(navigator.userAgent)) {
    // El dispositivo es Android o iPhone/iPad (iOS)
    if (/android/i.test(navigator.userAgent)) {
      // El dispositivo es Android
      $(window).on("beforeinstallprompt", eventHandler);
    } else if (/iphone|ipad/i.test(navigator.userAgent)) {
      // El dispositivo es iPhone o iPad (iOS)
    }
  } else {
    // El dispositivo no es Android ni iPhone/iPad (iOS)
    console.log("El dispositivo no es Android ni iPhone/iPad (iOS).");
  }

  function eventHandler(event) {
    beforeInstallPrompt = event.originalEvent;
    $("#installBtn").removeAttr("disabled");
    $("#installBtn").removeAttr("style");
  }

  $("#installBtn").on("click", function () {
    if (beforeInstallPrompt) {
      beforeInstallPrompt.prompt();
    }
  });
});

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    var url = window.location.href;
    var swLocation = "/sw.js";

    if (url.includes("localhost")) {
      swLocation = "/sw.js";
    }

    navigator.serviceWorker
      .register(swLocation)
      .then((reg) => {
        console.log("Registration successful", reg);
      })
      .catch((e) =>
        console.error("Error during service worker registration:", e)
      );
  } else {
    console.warn("Service Worker is not supported");
  }
}

registerServiceWorker();

$(document).ready(function () {
  $("#telefono").mask("0000000000");
  $("#celular").mask("0000000000");
  $("#telefonoContacto").mask("0000000000");
  $("#clarificationCelular").mask("0000000000");
  $("#clarificationTelefono").mask("0000000000");
  $("#access_code").mask("0000000000");

  var clientdata = {
    client: {
      id: null,
      name: null,
      status: null,
    },
    payments: [],
    debt: {
      id: null,
      client_id: null,
      debt_amount: null,
      payment_reference: null,
      interbank_code: null,
      payment_bank: null,
      remaining_debt_amount: null,
      next_payment_date: null,
    },
    map: {
      help: "help",
      clarification: "clarification",
      imNot: "imNot",
      interested: "interested",
      exhibition: "exhibition",
      Installments: "Installments",
    },
  };

  var porcentaje = 80;
  var descuento = 0;

  $("#inputConfirmCode").click(function () {
    var access_code = $("#access_code").val();

    // if (
    //   $("#referencias").is(":checked") &&
    //   $("#privacidad").is(":checked") &&
    //   access_code.trim() !== ""
    // )
    if ($("#confirm_code_form").valid()) {
      $.ajax({
        url: "https://crm.arreglatudeuda.mx/api/check-client",
        method: "POST",
        data: {
          access_code: access_code,
        },
        success: function ({ data }) {
          // La solicitud se realizó con éxito

          console.log(data);

          var enlacePdf = $("#enlacePdf");
          enlacePdf.attr(
            "href",
            "https://crm.arreglatudeuda.mx/api/pdf/" + access_code
          );

          clientdata.client.id = data.client.id;
          clientdata.client.name = data.client.name;
          clientdata.client.status = data.client.status;
          clientdata.debt.debt_amount = data.debt.debt_amount;

          clientdata.debt.interbank_code = data.debt.interbank_code;
          clientdata.debt.payment_reference = data.debt.payment_reference;
          clientdata.debt.payment_bank = data.debt.payment_bank;
          clientdata.debt.remaining_debt_amount =
            data.debt.remaining_debt_amount;
          clientdata.debt.next_payment_date = data.debt.next_payment_date;

          clientdata.payments = data.payments;

          $(".clientName").text(clientdata.client.name);
          $(".totalMont").text(clientdata.debt.debt_amount);

          var precioWithDescuento =
            (clientdata.debt.debt_amount * porcentaje) / 100;

          descuento = clientdata.debt.debt_amount - precioWithDescuento;

          $("#precioConDescuento").text(descuento);

          $(".bank").text(clientdata.debt.payment_bank);
          $("#reference_number").text(clientdata.debt.payment_reference);
          $("#interbank_code").text(clientdata.debt.interbank_code);
          $("#status").text(clientdata.client.status);
          $("#next_payment_date").text(clientdata.debt.next_payment_date);
          $("#remaining_debt_amount").text(
            clientdata.debt.remaining_debt_amount
          );

          $.each(clientdata.payments, function (indexInArray, data) {
            var fila = `
            
            <tr class="border-b border-gray-200 dark:border-gray-700">
            <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-200 dark:text-white dark:bg-slate-500"
          >
            ${data.quota_number}
          </th>
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-200 dark:text-white dark:bg-slate-500"
          >
            ${clientdata.client.name}
          </th>
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-200 dark:text-white dark:bg-slate-500"
          >
            ${data.payment_date}
          </th>
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-200 dark:text-white dark:bg-slate-500"
          >
            ${data.paid_amount}
          </th>
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-200 dark:text-white dark:bg-slate-500"
          >
            ${data.status}
          </th>
        </tr> `;

            $("#payment_history_table").append(fila);
          });

          var fechaRegistro = $("#fechaRegistro");
          var fechaActual = new Date();

          // Configurar opciones de formato de fecha en español
          var opcionesFecha = {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          };
          var fechaEnEspanol = fechaActual.toLocaleDateString(
            "es-ES",
            opcionesFecha
          );

          fechaRegistro.text(fechaEnEspanol);

          var horaAcceso = localStorage.getItem("horaAcceso");

          if (!horaAcceso) {
            horaAcceso = new Date().getTime();
            localStorage.setItem("horaAcceso", horaAcceso);
          }

          var horaAccesoDate = new Date(parseInt(horaAcceso));

          console.log(horaAccesoDate);

          function actualizarContador() {
            var ahora = new Date().getTime();
            var tiempoTranscurrido = ahora - horaAcceso;
            var tiempoRestante = 24 * 60 * 60 * 1000 - tiempoTranscurrido; // 24 horas en milisegundos

            if (tiempoRestante <= 0) {
              document.getElementById("tiempo-restante").textContent =
                "Tiempo expirado";
            } else {
              var segundos = Math.floor(tiempoRestante / 1000) % 60;
              var minutos = Math.floor(tiempoRestante / (1000 * 60)) % 60;
              var horas = Math.floor(tiempoRestante / (1000 * 60 * 60));

              document.getElementById("tiempo-restante").textContent =
                horas + "h " + minutos + "m " + segundos + "s";
            }
          }

          setInterval(actualizarContador, 1000);

          var hora = horaAccesoDate.getHours();
          var minutos = horaAccesoDate.getMinutes();
          var segundos = horaAccesoDate.getSeconds();
          document.getElementById("hora-acceso").textContent =
            hora + ":" + minutos + ":" + segundos;

          if (clientdata.client.status === "pagando") {
            showquestion("homeClient");
          } else if (clientdata.client.status === "pendiente") {
            showquestion("pendingStatus");
          } else {
            showquestion("question1");
          }
        },
        error: function (error) {
          // Hubo un error en la solicitud
          console.log(error.responseJSON);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Hubo un error en la solicitud, intente de nuevo",
          });
        },
      });
    }
  });

  $("#button-1").click(function () {
    showquestion("question1-1");
  });

  $("#prevHome , #salir , #programExit").click(function () {
    showquestion("confirmCode");
  });

  $("#viewProgram").click(function () {
    showquestion("program");
  });

  $("#privacidad_link").click(function () {
    showquestion("aviso");
  });

  $("#button-1-1").click(function () {
    showquestion("question1-1-1");
  });

  $("#wayToLiquidate").click(function () {
    showquestion("question1-1");
  });

  $("#prevSettlementType, #prevSettlementTypeTwo").click(function () {
    showquestion("question1-1");
  });

  $("#button-1-2").click(function () {
    showquestion("question1-1-2");
  });

  $("#button-2").click(function () {
    $.ajax({
      showLoader: true,
      type: "POST",
      url: "https://crm.arreglatudeuda.mx/api/check-map",
      data: {
        client_id: clientdata.client.id,
        route: clientdata.map.help,
      },
      success: function (response) {
        console.log(response);
      },
      error: function (xhr, status, error) {
        console.log(xhr);
      },
    });

    showquestion("question2-1");
  });

  $("#prevQuestionOne, #prevQuestion").click(function () {
    showquestion("question1");
  });

  $("#button-3").click(function () {
    $.ajax({
      showLoader: true,
      type: "POST",
      url: "https://crm.arreglatudeuda.mx/api/check-map",
      data: {
        client_id: clientdata.client.id,
        route: clientdata.map.clarification,
      },
      success: function (response) {
        console.log(response);
      },
      error: function (xhr, status, error) {
        console.log(xhr);
      },
    });

    showquestion("question3-1");
  });
  $("#clarificationSubmit").click(function (e) {
    e.preventDefault();

    var celular = $("#clarificationCelular").val(),
      email = $("#clarificationEmail").val(),
      telefono = $("#clarificationTelefono").val(),
      file = $("#clarificationFile").val();
    if ($("#clarificationForm").valid()) {
      console.log("objecto", celular, email, telefono, file);

      $.ajax({
        showLoader: true,
        type: "POST",
        url: "https://crm.arreglatudeuda.mx/api/clarification",
        data: {
          client_id: clientdata.client.id,
          cel: celular,
          email: email,
          telephone: telefono,
          image: file,
        },
        success: function (response) {
          console.log(response);
          showquestion("thankYou");
        },
        error: function (xhr, status, error) {
          console.log(xhr);
        },
      });
    }
  });

  $("#help").click(function (e) {
    e.preventDefault();
    var celular = $("#celular").val(),
      email = $("#email").val(),
      telefono = $("#telefono").val(),
      telefonoContacto = $("#telefonoContacto").val();

    if ($("#helpForm").valid()) {
      if (celular || telefono || email || telefonoContacto) {
        console.log(celular, email, telefono, telefonoContacto);

        $.ajax({
          type: "post",
          url: "https://crm.arreglatudeuda.mx/api/help",
          data: {
            client_id: clientdata.client.id,
            cel: celular,
            email: email,
            telephone: telefono,
            telephoneContact: telefonoContacto,
          },
          success: function (response) {
            showquestion("thankYou");
          },
        });
      } else {
        Swal.fire({
          icon: "info",
          title: "Ayudalo",
          text: "llena alguno de los campos, y lo podras apoyar con mas facilidad",
        });
      }
    }
  });

  $("#button-4").click(function (e) {
    e.preventDefault();

    $.ajax({
      showLoader: true,
      type: "POST",
      url: "https://crm.arreglatudeuda.mx/api/check-map",
      data: {
        client_id: clientdata.client.id,
        route: clientdata.map.imNot,
      },
      success: function (response) {
        showquestion("question4-1");
      },
      error: function (xhr, status, error) {
        console.log(xhr);
      },
    });
  });

  $("#button-4-1, #button-4-2, #button-4-3, #button-4-4").click(function (e) {
    e.preventDefault();

    $(".question").hide();

    // console.log(e.target.textContent);

    let text = e.target.textContent.trim();

    $.ajax({
      type: "post",
      url: "https://crm.arreglatudeuda.mx/api/unknowns",
      data: {
        client_id: clientdata.client.id,
        response: text,
      },
      success: function (response) {
        showquestion("thankYou");
      },
    });
  });

  $("#explication").click(function (e) {
    showquestion("explicationForm");
  });

  $("#prevNoloConozco").click(function (e) {
    e.preventDefault();
    showquestion("question4-1");
  });

  $("#explicationSubmit").click(function (e) {
    e.preventDefault();

    var message = $("#message").val();

    if (message.length < 10) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "La explicación debe tener al menos 10 caracteres.",
      });
      return false;
    }

    $.ajax({
      type: "post",
      url: "https://crm.arreglatudeuda.mx/api/unknowns",
      data: {
        client_id: clientdata.client.id,
        response: message,
      },
      success: function (response) {
        showquestion("thankYou");
      },
    });
  });

  function showquestion(questionId) {
    window.scrollTo(0, 0);
    $(".question").hide();
    $("#" + questionId).show();
  }

  function showstep(stepId) {
    $(".step").hide();
    $("#" + stepId).show();
  }

  $("#payInInstallments").click(function () {
    $.ajax({
      showLoader: true,
      type: "POST",
      url: "https://crm.arreglatudeuda.mx/api/check-map",
      data: {
        client_id: clientdata.client.id,
        route: clientdata.map.Installments,
      },
      success: function (response) {
        showquestion("inInstallment");
      },
      error: function (xhr, status, error) {
        console.log(xhr);
      },
    });
  });

  $("#prevCalculateInstallment").click(function () {
    showstep("calculateInstallmentForm");
  });

  $(document).ajaxSend(function () {
    $("#overlay").fadeIn(300);
  });

  $(document).ajaxComplete(function () {
    $("#overlay").fadeOut(300);
  });

  $("#payInOneExhibition").click(function () {
    $.ajax({
      showLoader: true,
      type: "POST",
      url: "https://crm.arreglatudeuda.mx/api/check-map",
      data: {
        client_id: clientdata.client.id,
        route: clientdata.map.exhibition,
      },
      success: function (response) {
        showquestion("oneTimeExhibition");
      },
      error: function (xhr, status, error) {
        console.log(xhr);
      },
    });
  });

  $("#creditCard").click(function () {
    showquestion("creditCardForm");
  });

  $("#paymentMethods").click(function () {
    showquestion("selectPaymentMethod");
  });

  $("#confirm_code_form").validate({
    rules: {
      access_code: {
        minlength: 6,
        required: true,
      },

      privacidad: {
        required: true,
      },
    },
    messages: {
      access_code: {
        minlength: "El código de activación debe tener al menos 6 caracteres.",
        required: "Ingresa el código de activación.",
      },

      privacidad: {
        required: "Requerido.",
      },
    },
  });

  $("#explicationForm").validate({
    rules: {
      explication: {
        minlength: 10,
        maxlength: 500,
      },
    },
    messages: {
      explication: {
        minlength: "La explicación debe tener al menos 10 caracteres.",
        maxlength: "La explicación no debe exceder los 500 caracteres.",
      },
    },
  });

  $("#helpForm").validate({
    rules: {
      celular: {
        minlength: 10,
        digits: true,
      },
      telefono: {
        minlength: 10,
        digits: true,
      },
      telefonoContacto: {
        minlength: 10,
        digits: true,
      },
    },
    messages: {
      celular: {
        minlength: "El número de celular debe tener al menos 10 caracteres.",
        maxlength: "El número de celular no debe exceder los 10 caracteres.",
        digits: "Ingresa solo dígitos en este campo.",
      },
      telefono: {
        minlength: "El número de teléfono debe tener al menos 10 caracteres.",
        maxlength: "El número de teléfono no debe exceder los 10 caracteres.",
        digits: "Ingresa solo dígitos en este campo.",
      },
      telefonoContacto: {
        minlength: "El número de teléfono debe tener al menos 10 caracteres.",
        maxlength: "El número de teléfono no debe exceder los 10 caracteres.",
        digits: "Ingresa solo dígitos en este campo.",
      },
    },
  });

  $("#clarificationForm").validate({
    rules: {
      clarificationCelular: {
        minlength: 10,
        digits: true,
        required: true,
      },
      clarificationEmail: {
        required: true,
        email: true,
      },
      clarificationTelefono: {
        minlength: 10,
        digits: true,
        required: true,
      },
      clarificationFile: {
        required: true,
      },
    },
    messages: {
      clarificationCelular: {
        minlength: "El número de celular debe tener al menos 10 caracteres.",
        maxlength: "El número de celular no debe exceder los 10 caracteres.",
        digits: "Ingresa solo dígitos en este campo.",
        required: "Este campo es obligatorio.",
      },
      clarificationEmail: {
        required: "Este campo es obligatorio.",
        email: "Ingresa un correo valido.",
      },
      clarificationTelefono: {
        minlength: "El número de teléfono debe tener al menos 10 caracteres.",
        maxlength: "El número de teléfono no debe exceder los 10 caracteres.",
        digits: "Ingresa solo dígitos en este campo.",
        required: "Este campo es obligatorio.",
      },
      clarificationFile: {
        required: "Este campo es obligatorio.",
      },
    },
  });

  // $("#btnPdfOneExhibition").click(function () {
  //   $.ajax({
  //     showLoader: true,
  //     type: "get",
  //     url: "https://crm.arreglatudeuda.mx/api/pdf",
  //     data: {
  //       client_id: clientdata.client.id,
  //     },
  //     success: function (response) {

  //       console.log(response);

  //       window.open("https://crm.arreglatudeuda.mx/api/pdf", "_blank");

  //     },
  //     error: function (xhr, status, error) {
  //       console.log(xhr);
  //     },
  //   });
  // });

  $("#enlacePdf").click(function (e) {
    e.preventDefault();

    Swal.fire({
      title: "¿Deseas generar el PDF?",
      text: "Al momento de generar el PDF, cambiara tu estatus de cliente, y no podras revertirlo.",
      showDenyButton: true,
      confirmButtonText: "Si",
      denyButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = $(this).attr("href");
        addagreementsContado();
      }
    });
  });

  // $("#enlacePdfCuotas").click(function (e) {
  //   e.preventDefault();

  //   Swal.fire({
  //     title: "¿Deseas generar el PDF?",
  //     text: "Al momento de generar el PDF, cambiara tu estatus de cliente, y no podras revertirlo.",
  //     showDenyButton: true,
  //     confirmButtonText: "Si",
  //     denyButtonText: "No",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       window.location.href = $(this).attr("href");
  //       // addagreementsCuotas();
  //       showquestion("thankYou");
  //     }
  //   });
  // });

  function addagreementsContado() {
    var montoDeuda = $("#precioConDescuento").text();
    $.ajax({
      showLoader: true,
      type: "POST",
      url:
        "https://crm.arreglatudeuda.mx/api/addagreements/" +
        clientdata.client.id,
      data: {
        client_id: clientdata.client.id,
        amount_per_installment: montoDeuda,
      },
      success: function (response) {
        showquestion("thankYou");
      },
      error: function (xhr, status, error) {
        console.log(xhr);
      },
    });
  }

  $("#calculateInstallment").click(function () {
    const radios = document.getElementsByName("bordered-radio");

    let selectedValue;
    for (const radio of radios) {
      if (radio.checked) {
        selectedValue = radio.value;
        break;
      }
    }

    const cantidadPago = parseFloat($("#cantidadPago").val());

    if (cantidadPago == "" || cantidadPago == 0 || isNaN(cantidadPago)) {
      Swal.fire({
        icon: "info",
        title: "Oops...",
        text: "llena todos los campos",
      });
      return false;
    }
    calculateInstallment(cantidadPago, selectedValue);
  });

  function calculateInstallment(cantidadPago, selectedValue) {
    const deudaTotal = parseFloat(clientdata.debt.debt_amount);
    // const deudaTotal = 1000;

    const tipoCuonta = selectedValue;

    var maxSemanas = 100;
    var maxQuincenas = 48;
    var maxMeses = 24;

    var cuotas = Math.round(deudaTotal / cantidadPago);

    console.log(cuotas, "cuotas");

    if (tipoCuonta == "semanal") {
      var pagoPerfecto = (deudaTotal / maxSemanas).toFixed(2);

      if (cuotas < 2) {
        ajusteSwal(tipoCuonta);
      } else if (cuotas <= maxSemanas) {
        $("#pagoFinal").text(cantidadPago);
        $("#plazoFinal").text(cuotas);
        $("#typoFinal").text(tipoCuonta);
        showstep("finalInstallment");
      } else {
        errorSwal(cantidadPago, tipoCuonta, pagoPerfecto);
      }
    } else if (tipoCuonta == "quincenal") {
      var pagoPerfecto = (deudaTotal / maxQuincenas).toFixed(2);

      if (cuotas < 2) {
        ajusteSwal(tipoCuonta);
      } else if (cuotas <= maxQuincenas) {
        $("#pagoFinal").text(cantidadPago);
        $("#plazoFinal").text(cuotas);
        $("#typoFinal").text(tipoCuonta);

        // console.log({ cuotas, maxQuincenas });

        showstep("finalInstallment");
      } else {
        errorSwal(cantidadPago, tipoCuonta, pagoPerfecto);
      }
    } else if (tipoCuonta == "mensual") {
      var pagoPerfecto = (deudaTotal / maxMeses).toFixed(2);

      if (cuotas < 2) {
        ajusteSwal(tipoCuonta);
      } else if (cuotas <= maxMeses) {
        $("#pagoFinal").text(cantidadPago);
        $("#plazoFinal").text(cuotas);
        $("#typoFinal").text(tipoCuonta);
        // console.log({ cuotas, maxMeses });
        showstep("finalInstallment");
      } else {
        errorSwal(cantidadPago, tipoCuonta, pagoPerfecto);
      }
    }
  }

  function errorSwal(cantidad, tipo, pagoPerfecto) {
    Swal.fire({
      icon: "info",
      title: "Oops...",
      text:
        "No es posible pagar $" +
        cantidad +
        ", si quieres pagar " +
        tipo +
        " puedes hacerlo con $" +
        pagoPerfecto +
        " MXN, ¿Que deseas hacer?",
      showDenyButton: true,
      confirmButtonText: "pagar $" + pagoPerfecto + " " + tipo,
      denyButtonText: "Declinar",
    }).then((result) => {
      if (result.isConfirmed) {
        var numeroCuotas = Math.round(
          clientdata.debt.debt_amount / pagoPerfecto
        );
        console.log(numeroCuotas, "numeroCuotas");

        $("#pagoFinal").text(pagoPerfecto);
        $("#plazoFinal").text(numeroCuotas);
        $("#typoFinal").text(tipo);

        showstep("finalInstallment");
      }
    });
  }

  function ajusteSwal(tipoCuonta) {
    var deudaTotal = parseFloat(clientdata.debt.debt_amount);
    // var deudaTotal = 33300;

    var pagoPerfecto = (parseFloat(deudaTotal) / 2).toFixed(2);

    Swal.fire({
      icon: "info",
      title: "Ajuste en dos cuotas",
      text:
        "Te ajustamos en dos cuotas de $" +
        pagoPerfecto +
        " MXN " +
        tipoCuonta +
        ", ¿Que deseas hacer?",
      showDenyButton: true,
      confirmButtonText: "pagar $" + pagoPerfecto + " " + tipoCuonta,
      denyButtonText: "Declinar",
    }).then((result) => {
      if (result.isConfirmed) {
        $("#pagoFinal").text(pagoPerfecto);
        $("#plazoFinal").text(2);
        $("#typoFinal").text(tipoCuonta);
        showstep("finalInstallment");
      }
    });
  }

  $("#btnPdfInstallment").click(function () {
    Swal.fire({
      title: "¿Deseas generar el PDF?",
      text: "Al momento de generar el PDF, cambiara tu estatus de cliente, y no podras revertirlo.",
      showDenyButton: true,
      confirmButtonText: "Si",
      denyButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        var pagoFinal = $("#pagoFinal").text();
        var plazoFinal = $("#plazoFinal").text();
        var tipoFinal = $("#typoFinal").text();
        var access_code = $("#access_code").val();
        // var access_code = 123456;

        $.ajax({
          showLoader: true,
          type: "POST",
          url: "https://crm.arreglatudeuda.mx/api/addagreementscuotas",
          data: {
            pagoFinal: pagoFinal,
            plazoFinal: plazoFinal,
            tipoFinal: tipoFinal,
            // access_code: $("#access_code").val(),
            access_code: access_code,
          },
          success: function (response) {
            if (response.status == "success") {
              var enlace = $("<a></a>");

              // Agregar el atributo href al enlace
              enlace.attr({
                href:
                  "https://crm.arreglatudeuda.mx/api/pdfplazos/" + access_code,
                id: "enlacePdfCuotas",
              });

              // Simular un clic automático en el enlace
              enlace.get(0).click();

              // console.log("enlacePdfCuotas");
              showquestion("thankYou");
            }
          },
          error: function (xhr, status, error) {
            console.log(xhr);
          },
        });
      }
    });
  });
  function addagreementsCuotas() {}

  $("#btn_dashboard").click(function () {
    showstep("dashboard");
  });

  $("#btn_payment_info").click(function () {
    showstep("payment_info");
  });

  $("#btn_payment_history").click(function () {
    showstep("payment_history");
  });

  $("#btn_frequent_questions").click(function () {
    showstep("frequent_questions");
  });

  $("#firstFrequentQuestions").click(function () {
    $(this).next().slideToggle();
  });

  $("#secondFrequentQuestions").click(function () {
    $(this).next().slideToggle();
  });
  $("#thirdFrequentQuestions").click(function () {
    $(this).next().slideToggle();
  });

  $("#referenciasLink").click(function (e) {
    e.preventDefault();
    const rutapdf = "pdf/super.pdf";
    window.open(rutapdf);

    // window.location.href = "pdf/super.pdf";
  });
});

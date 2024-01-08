$(document).ready(function () {
  var beforeInstallPrompt = null;

  if (/(android|iphone|ipad)/i.test(navigator.userAgent)) {
    // El dispositivo es Android o iPhone/iPad (iOS)
    if (/android/i.test(navigator.userAgent)) {
      // El dispositivo es Android
      $(window).on("beforeinstallprompt", eventHandler);
    } else if (/iphone|ipad/i.test(navigator.userAgent)) {
      // El dispositivo es iPhone o iPad (iOS)
      $(window).on("beforeinstallprompt", eventHandlerIOS);
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

  function eventHandlerIOS(event) {
    beforeInstallPrompt = event.originalEvent;

    $("#installBtnIOS").removeAttr("disabled");
    $("#installBtnIOS").removeAttr("style");
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
  // $("#access_code").mask("0000000000");
  $("#cantidadPago").mask("0000000000");

  var clientdata = {
    client: {
      id: null,
      name: null,
      status: null,
    },
    payments: [],
    debt: {
      debt_amount: null,
      payment_reference: null,
      interbank_code: null,
      payment_bank: null,
      remaining_debt_amount: null,
      next_payment_date: null,
      cash: null,
      agreement: null,
    },
    map: {
      help: "help",
      clarification: "clarification",
      imNot: "imNot",
      interested: "interested",
      exhibition: "exhibition",
      Installments: "Installments",
    },
    plazos: {
      deudaPago: null,
      numeroCuotas: null,
      pagoPorCuota: null,
      ultimo_valor: null,
      message: null,
      tipoCuonta: null,
    },
  };

  $("#inputConfirmCode").click(function () {
    var access_code = $("#access_code").val();

    if ($("#confirm_code_form").valid()) {
      $.ajax({
        url: "https://crm-soluciones.arreglatudeuda.mx/api/check-client",
        method: "POST",
        data: {
          access_code: access_code,
        },
        success: function ({ data }) {
          console.log(data);
          // La solicitud se realizó con éxito

          var datePay = $("#datePay").val();

          var currentDate = new Date();

          var maxDate = new Date(
            currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
          );

          // Formatea las fechas en formato YYYY-MM-DD
          var formattedCurrentDate = currentDate.toISOString().slice(0, 10);
          var formattedMaxDate = maxDate.toISOString().slice(0, 10);

          // Establece los atributos min y max en el campo de entrada
          $("#datePay").attr("min", formattedCurrentDate);
          $("#datePay").attr("max", formattedMaxDate);

          var enlacePdf = $("#enlacePdf");
          enlacePdf.attr(
            "href",
            "https://crm-soluciones.arreglatudeuda.mx/api/pdf/" + access_code
          );

          clientdata.client.id = data.debtors.id;
          clientdata.client.name = data.debtors.full_name;
          clientdata.client.status = data.debtors.status;
          clientdata.debt.debt_amount = data.debtors.sce;

          clientdata.debt.interbank_code = data.debtors.interbank_key;
          clientdata.debt.payment_reference = data.debtors.payment_reference;
          clientdata.debt.payment_bank = data.debtors.payment_bank;
          clientdata.debt.remaining_debt_amount = data.debtors.remainingDebt;
          clientdata.debt.next_payment_date = data.debtors.nextPayday;
          clientdata.debt.cash = data.debtors.cash;
          clientdata.debt.agreement = data.debtors.agreement;

          clientdata.payments = data.payments;

          $(".clientName").text(clientdata.client.name);

          $(".totalMont").text(formatNumber(clientdata.debt.debt_amount));

          $(".precioConDescuento").text(formatNumber(clientdata.debt.cash));

          $(".bank").text(clientdata.debt.payment_bank);
          $("#reference_number").text(clientdata.debt.payment_reference);
          $("#interbank_code").text(clientdata.debt.interbank_code);
          $("#convenioNumber").text(clientdata.debt.agreement);
          $("#status").text(clientdata.client.status);
          $("#next_payment_date").text(clientdata.debt.next_payment_date);
          $("#remaining_debt_amount").text(
            formatNumber(clientdata.debt.remaining_debt_amount)
          );

          $.each(clientdata.payments, function (indexInArray, data) {
            var cuotas = formatNumber(data.paid_amount);

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
           $${cuotas}
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

          function actualizarContador() {
            var ahora = new Date().getTime();
            var tiempoTranscurrido = ahora - horaAcceso;
            var tiempoRestante = 72 * 60 * 60 * 1000 - tiempoTranscurrido; // 24 horas en milisegundos

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
          var minutos = horaAccesoDate.getMinutes().toString().padStart(2, "0");
          var segundos = horaAccesoDate
            .getSeconds()
            .toString()
            .padStart(2, "0");

          document.getElementById("hora-acceso").textContent =
            hora + ":" + minutos + ":" + segundos;

          if (clientdata.client.status === "convenio") {
            showquestion("homeClient");
          } else if (clientdata.client.status === "pendiente") {
            showquestion("pendingStatus");
          } else {
            showquestion("question1");
          }
          console.log(clientdata);
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

  $("#installBtnIOS").on("click", function () {
    showquestion("instructions");
  });

  $("#button-1").click(function () {
    showquestion("question1-1");
  });

  $(
    "#prevHome , #salir , #programExit, #programExitInstructions, #bubbleExit, #ExitRecoverCode"
  ).click(function () {
    $("#payment_history_table").empty();
    $("#access_code").val("");

    showquestion("confirmCode");
  });

  $("#viewProgram").click(function () {
    showquestion("program");
  });

  $("#btn_recover_code").click(function () {
    showquestion("recover_code");
  });

  // $("#privacidad_link").click(function () {
  //   // showquestion("aviso");
    
  // });

  $("#button-1-1").click(function () {
    showquestion("question1-1-1");
  });

  $("#wayToLiquidate").click(function () {
    showquestion("question1-1");
  });

  $("#prevSettlementType").click(function () {
    showquestion("question1-1");
  });

  $("#prevSettlementTypeTwo").click(function () {
    $("#cantidadPago").val("");
    showstep("calculateInstallmentForm");
    showquestion("question1-1");
  });

  $("#button-1-2").click(function () {
    showquestion("question1-1-2");
  });

  $("#button-2").click(function () {
    $.ajax({
      showLoader: true,
      type: "POST",
      url: "https://crm-soluciones.arreglatudeuda.mx/api/check-map",
      data: {
        debtor_id: clientdata.client.id,
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
      url: "https://crm-soluciones.arreglatudeuda.mx/api/check-map",
      data: {
        debtor_id: clientdata.client.id,
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
      clarification = $("#clarification").val();
    if ($("#clarificationForm").valid()) {
      if (celular || email || telefono) {
        $.ajax({
          showLoader: true,
          type: "POST",
          url: "https://crm-soluciones.arreglatudeuda.mx/api/clarification",
          data: {
            debtor_id: clientdata.client.id,
            cel: celular,
            email: email,
            telephone: telefono,
            clarification: clarification,
          },
          success: function (response) {
            console.log(response);
            showquestion("thankYou");
          },
          error: function (xhr, status, error) {
            console.log(xhr);
          },
        });
      } else {
        Swal.fire({
          icon: "info",
          title: "Importante",
          text: "Es necesario llenar alguno de los campos de contacto",
        });
      }
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
          url: "https://crm-soluciones.arreglatudeuda.mx/api/help",
          data: {
            debtor_id: clientdata.client.id,
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
      url: "https://crm-soluciones.arreglatudeuda.mx/api/check-map",
      data: {
        debtor_id: clientdata.client.id,
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
      url: "https://crm-soluciones.arreglatudeuda.mx/api/unknowns",
      data: {
        debtor_id: clientdata.client.id,
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
      url: "https://crm-soluciones.arreglatudeuda.mx/api/unknowns",
      data: {
        debtor_id: clientdata.client.id,
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
      url: "https://crm-soluciones.arreglatudeuda.mx/api/check-map",
      data: {
        debtor_id: clientdata.client.id,
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
    $("#cantidadPago").val("");
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
      url: "https://crm-soluciones.arreglatudeuda.mx/api/check-map",
      data: {
        debtor_id: clientdata.client.id,
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
      },
      clarificationEmail: {
        email: true,
      },
      clarificationTelefono: {
        minlength: 10,
        digits: true,
      },
      clarification: {
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
      clarification: {
        required: "Este campo es obligatorio.",
      },
    },
  });

  // $("#btnPdfOneExhibition").click(function () {
  //   $.ajax({
  //     showLoader: true,
  //     type: "get",
  //     url: "https://crm-soluciones.arreglatudeuda.mx/api/pdf",
  //     data: {
  //       debtor_id: clientdata.client.id,
  //     },
  //     success: function (response) {

  //       console.log(response);

  //       window.open("https://crm-soluciones.arreglatudeuda.mx/api/pdf", "_blank");

  //     },
  //     error: function (xhr, status, error) {
  //       console.log(xhr);
  //     },
  //   });
  // });

  $("#enlacePdf").click(function (e) {
    e.preventDefault();

    var datePay = $("#datePay").val();

    if (datePay == "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "La fecha de pago es obligatoria.",
      });
      return false;
    }

    Swal.fire({
      title: "¿Deseas generar el PDF?",
      text: "Al momento de generar el PDF, Estás generando un compromiso de pago y cambiará tu estatus de negativa de pago a cliente en convenio.",
      showDenyButton: true,
      confirmButtonText: "Si",
      denyButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        // window.location.href = $(this).attr("href");
        var locacion = $(this).attr("href");

        var nuevoParametro = "datePay=" + datePay;

        if (locacion.indexOf("?") !== -1) {
          // La URL ya tiene una cadena de consulta, así que añade el nuevo parámetro con un "&".
          window.location.href = locacion + "&" + nuevoParametro;
        } else {
          // La URL no tiene una cadena de consulta, así que añade el nuevo parámetro con un "?".
          window.location.href = locacion + "?" + nuevoParametro;
        }
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
    $.ajax({
      showLoader: true,
      type: "POST",
      url:
        "https://crm-soluciones.arreglatudeuda.mx/api/addagreements/" +
        clientdata.client.id,
      data: {
        date_pay: $("#datePay").val(),
      },
      success: function (response) {
        console.log(response);
        showquestion("confirmCode");
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

    var cantidadPago = Math.round(parseFloat($("#cantidadPago").val()));

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

  function calculateInstallment(cantidadPago, tiempo) {
    // console.log(tiempo, cantidadPago);

    $.ajax({
      showLoader: true,
      type: "POST",
      url:
        "https://crm-soluciones.arreglatudeuda.mx/api/set_agreements/" +
        clientdata.client.id,
      data: {
        cantidadPago: cantidadPago,
        tipoCuonta: tiempo,
      },
      success: function ({ data }) {
        clientdata.plazos.deudaPago = data.deudaPago;
        clientdata.plazos.numeroCuotas = data.numeroCuotas;
        clientdata.plazos.pagoPorCuota = data.pagoPorCuota;
        clientdata.plazos.message = data.message;
        clientdata.plazos.tipoCuonta = data.tipoCuonta;

        $(".pagoFinalDeuda").text(formatNumber(clientdata.plazos.deudaPago));
        $(".plazoFinal").text(clientdata.plazos.numeroCuotas);
        $(".typoFinal").text(clientdata.plazos.tipoCuonta);
        $(".cuotaPago").text(formatNumber(clientdata.plazos.pagoPorCuota));

        // console.log(clientdata.plazos.message);
        // console.log(data);

        if (clientdata.plazos.message != true) {
          $("#textoGood").show();
          $("#textoBad").hide();
        } else {
          $("#textoGood").hide();
          $("#textoBad").show();
        }

        showstep("finalInstallment");
      },
      error: function (xhr, status, error) {
        console.log(xhr);
      },
    });
  }

  function formatNumber(num) {
    const numero = parseFloat(num);
    const numeroFormateado = numero.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return numeroFormateado;
  }

  $("#btnPdfInstallment").click(function () {
    Swal.fire({
      title: "¿Deseas generar el PDF?",
      text: "Al momento de generar el PDF, Estás generando un compromiso de pago y cambiará tu estatus de negativa de pago a cliente en convenio.",
      showDenyButton: true,
      confirmButtonText: "Si",
      denyButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        var access_code = $("#access_code").val();
        // var access_code = 123456;

        var typo =
          clientdata.plazos.tipoCuonta == "mensuales"
            ? "mensual"
            : clientdata.plazos.tipoCuonta == "semanales"
            ? "semanal"
            : "quincenal";

        $.ajax({
          showLoader: true,
          type: "POST",
          url: "https://crm-soluciones.arreglatudeuda.mx/api/addagreementscuotas",
          data: {
            pagoFinal: clientdata.plazos.pagoPorCuota,
            plazoFinal: clientdata.plazos.numeroCuotas,
            tipoFinal: typo,
            access_code: access_code,
            deudaFinal: clientdata.plazos.deudaPago,
          },
          success: function (response) {
            console.log(response);
            if (response.status == "success") {
              var enlace = $("<a></a>");

              // Agregar el atributo href al enlace
              enlace.attr({
                href:
                  "https://crm-soluciones.arreglatudeuda.mx/api/pdfplazos/" +
                  access_code,
                id: "enlacePdfCuotas",
              });

              // Simular un clic automático en el enlace
              enlace.get(0).click();

              // console.log("enlacePdfCuotas");
              showquestion("confirmCode");
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

  $("#fourthFrequentQuestions").click(function () {
    $(this).next().slideToggle();
  });

  $("#fifthFrequentQuestions").click(function () {
    $(this).next().slideToggle();
  });

  $("#sixthFrequentQuestions").click(function () {
    $(this).next().slideToggle();
  });

  $("#seventhFrequentQuestions").click(function () {
    $(this).next().slideToggle();
  });

  $("#referenciasLink").click(function (e) {
    e.preventDefault();
    const rutapdf = "pdf/super.pdf";
    window.open(rutapdf);

    // window.location.href = "pdf/super.pdf";
  });

  $("#sendRecoverCode").click(function () {
    const radios = document.getElementsByName("typed-radio");

    let selectedValue;
    for (const radio of radios) {
      if (radio.checked) {
        selectedValue = radio.value;
        break;
      }
    }

    var contactInfoRecover = $("#contactInfoRecover").val();

    if (selectedValue == "" || contactInfoRecover == "") {
      Swal.fire({
        icon: "info",
        title: "Oops...",
        text: "llena todos los campos",
      });
      // return false;
    } else {
      $.ajax({
        showLoader: true,
        type: "POST",
        url: "https://crm-soluciones.arreglatudeuda.mx/api/recover-password",
        data: {
          type: selectedValue,
          data: contactInfoRecover,
        },
        success: function (response) {
          if (response.status == "success") {
            Swal.fire({
              icon: "success",
              title: "Excelente!",
              text: response.message,
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: response.message,
            });
          }
        },
        error: function (xhr, status, error) {
          console.log(xhr);
        },
      });
    }
  });
});

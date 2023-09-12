$(document).ready(function () {
  var beforeInstallPrompt = null;

  $(window).on("beforeinstallprompt", eventHandler);

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
    var swLocation = "/sac/sw.js";

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

  var porcentaje = 20;
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
        url: "http://54.162.16.202/api/check-client",
        method: "POST",
        data: {
          access_code: access_code,
        },
        success: function ({ data }) {
          // La solicitud se realizó con éxito

          console.log(data);

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

          if (clientdata.client.status !== "activo") {
            showquestion("question1");
          } else {
            $("#bank").text(clientdata.debt.payment_bank);
            $("#reference_number").text(clientdata.debt.payment_reference);
            $("#interbank_code").text(clientdata.debt.interbank_code);
            $("#status").text(clientdata.client.status);
            $("#next_payment_date").text(clientdata.debt.next_payment_date);
            $("#remaining_debt_amount").text(
              clientdata.debt.remaining_debt_amount
            );

            $.each(clientdata.payments, function (indexInArray, data) {
              var fila = `<tr class="border-b border-gray-200 dark:border-gray-700">
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-200 dark:text-white dark:bg-indigo-500"
          >
            ${clientdata.client.name}
          </th>
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-200 dark:text-white dark:bg-indigo-500"
          >
            ${data.payment_date}
          </th>
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-200 dark:text-white dark:bg-indigo-500"
          >
            ${data.paid_amount}
          </th>
        </tr> `;

              $("#payment_history_table").append(fila);
            });

            showquestion("homeClient");
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

  $("#prevHome").click(function () {
    showquestion("confirmCode");
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
      url: "http://54.162.16.202/api/check-map",
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
      url: "http://54.162.16.202/api/check-map",
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
        url: "http://54.162.16.202/api/clarification",
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
          url: "http://54.162.16.202/api/help",
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
      url: "http://54.162.16.202/api/check-map",
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
      url: "http://54.162.16.202/api/unknowns",
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
      url: "http://54.162.16.202/api/unknowns",
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
      url: "http://54.162.16.202/api/check-map",
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
      url: "http://54.162.16.202/api/check-map",
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
      referencias: {
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
      referencias: {
        required: "Requerido.",
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

  $("#btnPdfOneExhibition").click(function () {
    var total = descuento;
    pdf(total);
  });

  function pdf(total) {
    const doc = new jsPDF();

    // Configura los estilos
    const fontSize = 14;
    const lineHeight = 18;
    const textColor = "#333";
    const titleColor = "#1E90FF";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);

    // Agrega los detalles de la transferencia bancaria
    const beneficiaryName = "sac";
    const accountNumber = clientdata.debt.payment_reference;
    const amount = "$" + total;
    const bankName = clientdata.debt.payment_bank;
    const iban =
      clientdata.debt.payment_reference + clientdata.debt.payment_bank;

    doc.setTextColor(titleColor);
    doc.setFontSize(18);
    doc.text("Transferencia Bancaria", 10, 10);

    doc.setTextColor(textColor);
    doc.setFontSize(fontSize);
    doc.text(
      `Nombre del beneficiario: ${beneficiaryName}`,
      10,
      10 + lineHeight
    );
    doc.text(`Número de cuenta: ${accountNumber}`, 10, 10 + 2 * lineHeight);
    doc.text(`Monto: ${amount}`, 10, 10 + 3 * lineHeight);
    doc.text(`Banco: ${bankName}`, 10, 10 + 4 * lineHeight);

    doc.setTextColor("#FF6347");
    doc.text(`IBAN: ${iban}`, 10, 10 + 5 * lineHeight);

    // Guarda el PDF
    doc.save(
      clientdata.client.name + clientdata.debt.payment_reference + ".pdf"
    );
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

    const numeroCuotas = $("#numeroCuotas").val();
    const cantidadPago = parseFloat($("#cantidadPago").val());

    if (cantidadPago === "" || numeroCuotas === "") {
      Swal.fire({
        icon: "info",
        title: "Oops...",
        text: "llena todos los campos",
      });
      return false;
    }
    calculateInstallment(cantidadPago, numeroCuotas, selectedValue);
  });

  function calculateInstallment(cantidadPago, numeroCuotas, selectedValue) {
    const total = parseFloat(clientdata.debt.debt_amount);
    var ajusteTotal = (total / numeroCuotas).toFixed(2);
    var totalCuota = cantidadPago * numeroCuotas;

    if (selectedValue === "semanales") {
      if (numeroCuotas > 100) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "El número de cuotas debe ser menor a 100 semanas",
        });
        return false;
      } else {
        if (totalCuota > total) {
          Swal.fire({
            icon: "info",
            title: "Ajuste",
            text: `Su pago excede al monto total, asi que el pago ajustado es de $${ajusteTotal} por ${numeroCuotas} semanas ¿deseas continuar con el pago?`,
            showDenyButton: true,
            confirmButtonText: "Continuar",
            denyButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              console.log(ajusteTotal, numeroCuotas, totalCuota);
              $("#pagoFinal").text(ajusteTotal);
              $("#plazoFinal").text(numeroCuotas);
              $("#typoFinal").text(selectedValue);

              $.ajax({
                showLoader: true,
                type: "POST",
                url: "http://54.162.16.202/api/check-agreements",
                data: {
                  client_id: clientdata.client.id,
                  number_installments: numeroCuotas,
                  unit_time: selectedValue,
                  amount_per_installment: ajusteTotal,
                },
                success: function (response) {
                  console.log(response);
                },
                error: function (error) {
                  console.log(error);
                },
              });

              showstep("finalInstallment");
            }
          });
        } else if (totalCuota < total) {
          Swal.fire({
            icon: "info",
            title: "Ajuste",
            text: `No cumple con el monto total, el pago ajustado es de $${ajusteTotal} por ${numeroCuotas} semanas ¿Deseas continuar con el pago?`,
            showDenyButton: true,
            confirmButtonText: "Continuar",
            denyButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $("#pagoFinal").text(ajusteTotal);
              $("#plazoFinal").text(numeroCuotas);
              $("#typoFinal").text(selectedValue);

              $.ajax({
                showLoader: true,
                type: "POST",
                url: "http://54.162.16.202/api/check-agreements",
                data: {
                  client_id: clientdata.client.id,
                  number_installments: numeroCuotas,
                  unit_time: selectedValue,
                  amount_per_installment: ajusteTotal,
                },
                success: function (response) {
                  console.log(response);
                },
                error: function (error) {
                  console.log(error);
                },
              });

              showstep("finalInstallment");
            }
          });
        } else if (totalCuota === total) {
          Swal.fire({
            icon: "success",
            title: "Genial!!",
            text: "Su forma de pago cumple con el monto total",
            showDenyButton: true,
            confirmButtonText: "Continuar",
            denyButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $("#pagoFinal").text(ajusteTotal);
              $("#plazoFinal").text(numeroCuotas);
              $("#typoFinal").text(selectedValue);

              $.ajax({
                showLoader: true,
                type: "POST",
                url: "http://54.162.16.202/api/check-agreements",
                data: {
                  client_id: clientdata.client.id,
                  number_installments: numeroCuotas,
                  unit_time: selectedValue,
                  amount_per_installment: ajusteTotal,
                },
                success: function (response) {
                  console.log(response);
                },
                error: function (error) {
                  console.log(error);
                },
              });

              showstep("finalInstallment");
            }
          });
        }
      }
    } else if (selectedValue === "mensuales") {
      if (numeroCuotas > 24) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "El número de cuotas debe ser menor a 24 meses",
        });
      } else {
        if (totalCuota > total) {
          Swal.fire({
            icon: "info",
            title: "Ajuste",
            text: `Su pago excede al monto total, asi que el pago ajustado es de $${ajusteTotal} por ${numeroCuotas} meses ¿deseas continuar con el pago?`,
            showDenyButton: true,
            confirmButtonText: "Continuar",
            denyButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              // console.log(ajusteTotal, numeroCuotas, totalCuota);
              $("#pagoFinal").text(ajusteTotal);
              $("#plazoFinal").text(numeroCuotas);
              $("#typoFinal").text(selectedValue);

              $.ajax({
                showLoader: true,
                type: "POST",
                url: "http://54.162.16.202/api/check-agreements",
                data: {
                  client_id: clientdata.client.id,
                  number_installments: numeroCuotas,
                  unit_time: selectedValue,
                  amount_per_installment: ajusteTotal,
                },
                success: function (response) {
                  console.log(response);
                },
                error: function (error) {
                  console.log(error);
                },
              });

              showstep("finalInstallment");
            }
          });
        } else if (totalCuota < total) {
          Swal.fire({
            icon: "info",
            title: "Ajuste",
            text: `No cumple con el monto total, el pago ajustado es de $${ajusteTotal} por ${numeroCuotas} meses ¿Deseas continuar con el pago?`,
            showDenyButton: true,
            confirmButtonText: "Continuar",
            denyButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $("#pagoFinal").text(ajusteTotal);
              $("#plazoFinal").text(numeroCuotas);
              $("#typoFinal").text(selectedValue);

              $.ajax({
                showLoader: true,
                type: "POST",
                url: "http://54.162.16.202/api/check-agreements",
                data: {
                  client_id: clientdata.client.id,
                  number_installments: numeroCuotas,
                  unit_time: selectedValue,
                  amount_per_installment: ajusteTotal,
                },
                success: function (response) {
                  console.log(response);
                },
                error: function (error) {
                  console.log(error);
                },
              });

              showstep("finalInstallment");
            }
          });
        } else if (totalCuota === total) {
          Swal.fire({
            icon: "success",
            title: "Genial!!",
            text: "Su forma de pago cumple con el monto total",
            showDenyButton: true,
            confirmButtonText: "Continuar",
            denyButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $("#pagoFinal").text(ajusteTotal);
              $("#plazoFinal").text(numeroCuotas);
              $("#typoFinal").text(selectedValue);

              $.ajax({
                showLoader: true,
                type: "POST",
                url: "http://54.162.16.202/api/check-agreements",
                data: {
                  client_id: clientdata.client.id,
                  number_installments: numeroCuotas,
                  unit_time: selectedValue,
                  amount_per_installment: ajusteTotal,
                },
                success: function (response) {
                  console.log(response);
                },
                error: function (error) {
                  console.log(error);
                },
              });

              showstep("finalInstallment");
            }
          });
        }
      }
    } else if (selectedValue === "quincenales") {
      if (numeroCuotas > 48) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "El número de cuotas debe ser menor a 48 quincenas",
        });
      } else {
        if (totalCuota > total) {
          Swal.fire({
            icon: "info",
            title: "Ajuste",
            text: `Su pago excede al monto total, asi que el pago ajustado es de $${ajusteTotal} por ${numeroCuotas} quincenas ¿deseas continuar con el pago?`,
            showDenyButton: true,
            confirmButtonText: "Continuar",
            denyButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $("#pagoFinal").text(ajusteTotal);
              $("#plazoFinal").text(numeroCuotas);
              $("#typoFinal").text(selectedValue);

              $.ajax({
                showLoader: true,
                type: "POST",
                url: "http://54.162.16.202/api/check-agreements",
                data: {
                  client_id: clientdata.client.id,
                  number_installments: numeroCuotas,
                  unit_time: selectedValue,
                  amount_per_installment: ajusteTotal,
                },
                success: function (response) {
                  console.log(response);
                },
                error: function (error) {
                  console.log(error);
                },
              });

              showstep("finalInstallment");
            }
          });
        } else if (totalCuota < total) {
          Swal.fire({
            icon: "info",
            title: "Ajuste",
            text: `No cumple con el monto total, el pago ajustado es de $${ajusteTotal} por ${numeroCuotas} quincenas ¿Deseas continuar con el pago?`,
            showDenyButton: true,
            confirmButtonText: "Continuar",
            denyButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $("#pagoFinal").text(ajusteTotal);
              $("#plazoFinal").text(numeroCuotas);
              $("#typoFinal").text(selectedValue);

              $.ajax({
                showLoader: true,
                type: "POST",
                url: "http://54.162.16.202/api/check-agreements",
                data: {
                  client_id: clientdata.client.id,
                  number_installments: numeroCuotas,
                  unit_time: selectedValue,
                  amount_per_installment: ajusteTotal,
                },
                success: function (response) {
                  console.log(response);
                },
                error: function (error) {
                  console.log(error);
                },
              });

              showstep("finalInstallment");
            }
          });
        } else if (totalCuota === total) {
          Swal.fire({
            icon: "success",
            title: "Genial!!",
            text: "Su forma de pago cumple con el monto total",
            showDenyButton: true,
            confirmButtonText: "Continuar",
            denyButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              $("#pagoFinal").text(ajusteTotal);
              $("#plazoFinal").text(numeroCuotas);
              $("#typoFinal").text(selectedValue);

              $.ajax({
                showLoader: true,
                type: "POST",
                url: "http://54.162.16.202/api/check-agreements",
                data: {
                  client_id: clientdata.client.id,
                  number_installments: numeroCuotas,
                  unit_time: selectedValue,
                  amount_per_installment: ajusteTotal,
                },
                success: function (response) {
                  console.log(response);
                },
                error: function (error) {
                  console.log(error);
                },
              });

              showstep("finalInstallment");
            }
          });
        }
      }
    }
  }

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

  $("#btnPdfInstallment").click(function () {
    var monto = $("#pagoFinal").text();
    pdf(monto);
  });

  $("#tabs").change(function () {
    var value = $(this).val();

    switch (value) {
      case "1":
        showstep("dashboard");
        break;
      case "2":
        showstep("payment_info");
        break;
      case "3":
        showstep("payment_history");
        break;
      case "4":
        showstep("frequent_questions");
        break;
    }
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
});

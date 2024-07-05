let myChart = null;

async function getCurrencyData() {
  try {
    const res = await fetch("https://mindicador.cl/api");
    if (!res.ok) {
      throw new Error("Network response was not ok.");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    return null;
  }
}

async function convertCurrency() {
  const amount = document.getElementById("amount").value;
  const currency = document.getElementById("currency").value;

  const data = await getCurrencyData();
  if (data) {
    const exchangeRate = data[currency].valor;
    const convertedAmount = (amount / exchangeRate).toFixed(2);
    document.getElementById("convertedTotal").textContent = `Resultado: ${convertedAmount} ${currency}`;

    renderGrafica(currency);
  } else {
    document.getElementById("convertedTotal").textContent = "Error al obtener los datos";
  }
}

async function getCurrencyValues(tipo_indicador) {
  const endpoint = `https://mindicador.cl/api/${tipo_indicador}`;
  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error("Network response was not ok.");
    }
    const currencyValues = await res.json();
    return currencyValues;
  } catch (error) {
    console.error("Error al obtener los valores:", error);
    return null;
  }
}

function prepararConfiguracionParaLaGrafica(currencyValues) {
  const tipoDeGrafica = "line";
  const dates = currencyValues.serie.map(entry => {
    return dayjs(entry.fecha).format('DD/MM/YYYY');
  });
  const lastTenDates = dates.slice(-10); // Obtiene los últimos 10 elementos
  const titulo = currencyValues.nombre;
  const colorDeLinea = "green";
  const values = currencyValues.serie.map(entry => {
    const valor = parseFloat(entry.valor);
    return valor;
  });
  const config = {
    type: tipoDeGrafica,
    data: {
      labels: lastTenDates,
      datasets: [
        {
          label: titulo,
          backgroundColor: colorDeLinea,
          data: values,
        },
      ],
    },
  };
  return config;
}

async function renderGrafica(currency) {
  const currencyValues = await getCurrencyValues(currency);
  if (currencyValues) {
    if (myChart) {
      myChart.destroy();
    }
    const config = prepararConfiguracionParaLaGrafica(currencyValues);
    const chartContainer = document.getElementById("chartContainer");
    chartContainer.style.backgroundColor = "white"; 
    chartContainer.style.width = "75%"; 
    chartContainer.style.borderRadius = "5px"; 
    const canvas = document.createElement("canvas");
    canvas.id = "myChart";
    chartContainer.innerHTML = "";
    chartContainer.appendChild(canvas);
    const chartDOM = document.getElementById("myChart");
    myChart = new Chart(chartDOM, config);
  } else {
    console.error("No se pudieron obtener los valores para el gráfico.");
  }
}
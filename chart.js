
let tempChart;
let aqiChart;
let weatherPie;

function updateWeather(data){

  const current = data.current;

  const info = weatherInfo(current.weather_code);

  document.getElementById("temp").innerText =
    `${Math.round(current.temperature_2m)}°C`;

  document.getElementById("condition").innerText =
    info[0];

  document.getElementById("weatherIcon").src =
    info[2];

  document.getElementById("humidity").innerText =
    `${current.relative_humidity_2m}%`;

  document.getElementById("wind").innerText =
    `${current.wind_speed_10m} km/h`;

  document.getElementById("feels").innerText =
    `${Math.round(current.apparent_temperature)}°C`;

  document.getElementById("pressure").innerText =
    `${current.pressure_msl} hPa`;

  // FORECAST
  const forecast = document.getElementById("forecast");

  forecast.innerHTML = "";

  const labels = [];
  const temps = [];
  const weatherTypes = {
    good:0,
    medium:0,
    bad:0
  };

  data.daily.time.forEach((day,index)=>{

    const date = new Date(day);

    const info = weatherInfo(data.daily.weather_code[index]);

    labels.push(
      date.toLocaleDateString('vi-VN',{
        weekday:'short'
      })
    );

    temps.push(data.daily.temperature_2m_max[index]);

    // PHÂN LOẠI THỜI TIẾT
    const code = data.daily.weather_code[index];

    if(code <= 2){
      weatherTypes.good++;
    }
    else if(code <= 3){
      weatherTypes.medium++;
    }
    else{
      weatherTypes.bad++;
    }

    forecast.innerHTML += `
      <div class="forecast-item">
        <h4>
          ${date.toLocaleDateString('vi-VN',{
            weekday:'short'
          })}
        </h4>

        <img src="${info[2]}">

        <p>
          ${Math.round(data.daily.temperature_2m_max[index])}°
          /
          ${Math.round(data.daily.temperature_2m_min[index])}°
        </p>
      </div>
    `;
  });

  renderTempChart(labels,temps);
  renderWeatherPie(weatherTypes);
}

// ============================
// AQI UPDATE
// ============================

function updateAQI(aqi){

  const value = document.getElementById("aqiValue");
  const status = document.getElementById("aqiStatus");

  value.innerText = aqi;

  status.className = "aqi-status";

  let level = "Tốt";
  let color = "#43a047";

  if(aqi <= 50){
    level = "Tốt";
    color = "#43a047";
    status.classList.add("good");
  }
  else if(aqi <= 100){
    level = "Trung bình";
    color = "#fbc02d";
    status.classList.add("moderate");
  }
  else{
    level = "Tệ";
    color = "#e53935";
    status.classList.add("bad");
  }

  status.innerText = level;

  renderAQIChart(aqi,color);
}

// ============================
// TEMPERATURE CHART
// ============================

function renderTempChart(labels,temps){

  const ctx = document
    .getElementById("tempChart")
    .getContext("2d");

  if(tempChart){
    tempChart.destroy();
  }

  const colors = temps.map(temp=>{

    if(temp <= 24) return "#43a047";
    if(temp <= 32) return "#fbc02d";

    return "#e53935";
  });

  tempChart = new Chart(ctx,{
    type:'bar',

    data:{
      labels:labels,

      datasets:[{
        label:'Nhiệt độ °C',
        data:temps,
        backgroundColor:colors,
        borderRadius:10
      }]
    },

    options:{
      responsive:true,

      plugins:{
        legend:{
          display:false
        }
      }
    }
  });
}

// ============================
// AQI CHART
// ============================

function renderAQIChart(aqi,color){

  const ctx = document
    .getElementById("aqiChart")
    .getContext("2d");

  if(aqiChart){
    aqiChart.destroy();
  }

  aqiChart = new Chart(ctx,{
    type:'doughnut',

    data:{
      labels:['AQI','Còn lại'],

      datasets:[{
        data:[aqi,300-aqi],
        backgroundColor:[
          color,
          '#e0e0e0'
        ],
        borderWidth:0
      }]
    },

    options:{
      cutout:'75%',

      plugins:{
        legend:{
          position:'bottom'
        }
      }
    }
  });
}

// ============================
// WEATHER PIE
// ============================

function renderWeatherPie(types){

  const ctx = document
    .getElementById("weatherPie")
    .getContext("2d");

  if(weatherPie){
    weatherPie.destroy();
  }

  weatherPie = new Chart(ctx,{
    type:'pie',

    data:{
      labels:[
        'Tốt',
        'Trung bình',
        'Tệ'
      ],

      datasets:[{
        data:[
          types.good,
          types.medium,
          types.bad
        ],

        backgroundColor:[
          '#43a047',
          '#fbc02d',
          '#e53935'
        ]
      }]
    },

    options:{
      responsive:true,

      plugins:{
        legend:{
          position:'bottom'
        }
      }
    }
  });
}
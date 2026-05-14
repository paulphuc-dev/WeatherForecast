async function getCoordinates(city){
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=vi&format=json`;

    const res = await fetch(url);
    const data = await res.json();

    if(!data.results){
      alert("Không tìm thấy thành phố");
      return null;
    }

    return data.results[0];
  }

  async function fetchWeather(cityName="Ho Chi Minh"){
    const location = await getCoordinates(cityName);

    if(!location) return;

    const lat = location.latitude;
    const lon = location.longitude;

    document.getElementById("city").innerText =
      `${location.name}, ${location.country}`;

    // WEATHER API
    const weatherURL =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;

    // AIR QUALITY API
    const airURL =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

    const [weatherRes, airRes] = await Promise.all([
      fetch(weatherURL),
      fetch(airURL)
    ]);

    const weatherData = await weatherRes.json();
    const airData = await airRes.json();

    updateWeather(weatherData);
    updateAQI(airData.current.us_aqi);
    updateUV(
      Math.round(
        weatherData.daily.uv_index_max[0]
      )
    );
    generateTips(weatherData, airData.current.us_aqi);
  }

  function weatherInfo(code){
    const map = {
      0:["Trời quang","☀️","https://cdn-icons-png.flaticon.com/512/869/869869.png"],
      1:["Ít mây","🌤️","https://cdn-icons-png.flaticon.com/512/1163/1163661.png"],
      2:["Có mây","⛅","https://cdn-icons-png.flaticon.com/512/414/414825.png"],
      3:["Nhiều mây","☁️","https://cdn-icons-png.flaticon.com/512/414/414927.png"],
      61:["Mưa nhẹ","🌧️","https://cdn-icons-png.flaticon.com/512/3313/3313888.png"],
      63:["Mưa","🌧️","https://cdn-icons-png.flaticon.com/512/3351/3351979.png"],
      65:["Mưa lớn","⛈️","https://cdn-icons-png.flaticon.com/512/1146/1146860.png"],
      71:["Tuyết","❄️","https://cdn-icons-png.flaticon.com/512/642/642102.png"]
    };

    return map[code] || ["Không xác định","🌡️","https://cdn-icons-png.flaticon.com/512/1779/1779940.png"];
  }

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

    // Forecast
    const forecast = document.getElementById("forecast");
    forecast.innerHTML = "";

    data.daily.time.forEach((day,index)=>{
      const date = new Date(day);

      const info = weatherInfo(data.daily.weather_code[index]);

      forecast.innerHTML += `
        <div class="forecast-item">
          <h4>
            ${date.toLocaleDateString('vi-VN',{
              weekday:'short'
            })}
          </h4>

          <img src="${info[2]}">

          <p>${Math.round(data.daily.temperature_2m_max[index])}° /
          ${Math.round(data.daily.temperature_2m_min[index])}°</p>
        </div>
      `;
    });
  }

  function updateAQI(aqi){
    const value = document.getElementById("aqiValue");
    const status = document.getElementById("aqiStatus");

    value.innerText = aqi;

    status.className = "aqi-status";

    if(aqi <= 50){
      status.innerText = "Tốt";
      status.classList.add("good");
    }
    else if(aqi <= 100){
      status.innerText = "Trung bình";
      status.classList.add("moderate");
    }
    else{
      status.innerText = "Kém";
      status.classList.add("bad");
    }
  }

  function generateTips(weatherData,aqi){
    const tips = [];

    const temp = weatherData.current.temperature_2m;
    const weatherCode = weatherData.current.weather_code;

    if(temp >= 32){
      tips.push("🧴 Kem chống nắng");
      tips.push("🧢 Nón");
      tips.push("💧 Nước uống");
    }

    if(temp <= 20){
      tips.push("🧥 Áo khoác");
    }

    if([61,63,65].includes(weatherCode)){
      tips.push("☂️ Ô / Áo mưa");
    }

    if(aqi > 100){
      tips.push("😷 Khẩu trang");
    }

    if(tips.length === 0){
      tips.push("👍 Bạn không cần mang thêm gì cả");
    }

    const tipsContainer = document.getElementById("tips");

    tipsContainer.innerHTML = "";

    tips.forEach(tip=>{
      tipsContainer.innerHTML += `
        <div class="tip">${tip}</div>
      `;
    });
  }

  async function searchWeather(){
    const city = document.getElementById("cityInput").value;

    if(city.trim() !== ""){
      fetchWeather(city);
    }
  }

  function updateUV(uv){
      const uvValue = document.getElementById("uvValue");
      const uvLevel = document.getElementById("uvLevel");
      const uvDesc = document.getElementById("uvDesc");
      const uvCircle = document.getElementById("uvCircle");

      uvValue.innerText = uv;

      if(uv <= 2){

          uvLevel.innerText = "Thấp";
          uvDesc.innerText =
            "An toàn khi hoạt động ngoài trời.";

          uvCircle.style.background =
            "linear-gradient(135deg,#22c55e,#16a34a)";
      }

      else if(uv <= 5){

          uvLevel.innerText = "Trung bình";
          uvDesc.innerText =
            "Nên dùng kem chống nắng khi ra ngoài.";

          uvCircle.style.background =
            "linear-gradient(135deg,#facc15,#eab308)";
      }

      else if(uv <= 7){

          uvLevel.innerText = "Cao";
          uvDesc.innerText =
            "Hạn chế ra nắng thời gian dài.";

          uvCircle.style.background =
            "linear-gradient(135deg,#fb923c,#f97316)";
      }

      else{

          uvLevel.innerText = "Rất cao";
          uvDesc.innerText =
            "Nên tránh nắng và mặc đồ bảo hộ.";

          uvCircle.style.background =
            "linear-gradient(135deg,#ef4444,#dc2626)";
      }
  }

  document.addEventListener("DOMContentLoaded", () => {
      document.getElementById("search").addEventListener("click", searchWeather)
      fetchWeather();
  });
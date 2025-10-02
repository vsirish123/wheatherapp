// my api key from weatherapi.com
const apiKey = "31bf3367baca4d1a900140312250110";
const baseUrl = "https://api.weatherapi.com/v1";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");
const weatherDisplay = document.getElementById("weatherDisplay");
const recentCities = document.getElementById("recentCities");

// Load recent cities from localStorage
let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
updateDropdown();

// Fetch weather by city
async function getWeather(city) {
  try {
    const url = `${baseUrl}/forecast.json?key=${apiKey}&q=${city}&days=5&aqi=no&alerts=no`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found!");
    const data = await res.json();
    displayWeather(data);

    // Save to recent cities
    if (!cities.includes(city)) {
      cities.push(city);
      localStorage.setItem("recentCities", JSON.stringify(cities));
      updateDropdown();
    }
  } catch (err) {
    showError(err.message);
  }
}

// Fetch weather by location (geolocation)
function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const url = `${baseUrl}/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=5&aqi=no&alerts=no`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Location not found!");
          const data = await res.json();
          displayWeather(data);
        } catch (err) {
          showError(err.message);
        }
      },
      () => showError("Location access denied.")
    );
  } else {
    showError("Geolocation not supported by your browser.");
  }
}

//  Display weather cards
let isCelsius = true; // default unit

function displayWeather(data) {
  weatherDisplay.innerHTML = "";

  const current = data.current;
  const location = data.location;

  // Create today card with only Celsius first
  const todayCard = `
    <div class="weather-card bg-white rounded-2xl p-4 shadow-md flex flex-col items-center text-center">
      <h2 class="text-xl font-bold">${location.name}, ${location.country}</h2>
      <img src="${current.condition.icon}" alt="${current.condition.text}" class="weather-icon my-2">
      <p id="todayTemp" class="text-2xl font-semibold">${current.temp_c}°C</p>
      <p class="text-gray-600">Condition: ${current.condition.text}</p>
      <p class="text-gray-600">Humidity: ${current.humidity}%</p>
      <p class="text-gray-600">Wind: ${current.wind_kph} km/h</p>
    </div>
  `;
  weatherDisplay.insertAdjacentHTML("beforeend", todayCard);

  //  Extreme temperature alert (>40°C or >104°F)
  if (current.temp_c > 40) {
    alert(` Extreme Heat Alert! Current temperature is ${current.temp_c}°C`);
  }

  // Forecast (next 4 days) stays same
  data.forecast.forecastday.forEach((day, index) => {
    if (index === 0) return;
    const card = `
      <div class="weather-card bg-white rounded-2xl p-4 shadow-md flex flex-col items-center text-center">
        <h2 class="text-lg font-bold">${day.date}</h2>
        <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" class="weather-icon my-2">
        <p class="text-xl font-semibold">${day.day.avgtemp_c}°C</p>
        <p class="text-gray-600">Humidity: ${day.day.avghumidity}%</p>
        <p class="text-gray-600">Max: ${day.day.maxtemp_c}°C / Min: ${day.day.mintemp_c}°C</p>
        <p class="text-gray-600">Condition: ${day.day.condition.text}</p>
      </div>
    `;
    weatherDisplay.insertAdjacentHTML("beforeend", card);
  });

  // Toggle functionality
  const toggleBtn = document.getElementById("toggleUnit");
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      const todayTemp = document.getElementById("todayTemp");
      if (isCelsius) {
        todayTemp.textContent = `${current.temp_f}°F`;
        toggleBtn.textContent = "Show in °C";
      } else {
        todayTemp.textContent = `${current.temp_c}°C`;
        toggleBtn.textContent = "Show in °F";
      }
      isCelsius = !isCelsius;
    };
  }
}


// Update dropdown for recent cities
function updateDropdown() {
  if (cities.length > 0) {
    recentCities.classList.remove("hidden");
    recentCities.innerHTML = cities.map(city => `<option value="${city}">${city}</option>`).join("");
  } else {
    recentCities.classList.add("hidden");
  }
}

// Show error nicely
function showError(msg) {
  weatherDisplay.innerHTML = `
    <div class="bg-red-100 text-red-700 p-4 rounded-lg shadow-md text-center">
      ${msg}
    </div>
  `;
}

//  Event listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  } else {
    showError("Please enter a city name.");
  }
});

locBtn.addEventListener("click", getWeatherByLocation);

recentCities.addEventListener("change", (e) => {
  const city = e.target.value;
  if (city) getWeather(city);
});

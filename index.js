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
function displayWeather(data) {
  weatherDisplay.innerHTML = "";

  // Current weather
  const current = data.current;
  const location = data.location;
  const todayCard = `
    <div class="weather-card bg-white rounded-2xl p-4 shadow-md flex flex-col items-center text-center">
      <h2 class="text-xl font-bold">${location.name}, ${location.country}</h2>
      <img src="${current.condition.icon}" alt="${current.condition.text}" class="weather-icon my-2">
      <p class="text-2xl font-semibold">${current.temp_c}°C / ${current.temp_f}°F</p>
      <p class="text-gray-600">Condition: ${current.condition.text}</p>
      <p class="text-gray-600">Humidity: ${current.humidity}%</p>
      <p class="text-gray-600">Wind: ${current.wind_kph} km/h</p>
    </div>
  `;
  weatherDisplay.insertAdjacentHTML("beforeend", todayCard);

  // Background change (sunny, rainy, cloudy)
  const body = document.body;
  body.classList.remove("bg-sunny", "bg-rainy", "bg-cloudy", "bg-clear");
  if (current.condition.text.toLowerCase().includes("rain")) {
    body.classList.add("bg-rainy");
  } else if (current.condition.text.toLowerCase().includes("cloud")) {
    body.classList.add("bg-cloudy");
  } else if (current.condition.text.toLowerCase().includes("sun") || current.is_day) {
    body.classList.add("bg-sunny");
  } else {
    body.classList.add("bg-clear");
  }

  // Forecast (next 4 days)
  data.forecast.forecastday.forEach((day, index) => {
    if (index === 0) return; // Skip today
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

// Set up the canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables for scrolling ground
let bgX = 0;
const bgSpeed = 2;

// Weather condition variable (default to "Clear")
let weatherCondition = "Clear";

// Default coordinates (fallback if user denies geolocation)
let lat = 10.8231, lon = 106.6297; 

// OpenWeatherMap API key (your provided key)
const apiKey = "8e6673a84806c8cda8ac340bcf071274";

// Update the weather API URL using the current lat/lon
function updateWeatherUrl() {
  return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
}

// Fetch weather data from OpenWeatherMap
async function fetchWeather() {
  const weatherUrl = updateWeatherUrl();
  console.log("Fetching weather data from:", weatherUrl);
  try {
    const response = await fetch(weatherUrl);
    if (!response.ok) {
      console.error("Network response was not ok:", response.status);
      weatherCondition = "Clear"; // fallback
      return;
    }
    const data = await response.json();
    console.log("Weather data received:", data);
    // Use the main condition (e.g., "Rain", "Snow", "Clear")
    weatherCondition = data.weather[0].main;
    console.log("Updated weather condition:", weatherCondition);
  } catch (error) {
    console.error("Fetch error:", error);
    weatherCondition = "Clear";
  }
}

// Use the browser's geolocation to get the user's current position
function getLocationAndFetchWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      console.log("User location:", lat, lon);
      fetchWeather();
    }, (error) => {
      console.error("Geolocation error:", error);
      // If geolocation fails, use default coordinates and fetch weather
      fetchWeather();
    });
  } else {
    console.error("Geolocation is not supported by this browser.");
    fetchWeather();
  }
}

getLocationAndFetchWeather();

// Define a simple character object
const character = {
  x: 100,
  y: canvas.height - 150, // positioned above the ground
  width: 50,
  height: 50,
  color: "#FF00FF", // magenta
  speed: 5,
  vx: 0
};

// Keyboard controls to move the character left/right
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    character.vx = character.speed;
  } else if (e.key === "ArrowLeft") {
    character.vx = -character.speed;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    character.vx = 0;
  }
});

// Main game loop
function gameLoop() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Choose a background color based on the weather condition
  let bgColor;
  if (weatherCondition === "Rain") {
    bgColor = "#5F9EA0"; // cloudy-blue tone for rain
  } else if (weatherCondition === "Snow") {
    bgColor = "#FFFafa"; // pale wintry tone for snow
  } else {
    bgColor = "#87CEEB"; // default clear sky blue
  }
  
  // Fill the canvas with the chosen background color
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw a scrolling ground at the bottom
  ctx.fillStyle = "#654321"; // brown ground
  ctx.fillRect(bgX, canvas.height - 100, canvas.width, 100);
  ctx.fillRect(bgX + canvas.width, canvas.height - 100, canvas.width, 100);
  bgX -= bgSpeed;
  if (bgX <= -canvas.width) {
    bgX = 0;
  }
  
  // Update the character position based on its velocity
  character.x += character.vx;
  if (character.x < 0) character.x = 0;
  if (character.x + character.width > canvas.width) {
    character.x = canvas.width - character.width;
  }
  
  // Draw the character as a rectangle
  ctx.fillStyle = character.color;
  ctx.fillRect(character.x, character.y, character.width, character.height);
  
  requestAnimationFrame(gameLoop);
}

gameLoop();

// Resize canvas if the window size changes
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  character.y = canvas.height - 150;
});

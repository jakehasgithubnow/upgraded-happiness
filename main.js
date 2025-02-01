// Set up the canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables for scrolling ground
let bgX = 0;
const bgSpeed = 2;

// Weather variables (default values)
let weatherCondition = "Clear";
let userCity = "Unknown";

// Default coordinates (used if geolocation is denied)
let lat = 10.8231, lon = 106.6297; 

// OpenWeatherMap API key (your key)
const apiKey = "8e6673a84806c8cda8ac340bcf071274";

// Build the weather API URL using current coordinates
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
    weatherCondition = data.weather[0].main;
    userCity = data.name;
    console.log("Updated weather condition:", weatherCondition);
    console.log("User city:", userCity);
  } catch (error) {
    console.error("Fetch error:", error);
    weatherCondition = "Clear";
  }
}

// Use the browser's geolocation to get the user's coordinates and fetch weather data
function getLocationAndFetchWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      console.log("User location:", lat, lon);
      fetchWeather();
    }, (error) => {
      console.error("Geolocation error:", error);
      fetchWeather();
    });
  } else {
    console.error("Geolocation is not supported by this browser.");
    fetchWeather();
  }
}

getLocationAndFetchWeather();

// Load image assets
const humanImage = new Image();
humanImage.src = "https://via.placeholder.com/50?text=Human";  // Replace with a human sprite if available

const enemyImage = new Image();
enemyImage.src = "https://via.placeholder.com/50?text=Enemy";    // Replace with your enemy sprite if available

const obstacleImage = new Image();
obstacleImage.src = "https://via.placeholder.com/50?text=Obs";     // Replace with your obstacle sprite if available

// Define the human character object
const character = {
  x: 100,
  y: canvas.height - 150, // Positioned above the ground
  width: 50,
  height: 50,
  speed: 5,
  vx: 0
};

// Arrays to store enemies and obstacles
let enemies = [];
let obstacles = [];

// Spawn an enemy object
function spawnEnemy() {
  const enemy = {
    x: canvas.width,
    y: canvas.height - 150, // On ground level, same as character
    width: 50,
    height: 50,
    speed: 3 + Math.random() * 2 // Random speed for variation
  };
  enemies.push(enemy);
  console.log("Spawned enemy. Total enemies:", enemies.length);
}

// Spawn an obstacle object
function spawnObstacle() {
  const obstacle = {
    x: canvas.width,
    y: canvas.height - 120, // Slightly above the ground
    width: 30,
    height: 30,
    speed: 3 // Fixed speed
  };
  obstacles.push(obstacle);
  console.log("Spawned obstacle. Total obstacles:", obstacles.length);
}

// Immediately spawn one enemy and one obstacle at start
spawnEnemy();
spawnObstacle();

// Set intervals to spawn enemies and obstacles periodically
setInterval(spawnEnemy, 3000);
setInterval(spawnObstacle, 4000);

// Update enemy positions and remove off-screen enemies
function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].x -= enemies[i].speed;
    if (enemies[i].x + enemies[i].width < 0) {
      enemies.splice(i, 1);
    }
  }
}

// Update obstacle positions and remove off-screen obstacles
function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= obstacles[i].speed;
    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
    }
  }
}

// Draw enemy objects
function drawEnemies() {
  enemies.forEach(enemy => {
    if (enemyImage.complete) {
      ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    } else {
      ctx.fillStyle = "#FF0000"; // red fallback
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
  });
}

// Draw obstacle objects
function drawObstacles() {
  obstacles.forEach(obstacle => {
    if (obstacleImage.complete) {
      ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    } else {
      ctx.fillStyle = "#000000"; // black fallback
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  });
}

// Keyboard controls for character movement
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Choose background color based on weather condition
  let bgColor;
  if (weatherCondition === "Rain") {
    bgColor = "#5F9EA0"; // cloudy-blue tone for rain
  } else if (weatherCondition === "Snow") {
    bgColor = "#FFFafa"; // pale wintry tone for snow
  } else {
    bgColor = "#87CEEB"; // default clear sky blue
  }
  
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw scrolling ground at the bottom
  ctx.fillStyle = "#654321"; // brown ground
  ctx.fillRect(bgX, canvas.height - 100, canvas.width, 100);
  ctx.fillRect(bgX + canvas.width, canvas.height - 100, canvas.width, 100);
  bgX -= bgSpeed;
  if (bgX <= -canvas.width) {
    bgX = 0;
  }
  
  // Update and draw the character
  character.x += character.vx;
  if (character.x < 0) character.x = 0;
  if (character.x + character.width > canvas.width) {
    character.x = canvas.width - character.width;
  }
  if (humanImage.complete) {
    ctx.drawImage(humanImage, character.x, character.y, character.width, character.height);
  } else {
    ctx.fillStyle = "#FF00FF"; // fallback magenta rectangle
    ctx.fillRect(character.x, character.y, character.width, character.height);
  }
  
  // Update and draw enemies and obstacles
  updateEnemies();
  updateObstacles();
  drawEnemies();
  drawObstacles();
  
  // Display user's city name at the top-left corner
  ctx.font = "24px Arial";
  ctx.fillStyle = "#000";
  ctx.fillText("City: " + userCity, 20, 40);
  
  requestAnimationFrame(gameLoop);
}

gameLoop();

// Adjust canvas size on window resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  character.y = canvas.height - 150;
});

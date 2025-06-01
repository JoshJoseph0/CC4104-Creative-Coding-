
//globel veribles 
let sunSize;
let sunColor;
let ringDistances = [];
let ringAngles = [];
let ringSpeeds = [];
let planetSizes = [];
let planetColors = [];

function setup() {
  createCanvas(800, 800);
  sunSize = random(100, 200);

  //set random colour of the sun
  let r = random(200, 255);
  let g = random(200, 255);
  let b = random(0, 50);
  sunColor = color(r, g, b);
  
  //setting how far away the rings have to be from the sun
  let baseDistance = sunSize / 2 + 150;

  for (let i = 0; i < 3; i++) {
    ringDistances.push(baseDistance);
    ringAngles.push(random(TWO_PI));
    // gives each planet a random speed 
    ringSpeeds.push(random(0.005, 0.02)); 

    // Planets sized and colous
    planetSizes.push(random(10, 30));
    let pr = random(100, 255);
    let pg = random(100, 255);
    let pb = random(100, 255);
    planetColors.push(color(pr, pg, pb));

    baseDistance += random(50, 80);
  }
}

function draw() {
  background(0);
  sunGlow();
  sun();
  drawRings();
  updateRingAngles(); // Update planet positions
  drawRingPoints();
}

function sun() {
  fill(sunColor);
  noStroke();
  circle(400, 400, sunSize);
}

function sunGlow() {
  noStroke();
  let glowLayers = 3;
  for (let i = glowLayers; i > 0; i--) {
    let alpha = map(i, 1, glowLayers, 10, 40);
    let glowColor = color(red(sunColor), green(sunColor), blue(sunColor), alpha);
    fill(glowColor);
    let size = sunSize + i * 10;
    circle(400, 400, size);
  }
}

function drawRings() {
  noFill();
  stroke(255);
  strokeWeight(2);

  for (let i = 0; i < ringDistances.length; i++) {
    circle(400, 400, ringDistances[i] * 2);
  }
}

function drawRingPoints() {
  noStroke();
  
  for (let i = 0; i < ringDistances.length; i++) {
    let angle = ringAngles[i];
    let x = 400 + cos(angle) * ringDistances[i];
    let y = 400 + sin(angle) * ringDistances[i];

    fill(planetColors[i]);
    circle(x, y, planetSizes[i]*4);
  }
}

function updateRingAngles() {
  for (let i = 0; i < ringAngles.length; i++) {
    ringAngles[i] += ringSpeeds[i]; // Rotate planet along the ring
  }
}


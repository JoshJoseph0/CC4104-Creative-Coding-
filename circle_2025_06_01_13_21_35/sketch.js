let mycelium = [];
let mic, fft;
let lastBass = 0;
let prevSpectrum = [];
let spectralFlux = 0;
let maxLifespan = 100; // Max lifespan of a fungal thread
let maxThreads = 750; // Maximum number of threads on screen

function setup() {
  createCanvas(600, 600);
  noStroke();
  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(0.8, 64);
  fft.setInput(mic);

  background(10);
  // Start fungal thread near bottom center
  mycelium.push(new FungalThread(width / random(2, 5), height, -PI / 2));
}

function draw() {
  // Dark background with subtle fading for motion trails
  noStroke();
  fill(10, 10, 10, 15);
  rect(0, 0, width, height);

  // Audio analysis
  let bass = fft.getEnergy("bass");
  let bassDelta = bass - lastBass;
  lastBass = bass;

  // Draw fungal threads
  stroke(220, 180);
  strokeWeight(3);
  for (let i = mycelium.length - 1; i >= 0; i--) {
    mycelium[i].grow();

    // If the thread has exceeded its lifespan, remove it
    if (mycelium[i].lifespan <= 0&&mycelium.length>5) {
      mycelium.splice(i, 1);
    }
  }

  // Split fungal threads on strong bass hits
  if (bassDelta > 40) {
    let newBranches = [];
    for (let t of mycelium) {
      newBranches.push(new FungalThread(t.pos.x, t.pos.y, t.angle + random(PI / 8, PI / 4)));
      newBranches.push(new FungalThread(t.pos.x, t.pos.y, t.angle - random(PI / 8, PI / 4)));
    }
    mycelium.push(...newBranches);
  }

  // Calculate spectral flux (how fast spectrum changes frame-to-frame)
  let spectrum = fft.analyze();
  spectralFlux = 0;
  if (prevSpectrum.length === spectrum.length) {
    for (let i = 0; i < spectrum.length; i++) {
      let diff = spectrum[i] - prevSpectrum[i];
      if (diff > 0) spectralFlux += diff;
    }
  }
  prevSpectrum = spectrum;

  // Map spectral flux to how often threads randomly branch (speed factor)
  let speedFactor = map(spectralFlux, 0, 1000, 0.001, 0.05, true);

  // Random branching modulated by speedFactor
  if (frameCount % 2 === 0) {
    let moreBranches = [];
    for (let t of mycelium) {
      if (random(1) < speedFactor) {
        moreBranches.push(new FungalThread(t.pos.x, t.pos.y, t.angle + random(-PI / 4, PI / 4)));
      }
    }
    mycelium.push(...moreBranches);
  }

  // Limit number of threads to maxThreads
  if (mycelium.length > maxThreads) {
    let excessThreads = mycelium.length - maxThreads;
    mycelium.splice(0, excessThreads); // Remove excess threads (older threads)
  }

  // Draw the reactive circle grid on top
  drawReactiveGrid();
}

function drawReactiveGrid() {
  let vol = mic.getLevel();
  vol = constrain(vol * 5, 0, 1); // boost sensitivity

  let cols = 40;
  let rows = 40;
  let centerX = width / 2;
  let centerY = height / 2;
  let maxDist = dist(0, 0, centerX, centerY);
  let baseSpacing = width / cols;
  let reactiveRadius = map(vol*4, 0, 1, 0, maxDist * 0.5);

  noStroke();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let normX = x / (cols - 1);
      let normY = y / (rows - 1);

      let gx = normX * width;
      let gy = normY * height;

      let d = dist(gx, gy, centerX, centerY);
      let falloff = map(d, 0, maxDist, 1.2, 0.6);

      let adjustedX = lerp(centerX, gx, falloff);
      let adjustedY = lerp(centerY, gy, falloff);

      let size = baseSpacing * 0;
      let brightness = 100;

      if (d < reactiveRadius) {
        let boost = map(d, 0, reactiveRadius, 1, 0);
        size += boost * vol * 40;
        brightness = map(boost * vol, 0, 1, 50, 255);
      }

      fill(brightness, 100, 200);
      ellipse(adjustedX, adjustedY, size);
    }
  }
}

class FungalThread {
  constructor(x, y, angle) {
    this.pos = createVector(x, y);
    this.prev = this.pos.copy();
    this.angle = angle;
    this.speed = 1.2;
    this.lifespan = maxLifespan+random(50); 
  }

  grow() {
    this.prev = this.pos.copy();

    // Noise for natural curvature
    let n = noise(this.pos.x * 0.005, this.pos.y * 0.005, frameCount * 0.002);
    this.angle += map(n, 0, 1, -0.03, 0.03);

    let vel = p5.Vector.fromAngle(this.angle).mult(this.speed);
    this.pos.add(vel);

    stroke(220, 180);
    line(this.prev.x, this.prev.y, this.pos.x, this.pos.y);

    // Wrap edges for continuous growth
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;

    // Decrease lifespan as thread grows
    this.lifespan--;
  }
}

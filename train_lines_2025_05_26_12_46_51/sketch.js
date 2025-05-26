let lines = {};
let trains = [];
let numTrains = 70;
let numLines = 140; 
function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < numLines; i++) {
    const name = `line${i + 1}`;
    lines[name] = generateRandomLine();
  }

  for (let i = 0; i < numTrains; i++) addTrain();
}

function draw() {
  background(240);

  for (let line of Object.values(lines)) {
    stroke(line.color);
    strokeWeight(4);
    noFill();
    beginShape();
    for (let [x, y] of line.path) vertex(x, y);
    endShape();
  }

  for (let train of trains) {
    train.move();
    train.display();
  }
}

function mouseClicked() {
  for (let i = 0; i < 5; i++) addTrain();
}

function addTrain() {
  let line = random(Object.values(lines));
  trains.push(new Train(line, random(1)));
}

class Train {
  constructor(line, position) {
    this.line = line;
    this.position = position;
    this.speed = 0.004 + random(0.002);
    this.radius = 6;
  }

  move() {
    this.position = (this.position + this.speed) % 1;
  }

  display() {
    const { x, y } = this.getPointOnLine(this.line.path, this.position);
    fill(this.line.color);
    noStroke();
    ellipse(x, y, this.radius * 2);
  }

  getPointOnLine(path, t) {
    let total = 0;
    const lengths = [];

    for (let i = 0; i < path.length - 1; i++) {
      let d = dist(...path[i], ...path[i + 1]);
      total += d;
      lengths.push(d);
    }

    let target = total * t, current = 0;

    for (let i = 0; i < lengths.length; i++) {
      if (current + lengths[i] >= target) {
        let ratio = (target - current) / lengths[i];
        return {
          x: lerp(path[i][0], path[i + 1][0], ratio),
          y: lerp(path[i][1], path[i + 1][1], ratio)
        };
      }
      current += lengths[i];
    }

    let last = path[path.length - 1];
    return { x: last[0], y: last[1] };
  }
}

function generateRandomLine() {
  const steps = int(random(4, 7));
  const margin = 100;
  const spacing = 80;
  let x = random(margin, width - margin);
  let y = random(margin, height - margin);
  const path = [[x, y]];

  for (let i = 1; i < steps; i++) {
    let direction = random([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    x += direction[0] * spacing;
    y += direction[1] * spacing;

    // Keep within canvas bounds
    x = constrain(x, margin, width - margin);
    y = constrain(y, margin, height - margin);
    path.push([x, y]);
  }

  return {
    color: color(random(255), random(255), random(255)),
    path
  };
}


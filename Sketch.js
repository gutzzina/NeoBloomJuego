// ====================================================================
// BIO-HOMEOSTASIS: FOTO REDUCIDA PROPORCIONALMENTE (RESIZE NATIVO)
// ====================================================================

let imgHoja1 = null;
let imgHoja2 = null;
let imgHoja3 = null;
let imgRecompensa = null;

let hubs = [];
let spores = [];
let synthesisProgress = 0;
let synthesisGoal = 350;
let success = false;
let globalTime = 0;

const FONT_TITLE = 'Krona One';
const FONT_BODY = 'Poppins';

const BASE_W = 900;
const BASE_H = 600;
let uiScale = 1;
let transX = 0;
let transY = 0;

function preload() {
  imgHoja1 = loadImage('data/Hoja1.png');
  imgHoja2 = loadImage('data/Hoja2.png');
  imgHoja3 = loadImage('data/Hoja3.png');
  imgRecompensa = loadImage('data/recompensa.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  recalcLayout();

  // ESCALA PROPORCIONAL: 400 px de ancho, y el 0 calcula la altura 16:9 sola
  if (imgRecompensa) {
    imgRecompensa.resize(400, 0);
  }

  for (let i = 0; i < 45; i++) {
    spores.push({
      x: random(BASE_W),
      y: random(BASE_H),
      size: random(2, 5),
      speedY: random(-0.2, -0.6),
      speedX: random(-0.15, 0.15),
      alphaOffset: random(1000)
    });
  }

  hubs = [
    {
      id: 1,
      x: 210,
      y: 385,
      energy: 55,
      charging: false,
      name: "ESPECÍMEN 01",
      drainRate: 0.28,
      chargeRate: 0.85,
      img: imgHoja1
    },
    {
      id: 2,
      x: 450,
      y: 415,
      energy: 60,
      charging: false,
      name: "ESPECÍMEN 02",
      drainRate: 0.11,
      chargeRate: 0.45,
      img: imgHoja2
    },
    {
      id: 3,
      x: 690,
      y: 385,
      energy: 50,
      charging: false,
      name: "ESPECÍMEN 03",
      drainRate: 0.18,
      chargeRate: 0.60,
      img: imgHoja3
    }
  ];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  recalcLayout();
}

function recalcLayout() {
  let scaleX = width / BASE_W;
  let scaleY = height / BASE_H;
  uiScale = min(scaleX, scaleY);
  transX = (width - BASE_W * uiScale) / 2;
  transY = (height - BASE_H * uiScale) / 2;
}

function draw() {
  globalTime += 0.02;

  background(242, 245, 246);
  drawStudioGrid();

  push();
  translate(transX, transY);
  scale(uiScale);

  drawLightAurora();
  drawFloatingSpores();
  drawHeaderAndProgress();
  drawCentralDistributor(450, 160);

  let inBalanceCount = 0;

  for (let hub of hubs) {
    let tensionMultiplier = 1 + (synthesisProgress / synthesisGoal) * 0.35;

    if (hub.charging && !success) {
      hub.energy += hub.chargeRate;
    } else if (!success) {
      let naturalFlux = sin(globalTime * 3 + hub.id) * 0.03;
      hub.energy -= max(0.04, (hub.drainRate + naturalFlux) * tensionMultiplier);
    }
    hub.energy = constrain(hub.energy, 0, 100);

    drawFluidCable(450, 160, hub.x, hub.y, hub.charging, hub.energy);
    drawBotanicalHub(hub);

    if (hub.energy >= 35 && hub.energy <= 85) {
      inBalanceCount++;
    }
  }

  if (inBalanceCount === hubs.length && !success) {
    synthesisProgress += 0.28;
    if (synthesisProgress >= synthesisGoal) {
      success = true;
    }
  } else if (!success && synthesisProgress > 0) {
    synthesisProgress -= 0.08;
  }

  if (success) {
    drawFrostedGlassModal();
  }
  pop();

  drawFullscreenButton();
}

function drawFullscreenButton() {
  push();
  let btnW = 175;
  let btnH = 34;
  let btnX = width - btnW - 25;
  let btnY = 25;

  fill(255, 255, 255, 195);
  stroke(220, 230, 235);
  strokeWeight(1.5);
  rect(btnX, btnY, btnW, btnH, 8);

  fill(55, 75, 70);
  noStroke();
  textFont(FONT_TITLE);
  textSize(9);
  textAlign(CENTER, CENTER);
  let txt = fullscreen() ? "✕ SALIR PANTALLA" : "⛶ PANTALLA COMPLETA";
  text(txt, btnX + btnW / 2, btnY + btnH / 2);
  pop();
}

function drawStudioGrid() {
  stroke(228, 233, 236);
  strokeWeight(1);
  for (let x = 0; x < width; x += 35) line(x, 0, x, height);
  for (let y = 0; y < height; y += 35) line(0, y, width, y);
}

function drawLightAurora() {
  push();
  noFill();

  let layers = [
    { r: 160, g: 220, b: 195, a: 45, weight: 65, yOffset: 130, freq: 0.003, speed: 0.7 },
    { r: 180, g: 235, b: 215, a: 55, weight: 45, yOffset: 170, freq: 0.005, speed: 1.1 },
    { r: 195, g: 220, b: 245, a: 40, weight: 50, yOffset: 220, freq: 0.004, speed: 0.5 }
  ];

  for (let l of layers) {
    stroke(l.r, l.g, l.b, l.a);
    strokeWeight(l.weight);
    beginShape();
    for (let x = -20; x <= BASE_W + 20; x += 30) {
      let n = noise(x * l.freq, globalTime * l.speed);
      let y = l.yOffset + map(n, 0, 1, -60, 60) + sin(x * 0.01 + globalTime) * 15;
      curveVertex(x, y);
    }
    endShape();
  }
  pop();
}

function drawFloatingSpores() {
  noStroke();
  for (let s of spores) {
    s.y += s.speedY;
    s.x += sin(globalTime * 2 + s.alphaOffset) * 0.25;

    if (s.y < -10) {
      s.y = BASE_H + 10;
      s.x = random(BASE_W);
    }

    let alphaVal = map(sin(globalTime * 3 + s.alphaOffset), -1, 1, 60, 180);
    fill(70, 180, 130, alphaVal);
    circle(s.x, s.y, s.size);
  }
}

function drawHeaderAndProgress() {
  push();
  fill(30, 45, 40);
  textFont(FONT_TITLE);
  textSize(12);
  text("EQUILIBRADOR DE HOMEOSTASIS", 40, 42);

  fill(95, 115, 110);
  textFont(FONT_BODY);
  textSize(11);
  text("Mantené equilibrada la bio-savia de las tres cápsulas simultáneamente.", 40, 62);

  stroke(255);
  strokeWeight(2);
  fill(225, 232, 235);
  rect(570, 32, 290, 24, 12);

  fill(55, 200, 130);
  noStroke();
  let progressRatio = synthesisProgress / synthesisGoal;
  rect(570, 32, progressRatio * 290, 24, 12);

  fill(20, 40, 30);
  textFont(FONT_BODY);
  textSize(10);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(`SÍNTESIS BIO-PIEZA: ${Math.floor(progressRatio * 100)}%`, 715, 44);
  pop();
}

function drawCentralDistributor(x, y) {
  push();
  translate(x, y);

  noStroke();
  fill(200, 210, 215, 70);
  rectMode(CENTER);
  rect(0, 8, 220, 105, 30);

  fill(255, 255, 255, 210);
  stroke(255);
  strokeWeight(2.5);
  rect(0, 0, 210, 100, 28);

  noFill();
  stroke(180, 225, 240, 130);
  strokeWeight(1.5);
  rect(0, 0, 185, 80, 20);

  for (let px of [-55, 0, 55]) {
    fill(245, 248, 250);
    stroke(220, 230, 235);
    strokeWeight(1.5);
    rect(px, 0, 26, 32, 6);

    fill(130, 150, 145);
    noStroke();
    rect(px - 5, -3, 3, 10, 2);
    rect(px + 5, -3, 3, 10, 2);
    circle(px, 7, 3.5);
  }

  fill(95, 120, 115);
  textFont(FONT_TITLE);
  textSize(8);
  textAlign(CENTER);
  text("BIO-CORE DISTRIBUTOR", 0, -28);
  pop();
}

function drawFluidCable(x1, y1, x2, y2, active, energy) {
  push();
  noFill();

  stroke(190, 202, 208, 60);
  strokeWeight(10);
  bezier(x1, y1 + 4, x1, (y1 + y2) / 2 + 4, x2, (y1 + y2) / 2 + 4, x2, y2 + 4);

  stroke(255, 255, 255, 245);
  strokeWeight(6);
  bezier(x1, y1, x1, (y1 + y2) / 2, x2, (y1 + y2) / 2, x2, y2);

  if (energy > 85) {
    stroke(255, 105, 90);
  } else if (energy < 35) {
    stroke(175, 190, 195);
  } else {
    stroke(60, 215, 140);
  }

  strokeWeight(active ? 3.5 : 1.8);
  bezier(x1, y1, x1, (y1 + y2) / 2, x2, (y1 + y2) / 2, x2, y2);

  if (active) {
    let t = (globalTime * 3) % 1;
    let px = bezierPoint(x1, x1, x2, x2, t);
    let py = bezierPoint(y1, (y1 + y2) / 2, (y1 + y2) / 2, y2, t);
    fill(255);
    noStroke();
    circle(px, py, 6);
  }
  pop();
}

function drawBotanicalHub(hub) {
  push();
  translate(hub.x, hub.y);

  let isOptimal = (hub.energy >= 35 && hub.energy <= 85);

  noStroke();
  fill(195, 205, 210, 60);
  ellipse(0, 8, 134, 134);

  fill(255, 255, 255, 195);
  stroke(255);
  strokeWeight(2.5);
  ellipse(0, 0, 126, 126);

  if (hub.img) {
    if (hub.energy < 35) {
      tint(180, 190, 185, 160);
    } else if (hub.energy > 85) {
      tint(255, 175, 165, 240);
    } else {
      noTint();
    }
    image(hub.img, 0, 0, 95, 95);
    noTint();
  }

  fill(255, 255, 255, 60);
  stroke(255, 255, 255, 140);
  strokeWeight(1);
  arc(0, 0, 116, 116, -PI * 0.8, -PI * 0.2);

  noFill();
  stroke(222, 230, 235);
  strokeWeight(7);
  ellipse(0, 0, 144, 144);

  stroke(165, 235, 195, 180);
  strokeWeight(7);
  let optStart = map(35, 0, 100, -HALF_PI, TWO_PI - HALF_PI);
  let optEnd = map(85, 0, 100, -HALF_PI, TWO_PI - HALF_PI);
  arc(0, 0, 144, 144, optStart, optEnd);

  let col;
  if (isOptimal) {
    col = color(45, 200, 120);
  } else if (hub.energy > 85) {
    col = color(255, 95, 80);
  } else {
    col = color(160, 175, 180);
  }

  stroke(col);
  strokeWeight(5);
  let currentArc = map(hub.energy, 0, 100, -HALF_PI, TWO_PI - HALF_PI);
  arc(0, 0, 144, 144, -HALF_PI, currentArc);

  fill(40, 50, 48);
  noStroke();
  textAlign(CENTER);
  textFont(FONT_TITLE);
  textSize(9);
  text(hub.name, 0, 95);

  textFont(FONT_BODY);
  textSize(11);
  textStyle(BOLD);
  fill(col);
  let statusText = isOptimal ? `${Math.floor(hub.energy)}% [ESTABLE]` : (hub.energy > 85 ? `${Math.floor(hub.energy)}% [SOBRECARGA]` : `${Math.floor(hub.energy)}% [BAJO]`);
  text(statusText, 0, 111);
  pop();
}

function getGameMousePos() {
  return {
    x: (mouseX - transX) / uiScale,
    y: (mouseY - transY) / uiScale
  };
}

function mousePressed() {
  let btnW = 175;
  let btnH = 34;
  let btnX = width - btnW - 25;
  let btnY = 25;
  if (mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH) {
    let fs = fullscreen();
    fullscreen(!fs);
    return;
  }

  updateHubCharging(true);
}

function mouseReleased() {
  for (let hub of hubs) hub.charging = false;
}

function mouseDragged() {
  updateHubCharging(true);
}

function updateHubCharging(isDown) {
  let gPos = getGameMousePos();
  for (let hub of hubs) {
    if (dist(gPos.x, gPos.y, hub.x, hub.y) < 70) {
      hub.charging = isDown;
    } else {
      hub.charging = false;
    }
  }
}

function drawFrostedGlassModal() {
  push();

  let mw = 600;
  let mh = 520;
  let mx = BASE_W / 2 - mw / 2;
  let my = BASE_H / 2 - mh / 2;

  fill(235, 240, 242, 140);
  noStroke();
  rect(-100, -100, BASE_W + 200, BASE_H + 200);

  for (let s = 18; s > 0; s -= 4) {
    fill(130, 150, 160, 12);
    rect(mx - s / 2, my + s, mw + s, mh + s, 34);
  }

  fill(255, 255, 255, 215);
  stroke(255, 255, 255, 245);
  strokeWeight(2.5);
  rect(mx, my, mw, mh, 30);

  noStroke();
  fill(240, 250, 245, 60);
  beginShape();
  vertex(mx, my + 30);
  vertex(mx + 200, my);
  vertex(mx + mw, my + 160);
  vertex(mx + mw, my + mh);
  vertex(mx, my + mh);
  endShape(CLOSE);

  noFill();
  stroke(180, 235, 220, 120);
  strokeWeight(1);
  rect(mx + 4, my + 4, mw - 8, mh - 8, 26);

  fill(25, 45, 38);
  noStroke();
  textAlign(CENTER);
  textFont(FONT_TITLE);
  textSize(15);
  text("HOMEOSTASIS ALCANZADA", BASE_W / 2, my + 44);

  textFont(FONT_BODY);
  textSize(11);
  fill(90, 115, 110);
  text("La bio-energía ha sintetizado materia en el plano físico.", BASE_W / 2, my + 66);

  let boxW = 500;
  let boxH = 340;
  let boxX = BASE_W / 2 - boxW / 2;
  let boxY = my + 85;

  fill(246, 251, 248, 175);
  stroke(140, 225, 180);
  strokeWeight(1.8);
  rect(boxX, boxY, boxW, boxH, 20);

  fill(30, 140, 85);
  noStroke();
  textFont(FONT_TITLE);
  textSize(10);
  text("", BASE_W / 2, boxY + 28);

  textFont(FONT_BODY);
  textStyle(BOLD);
  fill(20, 45, 35);
  textSize(15);
  text("-34.9214° S, -57.9545° W", BASE_W / 2, boxY + 52);

  stroke(190, 230, 210, 120);
  strokeWeight(1);
  line(boxX + 40, boxY + 66, boxX + boxW - 40, boxY + 66);

  // La foto ya viene reducida a 400px con su proporción 16:9 exacta desde setup()
  let imgCenterY = boxY + 195;
  if (imgRecompensa) {
    image(imgRecompensa, BASE_W / 2, imgCenterY);
  }

  fill(30, 55, 45);
  noStroke();
  textFont(FONT_TITLE);
  textSize(16);
  text("Encuentra la hoja", BASE_W / 2, my + 476);

  pop();
}
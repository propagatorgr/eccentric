let b1, b2;
let r = 20;
let collided = false;
let dragging = false;
let running = false;
let showAnalysis = true;

let guidedMode = false;
let phase = 0;
let timer = 0;

let infoPanel;
let speedFactor = 1;

// ======================
function setup() {
  let canvas = createCanvas(window.innerWidth, window.innerHeight - 140);
  canvas.parent(document.body);

  resetSimulation();
  createUI();
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight - 140);
}

// ======================
function createUI() {

  let panel = select("#ui-panel");

  let resetBtn = createButton("Reset").parent(panel);
  let playBtn = createButton("Start/Stop").parent(panel);
  let guidedBtn = createButton("Guided").parent(panel);
  let analysisBtn = createButton("Ανάλυση").parent(panel);
  let centralBtn = createButton("Κεντρική").parent(panel);
  let darkBtn = createButton("Dark Mode").parent(panel);   // ✅ NEW
  let infoBtn = createButton("Info").parent(panel);

  let sliderBox = createDiv().addClass("slider-container").parent(panel);

  createSpan("Ταχύτητα").parent(sliderBox);
  let slider = createSlider(0.2, 3, 1, 0.1).parent(sliderBox);

  infoPanel = createDiv(`
  <b>Πληροφορίες</b><br>
  • Ίσες μάζες<br>
  • Ελαστική κρούση<br>
  • Σύρε τη δεξιά μπίλια για offset<br>
  • Guided: παρουσίαση βήμα-βήμα<br>
  • Έκκεντρη → 90°<br>
  • Κεντρική → 0°
  `).parent(panel);

  infoPanel.addClass("info-box");

  // ======================
  // ACTIONS
  // ======================

  resetBtn.mousePressed(resetSimulation);

  playBtn.mousePressed(() => {
    running = !running;
  });

  guidedBtn.mousePressed(startGuided);

  analysisBtn.mousePressed(() => {
    showAnalysis = !showAnalysis;
  });

  centralBtn.mousePressed(() => {
    b2.pos.y = b1.pos.y;
  });

  darkBtn.mousePressed(() => {
    document.body.classList.toggle("dark");   // ✅ DARK MODE
  });

  infoBtn.mousePressed(() => {
    if (infoPanel.style("display") === "none") {
      infoPanel.style("display", "block");
    } else {
      infoPanel.style("display", "none");
    }
  });

  slider.input(() => {
    speedFactor = slider.value();
  });
}

// ======================
function resetSimulation() {
  b1 = { pos: createVector(100, height/2), vel: createVector(3,0) };
  b2 = { pos: createVector(width*0.6, height/2+40), vel: createVector(0,0) };

  collided = false;
  guidedMode = false;
  running = false;
}

// ======================
function startGuided() {
  b1.pos = createVector(width*0.4, height/2);
  b2.pos = createVector(width*0.6, height/2+30);

  collided = false;
  guidedMode = true;
  phase = 1;
  timer = 0;
  running = true;
}

// ======================
function draw() {
  background(240);

  if (document.body.classList.contains("dark")) {
    background(30);  // ✅ dark canvas
  }

  if (running && !dragging) {

    if (guidedMode) {

      timer++;

      if (phase === 1) {
        b1.pos.add(p5.Vector.mult(b1.vel, speedFactor));

        if (dist(b1.pos.x,b1.pos.y,b2.pos.x,b2.pos.y) < 2*r+5) {
          phase = 2;
          running = false;
        }
      }

      if (phase === 2 && running) {
        phase = 3;
        timer = 0;
      }

      if (phase === 3 && timer > 30) {
        collide();
        phase = 4;
      }

      if (phase === 4) {
        b1.pos.add(p5.Vector.mult(b1.vel, speedFactor));
        b2.pos.add(p5.Vector.mult(b2.vel, speedFactor));
      }

    } else {

      b1.pos.add(p5.Vector.mult(b1.vel, speedFactor));

      if (collided) {
        b2.pos.add(p5.Vector.mult(b2.vel, speedFactor));
      }

      let d = dist(b1.pos.x,b1.pos.y,b2.pos.x,b2.pos.y);

      if (d <= 2*r && !collided) {
        collide();
      }
    }
  }

  drawBall(b1);
  drawBall(b2);

  drawArrow(b1.pos, p5.Vector.mult(b1.vel,25), color(0,0,255));
  drawArrow(b2.pos, p5.Vector.mult(b2.vel,25), color(255,0,0));
  // ======================
// HOVER EFFECT
// ======================
if (!guidedMode && !collided) {
  let d = dist(mouseX, mouseY, b2.pos.x, b2.pos.y);

  if (d < r * 1.5) {
    stroke(255, 0, 0);
    strokeWeight(2);
    noFill();

    circle(b2.pos.x, b2.pos.y, r * 2.4);
  }
}

  if (showAnalysis && !collided) {
    drawDecomposition();
  }

  drawAngle();
}

// ======================
function collide() {
  let n = p5.Vector.sub(b2.pos,b1.pos).normalize();
  let v = b1.vel.copy();

  let vp = p5.Vector.mult(n, v.dot(n));
  let vt = p5.Vector.sub(v, vp);

  b1.vel = vt;
  b2.vel = vp;

  collided = true;
}

// ======================
function drawBall(b) {
  fill(200);
  if (document.body.classList.contains("dark")) fill(180);
  circle(b.pos.x,b.pos.y,2*r);
}

// ======================
function drawArrow(base,vec,col) {
  push();
  stroke(col);
  fill(col);
  line(base.x,base.y,base.x+vec.x,base.y+vec.y);
  translate(base.x+vec.x,base.y+vec.y);
  rotate(vec.heading());
  triangle(0,0,-7,3,-7,-3);
  pop();
}

// ======================
function drawDecomposition() {
  let n = p5.Vector.sub(b2.pos,b1.pos).normalize();
  let v = b1.vel.copy();

  let vp = p5.Vector.mult(n,v.dot(n));
  let vt = p5.Vector.sub(v,vp);

  drawArrow(b1.pos,p5.Vector.mult(vp,25),color(0,150,0));
  drawArrow(b1.pos,p5.Vector.mult(vt,25),color(255,140,0));
}

// ======================
function drawAngle(){

  let m1=b1.vel.mag();
  let m2=b2.vel.mag();

  fill(document.body.classList.contains("dark") ? 255 : 0);

  if (m1<0.01 || m2<0.01){
    text("θ = 0°",10,20);
    return;
  }

  let c = constrain(b1.vel.dot(b2.vel)/(m1*m2),-1,1);
  let a = degrees(acos(c));

  text("θ = "+nf(a,1,1)+"°",10,20);
}
function mousePressed() {

  // μόνο αν δεν είμαστε σε guided και δεν έχει γίνει κρούση
  if (guidedMode || collided) return;

  let d = dist(mouseX, mouseY, b2.pos.x, b2.pos.y);

  // πιο μεγάλο hitbox για touchscreen
  if (d < r * 1.8) {
    dragging = true;
  }
}

function mouseDragged() {
  if (dragging) {
    b2.pos.set(mouseX, mouseY);
  }
}

function mouseReleased() {
  dragging = false;
}


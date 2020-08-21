import processing.sound.*;

PShader shader;
SoundFile file;
Amplitude amp;

void setup() {
  size(1200, 1200, P2D);
  noStroke();

  shader = loadShader("max.frag");
  
  file = new SoundFile(this, "Space Ghost Coast To Coast.mp3");
  amp = new Amplitude(this);

  file.play();
  amp.input(file);
}

void draw() {
  shader.set("u_resolution", float(width), float(height));
  shader.set("u_mouse", float(mouseX), float(mouseY));
  shader.set("u_time", millis() / 1000.0);
  shader.set("u_amp", amp.analyze());
  shader(shader);
  rect(0,0,width,height);
  
  //saveFrame("output/shader####.png");
}

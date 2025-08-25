import logger from '../../utils/logger';


const CONFETTI_COUNT = 100;
const DRAG = 0.1;
const GRAVITY = 1;
const SPEED = 9;
const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'pink', 'purple', 'turquoise']
  .map((col) => ({ front: col, back: `dark${col}` }));
const confetti = [];
const log = logger('Celebrate');

export default class Celebrate {
  static randomRange(min, max) { return Math.random() * (max - min) + min; }

  constructor({ canvas }) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.allowRender = false;

    this.render = this.render.bind(this);
  }

  init() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    for (let i = 0; i < CONFETTI_COUNT; i++) {
      confetti.push({
        color: colors[Math.floor(Celebrate.randomRange(0, colors.length))],
        dimensions: {
          x: Celebrate.randomRange(10, 20),
          y: Celebrate.randomRange(10, 30),
        },
        position: {
          x: Celebrate.randomRange(0, this.canvas.width),
          y: this.canvas.height - 1,
        },
        rotation: Celebrate.randomRange(0, 2 * Math.PI),
        scale: { x: 1, y: 1 },
        velocity: {
          x: Celebrate.randomRange(-25, 25),
          y: Celebrate.randomRange(0, -50),
        },
      });
    }

    this.allowRender = true;
  }

  render() {
    if (!this.allowRender) return;
    else if (!confetti.length) {
      this.stop();
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    confetti.forEach((confetto, index) => {
      let width = (confetto.dimensions.x * confetto.scale.x);
      let height = (confetto.dimensions.y * confetto.scale.y);
      
      // Move canvas to position and rotate
      this.ctx.translate(confetto.position.x, confetto.position.y);
      this.ctx.rotate(confetto.rotation);
      
      // Apply forces to velocity
      confetto.velocity.x -= confetto.velocity.x * DRAG;
      confetto.velocity.y = Math.min(confetto.velocity.y + GRAVITY, SPEED);
      confetto.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();
      
      // Set position
      confetto.position.x += confetto.velocity.x;
      confetto.position.y += confetto.velocity.y;
      
      // Delete confetti when out of frame
      if (confetto.position.y >= this.canvas.height) confetti.splice(index, 1);
      else {
        // Loop confetto x position
        if (confetto.position.x > this.canvas.width) confetto.position.x = 0;
        if (confetto.position.x < 0) confetto.position.x = this.canvas.width;
    
        // Spin confetto by scaling y
        confetto.scale.y = Math.cos(confetto.position.y * 0.1);
        this.ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;
         
        // Draw confetto
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        
        // Reset transform matrix
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    });

    window.requestAnimationFrame(this.render);
  }

  stop() {
    this.allowRender = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    log.info('stop');
  }
}

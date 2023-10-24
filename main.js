import './style.css';

class Player {
  constructor(game) {
    this.game = game;
    this.width = 100;
    this.height = 100;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.speed = 10;
  }

  draw(context) {
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    // horizontal movement
    if (this.game.keys.indexOf('ArrowLeft') > -1) this.x -= this.speed;
    if (this.game.keys.indexOf('ArrowRight') > -1) this.x += this.speed;

    // horizontal boundaries
    if (this.x < -this.width * 0.5) this.x = -this.width * 0.5;
    if (this.x > this.game.width - this.width * 0.5)
      this.x = this.game.width - this.width * 0.5;
  }

  shoot() {
    const projectile = this.game.getProjectile();

    if (projectile) projectile.start(this.x + this.width * 0.5, this.y);
  }
}

class Projectile {
  constructor() {
    this.width = 4;
    this.height = 20;
    this.x = 0;
    this.y = 0;
    this.speed = 20;
    this.free = true;
  }
  draw(context) {
    if (!this.free) {
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  update() {
    if (!this.free) {
      this.y -= this.speed;
      if (this.y < 0 - this.height) this.reset();
    }
  }

  start(x, y) {
    this.x = x - this.width * 0.5;
    this.y = y;
    this.free = false;
  }

  reset() {
    this.free = true;
  }
}

class Enemy {
  constructor(game) {
    this.game = game;
    this.width;
    this.height;
    this.x;
    this.y;
  }

  draw(context) {
    context.strokeRect(this.x, this.y, this.width, this.height);
  }

  update() {}
}

class Wave {
  constructor(game) {
    this.game = game;
    this.width = this.game.columns * this.game.enemySize;
    this.height = this.game.rows * this.game.enemySize;
    this.x = 0;
    this.y = 0;

    this.speedX = 1;
    this.speedY = 0;
  }

  render(context) {
    this.speedY = 0;
    context.strokeRect(this.x, this.y, this.width, this.height);
    this.x += this.speedX;

    if (this.x < 0 || this.x > this.game.width - this.width) {
      this.speedX *= -1;
      this.speedY = this.game.enemySize;
    }

    this.x += this.speedX;
    this.y += this.speedY;
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.keys = [];
    this.player = new Player(this);

    this.projectilesPool = [];
    this.numberOfProjectiles = 10;
    this.createProjectiles();

    this.columns = 3;
    this.rows = 3;
    this.enemySize = 60;

    this.waves = [];
    this.waves.push(new Wave(this));

    // event listeners
    window.addEventListener('keydown', (e) => {
      // this binding to lexical scope (arrow function)
      const index = this.keys.indexOf(e.key);

      if (index === -1) this.keys.push(e.key);
      if (e.key === '1') this.player.shoot();
    });

    window.addEventListener('keyup', (e) => {
      // this binding to lexical scope (arrow function)
      const index = this.keys.indexOf(e.key);

      if (index > -1) this.keys.splice(index, 1);
    });
  }
  render(context) {
    this.player.draw(context);
    this.player.update();
    this.projectilesPool.forEach((p) => {
      p.update();
      p.draw(context);
    });
    this.waves.forEach((w) => {
      w.render(context);
    });
  }

  createProjectiles() {
    for (let i = 0; i < this.numberOfProjectiles; i++) {
      this.projectilesPool.push(new Projectile());
    }
  }

  getProjectile() {
    for (let i = 0; i < this.projectilesPool.length; i++) {
      if (this.projectilesPool[i].free) return this.projectilesPool[i];
    }
  }
}

window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');

  canvas.width = 600;
  canvas.height = 700;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 5;

  const game = new Game(canvas);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx);
    window.requestAnimationFrame(animate);
  }

  animate();
});

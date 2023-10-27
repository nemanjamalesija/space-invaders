import './style.css';
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

    this.columns = 2;
    this.rows = 2;
    this.enemySize = 60;

    this.waves = [];
    this.waves.push(new Wave(this));

    this.score = 0;
    this.gameOver = false;
    this.waveCount = 1;

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
    this.drawStatusText(context);
    this.player.draw(context);
    this.player.update();
    this.projectilesPool.forEach((p) => {
      p.update();
      p.draw(context);
    });
    this.waves.forEach((wave) => {
      wave.render(context);

      if (
        wave.enemies.length < 1 &&
        !wave.nextWaveTrigger &&
        !this.gameOver
      ) {
        this.newWave();
        this.waveCount++;
        wave.nextWaveTrigger = true;
      }
    });
  }

  createProjectiles() {
    for (let i = 0; i < this.numberOfProjectiles; i++) {
      this.projectilesPool.push(new Projectile());
    }
  }

  getProjectile() {
    for (let i = 0; i < this.projectilesPool.length; i++) {
      if (this.projectilesPool[i].free)
        return this.projectilesPool[i];
    }
  }
  // colision detection berween 2 rectangles
  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
  drawStatusText(context) {
    context.save();
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = 'black';
    context.fillText(`Wave: ${this.waveCount}`, 20, 80);
    context.fillText(`Score: ${this.score}`, 20, 40);
    if (this.gameOver) {
      context.textAlign = 'center';
      context.font = '100px Impact';
      context.fillText(
        'GAME OVER',
        this.width * 0.5,
        this.height * 0.5
      );
    }
    context.restore();
  }

  newWave() {
    this.columns++;
    this.rows++;
    this.waves.push(new Wave(this));
  }
}

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
    context.fillRect(
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  update() {
    // horizontal movement
    if (this.game.keys.indexOf('ArrowLeft') > -1)
      this.x -= this.speed;
    if (this.game.keys.indexOf('ArrowRight') > -1)
      this.x += this.speed;

    // horizontal boundaries
    if (this.x < -this.width * 0.5)
      this.x = -this.width * 0.5;
    if (this.x > this.game.width - this.width * 0.5)
      this.x = this.game.width - this.width * 0.5;
  }

  shoot() {
    const projectile = this.game.getProjectile();

    if (projectile)
      projectile.start(this.x + this.width * 0.5, this.y);
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
      context.fillRect(
        this.x,
        this.y,
        this.width,
        this.height
      );
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
  constructor(game, positionX, positionY) {
    this.game = game;
    this.width = this.game.enemySize;
    this.height = this.game.enemySize;
    this.x;
    this.y;
    // position of the enemy within the wave
    this.positionX = positionX;
    this.positionY = positionY;
    this.markedForDeletion = false;
  }

  draw(context) {
    context.strokeRect(
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  update(x, y) {
    this.x = x + this.positionX;
    this.y = y + this.positionY;
    // check collision enemis - projectiles
    this.game.projectilesPool.forEach((projectile) => {
      if (
        !projectile.free &&
        this.game.checkCollision(this, projectile)
      ) {
        this.markedForDeletion = true;
        projectile.reset();
        this.game.score++;
      }
    });

    // lose condition
    if (this.y + this.height > this.game.height) {
      this.game.gameOver = true;
      this.markedForDeletion = true;
    }
  }
}

class Wave {
  constructor(game) {
    this.game = game;
    this.width = this.game.columns * this.game.enemySize;
    this.height = this.game.rows * this.game.enemySize;
    this.x = 0;
    this.y = -this.height;

    this.speedX = 1;
    this.speedY = 0;
    this.nextWaveTrigger = false;
    this.enemies = [];
    this.create();
  }

  render(context) {
    if (this.y < 0) this.y += 5; // float in per animation frame
    this.speedY = 0;

    if (
      this.x < 0 ||
      this.x > this.game.width - this.width
    ) {
      this.speedX *= -1;
      this.speedY = this.game.enemySize;
    }

    this.x += this.speedX;
    this.y += this.speedY;

    this.enemies.forEach((wave) => {
      wave.update(this.x, this.y);
      wave.draw(context);
    });
    this.enemies = this.enemies.filter(
      (enemy) => !enemy.markedForDeletion
    );
  }

  create() {
    for (let y = 0; y < this.game.rows; y++) {
      for (let x = 0; x < this.game.columns; x++) {
        let enemyX = x * this.game.enemySize;
        let enemyY = y * this.game.enemySize;
        this.enemies.push(
          new Enemy(this.game, enemyX, enemyY)
        );
      }
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
  ctx.font = '30px Impact';

  const game = new Game(canvas);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx);
    window.requestAnimationFrame(animate);
  }

  animate();
});

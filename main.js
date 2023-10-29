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
    this.fired = false;

    this.columns = 2;
    this.rows = 2;
    this.enemySize = 80;

    this.waves = [];
    this.waves.push(new Wave(this));

    this.score = 0;
    this.gameOver = false;
    this.waveCount = 1;

    this.spriteUpdate = false;
    this.spriteTimer = 0;
    this.spriteInterval = 500;

    // event listeners
    window.addEventListener('keydown', (e) => {
      // this binding to lexical scope (arrow function)
      const index = this.keys.indexOf(e.key);

      if (index === -1) this.keys.push(e.key);
      if (e.key === '1' && !this.fired) this.player.shoot();
      this.fired = true;
      if (e.key === 'r' && this.gameOver) this.restart();
    });

    window.addEventListener('keyup', (e) => {
      // this binding to lexical scope (arrow function)
      const index = this.keys.indexOf(e.key);
      if (index > -1) this.keys.splice(index, 1);
      this.fired = false;
    });
  }
  render(context, deltaTime) {
    // sprite timing

    // if (this.spriteTimer > this.spriteInterval) {
    //   this.spriteUpdate = true;
    //   this.spriteTimer = 0;
    // } else {
    //   this.spriteUpdate = false;
    //   this.spriteTimer += deltaTime;
    // }

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
        this.player.lives++;
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

    // draw status text
    for (let i = 0; i < this.player.lives; i++) {
      context.fillRect(20 + 10 * i, 100, 5, 20);
    }
    if (this.gameOver) {
      context.textAlign = 'center';
      context.font = '100px Impact';
      context.fillText(
        'GAME OVER',
        this.width * 0.5,
        this.height * 0.5
      );
      context.font = '20px Impact';
      context.fillText(
        'Press R to restart',
        this.width * 0.5,
        this.height * 0.5 + 30
      );
    }
    context.restore();
  }

  newWave() {
    if (
      Math.random() < 0.5 &&
      this.columns * this.enemySize < this.width * 0.8
    ) {
      this.columns++;
    } else if (
      this.rows * this.enemySize <
      this.height * 0.6
    ) {
      this.rows++;
    }

    this.waves.push(new Wave(this));
  }

  restart() {
    this.player.restart();
    this.columns = 2;
    this.rows = 2;
    this.waves = [];
    this.waves.push(new Wave(this));
    this.score = 0;
    this.gameOver = false;
    this.waveCount = 1;
    this.gameOver = false;
  }
}

class Player {
  constructor(game) {
    this.game = game;
    this.width = 140;
    this.height = 120;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.speed = 5;
    this.lives = 3;
    this.image = document.getElementById('player');
    this.frameX = 0;
  }

  draw(context) {
    // handle sprite frames
    if (this.game.keys.indexOf('1') > -1) {
      this.frameX = 1;
    } else {
      this.frameX = 0;
    }
    context.drawImage(
      this.image,
      this.frameX * this.width,
      0,
      this.width,
      this.height,
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

  restart() {
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.lives = 3;
  }
}

class Projectile {
  constructor() {
    this.width = 3;
    this.height = 20;
    this.x = 0;
    this.y = 0;
    this.speed = 20;
    this.free = true;
  }

  draw(context) {
    if (!this.free) {
      context.save();
      context.fillStyle = 'gold';
      context.fillRect(
        this.x,
        this.y,
        this.width,
        this.height
      );
      context.restore();
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
    // context.strokeRect(
    //   this.x,
    //   this.y,
    //   this.width,
    //   this.height
    // );
    context.drawImage(
      this.image,
      this.frameX * this.width, // move horizontally along the sprite sheet
      this.frameY * this.height, // move vertically along the sprite sheet
      this.width,
      this.height,
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
        this.hit(1);
        projectile.reset();
      }
    });

    if (this.lives < 1) {
      this.frameX++;
      if (this.frameX > this.maxFrame) {
        this.markedForDeletion = true;
        if (!this.game.gameOver)
          this.game.score += this.maxLives;
      }
    }

    //check colision enemies - player
    if (this.game.checkCollision(this, this.game.player)) {
      this.markedForDeletion = true;
      if (!this.gameOver && this.game.score > 0)
        this.game.score--;
      this.game.player.lives--;
      if (this.game.player.lives < 1)
        this.game.gameOver = true;
    }

    // lose condition
    if (this.y + this.height > this.game.height) {
      this.game.gameOver = true;
      this.markedForDeletion = true;
    }
  }

  hit(damage) {
    this.lives -= damage;
  }
}

class Beetlemorph extends Enemy {
  constructor(game, positionX, positionY) {
    super(game, positionX, positionY);
    this.image = document.getElementById('beetlemorph');
    this.frameX = 0;
    this.maxFrame = 2;
    this.frameY = Math.floor(Math.random() * 4);
    this.lives = 1;
    this.maxLives = this.lives;
  }
}

class Wave {
  constructor(game) {
    this.game = game;
    this.width = this.game.columns * this.game.enemySize;
    this.height = this.game.rows * this.game.enemySize;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = -this.height;

    this.speedX = Math.random() < 0.5 ? -1 : 1;
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
          new Beetlemorph(this.game, enemyX, enemyY)
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

  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx, deltaTime);
    window.requestAnimationFrame(animate);
  }

  animate(0);
});

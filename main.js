import './style.css';

class Player {}

class Projectile {}

class Enemy {}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
  render() {
    console.log(this.height, this.width);
  }
}

window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 600;
  canvas.height = 700;

  const game = new Game(canvas);
  console.log(game);
});

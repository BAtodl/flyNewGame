var game = new Phaser.Game(375, 667, Phaser.AUTO, "game", {preload: preload, create: create, update: update, render: render});

var myPlane, bullets, enemy, enemyBullets, bulletsGroup;
var myPlaneLife = 3;
var myEnemy = {
  selfPoolNum: 30,
  timeInterval: 3,
  velocityY: 150,
  life: 3
}

function EnemyFactory(params) {
  this.init = function() {
    this.enemys = game.add.group();
    this.enemys.enableBody = true;
    this.enemys.createMultiple(params.selfPoolNum, 'enemy');
    this.enemys.setAll('outOfBoundsKill', true);
    this.enemys.setAll('checkWorldBounds', true);
    this.enemys.scale.set(0.5, 0.5);
    this.maxWidth = game.width - game.cache.getImage('enemy').width;
    game.time.events.loop(Phaser.Timer.SECOND * params.timeInterval, this.generateEnemys, this);

    bulletsGroup = game.add.group();
  }

  this.generateEnemys = function() {
    var enemy = this.enemys.getFirstExists(false);
    if (enemy) {
      enemy.reset(game.rnd.integerInRange(0, this.maxWidth), -game.cache.getImage('enemy').height);
      enemy.body.velocity.y = params.velocityY;
      enemy.body.setCircle(25);
      enemy.life = params.life;

      if (!enemy.selectBullet) {
        this.enemyBullets = game.add.weapon(50, 'enemyBullet', null, bulletsGroup);
        this.enemyBullets.enableBody = true;
        this.enemyBullets.scale = (0.1, 0.1);
        this.enemyBullets.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.enemyBullets.bulletSpeed = -300;
        this.enemyBullets.fireRate = 900;
        this.enemyBullets.trackSprite(enemy, 20, 50);
        this.enemyBullets.bulletAngleOffset = 270;
        this.enemyBullets.autofire = true;
        enemy.selectBullet = this.enemyBullets;
      } else {
        enemy.selectBullet.autofire = true;
      }
    }
  }
  this.directAttack = function(enemyObj, bulletObj) {
    enemyObj.life --;
    if (enemyObj.life <= 0) {
      enemyObj.selectBullet.autofire = false;
      enemyObj.kill();
    }
    bulletObj.kill();
  }
}
function preload() {
  game.load.image('background', './planeGame/blue.png');
  game.load.spritesheet('myPlane', './planeGame/playerShip_orange.png');
  game.load.spritesheet('bullet', './planeGame/laserBlue.png');
  game.load.spritesheet('enemy', './planeGame/ufoGreen.png');
  game.load.spritesheet('enemyBullet', '/planeGame/laserRed.png');
}

function create() {
  var backgroundImage = game.add.tileSprite(0, 0, game.width, game.height, 'background');
  backgroundImage.autoScroll(0, 400);
  myPlane = game.add.sprite(180, 500, 'myPlane');
  myPlane.scale.set(0.5, 0.5);
  myPlane.inputEnabled = true;
  myPlane.input.enableDrag(false);
  myPlane.anchor.set(0.5);
  game.physics.arcade.enable(myPlane);
  myPlane.body.collideWorldBounds = true;

  bullets = game.add.weapon(30, 'bullet', null);
  bullets.enableBody = true;
  bullets.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
  bullets.bulletSpeed = 500;
  bullets.fireRate = 150;
  bullets.trackSprite(myPlane, 0, -50);
  bullets.bulletAngleOffset = 90;
  bullets.autofire = true;

  enemy = new EnemyFactory(myEnemy);
  enemy.init();
}
function myPlaneAndEnemyBullets(myPlaneObj, bulletsObj) {
  myPlaneLife -- ;
  console.log(myPlaneLife);
  bulletsObj.kill(); 
}
function update() {
  game.physics.arcade.overlap(enemy.enemys, bullets.bullets, enemy.directAttack, null, this);
  game.physics.arcade.overlap(myPlane, bulletsGroup.children, myPlaneAndEnemyBullets, null, this);
}

function render() {

}
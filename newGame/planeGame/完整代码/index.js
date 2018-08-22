var game = new Phaser.Game(375, 667, Phaser.AUTO, "game");

var myPlane, bullets, enemy, enemyBullets, bulletsGroup;
var myPlaneLife = 3;
var score = 0;
var myEnemy = {
  selfPoolNum: 30,
  timeInterval: 3,
  velocityY: 150,
  life: 3
}
game.States = {};
game.States.preload = function () {
  this.preload = function () {
    game.load.image('background', './planeGame/blue.png');
    game.load.spritesheet('myPlane', './planeGame/playerShip_orange.png');
    game.load.spritesheet('bullet', './planeGame/laserBlue.png');
    game.load.spritesheet('enemy', './planeGame/ufoGreen.png');
    game.load.spritesheet('enemyBullet', '/planeGame/laserRed.png');
    game.load.spritesheet('buttonBlue', '/planeGame/buttonBlue.png');
    game.load.spritesheet('buttonYellow', '/planeGame/buttonYellow.png');
    game.load.image('numeral0', './planeGame/numeral0.png');
    game.load.image('numeral1', './planeGame/numeral1.png');
    game.load.image('numeral2', './planeGame/numeral2.png');
    game.load.image('numeral3', './planeGame/numeral3.png');
    game.load.image('numeral4', './planeGame/numeral4.png');
    game.load.image('numeral5', './planeGame/numeral5.png');
    game.load.image('numeral6', './planeGame/numeral6.png');
    game.load.image('numeral7', './planeGame/numeral7.png');
    game.load.image('numeral8', './planeGame/numeral8.png');
    game.load.image('numeral9', './planeGame/numeral9.png');
  }
  this.create = function () {
    game.state.start('start');
  }
}
game.States.start = function () {
  this.create = function () {
    this.buttonBlue = game.add.button(70, 300, 'buttonBlue', this.onStart, this, 1, 1, 0);
  }
  this.onStart = function () {
    game.state.start('main');
  }
}
game.States.main = function () {
  this.create = function () {
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

    enemy = new this.EnemyFactory(myEnemy);
    enemy.init();

    this.number0 = game.add.sprite(0, 0, 'numeral0');
    this.number1 = game.add.sprite(20, 0, 'numeral0');

  }
  this.updateScore = function () {
    if (score < 100) {
      if (score < 10) {
        this.number1.kill();
        this.number1 = game.add.sprite(20, 0, 'numeral' + score.toString())
      } else {
        this.number0.kill();
        this.number0 = game.add.sprite(0, 0, 'numeral' + score.toString().split("")[0]);
        this.number1.kill();
        this.number1 = game.add.sprite(20, 0, 'numeral' + score.toString().split("")[1]);
      }
    } else {
      
    }
  }
  this.update = function () {
    game.physics.arcade.overlap(enemy.enemys, bullets.bullets, enemy.directAttack, null, this);
    game.physics.arcade.overlap(myPlane, bulletsGroup.children, myPlaneAndEnemyBullets, null, this);
  }
  this.EnemyFactory = function (params) {
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
        score ++;
        this.updateScore();
      }
      bulletObj.kill();
    }
  }
}
game.States.over = function () {
  this.create = function () {
    this.buttonBlue = game.add.button(70, 300, 'buttonYellow', this.again, this, 1, 1, 0);
  }
  this.again = function () {
    game.state.start('main');
    }
}

function myPlaneAndEnemyBullets(myPlaneObj, bulletsObj) {
  myPlaneLife -- ;
  if (myPlaneLife <= 0) {
    game.state.start('over');
    myPlaneLife = 3;
    score = 0;
  }
  bulletsObj.kill(); 
}

game.state.add('preload', game.States.preload);
game.state.add('start', game.States.start);
game.state.add('main', game.States.main);
game.state.add('over', game.States.over);
game.state.start('preload');
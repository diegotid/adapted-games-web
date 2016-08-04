
var activeTile;
var gameFinished;
var selectedImage;
var imageScale = 1;
var imageTiles = [];

var PAGE_MARGIN = 25;
var MAGNET_AREA = 25;

function startGame(imageFile) {
  imageScale = 0.75;
  document.ontouchmove = function(event) {
      event.preventDefault();
  }
  selectedImage = new Image();
  selectedImage.src = imageFile;
  imageTiles[0] = new component(imageFile, 0, 0, selectedImage.width, selectedImage.height / 2);
  imageTiles[1] = new component(imageFile, 0, selectedImage.height / 2, selectedImage.width, selectedImage.height / 2);
  gameFinished = false;
  gameArea.start();
}

function restartGame() {
  for (var i = 0; i < imageTiles.length; i++) {
    imageTiles[i].restart();
  }
  gameFinished = false;
}

function endGame() {
  gameArea.end();
}

var gameArea = {
  canvas : document.createElement("canvas"),
  start : function() {
      this.canvas.width = window.innerWidth - PAGE_MARGIN;
      this.canvas.height = window.innerHeight - PAGE_MARGIN - 30;
      this.context = this.canvas.getContext("2d");
      this.context.shadowBlur = 10;
      this.context.shadowColor = "black";
      document.body.insertBefore(this.canvas, document.body.childNodes[0]);
      this.interval = setInterval(updateGameArea, 20);
      window.addEventListener('mousedown', function (e) {
        gameArea.touchEvent(e);
      });
      window.addEventListener('touchstart', function (e) {
        gameArea.touchEvent(e);
      });
      window.addEventListener('touchend', function (e) {
        gameArea.touchEvent(e);
      });
      window.addEventListener('mousemove', function (e) {
        gameArea.moveEvent(e.pageX, e.pageY);
      });
      window.addEventListener('touchmove', function (e) {
        gameArea.moveEvent(e.touches[0].screenX, e.touches[0].screenY);
      });
      gameArea.magnet(imageTiles[0]);
  },
  clear : function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  end : function() {
      document.body.removeChild(this.canvas);
  },
  magnet : function(comp) {
    var tile;
    var diff;
    var over;
    var total = 0;
    for (var i = 0; i < imageTiles.length; i++) {
      tile = imageTiles[i];
      if (tile.tilex != comp.tilex || tile.tiley != comp.tiley) {
        diff = Math.abs((tile.x - tile.tilex) - (comp.x - comp.tilex)) + Math.abs((tile.y - tile.tiley) - (comp.y - comp.tiley));
        if (diff < MAGNET_AREA) {
          comp.x = tile.x + (comp.tilex - tile.tilex);
          comp.y = tile.y + (comp.tiley - tile.tiley);
          comp.update();
          diff = Math.abs((tile.x - tile.tilex) - (comp.x - comp.tilex)) + Math.abs((tile.y - tile.tiley) - (comp.y - comp.tiley));
        }
        total += diff;
      }
    }
    if (total == 0) {
      gameFinished = true;
    }
  },
  touchEvent : function(e) {
    if (activeTile && activeTile.moving) {
      activeTile.moving = false;
      gameArea.canvas.style.cursor = "auto";
      gameArea.magnet(activeTile);
      activeTile = null;
    } else {
      var rect = gameArea.canvas.getBoundingClientRect();
      var realx = e.pageX - rect.left;
      var realy = e.pageY - rect.top;
      if (realx < 0 || realx > rect.width
      || realy < 0 || realy > rect.height) {
        return;
      }
      if (gameFinished) {
        var tile = imageTiles[0];
        if (tile.x < realx && realx < tile.x + tile.image.width * imageScale
        && tile.y < realy && realy < tile.y + tile.image.height * imageScale) {
          activeTile = tile;
        }
      } else {
        for (var i = 0; i < imageTiles.length; i++) {
          var tile = imageTiles[i];
          if (tile != activeTile && tile.moving) {
            tile.moving = false;
          }
          if (tile.x < realx && realx < tile.x + tile.width
          && tile.y < realy && realy < tile.y + tile.height
          && (!activeTile || tile.zindex > activeTile.zindex)) {
            activeTile = tile;
          }
        }
      }
      if (activeTile) {
        activeTile.moving = true;
        activeTile.bindx = realx - activeTile.x;
        activeTile.bindy = realy - activeTile.y;
        var rect = gameArea.canvas.getBoundingClientRect();
        gameArea.x = e.pageX - rect.left - activeTile.bindx;
        gameArea.y = e.pageY - rect.top - activeTile.bindy;
        gameArea.canvas.style.cursor = "none";
      }
    }
  },
  moveEvent : function(x, y) {
    if (activeTile && activeTile.moving) {
      var rect = gameArea.canvas.getBoundingClientRect();
      if (x - activeTile.bindx > rect.left && x - activeTile.bindx < rect.right - activeTile.width) {
        gameArea.x = x - rect.left - activeTile.bindx;
      }
      if (y - activeTile.bindy > rect.top && y - activeTile.bindy < rect.bottom - activeTile.height) {
        gameArea.y = y - rect.top - activeTile.bindy;
      }
    }
  }
}

function component(source, x, y, width, height) {
  this.image = new Image();
  this.image.src = source;
  this.zindex = imageTiles.length;
  this.width = width * imageScale;
  this.height = height * imageScale;
  this.tilex = x * imageScale;
  this.tiley = y * imageScale;
  this.speedX = 0;
  this.speedY = 0;
  this.restart = function() {
    this.x = (window.innerWidth - PAGE_MARGIN - this.width) * Math.random();
    this.y = (window.innerHeight - PAGE_MARGIN - this.height) * Math.random();
  }
  this.restart();
  this.update = function() {
    if (gameFinished) {
      if (this.zindex > 0) {
        return;
      }
      gameArea.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x, this.y, this.image.width * imageScale, this.image.height * imageScale);
    } else {
      gameArea.context.drawImage(this.image, x, y, width, height, this.x, this.y, this.width, this.height);
    }
  }
}

function updateGameArea() {
  gameArea.clear();
  var movings = 0;
  for (var i = 0; i < imageTiles.length; i++) {
    var tile = imageTiles[i];
    if (tile.moving && gameArea.x && gameArea.y) {
      movings++;
      tile.x = gameArea.x;
      tile.y = gameArea.y;
    }
    tile.update();
  }
}

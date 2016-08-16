
var activeTile;
var gameFinished;
var selectedImage;

var gameLevel = 1;
var imageScale = 1;
var imageTiles = [];
var finishedTiles = [];

var PAGE_MARGIN = 25;
var MAGNET_AREA = 50;

function setup() {
  document.getElementById("level").style.display = 'none';
  var dropZone = document.getElementsByClassName("gamesetup")[0];
  selectedImage = new Image();
  if (window.FileReader) {
    document.body.addEventListener('dragover', function(e) {
      e.preventDefault();
    }, false);
    document.body.addEventListener('dragenter', function(e) {
      e.preventDefault();
      dropZone.className = "gamesetup";
    }, false);
    document.body.addEventListener('drop', function(e) {
      e.preventDefault();
    }, false);
    dropZone.addEventListener('dragover', function(e) {
      e.preventDefault();
    }, false);
    dropZone.addEventListener('dragenter', function(e) {
      dropZone.className += " dragovercolor";
      e.stopPropagation();
    }, false);
    dropZone.addEventListener('drop', function(e) {
      e.preventDefault();
      dropZone.className = "gamesetup";
      var file = e.dataTransfer.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('loadend', function(e, file) {
        selectImage(this.result);
      });
    }, false);
  } else {
    dropZone.innerHTML = 'Navegador no soportado';
  }
}

function chooseImage(source) {
  selectImage(source);
  showGalery();
}

function selectImage(source) {
  selectedImage.src = source;
    document.getElementById("imagepreview").src = selectedImage.src;
    imageScale = (window.innerWidth / selectedImage.width) / 2;
    if (window.innerHeight / selectedImage.height < imageScale * 2) {
      imageScale = (window.innerHeight / selectedImage.height) / 2;
    }
    changeLevel(document.getElementById("levelselector").value);
    document.getElementById("altoptions").className = 'crowded';
    document.getElementById("level").style.display = 'inline';
  }
}

function takeImage() {
  var fileSelector = document.getElementById("imageselector");
  fileSelector.click();
  var reader = new FileReader();
  fileSelector.addEventListener('change', function() {
    reader.readAsDataURL(fileSelector.files[0]);
  });
  reader.addEventListener('loadend', function() {
    selectImage(this.result);
  });
}

function showGalery() {
  var galery = document.getElementById('galery');
  if (galery.style.display == 'inline') {
    galery.style.display = 'none';
    document.getElementById("imagepreview").style.display = 'block';
    document.getElementById("level").style.display = 'inline';
  } else {
    galery.style.display = 'inline';
    document.getElementById("imagepreview").style.display = 'none';
    document.getElementById("level").style.display = 'none';
  }
}

function changeLevel(level) {
  var level = parseInt(level);
  var verbo = document.getElementById("selectlevel");
  switch (level) {
    case 0:
      verbo.innerHTML = "Nivel: F&aacute;cil";
      break;
    case 1:
      verbo.innerHTML = "Nivel: Moderado";
      break;
    case 2:
      verbo.innerHTML = "Nivel: Dif&iacute;cil";
      break;
    case 3:
      verbo.innerHTML = "Nivel: Muy dif&iacute;cil";
      break;
    default:
      verbo.innerHTML = "Selecciona nivel de dificultad";
  }
  gameLevel = 4 + 2 * level;
  imageTiles.length = 0;
  var cols = Math.round(selectedImage.width * imageScale / (window.innerWidth / gameLevel));
  var rows = Math.round(selectedImage.height * imageScale / (window.innerHeight / gameLevel));
  var celw = selectedImage.width / cols;
  var celh = selectedImage.height / rows;
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      imageTiles[i * rows + j] = new component(selectedImage.src, i * celw, j * celh, celw, celh);
    }
  }
}

function startGame() {
  document.ontouchmove = function(event) {
      event.preventDefault();
  }
  gameFinished = false;
  gameArea.start();
  document.getElementsByClassName("back")[0].style.display = 'inline';
  document.getElementsByClassName("reload")[0].style.display = 'inline';
  document.getElementsByClassName("gamesetup")[0].style.display = 'none';
  document.getElementById("gamename").className = 'crowded';
}

function restartGame() {
  for (var i = 0; i < imageTiles.length; i++) {
    imageTiles[i].restart();
  }
  finishedTiles.length = 0;
  gameFinished = false;
  gameArea.canvas.className = "";
  document.body.className = "";
}

function settle(settled, tile) {
  for (var i = 0; i < finishedTiles.length; i++) {
    var set = finishedTiles[i];
    if (set.indexOf(settled) >= 0) {
      if (set.indexOf(tile) < 0) {
        set.push(tile);
      }
      settleSet(i, tile);
      return;
    } else if (set.indexOf(tile) >= 0) {
      if (set.indexOf(settled) < 0) {
        set.push(settled);
      }
      settleSet(i, settled);
      return;
    }
  }
  finishedTiles.push(new Array(settled, tile));
}

function settleSet(setIndex, tile) {
  for (var i = 0; i < finishedTiles.length; i++) {
    if (i == setIndex) {
      continue;
    }
    var set = finishedTiles[i];
    for (var j = 0; j < set.length; j++) {
      var comp = set[j];
      if (comp == tile) {
        continue;
      }
      var diff = Math.abs((tile.x - tile.tilex) - (comp.x - comp.tilex)) + Math.abs((tile.y - tile.tiley) - (comp.y - comp.tiley));
      if (diff < MAGNET_AREA
      && areBordering(tile, set[j])) {
        finishedTiles[setIndex] = set.concat(finishedTiles[setIndex]).filter(function(item, pos, self) {
          return self.indexOf(item) == pos;
        });
        finishedTiles.splice(i, 1);
        break;
      }
    }
  }
}

var gameArea = {
  canvas : document.createElement("canvas"),
  start : function() {
      this.cheer = new Audio('happykids.wav');
      this.canvas.width = window.innerWidth - PAGE_MARGIN;
      this.canvas.height = window.innerHeight - PAGE_MARGIN - 30;
      this.context = this.canvas.getContext("2d");
      document.body.insertBefore(this.canvas, document.body.childNodes[0]);
      this.interval = setInterval(updateGameArea, 20);
      window.addEventListener('mousedown', function (e) {
        gameArea.touchEvent(e);
      });
      window.addEventListener('mousemove', function (e) {
        gameArea.moveEvent(e.pageX, e.pageY);
      });
      window.addEventListener('touchmove', function (e) {
        gameArea.moveEvent(e.touches[0].screenX, e.touches[0].screenY);
      });
      window.addEventListener('touchstart', function (e) {
        gameArea.touchEvent(e);
      });
      window.addEventListener('touchend', function (e) {
        gameArea.touchEvent(e);
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
          if (areBordering(tile, comp)) {
            settle(tile, comp);
          }
        }
        total += diff;
      }
    }
    if (total < PAGE_MARGIN) {
      gameFinished = true;
      this.canvas.className = "finished";
      document.body.className = "finished";
      this.cheer.play();
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
  for (var i = 0; i < imageTiles.length; i++) {
    var tile = imageTiles[i];
    if (tile.moving && gameArea.x && gameArea.y) {
      var x = tile.x - gameArea.x;
      var y = tile.y - gameArea.y;
      tile.x = gameArea.x;
      tile.y = gameArea.y;
      dragSettled(tile, x, y);
    }
    tile.update();
  }
}

function dragSettled(head, x, y) {
  for (var j = 0; j < finishedTiles.length; j++) {
    var set = finishedTiles[j];
    if (set.indexOf(head) >= 0) {
      for (var i = 0; i < set.length; i++) {
        var tile = set[i];
        if (tile != head) {
          tile.x -= x;
          tile.y -= y;
          tile.update();
        }
      }
    }
  }
}

function areBordering(a, b) {
  if (Math.abs(a.tilex - b.tilex) - a.width < 1
  && Math.abs(a.tiley - b.tiley) < 1) {
    return true;
  }
  if (Math.abs(a.tiley - b.tiley) - a.height < 1
  && Math.abs(a.tilex - b.tilex) < 1) {
    return true;
  }
  return false;
}

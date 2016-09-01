
var word;
var toListen;
var stack = [];
var listenTimeout;

var name;
var allSyllables;

var vowels = [];
var allVowels = ['a', 'e', 'i', 'o', 'u'];
var consonants = [];

function setup() {
  name = getCookie('name');
  allSyllables = getCookie('syllables');
  allSyllables = document.getElementById('syllablesCheck').checked = (!allSyllables || allSyllables == 'true');
  if (name && name.length > 0) {
    document.getElementById("name").value = name;
  } else {
    settings();
  }
  var alphabet = "abcdefghijklmnñopqrstuvwxyz";
  var alphabetSet = getCookie('alphabet');
  if (!alphabetSet) {
    alphabetSet = "aeioulmpst";
    setCookie('alphabet', alphabetSet);
  }
  var alphabetList = document.createElement("ul");
  document.getElementById("alphabet").appendChild(alphabetList);
  for (var i = 0; i < alphabet.length; i++) {
    var letter = alphabet.charAt(i);
    var letterItem = document.createElement("li");
    if (alphabetSet.indexOf(letter) >= 0) {
      if (allVowels.indexOf(letter) >= 0) {
        vowels.push(letter);
      } else {
        consonants.push(letter);
      }
    } else {
      letterItem.setAttribute('class', 'off');
    }
    letterItem.innerHTML = letter;
    letterItem.addEventListener('click', function(e) {
      var letter = e.target.innerHTML;
      var alphabetSet = getCookie('alphabet');
      if (alphabetSet.indexOf(letter) < 0) {
        setCookie('alphabet', alphabetSet + '' + letter);
        e.target.className = '';
      } else {
        setCookie('alphabet', alphabetSet.replace(letter, ''));
        e.target.className = 'off';
      }
    });
    alphabetList.appendChild(letterItem);
  };
  word = document.getElementById("word");
  var consonantsList = document.createElement("ul");
  consonantsList.setAttribute('class', 'consonants');
  document.getElementById("rack").appendChild(consonantsList);
  for (var i = 0; i < consonants.length; i++) {
    var consonantItem = document.createElement("li");
    consonantItem.innerHTML = consonants[i];
    consonantItem.setAttribute('class', allSyllables ? '' : 'on');
    consonantItem.addEventListener('click', function(e) {
      if (!allSyllables || e.target.className.length > 0) {
        addToWord(e.target.innerHTML);
      } else {
        syllable(e.target.innerHTML);
      }
    });
    consonantsList.appendChild(consonantItem);
    var consonantSyllables = document.createElement("ul");
    consonantSyllables.setAttribute('id', consonants[i]);
    consonantSyllables.setAttribute('class', 'syllable');
    for (var j = 0; j < vowels.length; j++) {
      var consonantSyllable = document.createElement("li");
      consonantSyllable.innerHTML = consonants[i] + '' + vowels[j];
      consonantSyllable.addEventListener('click', function(e) {
        addToWord(e.target.innerHTML);
      });
      consonantSyllables.appendChild(consonantSyllable);
    };
    document.getElementById("rack").appendChild(consonantSyllables);
  };
  var vowelsList = document.createElement("ul");
  document.getElementById("rack").appendChild(vowelsList);
  for (var i = 0; i < vowels.length; i++) {
    var vowelItem = document.createElement("li");
    vowelItem.innerHTML = vowels[i];
    vowelItem.addEventListener('click', function(e) {
      syllable(e.target.innerHTML);
      addToWord(e.target.innerHTML);
    });
    vowelsList.appendChild(vowelItem);
  };
}

function addToWord(text) {
  responsiveVoice.cancel();
  var substrings = word.innerHTML.split(text);
  if (substrings.length > 2) {
    responsiveVoice.speak(name + ", no me tomes el pelo", 'Spanish Female');
    word.innerHTML = "";
    stack.length = 0;
    return;
  }
  word.innerHTML += text;
  stack.push(text.length);
  if (stack.length > 1) {
    window.clearTimeout(listenTimeout);
      listenTimeout = window.setTimeout(function () {
      listen(word);
    }, 1500);
  }
  if (word.clientWidth > 0.75 * word.parentElement.clientWidth) {
    if (word.className) {
      word.className = "small";
    } else {
      word.className = "medium";
    }
  }
}

function setCookie(cname, cvalue) {
  document.cookie = cname + "=" + escape(cvalue) + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
}

function getCookie(cname) {
  var name = cname + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return unescape(c.substring(name.length, c.length));
    }
  }
  return '';
}

function settings() {
  var settings = document.getElementById("settings");
  if (settings.style.display == 'block') {
    var name = document.getElementById("name").value;
    var syll = document.getElementById("syllablesCheck");
    if (name.length > 0) {
      setCookie('name', name);
      setCookie('syllables', syll.checked);
      settings.style.display = 'none';
      location.reload();
    } else {
      responsiveVoice.cancel();
      responsiveVoice.speak("Por favor, indica el nombre del niño", 'Spanish Female');
    }
  } else {
    settings.style.display = 'block';
  }
}

function erase() {
  responsiveVoice.cancel();
  var lastSyllableLength = stack.pop();
  word.innerHTML = word.innerHTML.substring(0, word.innerHTML.length - lastSyllableLength);
  if (word.clientWidth < 0.5 * word.parentElement.clientWidth) {
    if (word.className && word.className == "small") {
      word.className = "medium";
    } else {
      word.className = "";
    }
  }
}

function clean() {
  responsiveVoice.cancel();
  var sel = window.getSelection();
  sel.removeAllRanges();
  word.innerHTML = "";
  stack.length = 0;
}

function listen(what) {
  window.clearTimeout(listenTimeout);
  responsiveVoice.cancel();
  responsiveVoice.speak(what.innerHTML, 'Spanish Female');
}

function syllable(consonant) {
  var syllables = document.getElementsByClassName('syllable');
  for (var i = 0; i < syllables.length; i++) {
    var syllable = syllables[i];
    syllable.style.display = (syllable.id == consonant && syllable.style.display != 'inline' ? 'inline' : 'none');
  };
  var consonantsList = document.getElementsByClassName("consonants")[0];
  var consonants = consonantsList.childNodes;
  for (var i = 0; i < consonants.length; i++) {
    var consonantItem = consonants[i];
    consonantItem.className = (!allSyllables || (consonantItem.innerHTML == consonant && consonantItem.className.length == 0) ? "on" : "");
  }
}

function createRequest() {
  var result = null;
  if (window.XMLHttpRequest) {
    result = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    result = new ActiveXObject("Microsoft.XMLHTTP");
  }
  return result;
}

function definition(what) {
  console.log('Definition');
  var req = createRequest();
  req.onreadystatechange = function() {
    if (req.readyState != 4) {
      return;
    }
    if (req.status != 200) {
      responsiveVoice.cancel();
      responsiveVoice.speak('Lo siento ' + name + '. Esta palabra creo que no existe', 'Spanish Female');
      return;
    }
    var definicion = JSON.parse(req.responseText)['definicion'];
    if (definicion) {
      responsiveVoice.cancel();
      responsiveVoice.speak('Muy bien ' + name + '. ' + word.innerHTML + ' es: ' + definicion, 'Spanish Female');
    }
  };
  req.open("GET", "http://apicultur.io/api/dicc/1.0.0/definicion/10/" + word.innerHTML, true);
  req.setRequestHeader('Authorization', 'Bearer St1ir8MlgcjYnEURpORQX1Lohxga');
  req.send();
}

function pictures(what) {
  window.open('https://www.google.es/search?tbm=isch&q=' + what.innerHTML, '_blank');
}

function videos(what) {
  window.open('https://www.youtube.com/results?search_query=' + what.innerHTML, '_blank');
}

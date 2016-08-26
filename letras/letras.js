
var word;
var toListen;
var stack = [];

var vowels = [];
var allVowels = ['a', 'e', 'i', 'o', 'u'];
var consonants = [];

function setup() {
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
    consonantItem.addEventListener('click', function(e) {
      syllable(e.target.innerHTML);
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
  word.innerHTML += text;
  stack.push(text.length);
  listen(word);
  if (word.clientWidth > 0.75 * word.parentElement.clientWidth) {
    if (word.className) {
      word.className = "small";
    } else {
      word.className = "medium";
    }
  }
}

function setCookie(cname, cvalue) {
  document.cookie = cname + "=" + cvalue ;
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
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function subset() {
  var alphabet = document.getElementById("alphabet");
  alphabet.style.display = (alphabet.style.display != 'block' ? "block" : "none");
  if (alphabet.style.display == 'none') {
    location.reload();
  } else {
    document.getElementById('rack').style.display = "none";
  }
}

function erase() {
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
  var sel = window.getSelection();
  sel.removeAllRanges();
  word.innerHTML = "";
}

function listen(what) {
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
    consonantItem.className = (consonantItem.innerHTML == consonant && consonantItem.className.length == 0 ? "on" : "");
  }
}

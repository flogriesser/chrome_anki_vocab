const con_words = document.querySelector(".class_vocab");
const wordExist = document.querySelector("#id_word_exists");
const addWordForm = document.querySelector("form");
const addWordInput = document.querySelector("input");
const the_page = document.querySelector(".the_page_save_words_extension");
const export_words = document.querySelector(
  "#download_csv"
);

const languages = {
  "af": "Afrikaans",
  "sq": "Albanian",
  "am": "Amharic",
  "ar": "Arabic",
  "hy": "Armenian",
  "az": "Azerbaijani",
  "eu": "Basque",
  "be": "Belarusian",
  "bn": "Bengali",
  "bs": "Bosnian",
  "bg": "Bulgarian",
  "ca": "Catalan",
  "ceb": "Cebuano",
  "ny": "Chichewa",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  "co": "Corsican",
  "hr": "Croatian",
  "cs": "Czech",
  "da": "Danish",
  "nl": "Dutch",
  "en": "English",
  "eo": "Esperanto",
  "et": "Estonian",
  "tl": "Filipino",
  "fi": "Finnish",
  "fr": "French",
  "fy": "Frisian",
  "gl": "Galician",
  "ka": "Georgian",
  "de": "German",
  "el": "Greek",
  "gu": "Gujarati",
  "ht": "Haitian Creole",
  "ha": "Hausa",
  "haw": "Hawaiian",
  "iw": "Hebrew",
  "hi": "Hindi",
  "hmn": "Hmong",
  "hu": "Hungarian",
  "is": "Icelandic",
  "ig": "Igbo",
  "id": "Indonesian",
  "ga": "Irish",
  "it": "Italian",
  "ja": "Japanese",
  "jw": "Javanese",
  "kn": "Kannada",
  "kk": "Kazakh",
  "km": "Khmer",
  "ko": "Korean",
  "ku": "Kurdish (Kurmanji)",
  "ky": "Kyrgyz",
  "lo": "Lao",
  "la": "Latin",
  "lv": "Latvian",
  "lt": "Lithuanian",
  "lb": "Luxembourgish",
  "mk": "Macedonian",
  "mg": "Malagasy",
  "ms": "Malay",
  "ml": "Malayalam",
  "mt": "Maltese",
  "mi": "Maori",
  "mr": "Marathi",
  "mn": "Mongolian",
  "my": "Myanmar (Burmese)",
  "ne": "Nepali",
  "no": "Norwegian",
  "ps": "Pashto",
  "fa": "Persian",
  "pl": "Polish",
  "pt": "Portuguese",
  "pa": "Punjabi",
  "ro": "Romanian",
  "ru": "Russian",
  "sm": "Samoan",
  "gd": "Scots Gaelic",
  "sr": "Serbian",
  "st": "Sesotho",
  "sn": "Shona",
  "sd": "Sindhi",
  "si": "Sinhala",
  "sk": "Slovak",
  "sl": "Slovenian",
  "so": "Somali",
  "es": "Spanish",
  "su": "Sundanese",
  "sw": "Swahili",
  "sv": "Swedish",
  "tg": "Tajik",
  "ta": "Tamil",
  "te": "Telugu",
  "th": "Thai",
  "tr": "Turkish",
  "uk": "Ukrainian",
  "ur": "Urdu",
  "uz": "Uzbek",
  "vi": "Vietnamese",
  "cy": "Welsh",
  "xh": "Xhosa",
  "yi": "Yiddish",
  "yo": "Yoruba",
  "zu": "Zulu"
}

let userWords = [];

window.onload = () => {
  addWordInput.focus();
};

addWordInput.oninput = () => {
  wordExist.style.display = "none";
};

function updateDisplayedWords(pattern) {
  const con_words = document.querySelector(".class_vocab");
  con_words.innerHTML = ''; 

  chrome.storage.local.get("words", function (data) {
    const words = data.words || [];
    const filteredWords = words.filter(wordObj => wordObj.original.startsWith(pattern));

    if (filteredWords.length > 0) {
      e_s.display = "none";
      filteredWords.forEach(wordObj => {
        word(wordObj);
      });
    } else {
      e_s.display = "block";
    }
  });
}


addWordInput.oninput = () => {
  wordExist.style.display = "none";
  const pattern = addWordInput.value.trim().toLowerCase();
  if (pattern) {
    updateDisplayedWords(pattern);
  } else {
    updateDisplayedWords('');
  }
};


function addWordAndTranslation(inputValue) {
  const apiUrl = 'https://translate.googleapis.com/translate_a/single';
  const params = new URLSearchParams([
    ["client", "gtx"],
    ["sl", "auto"], // Source language auto-detection
    ["tl", "en"],  // Target language set to English
    ["dt", "t"],   // Requesting translation
    ["q", inputValue]
  ]);

  fetch(`${apiUrl}?${params.toString()}`, {
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    let translatedText = data[0][0][0] || "No translation";
    console.log(response);
    console.log(`${apiUrl}?${params.toString()}`);

    chrome.storage.local.get("words", function (result) {
      let words = result.words || [];
      if (!words.some(wordObj => wordObj.original === inputValue)) {
        words.push({ original: inputValue, translated: translatedText });
        chrome.storage.local.set({ words: words }, function () {
          console.log("New word added:", inputValue);
          console.log("Words stored:", words);
          updateDisplayedWords('');
        });
      } else {
        console.log("Word already exists:", inputValue);
        updateDisplayedWords('');
      }
    });
  })
  .catch(error => {
    console.error('Error translating word:', error);
    let translatedValue = "No translation";

    chrome.storage.local.get("words", function (result) {
      let words = result.words || [];
      if (!words.some(wordObj => wordObj.original === inputValue)) {
        words.push({ original: inputValue, translated: translatedValue });
        chrome.storage.local.set({ words: words }, function () {
          console.log("New word added with no translation:", inputValue);
          updateDisplayedWords('');
        });
      }
    });
  });
}



  
addWordForm.onsubmit = (e) => {
  e.preventDefault();
  if (addWordInput.value != null && addWordInput.value.trim() !== "") {
    let inputValue = addWordInput.value.trim().toLowerCase();

    if (inputValue.length > 22) {
      inputValue = inputValue.slice(0, 22);
    }

    addWordAndTranslation(inputValue);
    addWordInput.value = "";
  }
};

function saveEditedWord(inputField, wordObj, box, translatedWordDiv) {
  const editedValue = inputField.value.trim();
  
  if (editedValue !== wordObj.translated) {
      wordObj.translated = editedValue;

      chrome.storage.local.get("words", function (data) {
          const words = data.words || [];
          const index = words.findIndex(w => w.original === wordObj.original);
          if (index !== -1) {
              words[index] = wordObj;
              chrome.storage.local.set({ words: words });
          }
      });

      translatedWordDiv.innerText = editedValue;
  }

  box.replaceChild(translatedWordDiv, inputField);
}


document.addEventListener('DOMContentLoaded', function() {
  const languageSelect = document.getElementById('languageSelect');
  for (const [code, name] of Object.entries(languages)) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = name;
    languageSelect.appendChild(option);
  }
});
  

const empty = document.createElement("p");
empty.innerText = "There are no words yet.";
empty.classList.add("no_words");
const e_s = empty.style;
document.body.appendChild(empty);


const word = (wordObj) => {
  const box = document.createElement("div");
  box.classList.add("box");

  const originalWord = document.createElement("div");
  originalWord.classList.add("word", "original");
  originalWord.innerText = wordObj.original;
  box.appendChild(originalWord);

  const divider = document.createElement("div");
  divider.classList.add("divider");
  box.appendChild(divider);

  const translatedWord = document.createElement("div");
  translatedWord.classList.add("word", "translated");
  translatedWord.innerText = wordObj.translated;
  box.appendChild(translatedWord);

  const deleteButton = document.createElement("div");
  deleteButton.classList.add("deleteButton");
  const deleteImg = document.createElement("img");
  deleteImg.src = "images/trash.svg";
  deleteImg.title = "Delete word";
  deleteButton.appendChild(deleteImg);
  box.appendChild(deleteButton);
  const editButton = document.createElement("div");
  editButton.classList.add("editButton");
  const editImg = document.createElement("img");
  editImg.src = "images/edit-pen-icon.svg";
  editImg.title = "Edit word";
  editButton.appendChild(editImg);
  box.appendChild(editButton);

  const con_words = document.querySelector(".class_vocab");

  if (con_words.firstChild) {
      con_words.insertBefore(box, con_words.firstChild);
  } else {
      con_words.appendChild(box);
  }

  deleteButton.onclick = () => {
      chrome.storage.local.get("words", function (data) {
          const words = data.words || [];
          const index = words.findIndex(w => w.original === wordObj.original && w.translated === wordObj.translated);
          if (index !== -1) {
              words.splice(index, 1);
              chrome.storage.local.set({ words: words }, function () {
                  con_words.removeChild(box);
              });
          }
      });
  };

  editButton.onclick = () => {
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.value = translatedWord.innerText;
    inputField.classList.add("edit-input");
    
    box.replaceChild(inputField, translatedWord);

    inputField.focus();
    inputField.select();

    inputField.addEventListener("blur", () => saveEditedWord(inputField, wordObj, box, translatedWord));
  };

};



chrome.storage.local.get("words", function (data) {
  const words = data.words || [];
  console.log(words);
  if (words.length > 0) {
    e_s.display = "none";
    export_words.style.display = "flex";
    words.forEach((wordObj) => {
      word(wordObj);
    });
  } else {
    e_s.display = "block";
    export_words.style.display = "none";
  }
});


chrome.storage.onChanged.addListener(function (changes, area) {
  if (area == "local" && changes.words) {
    const newWords = changes.words.newValue || [];
    userWords = newWords;

    if (userWords.length > 0) {
      e_s.display = "none";
      export_words.style.display = "flex";
    } else {
      e_s.display = "block";
      export_words.style.display = "none";
    }
  }
});


// prevent user to open inspect window
document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.keyCode === 73) {
    event.preventDefault();
  }
});
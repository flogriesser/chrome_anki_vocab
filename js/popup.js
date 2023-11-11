const con_words = document.querySelector(".class_vocab");
const wordExist = document.querySelector("#id_word_exists");
const addWordForm = document.querySelector("form");
const addWordInput = document.querySelector("input");
const the_page = document.querySelector(".the_page_save_words_extension");
const export_words = document.querySelector(
  "#download_csv"
);

let userWords = [];

window.onload = () => {
  addWordInput.focus();
};

addWordInput.oninput = () => {
  wordExist.style.display = "none";
};

// This function updates the display with words that match the input pattern
function updateDisplayedWords(pattern) {
  const con_words = document.querySelector(".class_vocab");
  con_words.innerHTML = ''; // Clear the current list

  chrome.storage.local.get("words", function (data) {
    const words = data.words || [];
    const filteredWords = words.filter(wordObj => wordObj.original.startsWith(pattern));

    if (filteredWords.length > 0) {
      e_s.display = "none"; // Hide the 'no words yet' message
      filteredWords.forEach(wordObj => {
        word(wordObj); // Display each matching word
      });
    } else {
      e_s.display = "block"; // Show the 'no words yet' message
    }
  });
}

// Modify the oninput event handler to filter and update the word list
addWordInput.oninput = () => {
  wordExist.style.display = "none";
  const pattern = addWordInput.value.trim().toLowerCase();
  if (pattern) {
    updateDisplayedWords(pattern);
  } else {
    // If the input is empty, display all words
    updateDisplayedWords('');
  }
};


/*
function addWordAndTranslation(inputValue) {
  let translatedValue = inputValue + '_translated';

  chrome.storage.local.get("words", function (data) {
    let words = data.words || [];
    if (!words.some(wordObj => wordObj.original === inputValue)) {
      words.push({ original: inputValue, translated: translatedValue });
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
}
*/
function addWordAndTranslation(inputValue) {
  // Call LibreTranslate's detect endpoint
  fetch('https://libretranslate.com/detect', {
    method: 'POST',
    body: JSON.stringify({ q: inputValue }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(response => response.json())
  .then(detections => {
    if (!detections.length) {
      throw new Error('Language detection failed');
    }
    const detectedLanguage = detections[0].language;

    // Now translate the text using the detected language
    return fetch('https://libretranslate.com/translate', {
      method: 'POST',
      body: JSON.stringify({
        q: inputValue,
        source: detectedLanguage,
        target: 'en', // Replace 'en' with your desired target language
        format: 'text'
      }),
      headers: { 'Content-Type': 'application/json' }
    });
  })
  .then(response => response.json())
  .then(translationData => {
    let translatedValue = translationData.translatedText || "No translation";

    // Continue with storing the translated word as before
    chrome.storage.local.get("words", function (result) {
      let words = result.words || [];
      if (!words.some(wordObj => wordObj.original === inputValue)) {
        words.push({ original: inputValue, translated: translatedValue });
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
    console.log('Error translating word:', error);
    let translatedValue = "No translation";
    // Still save the word with "No translation" if an error occurred
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



  
// Modify the form submission handler to use the shared function
addWordForm.onsubmit = (e) => {
  e.preventDefault();
  if (addWordInput.value != null && addWordInput.value.trim() !== "") {
    let inputValue = addWordInput.value.trim().toLowerCase();

    // Check characters Numbers
    if (inputValue.length > 22) {
      inputValue = inputValue.slice(0, 22);
    }

    // Use the shared function to add the word and its translation
    addWordAndTranslation(inputValue);
    addWordInput.value = "";
  }
};

function saveEditedWord(inputField, wordObj, box, translatedWordDiv) {
  const editedValue = inputField.value.trim();
  
  // Check if the value has changed
  if (editedValue !== wordObj.translated) {
      // Update the wordObj
      wordObj.translated = editedValue;

      // Update the storage
      chrome.storage.local.get("words", function (data) {
          const words = data.words || [];
          const index = words.findIndex(w => w.original === wordObj.original);
          if (index !== -1) {
              words[index] = wordObj;
              chrome.storage.local.set({ words: words });
          }
      });

      // Update the UI
      translatedWordDiv.innerText = editedValue;
  }

  // Replace the input field with the updated translated word div
  box.replaceChild(translatedWordDiv, inputField);
}

  

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
          // Find the wordObj in the array and remove it
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
    
    // Replace the translated word div with the input field
    box.replaceChild(inputField, translatedWord);

    // Focus on the input field and select the text
    inputField.focus();
    inputField.select();

    // Handle saving the new value
    inputField.addEventListener("blur", () => saveEditedWord(inputField, wordObj, box, translatedWord));
  };

};



// When retrieving words from storage
chrome.storage.local.get("words", function (data) {
  const words = data.words || [];
  console.log(words);
  if (words.length > 0) {
    e_s.display = "none";
    export_words.style.display = "flex";
    words.forEach((wordObj) => {
      word(wordObj); // Now passing the entire word object
    });
  } else {
    e_s.display = "block";
    export_words.style.display = "none";
  }
});

// When listening for changes in storage
chrome.storage.onChanged.addListener(function (changes, area) {
  if (area == "local" && changes.words) {
    const newWords = changes.words.newValue || [];
    userWords = newWords;

    if (userWords.length > 0) {
      e_s.display = "none";
      export_words.style.display = "flex";
      // You may want to refresh the displayed word list here
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
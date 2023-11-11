var context = {
  id: "select_word",
  title: "Send to anki",
  contexts: ["selection"],
};

chrome.contextMenus.create(context, () => chrome.runtime.lastError);

/*
function addWordAndTranslation(inputValue) {
  let translatedValue = inputValue + '_translated';

  chrome.storage.local.get("words", function (data) {
    let words = data.words || [];
    if (!words.some(wordObj => wordObj.original === inputValue)) {
      words.push({ original: inputValue, translated: translatedValue });
      chrome.storage.local.set({ words: words }, function () {
        console.log("worker.js: New word added:", inputValue);
        console.log("worker.js: Words stored:", words);
      });
    } else {
      console.log("worker.js: Word already exists:", inputValue);
    }
  });
}
*/

function addWordAndTranslation(inputValue) {
  // Translate the text using 'auto' for automatic source language detection
  fetch('https://libretranslate.com/translate', {
    method: 'POST',
    body: JSON.stringify({
      q: inputValue,
      source: 'auto', // Use 'auto' for automatic source language detection
      target: 'de', // Replace 'en' with your desired target language
      format: 'text'
    }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(response => response.json())
  .then(data => {
    let translatedValue = data.translatedText || "No translation";

    // Continue with storing the translated word as before
    chrome.storage.local.get("words", function (result) {
      let words = result.words || [];
      if (!words.some(wordObj => wordObj.original === inputValue)) {
        words.push({ original: inputValue, translated: translatedValue });
        chrome.storage.local.set({ words: words }, function () {
          console.log("New word added:", inputValue);
          console.log("New word translated:", translatedValue);
          console.log("Words stored:", words);
        });
      } else {
        console.log("Word already exists:", inputValue);
      }
    });
  })
  .catch(error => {
    console.error('Error translating word:', error);
    // Still save the word with "No translation" if an error occurred
    chrome.storage.local.get("words", function (result) {
      let words = result.words || [];
      if (!words.some(wordObj => wordObj.original === inputValue)) {
        words.push({ original: inputValue, translated: "No translation" });
        chrome.storage.local.set({ words: words }, function () {
          console.log("New word added with no translation:", inputValue);
        });
      }
    });
  });
}


chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "select_word" && info.selectionText) {
    let selectedText = info.selectionText.toLowerCase();


    if (selectedText.length > 22) {
      selectedText = selectedText.slice(0, 22);
    }
    addWordAndTranslation(selectedText);
  }
});

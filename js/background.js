var context = {
  id: "select_word",
  title: "Send to anki",
  contexts: ["selection"],
};

chrome.contextMenus.create(context, () => chrome.runtime.lastError);

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
    //console.log(`${apiUrl}?${params.toString()}`);


    chrome.storage.local.get("words", function (result) {
      let words = result.words || [];
      if (!words.some(wordObj => wordObj.original === inputValue)) {
        words.push({ original: inputValue, translated: translatedText });
        chrome.storage.local.set({ words: words }, function () {
          console.log("New word added:", inputValue);
          console.log("Words stored:", words);
        });
      } else {
        console.log("Word already exists:", inputValue);
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

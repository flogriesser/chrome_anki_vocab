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


  
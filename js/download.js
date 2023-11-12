const exportBtn = document.getElementById(
  "download_csv"
);

var SQL;
initSqlJs().then(function (sql) {
  //Create the database
  SQL = sql;
});


exportBtn.addEventListener("click", () => {
  chrome.storage.local.get("words", function (data) {
    let words = data.words || [];
    const myDeck = new Deck(1234567890, 'My Chrome Vocabulary');

    const myModel = new Model({
      name: "Basic",
      id: "2156341623643",
      flds: [
        { name: "Front" },
        { name: "Back" }
      ],
      req: [
        [0, "all", [0]],
      ],
      tmpls: [
        {
          name: "Card 1",
          qfmt: "{{Front}}",
          afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}",
        }
      ],
    });

    words.forEach(wordObj => {
      const note = myModel.note([wordObj.original, wordObj.translated]);
      myDeck.addNote(note);
    });

    // Create package and add deck
    const myPackage = new Package();
    myPackage.addDeck(myDeck);
    myPackage.writeToFile('chrome-vocab-deck.apkg');
  });

});
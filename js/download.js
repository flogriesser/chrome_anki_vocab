const exportBtn = document.getElementById(
  "download_csv"
);



exportBtn.addEventListener("click", () => {
  chrome.storage.local.get("words", function (data) {
    let words = data.words || [];
    let csvContent = "data:text/csv;charset=utf-8,";
    words.forEach(wordObj => {
      csvContent += `"${wordObj.original}","${wordObj.translated}"\n`;
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "translated-words.csv");
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  });
});

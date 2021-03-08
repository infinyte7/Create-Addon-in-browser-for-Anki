/* Do not remove
GPL 3.0 License
Copyright (c) 2020 Mani
*/

var deckName = "Addon in browser";

// add note data to pyodide output text file for deck export
var textToExport = "";
var textFileName = "";
function addNoteToList() {
    textFileName = "output-all-notes.txt";
    
    var container = document.getElementById("add-note");

    // tab separated value for genanki
    for (i = 0; i < container.childElementCount; i++) {
        textToExport += container.children[i].children[1].value.trim() + "\t";
    }

    // remove last space, tab...
    textToExport = textToExport.trim();
    textToExport += "\n";

    // write to file using pyodide
    pyodide.runPython("textFileName = js.textFileName")
    pyodide.runPython("textToExport = js.textToExport")

    pyodide.runPython(`with open(textFileName, 'a', encoding='utf-8') as f: 
                            f.write(textToExport)`)

    showSnackbar("Note added to list");
    textToExport = "";
    clearNote();
}

function clearNote() {
    var container = document.getElementById("add-note");
    for (i = 0; i < container.childElementCount; i++) {
        container.children[i].children[1].value = "";
    }
}

function showSnackbar(msg) {
    var x = document.getElementById("snackbar");

    x.innerHTML = msg;
    x.className = "show";

    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}

// export and download deck 
function exportAll() {
    document.getElementById('statusMsg').innerHTML = "Wait, deck generating...";
    setTimeout(function () { document.getElementById('statusMsg').innerHTML = ""; }, 2000);

    exportDeck();
    downloadDeck();
}

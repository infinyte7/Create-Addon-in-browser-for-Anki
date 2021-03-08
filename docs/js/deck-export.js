/**
*    Note:  when \ (back slash) then use \\ (double back) other wise it will not work.
*    eg:-   csv_reader = csv.reader(csv_file, delimiter="\t")
*                                                      ^^^^^
*           csv_reader = csv.reader(csv_file, delimiter="\\t")
**/

pythonCode = `
import random
import csv

import traceback
import js

from glob import glob
from os.path import join

new_title = js.deckName

anki_deck_title = "Addon in browser"

if new_title != None:
   anki_deck_title = new_title

anki_model_name = "addon-in-browser"

# model_id = random.randrange(1 << 30, 1 << 31)
model_id = 1716551648

def exportDeck(data_filename, deck_filename):
   try:
      import genanki

      # front side
      front = """
<div>{{Front}}</div>
      """

      # styling
      style = """
.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
}      
      """

      # back side
      back = """
<div>{{Front}}</div>
<hr>
<div>{{Back}}</div>
      """

      t_fields = [{"name": "Front"}, {"name": "Back"}]
      
      # print(self.fields)
      anki_model = genanki.Model(
          model_id,
          anki_model_name,
          fields=t_fields,
          templates=[
              {
                  "name": "Card 1",
                  "qfmt": front,
                  "afmt": back,
              },
          ],
          css=style
      )

      anki_notes = []

      with open(data_filename, "r", encoding="utf-8") as csv_file:
          csv_reader = csv.reader(csv_file, delimiter="\\t")
          for row in csv_reader:
              flds = []
              for i in range(len(row)):
                  flds.append(row[i])

              anki_note = genanki.Note(
                  model=anki_model,
                  fields=flds,
              )
              anki_notes.append(anki_note)

      anki_deck = genanki.Deck(model_id, anki_deck_title)
      anki_package = genanki.Package(anki_deck)

      for anki_note in anki_notes:
          anki_deck.add_note(anki_note)

      anki_package.write_to_file(deck_filename)

      deck_export_msg = "Deck generated with {} flashcards".format(len(anki_deck.notes))
      js.showSnackbar(deck_export_msg)

   except Exception:
       traceback.print_exc()
    
import micropip

# localhost
# micropip.install("http://localhost:8000/py-whl/frozendict-1.2-py3-none-any.whl")
# micropip.install("http://localhost:8000/py-whl/pystache-0.5.4-py3-none-any.whl")
# micropip.install("http://localhost:8000/py-whl/PyYAML-5.3.1-cp38-cp38-win_amd64.whl")
# micropip.install('http://localhost:8000/py-whl/cached_property-1.5.2-py2.py3-none-any.whl')
# micropip.install("http://localhost:8000/py-whl/genanki-0.8.0-py3-none-any.whl")

# from GitHub using CDN
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/frozendict-1.2-py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/pystache-0.5.4-py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/PyYAML-5.3.1-cp38-cp38-win_amd64.whl")
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/cached_property-1.5.2-py2.py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/genanki-0.8.0-py3-none-any.whl")

`

languagePluginLoader.then(() => {
    return pyodide.loadPackage(['micropip'])
}).then(() => {
    pyodide.runPython(pythonCode);

    document.getElementById("loading").style.display = "none";
    document.getElementById("statusMsg").innerHTML = "";

    showSnackbar("Ready to import file");
})

languagePluginLoader.then(function () {
    console.log('Ready');
});

function exportDeck() {
    pyodide.runPython(`exportDeck('output-all-notes.txt', 'output.apkg')`);
}

function downloadDeck() {
    let txt = pyodide.runPython(`                  
    with open('/output.apkg', 'rb') as fh:
        out = fh.read()
    out
    `);

    const blob = new Blob([txt], { type: 'application/zip' });
    let url = window.URL.createObjectURL(blob);

    var downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "Export-Deck.apkg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

function exportText() {
    let txt = pyodide.runPython(`                  
    with open('/output-all-notes.txt', 'r') as fh:
        out = fh.read()
    out
    `);

    console.log(txt);

    const blob = new Blob([txt], { type: 'text/plain' });
    let url = window.URL.createObjectURL(blob);

    var downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "output.txt";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}
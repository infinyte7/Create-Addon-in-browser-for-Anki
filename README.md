# Tutorial : Create Addon in browser for Anki
Create Addon in browser for Anki, AnkiDroid and AnkiMobile

This project will explain how to create web app that can be used as addon for Anki to generate decks

## Quick Start

Create simple decks with front and back side with Basic templates in browser<br>
Open in browser

https://infinyte7.github.io/Create-Addon-in-browser-for-Anki

1. Add text to front and back side
2. Click add button to add notes data to list
3. Click download to generate and export deck


# To create Addon in browser
- [Setup](Create-Addon-in-browser-for-Anki#setup)
- [How is it works ?](Create-Addon-in-browser-for-Anki#how-is-it-works-)
- [Advantages](Create-Addon-in-browser-for-Anki#advantages)
- [Disadvantages](Create-Addon-in-browser-for-Anki#disadvantages)
- [Example Projects](Create-Addon-in-browser-for-Anki#example-projects)
- [Read more](Create-Addon-in-browser-for-Anki#read-more)
- [Tutorial](Create-Addon-in-browser-for-Anki#tutorial)
    - [index.html](Create-Addon-in-browser-for-Anki#indexhtml)
    - [index.js](Create-Addon-in-browser-for-Anki#indexjs)
    - [deck-export.js](Create-Addon-in-browser-for-Anki#deck-exportjs)

# Setup
1. Fork this repository
2. All the setup file are in docs folder
3. ```index.html``` is front page for sending note data from html/js to pyodide internally
4. ```index.js``` contain code for object conversion between javaScript and pyodide
5. ```deck-export.js``` contain codes for generating and downloading Anki decks

# How is it works ?
1. Notes data from html/js sent to pyodide in tab separated format
2. When ```add button``` clicked then pyodide write data to ```output-all-notes.txt``` 
3. When ```download button``` clicked then pyodide module ```genanki``` generate Anki decks from tsv file ```output-all-notes.txt``` and download

# Advantages
- Run on smartphone as well as desktop
- Import generated decks to any version of Anki
- Once implemented then easier to use

# Disadvantages
- Network access not available
- Python module like opencv not available
- Loading time is high
- Needs to understand object conversion between javaScript and python

# Example Projects 
- [image occlusion in browser](https://github.com/infinyte7/image-occlusion-in-browser)
- [ocloze: cloze overlapper in browser](https://github.com/infinyte7/ocloze)

# Read more
- [Anki](https://apps.ankiweb.net/)
- [pyodide](https://github.com/iodide-project/pyodide)
- [genanki](https://github.com/kerrickstaley/genanki)

# Tutorial
### index.html
1. Add pyodide
```html
  <script type="text/javascript">
    window.languagePluginUrl = 'pyodide/dev/full/';
  </script>
  <script src="pyodide/dev/full/pyodide.js"></script>
  ...
  ...

  <script src="js/deck-export.js"></script>
```

2. Front and back text area added in ```index.html```
```html
  <!-- Note Form -->
  <!-- Front Back -->
  <div id="add-note">
    <div class="input-note" style="padding-top: 60px;">Front
      <hr class="thin">
      <textarea id="noteFront" class="input-add-note" type="text" placeholder="Front..." required></textarea>
    </div>

    <div class="input-note" style="padding-top: 30px;">Back
      <hr class="thin">
      <textarea id="noteBack" class="input-add-note" type="text" placeholder="Back..." required></textarea>
    </div>
  </div>
```
3. Two button added for adding notes data to list and downloading decks
```html
    <div id="done-export-all" class="toolbar-button" style="float: right; display: block;" onclick="exportAll();"><i
        class="material-icons">get_app</i></div>

    <div id="done-btn" class="toolbar-button" style="float: right;" onclick="addNoteToList();"><i
        class="material-icons">add</i></div>
```

### index.js
1. Adding notes data to pyodide 
```js
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

    // write to file using pyodide
    pyodide.runPython("textFileName = js.textFileName")
    pyodide.runPython("textToExport = js.textToExport")

    pyodide.runPython(`with open(textFileName, 'a', encoding='utf-8') as f: 
                            f.write(textToExport)`)
}
```
2. Generate and export deck
```js
// export and download deck 
function exportAll() {
    document.getElementById('statusMsg').innerHTML = "Wait, deck generating...";
    setTimeout(function () { document.getElementById('statusMsg').innerHTML = ""; }, 2000);

    exportDeck();
    downloadDeck();
}
```

### deck-export.js
1. Init pyodide for running python in browser
```js
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

```
2. python code to generate decks from tsv file ```output-all-notes.txt```
pythonCode = 
```python
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
```
3. Change front, back, style and fields

Front and back should contain fields that present in ```t_fields```.

```t_fields``` should contains fields in following manner.
```python
{"name": "Field name"}
```
4. Images can also be adde to deck if tsv file contains ```<img>``` with src tag
```python
# add media
files = []
for ext in ('*.gif', '*.png', '*.jpg', '*.jpeg', '*.bmp', '*.svg'):
    files.extend(glob(join("images", ext)))

anki_package.media_files = files
```
Same goes for other media files.
View usage in [image occlusion in browser](https://github.com/infinyte7/image-occlusion-in-browser)

5. Import required python module in pyodide
```python
import micropip

# from GitHub using CDN
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/frozendict-1.2-py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/pystache-0.5.4-py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/PyYAML-5.3.1-cp38-cp38-win_amd64.whl")
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/cached_property-1.5.2-py2.py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/genanki-0.8.0-py3-none-any.whl")
```
6. Download generated deck
```js
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
```
7. Download ```output-all-notes.txt``` containing notes data added form
```js
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
```
8. Note:  for \ (back slash), use \\ (double back) in ```pythonCode``` other wise it will not work or show error.
```js
    csv_reader = csv.reader(csv_file, delimiter="\t")
                                               ^^^^^
    csv_reader = csv.reader(csv_file, delimiter="\\t")
```
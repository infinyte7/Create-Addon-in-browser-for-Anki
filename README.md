# Tutorial : How to create an Anki-addon for the browser
This project will explain how to create a web-app that can be used as an addon for Anki to generate decks. 
The resulting addon can be then used with Anki, AnkiDroid and AnkiMobile.

## Example addon

Let's start with an example: an app that let's you create basic question-answer cards in the browser.

https://infinyte7.github.io/Create-Addon-in-browser-for-Anki

<b>Usage</b>
1. Add text for the front and back side of a card
2. Click the add button to save the node
3. Click download to export a deck containing the saved notes

# web-app addons
- [Setup](#setup)
- [How does it work?](#how-does-it-work)
- [Advantages](#advantages)
- [Disadvantages](#disadvantages)
- [Projects](#projects)
- [Read more](#read-more)
- [Tutorial](#tutorial)
    - [index.html](#indexhtml)
    - [index.js](#indexjs)
    - [deck-export.js](#deck-exportjs)

# Setup
1. Fork this repository
2. All the setup-files are in docs folder
3. ```index.html``` is the front page for sending note data from html/js to pyodide internally
4. ```index.js``` contains code for object conversion between javaScript and pyodide
5. ```deck-export.js``` contains code for generating and downloading Anki decks

# How does it work?
1. Note data is sent from html/js to pyodide in a tab-separated format
2. When you click the ```add button``` pyodide writes the data to ```output-all-notes.txt``` 
3. When you click the ```download button``` ```genanki``` generates Anki decks from ```output-all-notes.txt``` and downloads it

# Advantages
- Runs on smartphones as well as on desktop computers
- You can import the generated decks to any version of Anki

# Disadvantages
- The loading time is high
- Some python modules are not available (for example opencv)
- One needs to understand object conversion between javaScript and python

# Projects 
- [image occlusion in browser](https://github.com/infinyte7/image-occlusion-in-browser)
- [ocloze: cloze overlapper in browser](https://github.com/infinyte7/ocloze)

# Read more
- [Anki](https://apps.ankiweb.net/)
    Anki is a free and open-source flashcard program using spaced repetition, a technique from cognitive science for fast and long-lasting memorization. 

- [pyodide](https://github.com/iodide-project/pyodide)

    Pyodide brings the Python 3.8 runtime to the browser via WebAssembly, along with the Python scientific stack including NumPy, Pandas, Matplotlib, SciPy, and scikit-learn. The packages directory lists over 75 packages which are currently available. In addition it's possible to install pure Python wheels from PyPi.

    Pyodide provides transparent conversion of objects between Javascript and Python. When used inside a browser, Python has full access to the Web APIs.

- [genanki](https://github.com/kerrickstaley/genanki)

    ```genanki``` allows you to programmatically generate decks in Python 3 for Anki, a popular spaced-repetition flashcard program.

# Tutorial
## index.html
[View index.html](docs/index.html)
#### 1. Add pyodide
```html
  <script type="text/javascript">
    window.languagePluginUrl = 'pyodide/dev/full/';
  </script>
  <script src="pyodide/dev/full/pyodide.js"></script>
  ...
  ...

  <script src="js/deck-export.js"></script>
```

#### 2. Text areas for front and back fields of the card to be added
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
#### 3. Buttons for adding note data to a list and for downloading decks
```html
    <div id="done-export-all" class="toolbar-button" style="float: right; display: block;" onclick="exportAll();"><i
        class="material-icons">get_app</i></div>

    <div id="done-btn" class="toolbar-button" style="float: right;" onclick="addNoteToList();"><i
        class="material-icons">add</i></div>
```

## index.js
[View index.js](docs/js/index.js)
#### 1. Adding note data to pyodide 
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
#### 2. Generate and export deck
```js
// export and download deck 
function exportAll() {
    document.getElementById('statusMsg').innerHTML = "Wait, deck generating...";
    setTimeout(function () { document.getElementById('statusMsg').innerHTML = ""; }, 2000);

    exportDeck();
    downloadDeck();
}
```

## deck-export.js
[View deck-export.js](docs/js/deck-export.js)
#### 1. Init pyodide for running python in browser
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
#### 2. python code to generate decks from the tsv file ```output-all-notes.txt```

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
#### 3. Change front, back, style and fields

Front and back should contain fields that are present in ```t_fields```.

```t_fields``` should contain fields in the following manner.
```python
{"name": "Field name"}
```
#### 4. Images can also be added to a deck if the tsv file contains ```<img>``` with a src tag
Select image using ```input```

```js
function addImage() {
    var imgHeight;
    var imgWidth;

    var selectedFile = event.target.files[0];
    var reader = new FileReader();

    var imgtag = document.getElementById("uploadPreview");
    imgtag.title = selectedFile.name;
    imgtag.type = selectedFile.type;

    reader.onload = function (event) {
        imgtag.src = event.target.result;

        imgtag.onload = function () {
            imgHeight = this.height;
            imgWidth = this.width;
        };
    };

    reader.readAsDataURL(selectedFile);
}
```

Saving selected image to internal. In this code base64 of image passed and written to file.

```js
function saveSelectedImageToInternal() {
    pyodide.runPython("import os")
    pyodide.runPython("import js")
    pyodide.runPython("import base64")

    pyodide.runPython("if not os.path.exists('images'): os.mkdir('images')")

    // src tag contains base64 of image data
    pyodide.runPython("blob = js.document.getElementById('uploadPreview').getAttribute('src')")
    pyodide.runPython("name = js.document.getElementById('uploadPreview').getAttribute('title')")

    // base64 data
    // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAEECAAAAAAjIz....
    // split data and write later part
    // iVBORw0KGgoAAAANSUhEUgAAAZAAAAEECAAAAAAjIz....
    pyodide.runPython("blob = blob.split(',')[1]")
    pyodide.runPython("imgData = base64.b64decode(blob)")
    pyodide.runPython(`with open('images/' + name, 'wb') as f: 
                            f.write(imgData)`)
}
```

Appending images to genanki Anki packages.

```python
# add media
files = []
for ext in ('*.gif', '*.png', '*.jpg', '*.jpeg', '*.bmp', '*.svg'):
    files.extend(glob(join("images", ext)))

anki_package.media_files = files
```
Same goes for other media files.
<br>View usage in [image occlusion in browser](https://github.com/infinyte7/image-occlusion-in-browser)

#### 5. Import the required python module in pyodide
```python
import micropip

# from GitHub using CDN
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/frozendict-1.2-py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/pystache-0.5.4-py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/PyYAML-5.3.1-cp38-cp38-win_amd64.whl")
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/cached_property-1.5.2-py2.py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/infinyte7/Anki-Export-Deck-tkinter/docs/py-whl/genanki-0.8.0-py3-none-any.whl")
```
#### 6. Download generated deck
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
#### 7. Download ```output-all-notes.txt``` containing note data
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
## Note
#### 1. Escape back slash in pythonCode
Note:  If you want to use backslashes \\ in ```pythonCode``` you have to escape them with another backslash \\\\, otherwise it will not work or show an error.
```js
    csv_reader = csv.reader(csv_file, delimiter="\t")
                                               ^^^^^
    csv_reader = csv.reader(csv_file, delimiter="\\t")
```
#### 2. Add constant value for model id
For every deck generation, genanki use random model id which leads to creation of multiple ```Note Type```. So to avoid this use constant model id in genanki python code in deck-export.js

```python
anki_model_name = "addon-in-browser"

# model_id = random.randrange(1 << 30, 1 << 31)
# fixed model id for this project
model_id = 1716551648
```

#### 3. Pass deck name from js to pyodide
Create a variable ```deckName``` in js file and access it in pyodide

```python
import js

new_title = js.deckName
anki_deck_title = "Addon in browser"

if new_title != None:
   anki_deck_title = new_title
```
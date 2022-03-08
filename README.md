# Webscore Player
A tool for playing MuseScore projects in your web browser

## How to Use
In MuseScore, export your project to MusicXML, MP3, and SVG

Use mxlparse.py to generate your JSON file:
`python mxlparse.py my-score.mxl`

Then in your page's HTML:

```html
<script src="/path/to/WebscorePlayer.js"></script>
...
<div id="player"></div>
...
<script>
        WebscoreInit(textOfJSON, arrayOfSVGPaths, "/path/to/my-score.mp3");
</script>
```

Parameters to `WebscoreInit()`:
1.  The entire string of the JSON file produced by mxlparse.py.
2.  An array of strings, the in-order paths to the SVG files of your score
3.  The path to the MP3 file of your score

### Known issues and further goals
The way MuseScore exports its SVGs, grace notes are ordered after the notes they precede. This means grace 
notes are highlighted for far longer than they should be, while the notes they precede just flicker for a 
moment.

A solution might be to order the notes ourselves, instead of relying on MuseScore's exporting process. 
This might lead to compatibility with other score-writing softwares.

# Webscore Player (In Development)
A tool for playing MuseScore projects in your web browser

See a [Demo](eli.waksbaum.com/secrets/dancing_demo)

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

## Known issues and further goals
- The way MuseScore exports its SVGs, grace notes are ordered after the notes they precede. This means the primary note is highlighted first, for a moment, and then the grace 
note is highlighted for the duration of the note.
- Similary, MuseScore will occasionally just mess up the ordering of some notes for no reason I can discern. Once caught, this can usually be fixed by cutting and pasting the whole score in place.
  - One solution could be to order the notes as part of the parsing process, instead of relying on MuseScore's exporting convention. This might lead to compatibility with other score-writing softwares.

- I'm pretty sure the mxl contains all the data needed to implement the MuseScore feature where you can click on any note to start playback from that point. Since this isn't an 
editor and I doubt people are playing along, this is a secondary goal that I might return to implement at a later date.

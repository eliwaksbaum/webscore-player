# Webscore Player
A tool for playing MuseScore projects in your web browser

See it [in action](https://eli.waksbaum.com/projects/?tag=Music).

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
- This tool assumes a certain ordering of SVG elements. MuseScore is anything but consistent when exporting, though, so it can be difficult to get the right format. Usually, cutting all the notes into another file and then pasting them back part by part, bottom to top, will do the trick.
- Similary, grace notes are ordered after the notes they precede. This means the primary note is highlighted first, for a moment, and then the grace note is highlighted for the duration of the note.
  - One solution could be to order the notes as part of the parsing process, instead of relying on MuseScore's exporting convention. This might lead to compatibility with other score-writing softwares.

- This hasn't been tested with a wide variety of repeat structures. I'd imagine dal segno and da capo would be ok, but I'm pretty sure a coda would break it.

- Clicking to select half and whole notes is pretty difficult since the selectable area is so small.

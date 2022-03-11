var canvas; 
var sheets = [];
var music;

var pageDatas;
var svgPaths;
var numPages;
var displayPage = 0;

var pageObjs = [];
var curPage = 0;
var timeouts = [];

var isPlaying = false;
var isPaused = false;
var metronome;

var playButton;
var pauseButton;
var stopButton;

var blue = "#0643f9";
var gray = "#2e2e2e";

var panelHTML = `
<svg width="293.3mm" height="27.933mm" version="1.1" viewBox="0 0 293.3 27.933" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="width:90%; height: fit-content; margin-left: 5%">
 <defs>
  <linearGradient id="linearGradient1179" x1="89.079" x2="89.079" y1="59.538" y2="36.208" gradientTransform="matrix(1.3447 0 0 1.0775 -263.48 43.799)" gradientUnits="userSpaceOnUse">
   <stop stop-color="#787878" offset="0"/>
   <stop stop-color="#e5e5e5" offset="1"/>
  </linearGradient>
 </defs>
 <g transform="translate(10.168 -82.016)">
  <rect transform="scale(-1,1)" x="-283.13" y="82.016" width="293.3" height="27.933" ry="3.3918" fill="url(#linearGradient1179)" stop-color="#000000"/>
  <g transform="matrix(.77528 0 0 .77528 38.038 27.581)">
   <g id="playbox">
    <rect x="68.241" y="76.454" width="22.098" height="23.548" ry="0" fill-opacity="0" stop-color="#000000"/>
    <path id="play" transform="matrix(.16795 0 0 .16795 58.311 62.207)" d="m176.37 155.36-94.5 54.559v-109.12z" fill="#2e2e2e" stop-color="#000000" stroke="#2e2e2e" stroke-linecap="round" stroke-linejoin="round" stroke-width="9.031"/>
   </g>
   <g id="pausebox" transform="matrix(.56732 0 0 .56732 79.852 60.148)">
    <g id="pause" fill="#2e2e2e" stroke="#2e2e2e" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.3894">
     <rect x="71.102" y="33.329" width="6.2955" height="32.589" ry="3.1478" stop-color="#000000"/>
     <rect x="89.804" y="33.329" width="6.2955" height="32.589" ry="3.1478" stop-color="#000000"/>
    </g>
    <rect x="65.363" y="29.768" width="36.257" height="40.014" ry="0" fill-opacity="0" stop-color="#000000"/>
   </g>
   <rect id="stop" x="166.64" y="79.146" width="18.309" height="18.309" ry="2.0212" fill="#2e2e2e" stop-color="#000000" stroke="#2e2e2e" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5343"/>
  </g>
  <g id="next" transform="matrix(.83376 0 0 .83376 43.518 20.536)">
   <path transform="matrix(.079918 0 0 .10057 254.58 74.54)" d="m176.37 155.36-94.5 54.559v-109.12z" fill="#2e2e2e" stop-color="#000000" stroke="#2e2e2e" stroke-linecap="round" stroke-linejoin="round" stroke-width="9.031"/>
   <rect x="267.65" y="84.323" width="2.8587" height="11.783" ry="1.4293" fill="#2e2e2e" stop-color="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.12"/>
   <rect x="258.34" y="81.762" width="14.903" height="17.453" ry="0" fill-opacity="0" stop-color="#000000"/>
  </g>
  <g id="prev" transform="matrix(-.83376 0 0 .83376 144.16 -46.557)">
   <path transform="matrix(.079918 0 0 .10057 152.77 155.47)" d="m176.37 155.36-94.5 54.559v-109.12z" fill="#2e2e2e" stop-color="#000000" stroke="#2e2e2e" stroke-linecap="round" stroke-linejoin="round" stroke-width="9.031"/>
   <rect x="165.84" y="165.26" width="2.8587" height="11.783" ry="1.4293" fill="#2e2e2e" stop-color="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.12"/>
   <rect transform="scale(-1,1)" x="-170.82" y="162.23" width="14.903" height="17.453" ry="0" fill-opacity="0" stop-color="#000000"/>
  </g>
 </g>
</svg>
`

function WebscoreInit(json, svgsrcs, audiosrc) {
    pageDatas = JSON.parse(json);
    svgPaths = svgsrcs;
    numPages = pageDatas.length;
    pageObjs = new Array(numPages);
    metronome = new Metronome();

    canvas = document.getElementById("player");
    canvas.style.width = "min-content";
    canvas.style.margin = "auto";

    var panel = document.createElement("div");
    panel.innerHTML = panelHTML;
    panel.style.height = "fit-content";
    canvas.appendChild(panel);

    panelsvg = panel.getElementsByTagName("svg")[0];

    playButton = panelsvg.getElementById("play");
    panelsvg.getElementById("playbox").addEventListener("click", play);

    pauseButton = panelsvg.getElementById("pause");
    panelsvg.getElementById("pausebox").addEventListener("click", pause);

    stopButton = panelsvg.getElementById("stop");
    stopButton.addEventListener("click", stop);

    panelsvg.getElementById("next").addEventListener("click", next);
    panelsvg.getElementById("prev").addEventListener("click", prev);

    let head = document.head || document.getElementsByTagName('head')[0];
    let style = document.createElement('style');
    style.innerHTML = `
        #playbox:hover, #pausebox:hover, #stop:hover, #prev:hover, #next:hover {
            cursor: pointer;
        }
    `
    head.appendChild(style);

    for (let i = 0; i < numPages; i++) {
        var sheet = document.createElement("object");
        sheet.setAttribute("data", svgPaths[i]);
        sheet.setAttribute("type", "image/svg+xml");
        sheet.style.height = "100vh";
        sheet.style.background = "white";
        sheet.style.border = "3px black solid";
        sheet.addEventListener("load", (e) => {e.preventDefault; console.log("yo");});
        sheets.push(sheet);
        canvas.appendChild(sheet);
    }                                       //let's all the pages pre-render i think, flipping without stutter
    for (let i = 1; i < numPages; i++) {
        sheets[i].style.display = "none";
    }

    music = document.createElement("audio");
    music.setAttribute("src", audiosrc);
    canvas.appendChild(music);
}

function play() {
    if (!isPlaying) {
        playButton.style.fill = blue;
        playButton.style.stroke = blue;

        if (isPaused) {
            pauseButton.style.fill = gray;
            pauseButton.style.stroke = gray;

            isPaused = false;
            metronome.resume();
        } else {
            if (displayPage != curPage) {
                sheets[curPage].style.display = "block";
                sheets[displayPage].style.display = "none";
                displayPage = curPage;
            }

            pagePlay();
            metronome.start();
        }

        isPlaying = true;
        music.play();
    }
}

function pagePlay() {
    if (pageObjs[curPage] == null) {
        pageObjs[curPage] = new Page(curPage);
    }
    pageObjs[curPage].play();
}

function stop() {
    music.pause();
    music.currentTime = 0;
    pageObjs[curPage].stop();
    isPlaying = false;
    isPaused = false;

    playButton.style.fill = gray;
    playButton.style.stroke = gray;
    pauseButton.style.fill = gray;
    pauseButton.style.stroke = gray;

    if (displayPage != 0) {
        sheets[0].style.display = "block"
        sheets[displayPage].style.display = "none";
    }
    curPage = 0;
    displayPage = 0;

    metronome.stop();
}

function pause() {
    if (isPlaying && !isPaused) {
        playButton.style.fill = gray;
        playButton.style.stroke = gray;
        pauseButton.style.fill = blue;
        pauseButton.style.stroke = blue;

        isPlaying = false;
        isPaused = true;
        metronome.pause();
    }
}

function next() {
    if (displayPage + 1 < numPages) {
        sheets[displayPage+1].style.display = "block";
        sheets[displayPage].style.display = "none";
        displayPage++;
    }
}
function prev() {
    if (displayPage - 1 >= 0) {
        sheets[displayPage-1].style.display = "block";
        sheets[displayPage].style.display = "none";
        displayPage--;
    }
}

class Page {
    constructor(num) {
        this.pageSVG = sheets[num].contentDocument.getElementsByTagName("svg")[0];
        this.svgArrays = {"Note": this.pageSVG.getElementsByClassName("Note"), "Rest": this.pageSVG.getElementsByClassName("Rest")};
        this.parts = pageDatas[num];
        this.flag = false;
        this.state = [];
        this.onTick = (dt) => {this.tick(dt);};
    }

    play() {
        this.flag = false;

        for (let i = 0; i < this.parts.length; i++) {
            this.state[i] = this.buildME(this.parts[i], 0);
            this.state[i].style.fill = blue;
        }
        metronome.onTick = this.onTick;
    }

    tick(dt) {
        for (let i = 0; i < this.parts.length; i++) {
            let cur = this.state[i];
            cur.elapsed += dt;

            if (cur.elapsed > cur.dur) {
                cur.style.fill = "black";

                if (cur.next >= this.parts[i].length) {
                    console.log(this.flag);
                    if (!this.flag) {
                        this.flag = true;
                        metronome.onTick = null;
                        if (curPage == displayPage) {
                            next();
                        }
                        if (curPage + 1 < numPages) {
                            curPage++;
                            pagePlay();
                        } else {
                            curPage = 0;
                            isPlaying = false;
                            playButton.style.fill = gray;
                            playButton.style.stroke = gray;
                        }
                    }
                } else {
                    let next = this.buildME(this.parts[i], cur.next);
                    next.elapsed = cur.elapsed - cur.dur;
                    next.style.fill = blue;
                    this.state[i] = next;
                }
            }
        }
    }

    buildME(data, i) {
        let measureElement = data[i];
        let meStyle = this.svgArrays[measureElement.class][measureElement.index].style;
        let duration = measureElement.duration*1000;
        let next = i + 1;
        return {"style": meStyle, "dur": duration, "elapsed": 0, "next": next};
    }

    stop() {
        this.blackout();
    }

    blackout() {
        for (let x of this.state) {
            x.style.fill = "black";
        }
    }
}

class Metronome {
    constructor() {
        this.onTick = null;
        this.t0 = 0;
        this.int = 0;
        this.tickache = null;
    }

    tick() {
        let dt = Date.now() - this.t0;
        if (this.onTick != null) {
            this.onTick(dt);
        }
        this.t0 = Date.now();
    }

    start() {
        this.t0 = Date.now();
        this.int = window.setInterval(() => {this.tick();}, 50);
    }

    stop() {
        window.clearInterval(this.int);
    }

    pause() {
        this.tickache = this.onTick;
        this.onTick = (dt) => {
            this.tickache(dt);
            music.pause();
            window.clearInterval(this.int);
        }
    }

    resume() {
        this.t0 = Date.now();
        this.onTick = this.tickache;
        this.int = window.setInterval(() => {this.tick();}, 50);
    }
}
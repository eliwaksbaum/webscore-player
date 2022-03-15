var canvas; 
var sheets = [];
var music;

var svg_paths;
var display_page = 0;

var num_pages;
var pages_built = 0;
var parts;                  //a list of part objects, keys are the measure elements' starts and values are {style, pagenum}
var part_starts;            //a list of part lists, all of the measure elements' starts
var page_inits;            //page_inits[0][1] gives the style of the first measure element in the second part on the first page
var cur_page = 0;

var is_playing = false;
var is_paused = false;
var interval;

var play_button;
var pause_button;
var stop_button;

var cur_elements;
var blue = "#0643f9";
var gray = "#2e2e2e";

var panel_HTML = `
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
    let data = JSON.parse(json);
    num_pages = data.length;
    parts = new Array(data[0].length);          //data[0].length is number of parts, data.length is number of pages
        for (let i = 0; i < parts.length; parts[i++] = {});
    part_starts = new Array(data[0].length);
        for (let i = 0; i < part_starts.length; part_starts[i++] = []);
    page_inits = new Array(data.length);
        for (let i = 0; i < page_inits.length; page_inits[i++] = new Array(data[0].length));
    cur_elements = new Array(data[0].length);
    svg_paths = svgsrcs;

    canvas = document.getElementById("player");
    canvas.style.margin = "auto";

    let panel = document.createElement("div");
    panel.innerHTML = panel_HTML;
    panel.style.height = "fit-content";
    canvas.appendChild(panel);

    panelsvg = panel.getElementsByTagName("svg")[0];

    play_button = panelsvg.getElementById("play");
    panelsvg.getElementById("playbox").addEventListener("click", play);

    pause_button = panelsvg.getElementById("pause");
    panelsvg.getElementById("pausebox").addEventListener("click", pause);

    stop_button = panelsvg.getElementById("stop");
    stop_button.addEventListener("click", stop);

    panelsvg.getElementById("next").addEventListener("click", next);
    panelsvg.getElementById("prev").addEventListener("click", prev);

    let sheetHolder = document.createElement("div");
    sheetHolder.className = "holder";
    sheetHolder.style.background = "white";
    sheetHolder.style.border = "3px black solid";
    canvas.appendChild(sheetHolder);

    for (let i = 0; i < data.length; i++) {
        let sheet = document.createElement("object");
        sheet.setAttribute("data", svg_paths[i]);
        sheet.setAttribute("type", "image/svg+xml");
        sheet.className = "sheet";
        sheets.push(sheet);
        sheetHolder.appendChild(sheet);

        sheet.addEventListener("load", () => {buildPage(data, i)});
    }                                       //two passes let's all the pages pre-render i think, flipping without stutter
    for (let i = 1; i < data.length; i++) {
        sheets[i].style.display = "none";
    }

    music = document.createElement("audio");
    music.setAttribute("src", audiosrc);
    canvas.appendChild(music);

    let head = document.head || document.getElementsByTagName('head')[0];
    let style = document.createElement('style');
    style.innerHTML = `
        #playbox:hover, #pausebox:hover, #stop:hover, #prev:hover, #next:hover {
            cursor: pointer;
        }
        #player {
            width: min-content;
        }
        .sheet, .holder {
            height: 100vh;
        }
        @media(max-width: 600px)  {
            #player {width: 98%}
            .sheet, .holder {width: 98%; height: auto}
        }
    `
    head.appendChild(style);
}

function buildPage(data, page_num) {
    pages_built++;
    let page_data = data[page_num];
    let page_SVG = sheets[page_num].contentDocument.getElementsByTagName("svg")[0];
    let svg_arrays = {"Note": page_SVG.getElementsByClassName("Note"), "Rest": page_SVG.getElementsByClassName("Rest")};
    for (let i = 0; i < page_data.length; i++) {
        let part_data = page_data[i];
        let first = true;
        for (let measure_element of part_data) {                
            let style = svg_arrays[measure_element.class][measure_element.index].style;
            parts[i][measure_element.start] = {"style": style, "page": page_num};
            part_starts[i].push(measure_element.start);

            if (first) {
                first = false;
                page_inits[page_num][i] = {"style": style, "page": page_num};
            }
        }
    }

    if (pages_built == data.length) {
        for (let starts of part_starts) {
            starts.sort((a, b) => a - b);
        }
    }
}

function timeHash(time, starts) {
    let i_guess = innerHash(time, starts, 0, starts.length);
    if (i_guess == 0) {
        return 0;
    }

    let hi = starts[i_guess + 1];
    let mid = starts[i_guess];
    let lo = starts[i_guess - 1];

    if (time > hi) {
        return hi;
    }
    else if (time > mid) {
        return mid;
    }
    else {
        return lo;
    }
}

function innerHash(time, starts, lo, hi) {
    let mid = lo + Math.floor((hi-lo)/2)
    let guess = starts[mid];

    if (time == guess || hi <= lo) {
        return mid;
    }
    else if (time < guess) {
        return innerHash(time, starts, lo, mid - 1);
    }
    else {
        return innerHash(time, starts, mid + 1, hi);
    }
}

function getElementsFromTime(time) {
    let elements = new Array(parts.length);
    for (let i = 0; i < parts.length; i++) {
        let key = timeHash(time, part_starts[i]);
        elements[i] = parts[i][key];
    }
    return elements;
}

function colorElements(olds, news) {
    for (let old of olds) {
        old.style.fill = "black";
    }
    for (let nu of news) {
        nu.style.fill = blue;
    }
}

function tick() {
    let news = getElementsFromTime(music.currentTime);
    if (music.currentTime == music.duration) {
        over();
        return;
    }

    colorElements(cur_elements, news);
    cur_elements = news;

    if (news[0].page != cur_page && cur_page == display_page) {
        cur_page++;
        next();
    }
}

function over() {
    play_button.style.fill = gray;
    play_button.style.stroke = gray;
    window.clearInterval(interval);
    for (let e of cur_elements) {
        e.style.fill = "black";
    }
}

function play() {
    if (!is_playing) {
        play_button.style.fill = blue;
        play_button.style.stroke = blue;

        if (is_paused) {
            pause_button.style.fill = gray;
            pause_button.style.stroke = gray;

            is_paused = false;
        } else {
            if (display_page != cur_page) {
                sheets[cur_page].style.display = "block";
                sheets[display_page].style.display = "none";
                display_page = cur_page;
            }
            for (let i = 0; i < cur_elements.length; i++) {
                cur_elements[i] = page_inits[cur_page][i];
            }
        }

        is_playing = true;
        music.play();
        interval = window.setInterval(tick, 50);
    }
}

function stop() {
    music.pause();
    music.currentTime = 0;
    is_playing = false;
    is_paused = false;

    play_button.style.fill = gray;
    play_button.style.stroke = gray;
    pause_button.style.fill = gray;
    pause_button.style.stroke = gray;

    if (display_page != 0) {
        sheets[0].style.display = "block"
        sheets[display_page].style.display = "none";
    }
    cur_page = 0;
    display_page = 0;

    window.clearInterval(interval);
}

function pause() {
    if (is_playing && !is_paused) {
        play_button.style.fill = gray;
        play_button.style.stroke = gray;
        pause_button.style.fill = blue;
        pause_button.style.stroke = blue;

        is_playing = false;
        is_paused = true;
        window.clearInterval(interval);
        music.pause();
    }
}

function next() {
    if (display_page + 1 < num_pages) {
        sheets[display_page].style.display = "none";
        display_page++;
        sheets[display_page].style.display = "block";
    }
}
function prev() {
    if (display_page - 1 >= 0) {
        sheets[display_page].style.display = "none";
        display_page--;
        sheets[display_page].style.display = "block";
    }
}
from music21 import *
import json
import sys

def parse(score):
    page_streams = layout.divideByPages(score).pages
    
    tempos = getTempos(page_streams)
    
    pages = []
    time = 0
    for page in page_streams:
        pt = getParts(page, tempos, time)
        parts = pt[0]
        time = pt[1]
        pages.append(parts)

    return pages

def getTempos(pages):
    tempos = []

    for page in pages:
        number = page.pageNumber
        parts = page.getElementsByClass(stream.Part)

        for i, measure in enumerate(parts[0].getElementsByClass(stream.Measure)):
            for mark in measure.getElementsByClass(tempo.MetronomeMark):
                mb = {"metronome": mark, "beat": (number, i, mark.beat)}
                tempos.append(mb)

    return tempos

def getParts(page, tempos, start_time):
    page_parts = page.getElementsByClass(stream.Part)
    parts = []
    cur_note = 0
    cur_rest = 0
    end = 0

    for i in range(len(page_parts) - 1, -1, -1):
        part = page_parts[i]
        cur_tempo_index = 0
        cur_tempo = tempos[0]
        untimed_part = []

        measure_streams = part.getElementsByClass(stream.Measure)
        for i, ms in enumerate(measure_streams):
            measure = []
            for me in ms.notesAndRests:
                measure_element = {}

                beat = (page.pageNumber, i, me.beat)
                if cur_tempo_index + 1 < len(tempos):
                    if beat >= tempos[cur_tempo_index + 1]["beat"] and beat != 0.1:
                        cur_tempo_index += 1
                        cur_tempo = tempos[cur_tempo_index]

                ql = me.duration.quarterLength
                duration = cur_tempo["metronome"].durationToSeconds(ql)
                measure_element["duration"] = duration

                if me.isNote:
                    index = cur_note
                    cur_note += 1
                    measure_element["class"] = "Note"
                else:
                    index = cur_rest
                    cur_rest +=1
                    measure_element["class"] = "Rest"
                measure_element["index"] = index
            
                measure.append(measure_element)

            untimed_part.append(measure)
            
        measure_map = repeat.Expander(part).measureMap()
        je = setStarts(untimed_part, measure_map, start_time)
        js_part = je[0]
        end = je[1]
        parts.append(js_part)

    return (parts, end)

def setStarts(measures, map, start):
    part = []
    cur_time = start

    print(map)

    for i in map:
        for me in measures[i]:
            jsme = {"start": cur_time, "index": me["index"], "class": me["class"]}
            cur_time += me["duration"]
            part.append(jsme)

    last_end = cur_time + measures[map[-1]][-1]["duration"]
    return (part, last_end)

score = converter.parse(sys.argv[1])
pages = parse(score)

name = sys.argv[1].split(".")[-2]
with open(name + ".json", "w") as file:
    json.dump(pages, file)
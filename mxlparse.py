from music21 import *
import json
import sys

def parse(score):
    page_streams = layout.divideByPages(score).pages
    
    tempos = getTempos(page_streams)
    
    pages = []
    time = 0
    tempo = 0
    for page in page_streams:
        ptt = getParts(page, tempos, time, tempo)
        parts = ptt[0]
        time = ptt[1]
        tempo = ptt[2]
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

def getParts(page, tempos, start_time, start_tempo):
    page_parts = page.getElementsByClass(stream.Part)
    parts = []
    cur_note = 0
    cur_rest = 0
    end_time = 0
    end_tempo = 0

    for i in range(len(page_parts) - 1, -1, -1):
        part = page_parts[i]
        cur_tempo_index = start_tempo
        cur_tempo = tempos[cur_tempo_index]
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
        end_time = je[1]
        end_tempo = cur_tempo_index
        parts.append(js_part)

    return (parts, end_time, end_tempo)

def setStarts(measures, map, start):
    part = []
    cur_time = start

    for i in map:
        for me in measures[i]:
            jsme = {"start": cur_time, "index": me["index"], "class": me["class"]}
            cur_time += me["duration"]
            part.append(jsme)

    return (part, cur_time)

score = converter.parse(sys.argv[1])
pages = parse(score)

name = sys.argv[1].split(".")[-2]
with open(name + ".json", "w") as file:
    json.dump(pages, file)
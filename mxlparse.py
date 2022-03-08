from music21 import *
import json
import sys

def parse(score):
    pageStreams = layout.divideByPages(score).pages
    
    tempos = getTempos(pageStreams)
    
    pages = []
    for page in pageStreams:
        parts = getParts(page, tempos)
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

def getParts(page, tempos):
    pageParts = page.getElementsByClass(stream.Part)
    parts = []
    curNote = 0
    curRest = 0

    for i in range(len(pageParts) - 1, -1, -1):
        part = pageParts[i]
        curTempoIndex = 0
        curTempo = tempos[0]

        measureStreams = part.getElementsByClass(stream.Measure)
        measures = []
        for i, measureStream in enumerate(measureStreams):
            
            measure = []
            for me in measureStream.notesAndRests:
                measureElement = {}

                beat = (page.pageNumber, i, me.beat)
                if curTempoIndex + 1 < len(tempos):
                    if beat >= tempos[curTempoIndex + 1]["beat"] and beat != 0.1:
                        curTempoIndex += 1
                        curTempo = tempos[curTempoIndex]

                ql = me.duration.quarterLength
                measureElement["duration"] = curTempo["metronome"].durationToSeconds(ql)

                if me.isNote:
                    index = curNote
                    curNote += 1
                    measureElement["class"] = "Note"
                else:
                    index = curRest
                    curRest +=1
                    measureElement["class"] = "Rest"
                measureElement["index"] = index
            
                measure.append(measureElement)
        
            measures.append(measure)

        partJStream = []

        exPart = repeat.Expander(part)
        for i in exPart.measureMap():
            partJStream.extend(measures[i])
            
        parts.append(partJStream)

    return parts

score = converter.parse(sys.argv[1])
pages = parse(score)

name = sys.argv[1].split(".")[-2]
with open(name + ".json", "w") as file:
    json.dump(pages, file)
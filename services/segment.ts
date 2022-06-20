import { Duration } from "dayjs/plugin/duration";
import $ from "jquery";
import { Run } from "./run";
import { SegmentAttempt } from "./segment-attempt";

export class Segment {
    name: string = "";
    gameName: string = "";
    categoryName: string = "";
    useIgt: boolean = false;
    bestRta: Duration | null = null;
    bestIgt: Duration | null = null;
    pbRta: Duration | null = null;
    pbIgt: Duration | null = null;
    attemptsElem: JQuery<HTMLElement>;
    historyElem: JQuery<HTMLElement>;
    history: SegmentAttempt[] | null = null;

    static FromXML(elem: JQuery): Segment {
        const segmentNameElem = elem.children("Name");
        if (segmentNameElem.length === 0) {
            throw new Error("No segment name element");
        }

        const segment = new Segment();

        segment.name = segmentNameElem.text();
        segment.historyElem = elem.children("SegmentHistory");
        segment.gameName = segment.historyElem.closest("Run")
            .children("GameName").text().trim();
        segment.categoryName = segment.historyElem.closest("Run")
            .children("CategoryName").text().trim();

        const best = elem.children("BestSegmentTime");
        const bestRealTimeElem = best.children("RealTime");
        if (bestRealTimeElem.length > 0) {
            segment.bestRta = dayjs.duration(bestRealTimeElem.text());
        }

        const bestGameTimeElem = best.children("GameTime");
        if (bestGameTimeElem.length > 0) {
            segment.bestIgt = dayjs.duration(bestGameTimeElem.text());
        }

        //PB segment
        const pbElem = elem.find('SplitTime[name="Personal Best"]');
        const previous = elem.prev();
        if (previous.length > 0 ) {
            const previousT = previous.find('SplitTime[name="Personal Best"]');
            let currSplit, prevSplit;
            if (previousT.children("RealTime").length > 0) {
                prevSplit = dayjs.duration(previousT.children("RealTime").text());
                currSplit = dayjs.duration(pbElem.children("RealTime").text());
                currSplit.subtract(prevSplit);
                segment.pbRta = dayjs.duration(currSplit.asMilliseconds());
            }
            if (previousT.children("GameTime").length > 0) {
                prevSplit = dayjs.duration(previousT.children("GameTime").text());
                currSplit = dayjs.duration(pbElem.children("GameTime").text());
                currSplit.subtract(prevSplit);
                segment.pbIgt = dayjs.duration(currSplit.asMilliseconds());
            }
        } else {
            if (pbElem.children("RealTime").length > 0)
                segment.pbRta = dayjs.duration(pbElem.children("RealTime").text());
            if (pbElem.children("GameTime").length > 0)
                segment.pbIgt = dayjs.duration(pbElem.children("GameTime").text());
        }

        segment.useIgt = segment.pbIgt !== null;

        //if PB is shorter than stored best then PB is best
        if (segment.pbRta !== null) {
            if (segment.bestRta === null || (segment.pbRta.asMilliseconds() < segment.bestRta.asMilliseconds()))
                segment.bestRta = dayjs.duration(segment.pbRta.asMilliseconds());
        }
        if (segment.pbIgt !== null) {
            if (segment.bestIgt === null || segment.pbIgt.asMilliseconds() < segment.bestIgt.asMilliseconds())
                segment.bestIgt = dayjs.duration(segment.pbIgt.asMilliseconds());
        }

        return segment;
    }

    static ArrayFromXML(str: string): Segment[] {
        const xmlDoc = $.parseXML(str);
        const $doc = $(xmlDoc);

        const $segmentsElem = $doc.find("Segments");
        if ($segmentsElem && $segmentsElem.length <= 0)
            return [];

        const attemptsElem = $doc.find("AttemptHistory").children("Attempt[started]");
        if (attemptsElem.length > 1000)
            attemptsElem.slice(attemptsElem.length - 1000, attemptsElem.length);

        const segments: Segment[] = [];
        $segmentsElem.children("Segment").each(function(i) {
            const segment = Segment.FromXML($(this));
            if (segment) {
                segment.attemptsElem = attemptsElem;
                segments.push(segment);
            }
        });
        return segments;
    }

    getHistory(max: number) {
        const funcStart = performance.now();
        if (this.history !== null) {
            console.log("Run Highlighter: returned cached history");
            return this.history;
        }

        console.log("Run Highlighter: parsing segment history...");

        max = max || 25;
        const history: SegmentAttempt[] = [];
        let foundBest = false;
        let foundPb = false;

        const segment = this;
        const elems = this.historyElem.children();
        for (let i = elems.length - 1; i >= 0; i--) {
            if ($(elems[i]).children().length === 0)
                continue;

            const id = $(elems[i]).attr("id");
            const attemptElem = segment.attemptsElem.filter('#' + id);
            if (attemptElem.length === 0)
                continue;

            const attempt = Run.FromXML(attemptElem);
            const segAttempt = SegmentAttempt.FromAttempt(segment, attempt);
            if (segAttempt === null)
                continue;

            if (segAttempt.isPb)
                foundPb = true;

            if (segAttempt.isBest) {
                history.unshift(segAttempt);
                foundBest = true;
            }
            else if (history.length < max) {
                history.push(segAttempt);
            }

            if (history.length >= max
                && ((foundBest === true && foundPb === true)
                || dayjs.duration(dayjs().diff(attempt.ended)).asDays() > 30)) {
                console.log("Run Highlighter: Stopped traversing segment history after " + (elems.length - i) + " entries");
                break;
            }
        }

        this.history = history;
        console.log("Run Highlighter: getHistory() took " + (performance.now() - funcStart).toFixed(0) + "ms");
        return history;
    }
}
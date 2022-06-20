import { Segment } from "./segment";
import { Run } from "./run";
import $ from "jquery";
import { Duration } from "dayjs/plugin/duration";

export class SegmentAttempt {
    attempt: Run;
    segment: Segment;
    rta: Duration;
    igt: Duration | null = null;
    isBest: boolean = false;
    isPb: boolean = false;

    static FromAttempt(segment: Segment, attempt: Run): SegmentAttempt | null {
        const elem = segment.historyElem.children('#' + attempt.id);
        if (elem.children().length === 0)
            return null;

        const segAttempt = new SegmentAttempt();
        segAttempt.attempt = attempt;
        segAttempt.segment = segment;

        const realTimeElem = elem.children("RealTime");
        if (realTimeElem.length <= 0) {
            return null;
        }

        segAttempt.rta = dayjs.duration(realTimeElem.text());
        
        const gameTimeElem = elem.children("GameTime");
        if (gameTimeElem.length > 0) {
            segAttempt.igt = dayjs.duration(gameTimeElem.text());
        }

        if (segment.useIgt === true && segAttempt.igt !== null) {
            segAttempt.isBest = segment.bestIgt !== null
                && segment.bestIgt.asMilliseconds() === segAttempt.igt.asMilliseconds();
            segAttempt.isPb = segment.pbIgt !== null
                && segment.pbIgt.asMilliseconds() === segAttempt.igt.asMilliseconds();
        } else {
            segAttempt.isBest = segment.bestRta !== null
                && segAttempt.rta.asMilliseconds() === segment.bestRta.asMilliseconds();
            segAttempt.isPb = segment.pbRta !== null
                && segment.pbRta.asMilliseconds() === segAttempt.rta.asMilliseconds();
        }

        return segAttempt;
    }

    ToRun(): Run | null {
        const run = new Run("segment");

        const timeUntilSeg = this.TimeUntil();
        if (timeUntilSeg === null)
            return null;

        run.started = this.attempt.started?.add(timeUntilSeg) ?? null;
        run.ended = run.started?.add(this.rta) ?? null;
        run.isStartedSynced = this.attempt.isStartedSynced;
        run.isEndedSynced = this.attempt.isEndedSynced;
        run.rta = this.rta;
        run.igt = this.igt;
        run.gameName = this.segment.gameName;
        run.categoryName = this.segment.categoryName;
        run.segmentName = this.segment.name;

        return run;
    }

    TimeUntil(): Duration | null {
        const root = this.segment.historyElem.closest("Run");
        let time: Duration | null = null;

        const segAttempt = this;
        root.find("Segments").children("Segment").each(function() {
            const elem = $(this);

            const timeElem = elem.children("SegmentHistory").children('#' + segAttempt.attempt.id);
            if (timeElem.length <= 0 || timeElem.children("RealTime").length <= 0) {
                time = null;
                return false;
            }

            if (time === null)
                time = dayjs.duration(0);
            if (elem.children("Name").text() === segAttempt.segment.name)
                return false;
            time.add(dayjs.duration(timeElem.children("RealTime").text()));
        });
        return time;
    }
}

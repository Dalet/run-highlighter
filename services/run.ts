import { Dayjs } from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import $ from "jquery";

type RunType = "run" | "segment";

export class Run {
    type: RunType;
    id: string | null;
    started: Dayjs;
    ended: Dayjs;
    isStartedSynced: boolean = false;
    isEndedSynced: boolean = false;
    rta: Duration | null = null;
    igt: Duration | null = null;
    gameName = "";
    categoryName = "";
    segmentName = "";

    constructor(type?: RunType) {
        this.type = type ?? "run";
    }

    static FromXML = function(elem: JQuery): Run {
        const run = new Run();
        run.id = elem.attr("id") ?? null;
    
        const startedAttr = elem.attr("started");
        if (!startedAttr) {
            // older versions of LiveSplit did not have this and it's impossible to work without it
            throw new Error("Run element has no 'started' attribute");
        }
        const endedAttr = elem.attr("ended");
        if (!endedAttr) {
            throw new Error("Run element has no 'ended' attribute");
        }

        run.started = dayjs(startedAttr, ["MM-DD-YYYY HH:mm:ss", "DD-MM-YYYY HH:mm:ss"]).utc(true);
        run.ended = dayjs(endedAttr, ["MM-DD-YYYY HH:mm:ss", "DD-MM-YYYY HH:mm:ss"]).utc(true); 
    
        run.isStartedSynced = elem.attr("isStartedSynced")?.toLowerCase() === 'true';
        run.isEndedSynced = elem.attr("isEndedSynced")?.toLowerCase() === 'true';
    
        const realTimeElem = elem.children("RealTime");
        if (realTimeElem.length > 0) {
            run.rta = dayjs.duration(realTimeElem.text());
        }
    
        const gameTimeElem = elem.children("GameTime");
        if (gameTimeElem.length > 0) {
            run.igt = dayjs.duration(gameTimeElem.text());
        }
    
        run.gameName = elem.closest("Run").children("GameName")?.text().trim() ?? "";
        run.categoryName = elem.closest("Run").children("CategoryName")?.text().trim() ?? "";
    
        return run;
    };

    static ArrayFromXML(str: string, max?: number): Run[] {
        max = max || 20;
    
        const xmlDoc = $.parseXML(str);
        const $doc = $(xmlDoc);
    
        const $attemptsElem = $doc.find("AttemptHistory");
        if ($attemptsElem && $attemptsElem.length <= 0) { // no history
            return [];
        }
    
        const attempts: Run[] = [];
        const elems = $attemptsElem.children("Attempt[started]:has(RealTime)");

        // parse only the last attempts
        for (let i = elems.length - 1; i >= 0; i--) {
            try {
                const attempt = Run.FromXML($(elems[i]));
                attempts.push(attempt);
            } catch (e) {
                console.log(`Could not parse run ${i+1}`, e);
            }

            if (attempts.length >= max)
                break;
        }
        return attempts;
    }

    getTitle(): string {
        const useIgt =  this.igt !== null;
        const time = useIgt ? this.igt! : this.rta;
        let timeStr = format_time(time!.asSeconds());
        if (useIgt) {
            timeStr += " IGT (" + format_time(this.rta!.asSeconds()) + " RTA)";
        }
        let catStr = " ";
    
        if (this.type === "segment") {
            if (this.categoryName.length > 0)
                catStr = " (" + this.categoryName + ") ";
            return this.gameName + catStr + "- " + this.segmentName + " in " + timeStr;
        } else {
            if (this.categoryName.length > 0)
                catStr = " " + this.categoryName + " ";
            return this.gameName + catStr + "speedrun in " + timeStr;
        }
    };
}
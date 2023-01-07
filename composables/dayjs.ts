import dayjs from 'dayjs';

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(duration);
dayjs.extend(utc);

// add parsing for "00:12:34.123" and "1d5h3m4s" format durations
function DurationParser(option, dayjsClass, dayjsFactory) {
    const oldDuration = dayjsFactory.duration;

    dayjsFactory.duration = function() {
        if (arguments.length == 0 || typeof arguments[0] !== "string") {
            return oldDuration.apply(this, arguments);
        }

        const str = <string>arguments[0];
        const regexes = [
            /^(?:(?:(?<hours>\d{2}):)?(?<minutes>\d{2})?:)?(?<seconds>\d{2})(?:.(?<milliseconds>\d{1,3}))?/,
            /(?:(?<days>\d+)d)?(?:(?<hours>\d+)h)?(?:(?<minutes>\d+)m)?(?:(?<seconds>\d+)s)/i
        ];
        for (const regex of regexes) {
            const match: any = str.match(regex)
            if (match !== null) {
                const { groups: { days, hours, minutes, seconds, milliseconds } } = match;
                return dayjs.duration({
                    days: parseInt(days ?? "0"),
                    hours: parseInt(hours ?? "0"),
                    minutes: parseInt(minutes ?? "0"),
                    seconds: parseInt(seconds ?? "0"),
                    milliseconds: parseInt(milliseconds ?? "0")
                });
            }
        }

        return oldDuration.apply(this, arguments);
    }
}
dayjs.extend(DurationParser); 

export default dayjs;
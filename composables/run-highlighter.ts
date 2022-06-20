import $ from "jquery";
import { Run } from "~~/services/run";
import { twitchApi, getHighlighterLink, TwitchVideo } from "~~/services/twitch-api";
import { useTwitchAuthStore, doApiCall } from "~~/store/auth/twitch";
const _buffer_default = 7;
const _truncate_default = false;
const _fullRunTitle_default = "$game $category speedrun in $gametime [ifNotIGT]RTA[/ifNotIGT][ifIGT]IGT ($realtime RTA)[/ifIGT]";
const _segmentTitle_default = "$game $category - $segment in $gametime [ifNotIGT]RTA[/ifNotIGT][ifIGT]IGT ($realtime RTA)[/ifIGT]";
const _description_default = "";

export function getSplitsFileImage(data: string): string | null {
    const xmlDoc = $.parseXML(data);
    const $doc = $(xmlDoc);

    const cdata = $doc.find("GameIcon").text();
    if (!cdata) {
        return null;
    }

    // the following code is ported from livesplit-core:
    // https://github.com/LiveSplit/livesplit-core/blob/244ce30de12a554d285e7fcb9eb6954d16654093/src/run/parser/livesplit.rs#L129
    let bytes = new TextEncoder().encode(cdata);
    if (bytes.length < 216) {
        return null;
    } 
    bytes = bytes.slice(212);

    const base64 = new TextDecoder().decode(bytes);
    const imageBytes = window.atob(base64).slice(2, -1);
    return imageBytes;
}

export interface Highlight {
    run: Run;
    getThumbnailUrl: (width?: number, height?: number) => string;
    getTitle: () => string;
    getDescription: () => string;
    description: string;
    start_time: number;
    end_time: number;
    link: string;
    duration: number;
    videoTitle: string;
    part: HighlightPart;
    getPrefilledHighlighterLink: () => string;
}
export const RunHighlighter = {
    settings: {
        buffer: _buffer_default,
        truncate: _truncate_default,
        fullRunTitle: _fullRunTitle_default,
        segmentTitle: _segmentTitle_default,
        description: _description_default,
    },

    _videosToHighlights: function (channel: string, videos, run: Run): Highlight[] {
        const highlights: Highlight[] = [];
        for (let i = videos.length - 1; i >= 0; --i) {
            highlights.push(this._videoToHighlight(channel, videos[i], run, i));
        }
        return highlights;
    },
};

export async function searchRun(run: Run, abortSignal: AbortSignal, username?: string): Promise<Highlight[]> {
    const highlights: Highlight[] = [];

    await doApiCall(async () => {
        for await (const videoPage of twitchApi.iterateVideos({ abortSignal, username, limit: 50 })) {
            for (const video of videoPage) {
                if (run.started.isSameOrAfter(dayjs(video?.created_at).utc(true))) {
                    return highlights; // no need to keep looking because videos are sorted by creation date
                }

                const part = getVideoPart(video, run);
                if (part == null) {
                    continue;
                }

                const highlight = videoToHighlight(video, run);
                highlights.push(highlight);

                if (part == "full" || part == "last") {
                    return highlights;
                }
            }

        }
    });

    return highlights;
}

function videoToHighlight(video: TwitchVideo, run: Run): Highlight {
    const part: HighlightPart = getVideoPart(video, run)!;
    const recorded_at = dayjs(video.created_at);
    const videoLength = dayjs.duration(video.duration).asSeconds();

    let start_time = 0;
    if (part === "full" || part == "first") {
        start_time = Math.floor(run.started.diff(recorded_at) / 1000);
        start_time -= RunHighlighter.settings.buffer;
    }

    let end_time = Math.floor(videoLength);
    if (part === "full" || part === "last") {
        end_time = Math.floor(run.ended.diff(recorded_at) / 1000);
        end_time += RunHighlighter.settings.buffer;
    }

    if (start_time < 0) start_time = 0;
    if (end_time > Math.floor(videoLength)) end_time = Math.floor(videoLength);

    const duration = run.ended.diff(run.started) / 1000;
    const link = getHighlighterLink(video);
    const description = formatText(RunHighlighter.settings.description, run);

    return {
        run: run,
        videoTitle: video.title,
        getThumbnailUrl: (width, height) => {
            if (width == null && height == null) {
                height = 100;
            }

            if (width == null && height != null) {
                width = Math.ceil(height * (16/9));
            } else if (width != null && height == null) {
                height = Math.ceil(width / (16/9));
            }
            return video.thumbnail_url
                .replace("%{width}", width!.toString())
                .replace("%{height}", height!.toString());
        },
        getTitle: function() {
            let format = this.run.type === "segment"
                ? RunHighlighter.settings.segmentTitle
                : RunHighlighter.settings.fullRunTitle;
            return formatText(format, this.run);
        },
        getDescription: function() {
            return formatText(RunHighlighter.settings.description, this.run);
        },
        description: description,
        start_time: start_time,
        end_time: end_time,
        link: link,
        duration: duration,
        part: part,
        getPrefilledHighlighterLink: function() {
            let title = this.getTitle();
            title = title.length > 0
                ? "&title=" + encodeURIComponent(title)
                : "";

            // let desc = this.getDescription();
            // desc = desc.length > 0
            //     ? "&desc=" + encodeURIComponent(window.btoa(desc))
            //     : "";

            return this.link + "?start=" + this.start_time
                + "&end=" + this.end_time
                + title;
        }
    };
}

export type HighlightPart = "full" | "first" | "middle" | "last";
function getVideoPart(video: TwitchVideo, run: Run): HighlightPart | null {
    var vidStart = dayjs(video.created_at);
    var vidEnd = vidStart.add(dayjs.duration(video.duration));

    if (vidStart.isSameOrBefore(run.started) && vidEnd.isSameOrAfter(run.ended))
        return "full";
    else if (vidStart.isAfter(run.started) && vidEnd.isBefore(run.ended))
        return "middle";
    else if (vidStart.isAfter(run.started) && vidStart.isBefore(run.ended)
        && vidEnd.isSameOrAfter(run.ended))
        return "last";
    else if (vidStart.isSameOrBefore(run.started) && vidEnd.isAfter(run.started))
        return "first";
    else
        return null;
}

export function format_time(seconds: number, decimals?: number) {
    decimals = decimals || 0;
    let secondsStr: number | string = seconds;

    let hours: number | string = Math.floor(secondsStr / 3600);
    if (hours > 0) {
        secondsStr -= hours * 3600;
        hours = hours + ":";
    }
    else
        hours = "";

    let minutes: any = Math.floor(secondsStr / 60);
    secondsStr -= minutes * 60;
    if (hours !== "" && minutes < 10)
        minutes = "0" + minutes;

    secondsStr = RunHighlighter.settings.truncate && decimals == 0
        ? Math.floor(secondsStr)
        : secondsStr.toFixed(decimals);

    if (secondsStr < 10)
        secondsStr = "0" + secondsStr;

    return hours + minutes + ":" + secondsStr;
};

function formatText(raw: string, run: Run) {
    if (raw === undefined || raw === null)
        throw "raw param is undefined";

    if (!run)
        throw "run param is undefined";

    const useIgt = run.igt !== null && run.rta?.asMilliseconds() !== run.igt.asMilliseconds();
    const ifIGTregex = /\[ifIGT\](.*?)\[\/ifIGT\]/;
    let match;
    while ((match = ifIGTregex.exec(raw)) !== null) {
        if (useIgt) {
            raw = raw.replace("[ifIGT]", "");
            raw = raw.replace("[/ifIGT]", "");
        } else
            raw = raw.replace(match[0], "");
    }

    const ifNotIGTregex = /\[ifNotIGT\](.*?)\[\/ifNotIGT\]/;
    while ((match = ifNotIGTregex.exec(raw)) !== null) {
        if (!useIgt) {
            raw = raw.replace("[ifNotIGT]", "");
            raw = raw.replace("[/ifNotIGT]", "");
        } else
            raw = raw.replace(match[0], "");
    }

    const rtStr = format_time(run.rta!.asSeconds());
    const gtStr = useIgt
        ? format_time(run.igt!.asSeconds())
        : rtStr;

    const segmentName = run.type === "segment"
        ? run.segmentName
        : "";

    const localEnded = run.ended.local();
    const endDay = localEnded.format("DD");
    const endMonth = localEnded.format("MM");
    const endYear = localEnded.format("YYYY");

    const keywords = {
        "$realtime": rtStr,
        "$gametime": gtStr,
        "$day": endDay,
        "$month": endMonth,
        "$year": endYear,
        "$game": run.gameName,
        "$category": run.categoryName,
        "$segment": segmentName
    };

    const escapeRegExp = function(unescapedRegExp) {
        return unescapedRegExp.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    for (let key in keywords) {
        raw = raw.replace(new RegExp(escapeRegExp(key), 'g'), keywords[key]);
    }

    return raw;
}

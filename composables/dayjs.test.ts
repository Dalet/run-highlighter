import dayjs from "./dayjs"
import { expect, test } from "vitest";

test.each([
    ["42h59m59s", dayjs.duration({ hours: 42, minutes: 59, seconds: 59})],
    ["48m57s", dayjs.duration({minutes: 48, seconds: 57})],
    ["99:12:34.123", dayjs.duration({hours: 99, minutes: 12, seconds: 34, milliseconds: 123})],
    ["00:02:34.1235679", dayjs.duration({minutes: 2, seconds: 34, milliseconds: 123})]
])("should parse %s correctly", (str, expectedDuration) => {
    const duration = dayjs.duration(str).asMilliseconds();
    expect(duration).toBe(expectedDuration.asMilliseconds());
});

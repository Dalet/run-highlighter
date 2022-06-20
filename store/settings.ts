import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

const buffer_default = 7;
const truncate_default = false;
const fullRunTitle_default = "$game $category speedrun in $gametime [ifNotIGT]RTA[/ifNotIGT][ifIGT]IGT ($realtime RTA)[/ifIGT]";
const segmentTitle_default = "$game $category - $segment in $gametime [ifNotIGT]RTA[/ifNotIGT][ifIGT]IGT ($realtime RTA)[/ifIGT]";
const description_default = "";

interface AppSettings {
    buffer: number;
    truncate: boolean;
    fullRunTitle: string;
    segmentTitle: string;
    description: string;
}

const createDefaultSettings = (): AppSettings => ({
    buffer: buffer_default,
    truncate: truncate_default,
    fullRunTitle: fullRunTitle_default,
    segmentTitle: segmentTitle_default,
    description: description_default
})

const key = "appSettings";
export const useAppSettingsStore = defineStore(key, {
    state: () => useStorage(key, createDefaultSettings()),
});
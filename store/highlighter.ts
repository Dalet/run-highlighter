import { defineStore } from "pinia";
import { Run } from "~~/services/run";
import { Segment } from "~~/services/segment";

const key = "highlighter";

interface HighlighterState {
    channel: string;
    file: File | null;
    selectedRun: Run | null;
    game: {
        name?: string;
        category?: string;
        icon?: string;
        runs?: Run[];
        segments?: Segment[]
    }
}

let demoFileMetadata: {} | null = null;
const isDemoFile = (file: File | null) => file && demoFileMetadata
    && Object.keys(demoFileMetadata)
        .every(key => file[<keyof typeof file>key] === demoFileMetadata![<keyof typeof demoFileMetadata>key]);

async function getDemoFile() {
    const response = await fetch(appLink("demo-splits.lss"));
    const blob = await response.blob();
    const file = new File([blob], "demo-splits.lss", {
        lastModified: new Date(2000, 1, 1).getTime(),
        type: blob.type
    });
    demoFileMetadata = { name: file.name, type: file.type, size: file.size, lastModified: file.lastModified };
    return file;
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const useHighlighterStore = defineStore(key, {
    state: () => ({
        channel: "",
        file: null,
        selectedRun: null,
        game: {}
    } as HighlighterState),
    getters: {
        isDemoMode: state => isDemoFile(state.file)
    },
    actions: {
        async enableDemoMode() {
            this.file = await getDemoFile();
        },

        resetSelection() {
            this.$patch({
                file: null,
                selectedRun: null,
                game: {}
            });
        },

        async loadFile(file: File) {
            const data = await readFile(file);
            const statePatch: Pick<HighlighterState, "game"> = {
                game: {}
            };

            // full game runs
            try {
                const parsedRuns = Run.ArrayFromXML(data);
                statePatch.game.runs = parsedRuns;
                if (statePatch.game.runs.length > 0) {
                    const firstRun = parsedRuns[0];
                    statePatch.game.name = firstRun.gameName;
                    statePatch.game.category = firstRun.categoryName;
                }
            } catch (e) {
                console.error(`Could not parse file '${file.name}'`, e);
                return;
            }

            // segments
            try {
                const parsedSegments = Segment.ArrayFromXML(data);
                statePatch.game.segments = parsedSegments;
            } catch (e) {
                console.warn(`No segments in file '${file.name}'`, e);
            }

            // game icon
            try {
                const image = getSplitsFileImage(data);
                if (image) {
                    statePatch.game.icon = "data:;base64," + window.btoa(image);
                }
            } catch (e) {
                console.warn("Could not load splits icon", e);
            }

            this.$patch(statePatch);
        }
    }
});
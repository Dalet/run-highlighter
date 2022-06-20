<script setup lang="ts">
import { Highlight } from '~~/composables/run-highlighter';
import { useAuthStore } from '~~/store/auth';
import { useHighlighterStore } from '~~/store/highlighter';

definePageMeta({
    middleware: ["auth"]
});

const state = useHighlighterStore();

const isLoading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const isParsing = ref(false);
const highlights = ref<Highlight[] | null>(null);
const error = ref<Error | null>(null);
const demoModalVisible = ref(false);

let abortController = new AbortController();

function openFileSelector() {
    fileInput.value?.click();
}

function resetFileSelection() {
    state.selectedRun = null;
    state.game = {};
}

const fileParsed = computed(() => state.game.runs && state.game.segments);

async function enableDemoMode(event: Event) {
    event.preventDefault();
    (event.target as HTMLElement).blur();
    state.enableDemoMode();
}

// file input event handler
async function fileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const hasFile = input?.files?.length ?? 0 > 0;
    state.file = hasFile ? input.files![0] : null;
}

// parse on file change
watch(() => state.file, async (file) => {
    try {
        resetFileSelection();
        if (!file) {
            return;
        }

        isParsing.value = true;
        await state.loadFile(file);
    } finally {
        isParsing.value = false;
    }
});

const authStore = useAuthStore();

async function submitted() {
    if (state.selectedRun == null) {
        return;
    }
    if (useAuthStore().isDemoMode) {
        demoModalVisible.value = true;
        return;
    }
    
    isLoading.value = true;
    abortController = new AbortController();
    
    try {
        highlights.value = await searchRun(state.selectedRun, abortController.signal, state.channel);
    } catch (e) {
        if (!abortController.signal.aborted) {
            error.value = e; 
        }
    } finally {
        isLoading.value = false;
    }
}

const fileText = computed(() => {
    if (!state.file?.name) {
        return "No file selected.";
    }

    let gameInfoText = "";
    if (state.game.name) {
        gameInfoText = ` - ${state.game.name}`;
        if (state.game.category) {
            gameInfoText += ` (${state.game.category})`;
        }
    }

    return state.file.name + gameInfoText;
});

watch(() => state.selectedRun, () => {
    abortController.abort();
    highlights.value = null;
    isLoading.value = false;
    error.value = null;
});
</script>

<template>
<i-container>
    <i-form @submit="submitted">
        <i-form-group>
            <i-form-label>Channel:</i-form-label>
            <i-input v-model="state.channel" clearable placeholder="Twitch Username" required></i-input>
        </i-form-group>

        <i-form-group>
            <i-form-label>
                Splits file (<a href="https://livesplit.org/" target="_blank">LiveSplit</a> only):
            </i-form-label>
            <a href="#" v-if="!isParsing && !fileParsed" class="_float:right _font-size:sm _vertical-align:bottom"
                @click="enableDemoMode">Use demo splits</a>
            <input ref="fileInput" type="file" @change="fileChange" style="display:none" accept=".lss"/> 

            <i-input :placeholder="fileText" @click.prevent="e => e.target.blur()" :plaintext="true">
                <template #prepend>
                    <i-button type="button" @click="openFileSelector" :loading="isParsing">
                        Select file
                        <template #loading>
                            <i-loader class="_margin-right:1/2" />
                            Parsing... 
                        </template>
                    </i-button>
                </template>
                <template #suffix v-if="state.game.icon">
                    <img :src="state.game.icon" alt="Game icon" style="max-height:40px; object-fit:contain;"/>
                </template>
            </i-input>
            <div class="_margin:2/3"></div>
        </i-form-group>
        
        <template v-if="fileParsed">
            <i-form-group class="_margin-bottom:2">
                <run-selection
                    :selectedRun="state.selectedRun"
                    @update:selectedRun="value => state.selectedRun = value"
                    :runs="state.game.runs!"
                    :segments="state.game.segments!">
                </run-selection>
            </i-form-group>

            <i-form-group v-if="!error && !highlights" class="_display:flex  _justify-content:center">
                <i-button color="primary" type="submit" :loading="isLoading">
                    Search
                    <template #loading>
                        <i-loader class="_margin-right:1/2" />
                        Searching...
                    </template>
                </i-button>
            </i-form-group>
        </template>

        <highlighter-results v-if="highlights && highlights.length > 0" :highlights="highlights" />

        <div class="message-container">
            <i-card v-if="highlights && highlights.length == 0" class="highlight-notfound" color="warning">
                <template #header><span class="card-header">Not found</span></template>
                <p>The run was not found in the archives of this channel.<br/>
                    The video archive may have expired.
                </p>
            </i-card>
            <i-card v-if="error" color="danger">
                An unexpected error occured.
            </i-card>
        </div>
    </i-form>

    <i-modal v-model="demoModalVisible">
        <template #header>
            Demo mode
        </template>
        You cannot search in demo mode.
    </i-modal>
</i-container>
</template>

<style scoped>
.message-container {
    display: flex;
    justify-content: center;
}

.message-container .card-header {
    font-weight: 600;
}
</style>

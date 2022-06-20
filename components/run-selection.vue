<script setup lang="ts">
import { Run } from '~~/services/run';
import { Segment } from '~~/services/segment';

const props = defineProps<{
    selectedRun: Run | null;
    runs: Run[];
    segments: Segment[];
}>();

const emits = defineEmits<{
    (event: 'update:selectedRun', selectedRun: Run | null): void
}>();

const tabs = {
    FULL_GAME: "full-game",
    SEGMENT: "segment"
} as const;
type TabName = typeof tabs[keyof typeof tabs];

const notEmpty = (arr: unknown[]): boolean => arr && arr.length > 0;

const activeTab = ref<TabName>(tabs.FULL_GAME);
const selectedFullRun = ref<Run | null>(notEmpty(props.runs) ? props.runs[0] : null);
const selectedSegment = ref<Segment | null>(notEmpty(props.segments) ? props.segments[0] : null);

const segmentAttempts = computed(() => {
    return selectedSegment.value?.getHistory(20)
        ?.map(segmentAttempt => segmentAttempt.ToRun())
        .filter((x): x is Run => x !== null)
        ?? [];
});
const selectedSegmentAttempt = ref<Run | null>(segmentAttempts.value.length > 0 ? segmentAttempts.value[0] : null);

const selectedRun = computed<Run | null>(() => {
    switch (activeTab.value) {
        case tabs.FULL_GAME:
            return selectedFullRun.value;
        case tabs.SEGMENT:
            return selectedSegmentAttempt.value;
        default:
            return assertNever(activeTab.value);
    }
});

if (selectedRun.value != props.selectedRun) {
    emits("update:selectedRun", selectedRun.value);
}

watch(selectedRun, (newValue) => {
    emits("update:selectedRun", newValue);
});
</script>

<template>
<i-tabs v-model="activeTab" model="tab-1">
    <template #header>
        <i-tab-title :for="tabs.FULL_GAME">
            Runs
        </i-tab-title>
        <i-tab-title :for="tabs.SEGMENT">
            Segments
        </i-tab-title>
    </template>

    <i-tab :name="tabs.FULL_GAME">
        <i-form-group>
            <i-form-label>Pick a run:</i-form-label>
            <run-select v-model="selectedFullRun" :runs="props.runs"/>
        </i-form-group>
    </i-tab>

    <i-tab :name="tabs.SEGMENT">
        <i-form-group>
            <i-form-label>Segment:</i-form-label>
            <i-select
                v-model="selectedSegment"
                :options="props.segments"
                :label="(segment: Segment) => segment.name"
                placeholder="Choose something..."
            />
        </i-form-group>
        <i-form-group>
            <i-form-label>Which time?</i-form-label>
            <run-select v-model="selectedSegmentAttempt" :runs="segmentAttempts"/>
        </i-form-group>
    </i-tab>
</i-tabs>
</template>
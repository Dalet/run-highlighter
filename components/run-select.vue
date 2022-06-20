<script setup lang="ts">
import { Run } from '~~/services/run';

type ModelValue = Run | null;

const props = defineProps<{
    modelValue: ModelValue;
    runs: Run[];
}>();
const emits = defineEmits<{
    (event: "update:modelValue", modelValue: ModelValue): void
}>();

let selected = ref(props.modelValue);
watch(selected, (newValue) => {
    emits("update:modelValue", newValue);
});

function renderRunLabel(run: ModelValue): string {
    if (!run || typeof(run) === "string") {
        return "";
    }

    let timeStr = format_time(run.rta?.asSeconds() ?? 0, 2) + " RTA";
    if (run.igt) {
        timeStr = format_time(run.igt.asSeconds(), 2) + " IGT / " + timeStr;
    }

    const id = run.id ? " #" + run.id : "";
    let str = `${timeStr}, ${run.ended.fromNow()}` + id;
    if (run.isStartedSynced === false || run.isEndedSynced === false) {
        str += " (unsynced)";
    }

    return str;
}
</script>

<template>
    <i-select
        v-model="selected"
        :options="props.runs"
        :label="renderRunLabel"
        placeholder="Choose something..."
    />
</template>
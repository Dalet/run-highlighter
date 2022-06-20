<script setup lang="ts">
import { Highlight } from "~~/composables/run-highlighter"

const props = defineProps<{
    highlights: Highlight[]
}>();

</script>

<template>
<div class="component-container">
<i-list-group>
    <i-list-group-item v-for="(highlight, partIndex) in props.highlights"
        class="_display:flex _flex-direction:row">
        <img class="highlight-thumbnail" :src="highlight.getThumbnailUrl(undefined, 200)" alt="Video thumbnail"/>

        <div class="highlight-description _flex-grow:1 _display:flex _flex-direction:column _justify-content:space-between">
            <div>
                <p class="video-title">{{highlight.videoTitle}}</p>
                <p class="_font-size:xs run-part" v-if="props.highlights.length > 1">Part {{ partIndex + 1}}</p>
            </div>
            <div class="_display:flex _flex_direction:row _align-items:end">
                <div class="_flex-grow:1">
                    <p>Start: <span class="highlight-timestamp">{{ format_time(highlight.start_time) }}</span></p>
                    <p>End:&nbsp; <span class="highlight-timestamp">{{ format_time(highlight.end_time) }}</span></p>
                </div>
                <div class="_margin-left:auto">
                    <i-button target="_blank" color="secondary" :href="highlight.getPrefilledHighlighterLink()">Open Highlighter</i-button>
                </div>
            </div>
        </div>
    </i-list-group-item>
</i-list-group>
</div>
</template>

<style scoped>
.column {
    padding: 0;
}

.component-container {
    width: 100%;
}

.list-group-item {
    width: 100%;
    height: 9em;
    padding-left: 0.75em;
    padding-right: 0.75em;
}

.video-title {
    max-width: 410px;
    max-height: 1.5em;
    margin: 0;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.highlight-thumbnail {
    display: inline-block;
    height: 100%;
    border: 1px solid;
    border-color: var(----border-color);
    margin: 0.25em;
    box-shadow: 0px 0px 30px -14px rgba(0,0,0,0.8);
}

.highlight-description {
    margin-left: 0.75em;
}

.highlight-description p {
   padding: 0; 
   margin: 0;
}

.highlight-timestamp {
    background-color: black;
    color: white;
    font-weight: 500;
    padding: 0 4px;
}
</style>
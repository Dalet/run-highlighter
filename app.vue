<script setup lang="ts">
import { useAuthStore } from '~~/store/auth';
const auth = useAuthStore();
auth.signInWithSavedProvider();
</script>

<template>
  <Head>
    <Title>Run Highlighter v2</Title>
  </Head>
  <i-layout center id="container">
    <i-layout-header class="_border-bottom _margin-top:1 header">
      <h1 class="_padding-left:1/4">Run Highlighter</h1>
      <p class="_font-size:xs _text:muted _font-weight:semibold _padding-left:3/4">Find and highlight your speedrun VODs</p>
      <user-button v-if="auth.isSignedIn" class="user-button _font-size:sm"></user-button>
    </i-layout-header>

    <i-layout-content class="_margin-top:1">
      <NuxtPage/>
    </i-layout-content>
  </i-layout>

  <footer class="footer">
    <div class="container">
      <p class="_text:muted _text:center">
        <a href="https://goo.gl/forms/2lyRNy0tl03rqlt82">Contact</a>
        •
        <a href="https://twitter.com/dalleth_">Twitter</a>
        •
        <a href="https://github.com/Dalet/run-highlighter">GitHub</a>
      </p>
    </div>
  </footer>
</template>

<style lang="scss">
@import '@inkline/inkline/css/variables';
@import '@inkline/inkline/css/mixins';

:root {
  --color--primary--h: 24deg;
  --color--primary--s: 79%;
  --color--primary--l: 49%;
  --body--background--dark: rgb(44, 57, 75);
}

#container {
  width: 100%;
  max-width: 680px;
  align-self: center;
}

.header {
  position: relative;
}

.user-button {
  position: absolute;
  right: 0;
  bottom: 8px;
}

.footer {
  width: 100%;
  height: 60px;
  background-color: rgba(255,255,255,0.04);
  flex-shrink: 0;
}

html, body, body > div[data-v-app] {
  height: 100%;
}

body > div[data-v-app] {
  display: flex;
  flex-direction: column;
}

#container {
  flex: 1 0 auto;
}
</style>

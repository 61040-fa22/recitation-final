<template>
  <div id="app">
    <Chat />
  </div>
</template>

<script>
import Chat from '@/components/Chat.vue';

export default {
  name: 'App',
  components: {Chat}
};
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  height: 100vh;
  flex-direction: column;
  display: flex;
  padding: 0;
  margin: 0;
  font-size: 1.2em;
}

main {
  padding: 0 5em 5em;
}
</style>

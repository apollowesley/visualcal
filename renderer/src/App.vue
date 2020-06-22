<template>
  <div id="app">
    <div id="nav">
      <router-link :to="{ name: 'main' }">Home</router-link> |
      <router-link :to="{ name: 'about' }">About</router-link>
    </div>
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

const ipcRenderer = (window as any).ipcRenderer;

@Component
export default class App extends Vue {

  mounted() {
    ipcRenderer.send('vue-test', { test: 'From vue!' });
  }

}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>

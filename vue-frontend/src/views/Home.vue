<template>
  <div>

  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class SessionView extends Vue {

  mounted() {
    console.info(this.$route.meta.sessions);
  }

}
</script>

<style>

</style>

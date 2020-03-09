<template>
  <div id="app">
    <prueba-firma></prueba-firma>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import PruebaFirmaComponent from "../src/index";

Vue.use(PruebaFirmaComponent, {});

export default Vue.extend({});
</script>

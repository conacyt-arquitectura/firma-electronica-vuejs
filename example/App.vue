<template>
  <div id="app">
    <div class="row justify-content-center">
      <h1>Componente de Firma Electrónica</h1>
    </div>
    <div class="row">
      <div class="col-4" />
      <div class="col-4">
        <prueba-firma></prueba-firma>
      </div>
      <div class="col-4" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import PruebaFirmaComponent from "../src/index";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

Vue.use(PruebaFirmaComponent, {});

export default Vue.extend({});
</script>

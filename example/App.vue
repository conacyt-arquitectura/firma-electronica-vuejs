<template>
  <div id="app">
    <div class="row justify-content-center">
      <h1>Componente de Firma Electrónica</h1>
    </div>
    <div class="row">
      <div class="col-4" />
      <div class="col-4">
        <strong>Se espera la firma de la persona con RFC {{ rfc }}</strong>
        <prueba-firma v-model="model" :data="cadenaOriginal" :rfc="rfc" @uploadedCer="uploadedCer"></prueba-firma>
      </div>
      <div class="col-4" />
    </div>
    <div class="row">
      <div class="col-2"></div>
      <div class="col-4">
        <div class="form-group">
          <label for="cer-code">Certificado</label>
          <pre id="cer-code">{{ model.cer }}</pre>
        </div>
      </div>
      <div class="col-4">
        <label for="cer-code">Firma</label>
        <pre id="signature-code">{{ model.signature }}</pre>
      </div>
      <div class="col-2"></div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import PruebaFirmaComponent from "../src/index";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

Vue.use(PruebaFirmaComponent, {});

export default Vue.extend({
  data: function() {
    return {
      model: {},
      cadenaOriginal: "MensajeACifrar",
      rfc: "GONM430818HP3"
    };
  },
  methods: {
    uploadedCer: function() {
      console.log("Se ha cargado el certificado");
    }
  }
});
</script>

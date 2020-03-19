<template>
  <div id="app">
    <div class="row justify-content-center">
      <h1>Componente de Firma Electrónica</h1>
    </div>
    <div class="row">
      <div class="col-4" />
      <div class="col-4">
        <div class="form-group">
          <select name="example" id="example" v-model="example" @change="changeExample">
            <option value="single">Firma individual</option>
            <option value="multiple">Firma múltiple</option>
          </select>
        </div>
        <strong>Se espera la firma de la persona con RFC {{ rfc }}</strong>
        <signer v-model="model" :data="cadenaOriginal" :rfc="rfc" :producer="producer" :consumer="consumer"></signer>
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
import SignerComponent from "../src/index";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

Vue.use(SignerComponent, {
  cerValidator: function(cer: string) {
    console.log("Usando validador de certificados dummy (siempre retorna true)...");
    return true;
  }
});

// Ejemplo de paginado.
//Retorna páginas de tamaño 1 mientras se indique que existe una siguiente página
const producer = function(page: number) {
  const numPages = 2;
  if (page <= numPages) {
    const id = new Date().getTime();
    return {
      hasNext: page < numPages,
      content: [
        {
          id: id,
          data: "MensajeACifrar" + id
        }
      ]
    };
  }
  return null;
};

const cadenaOriginal = null;

export default Vue.extend({
  data: function() {
    return {
      model: {},
      cadenaOriginal: cadenaOriginal,
      rfc: "GONM430818HP3",
      example: "single",
      producer: null
    };
  },
  methods: {
    changeExample: function() {
      if (this.example === "single") {
        this.cadenaOriginal = cadenaOriginal;
        this.producer = null;
      } else if (this.example === "multiple") {
        (this.cadenaOriginal as any) = null;
        (this.producer as any) = producer;
      }
    },
    // Consume las firmas producidas por el componente.
    // Es responsabilidad del controlador decidir qué hacer con las firmas.
    // Por ejemplo, enviarlas inmediatamente a la aplicación
    // o almacenarlas para luego enviarlas juntas
    consumer: function(firmas: Array<any>) {
      console.log("Certificado y firmas: ", {
        certificado: (this.model as any).cer,
        firmas: firmas
      });
    }
  }
});
</script>

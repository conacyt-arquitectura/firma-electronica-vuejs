<template>
  <div id="app">
    <div class="row justify-content-center">
      <h1 v-text="$t('title')"></h1>
    </div>
    <div class="row">
      <div class="col-4" />
      <div class="col-4">
        <form name="preferences" role="form" @submit.prevent>
          <div class="form-group">
            <label for="localeSelect">
              <span v-text="$t('language')">Idioma</span>
            </label>
            <select name="localeSelect" id="localeSelect" v-model="$i18n.locale">
              <option v-bind:value="locale" v-for="locale in availableLocales" :key="locale">{{ locale }}</option>
            </select>
          </div>
        </form>
        <div class="form-group">
          <select name="example" id="example" v-model="example" @change="changeExample">
            <option value="single">Firma individual</option>
            <option value="multiple">Firma múltiple</option>
          </select>
        </div>
        <strong>Se espera la firma de la persona con RFC {{ rfc }}</strong>
        <signer v-model="model" :data="cadenaOriginal" :rfc="rfc" :producer="producer" @signed="onSigned"></signer>
      </div>
      <div class="col-4" />
    </div>
    <div class="row">
      <div class="col-2"></div>
      <div class="col-4">
        <div class="form-group">
          <label for="cer-code">Certificado</label>
          <pre id="cer-code">{{ model.certificate }}</pre>
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
import Vuelidate from "vuelidate";
import VueI18n from "vue-i18n";
import i18nEn from "../src/i18n/en/signer.json";
import i18nEs from "../src/i18n/es/signer.json";

Vue.use(VueI18n);
Vue.use(Vuelidate);

const i18n = new VueI18n({
  locale: "es",
  messages: {
    en: {
      title: "Electronic Signature Component",
      language: "Language"
    },
    es: {
      title: "Componente de Firma Electrónica",
      language: "Idioma"
    }
  }
});

i18n.mergeLocaleMessage("es", i18nEs);
i18n.mergeLocaleMessage("en", i18nEn);

Vue.use(SignerComponent, {
  validator: function(cer: string): Promise<boolean> {
    console.log("Usando validador de certificados dummy (siempre retorna true)...");
    return Promise.resolve(true);
  }
});

// Ejemplo de paginado.
//Retorna páginas de tamaño 1 mientras se indique que existe una siguiente página
const producer = function(page: number) {
  const numPages = 2;
  return new Promise((resolve, reject) => {
    if (page <= numPages) {
      const id = new Date().getTime();
      setTimeout(() => {
        resolve({
          hasNext: page < numPages,
          content: [
            {
              id: id,
              data: "MensajeACifrar" + id
            }
          ]
        });
      }, 2000);
    } else {
      reject();
    }
  });
};

const onSingleSigned = function() {
  console.log("¡Firmado!");
};

// Consume las firmas producidas por el componente.
// Es responsabilidad del controlador decidir qué hacer con las firmas.
// Por ejemplo, enviarlas inmediatamente a la aplicación
// o almacenarlas para luego enviarlas juntas
const onMultipleSigned = function(firmas: any) {
  console.log("Firmas: ", firmas);
};

const cadenaOriginal = "CadenaOriginal";

export default Vue.extend({
  i18n,
  data: function() {
    return {
      model: {},
      cadenaOriginal: cadenaOriginal,
      rfc: "GONM430818HP3",
      example: "single",
      producer: null,
      onSigned: onSingleSigned
    };
  },
  methods: {
    changeExample: function() {
      if (this.example === "single") {
        this.cadenaOriginal = cadenaOriginal;
        this.producer = null;
        (this.onSigned as any) = onSingleSigned;
      } else if (this.example === "multiple") {
        (this.cadenaOriginal as any) = null;
        (this.producer as any) = producer;
        (this.onSigned as any) = onMultipleSigned;
      }
    }
  },
  computed: {
    availableLocales: function() {
      return Object.keys(this.$i18n.messages);
    }
  }
});
</script>

import { defaultConfig } from "./prueba-firma.component";
import PruebaFirmaComponent from "./prueba-firma.component.vue";

export default {
  install(Vue: any, globalOptions: any) {
    const options = { ...defaultConfig, ...globalOptions };
    Vue.prototype.$PRUEBA_FIRMA_DEFAULT_OPTIONS = options;
    Vue.component("prueba-firma", PruebaFirmaComponent);
  }
};

export { PruebaFirmaComponent };

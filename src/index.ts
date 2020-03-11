import { defaultConfig } from './signer.component';
import SignerComponent from "./signer.component.vue";

export default {
  install(Vue: any, globalOptions: any) {
    const options = { ...defaultConfig, ...globalOptions };
    Vue.prototype.$SIGNER_DEFAULT_OPTIONS = options;
    Vue.component('signer', SignerComponent);
  }
}

export { SignerComponent };
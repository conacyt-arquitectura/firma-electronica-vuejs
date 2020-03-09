import Component from "vue-class-component";
import { Vue } from "vue-property-decorator";

import jseu from "js-encoding-utils";
import keyutils from "js-crypto-key-utils";

const asn1js = require("asn1js");
const pkijs = require("pkijs");

const Certificate = pkijs.Certificate;
const AttributeTypeAndValue = pkijs.AttributeTypeAndValue;

const rfcATV = new AttributeTypeAndValue({
  type: "2.5.4.45"
});

export class Options {
  constructor() {}
}

const algoritmo = "sha512";

let defaultConfig = new Options();
export { defaultConfig };
@Component
export default class PruebaFirmaComponent extends Vue {
  password: string = "";
  rfc: string = "";

  private certFile: any;
  private keyFile: ArrayBuffer = new ArrayBuffer(0);

  public get options(): Options {
    return (<any>this).$PRUEBA_FIRMA_DEFAULT_OPTIONS || defaultConfig;
  }

  public process() {
    try {
      let keyObj = new keyutils.Key("der", new Uint8Array(this.keyFile));

      if (keyObj.isEncrypted) {
        keyObj
          .decrypt(this.password)
          .then(ok => {
            console.debug("decrypt: " + ok);
            keyObj.export("pem").then(privateKeyPem => {
              console.log(privateKeyPem);
            });
          })
          .catch(e => {
            alert("El password es incorrecto");
            throw e;
          });
      }
    } catch (e) {
      console.log(e);
      alert("Ocurrió un error al firmr");
    }
  }

  public handleCertUpload() {
    this.getData((<any>this.$refs.cert).files[0], this.setCertContent);
  }

  private setCertContent(content: ArrayBuffer) {
    try {
      this.rfc = "";
      const asn1 = asn1js.fromBER(content);
      this.certFile = new Certificate({ schema: asn1.result });
      this.rfc = this.certFile.subject.typesAndValues.find((a: { type: any }) => a.type === rfcATV.type)?.value.valueBlock.value;
    } catch (e) {
      console.log("Certificado no válido");
      alert("Certificado no válido");
    }
  }

  public handleKeyUpload() {
    this.getData((<any>this.$refs.key).files[0], this.setKeyContent);
  }

  private setKeyContent(content: ArrayBuffer) {
    try {
      let tmp = new keyutils.Key("der", new Uint8Array(content));
      if (!tmp.isPrivate || !tmp.isEncrypted) {
        throw "No es una llve privada ni cifrada";
      } else {
        this.keyFile = content;
      }
    } catch (e) {
      console.log("Llave no válida");
      alert("Llave no válida");
    }
  }

  private getData(file: any, cb: any) {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = () => {
      const arrayBuffer = fileReader.result as ArrayBuffer;
      cb(arrayBuffer);
    };
  }
}

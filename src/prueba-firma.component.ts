import Component from "vue-class-component";
import { Vue } from "vue-property-decorator";

import { Certificate, PrivateKey } from "@fidm/x509";
import jseu from "js-encoding-utils";
import keyutils from "js-crypto-key-utils";

export class Options {
  constructor() {}
}

const algoritmo = "sha512";

let defaultConfig = new Options();
export { defaultConfig };
@Component
export default class PruebaFirmaComponent extends Vue {
  password = "";

  private certFile: any;
  private keyFile: any;

  public get options(): Options {
    return (<any>this).$PRUEBA_FIRMA_DEFAULT_OPTIONS || defaultConfig;
  }

  public process() {
    try {
      let keyObjArr = Uint8Array.from(atob(this.keyFile), c => c.charCodeAt(0));
      let keyObj = new keyutils.Key("der", keyObjArr);

      let certObjArr = Uint8Array.from(atob(this.certFile), c => c.charCodeAt(0));
      let certObj = jseu.formatter.binToPem(certObjArr, "certificate");

      console.log(certObj);

      if (keyObj.isEncrypted) {
        keyObj.decrypt(this.password).then(ok => {
          if (ok) {
            keyObj.export("pem").then(privateKeyPem => {
              console.log(privateKeyPem);

              let buffer = new Buffer(privateKeyPem.toString(), "utf-8");

              const data = Buffer.allocUnsafe(100); // Datos a cifrar
              const privateKey = PrivateKey.fromPEM(buffer);

              buffer = new Buffer(certObj, "utf-8");
              let ed25519Cert = Certificate.fromPEM(buffer);

              let signature = privateKey.sign(data, algoritmo);

              if (ed25519Cert.publicKey.verify(data, signature, algoritmo)) {
                alert("Prueba existosa");
              } else {
                alert("Error al firmar");
              }
            });
          } else {
            alert("No fue posible desencriptar la llave");
          }
        });
      }
    } catch (e) {
      console.log(e);
      alert("Ocurrió un error al firmr");
    }
  }

  public handleCertUpload() {
    this.getData((<any>this.$refs.key).files[0], this.setCertContent);
  }

  private setCertContent(content: any) {
    this.certFile = content;
  }

  public handleKeyUpload() {
    this.getData((<any>this.$refs.key).files[0], this.setKeyContent);
  }

  private setKeyContent(content: any) {
    this.keyFile = content;
  }

  private getData(file: any, cb: any) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = function(e: any) {
      const content = e.target.result.substr(
        e.target.result.indexOf("base64,") + "base64,".length
      );
      cb(content);
    };
  }
}

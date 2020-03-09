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
  password: string = "";
  rfc: string = "";

  private certFile: string = "";
  private keyFile: ArrayBuffer = new ArrayBuffer(0);

  public get options(): Options {
    return (<any>this).$PRUEBA_FIRMA_DEFAULT_OPTIONS || defaultConfig;
  }

  public process() {
    try {
      let keyObj = new keyutils.Key("der", new Uint8Array(this.keyFile));

      if (keyObj.isEncrypted) {
        keyObj.decrypt(this.password).then(ok => {
          if (ok) {
            keyObj.export("pem").then(privateKeyPem => {
              let buffer = new Buffer(privateKeyPem.toString(), "utf-8");

              const data = Buffer.allocUnsafe(100); // Datos a cifrar
              console.log("1");
              const privateKey = PrivateKey.fromPEM(buffer);
              console.log("2");
              buffer = new Buffer(this.certFile, "utf-8");
              console.log("3");
              let ed25519Cert = Certificate.fromPEM(buffer);
              console.log("4");

              console.log(privateKey.toPEM());

              let signature = privateKey.sign(data, algoritmo);
              console.log("5");

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
    this.getData((<any>this.$refs.cert).files[0], this.setCertContent);
  }

  private setCertContent(content: ArrayBuffer) {
    try {
      this.certFile = jseu.formatter.binToPem(content, "certificate");
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
      new keyutils.Key("der", new Uint8Array(content));
      this.keyFile = content;
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

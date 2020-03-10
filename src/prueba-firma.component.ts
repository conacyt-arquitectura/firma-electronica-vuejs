import Component from "vue-class-component";
import { Vue } from "vue-property-decorator";

import jseu from "js-encoding-utils";
import keyutils from "js-crypto-key-utils";

import forge from "node-forge";

var pki = forge.pki;

export class Options {
  constructor() {}
}

let defaultConfig = new Options();
export { defaultConfig };
@Component
export default class PruebaFirmaComponent extends Vue {
  password: string = "";
  rfc: string = "";
  curp: string = "";

  private certFile: any;
  private privateKey: any;
  private keyFile: ArrayBuffer = new ArrayBuffer(0);

  invalidFiles = true;

  public get options(): Options {
    return (<any>this).$PRUEBA_FIRMA_DEFAULT_OPTIONS || defaultConfig;
  }

  public validar() {
    this.invalidFiles = true;
    this.privateKey = null;

    if (this.password === "" || this.certFile === null || this.keyFile.byteLength === 0) {
      return;
    }

    try {
      let keyObj = new keyutils.Key("der", new Uint8Array(this.keyFile));

      if (keyObj.isEncrypted) {
        keyObj
          .decrypt(this.password)
          .then(ok => {
            console.debug("decrypt: " + ok);
            keyObj.export("pem").then(privateKeyPem => {
              try {
                this.privateKey = pki.privateKeyFromPem(privateKeyPem.toString());
                let info = forge.util.bytesToHex(forge.random.getBytesSync(50));

                console.debug("Información a codificar: " + info);

                let md = forge.md.sha512.create();
                md.update(info, "utf8"); //Cadena aleatoria para verificar el certificado y la llave

                let signature = (<any>this.privateKey).sign(md);

                console.debug("Información codificada: " + forge.util.bytesToHex(signature));

                this.certFile.publicKey.verify(md.digest().bytes(), signature);

                this.invalidFiles = false;
              } catch (e) {
                alert("La llave y el certificado no coinciden");
                throw e;
              }
            });
          })
          .catch(e => {
            alert("El password es incorrecto");
            throw e;
          });
      }
    } catch (e) {
      console.log(e);
      alert("Ocurrió un error al firmar");
    }
  }

  public firmar() {
    if (this.privateKey !== null) {
      let cadena = "Esto es una prueba de cifrado";

      let md = forge.md.sha512.create();
      md.update(cadena, "utf8");

      let signature = this.privateKey.sign(md);

      console.log("Cadea cifrada: " + forge.util.bytesToHex(signature));
    }
  }

  public handleCertUpload() {
    this.getData((<any>this.$refs.cert).files[0], this.setCertContent);
  }

  private setCertContent(content: ArrayBuffer) {
    this.invalidFiles = true;
    this.curp = "";
    this.rfc = "";

    try {
      const certPem = jseu.formatter.binToPem(content, "certificate");
      this.certFile = pki.certificateFromPem(certPem);

      if (this.certFile.subject && this.certFile.subject.attributes) {
        let attribute;

        for (var idx in this.certFile.subject.attributes) {
          attribute = this.certFile.subject.attributes[idx];

          if (attribute.type === "2.5.4.45") {
            this.rfc = attribute.value;
          }
          if (attribute.type === "2.5.4.5") {
            this.curp = attribute.value;
          }
        }

        if (this.rfc === "") {
          throw "No se encontró el RFC";
        }
      } else {
        throw "No se encontraron las entradas de atributos";
      }
    } catch (e) {
      console.log(e);
      alert("Certificado no válido");
    }
  }

  public handleKeyUpload() {
    this.getData((<any>this.$refs.key).files[0], this.setKeyContent);
  }

  private setKeyContent(content: ArrayBuffer) {
    this.invalidFiles = true;
    this.privateKey = null;

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

import Component from "vue-class-component";
import { Vue, Prop } from "vue-property-decorator";

import forge, { pki, asn1 } from "node-forge";

export class Options {
  constructor() {}
}

let defaultConfig = new Options();
export { defaultConfig };
@Component
export default class PruebaFirmaComponent extends Vue {
  @Prop({ required: true, type: String })
  readonly data!: string;

  @Prop({ required: true, type: String })
  readonly rfc!: string;

  password: string = "";
  cerRfc: string = "";
  curp: string = "";

  private certFile: any;
  private privateKey: any;
  private cryptedPrivateKey: asn1.Asn1 | undefined;

  invalidFiles = true;

  public get options(): Options {
    return (<any>this).$PRUEBA_FIRMA_DEFAULT_OPTIONS || defaultConfig;
  }

  public validar() {
    this.invalidFiles = true;
    this.privateKey = null;

    if (this.password === "" || this.certFile === null || this.cryptedPrivateKey === null || this.cryptedPrivateKey === undefined) {
      return;
    } else {
      try {
        this.privateKey = pki.decryptRsaPrivateKey(pki.encryptedPrivateKeyToPem(this.cryptedPrivateKey), this.password);

        if (this.privateKey === null) {
          alert("La llave no es válida");
        } else {
          let info = forge.util.bytesToHex(forge.random.getBytesSync(50)); //Cadena aleatoria para verificar el certificado y la llave
          let md = forge.md.sha512.create();
          md.update(info, "utf8");

          this.certFile.publicKey.verify(md.digest().bytes(), this.privateKey.sign(md));
          this.invalidFiles = false;
        }
      } catch (e) {
        console.log(e);
        alert("No se pudo validar el certificado, verifique que el password y los archivos son válidos");
      }
    }
  }

  public firmar() {
    if (this.privateKey !== null) {
      let md = forge.md.sha512.create();
      md.update(this.data, "utf8");
      let signature = this.privateKey.sign(md);
      this.$emit("input", { cer: this.certFile, signature: signature });
      console.log("Cadena cifrada: " + forge.util.bytesToHex(signature));
    }
  }

  public handleCertUpload() {
    this.getData((this.$refs.cert as any).files[0], this.setCertContent);
  }

  private setCertContent(content: ArrayBuffer) {
    this.invalidFiles = true;
    this.curp = "";
    this.cerRfc = "";

    try {
      const asn1Obj = asn1.fromDer(new forge.util.ByteStringBuffer(content));
      this.certFile = pki.certificateFromAsn1(asn1Obj);

      if (this.certFile.subject && this.certFile.subject.attributes) {
        let attribute;

        for (var idx in this.certFile.subject.attributes) {
          attribute = this.certFile.subject.attributes[idx];

          if (attribute.type === "2.5.4.45") {
            this.cerRfc = attribute.value;
          }
          if (attribute.type === "2.5.4.5") {
            this.curp = attribute.value;
          }
        }

        if (this.cerRfc === "") {
          throw "No se encontró el RFC";
        } else if (this.cerRfc !== this.rfc) {
          throw "El certificado no pertenece a la persona de quien se requiere la firma";
        }
        this.$emit("uploadedCer");
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
      this.cryptedPrivateKey = asn1.fromDer(new forge.util.ByteStringBuffer(content));
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

import Component from "vue-class-component";
import { Vue, Prop } from "vue-property-decorator";

import forge, { pki, asn1 } from "node-forge";

export class Options {
  constructor() {}
}

let defaultConfig = new Options();
export { defaultConfig };
@Component
export default class SignerComponent extends Vue {
  @Prop({ required: true, type: String })
  readonly data!: string;

  @Prop({ required: true, type: String })
  readonly rfc!: string;

  password: string = "";
  cerRfc: string = "";
  curp: string = "";

  private certificateX509: any;
  private certificatePem = "";
  private privateKey: any;
  private cryptedPrivateKey: asn1.Asn1 | undefined;

  invalidFiles = true;

  public get options(): Options {
    return (<any>this).$PRUEBA_FIRMA_DEFAULT_OPTIONS || defaultConfig;
  }

  public validar() {
    this.invalidFiles = true;
    this.privateKey = null;

    if (this.password === "" || this.certificateX509 === null || this.cryptedPrivateKey === null || this.cryptedPrivateKey === undefined || this.rfc != this.cerRfc) {
      return;
    } else {
      try {
        this.privateKey = pki.decryptRsaPrivateKey(pki.encryptedPrivateKeyToPem(this.cryptedPrivateKey), this.password);

        if (this.privateKey === null) {
          alert("La llave no es válida");
        } else {
          let info = forge.util.bytesToHex(forge.random.getBytesSync(50)); //Cadena aleatoria para verificar el certificado y la llave
          let md = forge.md.sha256.create();
          md.update(info, "utf8");

          this.certificateX509.publicKey.verify(md.digest().bytes(), this.privateKey.sign(md));
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
      let md = forge.md.sha256.create();
      md.update(this.data, "utf8");
      let signature = this.privateKey.sign(md);
      this.$emit("input", { cer: this.certificatePem, signature: forge.util.encode64(signature) });
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
      this.certificateX509 = pki.certificateFromAsn1(asn1Obj);
      this.certificatePem = pki.certificateToPem(this.certificateX509);

      const today = new Date();

      if (this.certificateX509.validity.notBefore > today || this.certificateX509.validity.notAfter < today) {
        throw "La fecha del certificado no es válida";
      } else if (this.certificateX509.subject && this.certificateX509.subject.attributes) {
        let attribute;

        for (var idx in this.certificateX509.subject.attributes) {
          attribute = this.certificateX509.subject.attributes[idx];

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

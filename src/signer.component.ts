import i18nEn from "@/i18n/en/signer.json";
import i18nEs from "@/i18n/es/signer.json";
import forge from "node-forge";
import Component from "vue-class-component";
import { Prop, Vue } from "vue-property-decorator";
import { required, sameAs } from "vuelidate/lib/validators";
import Vuelidate from "vuelidate";
import { IVueI18n } from "vue-i18n/types/index";

const pki = forge.pki;
const asn1 = forge.asn1;

export class Options {
  public validator = function(_cer: string): Promise<boolean> {
    console.warn("No se configuró ningún validador de certificados");
    return Promise.reject(false);
  };
  constructor() {}
}

let defaultConfig = new Options();
export { defaultConfig };

const stillValid = (_value: any, vm: any) => {
  if (!vm.certificateX509) return true;
  const today = new Date();
  return today < vm.certificateX509.validity.notAfter;
};

const alreadyValid = (_value: any, vm: any) => {
  if (!vm.certificateX509) return true;
  const today = new Date();
  return today > vm.certificateX509.validity.notBefore;
};
@Component({
  validations: {
    certificatePem: {
      alreadyValid,
      stillValid
    },
    cerRfc: {
      required,
      sameAsExpected: sameAs("rfc")
    },
    password: {
      required
    }
  }
})
export default class SignerComponent extends Vue {
  @Prop({
    required: false,
    type: String
  })
  readonly data!: string;

  @Prop({ required: true, type: String })
  readonly rfc!: string;

  @Prop({ required: false, type: Function })
  readonly producer!: Function;

  private password: string = "";
  public cerRfc: string = "";
  public curp: string = "";

  public certificateX509: any;
  public certificatePem = "";
  private privateKey: any;
  private cryptedPrivateKey!: forge.asn1.Asn1;
  private currentPageNumber = 1;

  public invalidFiles = true;
  public isCertValid = false;

  public alreadySigned = false;

  public unparseableCertificate = false;
  public unparseablePrivateKey = false;
  public wrongPassword = false;
  public disparity = false;

  created() {
    if (this.$i18n) {
      this.$i18n.mergeLocaleMessage("es", i18nEs);
      this.$i18n.mergeLocaleMessage("en", i18nEn);
    }
  }

  public get options(): Options {
    return (<any>this).$SIGNER_DEFAULT_OPTIONS || defaultConfig;
  }

  public validar() {
    this.invalidFiles = true;
    this.privateKey = null;
    this.disparity = false;
    this.wrongPassword = false;
    this.alreadySigned = false;

    try {
      this.privateKey = pki.decryptRsaPrivateKey(pki.encryptedPrivateKeyToPem(this.cryptedPrivateKey), this.password);

      if (this.privateKey === null) {
        this.wrongPassword = true;
      } else {
        let info = forge.util.bytesToHex(forge.random.getBytesSync(50)); //Cadena aleatoria para verificar el certificado y la llave
        let md = forge.md.sha256.create();
        md.update(info, "utf8");

        this.certificateX509.publicKey.verify(md.digest().bytes(), this.privateKey.sign(md));
        this.invalidFiles = false;
        this.options
          .validator(this.certificatePem)
          .then(status => (this.isCertValid = status))
          .catch(err => {
            console.error(err);
            this.isCertValid = false;
          });
      }
    } catch (e) {
      this.disparity = true;
    }
  }

  public firmar() {
    this.$emit("processSignature");
    this.alreadySigned = true;
    if (this.producer) {
      this.firmarMultiple();
    } else {
      this.firmarIndividual();
    }
  }

  public firmarMultiple() {
    this.$emit("input", { certificate: this.certificatePem });
    this.currentPageNumber = 1;
    this.doFirma(true);
  }

  private doFirma(hasNext: boolean) {
    if (hasNext) {
      this.producer(this.currentPageNumber)
        .then((page: { content: any[]; hasNext: boolean }) => {
          hasNext = page.hasNext;
          const signatures = page.content.map(e => {
            return {
              id: e.id,
              data: e.data,
              signature: this.firmarData(e.data)
            };
          });
          this.$emit("signed", signatures);
          this.currentPageNumber++;
          this.doFirma(hasNext);
        })
        .catch(console.error);
    }
  }

  public firmarIndividual() {
    const signature = this.firmarData(this.data);
    this.$emit("input", { certificate: this.certificatePem, signature: signature });
    this.$emit("signed");
  }

  private firmarData(data: string) {
    let md = forge.md.sha256.create();
    md.update(data, "utf8");
    const signature = this.privateKey.sign(md);
    return forge.util.encode64(signature);
  }

  public handleCertUpload() {
    this.invalidFiles = true;
    this.isCertValid = false;
    this.$v.certificatePem?.$reset();
    this.getData((this.$refs.cert as any).files[0], this.setCertContent);
  }

  private setCertContent(content: ArrayBuffer) {
    this.curp = "";
    this.cerRfc = "";
    this.unparseableCertificate = false;

    try {
      const asn1Obj = asn1.fromDer(new forge.util.ByteStringBuffer(content));
      this.certificateX509 = pki.certificateFromAsn1(asn1Obj);
      this.certificatePem = pki.certificateToPem(this.certificateX509);
      this.$v.certificatePem?.$touch();

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
    } catch (e) {
      this.unparseableCertificate = true;
    }
  }

  public handleKeyUpload() {
    this.getData((<any>this.$refs.key).files[0], this.setKeyContent);
  }

  private setKeyContent(content: ArrayBuffer) {
    this.invalidFiles = true;
    this.privateKey = null;
    this.unparseablePrivateKey = false;

    try {
      this.cryptedPrivateKey = asn1.fromDer(new forge.util.ByteStringBuffer(content));
    } catch (e) {
      this.unparseablePrivateKey = true;
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

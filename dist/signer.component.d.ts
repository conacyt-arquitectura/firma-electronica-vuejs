import { Vue } from "vue-property-decorator";
export declare class Options {
  cerValidator: (_cer: string) => Promise<boolean>;
  constructor();
}
declare let defaultConfig: Options;
export { defaultConfig };
export default class SignerComponent extends Vue {
  readonly data: string;
  readonly rfc: string;
  readonly producer: Function;
  readonly consumer: Function;
  private password;
  cerRfc: string;
  curp: string;
  certificateX509: any;
  certificatePem: string;
  private privateKey;
  private cryptedPrivateKey;
  private currentPageNumber;
  invalidFiles: boolean;
  isCerValid: boolean;
  unparseableCertificate: boolean;
  unparseablePrivateKey: boolean;
  wrongPassword: boolean;
  disparity: boolean;
  created(): void;
  get options(): Options;
  validar(): void;
  firmar(): void;
  firmarMultiple(): void;
  firmarIndividual(): void;
  private firmarData;
  handleCertUpload(): void;
  private setCertContent;
  handleKeyUpload(): void;
  private setKeyContent;
  private getData;
}

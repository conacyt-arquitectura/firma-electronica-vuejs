import { __extends, __decorate, __assign } from 'tslib';
import forge from 'node-forge';
import Component from 'vue-class-component';
import { Prop, Vue } from 'vue-property-decorator';
import { required, sameAs } from 'vuelidate/lib/validators';

var signer = {
	certificate: "Certificate",
	privateKey: "Private key",
	password: "Password",
	rfc: {
		title: "RFC",
		notFound: "RFC was not found in certificate",
		notSameAsExpected: "The certificate does not belong to the person whose signature is required"
	},
	curp: "CURP",
	validate: "Validate",
	sign: "Sign",
	validation: {
		required: "This field is required",
		wrongPassword: "Password seems to be wrong",
		disparity: "Error while verifying parity. Check that key corresponds to certificate.",
		unparseableCertificate: "Unparseable certificate",
		unparseablePrivateKey: "Unparseable private key"
	}
};
var i18nEn = {
	signer: signer
};

var signer$1 = {
	certificate: "Certificado",
	privateKey: "Llave privada",
	password: "Contraseña",
	rfc: {
		title: "RFC",
		notFound: "No se encontró el RFC en el certificado",
		notSameAsExpected: "El certificado no pertenece a la persona de quien se requiere la firma"
	},
	curp: "CURP",
	validate: "Validar",
	sign: "Firmar",
	validation: {
		required: "Este campo es requerido",
		wrongPassword: "Parece que la contraseña es incorrecta",
		disparity: "Error al verificar la paridad. Revise que la llave corresponde al certificado.",
		unparseableCertificate: "Certificado ilegible",
		unparseablePrivateKey: "Llave privada ilegible"
	}
};
var i18nEs = {
	signer: signer$1
};

var pki = forge.pki;
var asn1 = forge.asn1;

var Options =
/** @class */
function () {
  function Options() {
    this.validator = function (_cer) {
      console.warn("No se configuró ningún validador de certificados");
      return Promise.reject(false);
    };
  }

  return Options;
}();
var defaultConfig = new Options();

var stillValid = function stillValid(_value, vm) {
  if (!vm.certificateX509) return true;
  var today = new Date();
  return today < vm.certificateX509.validity.notAfter;
};

var alreadyValid = function alreadyValid(_value, vm) {
  if (!vm.certificateX509) return true;
  var today = new Date();
  return today > vm.certificateX509.validity.notBefore;
};

var SignerComponent =
/** @class */
function (_super) {
  __extends(SignerComponent, _super);

  function SignerComponent() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.password = "";
    _this.cerRfc = "";
    _this.curp = "";
    _this.certificatePem = "";
    _this.currentPageNumber = 1;
    _this.invalidFiles = true;
    _this.isCertValid = false;
    _this.unparseableCertificate = false;
    _this.unparseablePrivateKey = false;
    _this.wrongPassword = false;
    _this.disparity = false;
    return _this;
  }

  SignerComponent.prototype.created = function () {
    if (this.$i18n) {
      this.$i18n.mergeLocaleMessage("es", i18nEs);
      this.$i18n.mergeLocaleMessage("en", i18nEn);
    }
  };

  Object.defineProperty(SignerComponent.prototype, "options", {
    get: function get() {
      return this.$SIGNER_DEFAULT_OPTIONS || defaultConfig;
    },
    enumerable: true,
    configurable: true
  });

  SignerComponent.prototype.validar = function () {
    var _this = this;

    this.invalidFiles = true;
    this.privateKey = null;
    this.disparity = false;
    this.wrongPassword = false;

    try {
      this.privateKey = pki.decryptRsaPrivateKey(pki.encryptedPrivateKeyToPem(this.cryptedPrivateKey), this.password);

      if (this.privateKey === null) {
        this.wrongPassword = true;
      } else {
        var info = forge.util.bytesToHex(forge.random.getBytesSync(50)); //Cadena aleatoria para verificar el certificado y la llave

        var md = forge.md.sha256.create();
        md.update(info, "utf8");
        this.certificateX509.publicKey.verify(md.digest().bytes(), this.privateKey.sign(md));
        this.invalidFiles = false;
        this.options.validator(this.certificatePem).then(function (status) {
          return _this.isCertValid = status;
        }).catch(function (err) {
          console.error(err);
          _this.isCertValid = false;
        });
      }
    } catch (e) {
      this.disparity = true;
    }
  };

  SignerComponent.prototype.firmar = function () {
    if (this.producer) {
      this.firmarMultiple();
    } else {
      this.firmarIndividual();
    }
  };

  SignerComponent.prototype.firmarMultiple = function () {
    var _this = this;

    this.$emit("input", {
      certificate: this.certificatePem
    });
    var hasNext = false;

    do {
      this.producer(this.currentPageNumber).then(function (page) {
        hasNext = page.hasNext;
        var signatures = page.content.map(function (e) {
          return {
            id: e.id,
            signature: _this.firmarData(e.data)
          };
        });

        _this.$emit("signed", signatures);

        _this.currentPageNumber++;
      }).catch(console.error);
    } while (hasNext);
  };

  SignerComponent.prototype.firmarIndividual = function () {
    var signature = this.firmarData(this.data);
    this.$emit("input", {
      certificate: this.certificatePem,
      signature: signature
    });
    this.$emit("signed");
  };

  SignerComponent.prototype.firmarData = function (data) {
    var md = forge.md.sha256.create();
    md.update(data, "utf8");
    var signature = this.privateKey.sign(md);
    return forge.util.encode64(signature);
  };

  SignerComponent.prototype.handleCertUpload = function () {
    var _a;

    this.invalidFiles = true;
    this.isCertValid = false;
    (_a = this.$v.certificatePem) === null || _a === void 0 ? void 0 : _a.$reset();
    this.getData(this.$refs.cert.files[0], this.setCertContent);
  };

  SignerComponent.prototype.setCertContent = function (content) {
    var _a;

    this.curp = "";
    this.cerRfc = "";
    this.unparseableCertificate = false;

    try {
      var asn1Obj = asn1.fromDer(new forge.util.ByteStringBuffer(content));
      this.certificateX509 = pki.certificateFromAsn1(asn1Obj);
      this.certificatePem = pki.certificateToPem(this.certificateX509);
      (_a = this.$v.certificatePem) === null || _a === void 0 ? void 0 : _a.$touch();
      var attribute = void 0;

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
  };

  SignerComponent.prototype.handleKeyUpload = function () {
    this.getData(this.$refs.key.files[0], this.setKeyContent);
  };

  SignerComponent.prototype.setKeyContent = function (content) {
    this.invalidFiles = true;
    this.privateKey = null;
    this.unparseablePrivateKey = false;

    try {
      this.cryptedPrivateKey = asn1.fromDer(new forge.util.ByteStringBuffer(content));
    } catch (e) {
      this.unparseablePrivateKey = true;
    }
  };

  SignerComponent.prototype.getData = function (file, cb) {
    var fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = function () {
      var arrayBuffer = fileReader.result;
      cb(arrayBuffer);
    };
  };

  __decorate([Prop({
    required: false,
    type: String
  })], SignerComponent.prototype, "data", void 0);

  __decorate([Prop({
    required: true,
    type: String
  })], SignerComponent.prototype, "rfc", void 0);

  __decorate([Prop({
    required: false,
    type: Function
  })], SignerComponent.prototype, "producer", void 0);

  SignerComponent = __decorate([Component({
    validations: {
      certificatePem: {
        alreadyValid: alreadyValid,
        stillValid: stillValid
      },
      cerRfc: {
        required: required,
        sameAsExpected: sameAs("rfc")
      },
      password: {
        required: required
      }
    }
  })], SignerComponent);
  return SignerComponent;
}(Vue);

/* script */
var __vue_script__ = SignerComponent;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', [_c('form', {
    attrs: {
      "role": "form"
    },
    on: {
      "submit": function submit($event) {
        $event.preventDefault();
      }
    }
  }, [_c('div', [_c('div', {
    staticClass: "form-group"
  }, [_c('label', {
    attrs: {
      "for": "cert"
    }
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.certificate'))
    }
  }, [_vm._v("Certificate")]), _vm._v(":")]), _vm._v(" "), _c('input', {
    ref: "cert",
    staticClass: "form-control",
    attrs: {
      "type": "file",
      "id": "cert",
      "accept": ".cer"
    },
    on: {
      "change": function change($event) {
        return _vm.handleCertUpload();
      }
    }
  }), _vm._v(" "), _vm.$v.certificatePem.$invalid ? _c('div', [!_vm.$v.certificatePem.stillValid ? _c('small', {
    staticClass: "form-text text-danger"
  }, [_vm._v("El certificado ya no es válido")]) : _vm._e(), _vm._v(" "), !_vm.$v.certificatePem.alreadyValid ? _c('small', {
    staticClass: "form-text text-danger"
  }, [_vm._v("El certificado no es válido aún")]) : _vm._e()]) : _vm._e(), _vm._v(" "), _vm.unparseableCertificate ? _c('small', {
    staticClass: "form-text text-danger"
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.validation.unparseableCertificate'))
    }
  }, [_vm._v("Unparseable certificate")])]) : _vm._e()]), _vm._v(" "), _c('div', {
    staticClass: "form-group"
  }, [_c('label', {
    attrs: {
      "for": "cert"
    }
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.privateKey'))
    }
  }, [_vm._v("Private key")]), _vm._v(":")]), _vm._v(" "), _c('input', {
    ref: "key",
    staticClass: "form-control",
    attrs: {
      "id": "key",
      "type": "file",
      "accept": ".key"
    },
    on: {
      "change": function change($event) {
        return _vm.handleKeyUpload();
      }
    }
  }), _vm._v(" "), _vm.unparseablePrivateKey ? _c('small', {
    staticClass: "form-text text-danger"
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.validation.unparseablePrivateKey'))
    }
  }, [_vm._v("Unparseable private key")])]) : _vm._e(), _vm._v(" "), _vm.disparity ? _c('small', {
    staticClass: "form-text text-danger"
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.validation.disparity'))
    }
  }, [_vm._v("Certificate and private key disparity")])]) : _vm._e()]), _vm._v(" "), _c('div', {
    staticClass: "form-group"
  }, [_c('label', {
    attrs: {
      "for": "password"
    }
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.password'))
    }
  }, [_vm._v("Password")]), _vm._v(":")]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.password,
      expression: "password"
    }],
    staticClass: "form-control",
    attrs: {
      "id": "password",
      "type": "password"
    },
    domProps: {
      "value": _vm.password
    },
    on: {
      "input": function input($event) {
        if ($event.target.composing) {
          return;
        }

        _vm.password = $event.target.value;
      }
    }
  }), _vm._v(" "), _vm.$v.password.$invalid ? _c('div', [!_vm.$v.password.required ? _c('small', {
    staticClass: "form-text text-danger"
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.validation.required'))
    }
  }, [_vm._v("This field is required")])]) : _vm._e()]) : _vm._e(), _vm._v(" "), _vm.wrongPassword ? _c('small', {
    staticClass: "form-text text-danger"
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.validation.wrongPassword'))
    }
  }, [_vm._v("Password seems to be wrong")])]) : _vm._e()]), _vm._v(" "), _c('div', {
    staticClass: "form-group"
  }, [_c('label', {
    attrs: {
      "for": "rfc"
    }
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.rfc.title'))
    }
  })]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.cerRfc,
      expression: "cerRfc"
    }],
    staticClass: "form-control",
    attrs: {
      "type": "text",
      "id": "rfc",
      "disabled": ""
    },
    domProps: {
      "value": _vm.cerRfc
    },
    on: {
      "input": function input($event) {
        if ($event.target.composing) {
          return;
        }

        _vm.cerRfc = $event.target.value;
      }
    }
  }), _vm._v(" "), _vm.$v.cerRfc.$invalid ? _c('div', [!_vm.$v.cerRfc.required ? _c('small', {
    staticClass: "form-text text-danger"
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.rfc.notFound'))
    }
  }, [_vm._v("No se encontró el RFC en el certificado")])]) : _vm._e(), _vm._v(" "), _vm.$v.cerRfc.required && !_vm.$v.cerRfc.sameAsExpected ? _c('small', {
    staticClass: "form-text text-danger"
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.rfc.notSameAsExpected'))
    }
  }, [_vm._v("El certificado no pertenece a la persona de quien se requiere la firma")])]) : _vm._e()]) : _vm._e()]), _vm._v(" "), _c('div', {
    staticClass: "form-group"
  }, [_c('label', {
    attrs: {
      "for": "curp"
    }
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.curp'))
    }
  }), _vm._v(":")]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.curp,
      expression: "curp"
    }],
    staticClass: "form-control",
    attrs: {
      "type": "text",
      "id": "curp",
      "disabled": ""
    },
    domProps: {
      "value": _vm.curp
    },
    on: {
      "input": function input($event) {
        if ($event.target.composing) {
          return;
        }

        _vm.curp = $event.target.value;
      }
    }
  })])]), _vm._v(" "), _c('div', [_c('button', {
    staticClass: "btn btn-secondary",
    attrs: {
      "type": "button",
      "disabled": _vm.$v.certificatePem.$invalid || _vm.$v.cerRfc.$invalid || _vm.$v.password.$invalid
    },
    on: {
      "click": function click($event) {
        return _vm.validar();
      }
    }
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.validate'))
    }
  }, [_vm._v("Validate")])]), _vm._v(" "), _c('button', {
    staticClass: "btn btn-primary",
    attrs: {
      "type": "submit",
      "disabled": _vm.invalidFiles || !_vm.isCertValid
    },
    on: {
      "click": function click($event) {
        return _vm.firmar();
      }
    }
  }, [_c('span', {
    domProps: {
      "textContent": _vm._s(_vm.$t('signer.sign'))
    }
  }, [_vm._v("Sign")])])])])]);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = undefined;
/* scoped */

var __vue_scope_id__ = undefined;
/* functional template */

var __vue_is_functional_template__ = false;
/* component normalizer */

function __vue_normalize__(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
  var component = (typeof script === 'function' ? script.options : script) || {}; // For security concerns, we use only base name in production mode.

  component.__file = "signer.component.vue";

  if (!component.render) {
    component.render = template.render;
    component.staticRenderFns = template.staticRenderFns;
    component._compiled = true;
    if (functional) component.functional = true;
  }

  component._scopeId = scope;

  return component;
}
/* style inject */

/* style inject SSR */


var SignerComponent$1 = __vue_normalize__({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__);

var index = {
  install: function install(Vue, globalOptions) {
    var options = __assign(__assign({}, defaultConfig), globalOptions);

    Vue.prototype.$SIGNER_DEFAULT_OPTIONS = options;
    Vue.component("signer", SignerComponent$1);
  }
};

export default index;
export { SignerComponent$1 as SignerComponent };
//# sourceMappingURL=index.module.js.map

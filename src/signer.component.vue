<template>
  <div>
    <form @submit.prevent role="form">
      <div>
        <div class="form-group">
          <label for="cert"><span v-text="$t('signer.certificate')">Certificate</span>:</label>
          <input type="file" class="form-control" id="cert" ref="cert" accept=".cer" @change="handleCertUpload()" />
          <div v-if="$v.certificatePem.$invalid">
            <small class="form-text text-danger" v-if="!$v.certificatePem.stillValid">El certificado ya no es válido</small>
            <small class="form-text text-danger" v-if="!$v.certificatePem.alreadyValid">El certificado no es válido aún</small>
          </div>
          <small class="form-text text-danger" v-if="unparseableCertificate"><span v-text="$t('signer.validation.unparseableCertificate')">Unparseable certificate</span></small>
        </div>
        <div class="form-group">
          <label for="cert"><span v-text="$t('signer.privateKey')">Private key</span>:</label>
          <input id="key" class="form-control" ref="key" type="file" accept=".key" v-on:change="handleKeyUpload()" />
          <small class="form-text text-danger" v-if="unparseablePrivateKey"><span v-text="$t('signer.validation.unparseablePrivateKey')">Unparseable private key</span></small>
          <small class="form-text text-danger" v-if="disparity"><span v-text="$t('signer.validation.disparity')">Certificate and private key disparity</span></small>
        </div>
        <div class="form-group">
          <label for="password"><span v-text="$t('signer.password')">Password</span>:</label>
          <input id="password" class="form-control" type="password" v-model="password" />
          <div v-if="$v.password.$invalid">
            <small class="form-text text-danger" v-if="!$v.password.required"><span v-text="$t('signer.validation.required')">This field is required</span></small>
          </div>
          <small class="form-text text-danger" v-if="wrongPassword"><span v-text="$t('signer.validation.wrongPassword')">Password seems to be wrong</span></small>
        </div>
        <div class="form-group">
          <label for="rfc"><span v-text="$t('signer.rfc.title')"></span></label>
          <input type="text" class="form-control" id="rfc" v-model="cerRfc" disabled />
          <div v-if="$v.cerRfc.$invalid">
            <small class="form-text text-danger" v-if="!$v.cerRfc.required"><span v-text="$t('signer.rfc.notFound')">No se encontró el RFC en el certificado</span></small>
            <small class="form-text text-danger" v-if="$v.cerRfc.required && !$v.cerRfc.sameAsExpected"
              ><span v-text="$t('signer.rfc.notSameAsExpected')">El certificado no pertenece a la persona de quien se requiere la firma</span></small
            >
          </div>
        </div>
        <div class="form-group">
          <label for="curp"><span v-text="$t('signer.curp')"></span>:</label>
          <input type="text" class="form-control" id="curp" v-model="curp" disabled />
        </div>
      </div>
      <div>
        <button type="button" class="btn btn-secondary" @click="validar()" :disabled="$v.certificatePem.$invalid || $v.cerRfc.$invalid || $v.password.$invalid">
          <span v-text="$t('signer.validate')">Validate</span>
        </button>
        <button type="submit" class="btn btn-primary" @click="firmar()" :disabled="invalidFiles || !isCertValid || alreadySigned">
          <span v-text="$t('signer.sign')">Sign</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" src="./signer.component.ts"></script>

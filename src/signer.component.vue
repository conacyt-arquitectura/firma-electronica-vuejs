<template>
  <div>
    <form @submit.prevent="validar()" role="form">
      <div>
        <div class="form-group">
          <label for="cert">Certificado: </label>
          <input type="file" class="form-control" id="cert" ref="cert" accept=".cer" @change="handleCertUpload()" />
          <div v-if="$v.certificatePem.$invalid">
            <small class="form-text text-danger" v-if="!$v.certificatePem.stillValid">El certificado ya no es válido</small>
            <small class="form-text text-danger" v-if="!$v.certificatePem.alreadyValid">El certificado no es válido aún</small>
          </div>
        </div>
        <div class="form-group">
          <label for="cert">Llave privada: </label>
          <input id="key" class="form-control" ref="key" type="file" accept=".key" v-on:change="handleKeyUpload()" />
        </div>
        <div class="form-group">
          <label for="password">Contraseña: </label>
          <input id="password" class="form-control" type="password" v-model="password" />
          <div v-if="$v.password.$invalid">
            <small class="form-text text-danger" v-if="!$v.password.required">Campo requerido</small>
          </div>
        </div>
        <div class="form-group">
          <label for="rfc">RFC: </label>
          <input type="text" class="form-control" id="rfc" v-model="cerRfc" disabled />
          <div v-if="$v.cerRfc.$invalid">
            <small class="form-text text-danger" v-if="!$v.cerRfc.required">No se encontró el RFC en el certificado</small>
            <small class="form-text text-danger" v-if="$v.cerRfc.required && !$v.cerRfc.sameAsExpected"
              >El certificado no pertenece a la persona de quien se requiere la firma</small
            >
          </div>
        </div>
        <div class="form-group">
          <label for="curp">CURP: </label>
          <input type="text" class="form-control" id="curp" v-model="curp" disabled />
        </div>
      </div>
      <div>
        <button type="button" class="btn btn-secondary" @click="validar()" :disabled="$v.certificatePem.$invalid || $v.cerRfc.$invalid || $v.password.$invalid">Validar</button>
        <button type="submit" class="btn btn-primary" value="Firmar" v-on:click="firmar()" :disabled="invalidFiles || !isCerValid">Firmar</button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" src="./signer.component.ts"></script>

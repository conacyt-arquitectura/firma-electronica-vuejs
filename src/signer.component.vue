<template>
  <div>
    <form @submit.prevent="validar()" role="form">
      <div>
        <div class="form-group">
          <label for="cert">Certificado: </label>
          <input type="file" class="form-control" id="cert" ref="cert" accept=".cer" @change="handleCertUpload()" />
        </div>
        <div class="form-group">
          <label for="cert">Llave privada: </label>
          <input id="key" class="form-control" ref="key" type="file" accept=".key" v-on:change="handleKeyUpload()" />
        </div>
        <div class="form-group">
          <label for="password">Contraseña: </label>
          <input id="password" class="form-control" type="password" v-model="password" />
        </div>
        <div class="form-group">
          <label for="rfc">RFC: </label>
          <input type="text" class="form-control" id="rfc" v-model="cerRfc" disabled />
        </div>
        <div class="form-group">
          <label for="curp">CURP: </label>
          <input type="text" class="form-control" id="curp" v-model="curp" disabled />
        </div>
      </div>
      <div>
        <button type="button" class="btn btn-secondary" @click="validar()" :disabled="!isCerValid">Validar</button>
        <button type="submit" class="btn btn-primary" value="Firmar" v-on:click="firmar()" :disabled="invalidFiles">Firmar</button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" src="./signer.component.ts"></script>

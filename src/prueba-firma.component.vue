<template>
  <div>
    <h1>PruebaFirma Component</h1>

    <table>
      <tr>
        <td>Certificado</td>
        <td>
          <input id="cert" ref="cert" type="file" accept=".cer" v-on:change="handleCertUpload()" />
        </td>
      </tr>

      <tr>
        <td>Llave</td>
        <td>
          <input id="key" ref="key" type="file" accept=".key" v-on:change="handleKeyUpload()" />
        </td>
      </tr>

      <tr>
        <td>RFC:</td>
        <td>
          <input type="text" readonly v-model="rfc" />
        </td>
      </tr>

      <tr>
        <td>Password:</td>
        <td><input id="password" type="password" v-model="password" /></td>
      </tr>
    </table>

    <input type="button" value="Firmar" v-on:click="process()" />
  </div>
</template>

<script lang="ts" src="./prueba-firma.component.ts"></script>

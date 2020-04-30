# Signer

## Getting started
To install with npm use `npm i signer`
To install with yarn use `yarn add signer`

## Usage
```
import Signer from 'signer';

Vue.use(SignerComponent, {
  validator: function(cer: string): Promise<boolean> {
    console.log("Usando validador de certificados dummy (siempre retorna true)...");
    return Promise.resolve(true);
  }
});

new Vue({
    el: '#app'
});
```

Para firma individual:
```
<div id="app">
    <signer v-model="model" :data="cadenaOriginal" :rfc="rfc" @signed="onSigned"></signer>
</div>
```
En este caso el evento `signed` no emite parámetros pero sí actualiza el `v-model` con el certificado y la firma correspondientes.

Para firma múltiple:
```
<div id="app">
    <signer v-model="model" :rfc="rfc" :producer="producer" @signed="onSigned"></signer>
</div>
```
En este caso el evento `signed` emite un _array_ con las firmas producidas. La estructura de cada objeto es: `{ id: number; signature: string }`

## Development
For development with Hot Replace Module use `npm run serve` for serving the `example` folder.

### Building
Use `npm run build` to produce the distribution files in `dist` folder.

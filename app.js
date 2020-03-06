var express = require('express');
var app = express();

//var path = require('path');
//var root = path.dirname(require.main.filename);

var fs = require('fs');
var jseu = require('js-encoding-utils');
var { Certificate, PrivateKey } = require('@fidm/x509');
var keyutils = require('js-crypto-key-utils');

const algoritmo = 'sha512';

async function prueba(cert, key, pass) {
    let keyObj;
    let certObj;

    try {
      keyObj = new keyutils.Key('der', fs.readFileSync(key));
      if (!keyObj.isEncrypted || !keyObj.isPrivate) {
        console.error('El archivo de la llave no es una llave privada');
        return false;
      }
  } catch (e) {
      console.error('No se pudo cargar la llave');
      return false;
    }

    try {
      certObj = jseu.formatter.binToPem(fs.readFileSync(cert), 'certificate');
    } catch(e) {
      console.error('No se pudo cargar el certificado');
      return false;
    }

    let privateKeyPem;

    if (keyObj.isEncrypted) {
      try {
        await keyObj.decrypt(pass);
        privateKeyPem = await keyObj.export('pem');
      } catch(e) {
        console.error('No se pudo desencriptar la llave, el password no parece ser corecto');
        return false;
      }
    }

    const data = Buffer.allocUnsafe(100); //'Esto es una prueba';
    let privateKey;

    try{
      let privateKeyPem = await keyObj.export('pem');
      privateKey = PrivateKey.fromPEM(privateKeyPem);
    } catch(e) {
      console.error('No se pudo generar el objeto de la llave');
      return false;
    }

    let ed25519Cert;

    try {
      ed25519Cert = Certificate.fromPEM(certObj);
    } catch(e) {
      console.error('No se pudo generar el objeto del certificado');
      return false;
    }

    let signature;

    try {
      signature = privateKey.sign(data, algoritmo)
    } catch(e) {
      console.error('No se pudo cifrar la información');
      return false;
    }

    try {
      if(ed25519Cert.publicKey.verify(data, signature, algoritmo)) {
        console.log('Válido');
      } else {
        console.error('Inválido');
      }
    } catch(e) {
      console.log('No se pudo hacer la verificación');
      return false;
    }

}

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(3000, function () {
    prueba('/home/usuario/tmp1/cert/GONM430818HP3/gonm430818hp3.cer', '/home/usuario/tmp1/cert/GONM430818HP3/GONM430818HP3.key', '12345678a'); //ok
    prueba('/home/usuario/tmp1/cert/GONM430818HP3/gonm430818hp3.cer', '/home/usuario/tmp1/cert/GONM430818HP3/GONM430818HP3.key', '12345678a11'); //not ok
    prueba('/home/usuario/tmp1/cert/GONM430818HP3/gonm430818hp3.cer', '/home/usuario/tmp1/cert/GUGA6307106T8/GUGA6307106T8.key', '12345678a11'); //not ok
    prueba('/home/usuario/tmp1/cert/GUGA6307106T8/guga6307106t8.cer', '/home/usuario/tmp1/cert/GONM430818HP3/GONM430818HP3.key', '12345678a'); //not ok

    console.log('Example app listening on port 3000!');
});

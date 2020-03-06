var express = require('express');
var app = express();

var path = require('path');
var root = path.dirname(require.main.filename);

var fs = require('fs');

var jseu = require('js-encoding-utils');


const { Certificate, PrivateKey } = require('@fidm/x509')

var keyutils = require('js-crypto-key-utils');

const certObj = fs.readFileSync(root + '/cert/GONM430818HP3/gonm430818hp3.cer');
const keyObj = new keyutils.Key('der', fs.readFileSync(root + '/cert/GONM430818HP3/GONM430818HP3.key'));
const yourPassphrase = '12345678a';

async function prueba(pemCert) {
    const isEncrypted = keyObj.isEncrypted;

    if (isEncrypted) {
        //console.log("isEncrypted")

        await keyObj.decrypt(yourPassphrase);

        let privateKeyPem = await keyObj.export('pem');

        //console.log('Private: ' + privateKeyPem);

        const privateKey = PrivateKey.fromPEM(privateKeyPem);

        let pem;

        if(keyObj.isPrivate) pem = await keyObj.export('pem', {outputPublic: true});

        //console.log('Public: ' + pem);


        const data = 'Esto es una prueba';

        const signature = privateKey.sign(data, 'sha256')

        const ed25519Cert = Certificate.fromPEM(pemCert);

        //console.log('json: ' + ed25519Cert.subject);

        //console.log('CERT: ' + pemCert);


        if (ed25519Cert.publicKey.verify(data, signature, 'sha256')) {
          console.error('Es válido');
        } else {
          console.error('No es válido');
        }


    }

}

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(3000, function () {
    try {
        const pemCert = jseu.formatter.binToPem(certObj, 'certificate');

        prueba(pemCert);
    } catch(e) {
        console.error(e);
    }


    console.log('Example app listening on port 3000!');
});

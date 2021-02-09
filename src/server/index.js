require('dotenv').config();
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const request = require('request');
const winston = require('winston');
const express = require('express');
const http = require('http');
const https = require('https');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const ABI = require('./abi.json');

const { ethers, BigNumber } = require('ethers');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const ENV = process.env;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.add(new winston.transports.Console({
  format: winston.format.simple()
}));

// const api = axios.create({
//   baseURL: 'https://api.digitalocean.com/',
//   responseType: 'json',
//   crossDomain: true
// });

// axios.defaults.headers.common.Authorization = secrets.digitalocean_key;

const PROVIDER = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${ ENV.INFURA }`,'mainnet');
const contract = new ethers.Contract(ENV.CONTRACT_ADDRESS, ABI, PROVIDER);

let galleryData = [];
function pollGalleryData() {
  contract.totalSupply().then((result) => {
    const allData = [];
    let totalCount = result.toNumber();
    for (let i = 0; i < result.toNumber(); i++) {
      allData.push(new Promise((resolve, reject) => {
        const id = i;
        return contract.tokenByIndex(BigNumber.from(i)).then((result2) => {
          return contract.tokenURI(BigNumber.from(result2)).then((result3) => {
            return request({
              url: `https://ipfs.io/ipfs/${ result3.split('/')[3] }`,
              method: 'GET',
            }, (err, response, body) => {
              let error = false;
              let json;
              try {
                json = JSON.parse(body);
              } catch (e) {
                error = true;
              }
              
              if (json && !error) {
                json.id = id;
                json.animation_url = json.animation_url.replace('ipfs://ipfs', 'https://ipfs.io/ipfs');
                json.image = json.image.replace('ipfs://ipfs', 'https://ipfs.io/ipfs');
                return resolve(json);
              } else {
                return reject();
              }
            });
          })
        });
      }).catch((err) => console.log('wtf', err)));
    }

    Promise.all(allData).then(results => {
      let complete = true;
      for (let i = 0; i < results.length; i++) {
        if (!results[i]) complete = false;
      }
      if (complete) galleryData = results;
      else console.log('Issue pulling all data');
    });
  });
}

pollGalleryData();
setInterval(() => {
  pollGalleryData();
}, 500000)

app.get('/galleryData', (req, res) => {
  res.json(galleryData);
});

app.use(express.static('dist'));

let server;
if (ENV.ENV === 'DEV') {
    server = http.createServer(app);
} else {
  const options = {
      key:  fs.readFileSync(`${ ENV.SSL_PATH }/privkey.pem`, 'utf8'),
      cert: fs.readFileSync(`${ ENV.SSL_PATH }/fullchain.pem`, 'utf8')
  };
  server = https.createServer(options, app);
}

server.listen(7777);

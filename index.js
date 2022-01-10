require('dotenv').config();
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const express = require('express');
const http = require('http');
const https = require('https');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cluster = require('cluster');
const totalCPUs = require('os').cpus().length;

// if (cluster.isMaster) {
//   console.log(`Number of CPUs is ${totalCPUs}`);
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers.
//   for (let i = 0; i < totalCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//     console.log("Let's fork another worker!");
//     cluster.fork();
//   });

// } else {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json({ limit: '200mb' }));
  app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
  app.use(express.json({ limit: '200mb' }));

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


  require('./src/server/models/user/userModel.js');
  require('./src/server/models/program/programModel.js');
  require('./src/server/models/gallery/galleryModel.js');

  require('./src/server/models/user/userRoutes.js')(app);
  require('./src/server/models/program/programRoutes.js')(app);
  require('./src/server/models/gallery/galleryRoutes.js')(app);
  require('./src/server/services/eth-service.js')(app);
  mongoose.connect(ENV.MONGO);


  app.use(express.static('dist'));
  app.use((req, res) => {
    const route = req.originalUrl.split('/')[1];
    const allowedRoutes = [
      'nft', 'ethos', 'apply', 'committee', 'program', 'curation', 'register',
      'donate', 'tutorial', , 'testimony', 'rarible', 'opensea', 'resources',
      'login', 'register', 'art', 'account', 'verifyemail', 'gallery', 'nominee',
      'recoveraccount', 'forgotpassword', 'curator', 'create-program'
      ];
      
    if (allowedRoutes.indexOf(route) > -1) {
      res.sendFile(`${ __dirname }${ path.join('/dist/index.html') }`);
    } else if (route === 'social.png') {
      res.sendFile(`${ __dirname }${ path.join('/public/social.png') }`);
    } else {
      res.sendFile(`${ __dirname }${ path.join('/dist/index.html') }`);
    }
  })

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
// }
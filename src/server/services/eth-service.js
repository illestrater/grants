require('dotenv').config()
 
const Web3 = require('web3')
const axios = require('axios')
const fs = require('fs');
const log = require('ololog').configure({ time: true })
const Arweave = require('arweave');
const fetch = require('node-fetch');
const hre = require("hardhat")
const nodemailer = require('nodemailer');

const templates = require('../emails/templates');
const auth = require('./authorization-service');
const Sevens = require('../../../artifacts/contracts/Sevens.sol/Sevens.json');
const SevensFactory = require('../../../artifacts/contracts/SevensFactory.sol/SevensFactory.json');
const GenesisERC721 = require('./GenesisERC721.json');

const User = require('mongoose').model('User');
const Organizer = require('mongoose').model('Organizer');
const Program = require('mongoose').model('Program');
const ProgramApplicant = require('mongoose').model('ProgramApplicant');

const arweave = Arweave.init({
  host: 'arweave.net',// Hostname or IP address for a Arweave host
  port: 443,          // Port
  protocol: 'https',  // Network protocol http or https
  timeout: 20000,     // Network request timeouts in milliseconds
  logging: false,     // Enable network request logging
});

const mainnet = `https://mainnet.infura.io/v3/${process.env.INFURA}`
const mainnetWS = `wss://mainnet.infura.io/ws/v3/${process.env.INFURA}`
const web3 = new Web3( new Web3.providers.HttpProvider(mainnet) )
const web3WS = new Web3( new Web3.providers.WebsocketProvider(mainnetWS) )

const matic = 'https://rpc-mainnet.matic.network';
const maticWS = 'wss://rpc-mainnet.matic.quiknode.pro';
const web3Matic = new Web3( new Web3.providers.HttpProvider(matic) )
const web3MaticWS = new Web3( new Web3.providers.WebsocketProvider(maticWS) )

const MINT_WALLET = process.env.WALLET;
web3.eth.defaultAccount = MINT_WALLET;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;

const transporter = nodemailer.createTransport({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SES_USER,
    pass: process.env.SES_PASS
  }
});


const getCurrentGasPrices = async () => {
  let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
  let prices = {
    low: response.data.safeLow / 10,
    medium: response.data.average / 10,
    high: response.data.fast / 10,
    super: response.data.fastest / 10
  }
 
  console.log("\r\n")
  log (`Current ETH Gas Prices (in GWEI):`.cyan)
  console.log("\r\n")
  log(`Low: ${prices.low} (transaction completes in < 30 minutes)`.green)
  log(`Standard: ${prices.medium} (transaction completes in < 5 minutes)`.yellow)
  log(`Fast: ${prices.high} (transaction completes in < 2 minutes)`.red)
  log(`Fastest: ${prices.super} (transaction completes in < 1 minutes)`.red)
  console.log("\r\n")
 
  return prices
}

const mint = async (applicants, program, organizer) => {
  try {
    let myBalanceWei = await web3.eth.getBalance(web3.eth.defaultAccount).then(balance => balance)
    let myBalance = await web3.utils.fromWei(myBalanceWei, 'ether');

    log(`Your wallet balance is currently ${myBalance} ETH`.green)
    const address = program.contractAddress;
    let Contract;
    if (program.contractAddress === '0xc0b4777897a2a373da8cb1730135062e77b7baec') { // No royalties Genesis Grant
      Contract = new web3.eth.Contract(GenesisERC721, address);
    } else {
      Contract = new web3.eth.Contract(Sevens.abi, address);
    }
    const rawdata = await fs.readFileSync('./arweave.json');
    const wallet = JSON.parse(rawdata);
    let total;

    for (const applicant of applicants) {
      if (applicant.user) {
        const block = await web3.eth.getBlock('latest');
        const user = await User.findById(applicant.user, user => user);
        if (user) {
          let file = await fetch(`https://cdn.grants.art/${ applicant.art }`)
            .then(res => res.buffer())
            .catch(function() {
              throw new Error('FETCH ERROR');
            });

          let transaction = await arweave.createTransaction({ data: file }, wallet);
          const ext = applicant.art.substr(applicant.art.length - 3).toLowerCase();
          let responsetype;
          if (ext === 'jpg' || ext === 'jpeg') responsetype = 'image/jpeg';
          if (ext === 'png') responsetype = 'image/png';
          if (ext === 'gif') responsetype = 'image/gif';
          if (ext === 'ebp') responsetype = 'image/webp';
          if (ext === 'mp4') responsetype = 'video/mp4';
          transaction.addTag('Content-Type', responsetype);
          await arweave.transactions.sign(transaction, wallet);
          let uploader = await arweave.transactions.getUploader(transaction);

          while (!uploader.isComplete) {
            await uploader.uploadChunk();
            console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
          }

          const metadata = {
            minter: "0xEbfDF56E9c9A643c8abc13A4fbD679ed02F9ceb4",
            mintedOn: "2021-03-14T00:00:00.777Z",
            contractAddress: address,
            minted: `Minted by ${ organizer.name } for ${ user.artistName }`,
            note: 'Minted with love by Sevens Foundation',
            exhibition: `${ program.name }`,
            fiatPrice: "$PRICELESS",
            name: `${ applicant.title }`,
            description: `${ applicant.description }`,
            youtube_url: "",
            price: 0,
            ethPrice: "0",
            amountToMint: 1,
            visibility: "safe",
            forSale: false,
            image: `https://arweave.net/${ transaction.id }`,
            attributes: [
              {
                trait_type: 'Artist',
                value: user.artistName || ''
              },
              {
                trait_type: 'Birth Year',
                value: user.birthYear || ''
              },
              {
                trait_type: 'Country of Representation',
                value: user.country || ''
              },
              {
                trait_type: 'Country Code',
                value: user.countryCode || ''
              },
              {
                trait_type: 'City',
                value: user.city || ''
              },
              {
                trait_type: 'Website',
                value: user.website || ''
              },
              {
                trait_type: 'Twitter',
                value: user.twitter || ''
              },
              {
                trait_type: 'Instagram',
                value: user.instagram || ''
              },
              {
                trait_type: 'Address',
                value: user.wallet || ''
              },
              {
                trait_type: 'Artwork',
                value: `https://arweave.net/${ transaction.id }`
              },
            ],
            category: "alJuInV4dezvHTNU8Dp1",
            external_url: `https://grants.art/${ program.url }/${ applicant.order }`,
            type: "ERC721"
          };

          let metadataTx = await arweave.createTransaction({ data: Buffer.from(JSON.stringify(metadata)) }, wallet);
          metadataTx.addTag('Content-Type', 'application/json');

          await arweave.transactions.sign(metadataTx, wallet);

          let metadataUploader = await arweave.transactions.getUploader(metadataTx);

          while (!metadataUploader.isComplete) {
            await metadataUploader.uploadChunk();
            console.log(`${metadataUploader.pctComplete}% complete, ${metadataUploader.uploadedChunks}/${metadataUploader.totalChunks}`);
          }

          applicant.arweave = transaction.id;
          console.log(metadataTx.id);

          const mintTo = program.mintToArtist ? user.wallet : organizer.wallet;
          let batchMint;
          if (program.contractAddress === '0xc0b4777897a2a373da8cb1730135062e77b7baec') { // No royalties Genesis Grant
            batchMint = Contract.methods.batchMint(mintTo, Number(1), metadataTx.id, Number(0))
          } else {
            batchMint = Contract.methods.batchMint(mintTo, Number(1), metadataTx.id, Number(0), [user.wallet], [1000])
          }

          const encoded = batchMint.encodeABI();

          let nonce = await web3.eth.getTransactionCount(web3.eth.defaultAccount);

          let gasPrices = await getCurrentGasPrices()
          let estimatedGas = await web3.eth.estimateGas({
            to: address,
            data: encoded
          });


          var tx = {
            nonce,
            to: address,
            from: MINT_WALLET,
            gas: new web3.utils.BN(Math.ceil(estimatedGas * 1.5)),
            gasLimit: Math.ceil(block.gasLimit * 1.5),
            gasPrice: Math.ceil(gasPrices.super * 1000000000),
            data: encoded
          }

          console.log(applicant);

          await new Promise((resolve, reject) => {
            web3.eth.accounts.signTransaction(tx, process.env.WALLET_PRIVATE_KEY)
              .then(signed => {
                console.log('signed', signed);
                var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

                  tran.on('confirmation', (confirmationNumber, receipt) => {
                    if (confirmationNumber > 1) {
                      tran.off('error');
                      tran.off('receipt');
                      tran.off('transactionHash');
                      tran.off('confirmation');
                      transporter.sendMail(templates.minted(user.email, user.artistName, program.name, `https://grants.art/${ program.url }/${ applicant.order }`));
                      resolve();
                    }
                    console.log('confirmation: ' + confirmationNumber);
                  });

                  tran.on('transactionHash', hash => {
                    applicant.published = true;
                    applicant.finalized = true;
                    applicant.accepted = true;
                    applicant.save();
                    program.total = applicant.order;
                    total = program.total;
                    program.save();
                    console.log('hash');
                    console.log(hash);
                  });

                  tran.on('receipt', receipt => {
                    console.log('reciept');
                    console.log(receipt);
                  });

                  tran.on('error', error => {
                    console.log(error.toString());
                    throw new Error(error.toString());
                  });
              });
          });
        }
      }
    }

    program.mintInProgress = false;
    if (total) program.total = total;
    program.save();
  } catch (err) {
    console.log('ERROR MINTING', err)
    program.mintInProgress = false;
    program.save();
  }
}


const addMinterAndTransfer = async (wallet, address, program) => {
  try {
    let myBalanceWei = await web3.eth.getBalance(web3.eth.defaultAccount).then(balance => balance)
    let myBalance = await web3.utils.fromWei(myBalanceWei, 'ether');
    const block = await web3.eth.getBlock('latest');

    log(`Your wallet balance is currently ${myBalance} ETH`.green)
    const Contract = new web3.eth.Contract(Sevens.abi, address);
    const ContractWS = new web3WS.eth.Contract(Sevens.abi, address);
    const encoded = Contract.methods.addMinter(wallet).encodeABI();

    let nonce = await web3.eth.getTransactionCount(web3.eth.defaultAccount);
    let gasPrices = await getCurrentGasPrices()

    let estimatedGas = await web3.eth.estimateGas({
      to: address,
      data: encoded
    });

    let tx = {
      nonce,
      to: address,
      from: MINT_WALLET,
      gas: new web3.utils.BN(Math.ceil(estimatedGas * 1.5)),
      gasLimit: Math.ceil(block.gasLimit * 1.5),
      gasPrice: Math.ceil(gasPrices.high * 1000000000),
      data: encoded
    }

    console.log(tx);

    await new Promise((resolve, reject) => {
      web3.eth.accounts.signTransaction(tx, process.env.WALLET_PRIVATE_KEY)
        .then(signed => {
          const addMinter = ContractWS.events.MinterAdded();
          addMinter.on('data', (event) => {
            console.log('MINTER ADDED', event);
            addMinter.off('data');
            resolve();
          })

          web3.eth.sendSignedTransaction(signed.rawTransaction);
      });
    });

    const transferEncoded = Contract.methods.transferOwnership(wallet).encodeABI();

    nonce = await web3.eth.getTransactionCount(web3.eth.defaultAccount);
    gasPrices = await getCurrentGasPrices()

    estimatedGas = await web3.eth.estimateGas({
      to: address,
      data: transferEncoded
    });

    tx = {
      nonce,
      to: address,
      from: MINT_WALLET,
      gas: new web3.utils.BN(Math.ceil(estimatedGas * 1.5)),
      gasLimit: Math.ceil(block.gasLimit * 1.5),
      gasPrice: Math.ceil(gasPrices.high * 1000000000),
      data: transferEncoded
    }

    await new Promise((resolve, reject) => {
      web3.eth.accounts.signTransaction(tx, process.env.WALLET_PRIVATE_KEY)
        .then(signed => {
          const transferred = ContractWS.events.OwnershipTransferred();
          transferred.on('data', (event) => {
            console.log('OWNERSHIP TRANSFERRED', event);
            program.ownershipTransferred = true;
            program.save();
            transferred.off('data');
            resolve();
          });

          web3.eth.sendSignedTransaction(signed.rawTransaction);
      });
    });

  } catch (err) {
    console.log('ERROR MINTING', err)
  }
}

const verifyEtherScan = async (address, name, symbol) => {
  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: [
        name,
        symbol,
        'https://arweave.net/',
        MINT_WALLET,
        MINT_WALLET
      ],
      network: 'mainnet'
    })
  } catch (err) {
    console.log('ERR VERIFYING CONTRACT');
  }
}

const createExhibition = async (wallet, name, symbol, program) => {
  console.log('CREATING', wallet, name, symbol);

  try {
    let myBalanceWei = await web3.eth.getBalance(web3.eth.defaultAccount).then(balance => balance)
    let myBalance = await web3.utils.fromWei(myBalanceWei, 'ether');
    const block = await web3.eth.getBlock('latest');

    log(`Your wallet balance is currently ${myBalance} ETH`.green)
    const Contract = new web3.eth.Contract(SevensFactory.abi, FACTORY_ADDRESS);
    const ContractWS = new web3WS.eth.Contract(SevensFactory.abi, FACTORY_ADDRESS);
    const encoded = Contract.methods.launchStore(name, symbol, 'https://arweave.net/').encodeABI();

    let nonce = await web3.eth.getTransactionCount(web3.eth.defaultAccount);
    let gasPrices = await getCurrentGasPrices()

    let estimatedGas = await web3.eth.estimateGas({
      to: FACTORY_ADDRESS,
      data: encoded
    });

    let tx = {
      nonce,
      to: FACTORY_ADDRESS,
      from: MINT_WALLET,
      gas: new web3.utils.BN(Math.ceil(estimatedGas * 1.5)),
      gasLimit: Math.ceil(block.gasLimit * 1.5),
      gasPrice: Math.ceil(gasPrices.high * 1000000000),
      data: encoded
    }

    console.log(tx);

    await new Promise((resolve, reject) => {
      web3.eth.accounts.signTransaction(tx, process.env.WALLET_PRIVATE_KEY)
        .then(signed => {
          const launch = ContractWS.events.StoreLaunch();
          launch.on('data', (event) => {
            console.log('GOT EVENT', event);
            if (event && event.returnValues) {
              if (event.returnValues['1'] === name && event.returnValues['2'] === symbol) {
                const address = event.returnValues['0'];
                program.contractAddress = address;
                program.creationInProgress = false;
                program.save();

                launch.off('data');

                addMinterAndTransfer(wallet, address, program);
                verifyEtherScan(address, name, symbol);
                resolve(program);
              }
            }
          })

          web3.eth.sendSignedTransaction(signed.rawTransaction);
      });
    });
  } catch (err) {
    console.log('ERROR MINTING', err)
    program.creationInProgress = false;
    program.save();
  }
};


const consolationTransfer = async (address, wallet, title, description, symbol, program) => {
  try {
    let myBalanceWei = await web3Matic.eth.getBalance('0xEbfDF56E9c9A643c8abc13A4fbD679ed02F9ceb4').then(balance => balance)
    let myBalance = await web3Matic.utils.fromWei(myBalanceWei, 'ether');
    const block = await web3Matic.eth.getBlock('latest');

    log(`Your wallet balance is currently ${myBalance} ETH`.green)
    const Contract = new web3Matic.eth.Contract(Sevens.abi, address);
    const ContractWS = new web3MaticWS.eth.Contract(Sevens.abi, address);
    const encoded = Contract.methods.addMinter(wallet).encodeABI();

    let nonce = await web3Matic.eth.getTransactionCount('0xEbfDF56E9c9A643c8abc13A4fbD679ed02F9ceb4');
    let gasPrices = await getCurrentGasPrices()

    let tx = {
      nonce,
      to: address,
      from: MINT_WALLET,
      gas: 10000000,
      gasLimit: Math.ceil(block.gasLimit * 1.5),
      gasPrice: Math.ceil(gasPrices.high * 1000000000),
      data: encoded
    }

    console.log(tx);

    await new Promise((resolve, reject) => {
      web3Matic.eth.accounts.signTransaction(tx, process.env.WALLET_PRIVATE_KEY)
        .then(signed => {
          const addMinter = ContractWS.events.MinterAdded();
          addMinter.on('data', (event) => {
            console.log('MINTER ADDED', event);
            addMinter.off('data');
            resolve();
          })

          web3Matic.eth.sendSignedTransaction(signed.rawTransaction);
      });
    });

    const transferEncoded = Contract.methods.transferOwnership(wallet).encodeABI();

    nonce = await web3Matic.eth.getTransactionCount('0xEbfDF56E9c9A643c8abc13A4fbD679ed02F9ceb4');
    gasPrices = await getCurrentGasPrices()

    tx = {
      nonce,
      to: address,
      from: MINT_WALLET,
      gas: 10000000,
      gasLimit: Math.ceil(block.gasLimit * 1.5),
      gasPrice: Math.ceil(gasPrices.high * 1000000000),
      data: transferEncoded
    }

    await new Promise((resolve, reject) => {
      web3Matic.eth.accounts.signTransaction(tx, process.env.WALLET_PRIVATE_KEY)
        .then(signed => {
          const transferred = ContractWS.events.OwnershipTransferred();
          transferred.on('data', (event) => {
            console.log('OWNERSHIP TRANSFERRED', event);
            transferred.off('data');
            resolve();
          });

          web3Matic.eth.sendSignedTransaction(signed.rawTransaction);
      });
    }).then(() => {
      consolationPrize(address, wallet, title, description, symbol, program);
    });

  } catch (err) {
    console.log('ERROR MINTING', err)
  }
}


const MATIC_FACTORY = '0x911238C7c62329E9CbFB1Eda63575B6a51CA8630'
const createConsolationContract = async (wallet, title, description, symbol, program) => {
  try {
    let myBalanceWei = await web3Matic.eth.getBalance('0xEbfDF56E9c9A643c8abc13A4fbD679ed02F9ceb4').then(balance => balance)
    let myBalance = await web3Matic.utils.fromWei(myBalanceWei, 'ether');
    const block = await web3Matic.eth.getBlock('latest');

    const Contract = new web3Matic.eth.Contract(SevensFactory.abi, MATIC_FACTORY);
    const ContractWS = new web3MaticWS.eth.Contract(SevensFactory.abi, MATIC_FACTORY);
    const encoded = Contract.methods.launchStore(`${ program.name } Participant`, symbol, 'https://arweave.net/').encodeABI();

    let nonce = await web3Matic.eth.getTransactionCount('0xEbfDF56E9c9A643c8abc13A4fbD679ed02F9ceb4');
    let gasPrices = await getCurrentGasPrices()

    let tx = {
      nonce,
      to: MATIC_FACTORY,
      from: MINT_WALLET,
      gas: 5000000,
      gasLimit: Math.ceil(block.gasLimit * 1.5),
      gasPrice: Math.ceil(gasPrices.high * 1000000000),
      data: encoded
    }

    console.log(tx);

    await new Promise((resolve, reject) => {
      web3Matic.eth.accounts.signTransaction(tx, process.env.WALLET_PRIVATE_KEY)
        .then(signed => {
          const launch = ContractWS.events.StoreLaunch();
          launch.on('data', (event) => {
            console.log('GOT EVENT', event);
            if (event && event.returnValues) {
              if (event.returnValues['1'] === `${ program.name } Participant` && event.returnValues['2'] === '777') {
                const address = event.returnValues['0'];
                console.log('GOT ADDRESS', address);

                launch.off('data');

                consolationTransfer(address, wallet, title, description, symbol, program);
                resolve();
              }
            }
          })

          web3Matic.eth.sendSignedTransaction(signed.rawTransaction);
      });
    });
  } catch (err) {
    console.log('ERROR MINTING', err)
  }
}

const consolationPrize = async (address, curatorWallet, title, description, unused2, program) => {
  try {
    let myBalanceWei = await web3Matic.eth.getBalance('0xEbfDF56E9c9A643c8abc13A4fbD679ed02F9ceb4').then(balance => balance)
    let myBalance = await web3Matic.utils.fromWei(myBalanceWei, 'ether');

    console.log(`Your wallet balance is currently ${myBalance} ETH`)
    // const address = '0x5A0bed0F3fAD6Ef57711f24F8A4089699F65CFaB';
    let Contract = new web3Matic.eth.Contract(Sevens.abi, address);

    const rawdata = await fs.readFileSync('./arweave.json');
    const wallet = JSON.parse(rawdata);

    const block = await web3Matic.eth.getBlock('latest');

    let file = await fetch(`https://cdn.grants.art/${ program.consolationURL }`)
      .then(res => res.buffer())
      .catch(function() {
        throw new Error('FETCH ERROR');
      });

    let transaction = await arweave.createTransaction({ data: file }, wallet);
    // const ext = applicant.art.substr(applicant.art.length - 3).toLowerCase();
    const ext = 'png';
    let responsetype;
    if (ext === 'jpg' || ext === 'jpeg') responsetype = 'image/jpeg';
    if (ext === 'png') responsetype = 'image/png';
    if (ext === 'gif') responsetype = 'image/gif';
    if (ext === 'ebp') responsetype = 'image/webp';
    if (ext === 'mp4') responsetype = 'video/mp4';
    transaction.addTag('Content-Type', responsetype);
    await arweave.transactions.sign(transaction, wallet);
    let uploader = await arweave.transactions.getUploader(transaction);

    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
    }

    const metadata = {
      minter: "0xEbfDF56E9c9A643c8abc13A4fbD679ed02F9ceb4",
      mintedOn: "2021-03-14T00:00:00.777Z",
      contractAddress: address,
      minted: `Minted with love by Sevens Foundation`,
      fiatPrice: "$PRICELESS",
      name: title,
      description: description,
      youtube_url: "",
      price: 0,
      ethPrice: "0",
      amountToMint: 1,
      visibility: "safe",
      forSale: false,
      image: `https://arweave.net/${ transaction.id }`,
      attributes: [
        {
          trait_type: 'Artwork',
          value: `https://arweave.net/${ transaction.id }`
        },
      ],
      category: "alJuInV4dezvHTNU8Dp1",
      external_url: `https://grants.art/${ program.url }`,
      type: "ERC721"
    };

    let metadataTx = await arweave.createTransaction({ data: Buffer.from(JSON.stringify(metadata)) }, wallet);
    metadataTx.addTag('Content-Type', 'application/json');

    await arweave.transactions.sign(metadataTx, wallet);

    let metadataUploader = await arweave.transactions.getUploader(metadataTx);

    while (!metadataUploader.isComplete) {
      await metadataUploader.uploadChunk();
      console.log(`${metadataUploader.pctComplete}% complete, ${metadataUploader.uploadedChunks}/${metadataUploader.totalChunks}`);
    }

    console.log(metadataTx.id);

    const applicants = await ProgramApplicant.find({ program: program.id }).populate('user', 'wallet').sort(program.advancedCuration ? '-score' : '-approvalCount');
    console.log('got applicants', applicants);
    for (const applicant of applicants) {
      console.log('checking', applicant.user.wallet);
      let batchMint;
      batchMint = Contract.methods.batchMint(applicant.user.wallet, Number(1), metadataTx.id, Number(0), [curatorWallet], [1000])
      const encoded = batchMint.encodeABI();
      let nonce = await web3Matic.eth.getTransactionCount('0xEbfDF56E9c9A643c8abc13A4fbD679ed02F9ceb4');

      let gasPrices = await getCurrentGasPrices()

      var tx = {
        nonce,
        to: address,
        from: MINT_WALLET,
        gas: 3000000,
        gasLimit: Math.ceil(block.gasLimit * 1.5),
        gasPrice: Math.ceil(gasPrices.super * 1000000000),
        data: encoded
      }

      await new Promise((resolve, reject) => {
        web3Matic.eth.accounts.signTransaction(tx, process.env.WALLET_PRIVATE_KEY)
          .then(signed => {
            console.log('signed', signed);
            var tran = web3Matic.eth.sendSignedTransaction(signed.rawTransaction);

              tran.on('confirmation', (confirmationNumber, receipt) => {
                if (confirmationNumber > 1) {
                  tran.off('error');
                  tran.off('receipt');
                  tran.off('transactionHash');
                  tran.off('confirmation');
                  resolve();
                }
                console.log('confirmation: ' + confirmationNumber);
              });

              tran.on('transactionHash', hash => {
                console.log('hash', hash);
              });

              tran.on('receipt', receipt => {
                console.log('reciept', receipt);
              });

              tran.on('error', error => {
                console.log(error.toString());
                throw new Error(error.toString());
              });
          });
      });
    }
  }
  catch (err) {
    console.log('ERROR MINTING', err)
  }
};

module.exports = (app) => {
  app.post('/api/program/mint', async (req, res) => {
    const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
    const organizer = await Organizer.findOne({ _id: req.body.org, admins: jwt.id });
    if (!organizer) return res.json({ error: 'Authentication error' });
    const program = await Program.findById(req.body.id);
    if (!program) return res.json({ error: 'Authentication error' });
    if (!program.contractAddress) return res.json({ error: 'The collection contract does not exist' });
    if (program.mintInProgress) return res.json({ error: 'Minting is already in progress' });
    if (!program.mintToArtist && !organizer.wallet) return res.json({ error: 'Curator must verify wallet' });

    ProgramApplicant.find({ program: req.body.id, order: { $exists: true }, published: false }, (err, applicants) => {
      program.mintInProgress = true;
      program.exhibiting = true;
      program.save();

      mint(applicants, program, organizer);
    }).sort('order');
  });

  app.post('/api/program/createExhibition', async (req, res) => {
    const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
    const organizer = await Organizer.findOne({ _id: req.body.org, admins: jwt.id });
    if (!organizer) return res.json({ error: 'Authentication error' });
    const program = await Program.findById(req.body.program);
    if (!program) return res.json({ error: 'Authentication error' });
    if (program.creationInProgress) return res.json({ error: 'Contract creation is already in progress' });
    if (program.contractAddress) return res.json({ error: 'Contract already created' });
    if (!req.body.wallet) return res.json({ error: 'No wallet provided' });
    if (!req.body.name || !req.body.symbol) return res.json({ error: 'Missing contract name or symbol' });
    organizer.wallet = req.body.wallet;
    organizer.save();

    program.creationInProgress = true;
    program.save();

    createExhibition(req.body.wallet, req.body.name, req.body.symbol, program);
    return res.json({ success: 'Creation started' });
  });

  app.post('/api/program/consolationPrize', async (req, res) => {
    const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
    const organizer = await Organizer.findOne({ _id: req.body.org, admins: jwt.id });
    if (!organizer) return res.json({ error: 'Authentication error' });
    const program = await Program.findById(req.body.program);
    if (!program) return res.json({ error: 'Authentication error' });
    if (program.prizeRewarded) return res.json({ error: 'Prizes have already been distributed' });
    if (!req.body.wallet) return res.json({ error: 'No wallet provided' });
    if (!req.body.title || !req.body.description) return res.json({ error: 'Missing NFT Name / Description' });
    if (!program.consolationURL) return res.json({ error: 'Missing artwork' });

    createConsolationContract(req.body.wallet, req.body.title, req.body.description, '777', program);
    
    program.prizeRewarded = true;
    program.save();

    return res.json({ success: 'Minting started' });
  });
}

// const remint = async () => {
//     const organizer = await Organizer.findById('607e2ca3518c76980b16348e');
//     if (!organizer) console.log('yo 1');
//     const program = await Program.findById('607e2ca3518c76980b16348f');
//     console.log('wtf', program);
//     if (!program) console.log('yo 2');
//     if (!program.contractAddress) console.log('yo 3');
//     if (program.mintInProgress) console.log('yo 4');
//     if (!program.mintToArtist && !organizer.wallet) console.log('yo 5');

//     ProgramApplicant.find({ program: '607e2ca3518c76980b16348f', order: { $in: [1, 3, 4, 8, 13, 14] } }, (err, applicants) => {
//       console.log('applicants!', organizer);
//       program.mintInProgress = true;
//       program.exhibiting = true;
//       program.save();

//       mint(applicants, program, organizer);
//     }).sort('order');
// }

// remint();

// module.exports = (app) => {
//   app.post('/api/program/addMinterAndTransfer', async (req, res) => {
//     const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
//     const organizer = await Organizer.findOne({ _id: req.body.org, admins: jwt.id });
//     if (!organizer) return res.json({ error: 'Authentication error' });
//     const program = await Program.findById(req.body.program);
//     if (!program) return res.json({ error: 'Authentication error' });
//     if (program.creationInProgress) return res.json({ error: 'Contract creation is already in progress' });
//     if (!req.body.wallet) return res.json({ error: 'No wallet provided' });
//     if (!req.body.name || !req.body.symbol) return res.json({ error: 'Missing contract info' });

//     addMinterAndTransfer(req.body.wallet, program.contractAddress, program);
//     return res.json({ success: 'Creation started' });
//   });
// }


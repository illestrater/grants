import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import useInterval from '@use-it/interval';
import { OpenSeaPort, Network, EventType } from 'opensea-js';
import ReactModal from 'react-modal';
import DatePicker from 'react-mobile-datepicker';
import Web3 from 'web3';
import moment from 'moment';

import OpenSeaLogo from '../../assets/opensea.png';
import AuctionTimer from './AuctionTimer';
import '../../styles.scss';

function openLink(page)
{
  let win = window.open(page, '_blank');
  win.focus();
}

function roundNext15Min(date) {
  var intervals = Math.floor(date.minutes() / 15);
  if(date.minutes() % 15 != 0) intervals++;
  if(intervals == 4) {
    date.add('hours', 1);
      intervals = 0;
  }

  date.minutes(intervals * 15);
  date.seconds(0);
  return date;
}

const monthMap = {
	'1': 'Jan',
	'2': 'Feb',
	'3': 'Mar',
	'4': 'Apr',
	'5': 'May',
	'6': 'Jun',
	'7': 'Jul',
	'8': 'Aug',
	'9': 'Sep',
	'10': 'Oct',
	'11': 'Nov',
	'12': 'Dec',
};

const dateConfig = {
	'month': {
		format: value => monthMap[value.getMonth() + 1],
		caption: 'Month',
		step: 1,
	},
	'date': {
		format: 'DD',
		caption: 'Day',
		step: 1,
	},
  'hour': {
    format: 'hh',
    caption: 'Hour',
    step: 1,
  },
  'minute': {
    format: 'mm',
    caption: 'Min',
    step: 15,
  },
};


export default function OpenMarket({ tokenId, contract }) {
  const auth = useStoreState(state => state.user.auth);

  // contract = '0x3f4200234e26d2dfbc55fcfd9390bc128d5e2cca';
  // tokenId = 10;

  const [gotAsset, setAsset] = useState({});
  const [provider, setProvider] = useState(null);
  const [seaport, setSeaport] = useState(null);
  const [bids, setBids] = useState(null);
  const [auction, setAuction] = useState(null);
  const [auctionEnd, setAuctionEnd] = useState(null);
  const [listed, setListed] = useState(null);
  const [balance, setBalance] = useState(null);

  function getAsset() {
    fetch(`https://api.opensea.io/api/v1/assets?asset_contract_address=${ contract }&token_ids=${ tokenId }`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(res => res.json())
    .then(json => setAsset(json));
  }

  async function pollBids() {
    if (seaport) {
      const { count, orders } = await seaport.api.getOrders({
        asset_contract_address: contract,
        token_id: tokenId,
      })

      let newBids = [];
      let end;
      let foundListed = false;
      if (orders && orders.length) {
        orders.forEach(order => {
          if (order.side === 1 && order.waitingForBestCounterOrder) {
            end = order.listingTime.toNumber() * 1000;
            foundListed = true;
            setAuction(order);
          } else if (order.side === 1 && !order.waitingForBestCounterOrder) {
            foundListed = true;
            setListed(order);
          } else if (order.side === 0) {
            order.value = Number(Web3.utils.fromWei(order.basePrice.toString(), 'ether'));
            order.user = (order.makerAccount && order.makerAccount.user) ? order.makerAccount.user.username : 'Anonymous';
            order.time = order.listingTime.toNumber() * 1000;
            newBids.push(order);
          }
        })

        if (end) {
          newBids = _.orderBy(newBids, ['time'], ['asc']);
          const ten = (1000 * 60 * 10);
          let time = end;
          let extended = 0;
          let highestBid = 0;
          newBids.forEach(bid => {
            if ((bid.time + ten > time) && Number(bid.value) > highestBid) {
              // if (extended === 0) extended = ten;
              // else if (extended === ten) extended = 0;
              time += ten;
              highestBid = Number(bid.value);
            }
          })

          // const diff = moment.duration(moment(time + extended).diff(moment()));
          // console.log(moment(end).format('h:mm:s'), moment(time + extended).format('h:mm:s'), newBids);
          // console.log('TIME LEFT:', diff.minutes(), diff.seconds())
          setAuctionEnd(time + extended)
        } else {
          setAuction(null);
        }

        if (newBids && bids && newBids.length !== bids.length) getAsset();
        setBids(_.orderBy(newBids, ['value'], ['desc']));
      } else setBids([]);

      if (!foundListed) {
        setAuction(null);
        setListed(null);
        setAuctionEnd(null);
      }
    }
  }

  async function getBalance(accountAddress, existingSeaport) {
    const balanceOfWETH = await existingSeaport.getTokenBalance({
      accountAddress,
      tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    })

    setBalance(Number(Web3.utils.fromWei(balanceOfWETH.toString(), 'ether')));
  }

  useEffect(() => {
    getAsset();
  }, [])


  useEffect(() => {
    pollBids();
  }, [seaport])

  useInterval(() => {
    pollBids();
  }, 5000);

  const [bid, setBid] = useState(0);
  const [unverified, setUnverified] = useState(false);
  const [bidErr, setBidErr] = useState(null);
  const placeBid = async () => {
    setUnverified(false);
    connectWallet();
    if (provider && provider.selectedAddress) {
      if (auth.wallet && auth.wallet.toLowerCase() !== provider.selectedAddress.toLowerCase()) setUnverified(true);
      else if (bid <= 0) setBidErr('Your bid must be higher than 0 WETH');
      else {
        setBidErr(false);
        await seaport.createBuyOrder({
          asset: {
            tokenId,
            tokenAddress: contract
          },
          accountAddress: provider.selectedAddress,
          expirationTime: Math.round(Date.now() / 1000 + 60 * 60 * 24 * 7),
          startAmount: bid,
        }).catch(err => {
          let error = err.message.replace('API Error 400: [\'', '');
          error = error.replace('\']', '');
          setBidErr(error);
        })
      }
    }
  }

  const [viewTab, setViewTab] = React.useState('fixed');
  function toggleView(view) {
    setBid(0);
    setViewTab(view);
  }

  const [sellOpen, setSellOpen] = React.useState(false);
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [reserve, setReserve] = useState(1.07);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(roundNext15Min(moment(new Date())).add(1, 'day').toDate());
  const createAuction = async () => {
    connectWallet();
    if (provider && provider.selectedAddress) {
      if (auth.wallet && auth.wallet.toLowerCase() !== provider.selectedAddress.toLowerCase()) setUnverified(true);
      else if (reserve < 1.07) setBidErr('Your reserve price must start at 1 WETH');
      else {
        setBidErr(false);
        await seaport.createSellOrder({
          asset: {
            tokenId,
            tokenAddress: contract
          },
          accountAddress: provider.selectedAddress,
          englishAuctionReservePrice: reserve,
          startAmount: reserve / 10,
          paymentTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          expirationTime: Math.round(date.getTime() / 1000),
          waitForHighestBid: true
        })
      }
    }
  }

  const [list, setList] = useState(0.2);
  const listArt = async () => {
    connectWallet();
    if (provider && provider.selectedAddress) {
      if (auth.wallet && auth.wallet.toLowerCase() !== provider.selectedAddress.toLowerCase()) setUnverified(true);
      else if (list <= 0) setBidErr('Your list price must be higher than 0 WETH');
      else {
        setBidErr(false);
        await seaport.createSellOrder({
          asset: {
            tokenId,
            tokenAddress: contract
          },
          accountAddress: provider.selectedAddress,
          startAmount: list,
          endAmount: list,
          paymentTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        })
      }
    }
  }

  const cancelOrder = async (order) => {
    connectWallet();
    if (provider && provider.selectedAddress) {
      if (auth.wallet && auth.wallet.toLowerCase() !== provider.selectedAddress.toLowerCase()) setUnverified(true);
      else {
        if (!order) {
          if (auction) order = auction;
          if (listed) order = listed;
        }

        if (auction) {     
          let win = window.open(`https://opensea.io/assets/${ contract }/${ tokenId }`, '_blank');
          win.focus();
        } else {
          await seaport.cancelOrder({
            order,
            accountAddress: provider.selectedAddress,
          });
        }
      }
    }
  }

  const purchase = async (order) => {
    connectWallet();
    if (provider && provider.selectedAddress) {
      if (auth.wallet && auth.wallet.toLowerCase() !== provider.selectedAddress.toLowerCase()) setUnverified(true);
      else {
        if (!order) order = listed;
        await seaport.fulfillOrder({
          order,
          accountAddress: provider.selectedAddress,
        })
      }
    }
  }

  const [listener, setListener] = useState(null);
  async function connectWallet() {
    if (window.ethereum) {
      const createdProvider = window.web3.currentProvider;
      if (!createdProvider.selectedAddress) window.ethereum.enable();
      else {
        const createdSeaport = new OpenSeaPort(createdProvider, {
          networkName: Network.Main
        })

        if (listener && seaport) {
          seaport.removeListener(listener);
        }

        const listener = createdSeaport.addListener(EventType.CreateOrder, ({ transactionHash, event }) => {
          setSellOpen(false);
        });

        setListener(listener);
        setProvider(createdProvider);
        setSeaport(createdSeaport);
        getBalance(createdProvider.selectedAddress, createdSeaport);
      }
    }
  }

  useEffect(() => {
    setTimeout(() => {
      if (window.ethereum) {
        connectWallet();
        window.ethereum.on('accountsChanged', function (accounts) {
          connectWallet();
        })
      }
    }, 1000)
  }, []);

  let asset = {};
  if (gotAsset && gotAsset.assets && gotAsset.assets[0]) asset = gotAsset.assets[0];

  let isOwner = false, username = null;
  let address = (asset && asset.owner && asset.owner.address) ? asset.owner.address : null;
  if (asset && asset.owner && asset.owner.user && asset.owner.user.username) {
    username = asset.owner.user.username;
    address = asset.owner.user.username;
  }

  if ((asset && asset.owner) && asset.owner.address === '0x47bcd42b8545c23031e9918c3d823be4100d4e87') address = 'Sevens Foundation';
  if ((asset && asset.owner) && asset.owner.address &&
      provider && provider.selectedAddress && asset.owner.address.toLowerCase() === provider.selectedAddress.toLowerCase()) {
      address = `You - ${ address }`;
      isOwner = true;
  }

  let err = false, reserveMet = 0;
  if (reserve && viewTab === 'auction' && reserve < 1.07) err = 'Your minimum bid must start at 1.07WETH';
  if (auction && bids && bids.length && bids[0].value >= Number(Web3.utils.fromWei((Math.round(auction.basePrice.toNumber().toFixed(2) * 1000) / 100).toString(), 'ether')).toFixed(2)) {
    reserveMet = bids[0].value;
  }

  return (
    <div className='margin-top-s'>
      <ReactModal
        isOpen={ sellOpen }
        style={{ content: { margin: 'auto', width: '15rem', height: '23rem' } }}
        onRequestClose={ () => setSellOpen(false) }
        shouldCloseOnOverlayClick={ true }
        ariaHideApp={ false }
      >
        <div className='flex-v font'>
          <div className='flex'>
            <div className='small-button' onClick={ () => toggleView('fixed') }>
              Fixed Price
            </div>
            <div className='small-space' />
            <div className='small-button' onClick={ () => toggleView('auction') }>
              Auction
            </div>
          </div>
          <div className='full-width margin-top'>
            { viewTab === 'fixed' &&
              <div className='center'>
                <div className='half-width'>
                  <div className='form__group-full field'>
                    <input type='number' className='form__field' placeholder='Bid Amount' name='amount' id='amount' required maxLength='100' value={ list } onChange={e => setList(e.target.value) } />
                    <label className='form__label_s'>List Price (WETH)</label>
                  </div>
                </div>
                <div className='align-end'>
                  <input type='submit' value='Create Listing' className='submit-button' onClick={ listArt } />
                </div>
              </div>
            }
            { viewTab === 'auction' &&
              <div className='center'>
                <div className='half-width'>
                  <div className='form__group-full field '>
                    <input type='number' className='form__field' placeholder='Bid Amount' name='amount' id='amount' required maxLength='100' value={ reserve } onChange={e => setReserve(e.target.value) } />
                    <label className='form__label_s'>Reserve Price (WETH)</label>
                  </div>
                </div>
                <div className='margin-top-s'>
                  <strong>End Time</strong><br/>
                  { date ? moment(date).format('ddd MMM Do h:mm A') : '' }
                </div>
                <div className='margin-top-xs'>
                  <input type='submit' value='Change Time' className='small-button' onClick={ () => setShowDatePicker(true) } />  
                </div>
                <DatePicker
                  dateConfig={ dateConfig }
                  isOpen={ showDatePicker }
                  confirmText='Confirm'
                  cancelText='Cancel'
                  min={ new Date() }
                  showHeader={ true }
                  value={ date }
                  headerFormat='YYYY/MM/DD hh:mm'
                  onChange={ (e) => setDate(e) }
                  onSelect={ () => setShowDatePicker(false) }
                  onCancel={ () => setShowDatePicker(false) }
                  isPopup={ true }
                />
                { err &&
                  <div className='margin-top-s text-s text-err'>
                    { err }
                  </div>
                }
                <input type='submit' value='Create Auction' className='submit-button' onClick={ createAuction } />
              </div>
            }
          </div>
        </div>
      </ReactModal>
      <ReactModal
        isOpen={ infoOpen }
        style={{ content: { margin: 'auto', width: '15rem', height: '23rem' } }}
        onRequestClose={ () => setInfoOpen(false) }
        shouldCloseOnOverlayClick={ true }
        ariaHideApp={ false }
      >
        <div className='text-mid font'>
          During a reserve auction, each bid must be 5% higher than the previous highest bid.<br /><br />
          Each new highest bid within 10 minutes of the auction ending will add an additional 10 minutes to the clock.
        </div>
      </ReactModal>
      <div className='text-mid'>
        <strong>Market</strong>
      </div>
      { bids !== null ?
        <div>
          <div className='text-xs margin-top-s'>
            <strong>Owner:</strong> { address }
            <img src={ OpenSeaLogo } className='block-social' alt='OpenSea' onClick={ () => openLink(asset.permalink) } />
          </div>
          { !isOwner ?
            <div className='flex'> 
              <div className='form__group field'>
                <input type='number' className='form__field' placeholder='Bid Amount' name='amount' id='amount' required maxLength='100' onChange={e => { setBid(e.target.value); setBidErr(null); } } />
                <label className='form__label_s'>Bid Amount { balance ? `(${ balance } WETH)` : '(WETH)' }</label>
              </div>
              &nbsp;<input type='submit' value='Place Bid' className='button-min-size small-button' onClick={ placeBid } />
            </div>
            :
            <div className='flex margin-top-s'>
              { (!auction && !listed) ?
                <input type='submit' value='List on Market' className='small-button' onClick={ () => setSellOpen(true) } />
                :
                <input type='submit' value='Cancel Listing' className='small-button' onClick={ () => cancelOrder() } />
              }
            </div>
          }
          { unverified && <Link to='/account' className='text-grey margin-top-s'>Verify your wallet to place a bid</Link> }
          { bidErr && 
            <div className='text-err text-mid margin-top-s'>
              { bidErr }
            </div>
          }
          { (auction && auctionEnd) &&
            <div className='margin-top'>
              <div className='text-s'>Live Auction</div>
              <div className='margin-top-xs text-mid'>
                <span className='text-grey pointer' onClick={ () => setInfoOpen(true) }>
                  <strong>Ξ{ Number(Web3.utils.fromWei((Math.round(auction.basePrice.toNumber().toFixed(2) * 1000) / 100).toString(), 'ether')).toFixed(2) } Reserve { reserveMet === 0 ? 'Price' : 'Met' }</strong>
                </span>
              </div>
              <AuctionTimer time={ auctionEnd } />
            </div>
          }
          { listed &&
            <div className='margin-top-s flex'>
              <div>
                <div className='text-s'>List Price</div>
                Ξ{ Web3.utils.fromWei(listed.currentPrice.toString(), 'ether') }
              </div>
              <div className='flex-full' />
              { listed.maker.toLowerCase() !== provider.selectedAddress.toLowerCase() && <input type='submit' value='Purchase Artwork' className='small-button' onClick={ purchase } /> }
            </div>
          }
          <div className='text-s margin-top-s'>
            { (bids && bids.length) ?
              bids.map((bid, index)=>{
                return (
                  <div className='margin-top-s' key={ index }>
                    { index === 0 ?
                      <div>
                        <strong>Bid of Ξ{ bid.value }</strong>
                        { (bid.maker.toLowerCase() === provider.selectedAddress.toLowerCase()) && <span className='text-s text-grey pointer' onClick={ () => cancelOrder(bid) }>&nbsp;- Cancel</span> }
                        { (isOwner && bid.maker.toLowerCase() !== provider.selectedAddress.toLowerCase()) && <span className='text-s text-grey pointer' onClick={ () => purchase(bid) }>&nbsp;- Accept</span> }
                      </div>
                      :
                      <div>
                        Bid of Ξ{ bid.value }
                        { (bid.maker.toLowerCase() === provider.selectedAddress.toLowerCase()) && <span className='text-s text-grey pointer' onClick={ () => cancelOrder(bid) }>&nbsp;- Cancel</span> }
                        { (isOwner && bid.maker.toLowerCase() !== provider.selectedAddress.toLowerCase()) && <span className='text-s text-grey pointer' onClick={ () => purchase(bid) }>&nbsp;- Accept</span> }
                      </div>
                    }
                    <span className='text-xs'>{ (bid.maker.toLowerCase() === provider.selectedAddress.toLowerCase()) ? 'You - ' : '' }{ bid.user }</span>
                  </div>
                );
              })
              :
              <div className='margin-top text-mid'>
                No active bids
              </div>
            }
          </div>
        </div>
        :
        <div className='flex'>
          <div className='flex-full center'>
            <div className="loading"><div></div><div></div></div>
          </div>
        </div>
      }
    </div>
  );
}
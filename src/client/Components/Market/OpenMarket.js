import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStoreState, useStoreActions } from 'easy-peasy';
import useInterval from '@use-it/interval';
import { OpenSeaPort, Network, EventType } from 'opensea-js';
import ReactModal from 'react-modal';
import DatePicker from 'react-mobile-datepicker';
import moment from 'moment';
import Fortmatic from 'fortmatic';
import Web3 from 'web3';

import OpenSeaLogo from '../../assets/opensea.png';
import AuctionTimer from './AuctionTimer';
import WalletConnect from '../Web3/WalletConnect';
// import '../../styles.scss';

function openLink(page)
{
  let win = window.open(page, '_blank');
  win.focus();
}

function roundNext15Min(date) {
  var intervals = Math.floor(date.minutes() / 15);
  if (date.minutes() % 15 != 0) intervals++;
  if (intervals == 4) {
    date.add("hours", 1);
    intervals = 0;
  }

  date.minutes(intervals * 15);
  date.seconds(0);
  return date;
}

const monthMap = {
  "1": "Jan",
  "2": "Feb",
  "3": "Mar",
  "4": "Apr",
  "5": "May",
  "6": "Jun",
  "7": "Jul",
  "8": "Aug",
  "9": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

const dateConfig = {
  month: {
    format: (value) => monthMap[value.getMonth() + 1],
    caption: "Month",
    step: 1,
  },
  date: {
    format: "DD",
    caption: "Day",
    step: 1,
  },
  hour: {
    format: "hh",
    caption: "Hour",
    step: 1,
  },
  minute: {
    format: "mm",
    caption: "Min",
    step: 15,
  },
};


export default function OpenMarket({ tokenId, contract, resizeContainer, ethPrice, artistWallet }) {
  const provider = useStoreState(state => state.eth.provider);
  const setProvider = useStoreActions(dispatch => dispatch.eth.setProvider);

  // contract = '0x3f4200234e26d2dfbc55fcfd9390bc128d5e2cca';
  // tokenId = 10;

  const [gotAsset, setAsset] = useState({});
  const [seaport, setSeaport] = useState(null);
  const [bids, setBids] = useState(null);
  const [auction, setAuction] = useState(null);
  const [auctionEnd, setAuctionEnd] = useState(null);
  const [seaportOrders, setSeaportOrders] = useState([]);
  const [listed, setListed] = useState(null);
  const [balance, setBalance] = useState(null);

  function getAsset() {
    fetch(
      `https://api.opensea.io/api/v1/assets?asset_contract_address=${contract}&token_ids=${tokenId}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        if (json.detail) setRetryAsset(retryAsset + 1);
        else {
          setAsset(json);
          setRetryAsset(0);
        }
      });
  }

  const [retryAsset, setRetryAsset] = useState(0);
  useEffect(() => {
    if (retryAsset) {
      const retry = setTimeout(() => getAsset(), 1000);
      return () => clearTimeout(retry);
    }
  }, [retryAsset]);

  const [retryAuction, setRetryAuction] = useState(0);
  useEffect(() => {
    if (retryAuction) {
      const retry = setTimeout(() => pollBids(), 1000);
      return () => clearTimeout(retry);
    }
  }, [retryAuction]);

  async function pollBids() {
    const orders = await fetch(
      `https://api.opensea.io/wyvern/v1/orders?asset_contract_address=${contract}&token_ids=${tokenId}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then(async (json) => {
        if (json.detail) setRetryAuction(retryAuction + 1);
        else if (json.orders && json.orders.length) {
          setRetryAuction(0);
          const auction = json.orders.find((order) => order.side === 1);
          if (auction)
            setAuctionEnd(new Date(`${auction.closing_date}.000Z`).getTime());

          return json.orders;
        }
      });

    let newBids = [];
    let foundListed = false;
    if (orders && orders.length) {
      let foundEnd = false;
      orders.forEach((order) => {
        if (order.side === 1 && order.closing_date && !foundEnd) {
          setAuctionEnd(new Date(`${order.closing_date}.000Z`).getTime());
          foundListed = true;
          setAuction(order);
        } else if (order.side === 1) {
          foundListed = true;
          setListed(order);
        } else if (order.side === 0) {
          order.currency = order.payment_token_contract.symbol;
          order.ethValue = Number(Web3.utils.fromWei(order.base_price, 'ether'));
          order.value = ((order.currency === 'USDC') ? (Number(order.base_price) / 1000000) : (order.currency === 'DAI' ? order.ethValue : order.ethValue * ethPrice)).toFixed(2);
          order.user = (order.maker && order.maker.user) ? order.maker.user.username : 'Anonymous';
          order.time = order.listing_time * 1000;
          newBids.push(order);
        }
      });

      if (newBids && bids && newBids.length !== bids.length && seaport) {
        const { count, orders } = await seaport.api.getOrders({
          asset_contract_address: contract,
          token_id: tokenId,
        });

        setSeaportOrders(orders);
      }

      if (newBids) setBids(newBids);
    } else setBids([]);

    if (!foundListed) {
      setAuction(null);
      setListed(null);
      setAuctionEnd(null);
    }

    resizeContainer();
  }

  async function getBalance(accountAddress, existingSeaport) {
    const balanceOfWETH = await existingSeaport.getTokenBalance({
      accountAddress,
      tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    });

    setBalance(Number(Web3.utils.fromWei(balanceOfWETH.toString(), "ether")));
  }

  useEffect(() => {
    if (contract) {
      getAsset();
      pollBids();
    }
  }, [contract]);

  useEffect(() => {
    if (seaport) {
      seaport.api
        .getOrders({
          asset_contract_address: contract,
          token_id: tokenId,
        })
        .then((data) => setSeaportOrders(data.orders));
    }
  }, [seaport]);

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
      if (bid <= 0) setBidErr('Your bid must be higher than 0 WETH');
      else {
        setBidErr(false);
        await seaport.createBuyOrder({
          asset: {
            tokenId,
            tokenAddress: contract
          },
          accountAddress: provider.selectedAddress,
          // expirationTime: Math.round(Date.now() / 1000 + 60 * 60 * 24 * 7),
          startAmount: bid,
        }).catch(err => {
          let error = err.message.replace('API Error 400: [\'', '');
          error = error.replace('\']', '');
          setBidErr(error);
        })
      }
    }
  };

  const [viewTab, setViewTab] = React.useState("fixed");
  function toggleView(view) {
    setBid(0);
    setViewTab(view);
  }

  const [sellOpen, setSellOpen] = React.useState(false);
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [reserve, setReserve] = useState(1.07);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(
    roundNext15Min(moment(new Date())).add(1, "day").toDate()
  );
  const createAuction = async () => {
    connectWallet();
    if (provider && provider.selectedAddress) {
      if (reserve < 1.07) setBidErr('Your reserve price must start at 1 WETH');
      else {
        setBidErr(false);
        await seaport.createSellOrder({
          asset: {
            tokenId,
            tokenAddress: contract,
          },
          accountAddress: provider.selectedAddress,
          englishAuctionReservePrice: reserve,
          startAmount: reserve / 10,
          paymentTokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          expirationTime: Math.round(date.getTime() / 1000),
          waitForHighestBid: true,
        });
      }
    }
  };

  const [list, setList] = useState(0.2);
  const listArt = async () => {
    connectWallet();
    if (provider && provider.selectedAddress) {
      if (list <= 0) setBidErr('Your list price must be higher than 0 WETH');
      else {
        setBidErr(false);
        await seaport.createSellOrder({
          asset: {
            tokenId,
            tokenAddress: contract,
          },
          accountAddress: provider.selectedAddress,
          startAmount: list,
          endAmount: list,
          paymentTokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        });
      }
    }
  };

  const cancelOrder = async (order) => {
    connectWallet();
    if (provider && provider.selectedAddress) {
      if (
        order &&
        order.maker.address.toLowerCase() !==
          provider.selectedAddress.toLowerCase()
      )
        setUnverified(true);
      else {
        let cancelAuction = false;
        if (!order) {
          if (auction) {
            order = auction;
            cancelAuction = true;
          }
          if (listed) order = listed;
        }

        if (cancelAuction) {
          let win = window.open(
            `https://opensea.io/assets/${contract}/${tokenId}`,
            "_blank"
          );
          win.focus();
        } else {
          const foundOrder = seaportOrders.find(
            (o) => o.hash.toLowerCase() === order.order_hash
          );
          await seaport.cancelOrder({
            order: foundOrder,
            accountAddress: provider.selectedAddress,
          });
        }
      }
    }
  };

  const purchase = async (order) => {
    connectWallet();
    if (provider && provider.selectedAddress) {
      let foundOrder;
      if (order) foundOrder = seaportOrders.find(o => o.hash.toLowerCase() === order.order_hash);
      else foundOrder = seaportOrders.find(o => o.side === 1 && !o.closing_date);
      console.log('wtf', seaportOrders);
      await seaport.fulfillOrder({
        order: foundOrder,
        accountAddress: provider.selectedAddress,
      })
    }
  };

  const [listener, setListener] = useState(null);
  async function connectWallet() {
    if (provider) {
      setBidErr(null);
      let createdSeaport;
      if (window.ethereum) {
        createdSeaport = new OpenSeaPort(provider, {
          networkName: Network.Main
        })
      } else {
        const fm = new Fortmatic('pk_live_B635DD2C775F3285');
        createdSeaport = new OpenSeaPort(fm.getProvider(), {
          networkName: Network.Main
        })
      }

      if (listener && seaport) {
        seaport.removeListener(listener);
      }

      const listener = createdSeaport.addListener(
        EventType.CreateOrder,
        ({ transactionHash, event }) => {
          setSellOpen(false);
        }
      );

      setListener(listener);
      setSeaport(createdSeaport);
      getBalance(provider.selectedAddress, createdSeaport);
    }
  }

  useEffect(() => {
    if (provider && provider.selectedAddress) connectWallet();
  }, [provider]);

  const connect = () => {
    if (window.ethereum) {
      window.ethereum.request({
        method: 'eth_requestAccounts',
      }).catch(e => {
        if (e.code === -32002)
        setBidErr('MetaMask is already requesting login!')
      });
    } else {
      web3.eth.getAccounts((e, accounts) => {
        if (e) throw e;
        setProvider({ ...provider, selectedAddress: accounts[0] })
      });
    }
  };

  let asset = {};
  if (gotAsset && gotAsset.assets && gotAsset.assets[0])
    asset = gotAsset.assets[0];

  let isOwner = false, isArtist = false;
  let address = (asset && asset.owner && asset.owner.address) ? asset.owner.address : null;
  if (asset && asset.owner && asset.owner.user && asset.owner.user.username) {
    address = asset.owner.user.username;
  }

  if ((asset && asset.owner) && asset.owner.address.toLowerCase() === artistWallet.toLowerCase()) isArtist = true;
  if ((asset && asset.owner) && asset.owner.address === '0x47bcd42b8545c23031e9918c3d823be4100d4e87') address = 'Sevens Foundation - Not For Sale';
  if ((asset && asset.owner) && asset.owner.address &&
      provider && provider.selectedAddress && asset.owner.address.toLowerCase() === provider.selectedAddress.toLowerCase()) {
      address = `You - ${ address }`;
      isOwner = true;
  }

  let err = false, reserveMet = 0;
  if (reserve && viewTab === 'auction' && reserve < 1.07) err = 'Your minimum bid must start at 1.07WETH';
  if (auction && bids && bids.length && bids[0].ethValue >= Number(Web3.utils.fromWei((Math.round(Number(auction.base_price).toFixed(2) * 1000) / 100).toString(), 'ether')).toFixed(2)) {
    reserveMet = bids[0].ethValue;
  }

  const connectedAddress =
    provider && provider.selectedAddress
      ? provider.selectedAddress.toLowerCase()
      : null;

  return (
    <div className="margin-top-s">
      <WalletConnect />
      <ReactModal
        isOpen={sellOpen}
        style={{ content: { margin: "auto", width: "15rem", height: "23rem" } }}
        onRequestClose={() => setSellOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
      >
        <div className='flex-v font'>
          <div className='flex center'>
            <div className='small-button' onClick={ () => toggleView('fixed') }>
              Fixed Price
            </div>
            <div className="small-space" />
            <div className="small-button" onClick={() => toggleView("auction")}>
              Auction
            </div>
          </div>
          <div className="full-width margin-top">
            {viewTab === "fixed" && (
              <div className="center">
                <div className="half-width">
                  <div className="form__group-full field">
                    <input
                      type="number"
                      className="form__field"
                      placeholder="Bid Amount"
                      name="amount"
                      id="amount"
                      required
                      maxLength="100"
                      value={list}
                      onChange={(e) => setList(e.target.value)}
                    />
                    <label className="form__label_s">List Price (WETH)</label>
                  </div>
                </div>
                <div className="align-end">
                  <input
                    type="submit"
                    value="Create Listing"
                    className="submit-button"
                    onClick={listArt}
                  />
                </div>
              </div>
            )}
            {viewTab === "auction" && (
              <div className="center">
                <div className="half-width">
                  <div className="form__group-full field ">
                    <input
                      type="number"
                      className="form__field"
                      placeholder="Bid Amount"
                      name="amount"
                      id="amount"
                      required
                      maxLength="100"
                      value={reserve}
                      onChange={(e) => setReserve(e.target.value)}
                    />
                    <label className="form__label_s">
                      Reserve Price (WETH)
                    </label>
                  </div>
                </div>
                <div className="margin-top-s">
                  <strong>End Time</strong>
                  <br />
                  {date ? moment(date).format("ddd MMM Do h:mm A") : ""}
                </div>
                <div className="margin-top-xs">
                  <input
                    type="submit"
                    value="Change Time"
                    className="small-button"
                    onClick={() => setShowDatePicker(true)}
                  />
                </div>
                <div
                  className={`${
                    showDatePicker
                      ? "absolute-container"
                      : "hidden absolute-container"
                  }`}
                >
                  <DatePicker
                    dateConfig={dateConfig}
                    isOpen={showDatePicker}
                    confirmText="Confirm"
                    cancelText="Cancel"
                    min={new Date()}
                    value={date}
                    customHeader={
                      <div>{moment(date).format("ddd MMM Do h:mm A")}</div>
                    }
                    showCaption
                    onChange={(e) => setDate(e)}
                    onSelect={() => setShowDatePicker(false)}
                    onCancel={() => setShowDatePicker(false)}
                    isPopup={false}
                  />
                </div>
                {err && (
                  <div className="margin-top-s text-s text-err">{err}</div>
                )}
                <input
                  type="submit"
                  value="Create Auction"
                  className="submit-button"
                  onClick={createAuction}
                />
              </div>
            )}
          </div>
        </div>
      </ReactModal>
      <ReactModal
        isOpen={infoOpen}
        style={{ content: { margin: "auto", width: "15rem", height: "23rem" } }}
        onRequestClose={() => setInfoOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
      >
        <div className="text-mid font">
          During a reserve auction, each bid must be 5% higher than the previous
          highest bid.
          <br />
          <br />
          Each new highest bid within 10 minutes of the auction ending will add
          an additional 10 minutes to the clock.
        </div>
      </ReactModal>
      <ReactModal
        isOpen={infoOpen}
        style={{ content: { margin: "auto", width: "15rem", height: "23rem" } }}
        onRequestClose={() => setInfoOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
      >
        <div className='text-mid font'>
          Auction.<br /><br />
          Each new highest bid within 10 minutes of the auction ending will add an additional 10 minutes to the clock.
          { auction && auction.base_price === '0' && <div className='text-s margin-top-s'>If you are the owner, please cancel and reset auction using Sevens to fix reserve.</div> }
        </div>
      </ReactModal>
      <div className="text-mid">
        <strong>Market</strong>
      </div>
      {bids !== null ?
        <div>
          {!seaport ?
            <div className="margin-top-s">
              <div className="small-button" onClick={() => connect()}>
                Connect your wallet
              </div>
            </div>
            :
            <div className='margin-top-s text-xs'>
              { provider.selectedAddress &&
                <div>
                  <strong>My Wallet</strong><br />
                  <div className='text-xxs'>{ provider.selectedAddress }</div>
                  {/* { `${ provider.selectedAddress.slice(0,8).toLowerCase() }...${ provider.selectedAddress.slice(-4).toLowerCase() }` } */}
                  <div className='text-xxs margin-top-xs'>{ balance !== null ? `Balance: ${ balance } WETH` : '' }</div>
                </div>
              }
            </div>
          }
          <div className='text-xs margin-top-s'>
            <strong>Owner</strong><br />
            <div className='text-xxs margin-top-minus'>
              { address }{ isArtist ? ' (Artist)' : '' }
              { address && <img src={ OpenSeaLogo } className='block-social' alt='OpenSea' onClick={ () => openLink(asset.permalink) } /> }
            </div>
          </div>
          { !isOwner ?
            <div className='flex margin-top-s'>
              <div className='form__group field'>
                <input type='number' className='form__field' placeholder='Bid Amount' name='amount' id='amount' required maxLength='100' onChange={e => { setBid(e.target.value); setBidErr(null); } } />
                <label className='form__label_s'>Bid Amount (WETH)</label>
              </div>
              &nbsp;
              <input
                type="submit"
                value="Place Bid"
                className="button-min-size small-button"
                onClick={placeBid}
              />
            </div>
          :
            <div className="flex margin-top-s">
              {!auction && !listed ? (
                <input
                  type="submit"
                  value="List on Market"
                  className="small-button"
                  onClick={() => setSellOpen(true)}
                />
              ) : (
                <input
                  type="submit"
                  value="Cancel Listing"
                  className="small-button"
                  onClick={() => cancelOrder()}
                />
              )}
            </div>
          }
          { (auction && auctionEnd) &&
            <div className='margin-top'>
              <div className='text-s'>Live Auction</div>
              <div className='margin-top-xs text-mid'>
                <span className='text-grey pointer' onClick={ () => setInfoOpen(true) }>
                  { auction.base_price !== '0' ?
                    <strong>Ξ{ Number(Web3.utils.fromWei((Math.round(Number(auction.base_price).toFixed(2) * 1000) / 100).toString(), 'ether')).toFixed(2) } Reserve { reserveMet === 0 ? 'Price' : 'Met' }</strong>
                    :
                    <strong>Reserve Price Unknown</strong>
                  }
                </span>
              </div>
              <AuctionTimer time={auctionEnd} />
            </div>
          }
          {listed && (
            <div className="flex margin-top-s">
              <div>
                <div className="text-s">List Price</div>Ξ
                {Web3.utils.fromWei(listed.current_price, "ether")}
              </div>
              <div className='small-space' />
              { listed.maker.address.toLowerCase() !== connectedAddress && <input type='submit' value='Purchase Artwork' className='small-button' onClick={ purchase } /> }
            </div>
          )}
          <div className="text-s margin-top-s">
            {bids && bids.length ?
              bids.map((bid, index) => {
                return (
                  <div className='margin-top-s' key={ index }>
                    <div>
                      <span>Bid of ${ bid.value } ({ (bid.currency === 'DAI' || bid.currency === 'USDC') ? bid.currency : `Ξ${ bid.ethValue }` })</span>
                      { (bid.maker.address.toLowerCase() === connectedAddress) && <span className='text-s text-grey pointer' onClick={ () => cancelOrder(bid) }>&nbsp;- Cancel</span> }
                      { (isOwner && bid.maker.address.toLowerCase() !== connectedAddress) && <span className='text-s text-grey pointer' onClick={ () => purchase(bid) }>&nbsp;- Accept</span> }
                    </div>
                    <div className='flex margin-top-xs'>
                      <span className='pointer flex' onClick={ () => openLink(`https://opensea.io/accounts/${ bid.maker.address }`) }>
                        <span className='text-xs'>{ (bid.maker.address.toLowerCase() === connectedAddress) ? 'You - ' : '' }{ bid.user }</span>
                      </span>
                    </div>
                    { bid.expiration_time ?
                      <div className='margin-top-xs text-xxs'>
                        Expires { moment(bid.expiration_time * 1000).fromNow() }
                      </div>
                      :
                      <></>
                    }
                  </div>
                );
              })
              :
              <div className='margin-top text-mid'>
                { isArtist ? 'Tendering Bids ❤️' : 'No active bids' }
              </div>
            }
          </div>
        </div>
      :
        <div className="flex">
          <div className="flex-full center">
            <div className="loading">
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { CSVLink } from 'react-csv';
import ReactModal from 'react-modal';
import { apiUrl } from '../../baseUrl';
import Fortmatic from 'fortmatic';
import Web3 from 'web3';
import DisperseABI from '../Web3/DisperseABI.json';
import GenesisABI from '../Web3/GenesisABI.json';

import WalletConnect from '../Web3/WalletConnect';
import Drag from '../../assets/drag.png';
import '../../styles.scss';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const sum = (vals) => {
  let sum = new Web3.utils.BN('0');
  vals.forEach(val => {
    sum = sum.add(new Web3.utils.BN(Web3.utils.toWei(`${ val }`, 'ether')))
  });
  return sum;
};

export default function Admin({ selectedProgram, setSelectedProgram, programs, setPrograms, auth }) {
  const provider = useStoreState(state => state.eth.provider);

  const [newCriteria, setNewCriteria] = useState(false);
  const [newMetrics, setNewMetrics] = useState([]);
  const [metricVal, setMetricVal] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [search, setSearch] = useState(false);
  const [criteria, setCriteria] = useState(false);
  const [programAdmin, setProgramAdmin] = useState({});

  const initCriteria = () => {
    setNewCriteria({
      passByVotes: selectedProgram.passByVotes,
      blindVoting: selectedProgram.blindVoting,
      topThreshold: selectedProgram.topThreshold,
      voteThreshold: selectedProgram.voteThreshold,
      advancedCuration: selectedProgram.advancedCuration,
      advancedMetrics: selectedProgram.advancedMetrics
    });
    setMetricVal('');
    setNewMetrics(selectedProgram.advancedMetrics || []);
  }

  useEffect(() => {
    if (selectedProgram){
      initCriteria();
      setProgramAdmin({});
      fetch(`${ apiUrl() }/program/getProgramAdmin`, {
        method: 'POST',
        body: JSON.stringify({ program: selectedProgram.id }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': auth.token
        },
      })
      .then(res => res.json())
      .then(json => setProgramAdmin(json))
    }
  }, [])

  const saveCriteria = () => {
    setSelectedProgram({
      ...selectedProgram,
      passByVotes: newCriteria.passByVotes,
      blindVoting: newCriteria.blindVoting,
      topThreshold: newCriteria.topThreshold,
      voteThreshold: newCriteria.voteThreshold,
      advancedCuration: newCriteria.advancedCuration,
      advancedMetrics: newMetrics
    });

    setCriteria(false);
    const index = programs.findIndex(e => e.id === selectedProgram.id)
    programs[index] = {
      ...programs[index],
      passByVotes: newCriteria.passByVotes,
      blindVoting: newCriteria.blindVoting,
      topThreshold: newCriteria.topThreshold,
      voteThreshold: newCriteria.voteThreshold,
      advancedCuration: newCriteria.advancedCuration,
      advancedMetrics: newMetrics
    };

    setPrograms(programs);
    fetch(`${ apiUrl() }/program/updateCurationCriteria`, {
      method: 'POST',
      body: JSON.stringify({ ...newCriteria, advancedMetrics: newMetrics, id: selectedProgram.id, org: selectedProgram.organizers[0].id }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth.token
      },
    }).then(res => res.json())
    .then(json => {});
  }

  const addMetric = (metric) => {
    if (metric !== '') {
      setNewMetrics([...newMetrics, { metric, weight: 50 }]);
      setMetricVal('');
    }
  }

  const removeMetric = (metric) => {
    if (metric !== '') {
      const index = newMetrics.findIndex(e => e.metric === metric);
      if (index >= 0) {
        setNewMetrics([
          ...newMetrics.slice(0, index),
          ...newMetrics.slice(index + 1)
        ]);
      }
    }
  }

  const setMetricWeight = (index, weight) => {
    newMetrics[index].weight = weight;
    setNewMetrics([...newMetrics])
  }

  const searchUsers = (search) => {
    if (!search) setFoundUsers([]);
    else {
      fetch(`${ apiUrl() }/searchUsers`, {
        method: 'POST',
        body: JSON.stringify({ user: search }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': auth.token
        },
      })
      .then(res => res.json())
      .then(json => setFoundUsers(json))
    }
  }

  const addRemoveCurator = (type, curator) => {
    let update;
    if (type === 'add') {
      setSearch(false);
      programAdmin.curators.push(curator);
      update = {
        ...programAdmin,
        curators: programAdmin.curators
      }
    } else if (type === 'remove') {
      const index = programAdmin.curators.findIndex(e => e.id === curator.id);
      update = {
        ...programAdmin,
        curators: [
          ...programAdmin.curators.slice(0, index),
          ...programAdmin.curators.slice(index + 1)
        ]
      }
    }

    setProgramAdmin(update);
    fetch(`${ apiUrl() }/program/addRemoveCurator`, {
      method: 'POST',
      body: JSON.stringify({ program: selectedProgram.id, curator: curator.id, type }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth.token
      },
    })
    .then(res => res.json())
    .then(json => {})
  }

  const reorderCurators = (result) => {
    if (!result.destination) {
      return;
    }

    const curators = reorder(
      programAdmin.curators,
      result.source.index,
      result.destination.index
    );

    setProgramAdmin({ ...programAdmin, curators })

    const update = [];
    curators.forEach(curator => update.push(curator.id))

    fetch(`${ apiUrl() }/program/reorderCurators`, {
      method: 'POST',
      body: JSON.stringify({ program: selectedProgram.id, curators: update }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth.token
      },
    })
    .then(res => res.json())
    .then(json => {})
  }

  const lockCuration = (curationLock) => {
    setSelectedProgram({ ...selectedProgram, curationLock })
    fetch(`${ apiUrl() }/program/curationLock`, {
      method: 'POST',
      body: JSON.stringify({ program: selectedProgram.id, curationLock }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth.token
      },
    }).then(res => res.json())
    .then(json => {});
  }

  const toggleResults = (hideResults) => {
    setSelectedProgram({ ...selectedProgram, hideResults })
    fetch(`${ apiUrl() }/program/hideResults`, {
      method: 'POST',
      body: JSON.stringify({ program: selectedProgram.id, hideResults }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth.token
      },
    }).then(res => res.json())
    .then(json => {});
  }

  const [emails, setEmails] = useState(null);
  const [gettingE, setGettinE] = useState(false);
  const getEmails = (type) => {
    setGettinE(true);
    setEmails(null);
    fetch(`${ apiUrl() }/program/getEmails`, {
      method: 'POST',
      body: JSON.stringify({ program: selectedProgram.id, org: selectedProgram.organizers[0].id, type }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth.token
      },
    }).then(res => res.json())
    .then(json => {
      if (json.success) {
        setEmails(json.success);
        setGettinE(false);
      }
    });
  }

  const [wallets, setWallets] = useState(null);
  const [grants, setGrants] = useState([]);
  const [grantAll, setGrantAll] = useState(0.05);
  const [gettingW, setGettingW] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const getWallets = (type) => {
    setGettingW(true);
    setWallets(null);
    fetch(`${ apiUrl() }/program/getWallets`, {
      method: 'POST',
      body: JSON.stringify({ program: selectedProgram.id, org: selectedProgram.organizers[0].id, type }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth.token
      },
    }).then(res => res.json())
    .then(json => {
      if (json.success) {
        setGrants(Array(json.success.length).fill(grantAll));
        setWallets(json.success);
        setGettingW(false);
      }
    });
  }

  const setGrant = (index, amt) => {
    grants[index] = amt;
    setGrants([...grants]);
  }

  const distribute = () => {
    const contractAddress = '0xd152f549545093347a162dce210e7293f1452150';
    let web3;
    if (window.ethereum) {
      web3 = new Web3(provider);
    } else {
      const fm = new Fortmatic('pk_live_B635DD2C775F3285');
      web3 = new Web3(fm.getProvider());
    }
    const Contract = new web3.eth.Contract(DisperseABI, contractAddress);

    const addresses = [];
    const values = [];
    wallets.forEach(wallet => addresses.push(wallet[1]))
    grants.forEach(grant => values.push(new Web3.utils.BN(Web3.utils.toWei(`${ grant }`, 'ether'))));

    Contract.methods.disperseEther(addresses, values).send({
      from: provider.selectedAddress,
      value: new Web3.utils.BN(sum(grants).toString())
    })
    .then(e => console.log(e));
  }
  
  // const distributeGenesis = async () => {
  //   const contractAddress = '0xf6e716ba2a2f4acb3073d79b1fc8f1424758c2aa';
  //   let web3;
  //   if (window.ethereum) {
  //     web3 = new Web3(provider);
  //   } else {
  //     const fm = new Fortmatic('pk_live_B635DD2C775F3285');
  //     web3 = new Web3(fm.getProvider());
  //   }
  //   const Contract = new web3.eth.Contract(GenesisABI, contractAddress);

  //   let addresses = []
  //   let tokens = []
  //   for (const wallet of wallets) {
  //     if (wallet[2] !== 72 && wallet[2] !== 114) {
  //       addresses.push(wallet[1]);
  //       tokens.push(wallet[2]);
  //       // await Contract.methods.safeTransferFrom(provider.selectedAddress, wallet[1], wallet[2]).send({
  //       //   from: provider.selectedAddress,
  //       // })
  //       // .then(e => console.log(e));
  //     }
  //   }

  //   addresses = addresses.slice(100, 145);
  //   tokens = tokens.slice(100, 145);
  //   console.log(addresses, tokens);

  //   await Contract.methods.batchTransfer(provider.selectedAddress, addresses, tokens).send({
  //     from: provider.selectedAddress,
  //   })
  //   .then(e => console.log(e));
  // }

  const removeRecipient = (index) => {
    setWallets([
      ...wallets.slice(0, index),
      ...wallets.slice(index + 1)
    ]);
    setGrants([
      ...grants.slice(0, index),
      ...grants.slice(index + 1)
    ]);
  }

  const updateMintTo = (mintToArtist) => {
    setProgramAdmin({ ...programAdmin, mintToArtist })
    setSelectedProgram({ ...selectedProgram, mintToArtist })
    fetch(`${ apiUrl() }/program/mintToArtist`, {
      method: 'POST',
      body: JSON.stringify({ program: selectedProgram.id, mintToArtist }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth.token
      },
    }).then(res => res.json())
    .then(json => {});
  }

  const [exhibition, setExhibition] = useState(false);
  const [exhibitionName, setExhibitionName] = useState(false);
  const [exhibitionSymbol, setExhibitionSymbol] = useState(false);
  const [exhibitionErr, setExhibitionErr] = useState(false);
  const exhibitionCreation = () => {
    setExhibitionSymbol('ART');
    setExhibitionName(selectedProgram.name);
    setExhibition(true);
  }

  const createContract = async () => {
    setExhibitionErr(false);
    const index = programs.findIndex(e => e.id === selectedProgram.id)
    programs[index] = { ...programs[index], creationInProgress: true };
    setPrograms(programs);
    setSelectedProgram({ ...selectedProgram, creationInProgress: true });
    setProgramAdmin({ ...programAdmin, creationInProgress: true });
    fetch(`${ apiUrl() }/program/createExhibition`, {
      method: 'POST',
      body: JSON.stringify({
        program: selectedProgram.id,
        org: selectedProgram.organizers[0].id,
        name: exhibitionName,
        symbol: exhibitionSymbol,
        wallet: provider.selectedAddress
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth.token
      },
    }).then(res => res.json())
    .then(json => {
      if (json.error) setExhibitionErr(json.error);
    });
  }

  const connectWallet = () => {
    if (window.ethereum) {
      window.ethereum.request({
        method: 'eth_requestAccounts',
      }).catch(e => {
        if (e.code === -32002)
        setBidErr('MetaMask is already requesting login!')
      });
    }
  }

  const [err, setErr] = useState(null);
  const [consolation, setConsolation] = useState(false);
  const [prize, setPrize] = useState({});
  const uploadHandler = (target) => {
    setErr(false);
    const file = target.files[0];
    const reader = new FileReader();
    const ext = target.value.substr(target.value.length - 3).toLowerCase();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      if (file.size < 120000000) {
        fetch(`${ apiUrl() }/program/consolationArt`, {
          method: 'POST',
          body: JSON.stringify({ art: reader.result, program: selectedProgram.id, org: selectedProgram.organizers[0].id }),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': auth.token
          },
        })
          .then(res => res.json())
          .then(json => {
            setSelectedProgram({ ...selectedProgram, art: reader.result, consolationURL: json.success, imageType: ext })
            if (json && json.error) { setErr(json.error); }
          });
      } else {
        setErr('File size too large');
      }
    }
  };

  const mintConsolation = () => {
    fetch(`${ apiUrl() }/program/consolationPrize`, {
      method: 'POST',
      body: JSON.stringify({ title: prize.title, description: prize.desc, program: selectedProgram.id, org: selectedProgram.organizers[0].id, wallet: provider.selectedAddress }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth.token
      },
    })
      .then(res => res.json())
      .then(json => {
        setConsolation(false);
        setSelectedProgram({ ...selectedProgram, prizeRewarded: true });
        if (json && json.error) { setErr(json.error); }
      });
  }

  const verified = (auth.wallet) ? `${ auth.wallet.slice(0,8).toLowerCase() }...${ auth.wallet.slice(-4).toLowerCase() }` : 'No verified wallet';
  const connected = (provider && provider.selectedAddress) ? `${ provider.selectedAddress.slice(0,8) }...${ provider.selectedAddress.slice(-4) }` : 'No connected wallet';

  if (selectedProgram && selectedProgram.consolationURL) selectedProgram.imageType = selectedProgram.consolationURL.split('.')[1];

  return (
    <div className='margin-top'>
      <WalletConnect />
      <ReactModal
        isOpen={ walletOpen }
        className='modal-container'
        onRequestClose={ () => setWalletOpen(false) }
        shouldCloseOnOverlayClick={ true }
        ariaHideApp={ false }
      >
        <div className='text-mid center'>
          <strong>Distribute Grants in ETH</strong>
          <div className='text-s margin-top'>
            Set grant amount for all recipients
            <div className='flex center'>
              <div className='flex-full' />
              <div className='small-button v-center' onClick={ () => { setGrants(Array(wallets.length).fill(grantAll)) } }>
                Set
              </div>
              <div className='small-space' />
              <div className='input-small'>
                <div className='form__group-full field'>
                  <input type='number' className='form__field' placeholder='Number' name='number' id='number' value={ grantAll } onChange={e => setGrantAll(Number(e.target.value)) } />
                  <label className='form__label'>ETH</label>
                </div>
              </div>
              <div className='flex-full' />
            </div>
          </div>
          <div className='text-s margin-top'>
            <div className='center'>
              <div className='button v-center' onClick={ () => { distribute() } }>
                Distribute Grants
              </div>
            </div>
            <div className='text-xs margin-top-s'>
              { wallets && wallets.length } recipients ({ grants && grants.length && Web3.utils.fromWei(sum(grants).toString(), 'ether') } ETH)
            </div>
          </div>
          <div className='margin-top'>
            <strong>Grant Recipients</strong>
          </div>
          { wallets && wallets.length && wallets.map((item, index) => 
            (<div className='center margin-top'>
              <div>
                { item[0] }
                <div className='text-xxs'>{ item[1] }</div>
              </div>
              <div className='flex center'>
                <div className='flex-full' />
                <div className='small-button v-center' onClick={ () => removeRecipient(index) }>
                  Remove
                </div>
                <div className='small-space' />
                <div className='input-small'>
                  <div className='form__group-full field'>
                    <input type='number' className='form__field' placeholder='Number' name='number' id='number' maxLength='4' value={ grants[index] } onChange={e => { setGrant(index, Number(e.target.value)) } } />
                    <label className='form__label'>ETH</label>
                  </div>
                </div>
                <div className='flex-full' />
              </div>
            </div>)
          )}
        </div>
      </ReactModal>
      <ReactModal
        isOpen={ consolation }
        className='modal-container'
        onRequestClose={ () => setConsolation(false) }
        shouldCloseOnOverlayClick={ true }
        ariaHideApp={ false }
      >
        <div className='text-mid center'>
          <strong>Consolation Prize NFT</strong>
          <div className='text-s margin-top'>
            <div className='center'>
              <div className='flex center'>
                <div className='form__group field'>
                  <input type='text' className='form__field' placeholder='Name' name='name' id='name' maxLength='77' value={ prize.title } onChange={e => setPrize({ ...prize, title: e.target.value }) } />
                  <label className='form__label'>NFT Title</label>
                </div>
              </div>
              <div className='flex center'>
                <div className='form__group field'>
                  <textarea type='text' className='form__field intent-field' placeholder='Description' name='description' id='description' required maxLength='2000' value={ prize.desc } onChange={e => setPrize({ ...prize, desc: e.target.value }) } />
                  <label className='form__label'>NFT Description (2000 Chars)</label>
                </div>
              </div>
              <div className='button v-center' onClick={ () => { mintConsolation() } }>
                Mint Consolation NFT to All Applicants
              </div>
            </div>
            <div className='flex center'>
              <div className='consolation-frame-two'>
                { (selectedProgram.imageType === 'mp4' || selectedProgram.imageType === 'mov') ?
                  <video muted loop autoPlay webkit-playsinline='true' playsInline className='gallery-art'>
                    <source src={ selectedProgram.art ? selectedProgram.art : `https://cdn.grants.art/${ selectedProgram.consolationURLWeb }` } />
                    Sorry, your browser doesn't support embedded videos.
                  </video>
                  :
                  <img className='gallery-art' src={ selectedProgram.art ? selectedProgram.art : `https://cdn.grants.art/${ selectedProgram.consolationURLWeb }` } />
                }
              </div>
            </div>
          </div>
        </div>
      </ReactModal>
      <div className='text-mid flex'>
        <div>
          <div className='text-s'>
            Exhibition Contract
          </div>
          { programAdmin.contractAddress ?
            <div>{ programAdmin.contractAddress }</div>
            :
            <div>Not Created</div>
          }
        </div>
        { (!programAdmin.contractAddress && !exhibition) &&
          <div className='small-button margin-left-s' onClick={ () => exhibitionCreation() }>Create</div>
        }
      </div>
      <div className='text-mid flex margin-top'>
        <div>
          <div className='text-s'>
            Exhibition Criteria
          </div>
          { selectedProgram.passByVotes ?
            <div>{ selectedProgram.voteThreshold } Votes Needed</div>
            :
            <div>Top { selectedProgram.topThreshold } Submissions</div>
          }
        </div>
        { criteria ?
          <div>
            <div className='small-button margin-left-s' onClick={ () => { setCriteria(!criteria); initCriteria() } }>Cancel</div>
            <div className='small-button margin-left-s' onClick={ () => saveCriteria() }>Save</div>
          </div>
          :
          <div className='small-button margin-left-s' onClick={ () => setCriteria(!criteria) }>Edit</div>
        }
      </div>
      <div className='text-xs'>
        { selectedProgram.advancedCuration ? 'Scoring System Curation' : 'Approve/Defer Curation' }
      </div>
      { criteria &&
        <div className='margin-top'>
          <div className='line-spacer' />
          <div className='margin-top text-mid'>
            <strong>Adjust Selection Parameters</strong>
          </div>
          <div className='text-s margin-top form__title'>Curation Type</div>
          <div className='select-dropdown margin-top-minus'>
            <select name='Mint' className='text-black' defaultValue={ `${ newCriteria.advancedCuration }` } value={ `${ newCriteria.advancedCuration }` } required onChange={e => setNewCriteria({ ...newCriteria, advancedCuration: (e.target.value === 'true'), passByVotes: (e.target.value === 'true') ? false : newCriteria.passByVotes }) }>
              <option value='default' disabled hidden>
                Select an option
              </option>
              <option value='false'>Approve / Defer</option>
              <option value='true'>Scoring System</option>
            </select>
          </div>
          { !newCriteria.advancedCuration &&
            <div>
              <div className='text-s margin-top-s form__title'>Selection Type</div>
              <div className='select-dropdown margin-top-minus'>
                <select name='Mint' className='text-black' defaultValue={ `${ newCriteria.passByVotes }` } value={ `${ newCriteria.passByVotes }` } required onChange={e => setNewCriteria({ ...newCriteria, passByVotes: (e.target.value === 'true') })}>
                  <option value='default' disabled hidden>
                    Select an option
                  </option>
                  <option value='false'>Top Submissions</option>
                  <option value='true'>Vote Count</option>
                </select>
              </div>
            </div>
          }
          { newCriteria.passByVotes ?
            <div className='form__group field'>
              <input type='number' className='form__field' placeholder='Number' name='number' id='number' maxLength='4' value={ `${ newCriteria.voteThreshold }` } onChange={e => setNewCriteria({ ...newCriteria, voteThreshold: Number(e.target.value) }) } />
              <label className='form__label'>Needed Votes Count</label>
            </div>
            :
            <div className='form__group field'>
              <input type='number' className='form__field' placeholder='Number' name='number' id='number' maxLength='4' value={ `${ newCriteria.topThreshold }` } onChange={e => setNewCriteria({ ...newCriteria, topThreshold: Number(e.target.value) }) } />
              <label className='form__label'>Top Artworks Threshold Count</label>
            </div>
          }
          { newCriteria.advancedCuration &&
            <div>
              <div className='flex margin-top-s'>
                <div className='form__group field'>
                  <input type='text' className='form__field' placeholder='Scoring Metric' name='amount' id='amount' value={ metricVal } maxLength='50' onChange={e => setMetricVal(e.target.value) } />
                  <label className='form__label'>Scoring Metric</label>
                </div>
                &nbsp;<input type='submit' value='Add' className='button-min-size small-button' onClick={ () => addMetric(metricVal) } />
              </div>
              <div className='margin-top-xs text-xs'>Examples: Lighting, Theme Accuracy, Composition</div>
              <div className='margin-top'>
                <div className='text-mid'><strong>Scoring Calculation</strong></div>
                { newMetrics && newMetrics.length > 0 ?
                  <div className='text-s margin-top-s'>
                    ({ 
                      newMetrics.map((item, index) => {
                        return (<span key={ index }>{ item.metric } * { item.weight }{ index !== newMetrics.length - 1 ? ' + ' : '' }</span>)
                      })
                    })
                    / { newMetrics.length }
                  </div>
                  :
                  <div className='margin-top-s text-s'>
                    Add a scoring metric / 1
                  </div>
                }
              </div>
            </div>
          }
          { (newCriteria.advancedCuration && newMetrics && newMetrics.length > 0) &&
            <div className='margin-top-s'>
              { newMetrics.map((item, index) => {
                return (
                  <div className='margin-top-s' key={ index }>
                    <div className='flex'>
                      <div>
                        <div className='text-s'><strong>{ item.metric }</strong></div>
                        <div className='margin-top-xs text-xxs'>Weight: { item.weight }</div>
                      </div>
                      <div className='small-space' />
                      <input type='submit' value='Remove' className='button-min-size small-button' onClick={ () => removeMetric(item.metric) } />
                    </div>
                    <div className='slidecontainer'>
                      <input type='range' min='1' max='100' value={ item.weight } className='slider' id={ item.metric } onChange={ (e) => setMetricWeight(index, e.target.value) } />
                    </div>
                  </div>
                )
                })
              }
            </div>
          }
          <div className='margin-top' />
          <div className='line-spacer' />
        </div>
      }
      <div className='text-s margin-top form__title'>Blind Curation</div>
      <div className='select-dropdown margin-top-minus'>
        <select name='Mint' className='text-black' defaultValue={ `${ newCriteria.blindVoting }` } value={ `${ newCriteria.blindVoting }` } required onChange={e => setNewCriteria({ ...newCriteria, blindVoting: (e.target.value === 'true') })}>
          <option value='default' disabled hidden>
            Select an option
          </option>
          <option value='false'>Show Artist Info</option>
          <option value='true'>Hide Artist Info</option>
        </select>
      </div>
      { exhibition &&
        <div>
          <div className='form__group field'>
            <input type='text' className='form__field' placeholder='Symbol' name='symbol' id='symbol' maxLength='4' value={ `${ exhibitionSymbol }` } onChange={e => setExhibitionSymbol(e.target.value) } />
            <label className='form__label'>Symbol</label>
          </div>
          <div className='text-s'>
            'ART' is recommended for Sevens NFTs
          </div>
          <div className='form__group field'>
            <input type='text' className='form__field' placeholder='Name' name='name' id='name' maxLength='77' value={ `${ exhibitionName }` } onChange={e => setExhibitionName(e.target.value) } />
            <label className='form__label'>Contract Name</label>
          </div>
          <div className='text-s'>
            Both fields are not too important as we don't display on our website anywhere
          </div>
          <div className='margin-top-s text-xs'>
            <div>Verified Wallet: { verified }</div>
            <div>My Wallet: { connected }</div>
            { (verified.toLowerCase() !== connected.toLowerCase()) &&
              <div className='margin-top-s'>
                <em>Your verified and connected wallets do not match. Please switch or go to <Link to='/account' className='text-grey'>Edit Profile</Link> to verify your wallet.</em>
              </div>
            }
          </div>
          { programAdmin.creationInProgress ?
            <div className='margin-top-s text-s'>Exhibition creation in progress</div>
          :
            <div className='flex margin-top-s'>
              <div className='small-button' onClick={ () => setExhibition(false) }>Cancel</div>
              { (!provider || !provider.selectedAddress) &&
                <div className='small-button margin-left-s' onClick={ () => connectWallet() }>Connect Wallet</div>
              }
              { (verified.toLowerCase() === connected.toLowerCase()) &&
                <div className='small-button margin-left-s' onClick={ () => createContract() }>Create Contract</div>
              }
            </div>
          }
          { exhibitionErr && <div className='text-err text-s'>{ exhibitionErr }</div> }
        </div>
      }
      <div className='text-s margin-top form__title'>Mint to Artist or Curator</div>
      <div className='select-dropdown margin-top-minus'>
        <select name='Mint' className='text-black' defaultValue={ `${ programAdmin.mintToArtist }` } value={ `${ programAdmin.mintToArtist }` } required onChange={e => updateMintTo(e.target.value === "true") }>
          <option value='default' disabled hidden>
            Select an option
          </option>
          <option value='true'>Artist&nbsp;&nbsp;&nbsp;&nbsp;</option>
          <option value='false'>Curator&nbsp;&nbsp;&nbsp;&nbsp;</option>
        </select>
      </div>
      { !programAdmin.mintToArtist && 
        <div className='margin-top-s'>
          <div className='text-xs'>
            Address
          </div>
          <div className='text-s'>{ selectedProgram.organizers[0].wallet }</div>
        </div>
      }
      <div className='margin-top'>
        <div className='text-s'>Allow curators to vote: <strong>{ selectedProgram.curationLock ? 'No' : 'Yes' }</strong></div>
        <div className='margin-top-xs'>
          { selectedProgram.curationLock ?
            <div className='small-button' onClick={ () => lockCuration(false) }>
              Unlock Curation
            </div>
          :
            <div className='small-button' onClick={ () => lockCuration(true) }>
              Lock Curation
            </div>
          }
        </div>
      </div>
      <div className='margin-top'>
        <div className='text-s'>Hide final results from curators: <strong>{ selectedProgram.hideResults ? 'Yes' : 'No' }</strong></div>
        <div className='margin-top-xs'>
          { selectedProgram.hideResults ?
            <div className='small-button' onClick={ () => toggleResults(false) }>
              Unhide
            </div>
          :
            <div className='small-button' onClick={ () => toggleResults(true) }>
              Hide
            </div>
          }
        </div>
      </div>
      <div className='margin-top'>
        <div className='text-s'>Get Applicant Data</div>
        { !gettingE ?
          <div className='margin-top-xs flex'>
            <div className='small-button' onClick={ () => getEmails('all') }>
              All
            </div>
            <div className='small-space' />
            <div className='small-button' onClick={ () => getEmails('approved') }>
              Finalized
            </div>
            <div className='small-space' />
            <div className='small-button' onClick={ () => getEmails('deferred') }>
              Deferred
            </div>
          </div>
          :
          <div className='margin-top-xs'>
            <div className="loading"><div></div><div></div></div>
          </div>
        }
        { (emails && emails.length > 0) &&
          <CSVLink data={ emails } className='margin-top-s text-grey text-s'>Download CSV (Artist Count: { emails.length })</CSVLink>
        }
        { (emails && emails.length === 0) &&
          <div className='margin-top-s text-s'>No data - did you finalize your applicants?</div>
        }
      </div>
      <div className='margin-top'>
        <div className='text-s'>Distribute ETH Grants</div>
        { !gettingW ?
          <div className='margin-top-xs flex'>
            <div className='small-button' onClick={ () => getWallets('minted') }>
              Retrieve Wallets
            </div>
            <div className='small-space' />
          </div>
          :
          <div className='margin-top-xs'>
            <div className="loading"><div></div><div></div></div>
          </div>
        }
        { (wallets && wallets.length > 0) &&
          <div className='margin-top-s text-grey text-s pointer' onClick={ () => { setWalletOpen(true) } }>Prepare Grant & Send ETH</div>
        }
        {/* { (wallets && wallets.length > 0) &&
          <div>
            <div className='margin-top-s text-grey text-s pointer' onClick={ () => { distributeGenesis() } }>Distribute Genesis</div>
          </div>
        } */}
        { (wallets && wallets.length > 0) &&
          <div><CSVLink data={ wallets } className='margin-top-s text-grey text-s'>Download CSV (Wallet Count: { wallets.length })</CSVLink></div>
        }
        { (wallets && wallets.length === 0) &&
          <div className='margin-top-s text-s'>No data - did you finalize your applicants?</div>
        }
      </div>
      <div className='margin-top'>
        <div className='text-s'>Consolation NFT / Prize</div>
        <div className='flex'>
          <div className='form__group field'>
            <label className='file__label'>Upload (JPG, PNG, GIF, WEBP, or MP4 - Max 77MB)</label>
            <input type='file' className='form__field' placeholder='Artwork' name='artwork' id='name' accept='image/jpeg, image/png, image/gif, image/webp, video/mp4' required onChange={ (e) => uploadHandler(e.target) } />
          </div>
          <div className='small-space' />
        </div>
        { selectedProgram.consolationURL &&
          <div>
            <div className='consolation-frame'>
              { (selectedProgram.imageType === 'mp4' || selectedProgram.imageType === 'mov') ?
                <video muted loop autoPlay webkit-playsinline='true' playsInline className='gallery-art'>
                  <source src={ selectedProgram.art ? selectedProgram.art : `https://cdn.grants.art/${ selectedProgram.consolationURLWeb }` } />
                  Sorry, your browser doesn't support embedded videos.
                </video>
                :
                <img className='gallery-art' src={ selectedProgram.art ? selectedProgram.art : `https://cdn.grants.art/${ selectedProgram.consolationURLWeb }` } />
              }
            </div>
            { !selectedProgram.prizeRewarded ?
              <div className='margin-top-xs flex'>
                <div className='small-button' onClick={ () => setConsolation(true) }>
                  Create Consolation NFT
                </div>
              </div>
              :
              <div className='margin-top-xs flex text-mid'>
                Consolation Prize Distributed
              </div>
            }
          </div>
        }
      </div>
      <div className='margin-top text-mid'>
        Curators:
        <div className='small-button margin-left-s' onClick={ () => setSearch(!search) }>{ search ? 'Close' : 'Add' }</div>
        { search &&
          <div className='form__group field'>
            <input type='text' className='form__field' placeholder='Search' name='search' id='search' maxLength='100' onChange={e => searchUsers(e.target.value) } />
            <label className='form__label'>Search by name or username</label>
          </div>
        }
      </div>
      { (search && programAdmin && foundUsers) &&
        <div>
          { foundUsers.map((item, index) => {
            return (
            <div key={ index } className='margin-top-s flex'>
              <div>
                <div className='text-xs'>{ item.username }</div>
                <div className='text-s'>{ item.first } { item.last }</div>
              </div>
              <div className='margin-left-s'>
                <div className='text-grey text-xs pointer' onClick={ () => addRemoveCurator('add', item) }>
                  - Add
                </div>
              </div>
            </div>);
          })}
        </div>
      }
      { (!search && programAdmin && programAdmin.curators) &&
        <div>
          <DragDropContext onDragEnd={ reorderCurators }>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  { programAdmin.curators.map((item, index) => {
                      return (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div key={ index } className='margin-top-s flex'>
                                <img src={ Drag } className='curator-drag' />
                                <div>
                                  <div className='text-xs'>{ item.first || '--' } { item.last || '--' }</div>
                                  <div className='text-s'>{ item.username }</div>
                                </div>
                                { auth.id !== item.id &&
                                  <div className='margin-left-s'>
                                    <div className='text-grey text-xs pointer' onClick={ () => addRemoveCurator('remove', item) }>
                                      - Remove
                                    </div>
                                  </div>
                                }
                              </div>
                            </div>
                          )}
                        </Draggable>

                      );
                  }) }
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      }
    </div>
  );
}

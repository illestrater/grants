import React, { useState, useEffect, useStoreState } from 'react';
import { apiUrl } from '../../baseUrl';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import Drag from '../../assets/drag.png';
import '../../styles.scss';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default function Admin({ selectedProgram, setSelectedProgram, programs, setPrograms, auth }) {
  const [newCriteria, setNewCriteria] = useState(false);
  const [foundUsers, setFoundUsers] = useState([]);
  const [search, setSearch] = useState(false);
  const [criteria, setCriteria] = useState(false);
  const [programAdmin, setProgramAdmin] = useState({});

  useEffect(() => {
    if (selectedProgram){
      setNewCriteria({
        passByVotes: selectedProgram.passByVotes,
        blindVoting: selectedProgram.blindVoting,
        topThreshold: selectedProgram.topThreshold,
        voteThreshold: selectedProgram.voteThreshold
      });

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
    setSelectedProgram({ ...selectedProgram, passByVotes: newCriteria.passByVotes, blindVoting: newCriteria.blindVoting, topThreshold: newCriteria.topThreshold, voteThreshold: newCriteria.voteThreshold });
    setCriteria(false);
    const index = programs.findIndex(e => e.id === selectedProgram.id)
    programs[index] = { ...programs[index], passByVotes: newCriteria.passByVotes, blindVoting: newCriteria.blindVoting, topThreshold: newCriteria.topThreshold, voteThreshold: newCriteria.voteThreshold };
    setPrograms(programs);
    fetch(`${ apiUrl() }/program/updateCurationCriteria`, {
      method: 'POST',
      body: JSON.stringify({ ...newCriteria, id: selectedProgram.id, org: selectedProgram.organizers[0].id }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth.token
      },
    }).then(res => res.json())
    .then(json => {});
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

  return (
    <div className='margin-top'>
      <div className='text-mid flex'>
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
            <div className='small-button margin-left-s' onClick={ () => setCriteria(!criteria) }>Cancel</div>
            <div className='small-button margin-left-s' onClick={ () => saveCriteria() }>Save</div>
          </div>
          :
          <div className='small-button margin-left-s' onClick={ () => setCriteria(!criteria) }>Edit</div>
        }
      </div>
      { criteria &&
        <div>
          <div className='text-s margin-top form__title'>Selection Type</div>
          <div className='select-dropdown margin-top-minus'>
            <select name='Mint' className='text-black' defaultValue={ `${ newCriteria.passByVotes }` } value={ `${ newCriteria.passByVotes }` } required onChange={e => setNewCriteria({ ...newCriteria, passByVotes: (e.target.value === 'true') })}>
              <option value='default' disabled hidden>
                Select an option
              </option>
              <option value='false'>Top Submissions</option>
              <option value='true'>Vote Count</option>
            </select>
          </div>
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
        </div>
      }
      <div className='margin-top text-mid flex'>
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
        { !programAdmin.contractAddress &&
          <div className='small-button margin-left-s'>Create (Coming Soon ❤️)</div>
        }
      </div>
      <div className='margin-top text-mid flex'>
        <div>
          <div className='text-s'>
            Mint to Artist or Curator
          </div>
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
        </div>
      </div>
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
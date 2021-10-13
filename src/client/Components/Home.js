import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { apiUrl } from '../baseUrl';

import Resizer from './Tools/Resizer.js';
import '../styles.scss';

export default function Gallery() {
  const contentRef = useRef(null);

  const [programs, setPrograms] = useState(null);
  useEffect(() => {
    fetch(`${ apiUrl() }/program/getPrograms`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).then(res => res.json())
    .then(json => {
      setPrograms(json);
    });
  }, [])

  return (
    <div className='content-block' ref={ contentRef }>
      <Resizer />
      <div className='text-l flex'>
        <div className='text-s margin-right-l'>
          We are a non-profit organization dedicated to elevating artists. We provide a framework
          for curators and organizations to connect through art exhibitions and grants with charitable or benevolent
          intentions. We empower emerging artists by highlighting them, operating pro-bono, taking 0% profits, and providing a unique
          and innovative tool for collaboration.
        </div>
        <div className='flex-full' />
        <div className='text-s center'>
          <Link to='/curation' className='small-button'><div className='text-rainbow'>Curation</div></Link>
        </div>
      </div>
      <div className='cols'>
        { !programs || !programs.length ?
          <div className='center flex'>
            <div className='margin-top center'>
              <div className="loading"><div></div><div></div></div>
            </div>
          </div>
          :
          <div className='margin-top'>
            <div className='center'>
              <strong>Open Exhibitions</strong>
              <div className='margin-top-s' />
            </div>
            {
              (programs) && programs.map((item, index)=>{
                if (item.exhibiting) {
                  return (
                    <Link to={ `/${ item.url }` } className='flex' key={ index }>
                      <div className='home-button flex-full'>
                        <div className='flex'>
                          <Link to={ `/curator/${ item.organizers[0].url }` }>
                            <div className='text-rainbow text-s'>
                              <strong>{ item.organizers[0].name }</strong>
                            </div>
                          </Link>
                          <div className='flex-full' />
                          { item.organizers[0].logo && 
                            <Link to={ `/curator/${ item.organizers[0].url }` }  className='home-logo-c margin-top-minus'>
                              <img className='home-logo' src={ `https://cdn.grants.art/${ item.organizers[0].logo }` } />
                            </Link>
                          }
                        </div>
                        <div className='margin-top-s'>
                          <strong>{ item.name }</strong>
                        </div>
                        <div className='text-s margin-top-xs'>
                          { item.tagline }
                        </div>
                        <div className='text-grey text-s margin-top-s'>
                          <strong>View Exhibition</strong>
                        </div>
                      </div>
                    </Link>
                  );
                }
              })
            }
            <div className='margin-top center'>
              <strong>Upcoming Exhibitions</strong>
              <div className='margin-top-s' />
            </div>
            {
              (programs) && programs.map((item, index) => {
                if (!item.exhibiting) {
                  return (
                    <Link to={ `/${ item.url }` } className='flex' key={ index }>
                      <div className='home-button flex-full'>
                        <div className='flex'>
                          <Link to={ `/curator/${ item.organizers[0].url }` } className='text-rainbow text-s'>
                            <div className='text-rainbow text-s'>
                              <strong>{ item.organizers[0].name }</strong>
                            </div>
                          </Link>
                          <div className='flex-full' />
                          { item.organizers[0].logo && 
                            <Link to={ `/curator/${ item.organizers[0].url }` }  className='home-logo-c margin-top-minus'>
                              <img className='home-logo' src={ `https://cdn.grants.art/${ item.organizers[0].logo }` } />
                            </Link>
                          }
                        </div>
                        <div className='margin-top-s'>
                          <strong>{ item.name }</strong>
                        </div>
                        <div className='text-s margin-top-xs'>
                          { item.tagline }
                        </div>
                        <div className='margin-top-s text-s'>
                          <strong>
                            { new Date() > new Date(item.open) && new Date() < new Date(item.close) &&
                              <div className='text-grey'>Accepting submissions until { moment(item.close).format('ddd MMM Do h:mm A') }</div>
                            }
                            { new Date() < new Date(item.open) && new Date < new Date(item.close) &&
                              <div className='text-grey'>Submissions will open { moment(item.open).format('ddd MMM Do h:mm A') } and close { moment(item.close).format('ddd MMM Do h:mm A') }</div>
                            }
                            { new Date() > new Date(item.close) &&
                              <div className='text-grey'>Submissions are closed</div>
                            }
                          </strong>
                        </div>
                      </div>
                    </Link>
                  );
                }
              })
            }
            <div className='flex'>
              <div className='home-button flex-full'>
                <div className='flex'>
                  <div className='text-rainbow text-s'>
                    <strong>???????</strong>
                  </div>
                  <div className='flex-full' />
                </div>
                <div className='margin-top-s'>
                  <strong>🐇</strong>
                </div>
                <div className='margin-top-s text-s'>
                  ? ? ? ? ?
                </div>
              </div>
            </div>
            <div className='flex'>
              <div className='home-button flex-full'>
                <div className='flex'>
                  <div className='text-rainbow text-s'>
                    <strong>??????</strong>
                  </div>
                  <div className='flex-full' />
                </div>
                <div className='margin-top-s'>
                  <strong>📅</strong>
                </div>
                <div className='margin-top-s text-s'>
                  ?????????
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  );
}

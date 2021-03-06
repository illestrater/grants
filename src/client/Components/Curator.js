import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from "react-router-dom";
import { useStoreState } from 'easy-peasy';
import ReactAutolinker from 'react-autolinker';
import { apiUrl } from '../baseUrl';
import Resizer from './Tools/Resizer.js';

import Web from '../assets/website.png';
import Twitter from '../assets/twitter.png';
import Instagram from '../assets/instagram.png';
import Email from '../assets/email.png';
import '../styles.scss';

function openLink(page)
{
  let win = window.open(page, '_blank');
  win.focus();
}

function doDashes(str) {
  var re = /[^a-z0-9]+/gi; // global and case insensitive matching of non-char/non-numeric
  var re2 = /^-*|-*$/g;     // get rid of any leading/trailing dashes
  str = str.replace(re, '-');  // perform the 1st regexp
  return str.replace(re2, '').toLowerCase(); // ..aaand the second + return lowercased result
}

export default function Organizer() {
  const history = useHistory();
  const { org } = useParams();
  const auth = useStoreState(state => state.user.auth);

  const [organizer, setOrganizer] = useState(null);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    fetch(`${ apiUrl() }/program/getOrg`, {
      method: 'POST',
      body: JSON.stringify({ url: org }),
      headers: { 'Content-Type': 'application/json' },
    }).then(res => res.json())
    .then(json => setOrganizer(json));
  }, [])

  const [programSubmitting, setOrganizerSubmitting] = useState(false);
  const [updateErr, setUpdateErr] = useState(false);
  const updateOrg = e => {
    e.preventDefault();
    if (!organizer.name || !organizer.about) setUpdateErr('Please fill out all required fields');
    else {
      setUpdateErr(false);
      setOrganizerSubmitting(true);
      fetch(`${ apiUrl() }/program/updateOrg`, {
        method: 'POST',
        body: JSON.stringify({ ...organizer, logo: organizer.ext ? organizer.logo : undefined }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': auth.token
        },
      })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setEditing(false);
            setOrganizerSubmitting(false);
            history.push(`/curator/${ doDashes(organizer.name) }`)
          } else {
            setUpdateErr(json.error);
          }
        })
    }
  }

  const uploadHandler = (target) => {
    setUpdateErr(false);
    const file = target.files[0];
    const reader = new FileReader();
    const ext = target.value.substr(target.value.length - 3).toLowerCase();
    reader.readAsDataURL(file);
    let responsetype;
    reader.onload = () => {
      if (ext === 'jpg' || ext === 'jpeg') responsetype = 'image/jpeg';
      if (ext === 'png') responsetype = 'image/png';
      if (ext === 'gif') responsetype = 'image/gif';

      if (file.size < 7000000) {
        if (responsetype) {
          setOrganizer({ ...organizer, logo: reader.result, ext })
        } else {
          setUpdateErr('File type unsupported');
        }
      } else {
        setUpdateErr('File size too large');
      }
    }
  };

  let isAdmin = false;
  if (organizer) isAdmin = (auth && organizer.admins.findIndex(admin => admin === auth.id) >= 0)

  return (
    <div className='content-block'>
      <Resizer />
      <div>
        { organizer &&
          <div>
            { isAdmin &&
              <div className='flex'>
                <div className='flex-full' />
                <div className='text-s center text-grey pointer' onClick={ () => setEditing(true) }>
                  Edit Page
                </div>
              </div>
            }
            <div className='text-l flex center'>
              { (organizer.logo && !organizer.ext) && <div className='page-logo-c'><img className='page-logo' src={ `https://cdn.grants.art/${ organizer.logo }` } /></div> }
              { (organizer.logo && organizer.ext) && <div className='page-logo-c'><img className='page-logo' src={ organizer.logo } /></div> }
              { !organizer.logo && <div>{ organizer.name }</div> }
            </div>
            <div className='margin-top'>
              { !editing &&
                <div className='line-breaks'>
                  <div className='flex center'>
                    { organizer.website && <img src={ Web } className='social-icon-web pointer' alt='Website' onClick={ () => openLink(organizer.website) } /> }
                    { organizer.twitter && <img src={ Twitter } className='social-icon' alt='Twitter' onClick={ () => openLink(`https://twitter.com/${ organizer.twitter }`) } /> }
                    { organizer.instagram && <img src={ Instagram } className='social-icon' alt='Instagram' onClick={ () => openLink(`https://instagram.com/${ organizer.instagram }`) } /> }
                    { organizer.email && <a href={ `mailto:${ organizer.email }` }><img src={ Email } className='social-icon' alt='Email' /></a> }
                  </div>
                  <div className='margin-top-s'>
                    <strong>About { organizer.logo ? organizer.name : '' }</strong>
                  </div>
                  <div className='margin-top-s text-s line-breaks'>
                    <ReactAutolinker text={ organizer.about } />
                  </div>
                </div>
              }
              { editing &&
                <form onSubmit={ updateOrg }>
                  <div className='form__group field'>
                    <input type='text' className='form__field' placeholder='Organizer Name' name='organizer' id='organizer' required maxLength='100' value={ organizer.name } onChange={e => setOrganizer({ ...organizer, name: e.target.value })} />
                    <label className='form__label'>Program Curator / Organization Name</label>
                  </div>
                  <div className='text-s margin-top-s'>
                    Curator URL: { `https://grants.art/${ organizer.name ? doDashes(organizer.name) : '' } ` }
                  </div>
                  <div className='form__group field'>
                    <textarea type='text' className='form__field intent-field' placeholder='Intent' name='intent' id='intent' required maxLength='4000' value={ organizer.about } onChange={e => setOrganizer({ ...organizer, about: e.target.value })} />
                    <label className='form__label'>About</label>
                  </div>
                  <div className='form__group field'>
                    <input type='email' className='form__field' placeholder='Email' name='email' id='email' maxLength='100' value={ organizer.email } onChange={e => setOrganizer({ ...organizer, email: e.target.value })} />
                    <label className='form__label'>Public / Contact Email*</label>
                  </div>
                  <div className='form__group field'>
                    <label className='file__label'>Logo (JPG, PNG, GIF - Max 5MB)</label>
                    <input type='file' className='form__field' placeholder='Artwork' name='artwork' id='name' accept='image/jpeg, image/png, image/gif' onChange={ (e) => uploadHandler(e.target) } />
                  </div>
                  <div className='form__group field'>
                    <input type='url' className='form__field' placeholder='URL' name='url' id='url' maxLength='100' value={ organizer.website } onChange={e => setOrganizer({ ...organizer, website: e.target.value })} />
                    <label className='form__label'>Website*</label>
                  </div>
                  <div className='form__group field'>
                    <input type='text' className='form__field' placeholder='Twitter' name='twitter' id='twitter' maxLength='100' value={ organizer.twitter } onChange={e => setOrganizer({ ...organizer, twitter: e.target.value })} />
                    <label className='form__label'>Twitter*</label>
                  </div>
                  <div className='text-s'>
                    @{ organizer.twitter }
                  </div>
                  <div className='form__group field'>
                    <input type='text' className='form__field' placeholder='Instagram' name='instagram' id='instagram' maxLength='100' value={ organizer.instagram }  onChange={e => setOrganizer({ ...organizer, instagram: e.target.value })} />
                    <label className='form__label'>Instagram*</label>
                  </div>
                  <div className='text-s'>
                    @{ organizer.instagram }
                  </div>
                  { updateErr &&
                    <div className='margin-top text-s text-err'>
                      { updateErr }
                    </div>
                  }
                  { (programSubmitting) &&
                    <div className='margin-top text-s text-grey'>
                      Your program is being updated..
                    </div>
                  }
                  { (!programSubmitting) && 
                  <div>
                    <input type='submit' value='Cancel' className='submit-button' onClick={ () => setEditing(false) } />&nbsp;
                    <input type='submit' value='Update Profile' className='submit-button' />
                  </div>
                  }
                </form>
              }
            </div>
          </div>
        }
        <br />
      </div>
    </div>
  );
}
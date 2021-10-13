import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';

import '../styles.scss';
import Logo from '../assets/SF_Lockup_Black.svg';
import LogoSmall from '../assets/SF_Mark_Black.svg';

export default function Header() {
  const auth = useStoreState(state => state.user.auth);
  const location = useLocation();

  const path = location.pathname.split('/')[1];

  const small = useStoreState(state => state.app.small);

  return (
    <div className='header flex'>
      <Link to='/' className='flex remove-a'>
        <img src={ small ? LogoSmall : Logo } className={ small ? 'logo-small' : 'logo' } alt='Twitter' />
      </Link>
      <div className='flex-full' />
      <div className='nav-container'>
        <div className='flex-full' />
        <div className='header-nav'>
          <strong>
            <Link to='/ethos' rel='canonical' className= { `header-margin remove-a ${ path === 'ethos' && 'header-selected' }` }>
              Ethos
            </Link>
            <Link to='/learn' rel='canonical' className={ `header-margin remove-a ${ path === 'learn' && 'header-selected' }` }>
              Learn
            </Link>
            <Link to='/team' rel='canonical' className={ `header-margin remove-a ${ path === 'team' && 'header-selected' }` }>
              Team
            </Link>
            <Link to='/testimony' rel='canonical' className={ `header-margin remove-a ${ path === 'testimony' && 'header-selected' }` }>
              Testimonies
            </Link>
            <Link to='/program' rel='canonical' className={ `header-margin remove-a ${ (path === 'program' || path === 'apply') && 'header-selected' }` }>
              Grants
            </Link>
          </strong>
        </div>
        <div className='flex-full margin-top-xs' />
        { (auth && auth.username) ?
          <div>
            <div className='text-s flex'>
              <div className='flex-full' />
              <Link to='/account' className='pointer'><div className='text-grey'>Edit Profile</div></Link>
              &nbsp;⬡&nbsp;
              <Link to={ `/u/${ auth.username }` } className='pointer'><div className='text-rainbow'>{ auth.username }</div></Link>
            </div>
          </div>
          :
          <div>
            <div className='text-s flex'>
              <div className='flex-full' />
              <Link to='/login' className='pointer'><div className='text-grey'>Log In</div></Link>
            </div>
          </div>
        }
      </div>
    </div>
  );
}
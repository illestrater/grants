import React from 'react';
import ReactDOM from 'react-dom';
import { StoreComponent, store } from './redux';
import { useStoreRehydrated } from 'easy-peasy';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ModalProvider } from "react-modal-hook";
import Header from './Components/Header';
import Footer from './Components/Footer';
import InitializeData from "./Components/InitializeData";
import InitializeNominees from "./Components/InitializeNominees";
import Gallery from "./Components/Home";
import Ethos from "./Components/Ethos";
import FAQ from "./Components/FAQ";
import Resources from "./Components/Resources";
import Tutorial from "./Components/Tutorials/Wallet";
import Rarible from "./Components/Tutorials/Rarible";
import OpenSea from "./Components/Tutorials/OpenSea";
import Committee from "./Components/Committee";
import Donate from "./Components/Donate";
import Program from "./Components/Program";
import CreateProgram from "./Components/CreateProgram";
import Apply from "./Components/Apply";
import Organizer from "./Components/Organizer";
import Curation from "./Components/Curation/Portal";
import Testimony from "./Components/Testimony";
import Register from "./Components/Register";
import Login from "./Components/Login";
import Forgot from "./Components/Forgot";
import RecoverAccount from "./Components/RecoverAccount";
import Account from "./Components/Account";
import Genesis from "./Components/Genesis";
import VerifyEmail from "./Components/VerifyEmail";

import './styles.scss';

const App = () => {
  function WaitForStateRehydration({ children }) {
    const isRehydrated = useStoreRehydrated();
    return isRehydrated ? children : null;
  }

  return (
    <BrowserRouter onChange={() => { window.scrollTo(0, 0); console.log('YEO') }}>
      <StoreComponent store={ store }>
        <div className='App'>
          <div className='dim-gradient'>
            <div className='site-content'>
              <WaitForStateRehydration>
                <Header />
                <InitializeData />
                <InitializeNominees />
                <Switch>
                  <Route path="/" exact component={ Gallery } />
                  <Route path="/ethos" exact component={ Ethos } />
                  <Route path="/nft" exact component={ FAQ } />
                  <Route path="/resources" exact component={ Resources } />
                  <Route path="/tutorial" exact component={ Tutorial } />
                  <Route path="/rarible" exact component={ Rarible } />
                  <Route path="/opensea" exact component={ OpenSea } />
                  <Route path="/committee" exact component={ Committee } />
                  <Route path="/donate" exact component={ Donate } />
                  <Route path="/program" exact component={ Program } />
                  <Route path="/create-program" exact component={ CreateProgram } />
                  <Route path="/apply/:program" exact component={ Apply } />
                  <Route path="/curator/:org" exact component={ Organizer } />
                  <Route path="/curation" exact component = {Curation } />
                  <Route path="/testimony" exact component={ Testimony } />
                  <Route path="/register" exact component={ Register } />
                  <Route path="/login" exact component={ Login } />
                  <Route path="/forgotpassword" exact component={ Forgot } />
                  <Route path="/recoveraccount/:token" exact component={ RecoverAccount } />
                  <Route path="/account" exact component={ Account } />
                  <Route path="/verifyemail/:id" component={ VerifyEmail } />
                  <Route path="/:url/:id" component={ Genesis } />
                </Switch>
                <Footer/>
              </WaitForStateRehydration>
            </div>
          </div>
        </div>
      </StoreComponent>
    </BrowserRouter>
  );
}



console.log(`
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&&&&&&&&&&&&&&&&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&%%%%####################%%%%&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&(                          .&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&&(                         ,%&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&&(   /%%%%%%%%%%%%%%##%#  ,%%&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&(  *%%%%%%%%%%%%%%%%%#  ,%%&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&#**%&&&&&&&&&&%%%%%%#  *%%&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&&&&&&&&&&&&&%%%#  *%&&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&&&&&%(  (&&&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&&&&/  /&&&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&&&*  (&&&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&&&*  /%&&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&&%.  *%&&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&&%,  .%&&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&%%.   %%&&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&%%.   *%%&&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&%%.    (%%&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&%*     .%%&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&%        &&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&*      .&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&&&#(&&&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥&&&&&&&&♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥

`)

const rootElement = document.getElementById("root");
ReactDOM.render(
  <ModalProvider>
    <App />
  </ModalProvider>
, rootElement);

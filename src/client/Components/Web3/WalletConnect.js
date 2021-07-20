import React, { useEffect } from "react";
import { useStoreState, useStoreActions } from "easy-peasy";
import Fortmatic from "fortmatic";
import Web3 from "web3";

export default function WalletConnect() {
  const provider = useStoreState((state) => state.eth.provider);
  const setProvider = useStoreActions((dispatch) => dispatch.eth.setProvider);

  function connectWallet() {
    if (window.ethereum) {
      const provider = window.web3.currentProvider;
      if (provider.selectedAddress) {
        setProvider({ ...provider });
      } else {
        setProvider(null);
      }
    } else {
      if (!(provider && provider.selectedAddress)) {
        const fm = new Fortmatic("pk_live_B635DD2C775F3285");
        window.web3 = new Web3(fm.getProvider());
        const provider = window.web3.currentProvider;
        setProvider(provider);
      }
    }
  }

  useEffect(() => {
    setTimeout(() => {
      if (window.ethereum) {
        window.ethereum.on("accountsChanged", function (accounts) {
          connectWallet();
        });
      }

      connectWallet();
    }, 250);
  }, []);

  return <></>;
}

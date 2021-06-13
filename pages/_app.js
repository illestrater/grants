import React from "react";
import "../src/client/styles.scss";
import "../src/client/tailwind.css";
import Header from "../src/client/Components/Header";
import Footer from "../src/client/Components/Footer";
import { StoreComponent, store } from "../src/client/redux";

import { DefaultSeo } from "next-seo";
import SEO from "../next-seo.config";

import Router from "next/router";
import NProgress from "nprogress";

Router.events.on("routeChangeStart", (url) => {
  NProgress.start();
});

Router.events.on("routeChangeComplete", () => {
  NProgress.done();
});

function MyApp({ Component, pageProps }) {
  return (
    <div className="App">
      <DefaultSeo {...SEO} />
      <div className="wrapper" />
      <div className="dim-gradient">
        <StoreComponent store={store}>
          <div className="site-content">
            <Header />
            <Component {...pageProps} />
            <Footer />
          </div>
        </StoreComponent>
      </div>
    </div>
  );
}

export default MyApp;

import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="manifest" href="/manifest.json" />

          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/manifest/apple-touch-icon.png"
          />

          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/manifest/favicon-32x32.png"
          />

          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/manifest/favicon-16x16.png"
          />

          <link
            rel="shortcut icon"
            type="image/jpg"
            href="/manifest/favicon.ico"
          />

          <link
            rel="mask-icon"
            href="/manifest/safari-pinned-tab.svg"
            color="#5bbad5"
          />

          <meta name="msapplication-TileColor" content="#da532c" />
          <meta name="theme-color" content="#FFF"></meta>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

import React, { useState, useEffect } from "react";
import { usePromise } from "promise-hook";
import { Link, Redirect } from "react-router-dom";
import CountryList from "country-list";
import { useStoreState, useStoreActions } from "easy-peasy";
import { apiUrl } from "../src/client/baseUrl";
import validateUsername from "../utils/validateUsername";
import { ethers } from "ethers";

let provider, signer;

export default function Account() {
  const auth = useStoreState((state) => state.user.auth);
  const verifiedWallet = useStoreState((state) => state.user.auth.wallet);
  const setAuth = useStoreActions((dispatch) => dispatch.user.setAuth);

  const { isLoading, data } = usePromise(() => getAccount(auth.token), {
    resolve: true,
    resolveCondition: [],
  });

  const [editingAccount, setEditingAccount] = useState(false);
  const [user, setUser] = useState(null);
  const [updateUser, setUpdateUser] = useState({});
  const [application, setApplication] = useState({});
  const [err, setErr] = useState(false);
  const [submitUser, setSubmitUser] = useState(false);
  const updateAccount = (e) => {
    setSubmitUser(true);
    fetch(`${apiUrl()}/updateUser`, {
      method: "POST",
      body: JSON.stringify(updateUser),
      headers: {
        "Content-Type": "application/json",
        "Authorization": auth.token,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        setSubmitUser(false);
        if (json.error) setErr(json.error);
        else {
          const updated = auth;
          updated.username = updateUser.username;
          setUser(updateUser);
          setAuth(updated);
          setErr(false);
          setEditingAccount(false);
        }
      });
  };

  useEffect(() => {
    if (data && data.user) setUser(data.user);
    if (data && data.application) {
      setApplication({
        ...application,
        ...data.application,
        name: data.user.artistName,
        birthYear: data.user.birthYear,
        title: data.application ? data.application.title : null,
        description: data.application ? data.application.description : null,
        minted: data.application ? data.application.minted : null,
      });
    }
  }, [data]);

  const [address, setAddress] = useState(null);
  function connectWallet() {
    if (window.ethereum) {
      window.ethereum
        .enable()
        .then((provider = new ethers.providers.Web3Provider(window.ethereum)));
      signer = provider.getSigner();
      signer.getAddress().then((add) => {
        setAddress(add);
      });
    }
  }

  function verifyWallet() {
    const message = "Verify wallet address for Sevens Foundation";
    signer.signMessage(message).then((signature) => {
      fetch(`${apiUrl()}/verifyWallet`, {
        method: "POST",
        body: JSON.stringify({ address, signature }),
        headers: {
          "Content-Type": "application/json",
          "Authorization": auth.token,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json === true) {
            const updateWallet = auth;
            updateWallet.wallet = address;
            setAuth(updateWallet);
          }
        });
    });
  }

  const [sentEmailVerification, setEmailVerification] = useState(null);
  function verifyEmail() {
    fetch(`${apiUrl()}/sendEmailVerification`, {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        "Content-Type": "application/json",
        "Authorization": auth.token,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        setEmailVerification(true);
      });
  }

  useEffect(() => {
    setTimeout(() => {
      if (window.ethereum) {
        window.ethereum.on("accountsChanged", function (accounts) {
          connectWallet();
        });
      }

      connectWallet();
    }, 1000);
  }, []);

  function openLink(page) {
    page = page.replace("@", "");
    if (user.twitter.substring(0, 3) === "www") page = `https://${page}`;
    let win = window.open(page, "_blank");
    win.focus();
  }

  const [logout, setLogout] = useState(false);
  const logMeOut = (e) => {
    setAuth({});
    setLogout(true);
  };

  const [highlightConfirm, setHighlightConfirm] = useState(false);
  const createTweet = () => {
    openLink(
      `https://twitter.com/intent/tweet?text=Verifying%20my%20%40SevensGrant%20account%20❤️%0A%0Ahttps://curation.art/u/${user.username}`
    );
    setHighlightConfirm(true);
  };

  const verifyTweet = () => {
    setHighlightConfirm(false);
    fetch(`${apiUrl()}/twitter`, {
      method: "POST",
      body: JSON.stringify({ twitter: user.twitter }),
      headers: {
        "Content-Type": "application/json",
        "Authorization": auth.token,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setUser({ ...user, twitterVerified: true });
          setUpdateUser({ ...updateUser, twitterVerified: true });
          setErr(null);
        } else setErr(json.error);
      });
  };

  return (
    <div className="content-block">
      <div className="flex text-l">
        <strong>Sevens Account</strong>
        <div className="flex-full" />
        <div className="flex text-s">
          <div className="flex-full" />
          <span className="text-grey pointer" onClick={logMeOut}>
            Logout
          </span>
        </div>
      </div>
      <div className="margin-top">
        <div className="page-container">
          {editingAccount && (
            <div>
              <div className="form__group field">
                <input
                  type="text"
                  className="form__field"
                  placeholder="Username"
                  name="username"
                  id="username"
                  required
                  maxLength="15"
                  value={updateUser.username}
                  onChange={(e) => {
                    validateUsername(e.target.value.replace(/\s+/g, "")) &&
                      setUpdateUser({
                        ...updateUser,
                        username: e.target.value.replace(/\s+/g, ""),
                      });
                  }}
                />
                <label className="form__label">Username</label>
              </div>
              <div className="form__group field">
                <input
                  type="email"
                  className="form__field"
                  placeholder="Email"
                  name="email"
                  id="email"
                  required
                  maxLength="100"
                  value={updateUser.email}
                  onChange={(e) =>
                    setUpdateUser({ ...updateUser, email: e.target.value })
                  }
                />
                <label className="form__label">Email</label>
              </div>
              <div className="form__group field">
                <input
                  type="text"
                  className="form__field"
                  placeholder="First Name"
                  name="first"
                  id="first"
                  required
                  maxLength="100"
                  value={updateUser.first}
                  onChange={(e) =>
                    setUpdateUser({ ...updateUser, first: e.target.value })
                  }
                />
                <label className="form__label">First Name</label>
              </div>
              <div className="form__group field">
                <input
                  type="text"
                  className="form__field"
                  placeholder="Last Name"
                  name="last"
                  id="last"
                  required
                  maxLength="100"
                  value={updateUser.last}
                  onChange={(e) =>
                    setUpdateUser({ ...updateUser, last: e.target.value })
                  }
                />
                <label className="form__label">Last Name</label>
              </div>
              <div className="form__group field">
                <input
                  type="text"
                  className="form__field"
                  placeholder="Last Name"
                  name="last"
                  id="last"
                  required
                  maxLength="100"
                  value={updateUser.artistName}
                  onChange={(e) =>
                    setUpdateUser({ ...updateUser, artistName: e.target.value })
                  }
                />
                <label className="form__label">Artist Name</label>
              </div>
              <div className="form__group field">
                <input
                  type="text"
                  className="form__field"
                  placeholder="Name"
                  name="name"
                  id="name"
                  value={updateUser.birthYear}
                  maxLength="4"
                  onChange={(e) =>
                    setUpdateUser({ ...updateUser, birthYear: e.target.value })
                  }
                />
                <label className="form__label">Birth Year</label>
              </div>
              <div className="text-s margin-top-s form__title">
                Country of Representation
              </div>
              <div className="select-dropdown margin-top-minus">
                <select
                  name="Country"
                  className="text-black"
                  defaultValue={updateUser.country || "default"}
                  value={updateUser.country}
                  required
                  onChange={(e) =>
                    setUpdateUser({
                      ...updateUser,
                      country: e.target.value,
                      countryCode: CountryList.getCode(e.target.value),
                    })
                  }
                >
                  <option value="default" disabled hidden>
                    Country of Representation
                  </option>
                  {CountryList.getNames().map((fbb, key) => (
                    <option key={key} value={fbb}>
                      {fbb}
                    </option>
                  ))}
                  ;
                </select>
              </div>
              <div className="form__group field">
                <input
                  type="text"
                  className="form__field"
                  placeholder="City"
                  name="city"
                  id="city"
                  maxLength="100"
                  value={updateUser.city}
                  onChange={(e) =>
                    setUpdateUser({ ...updateUser, city: e.target.value })
                  }
                />
                <label className="form__label">City</label>
              </div>
              <div className="form__group field">
                <input
                  type="url"
                  className="form__field"
                  placeholder="URL"
                  name="url"
                  id="url"
                  required
                  maxLength="100"
                  value={updateUser.website}
                  onChange={(e) =>
                    setUpdateUser({ ...updateUser, website: e.target.value })
                  }
                />
                <label className="form__label">Website / Artwork URL</label>
              </div>
              <div className="form__group field">
                <textarea
                  type="text"
                  className="form__field intent-field"
                  placeholder="About"
                  name="about"
                  id="about"
                  required
                  maxLength="777"
                  value={updateUser.about}
                  onChange={(e) =>
                    setUpdateUser({ ...updateUser, about: e.target.value })
                  }
                />
                <label className="form__label">About (777 Chars)</label>
              </div>
              <div className="form__group field">
                <input
                  type="text"
                  className="form__field"
                  placeholder="Instagram"
                  name="instagram"
                  id="instagram"
                  maxLength="100"
                  value={updateUser.instagram}
                  onChange={(e) =>
                    setUpdateUser({ ...updateUser, instagram: e.target.value })
                  }
                />
                <label className="form__label">Instagram Handle</label>
              </div>
              <div className="text-s">@{updateUser.instagram}</div>
              <div className="form__group field">
                <input
                  type="text"
                  className="form__field"
                  placeholder="Twitter"
                  name="twitter"
                  id="twitter"
                  required
                  maxLength="100"
                  value={updateUser.twitter}
                  onChange={(e) =>
                    setUpdateUser({
                      ...updateUser,
                      twitter: e.target.value,
                      twitterVerified: false,
                    })
                  }
                />
                <label className="form__label">Twitter Handle</label>
              </div>
              <div className="text-s">@{updateUser.twitter}</div>
              {highlightConfirm && (
                <div className="text-s margin-top-s text-err">
                  <strong>
                    Please press Confirm Verification after tweeting!
                  </strong>
                </div>
              )}
              <div className="text-s margin-top">
                <em>
                  All fields and verifications (email, wallet, & twitter) are
                  required in order to submit artwork on Sevens
                </em>
              </div>
              {err && <div className="margin-top-s text-s text-err">{err}</div>}
              {submitUser ? (
                <div className="margin-top-s text-s text-grey">
                  Your profile is updating..
                </div>
              ) : (
                <div>
                  <input
                    type="submit"
                    value="Update Account"
                    className="submit-button"
                    onClick={updateAccount}
                  />
                  &nbsp;
                  <input
                    type="submit"
                    value="Cancel"
                    className="submit-button"
                    onClick={() => setEditingAccount(false)}
                  />
                </div>
              )}
            </div>
          )}
          {isLoading && (
            <div className="flex center">
              <div className="margin-top center">
                <div className="loading">
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>
          )}
          {!editingAccount && data && user && (
            <div>
              <div className="text-s">
                <strong>Username</strong>
              </div>
              <div className="text-s">
                {user.username}
                {user.twitterVerified && (
                  <img
                    src="/assets/verified.png"
                    className="verified-icon"
                    title="Twitter Verified"
                  />
                )}
              </div>
              <div className="text-s margin-top-s">
                <strong>Email{!user.emailVerified && " - Unverified"}</strong>
              </div>
              <div className="text-s">
                {user.email}
                {!user.emailVerified && !sentEmailVerification && (
                  <span
                    className="text-s text-grey pointer"
                    onClick={verifyEmail}
                  >
                    &nbsp;Send Verification Email
                  </span>
                )}
                {sentEmailVerification && (
                  <span>&nbsp; - Verification Email Sent</span>
                )}
              </div>
              <div>
                <div className="text-s margin-top-s">
                  <strong>Name</strong>
                </div>
                <div className="text-s">
                  {user.first} {user.last}
                </div>
              </div>
              <div>
                <div className="text-s margin-top-s">
                  <strong>Artist Name</strong>
                </div>
                <div className="text-s">{user.artistName || "--"}</div>
              </div>
              <div className="text-s margin-top-s">
                <div>
                  <strong>Country</strong>
                </div>
                <div>{user.country || "--"}</div>
              </div>
              <div className="text-s margin-top-s">
                <div>
                  <strong>City</strong>
                </div>
                <div>{user.city || "--"}</div>
              </div>
              <div className="text-s margin-top-s">
                <div>
                  <strong>Birth Year</strong>
                </div>
                <div>{user.birthYear || "--"}</div>
              </div>
              <div className="text-s margin-top-s">
                <div>
                  <strong>Website / Artwork URL</strong>
                </div>
                <div>{user.website || "--"}</div>
              </div>
              <div className="flex margin-top-s">
                <div className="flex">
                  {user.website && (
                    <div>
                      <img
                        src="/assets/website.png"
                        className="account-social-web pointer"
                        alt="Website"
                        onClick={() => openLink(user.website)}
                      />
                    </div>
                  )}
                  {user.twitter && (
                    <div>
                      <img
                        src="/assets/twitter.png"
                        className="account-social pointer"
                        alt="Twitter"
                        onClick={() =>
                          openLink(
                            user.twitter.substring(0, 4) === "http" ||
                              user.twitter.substring(0, 3) === "www"
                              ? user.twitter
                              : `https://twitter.com/${user.twitter}`
                          )
                        }
                      />
                    </div>
                  )}
                  {user.instagram && (
                    <div>
                      <img
                        src="/assets/instagram.png"
                        className="account-social pointer"
                        alt="Instagram"
                        onClick={() =>
                          openLink(
                            user.instagram.substring(0, 4) === "http" ||
                              user.instagram.substring(0, 3) === "www"
                              ? user.instagram
                              : `https://instagram.com/${user.instagram}`
                          )
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="flex-full" />
              </div>
              {user.twitter && (
                <div>
                  {user.twitterVerified ? (
                    <div className="margin-top-s text-s">
                      Twitter Verified{" "}
                      <img
                        src={Verified}
                        className="verified-icon"
                        title="Twitter Verified"
                      />
                    </div>
                  ) : (
                    <div className="flex margin-top-s">
                      <div
                        className="small-button"
                        onClick={() => createTweet()}
                      >
                        Twitter Verification
                      </div>
                      <div className="margin-left-s">→</div>
                      <div
                        className={`${
                          highlightConfirm
                            ? "button-green small-button margin-left-s"
                            : "small-button margin-left-s"
                        }`}
                        onClick={() => verifyTweet()}
                      >
                        Confirm Verification
                      </div>
                      <div className="flex-full" />
                    </div>
                  )}
                  {err && (
                    <div className="margin-top-s text-s text-err">{err}</div>
                  )}
                  <div className="margin-top-s" />
                </div>
              )}
              <div className="text-s margin-top-s">
                <strong>Verified Wallet Address</strong>
              </div>
              <div className="text-s">
                {verifiedWallet || "No Wallet Verified"}
              </div>
              <div className="text-s margin-top-s">
                <strong>Connected Wallet Address</strong>
              </div>
              <div className="text-s">
                {address || "No Wallet Connected"}
                {address && auth && auth.wallet !== address && (
                  <span
                    className="text-s text-grey pointer"
                    onClick={verifyWallet}
                  >
                    &nbsp;Verify
                  </span>
                )}
              </div>
              {!verifiedWallet && (
                <Link to="/tutorial" className="text-s text-grey pointer">
                  Setup a wallet
                </Link>
              )}
              {!editingAccount && (
                <div>
                  <input
                    type="submit"
                    value="Edit Account"
                    className="submit-button"
                    onClick={() => {
                      setEditingAccount(true);
                      setUpdateUser(user);
                    }}
                  />
                </div>
              )}
            </div>
          )}
          <br />
        </div>
      </div>
    </div>
  );
}

const getAccount = (jwt) => {
  return fetch(`${apiUrl()}/getAccount`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": jwt,
    },
  }).then((res) => res.json());
};

import React, { useState } from "react";
import { apiUrl } from "../src/client/baseUrl";
import { Redirect, useHistory } from "react-router-dom";
import { useStoreActions, useStoreState } from "easy-peasy";
import validateUsername from "../utils/validateUsername";

export default function RegisterComponent() {
  const setAuth = useStoreActions((dispatch) => dispatch.user.setAuth);
  const auth = useStoreState((state) => state.user.auth);
  const history = useHistory();

  if (auth && auth.username) history.push("/");

  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    first: "",
    last: "",
    email: "",
    submitting: false,
    typing: false,
    registerUsername: null,
    registerEmail: null,
    registerPassword: null,
    verifiedUsername: false,
    verifiedEmail: false,
    verifiedPasswords: false,
    validEmail: false,
    lengthAlert: false,
    error: "",
    register: false,
    canRegister: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState(false);
  const [logged, setLogged] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    setErr(false);
    if (
      registerData.first === "" ||
      registerData.last === "" ||
      registerData.email === ""
    ) {
      setErr("Some fields are missing!");
    } else if (registerData.password !== registerData.confirmPassword) {
      setErr("Your passwords do not match!");
    } else {
      setSubmitting(true);
      fetch(`${apiUrl()}/registerUser`, {
        method: "POST",
        body: JSON.stringify(registerData),
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.username) {
            setAuth(data);
            setLogged(true);
          } else if (data.error) {
            setSubmitting(false);
            setErr(data.error);
          }
        });
    }
  };

  return (
    <div className="content-block">
      {logged && <Redirect to="/" />}
      <div className="text-l text-b">User Registration</div>
      <div className="margin-top">
        <form onSubmit={submit}>
          <div className="form__group field">
            <input
              type="text"
              className="form__field"
              placeholder="First Name"
              name="first"
              id="first"
              required
              maxLength="100"
              value={registerData.first}
              onChange={(e) =>
                setRegisterData({ ...registerData, first: e.target.value })
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
              value={registerData.last}
              onChange={(e) =>
                setRegisterData({ ...registerData, last: e.target.value })
              }
            />
            <label className="form__label">Last Name</label>
          </div>
          <div className="form__group field">
            <input
              type="text"
              className="form__field"
              placeholder="Username"
              name="username"
              id="username"
              required
              maxLength="15"
              value={registerData.username}
              onChange={(e) => {
                validateUsername(e.target.value.replace(/\s+/g, "")) &&
                  setRegisterData({
                    ...registerData,
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
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
            />
            <label className="form__label">Email</label>
          </div>
          <div className="form__group field">
            <input
              type="password"
              className="form__field"
              placeholder="Password"
              name="password"
              id="password"
              maxLength="100"
              required
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
            />
            <label className="form__label">Password</label>
          </div>
          <div className="form__group field">
            <input
              type="password"
              className="form__field"
              placeholder="Confirm Password"
              name="password"
              id="password"
              required
              maxLength="100"
              value={registerData.confirmPassword}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  confirmPassword: e.target.value,
                })
              }
            />
            <label className="form__label">Confirm Password</label>
          </div>
          {err && <div className="margin-top-s text-s text-err">{err}</div>}
          {submitting && !submitted ? (
            <div className="margin-top-s text-s text-grey">
              Your registration is being submitted..
            </div>
          ) : (
            <input
              type="submit"
              value="Register Account"
              className="submit-button"
            />
          )}
          {submitted && (
            <div className="margin-top-s text-s text-rainbow">
              Thank you for registering! You will now be redirected to the home
              page.
              <br />
            </div>
          )}
        </form>
        <br />
      </div>
    </div>
  );
}

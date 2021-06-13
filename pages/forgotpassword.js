import React, { useState } from "react";
import { apiUrl } from "../src/client/baseUrl";

export default function ForgotPasswordPage() {
  const [data, setData] = useState(null);

  const [err, setErr] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = (e) => {
    if (!data) setErr("Please provide your username or email");
    e.preventDefault();
    setErr(false);
    setSubmitting(true);
    fetch(`${apiUrl()}/requestPassword`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        setSubmitting(false);
        setSubmitted(true);
      });
  };

  return (
    <div className="content-block">
      <div className="text-l text-b">Forgot Password</div>
      <div className="margin-top">
        {!submitting && !submitted && (
          <form onSubmit={submit}>
            <div className="form__group field">
              <input
                type="text"
                className="form__field"
                placeholder="Username or Email"
                name="username"
                id="username"
                required
                maxLength="100"
                onChange={(e) => setData({ recovery: e.target.value })}
              />
              <label className="form__label">Username or Email</label>
            </div>
            <input
              type="submit"
              value="Send Recovery Email"
              className="submit-button"
            />
          </form>
        )}
        {err && <div className="margin-top-s text-s text-err">{err}</div>}
        {submitting && (
          <div className="margin-top-s text-s text-grey">
            Sending password recovery request..
          </div>
        )}
        {submitted && (
          <div className="margin-top-s text-s text-grey">
            Your password recovery request has been sent to your registered
            email!
          </div>
        )}
      </div>
    </div>
  );
}

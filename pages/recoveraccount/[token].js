import React, { useState } from "react";
import { apiUrl } from "../../src/client/baseUrl";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const token = router.query;

  const [data, setData] = useState({});
  const [err, setErr] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!data) setErr("Please provide a new password");
    else if (data.password !== data.retype)
      setErr("Your passwords did not match");
    else {
      setErr(false);
      setSubmitting(true);
      fetch(`${apiUrl()}/recoverPassword`, {
        method: "POST",
        body: JSON.stringify({ ...data, token }),
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          setSubmitting(false);
          if (data.success) setSubmitted(true);
          else setErr(err);
        });
    }
  };

  return (
    <div className="content-block">
      <div className="text-l text-b">Set New Password</div>
      <div className="margin-top">
        {!submitting && !submitted && (
          <form onSubmit={submit}>
            <div className="form__group field">
              <input
                type="password"
                className="form__field"
                placeholder="Password"
                name="password"
                id="password"
                maxLength="100"
                required
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
              <label className="form__label">Password</label>
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
                onChange={(e) => setData({ ...data, retype: e.target.value })}
              />
              <label className="form__label">Confirm Password</label>
            </div>
            <input
              type="submit"
              value="Set New Password"
              className="submit-button"
            />
          </form>
        )}
        {err && <div className="margin-top-s text-s text-err">{err}</div>}
        {submitting && (
          <div className="margin-top-s text-s text-grey">
            Setting new password..
          </div>
        )}
        {submitted && (
          <div className="margin-top-s text-s text-grey">
            Your password has been reset. You may proceed to{" "}
            <Link href="/login" className="text-grey pointer">
              login
            </Link>
            !
          </div>
        )}
      </div>
    </div>
  );
}

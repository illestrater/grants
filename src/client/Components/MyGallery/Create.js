import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { apiUrl } from "../../baseUrl";
import { Link } from "react-router-dom";
import { useStoreActions, useStoreState } from "easy-peasy";

export default function CreateGallery({ addNewGallery, setCreate }) {
  const auth = useStoreState((state) => state.user.auth);

  const [gallery, setGallery] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(false);
  const createGallery = () => {
    if (!gallery.name) setErr("You must name your gallery");
    setErr(false);
    setSubmitting(true);
    fetch(`${apiUrl()}/gallery/create`, {
      method: "POST",
      body: JSON.stringify({ ...gallery }),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": auth.token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setSubmitting(false);
          setErr(false);
          addNewGallery(data.success);
          setCreate(false);
        } else {
          setErr(data.error || "Issue creating gallery");
        }
      });
  };

  return (
    <div className="margin-top">
      <div className="form__group field">
        <input
          type="text"
          className="form__field"
          placeholder="Username"
          name="username"
          id="username"
          required
          maxLength="100"
          value={gallery.name}
          onChange={(e) => setGallery({ ...gallery, name: e.target.value })}
        />
        <label className="form__label">Gallery Name</label>
      </div>
      <div className="form__group field">
        <textarea
          type="text"
          className="form__field intent-field"
          placeholder="Description"
          name="description"
          id="description"
          required
          maxLength="77"
          value={gallery.description}
          onChange={(e) =>
            setGallery({ ...gallery, description: e.target.value })
          }
        />
        <label className="form__label">Description (77 Chars, Optional)</label>
      </div>
      {err && <div className="margin-top-s text-s text-err">{err}</div>}
      {submitting && (
        <div className="margin-top-s text-s text-grey">Creating gallery..</div>
      )}
      <div>
        <input
          type="submit"
          value="Create"
          className="submit-button"
          onClick={() => createGallery()}
        />
        <input
          type="submit"
          value="Cancel"
          className="submit-button margin-left-s"
          onClick={() => setCreate(false)}
        />
      </div>
    </div>
  );
}

const login = (data) => {};

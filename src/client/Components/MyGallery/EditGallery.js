import React, { useState, useEffect } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { apiUrl } from "../../baseUrl";
import { Link } from "react-router-dom";
import { useStoreActions, useStoreState } from "easy-peasy";

export default function CreateGallery({
  manage,
  galleries,
  setGalleries,
  setEditGallery,
}) {
  const auth = useStoreState((state) => state.user.auth);

  const [gallery, setGallery] = useState({});
  useEffect(() => {
    if (manage) setGallery(manage);
  }, [manage]);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(false);
  const editGallery = () => {
    if (!gallery.name) setErr("You must name your gallery");
    setErr(false);
    setSubmitting(true);
    fetch(`${apiUrl()}/gallery/edit`, {
      method: "POST",
      body: JSON.stringify({ ...gallery, gallery: gallery.id }),
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
          const index = galleries.findIndex((e) => e.id === gallery.id);
          if (index >= 0) {
            galleries[index].name = gallery.name;
            galleries[index].description = gallery.description;
            setGalleries([...galleries]);
          }
          setEditGallery(false);
        } else {
          setSubmitting(false);
          setErr(data.error || "Issue updating gallery");
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
        <div className="margin-top-s text-s text-grey">Saving details..</div>
      )}
      <div>
        <input
          type="submit"
          value="Save"
          className="submit-button"
          onClick={() => editGallery()}
        />
        <input
          type="submit"
          value="Cancel"
          className="submit-button margin-left-s"
          onClick={() => setEditGallery(false)}
        />
      </div>
    </div>
  );
}

const login = (data) => {};

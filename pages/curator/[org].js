import React, { useEffect, useState } from "react";

import { apiUrl } from "../../src/client/baseUrl";
import ReactAutolinker from "react-autolinker";
import doDashes from "../../utils/doDashes";
import { useStoreState } from "easy-peasy";

export async function getServerSideProps(context) {
  const res = await fetch(`${apiUrl()}/program/getOrg`, {
    method: "POST",
    body: JSON.stringify({ url: context.query.org }),
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();

  return {
    props: { org: data }, // will be passed to the page component as props
  };
}

export default function Organizer(props) {
  const auth = useStoreState((state) => state.user.auth);
  const [organizer, setOrganizer] = useState(props.org);
  const [editing, setEditing] = useState(false);

  const [programSubmitting, setOrganizerSubmitting] = useState(false);
  const [updateErr, setUpdateErr] = useState(false);

  const updateOrg = (e) => {
    e.preventDefault();
    if (!organizer.name || !organizer.about)
      setUpdateErr("Please fill out all required fields");
    else {
      setUpdateErr(false);
      setOrganizerSubmitting(true);
      fetch(`${apiUrl()}/program/updateOrg`, {
        method: "POST",
        body: JSON.stringify({
          ...organizer,
          logo: organizer.ext ? organizer.logo : undefined,
        }),
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": auth.token,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setEditing(false);
            setOrganizerSubmitting(false);
            history.push(`/curator/${doDashes(organizer.name)}`);
          } else {
            setUpdateErr(json.error);
          }
        });
    }
  };

  const uploadHandler = (target) => {
    setUpdateErr(false);
    const file = target.files[0];
    const reader = new FileReader();
    const ext = target.value.substr(target.value.length - 3).toLowerCase();
    reader.readAsDataURL(file);
    let responsetype;
    reader.onload = () => {
      if (ext === "jpg" || ext === "jpeg") responsetype = "image/jpeg";
      if (ext === "png") responsetype = "image/png";
      if (ext === "gif") responsetype = "image/gif";

      if (file.size < 7000000) {
        if (responsetype) {
          setOrganizer({ ...organizer, logo: reader.result, ext });
        } else {
          setUpdateErr("File type unsupported");
        }
      } else {
        setUpdateErr("File size too large");
      }
    };
  };

  let isAdmin = false;
  if (organizer)
    isAdmin =
      auth && organizer.admins.findIndex((admin) => admin === auth.id) >= 0;

  return (
    <div className="content-block">
      <div>
        {organizer && (
          <div>
            {isAdmin && (
              <div className="flex">
                <div className="flex-full" />
                <div
                  className="text-s center text-grey pointer"
                  onClick={() => setEditing(true)}
                >
                  Edit Page
                </div>
              </div>
            )}
            <div className="flex text-l center">
              {organizer.logo && !organizer.ext && (
                <div className="page-logo-c">
                  <img
                    className="page-logo"
                    src={`https://cdn.grants.art/${organizer.logo}`}
                  />
                </div>
              )}
              {organizer.logo && organizer.ext && (
                <div className="page-logo-c">
                  <img className="page-logo" src={organizer.logo} />
                </div>
              )}
              {!organizer.logo && <div>{organizer.name}</div>}
            </div>
            <div className="margin-top">
              {!editing && (
                <div className="line-breaks">
                  <div className="flex center">
                    {organizer.website && (
                      <a href={organizer.website}>
                        <img
                          src={"/assets/website.png"}
                          className="social-icon-web pointer"
                          alt="Website"
                        />
                      </a>
                    )}
                    {organizer.twitter && (
                      <a href={`https://twitter.com/${organizer.twitter}`}>
                        <img
                          src={`assets/twitter.png`}
                          className="social-icon"
                          alt="Twitter"
                        />
                      </a>
                    )}
                    {organizer.instagram && (
                      <a href={`https://instagram.com/${organizer.instagram}`}>
                        <img
                          src={`assets/instagram.png`}
                          className="social-icon"
                          alt="Instagram"
                        />
                      </a>
                    )}
                    {organizer.email && (
                      <a href={`mailto:${organizer.email}`}>
                        <img
                          src={`assets/email.png`}
                          className="social-icon"
                          alt="Email"
                        />
                      </a>
                    )}
                  </div>
                  <div className="margin-top-s">
                    <strong>
                      About {organizer.logo ? organizer.name : ""}
                    </strong>
                  </div>
                  <div className="margin-top-s text-s line-breaks">
                    <ReactAutolinker text={organizer.about} />
                  </div>
                </div>
              )}
              {editing && (
                <form onSubmit={updateOrg}>
                  <div className="form__group field">
                    <input
                      type="text"
                      className="form__field"
                      placeholder="Organizer Name"
                      name="organizer"
                      id="organizer"
                      required
                      maxLength="100"
                      value={organizer.name}
                      onChange={(e) =>
                        setOrganizer({ ...organizer, name: e.target.value })
                      }
                    />
                    <label className="form__label">
                      Program Curator / Organization Name
                    </label>
                  </div>
                  <div className="text-s margin-top-s">
                    Curator URL:{" "}
                    {`https://grants.art/${
                      organizer.name ? doDashes(organizer.name) : ""
                    } `}
                  </div>
                  <div className="form__group field">
                    <textarea
                      type="text"
                      className="form__field intent-field"
                      placeholder="Intent"
                      name="intent"
                      id="intent"
                      required
                      maxLength="4000"
                      value={organizer.about}
                      onChange={(e) =>
                        setOrganizer({ ...organizer, about: e.target.value })
                      }
                    />
                    <label className="form__label">About</label>
                  </div>
                  <div className="form__group field">
                    <input
                      type="email"
                      className="form__field"
                      placeholder="Email"
                      name="email"
                      id="email"
                      maxLength="100"
                      value={organizer.email}
                      onChange={(e) =>
                        setOrganizer({ ...organizer, email: e.target.value })
                      }
                    />
                    <label className="form__label">
                      Public / Contact Email*
                    </label>
                  </div>
                  <div className="form__group field">
                    <label className="file__label">
                      Logo (JPG, PNG, GIF - Max 5MB)
                    </label>
                    <input
                      type="file"
                      className="form__field"
                      placeholder="Artwork"
                      name="artwork"
                      id="name"
                      accept="image/jpeg, image/png, image/gif"
                      onChange={(e) => uploadHandler(e.target)}
                    />
                  </div>
                  <div className="form__group field">
                    <input
                      type="url"
                      className="form__field"
                      placeholder="URL"
                      name="url"
                      id="url"
                      maxLength="100"
                      value={organizer.website}
                      onChange={(e) =>
                        setOrganizer({ ...organizer, website: e.target.value })
                      }
                    />
                    <label className="form__label">Website*</label>
                  </div>
                  <div className="form__group field">
                    <input
                      type="text"
                      className="form__field"
                      placeholder="Twitter"
                      name="twitter"
                      id="twitter"
                      maxLength="100"
                      value={organizer.twitter}
                      onChange={(e) =>
                        setOrganizer({ ...organizer, twitter: e.target.value })
                      }
                    />
                    <label className="form__label">Twitter*</label>
                  </div>
                  <div className="text-s">@{organizer.twitter}</div>
                  <div className="form__group field">
                    <input
                      type="text"
                      className="form__field"
                      placeholder="Instagram"
                      name="instagram"
                      id="instagram"
                      maxLength="100"
                      value={organizer.instagram}
                      onChange={(e) =>
                        setOrganizer({
                          ...organizer,
                          instagram: e.target.value,
                        })
                      }
                    />
                    <label className="form__label">Instagram*</label>
                  </div>
                  <div className="text-s">@{organizer.instagram}</div>
                  {updateErr && (
                    <div className="margin-top text-s text-err">
                      {updateErr}
                    </div>
                  )}
                  {programSubmitting && (
                    <div className="margin-top text-s text-grey">
                      Your program is being updated..
                    </div>
                  )}
                  {!programSubmitting && (
                    <div>
                      <input
                        type="submit"
                        value="Cancel"
                        className="submit-button"
                        onClick={() => setEditing(false)}
                      />
                      &nbsp;
                      <input
                        type="submit"
                        value="Update Profile"
                        className="submit-button"
                      />
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

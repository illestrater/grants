import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStoreState } from "easy-peasy";
import { Link } from "react-router-dom";
import ReactAutolinker from "react-autolinker";
import ReactModal from "react-modal";
import DatePicker from "react-mobile-datepicker";

import Resizer from "../../src/client/Components/Tools/Resizer";
import { apiUrl } from "../../src/client/baseUrl";
import doDashes from "../../utils/doDashes";
import moment from "moment";

export async function getServerSideProps(context) {
  const res = await fetch(`${apiUrl()}/program/getProgram`, {
    method: "POST",
    body: JSON.stringify({ url: context.query.program }),
    headers: { "Content-Type": "application/json" },
  });

  const program = await res.json();
  return { props: { program } };
}

export default function Application(props) {
  const { program } = useParams();
  const auth = useStoreState((state) => state.user.auth);
  const small = useStoreState((state) => state.app.small);

  const [user, setUser] = useState(null);
  const [programInfo, setProgram] = useState(props?.program);
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  useEffect(() => {
    if (auth && auth.token) {
      fetch(`${apiUrl()}/getAccount`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": auth.token,
        },
      })
        .then((res) => res.json())
        .then((json) => setUser(json));
    }
  }, [auth?.token]);

  const [programSubmitting, setProgramSubmitting] = useState(false);
  const [updateErr, setUpdateErr] = useState(false);
  const updateProgram = (e) => {
    e.preventDefault();
    if (
      !programInfo.name ||
      !programInfo.url ||
      !programInfo.description ||
      !programInfo.logistics ||
      !programInfo.criteria
    )
      setUpdateErr("Please fill out all required fields");
    if (
      moment(programInfo.open).add(1, "day").toDate() >
      new Date(programInfo.close)
    )
      setUpdateErr(
        "Your closing date must be at least one day after opening date"
      );
    else {
      setUpdateErr(false);
      setProgramSubmitting(true);
      fetch(`${apiUrl()}/program/updateProgram`, {
        method: "POST",
        body: JSON.stringify({
          ...programInfo,
          org: programInfo.organizers[0].id,
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
            setProgramSubmitting(false);
          } else {
            setUpdateErr(json.error);
          }
        });
    }
  };

  const [data, setData] = useState({});
  const uploadHandler = (target) => {
    setErr(false);
    const file = target.files[0];
    const reader = new FileReader();
    const ext = target.value.substr(target.value.length - 3).toLowerCase();
    reader.readAsDataURL(file);
    let responsetype;
    reader.onload = async () => {
      if (ext === "jpg" || ext === "jpeg") responsetype = "image/jpeg";
      if (ext === "png") responsetype = "image/png";
      if (ext === "gif") responsetype = "image/gif";
      if (ext === "ebp") responsetype = "image/webp";
      if (ext === "mp4") responsetype = "video/mp4";

      if (file.size < 120000000) {
        if (responsetype) {
          setData({ ...data, art: reader.result, ext, key: Math.random() });
        } else {
          setErr("File type unsupported");
        }
      } else {
        setErr("File size too large");
      }
    };
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState(false);
  const preSubmit = () => {
    if (!data.art) setErr("No artwork selected");
    else if (!data.statement) setErr("Please write a statement of intent");
    else if (!data.title || !data.description)
      setErr("Please provide an artwork title and description");
    else if (!user) setErr("Please log in to submit");
    else if (auth && !auth.wallet) setErr("Please verify a wallet to submit");
    else if (user && !user.user.emailVerified)
      setErr("Please verify your email to submit");
    else if (
      user &&
      (!user.user.artistName ||
        !user.user.city ||
        !user.user.country ||
        !user.user.twitter ||
        !user.user.website)
    )
      setErr("Please complete your user profile to submit");
    else setConfirmOpen(true);
  };

  const submit = (e) => {
    setConfirmOpen(false);
    e.preventDefault();
    if (!data.art) setErr("No artwork selected");
    else if (!data.statement) setErr("Please write a statement of intent");
    else if (!data.title || !data.description)
      setErr("Please provide an artwork title and description");
    else if (!data.canvas)
      setErr("Please specify the tools used for your artwork");
    else if (!user) setErr("Please log in to submit");
    else if (auth && !auth.wallet) setErr("Please verify a wallet to submit");
    else if (user && !user.user.emailVerified)
      setErr("Please verify your email to submit");
    else if (
      user &&
      (!user.user.artistName ||
        !user.user.city ||
        !user.user.country ||
        !user.user.twitter ||
        !user.user.website)
    )
      setErr("Please complete your user profile to submit");
    else {
      setErr(false);
      setSubmitting(true);
      fetch(`${apiUrl()}/program/submitApplication`, {
        method: "POST",
        body: JSON.stringify({ ...data, program: programInfo._id }),
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": auth.token,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json && json.error) {
            setErr(json.error);
            setSubmitting(false);
          } else setSubmitted(true);
        });
    }
  };

  const dropdownDefault =
    data.minted === undefined ? "default" : `${data.minted}`;
  let isAdmin = false;
  if (programInfo)
    isAdmin =
      auth &&
      programInfo.organizers[0].admins.findIndex(
        (admin) => admin === auth.id
      ) >= 0;
  let applied;
  if (user && user.applications && programInfo)
    applied = user.applications.find((e) => e.program === programInfo.id);

  return (
    <div className="content-block">
      {programInfo && (
        <div
          className={`${
            showStartDate ? "absolute-container" : "hidden absolute-container"
          }`}
        >
          <DatePicker
            dateConfig={dateConfig}
            isOpen={showStartDate}
            confirmText="Confirm"
            cancelText="Cancel"
            customHeader={
              <div>{moment(programInfo.open).format("ddd MMM Do h:mm A")}</div>
            }
            showCaption
            value={new Date(programInfo.open || new Date())}
            onChange={(e) =>
              setProgram({
                ...programInfo,
                open: new Date(new Date(e).setMinutes(0)),
              })
            }
            onSelect={() => setShowStartDate(false)}
            onCancel={() => setShowStartDate(false)}
            isPopup={false}
          />
        </div>
      )}
      {programInfo && (
        <div
          className={`${
            showEndDate ? "absolute-container" : "hidden absolute-container"
          }`}
        >
          <DatePicker
            dateConfig={dateConfig}
            isOpen={showEndDate}
            confirmText="Confirm"
            cancelText="Cancel"
            customHeader={
              <div>{moment(programInfo.close).format("ddd MMM Do h:mm A")}</div>
            }
            showCaption
            value={new Date(programInfo.close || new Date())}
            onChange={(e) =>
              setProgram({
                ...programInfo,
                close: new Date(new Date(e).setMinutes(0)),
              })
            }
            onSelect={() => setShowEndDate(false)}
            onCancel={() => setShowEndDate(false)}
            isPopup={false}
          />
        </div>
      )}
      <Resizer />
      <ReactModal
        isOpen={confirmOpen}
        style={{ content: { margin: "auto", width: "15rem", height: "23rem" } }}
        onRequestClose={() => setConfirmOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
      >
        <div className="text-s font">
          By submitting your artwork you agree to and honor the grant logistics
          and criteria and will not mint your piece elsewhere before the
          curation process is completed.
          <br />
          <br />
          <input
            type="submit"
            value="Cancel"
            className="small-button"
            onClick={() => setConfirmOpen(false)}
          />
          <input
            type="submit"
            value="Submit"
            className="small-button margin-left-s"
            onClick={submit}
          />
        </div>
      </ReactModal>
      <div>
        {programInfo && (
          <div>
            <div className="flex text-l">
              <strong>{programInfo.name}</strong>
              <div className="flex-full" />
              {isAdmin && (
                <div
                  className="text-s center text-grey pointer"
                  onClick={() => setEditing(true)}
                >
                  Edit Program
                </div>
              )}
            </div>
            <div className="text-s margin-top-s">
              Curated by&nbsp;
              <strong>
                <Link
                  className="text-rainbow pointer"
                  href={`/curator/${doDashes(programInfo.organizers[0].name)}`}
                >
                  {programInfo.organizers[0].name}
                </Link>
              </strong>
            </div>
            <div className="margin-top">
              {!editing && (
                <div className="text-s line-breaks">
                  <ReactAutolinker text={programInfo.description} />
                  <div className="margin-top-l text-s line-breaks">
                    <strong>Grant Logistics</strong>
                    <div className="margin-top-s line-breaks">
                      <ReactAutolinker text={programInfo.logistics} />
                    </div>
                  </div>
                  <div className="margin-top text-s">
                    <strong>Submission Criteria</strong>
                    <div className="margin-top-s">
                      <ReactAutolinker text={programInfo.criteria} />
                    </div>
                  </div>
                </div>
              )}
              {editing && (
                <div>
                  <div className="form__group field">
                    <input
                      type="text"
                      className="form__field"
                      placeholder="Program Name"
                      name="name"
                      id="name"
                      required
                      maxLength="100"
                      value={programInfo.name}
                      onChange={(e) =>
                        setProgram({ ...programInfo, name: e.target.value })
                      }
                    />
                    <label className="form__label">Program Name</label>
                  </div>
                  <div className="form__group field">
                    <input
                      type="text"
                      className="form__field"
                      placeholder="Program Name"
                      name="name"
                      id="name"
                      required
                      maxLength="100"
                      value={programInfo.url}
                      onChange={(e) =>
                        setProgram({ ...programInfo, url: e.target.value })
                      }
                    />
                    <label className="form__label">URL Permalink</label>
                  </div>
                  <div className="text-s margin-top-s">
                    Program Applicant URL:{" "}
                    {`https://grants.art/apply/${
                      programInfo.url ? programInfo.url : ""
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
                      maxLength="2000"
                      value={programInfo.description}
                      onChange={(e) =>
                        setProgram({
                          ...programInfo,
                          description: e.target.value,
                        })
                      }
                    />
                    <label className="form__label">
                      Program Description (2000 Chars)
                    </label>
                  </div>
                  <div className="form__group field">
                    <textarea
                      type="text"
                      className="form__field intent-field"
                      placeholder="Intent"
                      name="intent"
                      id="intent"
                      required
                      maxLength="300"
                      value={programInfo.tagline}
                      onChange={(e) =>
                        setProgram({ ...programInfo, tagline: e.target.value })
                      }
                    />
                    <label className="form__label">
                      Program Tagline (Home Page)
                    </label>
                  </div>
                  <div className="form__group field">
                    <textarea
                      type="text"
                      className="form__field intent-field"
                      placeholder="Intent"
                      name="intent"
                      id="intent"
                      required
                      maxLength="2000"
                      value={programInfo.logistics}
                      onChange={(e) =>
                        setProgram({
                          ...programInfo,
                          logistics: e.target.value,
                        })
                      }
                    />
                    <label className="form__label">
                      Grant Logistics (2000 Chars)
                    </label>
                  </div>
                  <div className="form__group field">
                    <textarea
                      type="text"
                      className="form__field intent-field"
                      placeholder="Intent"
                      name="intent"
                      id="intent"
                      required
                      maxLength="2000"
                      value={programInfo.criteria}
                      onChange={(e) =>
                        setProgram({ ...programInfo, criteria: e.target.value })
                      }
                    />
                    <label className="form__label">
                      Applicant Criteria (2000 Chars)
                    </label>
                  </div>
                  <div className="form__group field">
                    <input
                      type="text"
                      className="form__field"
                      placeholder="Intent"
                      name="intent"
                      id="intent"
                      required
                      maxLength="50"
                      value={programInfo.passcode}
                      onChange={(e) =>
                        setProgram({
                          ...programInfo,
                          passcode: e.target.value,
                          isProtected: e.target.value ? true : false,
                        })
                      }
                    />
                    <label className="form__label">
                      Secret phrase to submit (Optional)
                    </label>
                  </div>
                  <div className="margin-top-s text-s">
                    <strong>Submissions Open Time</strong>
                    <br />
                    {programInfo.open
                      ? moment(programInfo.open).format("ddd MMM Do h:mm A")
                      : ""}
                  </div>
                  <div className="margin-top-xs">
                    <input
                      type="submit"
                      value="Set Open Date"
                      className="small-button"
                      onClick={() => setShowStartDate(true)}
                    />
                  </div>
                  <div className="margin-top-s text-s">
                    <strong>Submissions Close Time</strong>
                    <br />
                    {programInfo.close
                      ? moment(programInfo.close).format("ddd MMM Do h:mm A")
                      : ""}
                  </div>
                  <div className="margin-top-xs">
                    <input
                      type="submit"
                      value="Set Close Date"
                      className="small-button"
                      onClick={() => setShowEndDate(true)}
                    />
                  </div>
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
                        value="Update Program"
                        className="submit-button"
                        onClick={(e) => updateProgram(e)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {!applied ? (
          <div>
            <div className="margin-top text-l">Art Submission Form</div>
            {program === "genesis" && (
              <div>
                <div className="text-s margin-top form__title">
                  Have you sold your own NFT before?
                </div>
                <div className="select-dropdown margin-top-minus">
                  <select
                    name="Mint"
                    className="text-black"
                    defaultValue={dropdownDefault}
                    value={dropdownDefault}
                    required
                    onChange={(e) =>
                      setData({ ...data, minted: e.target.value })
                    }
                  >
                    <option value="default" disabled hidden>
                      Select an option
                    </option>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
            )}
            {programInfo && programInfo.isProtected && (
              <div className="form__group field">
                <input
                  type="text"
                  className="form__field"
                  placeholder="Name"
                  name="name"
                  id="name"
                  maxLength="100"
                  onChange={(e) =>
                    setData({ ...data, passcode: e.target.value })
                  }
                />
                <label className="form__label">Secret Phrase</label>
              </div>
            )}
            <div className="form__group field">
              <textarea
                type="text"
                className="form__field intent-field"
                placeholder="Intent"
                name="intent"
                id="intent"
                required
                maxLength="2000"
                onChange={(e) =>
                  setData({ ...data, statement: e.target.value })
                }
              />
              <label className="form__label">
                Statement of Intent (2000 chars)
              </label>
            </div>
            <div className="form__group field">
              <textarea
                type="text"
                className="form__field intent-field"
                placeholder="Additional"
                name="additional"
                id="additional"
                maxLength="2000"
                onChange={(e) =>
                  setData({ ...data, additional: e.target.value })
                }
              />
              <label className="form__label">
                Additional Information (Optional 2000 chars)
              </label>
            </div>
            <div className="form__group field">
              <input
                type="text"
                className="form__field"
                placeholder="Name"
                name="name"
                id="name"
                maxLength="100"
                onChange={(e) => setData({ ...data, title: e.target.value })}
              />
              <label className="form__label">Artwork Title</label>
            </div>
            <div className="form__group field">
              <textarea
                type="text"
                className="form__field intent-field"
                placeholder="Description"
                name="description"
                id="description"
                maxLength="1000"
                onChange={(e) =>
                  setData({ ...data, description: e.target.value })
                }
              />
              <label className="form__label">Artwork Description</label>
            </div>
            <div className="form__group field">
              <input
                type="text"
                className="form__field"
                placeholder="Name"
                name="name"
                id="name"
                maxLength="100"
                onChange={(e) => setData({ ...data, canvas: e.target.value })}
              />
              <label className="form__label">
                Tools Used (e.g. C4D, Octane)
              </label>
            </div>
            <div className="form__group field">
              <label className="file__label">
                Art Submission (JPG, PNG, GIF, WEBP, or MP4 - Max 77MB)
              </label>
              <input
                type="file"
                className="form__field"
                placeholder="Artwork"
                name="artwork"
                id="name"
                accept="image/jpeg, image/png, image/gif, image/webp, video/mp4"
                required
                onChange={(e) => uploadHandler(e.target)}
              />
            </div>
            <div className="margin-top-l">Submission Preview</div>
            {user && (
              <div className="margin-top gallery-container full-width">
                {!small && (
                  <div className="gallery-description">
                    <div className="text-s">
                      <div className="gallery-plate metal linear">
                        <div className="text-s">
                          <strong>
                            {user.user.artistName || "Missing Artist Name"}
                          </strong>
                          <br />
                          {user.user.country || "Missing Country"}{" "}
                          {`(b. ${
                            user.user.birthYear || "Missing Birth Year"
                          })`}
                        </div>
                        <div className="margin-top-s text-s text-b">
                          <strong>
                            <i>{data.title || "Missing Art Title"}</i>
                          </strong>
                          , 2021
                          <br />
                          {/* { data.ext } as NFT */}
                          <div className="text-xs">{data.canvas}</div>
                        </div>
                        <div className="text-xs margin-top-s">
                          {data.description || "Missing Description"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {data.art && (
                  <div
                    className={`flex-full center ${
                      small
                        ? "gallery-frame-container-small"
                        : "gallery-frame-container"
                    }`}
                  >
                    <div className="frame gallery-art-container">
                      <div className="frame-shadow">
                        {data.ext === "mp4" || data.ext === "mov" ? (
                          <video
                            muted
                            loop
                            autoPlay
                            webkit-playsinline="true"
                            playsInline
                            className="gallery-art"
                            key={data.key}
                          >
                            <source src={data.art} />
                            Sorry, your browser doesn't support embedded videos.
                          </video>
                        ) : (
                          <img className="gallery-art" src={data.art} />
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {small && (
                  <div className="margin-top gallery-description">
                    <div className="text-s">
                      <div className="gallery-plate metal linear">
                        <div className="text-s">
                          <strong>{user.user.artistName}</strong>
                          <br />
                          {user.user.country}{" "}
                          {user.user.birthYear && `(b. ${user.user.birthYear})`}
                        </div>
                        <div className="margin-top-s text-s text-b">
                          <strong>
                            <i>{data.title || "Untitled"}</i>
                          </strong>
                          , 2021
                          <br />
                          {/* { data.ext } as NFT */}
                          <div className="text-xs">{data.canvas}</div>
                        </div>
                        <div className="text-xs margin-top-s">
                          {data.description}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {err && <div className="margin-top text-s text-err">{err}</div>}
            {submitting && !submitted && (
              <div className="margin-top text-s text-grey">
                Your artwork is being submitted..
              </div>
            )}
            {submitted && (
              <div className="margin-top text-s text-rainbow">
                Thank you for submitting your artwork!
                <br />
                The curation team is excited to check out your submission :)
              </div>
            )}
            <div>
              {!user && (
                <Link href="/login" className="margin-top text-mid text-grey">
                  You must be logged in to submit an artwork
                </Link>
              )}
              {user &&
                auth &&
                (!auth.wallet ||
                  !user.user.emailVerified ||
                  !user.user.artistName ||
                  !user.user.city ||
                  !user.user.country ||
                  !user.user.twitter ||
                  !user.user.website) && (
                  <Link
                    href="/account"
                    className="margin-top text-mid text-grey"
                  >
                    You must complete your user profile and verify wallet &
                    email to submit an artwork
                  </Link>
                )}
            </div>
            {programInfo &&
              !submitting &&
              !submitted &&
              user &&
              new Date() > new Date(programInfo.open) &&
              new Date() < new Date(programInfo.close) && (
                <input
                  type="submit"
                  value="Submit Artwork"
                  className="submit-button"
                  onClick={() => preSubmit()}
                />
              )}
          </div>
        ) : (
          <div>
            <div className="margin-top-l">Art Submission</div>
            {applied.published ? (
              <div className="margin-top">
                <Link
                  href={`/${programInfo.url}/${applied.order}`}
                  className="text-rainbow"
                >
                  Minted In Exhibition
                </Link>
              </div>
            ) : (
              <div className="margin-top text-mid">
                Status:{" "}
                {applied.finalized ? "Deferred" : "Pending Curation Review"}
              </div>
            )}
            <div className="margin-top gallery-container full-width">
              {!small && (
                <div className="gallery-description">
                  <div className="text-s">
                    <div className="gallery-plate metal linear">
                      <div className="text-s">
                        <strong>{user.user.artistName}</strong>
                        <br />
                        {user.user.country}{" "}
                        {user.user.birthYear && `(b. ${user.user.birthYear})`}
                      </div>
                      <div className="margin-top-s text-s text-b">
                        <strong>
                          <i>{applied.title || "Untitled"}</i>
                        </strong>
                        , 2021
                        <br />
                        {applied.canvas ? (
                          <div className="text-xs">{applied.canvas}</div>
                        ) : (
                          <div>
                            {applied.art.split(".")[1].toUpperCase()} as NFT
                          </div>
                        )}
                      </div>
                      <div className="text-xs margin-top-s">
                        {applied.description}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {applied.art && (
                <div
                  className={`flex-full center ${
                    small
                      ? "gallery-frame-container-small"
                      : "gallery-frame-container"
                  }`}
                >
                  <div className="frame gallery-art-container">
                    <div className="frame-shadow">
                      {applied.art.split(".")[1] === "mp4" ||
                      applied.art.split(".")[1] === "mov" ? (
                        <video
                          muted
                          loop
                          autoPlay
                          webkit-playsinline="true"
                          playsInline
                          className="gallery-art"
                        >
                          <source
                            src={`https://cdn.grants.art/${applied.art}`}
                          />
                          Sorry, your browser doesn't support embedded videos.
                        </video>
                      ) : (
                        <img
                          className="gallery-art"
                          src={`https://cdn.grants.art/${applied.art}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
              {small && (
                <div className="margin-top gallery-description">
                  <div className="text-s">
                    <div className="gallery-plate metal linear">
                      <div className="text-s">
                        <strong>{user.user.artistName}</strong>
                        <br />
                        {user.user.country}{" "}
                        {user.user.birthYear && `(b. ${user.user.birthYear})`}
                      </div>
                      <div className="margin-top-s text-s text-b">
                        <strong>
                          <i>{applied.title || "Untitled"}</i>
                        </strong>
                        , 2021
                        <br />
                        {applied.canvas ? (
                          <div className="text-xs">{applied.canvas}</div>
                        ) : (
                          <div>
                            {applied.art.split(".")[1].toUpperCase()} as NFT
                          </div>
                        )}
                      </div>
                      <div className="text-xs margin-top-s">
                        {applied.description}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {programInfo && (
          <div className="margin-top text-mid">
            <em>
              {new Date() > new Date(programInfo.open) &&
                new Date() < new Date(programInfo.close) && (
                  <div>
                    Submissions are open until{" "}
                    {moment(programInfo.close).format("ddd MMM Do h:mm A")}
                  </div>
                )}
              {new Date() < new Date(programInfo.open) &&
                new Date() < new Date(programInfo.close) && (
                  <div>
                    Submissions will open{" "}
                    {moment(programInfo.open).format("ddd MMM Do h:mm A")} and
                    close{" "}
                    {moment(programInfo.close).format("ddd MMM Do h:mm A")}
                  </div>
                )}
              {new Date() > new Date(programInfo.close) && (
                <div>Submissions are closed</div>
              )}
            </em>
          </div>
        )}
        <br />
      </div>
    </div>
  );
}

const monthMap = {
  "1": "Jan",
  "2": "Feb",
  "3": "Mar",
  "4": "Apr",
  "5": "May",
  "6": "Jun",
  "7": "Jul",
  "8": "Aug",
  "9": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

const dateConfig = {
  month: {
    format: (value) => monthMap[value.getMonth() + 1],
    caption: "Month",
    step: 1,
  },
  date: {
    format: "DD",
    caption: "Day",
    step: 1,
  },
  hour: {
    format: "hh",
    caption: "Hour",
    step: 1,
  },
};

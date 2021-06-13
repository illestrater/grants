import React from "react";
import { usePromise } from "promise-hook";
import { useParams } from "react-router-dom";
import { apiUrl } from "../baseUrl";

import "../styles.scss";

export default function VerifyEmail() {
  const { id } = useParams();
  const { isLoading, data } = usePromise(() => verifyEmail(id), {
    resolve: true,
    resolveCondition: [],
  });

  let verified = false;
  if (data === true) verified = true;

  return (
    <div className="content-block">
      <div className="text-l text-b">Email Verification</div>
      <div className="page-container margin-top ethos-text">
        {!verified ? (
          <div>Verifying Email...</div>
        ) : (
          <div>Email successfully verified!</div>
        )}
        <br />
        <br />
      </div>
    </div>
  );
}

const verifyEmail = (token) => {
  return fetch(`${apiUrl()}/verifyEmail`, {
    method: "POST",
    body: JSON.stringify({ token }),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};

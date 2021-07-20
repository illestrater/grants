import React from "react";
import { apiUrl } from "../../src/client/baseUrl";

export async function getServerSideProps(context) {
  const { id } = context.query;

  const res = await fetch(`${apiUrl()}/verifyEmail`, {
    method: "POST",
    body: JSON.stringify({ token: id }),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  });

  const verification = await res.json();
  return { props: { verification } };
}

export default function VerifyEmail(props) {
  let verified = false;
  if (props?.verification === true) verified = true;

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

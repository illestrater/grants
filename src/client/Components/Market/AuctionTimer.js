import React, { useState, useEffect } from "react";
import moment from "moment";
import useInterval from "@use-it/interval";

export default function AuctionTimer({ time }) {
  const [timeLeft, setTimeLeft] = useState(null);
  useInterval(() => {
    setTimeLeft(Math.random());
  }, 1000);

  const diff = moment.duration(moment(time).diff(moment()));
  const timer = `${diff.days() ? `${diff.days()}d ` : ""}${
    diff.hours() ? `${diff.hours()}h ` : ""
  }${diff.minutes() ? `${diff.minutes()}m ` : ""}${diff.seconds()}s left`;

  return (
    <div
      className={`${
        time - new Date().getTime() < 1000 * 60 * 10 && "text-err "
      }auction-info text-mid`}
    >
      <strong>{timer}</strong>
    </div>
  );
}

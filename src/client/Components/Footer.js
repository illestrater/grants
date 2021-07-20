import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="block footer">
      <div className="center text-s">
        Curated by{" "}
        <Link href="/team">
          <a className="remove-a">
            <div className="text-grey">Sevens Foundation Committee</div>
          </a>
        </Link>
        <br />
        <br />
        Developed by{" "}
        <a
          target="_blank"
          className="text-rainbow pointer"
          href="https://y.at/%F0%9F%91%89%F0%9F%8E%B1%F0%9F%95%B3"
        >
          illestrater
        </a>
        <br />
      </div>
      <div className="flex flex-row space-x-4 margin-top center">
        <a href="https://twitter.com/sevensgrant">
          <img src="/assets/twitter.png" className="w-8 h-8" alt="Twitter" />
        </a>

        <a href="https://instagram.com/sevensgrant">
          <img
            src="/assets/instagram.png"
            className="w-8 h-8"
            alt="Instagram"
          />
        </a>
        <a href="https://discord.gg/YB4HDKwxyc">
          <img src="/assets/discord.png" className="w-8 h-8" alt="Instagram" />
        </a>
      </div>
    </footer>
  );
}

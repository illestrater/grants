import React from "react";
import { useStoreState } from "easy-peasy";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const auth = useStoreState((state) => state.user.auth);

  return (
    <div className="flex header">
      <Link href="/">
        <a className="flex remove-a">
          <img
            src="/assets/logo.svg"
            className="logo"
            alt="Seven Grants Logo"
          />
        </a>
      </Link>
      <div className="flex-full"></div>
      <div className="nav-container">
        <div className="flex-full" />
        <div className="header-nav">
          <strong>
            <Link href="/ethos">
              <a
                href="/ethos"
                rel="canonical"
                className={`header-margin remove-a ${
                  router.asPath === "/ethos" && "header-selected"
                }`}
              >
                Ethos
              </a>
            </Link>
            <Link href="/learn">
              <a
                href="/learn"
                rel="canonical"
                className={`header-margin remove-a ${
                  router.asPath === "/learn" && "header-selected"
                }`}
              >
                Learn
              </a>
            </Link>
            <Link href="/team">
              <a
                href="/team"
                rel="canonical"
                className={`header-margin remove-a ${
                  router.asPath === "/team" && "header-selected"
                }`}
              >
                Team
              </a>
            </Link>
            <Link href="/testimony">
              <a
                href="/testimony"
                rel="canonical"
                className={`header-margin remove-a ${
                  router.asPath === "/testimony" && "header-selected"
                }`}
              >
                Testimonies
              </a>
            </Link>
            <Link href="/program">
              <a
                href="/program"
                rel="canonical"
                className={`header-margin remove-a ${
                  (router.asPath === "/program" || router.asPath === "apply") &&
                  "header-selected"
                }`}
              >
                Grants
              </a>
            </Link>
          </strong>
        </div>
        <div className="flex-full margin-top-xs" />
        {auth?.username ? (
          <div>
            <div className="flex text-s">
              <div className="flex-full" />
              <a href="/account" className="pointer">
                <div className="text-grey">Edit Profile</div>
              </a>
              &nbsp;⬡&nbsp;
              <a href={`/u/${auth.username}`} className="pointer">
                <div className="text-rainbow">{auth.username}</div>
              </a>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex text-s">
              <div className="flex-full" />
              <Link href="/login">
                <a className="pointer">
                  <div className="text-grey">Log In</div>
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

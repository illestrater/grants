import React, { useState } from "react";
import moment from "moment";
import Link from "next/link";

import dbConnect from "../utils/dbConnect";
import Program from "../models/programModel";

export async function getServerSideProps() {
  await dbConnect();

  const programs = await Program.find({ active: true }, (err, data) => {
    return err ? err : data;
  })
    .select(
      "organizers name url exhibiting tagline description total open close closeApplication"
    )
    .populate("organizers")
    .sort("order");

  return {
    props: { programs: JSON.parse(JSON.stringify(programs)) },
  };
}

export default function Home(props) {
  const [programs] = useState(props?.programs ?? []);

  return (
    <div className="content-block">
      <div className="flex text-l">
        <div className="margin-right-s">
          <strong>Sevens Foundation</strong>
        </div>
        <div className="flex-full" />
        <div className="text-s center">
          <Link href="/curation" className="small-button">
            <div className="text-rainbow">Curation</div>
          </Link>
        </div>
      </div>
      <div className="text-s margin-top-s text-desc">
        We are a non-profit organization dedicated to elevating artists. We
        provide a framework for curators and organizations to connect through
        art exhibitions and grants with charitable or benevolent intentions. We
        empower emerging artists by highlighting them, operating pro-bono,
        taking 0% profits, and providing a unique and innovative tool for
        collaboration.
      </div>
      <div className="cols">
        {!programs || !programs.length ? (
          <div className="flex center">
            <div className="margin-top center">
              <div className="loading">
                <div></div>
                <div></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="margin-top">
            <div className="center">
              <strong>Open Exhibitions</strong>
              <div className="margin-top-s" />
            </div>
            <section className="flex flex-col">
              {programs &&
                programs.map((item, index) => {
                  if (item.exhibiting) {
                    return (
                      <Link href={`/${item.url}`} className="flex" key={index}>
                        <div className="relative w-full h-full home-button flex-full">
                          <div className="flex">
                            <Link href={`/curator/${item.organizers[0].url}`}>
                              <div className="text-rainbow text-s">
                                <strong>{item.organizers[0].name}</strong>
                              </div>
                            </Link>
                            <div className="flex-full" />
                            {item.organizers[0].logo && (
                              <Link
                                href={`/curator/${item.organizers[0].url}`}
                                className="home-logo-c margin-top-minus"
                              >
                                <div className="home-logo-c margin-top-minus">
                                  <img
                                    className="right-0 home-logo"
                                    src={`https://cdn.grants.art/${item.organizers[0].logo}`}
                                  />
                                </div>
                              </Link>
                            )}
                          </div>
                          <div className="margin-top-s">
                            <strong>{item.name}</strong>
                          </div>
                          <div className="text-s margin-top-xs">
                            {item.tagline}
                          </div>
                          <div className="text-grey text-s margin-top-s">
                            <strong>View Exhibition</strong>
                          </div>
                        </div>
                      </Link>
                    );
                  }
                })}
            </section>
            <div className="margin-top center">
              <strong>Upcoming Exhibitions</strong>
              <div className="margin-top-s" />
            </div>
            <section className="flex flex-col">
              {programs &&
                programs.map((item, index) => {
                  if (!item.exhibiting) {
                    return (
                      <Link href={`/${item.url}`} className="flex" key={index}>
                        <div className="home-button flex-full">
                          <div className="flex">
                            <Link
                              href={`/curator/${item.organizers[0].url}`}
                              className="text-rainbow text-s"
                            >
                              <div className="text-rainbow text-s">
                                <strong>{item.organizers[0].name}</strong>
                              </div>
                            </Link>
                            <div className="flex-full" />
                            {item.organizers[0].logo && (
                              <Link href={`/curator/${item.organizers[0].url}`}>
                                <div className="home-logo-c margin-top-minus">
                                  <img
                                    className="home-logo"
                                    src={`https://cdn.grants.art/${item.organizers[0].logo}`}
                                  />
                                </div>
                              </Link>
                            )}
                          </div>
                          <div className="margin-top-s">
                            <strong>{item.name}</strong>
                          </div>
                          <div className="text-s margin-top-xs">
                            {item.tagline}
                          </div>
                          <div className="margin-top-s text-s">
                            <strong>
                              {new Date() > new Date(item.open) &&
                                new Date() < new Date(item.close) && (
                                  <div className="text-grey">
                                    Accepting submissions until{" "}
                                    {moment(item.close).format(
                                      "ddd MMM Do h:mm A"
                                    )}
                                  </div>
                                )}
                              {new Date() < new Date(item.open) &&
                                new Date() < new Date(item.close) && (
                                  <div className="text-grey">
                                    Submissions will open{" "}
                                    {moment(item.open).format(
                                      "ddd MMM Do h:mm A"
                                    )}{" "}
                                    and close{" "}
                                    {moment(item.close).format(
                                      "ddd MMM Do h:mm A"
                                    )}
                                  </div>
                                )}
                              {new Date() > new Date(item.close) && (
                                <div className="text-grey">
                                  Submissions are closed
                                </div>
                              )}
                            </strong>
                          </div>
                        </div>
                      </Link>
                    );
                  }
                })}
            </section>
            <div className="flex">
              <div className="home-button flex-full">
                <div className="flex">
                  <div className="text-rainbow text-s">
                    <strong>???????</strong>
                  </div>
                  <div className="flex-full" />
                </div>
                <div className="margin-top-s">
                  <strong>🐇</strong>
                </div>
                <div className="margin-top-s text-s">? ? ? ? ?</div>
              </div>
            </div>
            <div className="flex">
              <div className="home-button flex-full">
                <div className="flex">
                  <div className="text-rainbow text-s">
                    <strong>??????</strong>
                  </div>
                  <div className="flex-full" />
                </div>
                <div className="margin-top-s">
                  <strong>📅</strong>
                </div>
                <div className="margin-top-s text-s">?????????</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import auth from "../../../src/server/services/authorization-service";
import dbConnect from "../../../utils/dbConnect";

import ProgramApplicant from "../../../models/programApplicantModel";
import Organizer from "../../../models/organizerModel";
import Program from "../../../models/programModel";
import User from "../../../models/userModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
  const user = await User.findById(jwt.id);
  if (!user) return res.json({ error: "Authentication error" });

  let org;
  if (req.body.existing) {
    org = await Organizer.findById(req.body.existing);
    if (!org) return res.json({ error: "That org does not seem to exist" });
  } else {
    org = new Organizer({
      admins: [jwt.id],
      name: req.body.orgName,
      url: doDashes(req.body.orgName),
      about: req.body.about,
      email: req.body.email,
      website: req.body.website,
      twitter: req.body.twitter,
      instagram: req.body.instagram,
    });

    org.save();
  }

  const newProgram = new Program({
    organizers: [org._id],
    name: req.body.name,
    url: doDashes(req.body.url),
    description: req.body.description,
    logistics: req.body.logistics,
    criteria: req.body.criteria,
    curators: [jwt.id],
    active: false,
  });

  switch (method) {
    case "POST":
      try {
        newProgram.save((err, data) => {
          if (err) return res.status(500).json(err);
          else {
            return res.json(true);
          }
        });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

import auth from "../../../src/server/services/authorization-service";
import templates from "../../../src/server/emails/templates";
import dbConnect from "../../../utils/dbConnect";

import ProgramApplicant from "../../../models/programApplicantModel";
import Program from "../../../models/programModel";
import User from "../../../models/userModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
        const user = await User.findById(jwt.id);
        if (!user) return res.json({ error: "Authentication error" });

        const isCurator = await Program.find({ curators: user._id });
        if (!isCurator) return res.json({ error: "Authentication error" });

        return ProgramApplicant.find(
          {
            program: req.body.program,
            ineligible: { $ne: true },
            finalized: { $ne: true },
          },
          (err, data) => {
            const unapproved = [],
              approved = [],
              rejected = [];
            data.forEach((e) => {
              if (e.approved.find((g) => g._id.equals(jwt.id)))
                approved.push(e);
              else if (e.rejected.find((g) => g._id.equals(jwt.id)))
                rejected.push(e);
              else unapproved.push(e);
            });

            return err
              ? res.status(500).json(err)
              : res.json({ unapproved, approved, rejected });
          }
        ).populate(
          "user",
          "artistName birthYear country city website twitter instagram"
        );
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

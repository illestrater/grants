import auth from "../../../src/server/services/authorization-service";
import dbConnect from "../../../utils/dbConnect";

import ProgramApplicant from "../../../models/programApplicantModel";
import Organizer from "../../../models/organizerModel";
import Program from "../../../models/programModel";
import User from "../../../models/userModel";
import fs from "fs";

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
        if (isCurator.curationLock)
          return res.json({ error: "Curation locked" });

        return ProgramApplicant.findById(req.body.id, (err2, data) => {
          if (err2) return res.status(500).json(err);
          else {
            if (req.body.type === "approve") {
              const index = data.approved.findIndex((e) => e.equals(jwt.id));
              if (index < 0) {
                data.approved.push(jwt.id);
                data.approvalCount++;
                data.save();
              }
            } else if (req.body.type === "reject") {
              const index = data.rejected.findIndex((e) => e.equals(jwt.id));
              if (index < 0) {
                data.rejected.push(jwt.id);
                data.rejectCount++;
                data.save();
              }
            }

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

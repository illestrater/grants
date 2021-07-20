import auth from "../../../src/server/services/authorization-service";
import dbConnect from "../../../utils/dbConnect";

import ProgramApplicant from "../../../models/programApplicantModel";
import Organizer from "../../../models/organizerModel";
import Program from "../../../models/programModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
        const organizer = await Organizer.findOne({
          _id: req.body.org,
          admins: jwt.id,
        });
        if (!organizer) return res.json({ error: "Authentication error" });
        const program = await Program.findById(req.body.program);
        if (!program) return res.json({ error: "Authentication error" });

        if (!req.body.applicants) return res.json({ error: "Missing data" });

        let order = program.total + 1;

        for (const applicant of req.body.applicants) {
          await ProgramApplicant.findById(applicant.id).then((data) => {
            if (req.body.finalize) {
              data.order = order;
              data.prepared = true;
              data.save();
              order++;
            } else {
              data.order = undefined;
              data.prepared = false;
              data.save();
            }
          });
        }

        program.finalized = req.body.finalize;
        program.save();

        return res.json({ success: "Approval finalized" });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

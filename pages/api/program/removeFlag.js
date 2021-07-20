import auth from "../../../src/server/services/authorization-service";
import dbConnect from "../../../utils/dbConnect";

import ProgramApplicant from "../../../models/programApplicantModel";
import User from "../../../models/userModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        auth(req.headers.authorization, res, (jwt) => {
          User.findById(jwt.id, (err, user) => {
            if (err) return res.json(err);
            if (!user || !user.committee)
              return res.status(401).json({ err: "Authentication error" });
            else {
              return ProgramApplicant.findById(req.body.id, (err2, data) => {
                if (err2) return res.status(500).json(err);
                else {
                  const flaggedIndex = data.flagged.findIndex((e) =>
                    e.equals(req.body.flagId)
                  );
                  data.flagged.splice(flaggedIndex, 1);

                  data.save();
                }

                return res.json(true);
              });
            }
          });
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

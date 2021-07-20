import auth from "../../../src/server/services/authorization-service";
import templates from "../../../src/server/emails/templates";
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
            if (!user)
              return res.status(401).json({ err: "Authentication error" });
            return ProgramApplicant.findOne(
              { user: user._id },
              (err, applicant) => {
                applicant.minted = req.body.minted;
                applicant.description = req.body.description;
                applicant.name = req.body.name;
                applicant.title = req.body.title;
                applicant.save();
                user.artistName = req.body.name;
                user.birthYear = req.body.birthYear;
                user.save();
                return res.json("Application updated");
              }
            );
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

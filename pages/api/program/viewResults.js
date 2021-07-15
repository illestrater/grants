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
        const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
        const user = await User.findById(jwt.id);
        if (!user) return res.json({ error: "Authentication error" });

        const program = await Program.findById(req.body.program);
        if (!program) return res.json({ error: "Could not find data" });

        const result = await ProgramApplicant.find(
          { program: req.body.program },
          (err, data) => {
            return err ? res.status(500).json(err) : res.json(data);
          }
        )
          .populate(
            "user",
            "artistName birthYear country city website twitter instagram"
          )
          .sort(program.finalized ? "order" : "-approvalCount")
          .select("-approved -rejected");

        res.json(result);
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

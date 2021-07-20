import auth from "../../../src/server/services/authorization-service";
import dbConnect from "../../../utils/dbConnect";
import Organizer from "../../../models/organizerModel";
import Program from "../../../models/programModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
        const organizer = await Organizer.findOne({
          _id: req.body.org,
          admins: jwt.id,
        });
        if (!organizer) return res.json({ error: "Authentication error" });
        const program = await Program.findById(req.body.id);
        if (!program) return res.json({ error: "Authentication error" });

        program.name = req.body.name;
        program.url = req.body.url;
        program.passcode = req.body.passcode;
        program.isProtected = req.body.passcode ? true : false;
        program.tagline = req.body.tagline;
        program.description = req.body.description;
        program.logistics = req.body.logistics;
        program.criteria = req.body.criteria;
        program.open = req.body.open;
        program.close = req.body.close;
        program.save();

        res.json({ success: "Program updated" });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

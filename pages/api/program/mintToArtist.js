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
        const organizer = await Organizer.findOne({ admins: jwt.id });
        if (!organizer) return res.json({ error: "Authentication error" });

        return Program.findById(req.body.program, (err, program) => {
          if (!program.organizers.find((e) => e.equals(organizer._id)))
            return res.json({ error: "Authentication error" });

          program.mintToArtist = req.body.mintToArtist;
          program.save();
          return err
            ? res.status(500).json(err)
            : res.json({ success: "Updated" });
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

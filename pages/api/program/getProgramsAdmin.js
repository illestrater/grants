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
        if (!jwt) return res.json({ error: "Authentication error" });
        const organizer = await Organizer.findOne({ admins: jwt.id });
        if (!organizer) return res.json({ error: "Authentication error" });

        Program.findById(req.body.program, (err, data) => {
          if (!data.organizers.find((e) => e.equals(organizer._id)))
            return res.json({ error: "Authentication error" });
          return err ? res.status(500).json(err) : res.json(data);
        }).populate("curators", "first last username");
      } catch (error) {
        res.status(400).json({ success: false });
      }

      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

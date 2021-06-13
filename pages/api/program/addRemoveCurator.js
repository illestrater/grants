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

        if (jwt.id === req.body.curator)
          return res.json({ error: "You cannot add or remove yourself" });

        return Program.findById(req.body.program, (err, data) => {
          if (!data.organizers.find((e) => e.equals(organizer._id)))
            return res.json({ error: "Authentication error" });

          const index = data.curators.findIndex((e) =>
            e.equals(req.body.curator)
          );

          if (req.body.type === "remove") {
            if (index >= 0) {
              data.curators.splice(index, 1);
              data.save();
              return res.json({ success: "Curator removed" });
            }
          } else if (req.body.type === "add") {
            if (index < 0) {
              data.curators.push(req.body.curator);
              data.save();
              return res.json({ success: "Curator added" });
            }
          }

          return res.json({ error: "Could not find curator" });
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

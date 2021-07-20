import auth from "../../../src/server/services/authorization-service";
import dbConnect from "../../../utils/dbConnect";
import Organizer from "../../../models/organizerModel";
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

        const org = await Organizer.findOne({ admins: jwt.id });
        if (!org) return res.json(null);

        return res.json(org);
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

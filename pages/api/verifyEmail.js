import dbConnect from "../../utils/dbConnect";
import User from "../../models/userModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        User.findOne({ emailToken: req.body.token }, (err, user) => {
          if (err) return res.json(err);
          if (!user)
            return res.status(401).json({ err: "Authentication error" });
          else {
            user.emailVerified = true;
            user.save();
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

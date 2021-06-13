import dbConnect from "../../utils/dbConnect";
import User from "../../models/userModel";
import crypto from "crypto";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        User.findOne({ recoveryToken: req.body.token }, (err, user) => {
          if (err) {
            return next(err);
          } else if (!user) {
            return res.status(401).json({ error: `Invalid request` });
          }

          user.salt = new Buffer(
            crypto.randomBytes(16).toString("base64"),
            "base64"
          );
          user.password = crypto
            .pbkdf2Sync(req.body.password, user.salt, 10000, 64, "sha1")
            .toString("base64");
          user.save();

          return res.json({ success: "Password changed" });
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

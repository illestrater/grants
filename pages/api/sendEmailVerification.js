import auth from "../../src/server/services/authorization-service";
import templates from "../../src/server/emails/templates";
import dbConnect from "../../utils/dbConnect";
import User from "../../models/userModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        auth(req.headers.authorization, res, (jwt) => {
          User.findById(jwt.id, (err, user) => {
            if (err) return res.json(err);
            if (!user)
              return res.status(401).json({ err: "Authentication error" });
            transporter.sendMail(
              templates.verification(user.email, user.username, user.emailToken)
            );
            return res.json("Verification sent");
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

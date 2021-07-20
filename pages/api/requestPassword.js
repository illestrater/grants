import templates from "../../src/server/emails/templates";
import dbConnect from "../../utils/dbConnect";
import User from "../../models/userModel";
import crypto from "crypto";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        User.findOne(
          {
            $or: [
              {
                email: {
                  $regex: new RegExp(
                    `^${req.body.recovery.toLowerCase().trim()}$`,
                    "i"
                  ),
                },
              },
              {
                username: {
                  $regex: new RegExp(
                    `^${req.body.recovery.toLowerCase().trim()}$`,
                    "i"
                  ),
                },
              },
            ],
          },
          (err, user) => {
            if (err) {
              return next(err);
            } else if (!user) {
              return res
                .status(401)
                .json(`Could not find user: ${req.body.username}`);
            } else if (
              user.username.toLowerCase() !==
                req.body.recovery.toLowerCase().trim() &&
              user.email.toLowerCase() !==
                req.body.recovery.toLowerCase().trim()
            ) {
              return res
                .status(401)
                .json(`Could not find user: ${req.body.username}`);
            } else {
              user.recoveryToken = crypto.randomBytes(32).toString("hex");
              const expires = new Date();
              expires.setHours(expires.getHours() + 24);
              user.recoveryExpiration = expires;
              user.save();
              transporter.sendMail(
                templates.passRecovery(
                  user.email,
                  user.username,
                  user.recoveryToken
                )
              );
            }

            return res.json(true);
          }
        );
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

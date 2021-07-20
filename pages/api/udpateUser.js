import auth from "../../src/server/services/authorization-service";
import templates from "../../src/server/emails/templates";
import dbConnect from "../../utils/dbConnect";

import ProgramApplicant from "../../models/programApplicantModel";
import User from "../../models/userModel";
import crypto from "crypto";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        auth(req.headers.authorization, res, (jwt) => {
          User.findById(jwt.id, async (err, user) => {
            if (err) return res.json(err);
            if (!user)
              return res.status(401).json({ error: "Authentication error" });

            if (!req.body.username || !req.body.email)
              res.json({ error: "You are missing some required fields" });

            const existingApplication = await ProgramApplicant.findOne({
              user: user._id,
              finalized: false,
            });
            if (
              existingApplication &&
              (!req.body.first ||
                !req.body.last ||
                !req.body.birthYear ||
                !req.body.artistName ||
                !req.body.country ||
                !req.body.countryCode ||
                !req.body.city ||
                !req.body.website ||
                !req.body.twitter ||
                !req.body.instagram)
            ) {
              return res.json({
                error:
                  "You must have all fields completed until your art submission is processed",
              });
            }

            const exists = await User.findOne({
              email: {
                $regex: new RegExp(
                  `^${req.body.email.toLowerCase().trim()}$`,
                  "i"
                ),
              },
            });
            if (exists && !exists._id.equals(user._id))
              return res.json({ error: "That email already exists" });

            const exists2 = await User.findOne({
              username: {
                $regex: new RegExp(
                  `^${req.body.username.toLowerCase().trim()}$`,
                  "i"
                ),
              },
            });
            if (exists2 && !exists2._id.equals(user._id))
              return res.json({ error: "That username already exists" });

            user.username = req.body.username;
            if (user.email !== req.body.email.toLowerCase().trim()) {
              const emailToken = crypto.randomBytes(32).toString("hex");
              user.emailVerified = false;
              user.emailToken = emailToken;
              user.email = req.body.email.toLowerCase().trim();
              transporter.sendMail(
                templates.verification(
                  user.email,
                  user.username,
                  user.emailToken
                )
              );
            }

            user.first = req.body.first;
            user.last = req.body.last;
            user.birthYear = req.body.birthYear;
            user.artistName = req.body.artistName;
            user.country = req.body.country;
            user.countryCode = req.body.countryCode;
            user.about = req.body.about;
            user.city = req.body.city;
            user.website = req.body.website;
            if (
              req.body.twitter &&
              user.twitter &&
              req.body.twitter.toLowerCase().trim() !==
                user.twitter.toLowerCase().trim()
            ) {
              user.twitterVerified = false;
            }
            user.twitter = req.body.twitter;
            user.instagram = req.body.instagram;
            user.save();
            return res.json("Profile updated");
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

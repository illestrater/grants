import dbConnect from "../../../utils/dbConnect";
import User from "../../../models/userModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        User.findOne(
          {
            username: {
              $regex: new RegExp(
                `^${req.body.username.toLowerCase().trim()}$`,
                "i"
              ),
            },
          },
          (err, user) => {
            if (err) return res.json(err);
            if (!user) return res.json({ error: "User does not exist" });
            return res.json({ success: user });
          }
        ).select(
          "username first last artistName city country website twitter twitterVerified instagram about"
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

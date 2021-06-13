import auth from "../../src/server/services/authorization-service";
import dbConnect from "../../utils/dbConnect";
import User from "../../models/userModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
        const user = await User.findById(jwt.id);
        if (!user || !jwt) return res.json({ error: "Authentication error" });

        return await fetch(
          `https://api.twitter.com/2/tweets/search/recent?query=from%3A${req.body.twitter}&max_results=10`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${ENV.TWITTER_TOKEN}`,
            },
          }
        )
          .then((res) => res.json())
          .then((json) => {
            if (json && json.data) {
              let found = false;
              json.data.forEach((tweet) => {
                if (
                  tweet &&
                  tweet.text &&
                  tweet.text.indexOf("Verifying my @SevensGrant account") > -1
                )
                  found = true;
              });

              if (found) {
                user.twitterVerified = true;
                user.save();
                return res.json({ success: "Verified" });
              }

              return res.json({ error: "Issue verifying" });
            }

            return res.json({ error: "Issue verifying" });
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

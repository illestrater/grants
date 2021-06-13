import auth from "../../../src/server/services/authorization-service";
import dbConnect from "../../../utils/dbConnect";
import Program from "../../../models/programModel";
import User from "../../../models/userModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
        if (jwt.id) {
          const user = await User.findById(jwt.id);
          if (!user) return res.json({ error: "Authentication error" });
          const programs = await Program.find({ curators: jwt.id })
            .select(
              "organizer name url perpetual passByVotes topThreshold voteThreshold blindVoting mintToArtist hideResults curationLock finalized mintInProgress"
            )
            .populate("organizers");
          const sample = await Program.findById("60708c75525e3e035e8e2eb8")
            .select(
              "organizer name url perpetual passByVotes topThreshold voteThreshold blindVoting mintToArtist hideResults curationLock finalized mintInProgress"
            )
            .populate("organizers");
          if (jwt.id !== "6035e7415f0a684942f4e17c") programs.push(sample);

          return res.json({ success: programs });
        }
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

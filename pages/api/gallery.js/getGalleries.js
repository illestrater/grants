import dbConnect from "../../../utils/dbConnect";
import User from "../../../models/userModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const user = await User.findById(req.body.user);
        if (!user) return res.json({ error: "User does not exist" });

        const galleries = await Gallery.find({ user: req.body.user }).sort(
          "order"
        );

        galleries.forEach((gallery) => {
          const nfts = gallery.nfts;
          const sorted = _.sortBy(nfts, ["order"]);
          gallery.nfts = sorted;
        });

        return res.json({ success: galleries });
      } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: "fetch failed" });
      }

      break;

    default:
      res.status(400).json({ success: false, message: "route not matched" });
      break;
  }
}

import dbConnect from "../../../utils/dbConnect";
import Gallery from "../../../models/galleryModel";
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

        const gallery = await Gallery.findById(req.body.gallery);
        if (!gallery) return res.json({ error: "Could not find gallery" });
        if (!gallery.user.equals(jwt.id))
          return res.json({ error: "Authentication error" });

        gallery.name = req.body.name;
        gallery.description = req.body.description;
        gallery.save();
        return res.json({ success: "Gallery updated" });
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

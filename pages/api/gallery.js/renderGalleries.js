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

        const galleries = await Gallery.find({ user: jwt.id });

        if (!req.body.galleries || !req.body.galleries.length)
          return res.json({ error: "Issue reordering" });

        req.body.galleries.forEach((gallery) => {
          galleries.forEach((find) => {
            if (find.id === gallery.id) {
              find.order = gallery.order;
              find.save();
            }
          });
        });

        return res.json({ success: "Gallery order updated" });
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

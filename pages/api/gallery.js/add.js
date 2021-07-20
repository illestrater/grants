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

        const NFT = {
          id: req.body.id,
          order: gallery.nfts.length
            ? gallery.nfts[gallery.nfts.length - 1].order + 1
            : 0,
          creatorAddress: req.body.creatorAddress,
          creatorName: req.body.creatorName,
          description: req.body.description,
          name: req.body.name,
          external: req.body.external,
          opensea: req.body.opensea,
          image: req.body.image,
          imageType: req.body.imageType,
          poster: req.body.poster,
          traits: [],
        };

        if (req.body.traits && req.body.traits.length) {
          req.body.traits.forEach((trait) => {
            NFT.traits.push({
              displayType: trait.display_type,
              maxValue: trait.max_value,
              order: trait.order,
              traitCount: trait.traitCount,
              traitType: trait.trait_type,
              value: trait.value,
            });
          });
        }

        gallery.nfts.push(NFT);
        gallery.save();

        return res.json({ success: "NFT added" });
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

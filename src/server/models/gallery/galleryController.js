const _ = require("lodash");
const auth = require("../../services/authorization-service");
const User = require("mongoose").model("User");
const Gallery = require("mongoose").model("Gallery");

const ENV = process.env;

exports.getGalleries = async (req, res) => {
  const user = await User.findById(req.body.user);
  if (!user) return res.json({ error: "User does not exist" });

  const galleries = await Gallery.find({ user: req.body.user }).sort("order");

  galleries.forEach((gallery) => {
    const nfts = gallery.nfts;
    const sorted = _.sortBy(nfts, ["order"]);
    gallery.nfts = sorted;
  });

  return res.json({ success: galleries });
};

exports.create = async (req, res) => {
  const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
  const user = await User.findById(jwt.id);
  if (!user) return res.json({ error: "Authentication error" });

  const gallery = new Gallery({
    user: jwt.id,
    name: req.body.name,
    description: req.body.description,
    nfts: [],
  });

  gallery.save();
  return res.json({ success: gallery });
};

exports.delete = async (req, res) => {
  const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
  const user = await User.findById(jwt.id);
  if (!user) return res.json({ error: "Authentication error" });

  await Gallery.findOneAndRemove({ _id: req.body.gallery, user: jwt.id });
  return res.json({ success: "Gallery deleted" });
};

exports.edit = async (req, res) => {
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
};

exports.add = async (req, res) => {
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
};

exports.remove = async (req, res) => {
  const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
  const user = await User.findById(jwt.id);
  if (!user) return res.json({ error: "Authentication error" });

  const gallery = await Gallery.findById(req.body.gallery);
  if (!gallery) return res.json({ error: "Could not find gallery" });
  if (!gallery.user.equals(jwt.id))
    return res.json({ error: "Authentication error" });

  const index = gallery.nfts.findIndex((e) => e.id === req.body.id);
  if (index >= 0) {
    gallery.nfts.splice(index, 1);
    gallery.save();
  }

  return res.json({ success: "NFT removed" });
};

exports.reorderGalleries = async (req, res) => {
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
};

exports.reorderCollection = async (req, res) => {
  const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
  const user = await User.findById(jwt.id);
  if (!user) return res.json({ error: "Authentication error" });

  const gallery = await Gallery.findById(req.body.gallery);
  if (!gallery) return res.json({ error: "Could not find gallery" });
  if (!gallery.user.equals(jwt.id))
    return res.json({ error: "Authentication error" });

  if (!req.body.nfts || !req.body.nfts.length)
    return res.json({ error: "Issue reordering" });

  req.body.nfts.forEach((nft) => {
    gallery.nfts.forEach((find) => {
      if (find.id === nft.id) find.order = nft.order;
    });
  });

  gallery.save();

  return res.json({ success: "NFT order updated" });
};

import auth from "../../../src/server/services/authorization-service";
import dbConnect from "../../../utils/dbConnect";
import Organizer from "../../../models/organizerModel";
import crypto from "crypto";
import fs from "fs";

const spaces = s3.createClient({
  s3Options: {
    accessKeyId: ENV.SPACES_KEY,
    secretAccessKey: ENV.SPACES_SECRET,
    region: "US",
    endpoint: "nyc3.digitaloceanspaces.com",
  },
});

function doDashes(str) {
  var re = /[^a-z0-9]+/gi; // global and case insensitive matching of non-char/non-numeric
  var re2 = /^-*|-*$/g; // get rid of any leading/trailing dashes
  str = str.replace(re, "-"); // perform the 1st regexp
  return str.replace(re2, "").toLowerCase(); // ..aaand the second + return lowercased result
}

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
  const org = await Organizer.findOne({ _id: req.body._id, admins: jwt.id });
  if (!org) return res.json({ error: "Authentication error" });

  org.name = req.body.name;
  org.url = doDashes(req.body.name);
  if (req.body.logo) org.logo = req.body.logo;
  org.about = req.body.about;
  (org.email = req.body.email), (org.website = req.body.website);
  org.twitter = req.body.twitter;
  org.instagram = req.body.instagram;

  switch (method) {
    case "POST":
      try {
        await Object.keys(req.body).forEach(async (item) => {
          if (item === "logo") {
            let ext, image;
            ext = req.body[item].split(";")[0].match(/jpeg|jpg|png|gif/)[0];
            image = req.body[item].replace(/^data:image\/\w+;base64,/, "");
            image = image.replace(/^data:video\/mp4;base64,/, "");
            const buf = new Buffer.from(image, "base64");
            const name = crypto.randomBytes(20).toString("hex");

            org.logo = `${name}.${ext}`;

            await fs.writeFileSync(
              path.join(__dirname, `../../images/${org.logo}`),
              buf
            );
            const uploader = await spaces.uploadFile({
              localFile: path.join(__dirname, `../../images/${org.logo}`),
              s3Params: {
                Bucket: "grants",
                Key: `${org.logo}`,
                ACL: "public-read",
              },
            });

            uploader.on("end", () => {
              fs.unlink(
                path.join(__dirname, `../../images/${org.logo}`),
                (err2) => {
                  if (err2 !== null) {
                    console.log(err2);
                  }
                  return null;
                }
              );
            });
          }
        });

        org.save();
        return res.json({ success: "Program updated" });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

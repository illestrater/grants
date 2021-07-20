import auth from "../../../src/server/services/authorization-service";
import templates from "../../../src/server/emails/templates";
import dbConnect from "../../../utils/dbConnect";

import ProgramApplicant from "../../../models/programApplicantModel";
import Program from "../../../models/programModel";
import User from "../../../models/userModel";

import getMediaDimensions from "get-media-dimensions";
import gifResize from "@gumlet/gif-resize";
import { promisify } from "util";
import { Duplex } from "stream";
import ffmpeg from "ffmpeg";
import nodemailer from "nodemailer";
import hbjs from "handbrake-js";
import crypto from "crypto";
import jimp from "jimp";
import fs from "fs";

const ENV = process.env;

const transporter = nodemailer.createTransport({
  host: "email-smtp.us-east-1.amazonaws.com",
  port: 465,
  secure: true,
  auth: {
    user: ENV.SES_USER,
    pass: ENV.SES_PASS,
  },
});

const compressor = async (file, fileWeb) => {
  return new Promise((resolve) => {
    const input = path.join(__dirname, `../../images/${file}`);
    const output = path.join(__dirname, `../../images/${fileWeb}`);
    const write = fs.createWriteStream(output);

    const fileType = file.split(".")[1];
    if (fileType === "gif") {
      console.log("DOING FILE", file);
      const buf = fs.readFileSync(input);
      gifResize({
        width: 600,
        optimizationLevel: 3,
      })(buf).then(async (data) => {
        const stream = new Duplex();
        stream.push(data);
        stream.push(null);
        console.log("'WROTE GIF'");
        await stream.pipe(write);
        resolve();
      });
    } else if (fileType === "mp4") {
      getMediaDimensions(input, "video").then((dimensions) => {
        const width = 600;
        const height = Math.round(
          (width / dimensions.width) * dimensions.height
        );

        try {
          var process = new ffmpeg(input);
          process.then(
            function (video) {
              video
                .setVideoFormat("mp4")
                .setVideoSize(`${width}?`, true, true, "#fff")
                .save(output, function (error, file) {
                  if (!error) console.log("Video file: " + file);
                });
            },
            function (err) {
              console.log("Error: " + err);
            }
          );
        } catch (e) {
          console.log(e.code);
          console.log(e.msg);
        }
      });
    } else {
      console.log("ELSING");
      const read = promisify(fs.readFile);

      read(input)
        .then((result) => {
          return jimp.read(result);
        })
        .then((img) => {
          const r = img.resize(600, jimp.AUTO);
          const b = promisify(r.getBuffer.bind(r));
          return b(jimp.AUTO);
        })
        .then((buff) => {
          const stream = new Duplex();
          stream.push(buff);
          stream.push(null);
          return stream;
        })
        .then((stream) => {
          return stream.pipe(write);
        })
        .then((data) => {
          resolve();
        })
        .catch((err) => {
          console.log("error", err);
        });
    }
  });
};

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();
  const jwt = auth(req.headers.authorization, res, (jwt) => jwt);
  const user = await User.findById(jwt.id);
  if (!user || !jwt) return res.json({ error: "Authentication error" });
  if (
    !user.artistName ||
    !user.city ||
    !user.country ||
    !user.twitter ||
    !user.instagram ||
    !user.website ||
    !user.emailVerified ||
    !user.wallet
  )
    return res.json({ error: "User profile incomplete" });

  const program = await Program.findById(req.body.program);
  if (
    !req.body.program ||
    (!program.bypassStatement && !req.body.statement) ||
    !req.body.title ||
    !req.body.description ||
    !req.body.art
  )
    return res.json({ error: "Application incomplete" });
  if (!program) return res.json({ error: "Program does not exist" });
  if (program.isProtected && req.body.passcode !== program.passcode)
    return res.json({ error: "The secret phrase was incorrect" });
  if (new Date() < program.open || new Date() > program.close)
    return res.json({ error: "Submissions are closed" });

  const applied = await ProgramApplicant.findOne({
    user: jwt.id,
    program: req.body.program,
  });
  if (applied)
    return res.json({ error: "You have already submitted an application" });

  const applicant = {
    user: jwt.id,
    program: req.body.program,
    statement: req.body.statement,
    additional: req.body.additional,
    title: req.body.title,
    canvas: req.body.canvas,
    description: req.body.description,
  };

  await Object.keys(req.body).forEach(async (item) => {
    if (item === "art") {
      let ext, image;
      ext = req.body[item].split(";")[0].match(/jpeg|png|gif|webp|mp4/)[0];
      image = req.body[item].replace(/^data:image\/\w+;base64,/, "");
      image = image.replace(/^data:video\/mp4;base64,/, "");
      let buf = new Buffer.from(image, "base64");

      const name = crypto.randomBytes(20).toString("hex");

      applicant.art = `${name}.${ext}`;
      applicant.artWeb = `${name}-web.${ext}`;

      const saveImage = promisify(fs.writeFile);
      await saveImage(
        path.join(__dirname, `../../images/${applicant.art}`),
        buf
      );
      await compressor(applicant.art, applicant.artWeb);
      if (ext === "mp4") {
        await hbjs.run({
          input: path.join(__dirname, `../../images/${applicant.art}`),
          output: path.join(__dirname, `../../images/video-${applicant.art}`),
          preset: "Vimeo YouTube HQ 2160p60 4K",
        });
      }

      const uploader = await spaces.uploadFile({
        localFile: path.join(
          __dirname,
          `../../images/${
            ext === "mp4" ? `video-${applicant.art}` : applicant.art
          }`
        ),
        s3Params: {
          Bucket: "grants",
          Key: `${applicant.art}`,
          ACL: "public-read",
        },
      });

      console.log("uploading");
      const uploader2 = await spaces.uploadFile({
        localFile: path.join(__dirname, `../../images/${applicant.artWeb}`),
        s3Params: {
          Bucket: "grants",
          Key: `${applicant.artWeb}`,
          ACL: "public-read",
        },
      });

      uploader.on("end", () => {
        fs.unlink(
          path.join(__dirname, `../../images/${applicant.art}`),
          (err2) => {
            if (err2 !== null) {
              console.log(err2);
            }
            return null;
          }
        );

        if (ext === "mp4") {
          fs.unlink(
            path.join(__dirname, `../../images/video-${applicant.art}`),
            (err2) => {
              if (err2 !== null) {
                console.log(err2);
              }
              return null;
            }
          );
        }
      });

      uploader2.on("end", () => {
        fs.unlink(
          path.join(__dirname, `../../images/${applicant.artWeb}`),
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

  const newApplicant = new ProgramApplicant(applicant);
  newApplicant.save((err, data) => {
    if (err) return res.status(500).json(err);
    else {
      transporter.sendMail(
        templates.applicationConfirmation(user.email, program.name)
      );
      return res.json(true);
    }
  });
}

const ENV = process.env;
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const s3 = require('s3');
const auth = require('../../services/authorization-service');
const nodemailer = require('nodemailer');
const templates = require('../../emails/templates');

const Applicant = require('mongoose').model('Applicant');
const User = require('mongoose').model('User');

const spaces = s3.createClient({
  s3Options: {
    accessKeyId: ENV.SPACES_KEY,
    secretAccessKey: ENV.SPACES_SECRET,
    region: 'US',
    endpoint: 'nyc3.digitaloceanspaces.com'
  }
});


const transporter = nodemailer.createTransport({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 465,
  secure: true,
  auth: {
    user: ENV.SES_USER,
    pass: ENV.SES_PASS
  }
});

exports.submitApplication = async (req, res) => {
  return res.json(true);
  const applicant = {
    name:        req.body.name,
    email:       req.body.email,
    country:     req.body.country,
    countryCode: req.body.countryCode,
    city:        req.body.city,
    website:     req.body.website,
    twitter:     req.body.twitter,
    instagram:   req.body.instagram,
    statement:   req.body.statement,
    additional:  req.body.additional,
  };

  await Object.keys(req.body).forEach(async (item) => {
    if (item === 'art' || item === 'thumbnail') {
      let ext, image;
      if (item === 'art') ext = req.body[item].split(';')[0].match(/jpeg|png|gif|webp|mp4/)[0];
      if (item === 'thumbnail') ext = req.body[item].split(';')[0].match(/jpeg|png|gif|webp/)[0];
      image = req.body[item].replace(/^data:image\/\w+;base64,/, '');
      image = image.replace(/^data:video\/mp4;base64,/, '');
      const buf = new Buffer.from(image, 'base64');
      const name = crypto.randomBytes(20).toString('hex');

      if (item === 'art') applicant.art = `${ name }.${ ext }`
      else if (item === 'thumbnail') applicant.thumbnail = `${ name }.${ ext }`

      await fs.writeFileSync(path.join(__dirname, `../../images/${ name }.${ ext }`), buf);
      const uploader = await spaces.uploadFile({
        localFile: path.join(__dirname, `../../images/${ name }.${ ext }`),
        s3Params: {
          Bucket: 'grants',
          Key: `${ name }.${ ext }`,
          ACL: 'public-read'
        }
      });

      uploader.on('end', () => {
        fs.unlink(path.join(__dirname, `../../images/${ name }.${ ext }`), (err2) => {
          if (err2 !== null) {
            console.log(err2);
          }
          return null;
        });
      });
    }
  });

  const newApplicant = new Applicant(applicant);
  newApplicant.save((err, data) => {
    if (err) return res.status(500).json(err);
    else {
      transporter.sendMail(templates.applicationConfirmation(applicant.email));
      return res.json(true);
    }
  });
};

// exports.updateApplication = async (req, res) => {
//   auth(req.headers.authorization, res, (jwt) => {
//     User.findById(jwt.id, (err, user) => {
//       if (!user) return res.status(401).json({ err: 'Authentication error' });
//       return Applicant.findOne({ user: user._id }, async (err, applicant) => {
//         user.artistName = req.body.name;
//         user.birthYear = req.body.birthYear;

//         await Object.keys(req.body).forEach(async (item) => {
//           if (item === 'newArt' || item === 'newThumbnail') {
//             let ext, image;
//             if (item === 'newArt') ext = req.body[item].split(';')[0].match(/jpeg|png|gif|webp|mp4/)[0];
//             if (item === 'newThumbnail') ext = req.body[item].split(';')[0].match(/jpeg|png|gif|webp/)[0];
//             image = req.body[item].replace(/^data:image\/\w+;base64,/, '');
//             image = image.replace(/^data:video\/mp4;base64,/, '');
//             const buf = new Buffer.from(image, 'base64');
//             const name = crypto.randomBytes(20).toString('hex');
      
//             if (item === 'newArt') applicant.newArt = `${ name }.${ ext }`
//             else if (item === 'newThumbnail') applicant.newThumbnail = `${ name }.${ ext }`
      
//             await fs.writeFileSync(path.join(__dirname, `../../images/${ name }.${ ext }`), buf);
//             const uploader = await spaces.uploadFile({
//               localFile: path.join(__dirname, `../../images/${ name }.${ ext }`),
//               s3Params: {
//                 Bucket: 'grants',
//                 Key: `${ name }.${ ext }`,
//                 ACL: 'public-read'
//               }
//             });
      
//             uploader.on('end', () => {
//               fs.unlink(path.join(__dirname, `../../images/${ name }.${ ext }`), (err2) => {
//                 if (err2 !== null) {
//                   console.log(err2);
//                 }
//                 return null;
//               });
//             });
//           }
//         });

//         applicant.minted = req.body.minted;
//         applicant.description = req.body.description;
//         applicant.name = req.body.name;
//         applicant.save();

//         user.save();
//         return res.json('Application updated');
//       })
//     });
//   });
// };

exports.updateApplication = async (req, res) => {
  auth(req.headers.authorization, res, (jwt) => {
    User.findById(jwt.id, (err, user) => {
      if (!user) return res.status(401).json({ err: 'Authentication error' });
      return Applicant.findOne({ user: user._id }, (err, applicant) => {
        applicant.minted = req.body.minted;
        applicant.description = req.body.description;
        applicant.name = req.body.name;
        applicant.title = req.body.title;
        applicant.save();
        user.artistName = req.body.name;
        user.birthYear = req.body.birthYear;
        user.save();
        return res.json('Application updated');
      })
    });
  });
};

exports.acceptGenesis = async (req, res) => {
  auth(req.headers.authorization, res, (jwt) => {
    User.findById(jwt.id, (err, user) => {
      if (!user) return res.status(401).json({ err: 'Authentication error' });
      return Applicant.findOne({ user: user._id }, (err, applicant) => {
        applicant.description = req.body.description;
        applicant.title = req.body.title;
        applicant.userAccepted = true;
        applicant.save();
        return res.json('Application accepted');
      })
    });
  });
};

exports.viewAllApplications = (req, res) => {
  auth(req.headers.authorization, res, (jwt) => {
    User.findById(jwt.id, (err, user) => {
      if (err) return res.json(err);
      if (!user || !user.committee) return res.status(401).json({ err: 'Authentication error' });
      else {
        return Applicant.find({ removed: { $ne: true } }, (err, data) => {
          const unapproved = [], approved = [], rejected = [];
          data.forEach(e => {
            if (e.approved.find(g => g._id.equals(jwt.id))) approved.push(e);
            else if (e.rejected.find(g => g._id.equals(jwt.id))) rejected.push(e);
            else unapproved.push(e);
          })

          return err ?
              res.status(500).json(err) :
              res.json({ unapproved, approved, rejected });
        })
      }
    }).sort('-created_at');
  });
};

exports.viewTopApplications = (req, res) => {
  auth(req.headers.authorization, res, (jwt) => {
    User.findById(jwt.id, (err, user) => {
      if (err) return res.json(err);
      if (!user || !user.committee) return res.status(401).json({ err: 'Authentication error' });
      else {
        return Applicant.find({ ineligible: { $ne: true }, userAccepted: true, accepted: true, minted: { $ne: true } }, (err, data) => {
          return err ?
              res.status(500).json(err) :
              res.json(data);
        }).sort('-approvalCount')
      }
    });
  });
};

exports.approveApplicant = (req, res) => {
  auth(req.headers.authorization, res, (jwt) => {
    User.findById(jwt.id, (err, user) => {
      if (err) return res.json(err);
      if (!user || !user.committee) return res.status(401).json({ err: 'Authentication error' }); 
      else {
        return Applicant.findById(req.body.id, (err2, data) => {
          if (err2) return res.status(500).json(err);
          else {
            const approvedIndex = data.approved.findIndex(e => e.equals(jwt.id));
            if (req.body.type === 'approve') {
              if (approvedIndex < 0) {
                data.approved.push(jwt.id);
                data.approvalCount++;
                data.save();
              }
            } else if (req.body.type === 'unapprove') {
              if (approvedIndex >= 0) {
                data.approved.splice(approvedIndex, 1);
                data.approvalCount--;
                data.save();
              }
            }

            return res.json(true);
          }
        })
      }
    });
  });
};

exports.rejectApplicant = (req, res) => {
  auth(req.headers.authorization, res, (jwt) => {
    User.findById(jwt.id, (err, user) => {
      if (err) return res.json(err);
      if (!user || !user.committee) return res.status(401).json({ err: 'Authentication error' }); 
      else {
        return Applicant.findById(req.body.id, (err2, data) => {
          if (err2) return res.status(500).json(err);
          else {
            const rejected = data.rejected.findIndex(e => e.equals(jwt.id));
            if (req.body.type === 'reject') {
              if (rejected < 0) {
                data.rejected.push(jwt.id);
                data.rejectCount++;
                data.save();
              }
            } else if (req.body.type === 'unreject') {
              if (rejected >= 0) {
                data.rejected.splice(rejected, 1);
                data.rejectCount--;
                data.save();
              }
            }

            return res.json(true);
          }
        })
      }
    });
  });
};


exports.flagApplicant = (req, res) => {
  auth(req.headers.authorization, res, (jwt) => {
    User.findById(jwt.id, (err, user) => {
      if (err) return res.json(err);
      if (!user || !user.committee) return res.status(401).json({ err: 'Authentication error' }); 
      else {
        return Applicant.findById(req.body.id, (err2, data) => {
          if (err2) return res.status(500).json(err);
          else if (data) {
            data.flagged.push({
              user: jwt.id,
              message: req.body.message,
              type: req.body.type
            });

            data.save();
          }

          return res.json(true);
        })
      }
    });
  });
};


exports.removeFlag = (req, res) => {
  auth(req.headers.authorization, res, (jwt) => {
    User.findById(jwt.id, (err, user) => {
      if (err) return res.json(err);
      if (!user || !user.committee) return res.status(401).json({ err: 'Authentication error' }); 
      else {
        return Applicant.findById(req.body.id, (err2, data) => {
          if (err2) return res.status(500).json(err);
          else {
            const flaggedIndex = data.flagged.findIndex(e => e.equals(req.body.flagId));
            data.flagged.splice(flaggedIndex, 1);

            data.save();
          }

          return res.json(true);
        })
      }
    });
  });
};


// setTimeout(() => {
//   return Applicant.find({ ineligible: { $ne: true }, userAccepted: { $ne: true }, accepted: true, minted: { $ne: true } }, (err2, data) => {
//     if (err2) return res.status(500).json(err);
//     let count = 0;
//     data.forEach(e => {
//       count++;
//       if (e.user) { 
//         console.log(e.title, e.email, e.user.wallet);
//       }
//     })

//     console.log('COUNT', count);
//   }).populate('user');
// })

// setTimeout(() => {
//   return Applicant.find({ walletScreened: { $ne: true }, title: { $exists: true }, accepted: true, userAccepted: true, ineligible: { $ne: true } }, (err2, data) => {
//     if (err2) return res.status(500).json(err);
//     let count = 0;
//     data.forEach(e => {
//       count++;
//       // e.walletScreened = true;
//       // e.save();
//       // if (e.user) { 
//         console.log(e.user.wallet);
//       // }
//     })

//     console.log('COUNT', count);
//   }).populate('user');
// })

// setTimeout(() => {
//   return Applicant.find({ order: { $exists: true }, published: { $ne: true } }, (err2, data) => {
//     if (err2) return res.status(500).json(err);
//     let count = 1;
//     data.forEach(e => {
//       if (e.user && e.user.wallet) {
//         console.log(e.instagram);
//         // e.order = count;
//         // e.save();
//         count++;
//       }
//     })

//     console.log('COUNTA', count);
//   }).sort('order')
//     .populate('user');
// })

// setTimeout(() => {
//   return User.find({}, (err2, data) => {
//     if (err2) return res.status(500).json(err);
//     data.forEach(e => {
//       if (e.instagram) {
//         let fixedTwitter = e.instagram.toLowerCase();
//         fixedTwitter = fixedTwitter.replace(`www.instagram.com`, '');
//         fixedTwitter = fixedTwitter.replace(`instagram.com`, '');
//         fixedTwitter = fixedTwitter.replace(`https://instagram.com/`, '');
//         fixedTwitter = fixedTwitter.replace(`https://`, '');
//         fixedTwitter = fixedTwitter.replace(`http://`, '');
//         fixedTwitter = fixedTwitter.replace(`/`, '');
//         fixedTwitter = fixedTwitter.replace(`/`, '');
//         fixedTwitter = fixedTwitter.replace(`/`, '');
//         fixedTwitter = fixedTwitter.replace('@', '');
//         fixedTwitter = fixedTwitter.replace('\@', '');
//         fixedTwitter = fixedTwitter.replace(' ', '.');
//         if (fixedTwitter === 'na') fixedTwitter = '';
//         if (fixedTwitter === 'none') fixedTwitter = '';
//         if (fixedTwitter === 'n.a.') fixedTwitter = '';
//         if (fixedTwitter === '-') fixedTwitter = '';
//         if (fixedTwitter === '*') fixedTwitter = '';
//         // if (fixedTwitter === '.') fixedTwitter = '';
//         console.log(e.instagram);
//         // console.log(`${ e.instagram }                      `, e.email);
//         e.instagram = fixedTwitter;
//         e.save();
//       }
//     })
//   });
// })


// TO DO:
// Fix instagram spaces to auto populate with period (parsing error)

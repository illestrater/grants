import dbConnect from "../../../utils/dbConnect";
import Program from "../../../models/programModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        Program.find({ active: true }, (err, data) => {
          return err ? res.status(500).json(err) : res.json(data);
        })
          .select(
            "organizers name url exhibiting tagline description total open close closeApplication"
          )
          .populate("organizers")
          .sort("order");
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

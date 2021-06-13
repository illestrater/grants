import dbConnect from "../../../utils/dbConnect";
import Program from "../../../models/programModel";
import ProgramApplicant from "../../../models/programApplicantModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "GET":
      const programs = await Program.find({ exhibiting: true })
        .populate("organizers")
        .populate(
          "curators",
          "artistName first last instagram twitter website"
        );

      const galleries = programs.map(async (program) => {
        const gallery = await ProgramApplicant.find(
          { program: program._id, published: true },
          (err, gallery) => {
            return err
              ? res.status(500).json(err)
              : gallery.forEach((e) => (e.tokenId = e.order));
          }
        )
          .select(
            "-approved -rejected -program -statement -additional -ineligible -flagged -approvalCount -rejectCount -emailed -accepted"
          )
          .populate(
            "user",
            "artistName birthYear country city website twitter instagram"
          )
          .sort("order");

        return { program, gallery };
      });

      const merged = await Promise.all(galleries);
      res.json(merged);
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

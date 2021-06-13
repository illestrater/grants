import dbConnect from "../../../utils/dbConnect";
import ProgramApplicant from "../../../models/programApplicantModel";
import Program from "../../../models/programModel";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "POST":
      const program = await Program.findOne({ url: req.body.program })
        .populate("organizers")
        .populate(
          "curators",
          "artistName first last instagram twitter website"
        );

      return ProgramApplicant.find(
        { program: program._id, published: true },
        (err, gallery) => {
          gallery.forEach((e) => {
            e.tokenId = e.order;
          });
          return err
            ? res.status(500).json(err)
            : res.json({
                gallery,
                contract: program.contractAddress,
                curators: program.curators,
                name: program.name,
                description: program.description,
                organizer: program.organizers[0].name,
                organizerUrl: program.organizers[0].url,
              });
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

    default:
      res.status(400).json({ success: false });
      break;
  }
}

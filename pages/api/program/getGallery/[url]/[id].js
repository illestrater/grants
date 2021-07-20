import dbConnect from "../../../../../utils/dbConnect";
import ProgramApplicant from "../../../../../models/programApplicantModel";
import Program from "../../../../../models/programModel";
import probe from "probe-image-size";
import set from "lodash/set";

export default async function handler(req, res) {
  const { url = "gallery", id = "148" } = req.query;
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "GET":
      const program = await Program.findOne({ url })
        .populate("organizers")
        .populate(
          "curators",
          "artistName first last instagram twitter website"
        );

      const gallery = await ProgramApplicant.findOne({
        program: program._id,
        published: true,
        order: id,
      })
        .select(
          "-approved -rejected -program -statement -additional -ineligible -flagged -approvalCount -rejectCount -emailed -accepted"
        )
        .populate(
          "user",
          "artistName birthYear country city website twitter instagram"
        )
        .sort("order");

      set(gallery, "tokenId", gallery.order);

      let imageMetadata;

      try {
        const imageUrl = `https://cdn.grants.art/${gallery.art}`;
        imageMetadata = await probe(imageUrl);
      } catch (error) {
        imageMetadata = { width: 800, height: 800 };
      }

      const data = {
        id,
        url,
        gallery,
        imageMetadata,
        contract: program.contractAddress,
        curators: program.curators,
        name: program.name,
        description: program.description,
        organizer: program.organizers[0].name,
        organizerUrl: program.organizers[0].url,
      };

      res.status(200);
      res.json(data);
      return;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

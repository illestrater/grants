const program = require("./programController");

module.exports = (app) => {
  app.get("/api/program/getPrograms", program.getPrograms);
  app.post("/api/program/getProgram", program.getProgram);
  app.post("/api/program/getMyOrgs", program.getMyOrgs);
  app.post("/api/program/getOrg", program.getOrg);
  app.post("/api/program/updateOrg", program.updateOrg);
  app.post("/api/program/createProgram", program.createProgram);
  app.post("/api/program/updateProgram", program.updateProgram);
  app.post(
    "/api/program/updateCurationCriteria",
    program.updateCurationCriteria
  );
  app.post("/api/program/getProgramAdmin", program.getProgramAdmin);
  app.post("/api/program/mintToArtist", program.mintToArtist);
  app.post("/api/program/curationLock", program.curationLock);
  app.post("/api/program/hideResults", program.hideResults);
  app.post("/api/program/addRemoveCurator", program.addRemoveCurator);
  app.post("/api/program/reorderCurators", program.reorderCurators);
  app.post("/api/program/submitApplication", program.submitApplication);
  app.post("/api/program/updateApplication", program.updateApplication);
  app.post("/api/program/getGallery", program.getGallery);
  app.post("/api/program/getCurationPrograms", program.getCurationPrograms);
  app.post("/api/program/viewAllApplications", program.viewAllApplications);
  app.post("/api/program/viewResults", program.viewResults);
  app.post("/api/program/approveOrReject", program.approveOrReject);
  app.post("/api/program/viewAllScoring", program.viewAllScoring);
  app.post("/api/program/submitScore", program.submitScore);
  app.post("/api/program/undoScoredApplicant", program.undoScoredApplicant);
  app.post("/api/program/viewScoredResults", program.viewScoredResults);
  app.post("/api/program/undoApplicant", program.undoApplicant);
  app.post("/api/program/finalizeApproved", program.finalizeApproved);
  app.post("/api/program/finalizeDeferred", program.finalizeDeferred);
  app.post("/api/program/getEmails", program.getEmails);
  app.post("/api/program/getWallets", program.getWallets);
  app.post("/api/program/consolationArt", program.consolationArt);
  app.post("/api/program/flagApplicant", program.flagApplicant);
  app.post("/api/program/removeFlag", program.removeFlag);
};

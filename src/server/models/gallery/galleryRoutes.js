const gallery = require("./galleryController");

module.exports = (app) => {
  app.post("/api/gallery/delete", gallery.delete);
  app.post("/api/gallery/edit", gallery.edit);
  app.post("/api/gallery/add", gallery.add);
  app.post("/api/gallery/remove", gallery.remove);
  app.post("/api/gallery/reorderCollection", gallery.reorderCollection);
  app.post("/api/gallery/reorderGalleries", gallery.reorderGalleries);
};

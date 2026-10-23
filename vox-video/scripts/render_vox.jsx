// Renders the render queue of the open project (the landscape or the Reel cut, whichever was built last).
// File > Scripts > Run Script File...
(function () {
  if (!app.project || !app.project.file) {
    var f = File.openDialog("Pick the Vox collage project (.aep)");
    if (!f) return;
    app.open(f);
  }
  app.project.renderQueue.render();
})();

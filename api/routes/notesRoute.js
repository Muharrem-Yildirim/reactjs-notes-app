const router = require("express").Router(),
  { loginRequired } = require("../controllers/authController"),
  notesController = require("../controllers/notesController");

router.get("/", loginRequired, notesController.getAll);
router.post("/", loginRequired, notesController.insert);
router.get("/:id", loginRequired, notesController.getById);
router.patch("/:id", loginRequired, notesController.patchById);
router.delete("/:id", loginRequired, notesController.deleteById);

module.exports = router;

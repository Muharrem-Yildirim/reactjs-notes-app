const Note = require("../models/noteModel"),
  mongoose = require("mongoose");

const getAll = async (req, res) => {
  const notes = await Note.find().populate("author", "username");
  return res.json(notes);
};

const insert = async (req, res) => {
  try {
    const note = new Note({
      author: mongoose.Types.ObjectId(req.user._id),
      title: req.body.title,
      content: req.body.content,
      color: req.body.color,
      date: req.body.date,
    });

    await note.save();
    res.json(note);
  } catch {
    res.status(404).json({ error: 404, message: "Note doesn't exist." });
  }
};

const getById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id });
    if (note != null) res.json(note);
    else {
      res.status(404).json({ error: 404, message: "Note doesn't exist." });
    }
  } catch {
    res.status(404).json({ error: 404, message: "Note doesn't exist." });
  }
};

const patchById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id });

    if (req.user._id != note.author)
      return res
        .status(403)
        .json({ error: 403, message: "You don't have permission to do that." });

    if (req.body.title != null) note.title = req.body.title;
    if (req.body.content != null) note.content = req.body.content;
    if (req.body.date != null) note.date = req.body.date;
    if (req.body.color != null) note.color = req.body.color;

    await note.save();
    res.json(note);
  } catch {
    res.status(404).json({ error: 404, message: "Note doesn't exist." });
  }
};

const deleteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id });

    if (req.user._id != note.author)
      return res
        .status(403)
        .json({ error: 403, message: "You don't have permission to do that." });

    note.delete();
    res.status(204).json();
  } catch {
    res.status(404).json({ error: 404, message: "Note doesn't exist." });
  }
};

module.exports = {
  getAll,
  insert,
  getById,
  patchById,
  deleteById,
};

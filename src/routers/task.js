const express = require("express");
const Task = require("../models/task");
const router = new express.Router();
const auth = require("../middleware/auth");
const User = require("../models/user");

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send();
  }
});

//this router send back an array of task so we want to focus on it for filtering and other options

// GET/tasks?completed=false (find completed, incompleted or all tasks)
// GET/task?limit=10&skip=0  (implementing pagination)
// GET/task?sortBy=createdAt:desc or :asc// we automate it you can sort by any field
router.get("/tasks", auth, async (req, res) => {
  //const owner = req.user._id;
  //console.log(req.query.completed);
  const match = {}; //shorthand with that option
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true" ? true : false;
  }
  //console.log(req.query.completed);
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  //console.log(req.query.sortBy);
  try {
    const user = await User.findOne({ owner: req.user._id }).populate({
      path: "tasks",
      match,
      options: {
        //pagination
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
        //createdAt: -1, //ascending 1 descending -1
      },
    });
    //console.log(user.tasks);
    res.send(user.tasks);
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const owner = req.user._id;
  try {
    const task = await Task.findOne({ _id, owner });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const owner = req.user._id;
  //validation and restriction
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation)
    return res.status(400).send({ Error: "Invalid update" });

  try {
    const task = await Task.findOne({ _id, owner });

    if (!task) return res.status(404).send();

    updates.forEach((update) => (task[update] = req.body[update]));

    await task.save();
    res.status(202).send(task);
  } catch (error) {
    res.status(400).send();
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const owner = req.user._id; //from auth
  try {
    const task = await Task.findOneAndDelete({ _id, owner });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;

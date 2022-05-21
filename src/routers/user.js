const express = require("express");
const User = require("../models/user");
const multer = require("multer");
const sharp = require("sharp");
const auth = require("../middleware/auth");
//const { sendWelcomeEmail, sendGoodByeEmail } = require("../emails/account");
const router = new express.Router();

//Creating a user (sign up)
router.post("/users", async (req, res) => {
  //console.log(req.body);
  const user = new User(req.body);
  try {
    await user.save();
    //sendWelcomeEmail(user);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token }); //201 successful created
  } catch (error) {
    res.status(400).send(error); //400 Bad request
  }
});

//Finding user by its credentials (sign in)
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

//logOut user on one session
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//logOut user on all sessions or other devices
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//Getting one profile
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user); // req.user from auth(auth.js)
});
//Getting one specific user
// router.get("/users/:id", async (req, res) => {
//   const _id = req.params.id;
//   try {
//     const user = await User.findById({ _id }); //{_id:_id}
//     if (!user) return res.status(404).send(); //Not Found
//     res.send(user);
//   } catch (error) {
//     res.status(500).send();
//   }
// });

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation)
    return res.status(400).send({ Error: "Invalid update" });

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.status(202).send(req.user);
  } catch (error) {
    res.status(400).send();
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    //sendGoodByeEmail(req.user);
    res.send(req.user);
  } catch (error) {
    res.status(500).send();
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000, //1Mb
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("File must be a jpg, jpeg or png image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    //if (!req.file.buffer) return res.send("No file");
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
    //next();
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  if (!req.user.avatar) return res.status(404).send();
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user?.avatar) throw new Error();

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;

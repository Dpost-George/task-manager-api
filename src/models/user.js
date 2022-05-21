const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task"); //for deleting all task in case user delete account

//New way to define schema and create model for user
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, //remove space before and after but not inbetween
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(_email) {
        if (!validator.isEmail(_email)) {
          throw new Error("Invalid Email!");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(pass) {
        const passT = pass.trim();
        if (validator.contains(passT, "password", { ignoreCase: true })) {
          throw new Error("Please password cannot not contain <password>");
        }
        if (passT.length < 6) {
          throw new Error("Password length must be grater than 6 letters");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number");
        }
      },
    },
    avatar: {
      type: Buffer,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

//Middleware ----------------

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

//Selecting data that should be send back(data privacy-protection)
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
};

//Accessible on instance -> instance method
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  //adding to te array of tokens so we can save it to doc
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

//Accessible on the model-> model method
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("Unable to login)");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error("Unable to login");

  return user;
};

//Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//Delete user tasks when user is remove
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

//----------------------------
const User = mongoose.model("User", userSchema);

module.exports = User;

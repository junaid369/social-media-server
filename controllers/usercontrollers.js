const { USER_COLLECTION, OTP_COLLECTION } = require("../config/collection");
const { sendEmailOtp } = require("../controllers/emailControllers");
const db = require("../config/connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const moment = require("moment");
const objectId = require("mongodb").ObjectID;
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
const { uploadFile } = require("./awsS3Controllers");
const fs = require("fs");
module.exports = {
  test: (req, res) => {
    res.json({ message: "test request" });
  },

  Signup: async (req, res) => {
    console.log("1");
    console.log(req.body);
    const { firstname, lastname, email, password } = req.body;
    const date = moment().format();

    try {
      console.log("7868");
      if (email !== undefined) {
        console.log(email);
        let emailExist = await db
          .get()
          .collection(USER_COLLECTION)
          .findOne({ email: email });
        if (emailExist && emailExist.emailVerified == true) {
          return res.status(400).json({ message: "Email already exist" });
        }

        const hashpassword = await bcrypt.hash(password, 10);
        console.log(hashpassword);

       
        // if (!checkpassword) {
        //   return res.status(400).json({ message: "Password does,t match" });
        // }

        if (emailExist !== null && emailExist.emailVerified === false) {
          console.log("3454jbb");
          await db
            .get()
            .collection(USER_COLLECTION)
            .updateOne(
              { _id: emailExist._id },
              { $set: { password: hashpassword, username } }
            );
        } else {
          console.log("3454");
          await db.get().collection(USER_COLLECTION).insertOne({
            firstname,
            lastname,
            email,
            password: hashpassword,
            date,
            emailVerified: false,
            isActive: true,
            followings: [],
            followers: [],
          });
        }

        const value = Math.floor(Math.random() * Math.pow(10, 4));

        let unix = new moment().valueOf();
        console.log(value);

        await db.get().collection(OTP_COLLECTION).deleteMany({ email: email });

        await db
          .get()
          .collection(OTP_COLLECTION)
          .createIndex({ createdAt: unix }, { expireAfterSeconds: 300 });

        await db
          .get()
          .collection(OTP_COLLECTION) .insertOne({ value, email, createdAt: new Date() });
        console.log("4jun");

        let status = sendEmailOtp(email, value);

        res.status(200).json({ message: "Email Otp send", status });
      }
    } catch (err) {
      console.log("fdfd");

      res.status(500).json({ err: err.message });
    }
  },

  varifyEmailOtp: async (req, res) => {
    console.log("heaer");
    const { email, otp } = req.body;

    try {
      const value = await db.get().collection(OTP_COLLECTION).findOne({ email: email });

      if (value === null)
        return res.status(400).json({ message: "invalid otp or otp expired " });

      if (value.value != otp)
        return res.status(400).json({ message: " invalid OTP " });

      db.get().collection(OTP_COLLECTION).deleteOne({ _id: value._id }).then(() => {
          db.get() .collection(USER_COLLECTION).updateOne({ email: email }, { $set: { emailVerified: true } }).then(async () => {
              let user = await db.get().collection(USER_COLLECTION) .findOne({ email: email });

              let token = jwt.sign({ id: user._id, isUser: true }, "secret", {expiresIn: "1h",  });

              res.status(200).json({ user, token });
            })
            .catch((err) => {
              console.log(">>>>>>>>8");

              res.status(500).json({ err: err.message });
            });

          console.log(">>>>>>>>9");
        })
        .catch((err) => {
          console.log(">>>>>>>>10");

          res.status(500).json({ err: err.message });
        });
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  },

  Login: async (req, res) => {
    console.log("login");

    const { email, password } = req.body;
    console.log(req.body);

    try {
      let user;

      user = await db
        .get()
        .collection(USER_COLLECTION)
        .findOne({ email: email });
      if (user) {
        if (!user.isActive) {
          return res.status(400).json({ message: "This Account was Blocked" });
        }

        let isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (isPasswordCorrect) {
          let token = await jwt.sign(
            { username: user.username, id: user._id, isUser: true },
            "secret",
            { expiresIn: "1h" }
          );

          return res.status(200).json({ user, token });
        } else {
          return res.status(400).json({ message: "invalid Password" });
        }
      } else {
        res.status(401).json({ message: "Email not Exist" });
      }
    } catch (err) {
      console.log(err);

      res.status(500).json({ err: err.message });
    }
  },
  thirdPartyLogin: async (req, res) => {
    console.log("third party login");
    const { email } = req.body;

    const user = await db.get().collection(USER_COLLECTION).findOne({ email });

    if (user) {
      let token = await jwt.sign(
        { username: user.username, id: user._id, isUser: true },
        "secret",
        { expiresIn: "1h" }
      );

      return res.status(200).json({ user, token });
    }

    if (user) {
      if (!user.isActive)
        return res.status(401).json({ message: "This Account was Blocked" });
    } else {
      return res.status(401).json({ message: "user Can't Exist" });
    }
  },

  getuserdetails: async (req, res) => {
    try {
      console.log(req.params.id);

      let id = req.params.id;

      const user = await db
        .get()
        .collection(USER_COLLECTION)
        .findOne({ _id: ObjectId(id) });
      console.log(user);

      res.status(200).json({ user });
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  },
  updateProfile: async (req, res) => {
    const { currentuserId, id } = req.body;
    console.log(id);

    try {
      let file = req.file;
      const result = await uploadFile(file);

      //   db.get().collection(USER_COLLECTION).insertOne({
      //     profile:result.Location

      //   }).then(async(data)=>{
      //     const profile=await db.get().collection(USER_COLLECTION).findOne({"_id":data.insertedId})
      //     console.log(profile);
      //     res.status(200).json({ message: "post added", profile })
      //   }).catch((err)=>{
      //     res.status(403).json({ message: err })
      //   })

      db.get()
        .collection(USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          { $set: { profile: result.Location } }
        );
      res.status(200).json({ message: "post added" });
    } catch (err) {
      console.log(err, "your err");
      res.status(500).json({ err: err.message });
    }
  },
};

const express = require("express");
const router = express.Router();
const {
  Signup,
  Login,
  varifyEmailOtp,
  thirdPartyLogin,
  getuserdetails,
  updateProfile,
} = require("../controllers/usercontrollers");
const { addPost, getAllPost } = require("../controllers/postControllers");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { uploadFile } = require("../controllers/awsS3Controllers");

module.exports = {
  upload: multer({ dest: "uploads/" }),
};

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/verifyEmailOtp", varifyEmailOtp);
router.post("/thirdPartyLogin", thirdPartyLogin);

router.post("/createpost", upload.single("post"), addPost);
router.get("/getallpost", getAllPost);
router.get("/getuserdetails/:id", getuserdetails);
router.post("/profile",upload.single('profile'),updateProfile)



module.exports = router;

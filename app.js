/** This is the main application page */

/** Required Modules */
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const uuid = require("uuid");
const app = express();
const csrf = require("csurf");
const csrfProtection = csrf();
const port = process.env.PORT || 8000;
const aws = require("aws-sdk");
const keys = require("./config/s3");

/** Gets S3 File */
const s3GetFile = require("./util/getS3File");

const s3 = new aws.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey
});

/** Required middleware */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 30 }
  })
);

/** Passport and Session Middleware */
app.use(passport.initialize());
app.use(passport.session());
app.use(require("connect-flash")());
app.use(csrfProtection);

/** Required Global Variables */
app.use(function(req, res, next) {
  res.locals.errors = null;
  res.locals.msg = null;
  res.locals.messages = require("express-messages")(req, res);
  res.locals.admin = req.user || null;
  if (req.user && req.user.profile_photo != "dummy.jpeg")
    res.locals.adminImageUrl = s3GetFile(
      req,
      "/admins/",
      req.user.profile_photo
    );
  else res.locals.adminImageUrl = "/images/dummy.jpg";
  res.locals.fileError = null;
  res.locals.csrfToken = req.csrfToken();
  next();
});

/** EJS view engine */
app.set("view engine", "ejs");

/** Home Route */
app.get("/", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      res.redirect("/dashboard");
    } else {
      res.render("home");
    }
  } catch (error) {
    console.log(error);
  }
});

/** AWS S3 */
app.get("/aws", async (req, res) => {
  try {
    const key = `${Date.now()}/${uuid()}.jpeg`;
    const params = {
      Bucket: "hr-app-test",
      ContentType: "jpeg",
      Key: key,
      Expires: 60
      // ResponseContentType: 'image/png'
    };

    s3.getSignedUrl("putObject", params, (err, url) => {
      if (err) {
        console.log(err);
      }
      res.send({ key, url });
    });
  } catch (error) {
    console.log(error);
  }
});
/** Required Controllers */
const register = require("./controllers/registerController");
const dashboard = require("./routes/dashboard");
const login = require("./controllers/loginController");
const user = require("./routes/user");
const supplier = require("./routes/supplier");
const admin = require("./controllers/adminController");
const company = require("./controllers/companyController");
const forgetPassword = require("./controllers/forgetPasswordController");
const changePassword = require("./controllers/changePasswordController");
const zone = require("./routes/zone");
const group = require("./routes/group");
const medical = require("./routes/medical");
const mofa = require("./routes/mofa");
const stamping = require("./routes/stamping");
const tc = require("./routes/tc");
const manpower = require("./routes/manpower");
const flight = require("./routes/flight");
const delivery = require("./routes/delivery");

/** Other Routes */
app.use("/register", register);
app.use("/dashboard", dashboard);
app.use("/company", company);
app.use("/login", login);
app.use("/pax", user);
app.use("/supplier", supplier);
app.use("/admin", admin);
app.use("/forget-password", forgetPassword);
app.use("/change-password", changePassword);
app.use("/zone", zone);
app.use("/group", group);
app.use("/medical", medical);
app.use("/mofa", mofa);
app.use("/stamping", stamping);
app.use("/tc", tc);
app.use("/manpower", manpower);
app.use("/flight", flight);
app.use("/delivery", delivery);

app.use((req, res, next) => {
  res.status(404).send("PAGE NOT FOUND");
});

// Start the server and Database
/** Database Configuration File */
const config = require("./config/database");

const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, function() {
    console.log("Server started on port " + port);
  });
});

db.on("error", err => {
  console.log(err);
});

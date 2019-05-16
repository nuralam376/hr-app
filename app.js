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

/** PAX Model */
const PAXModel = require("./models/userModel");

/** Medical Model */
const MedicalModel = require("./models/medicalModel");

/** Mofa Model */
const MOFAModel = require("./models/mofaModel");

/** Stamping Model */
const StampingModel = require("./models/stampingModel");

/** Manpower Model Schema */
const ManpowerModel = require("./models/manpowerModel");

/** Flight Model Schema */
const FlightModel = require("./models/flightModel");

/** Delivery Model Schema */
const DeliveryModel = require("./models/deliveryModel");

/** Moment */
const moment = require("moment");

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
app.use(async (req, res, next) => {
  try {
    if (req.user) {
      let paxs = await PAXModel.find({ company: req.user.company });
      let notification = 0;
      res.locals.notification = 0;
      let events = [];
      if (paxs) {
        for (let pax of paxs) {
          let delivery = await DeliveryModel.findOne({ pax: pax, company: req.user.company });
          if (!delivery) {
            let flight = await FlightModel.findOne({ pax: pax, company: req.user.company });

            if (!flight) {
              let manpower = await ManpowerModel.findOne({ pax: pax, company: req.user.company });

              if (!manpower) {
                let stamping = await StampingModel.findOne({ pax: pax, company: req.user.company });

                if (!stamping) {
                  let mofa = await MOFAModel.findOne({ pax: pax, company: req.user.company });
                  if (!mofa) {
                    let medical = await MedicalModel.findOne({ pax: pax, company: req.user.company });

                    if (medical) {
                      if (medical.medical_expiry) {
                        ++notification;
                        events.push({
                          pax: pax.code,
                          expiry: moment(medical.medical_expiry).format("ll"),
                          stage: "Medical expiration Date",
                          url: "/medical/register/report/" + pax.code
                        });
                      }
                      if (medical.status == "interview" && medical.interview_date) {
                        ++notification;
                        events.push({
                          pax: pax.code,
                          expiry: moment(medical.interview_date).format("ll"),
                          stage: "Medical Interview Date",
                          url: "/medical/register/report/" + pax.code
                        });
                      }
                    }
                  }
                }
                else if (stamping.stamping_date) {
                  ++notification;
                  events.push({
                    pax: pax.code,
                    expiry: moment(stamping.stamping_date).format("ll"),
                    stage: "Stamping Date",
                    url: "/stamping/completeregistration/" + stamping._id
                  });
                }
              }
              else if (manpower.clearance_date) {
                ++notification;
                events.push({
                  pax: pax.code,
                  expiry: moment(manpower.clearance_date).format("ll"),
                  stage: "Manpower Clearance Date",
                  url: "/manpower/status/" + manpower._id
                });
              }
            }
            else if (flight.flight_date) {
              ++notification;
              events.push({
                pax: pax.code,
                expiry: moment(flight.flight_date).format("ll"),
                stage: "Flight Date",
                url: "/flight/report/" + pax._id
              });
            }
            else if (flight.probable_date) {
              ++notification;
              events.push({
                pax: pax.code,
                expiry: moment(flight.probable_date).format("ll"),
                stage: "Probable Flight Date",
                url: "/flight/requisition/" + pax._id
              });
            }
          }
        }
      }
      res.locals.events = events;
      res.locals.notification = notification;
    }
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
  }
  catch (err) {
    console.log(err);
  }
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
const role = require("./routes/role");
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
app.use("/role", role);
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
  res.status(404).send("<h1>PAGE NOT FOUND</h1>");
});

app.use((req, res, next) => {
  res.status(422).send("<h1>500,Internal Server Error</h1>");
});

// Start the server and Database
/** Database Configuration File */
const config = require("./config/database");

const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, function () {
    console.log("Server started on port " + port);
  });
});

db.on("error", err => {
  console.log(err);
});

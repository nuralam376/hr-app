/** Group Model */

const GroupModel = require("../models/groupModel");

/** Supplier Model */
const CompanyInfoModel = require("../models/companyInfoModel");

/** Zone Model */
const ZoneModel = require("../models/zoneModel");

/** Created Events Module */
const createdEvents = require("../util/events");

/** PAX Model Schema */
const PAXModel = require("../models/userModel");

/** Medical Model Schema */
const MedicalModel = require("../models/medicalModel");

/** Mofa Model Schema */
const MofaModel = require("../models/mofaModel");

const moment = require("moment-timezone");
const fs = require("fs");
const aws = require("aws-sdk");

const config = require("../config/s3");
/** AWS */
aws.config.update({
  secretAccessKey: config.secretAccessKey,
  accessKeyId: config.accessKeyId,
  region: "ap-south-1"
});

const s3 = new aws.S3();

/** S3 Get File */
const s3GetFile = require("../util/getS3File");

/** Validation Configuration */
const { check, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

/** Gets All groups */
exports.getAllGroups = async (req, res) => {
  try {
    // console.log(moment.tz.guess());
    let groups = await GroupModel.find({ company: req.user.company })
      .sort({ created_at: -1 })
      .populate("zone")
      .exec();

    let newGroups = groups.map(group => {
      let url = s3GetFile(req, "/groups/", group.enjazit_image);

      group["imageUrl"] = url;

      return group;
    });

    if (groups) {
      res.render("group/index", {
        groups: newGroups,
        moment: moment
      });
    }
  } catch (err) {
    console.log(err);
  }
};

/** Gets Registration page for group */
exports.getGroupRegistration = async (req, res) => {
  try {
    let group = await CompanyInfoModel.findOne({ company: req.user.company });
    let zone = await ZoneModel.find({ company: req.user.company });

    res.render("group/register", {
      zone: zone,
      group: group
    });
  } catch (err) {
    console.log(err);
  }
};

/** Saves group */

exports.postGroupRegistration = async (req, res) => {
  try {
    let forms = {
      group_seq: req.body.group_seq,
      group_sl: req.body.group_sl,
      id: req.body.id,
      supplier: req.body.supplier,
      visa: req.body.visa,
      zone: req.body.zone,
      category: req.body.category,
      amount: req.body.amount,
      occupation: req.body.occupation
    };

    /** Checks whether any file is uploaded */
    if (typeof enjazitPhoto !== "undefined" && req.fileValidationError == null) {
      forms.enjazit_image = enjazitPhoto;
    }
    let errors = validationResult(req);
    let group_sl = await CompanyInfoModel.findOne({
      company: req.user.company
    });

    if (!errors.isEmpty()) {
      res.render("group/register", {
        errors: errors.array(),
        form: forms,
        group: group_sl,
        fileError: req.fileValidationError
      });
    } else {
      await groupSave(req, res, forms);
    }
  } catch (err) {
    console.log(err);
  }
};

/** Edits group Info */

exports.editGroup = async (req, res) => {
  try {
    let id = req.params.id;
    let group = await GroupModel.findOne({
      _id: id,
      company: req.user.company
    }).populate("zone");

    let url = s3GetFile(req, "/groups/", group.enjazit_image);

    if (group) {
      res.render("group/edit", {
        group: group,
        imageUrl: url
      });
    }
  } catch (err) {
    console.log(err);
  }
};

/** Updates group */
exports.updateGroup = async (req, res) => {
  try {
    let forms = {
      group_seq: req.body.group_seq,
      group_sl: req.body.group_sl,
      id: req.body.id,
      visa_number: req.body.visa_number,
      visa_supplier: req.body.visa_supplier,
      visa_id: req.body.visa_id,
      category: req.body.category,
      zone: req.body.zone,
      amount: req.body.amount,
      occupation: req.body.occupation
    };

    let errors = validationResult(req);
    let group = await GroupModel.findOne({
      _id: req.params.id,
      company: req.user.company
    }).populate("zone");

    if (group) {
      forms.enjazit_image = group.enjazit_image;

      /** Checks whetere any file is uploaded */
      if (
        typeof enjazitPhoto !== "undefined" &&
        req.fileValidationError == null
      ) {
        forms.enjazit_image = enjazitPhoto;
      }

      let url = s3GetFile(req, "/groups/", group.enjazit_image);

      if (!errors.isEmpty()) {
        res.render("group/edit", {
          errors: errors.array(),
          form: forms,
          group: group,
          fileError: req.fileValidationError,
          imageUrl: url
        });
      } else {
        if (group.enjazit_image !== forms.enjazit_image) {
          /** Removes the previous file */
          let params = {
            Bucket: "hr-app-test",
            Key: req.user.company + "/groups/" + group.enjazit_image
          };
          s3.deleteObject(params, (err, data) => {
            if (err) {
              console.log(err);
            }
          });
        }
        await groupUpdate(req, res, forms, group);
      }
    } else {
      req.flash("danger", "Group Not Found");
      res.redirect("/group");
    }
  } catch (err) {
    console.log(err);
  }
};

/** Deletes group */
exports.deleteGroup = async (req, res) => {
  try {
    let query = { _id: req.params.id, company: req.user.company }; // Deletes the group

    let group = await GroupModel.findOne(query);

    let pax = await PAXModel.findOne({ company: req.user.company, group: group._id });

    let medical = await MedicalModel.findOne({ company: req.user.company, group: group._id });

    let mofa = await MofaModel.findOne({ company: req.user.company, group: group._id });

    if (!pax && !medical && !mofa && group) {
      /** Removes the previous file */
      let params = {
        Bucket: "hr-app-test",
        Key: req.user.company + "/groups/" + group.enjazit_image
      };
      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.log(err);
        }
      });

      let groupDelete = await GroupModel.deleteOne(query);

      if (groupDelete) {
        req.flash("danger", "Group Deleted");
        res.redirect("/group");
      } else {
        req.flash("danger", "Something Went Wrong");
        res.redirect("/group");
      }
    }
    else {
      req.flash("danger", "Other Group related information needs to be deleted first");
      res.redirect("/group");
    }
  } catch (err) {
    console.log(err);
  }
};

/** Get group's Info */

exports.getGroup = async (req, res) => {
  try {
    let id = req.params.id;

    let group = await GroupModel.findOne({
      _id: id,
      company: req.user.company
    }).populate("zone");

    let url = s3GetFile(req, "/groups/", group.enjazit_image);

    if (group) {
      res.render("group/view", {
        group: group,
        imageUrl: url
      });
    } else {
      req.flash("danger", "group Not found");
      res.redirect("/group/");
    }
  } catch (err) {
    console.log(err);
  }
};

const groupSave = async (req, res, forms) => {
  if (forms.enjazit_image) {
    /** Saves forms data in group object */
    let group = new GroupModel();
    group.group_seq = forms.group_seq;
    group.group_sl = forms.group_sl;
    group.visa_number = forms.visa;
    group.visa_supplier = forms.supplier;
    group.visa_id = forms.id;
    group.amount = forms.amount;
    group.company = req.user.company;
    group.occupation = forms.occupation;
    group.category = forms.category;
    group.enjazit_image = forms.enjazit_image;
    group.created_at = moment().format();

    let zone = await ZoneModel.findOne({
      company: req.user.company,
      name: forms.zone
    }); // Finds Zone

    /** If Zones found, then set previous zone to group */
    if (zone) {
      group.zone = zone._id;
    } else {
      /** New Zone Created */
      let newZone = new ZoneModel();
      newZone.name = forms.zone;
      newZone.country = "--";
      newZone.company = req.user.company;
      let newZoneSave = await newZone.save();
      group.zone = newZoneSave._id;
    }

    let companyInfo = {};
    companyInfo.group = forms.group_seq;
    await CompanyInfoModel.updateOne(
      { company: req.user.company },
      companyInfo
    );

    /** Group Status */
    let groupStatus = {
      type: "group_created",
      display_name: "Group Created",
      description: `${req.user.name} created group of ${group.group_seq} / ${group.group_sl}`,
      time: Date.now()
    };

    group.events.push(groupStatus);
    let groupSave = await group.save(); // Saves group data

    if (groupSave) {
      req.flash("success", "Group created successfully");
      res.redirect("/group");
    } else {
      req.flash("danger", "Something went wrong");
      res.redirect("/group");
    }
  } else {
    let group = await CompanyInfoModel.findOne({ company: req.user.company });
    res.render("group/register", {
      form: forms,
      fileError: "Enjazit Image is required",
      group: group
    });
  }
};

const groupUpdate = async (req, res, forms) => {
  /** Saves forms data in group object */
  let group = {};
  group.group_seq = forms.group_seq;
  group.group_sl = forms.group_sl;
  group.visa_number = forms.visa_number;
  group.visa_supplier = forms.visa_supplier;
  group.visa_id = forms.visa_id;
  group.amount = forms.amount;
  group.company = req.user.company;
  group.occupation = forms.occupation;
  group.category = forms.category;
  group.enjazit_image = forms.enjazit_image;
  group.updated_at = Date.now();

  let zone = await ZoneModel.findOne({
    company: req.user.company,
    name: forms.zone
  }); // Finds Zone

  /** If Zones found, then set previous zone to group */
  if (zone) {
    group.zone = zone._id;
  } else {
    /** New Zone Created */
    let newZone = new ZoneModel();
    newZone.name = forms.zone;
    newZone.country = "--";
    newZone.company = req.user.company;
    let newZoneSave = await newZone.save();
    group.zone = newZoneSave._id;
  }
  await createdEvents(req, group, req.params.id, "group");


  let groupUpdate = await GroupModel.updateOne(
    { _id: req.params.id, company: req.user.company },
    group
  ); // Updates group data

  if (groupUpdate) {
    req.flash("success", "Group updated successfully");
    res.redirect("/group");
  } else {
    req.flash("danger", "Something went wrong");
    res.redirect("/group");
  }
};

/** Gets Group Image */
exports.getGroupImage = async (req, res) => {
  try {
    let image = req.params.image;
    let group = await GroupModel.findOne({ enjazit_image: image });

    let params = {
      Bucket: "hr-app-test",
      Key: group.company + "/groups/" + image,
      Expires: 60,
      ResponseCacheControl: "no-cache"
    };

    let url = s3.getSignedUrl("getObject", params);
    res.statusCode = 302;
    res.setHeader("Location", url);
    res.end();
  } catch (err) {
    console.log(err);
  }
};


/**
 * Shows Timeline of the Group
 * @param {string} id - The Object Id of the Group.
 */

exports.groupTimeline = async (req, res) => {
  try {
    let query = { _id: req.params.id, company: req.user.company };

    let group = await GroupModel.findOne(query);

    res.render("group/timeline", {
      newGroup: group,
      moment: moment
    });
  } catch (error) {
    console.log(error);
  }
};
/** Admin Model */
const AdminModel = require("../models/adminModel");

/** Supplier Model */
const SupplierModel = require("../models/supplierModel");

/** User Model */
const UserModel = require("../models/userModel");

/**Moment */
const moment = require("moment");

/** Created Events  */
const createEvents = async (req, user, id, type) => {
  let oldUser;
  if ("admin" == type) {
    oldUser = await AdminModel.findOne({ _id: id });
  } else if ("user" == type) {
    oldUser = await UserModel.findOne({ _id: id }).lean();
    oldUser["issue"] = moment(oldUser.issue).format("ll");
    oldUser.expiry = moment(oldUser.expiry).format("ll");
    oldUser.birth_date = moment(oldUser.birth_date).format("ll");
    user.issue = moment(user.issue).format("ll");
    user.expiry = moment(user.expiry).format("ll");
    user.birth_date = moment(user.birth_date).format("ll");
  } else if ("supplier" == type) {
    oldUser = await SupplierModel.findOne({ _id: id });
  }

  if (oldUser) {
    user.company = oldUser.company;
    user.updated_at = oldUser.updated_at;
    let changed_keys = new Set();

    for (let key in user) {
      if (user[key] != oldUser[key]) changed_keys.add(key);
    }

    let event = {};

    for (
      let it = changed_keys.values(), val = null;
      (val = it.next().value);

    ) {
      event.type = val;
      event.display_name = val + " Changed";
      event.description = `${req.user.name} changed value of  ${val} from ${
        oldUser[val]
        } to ${user[val]}`;
      event.time = Date.now();
      await pushEvents(event, type, id);
    }
  }
};

const pushEvents = async (event, type, id) => {
  if ("admin" === type)
    await AdminModel.findOneAndUpdate(
      { _id: id },
      { $push: { events: event } }
    );
  else if ("user" === type)
    await UserModel.findOneAndUpdate({ _id: id }, { $push: { events: event } });
  else if ("supplier" === type)
    await SupplierModel.findOneAndUpdate(
      { _id: id },
      { $push: { events: event } }
    );
};

module.exports = createEvents;

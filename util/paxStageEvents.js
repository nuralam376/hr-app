/** Medical Model */
const MedicalModel = require("../models/medicalModel");

/** Group Model */
const GroupModel = require("../models/groupModel");

/** Group Model */
const MOFAModel = require("../models/mofaModel");

/**Moment */
const moment = require("moment");

/** Created Events  */
const createEvents = async (req, oldData, newData, type) => {

  if (oldData) {
    if ("medical" == type) {
      if (newData.issue) {
        oldData.issue = moment(oldData.issue).format("ll");
        newData.issue = moment(newData.issue).format("ll");
      }
      if (newData.medical_expiry) {
        oldData.medical_expiry = moment(oldData.medical_expiry).format("ll");
        newData.medical_expiry = moment(newData.medical_expiry).format("ll");
      }
      if (newData.interview_date) {
        oldData.interview_date = moment(oldData.interview_date).format("ll");
        newData.interview_date = moment(newData.interview_date).format("ll");
      }
    }
    let changed_keys = new Set();

    for (let key in newData) {
      if (newData[key] != oldData[key]) changed_keys.add(key);
    }

    let event = {};

    for (
      let it = changed_keys.values(), val = null;
      (val = it.next().value);

    ) {
      event.type = val;
      event.display_name = val + " Changed";
      if (val == "group") {
        let oldGroup = await GroupModel.findById({ _id: oldData[val] });
        let newGroup = await GroupModel.findById({ _id: newData[val] });

        event.description = `${req.user.name} changed group from  ${oldGroup.group_seq} / ${oldGroup.group_sl} to ${
          newGroup.group_seq
          } to ${newGroup.group_sl}`;
      }
      else {
        if (oldData[val] && newData[val]) {

          event.description = `${req.user.name} changed value of  ${val} from ${
            oldData[val]
            } to ${newData[val]}`;
        }
        else {
          if (newData[val])
            event.description = `${req.user.name} saved value of  ${val} to ${newData[val]}`;
          else
            event.description = `${req.user.name} removed  ${val}`;
        }

      }

      event.time = Date.now();
      await pushEvents(event, type, oldData._id);
    }
  }
};

const pushEvents = async (event, type, id) => {
  if ("medical" === type)
    await MedicalModel.findOneAndUpdate(
      { _id: id },
      { $push: { events: event } }
    );
  if ("mofa" === type)
    await MOFAModel.findOneAndUpdate(
      { _id: id },
      { $push: { events: event } }
    );
};

module.exports = createEvents;

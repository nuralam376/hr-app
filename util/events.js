/** Admin Model */
const AdminModel = require("../models/adminModel");

/** Supplier Model */
const SupplierModel = require("../models/supplierModel");

/** User Model */
const UserModel = require("../models/userModel");

/** Created Events  */
const createEvents = async(req,user,id,type) => {
    let oldUser;
    if("admin" == type)
    {
        oldUser = await AdminModel.findOne({_id : id});
    }
    else if("user" == type)
    {
        oldUser = await UserModel.findOne({_id : id});
    }
    else if("supplier" == type)
    {
        oldUser = await SupplierModel.findOne({_id : id});
    }
  
    if(oldUser)
    {
        user.company = oldUser.company;
        user.updated_at = oldUser.updated_at;
        let changed_keys = new Set();

        for(let key in user){
        if(user[key] != oldUser[key])
            changed_keys.add(key);
        }

        let event = {};

        for (let it = changed_keys.values(), val= null; val=it.next().value; ) {
            event.type = val;
            event.display_name = val + " Changed";
            event.description  = `${req.user.name} changed value of  ${val} from ${oldUser[val]} to ${user[val]}`;
            await pushEvents(event,type,id);
        }
    }
};

const pushEvents = async(event,type,id) => {
    if("admin" === type)
        await AdminModel.findOneAndUpdate({_id : id},   { $push: { events: event } });
    else if("user" === type)
        await UserModel.findOneAndUpdate({_id : id},   { $push: { events: event } });
    else if("supplier" === type)    
        await SupplierModel.findOneAndUpdate({_id : id},   { $push: { events: event } });
}

module.exports = createEvents;
const db = require("../config/database");
const AdminModel = require("../models/AdminModel");

describe("Checks Admin Model Data", () => {
    test("should add admin data", async() => {
        let admin = new AdminModel({
            name : "Abcd",
            email : "abc@gmail.com",
            contact : 1986322,
            address : "Lorem Ipsum",
            profile_photo : "dummy.jpeg",
            password : "1233456",
            created_at : Date.now(),
            updated_at : Date.now(),
        });

        let newAdmin = await admin.save();
        let adminData = await AdminModel.findById(newAdmin._id);
        expect.assertions(1);
        expect(adminData._id).toEqual(newAdmin._id);
    });

    test("should update admin data", async() => {
        expect.assertions(1);
        let adminData = await AdminModel.findOne({name : "Abcd"});
        let admin = {};
        admin.contact = 789765456;
        await AdminModel.updateOne({_id : adminData._id},admin);
        adminData = await AdminModel.findOne({name : "Abcd"});
        expect(adminData.contact).toEqual(789765456);
    });

    test("should delete the admin data", async() => {
        expect.assertions(1);
        let admin = await AdminModel.deleteOne({name : "Abcd"});
        let adminData = await AdminModel.findOne({name : "Abcd"});
        expect(adminData).toBeNull();
    });
}); 
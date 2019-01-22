const mocha = require("mocha");
const assert = require("assert");

const AdminModel = require("../models/AdminModel");

describe("Cheks Admin Model Data", () => {
    it("should return Admin Data", async() => {
        let admin = await AdminModel.find({name : "Super Admin 1"});
        assert.equal(admin.name,"Super Admin 1");
    });
});
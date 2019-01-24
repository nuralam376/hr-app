const mocha = require("mocha");
const assert = require("assert");
const mongoose = require("mongoose");

/** Database Configuration File */
const config = require("../config/database");

/** Database Configuration Settings */
mongoose.connect(config.database, {useNewUrlParser : true});

const db = mongoose.connection;

db.once("open",function(){
    console.log("Connected to MongoDB");
});

db.on("error",function(err){
    console.log("error");
});

const AdminModel = require("../models/AdminModel");

describe("Cheks Admin Model Data", () => {

    beforeEach(async() => {
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

        await admin.save();
    });

    afterEach(async() => {
        await AdminModel.deleteOne({email : "abc@gmail.com"});
        db.close();
    });

    it("should return Admin's Data", async() =>  {
        let admin = await AdminModel.findOne({name : "Abcd"});
        assert.equal(admin.name,"Abcd");
    });
}); 
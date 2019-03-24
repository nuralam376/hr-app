const mongoose = require("mongoose");
const config = require("../config/database");
const ZoneModel = require("../models/zoneModel");
const CompanyModel = require("../models/companyInfoModel");

const db = mongoose.connection;

beforeAll(() => {
    db.once("open", () => {
        console.log("Connected to MongoDB");
    });
});

afterAll(() => {
    db.close();
});

describe("Tests Zone Collection", () => {
    test("should add and find new Zone data", async() => {
        let company = await CompanyModel.findOne({});

        let zone = new ZoneModel({
            name : "dhk",
            country : "bd",
            company : company._id
        });

        let newZone = await zone.save();
        let zoneData = await ZoneModel.findOne({_id : newZone._id});
        expect(zoneData.name).toBe(zone.name);
        expect(zoneData.country).toBe(zone.country);
        expect(zoneData.company).toBe(company._id);
    });

    test("should delete zone data", async() => {
        let zone = await ZoneModel.findOne({name : "dhk"});
        let deleteZone = await ZoneModel.deleteOne({_id : zone._id});
        let oldZone = await ZoneModel.findOne({name : "dhk"});
        expect(oldZone).toBeNull();
    });
});
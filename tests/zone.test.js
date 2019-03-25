const db = require("../config/database");
const ZoneModel = require("../models/zoneModel");
const CompanyModel = require("../models/companyInfoModel");
const ZoneController = require("../controllers/zoneController");

describe("Tests Zone Collection", () => {
    test("should check all the functions of the routes exists", () => {
        expect(ZoneController.getAllZones).toBeDefined();
        expect(ZoneController.getZoneRegistration).toBeDefined();
        expect(ZoneController.postZoneRegistration).toBeDefined();
        expect(ZoneController.editZone).toBeDefined();
        expect(ZoneController.updateZone).toBeDefined();
        expect(ZoneController.deleteZone).toBeDefined();
        expect(ZoneController.getAllNames).toBeDefined();
        expect(ZoneController.getZone).toBeDefined();
    });

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
        expect(zoneData.company).toEqual(company._id);
    });

    test("should update Zone Data", async() => {
        let zone = await ZoneModel.findOne({name : "dhk"});
        let newZone = {};
        newZone.name = "dhka";
        newZone.country = "ind";
        let newZoneData = await ZoneModel.updateOne({_id : zone._id},newZone);
        zone = await ZoneModel.findById(zone._id);
        expect(zone.name).toBe("dhka");
        expect(zone.country).toBe("ind");
    });

    test("should delete zone data", async() => {
        let zone = await ZoneModel.findOne({name : "dhka"});
        let deleteZone = await ZoneModel.deleteOne({_id : zone._id});
        let oldZone = await ZoneModel.findOne({name : "dhka"});
        expect(oldZone).toBeNull();
    });
});
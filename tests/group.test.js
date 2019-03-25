const db = require("../config/database");
const ZoneModel = require("../models/zoneModel");
const GroupModel = require("../models/groupModel");
const CompanyModel = require("../models/companyInfoModel");
const GroupController = require("../controllers/groupController");

describe("Tests Group Collection", () => {
    test("should check all the functions of the groups routes exists", () => {
        expect(GroupController.getAllGroups).toBeDefined();
        expect(GroupController.getGroupRegistration).toBeDefined();
        expect(GroupController.postGroupRegistration).toBeDefined();
        expect(GroupController.editGroup).toBeDefined();
        expect(GroupController.updateGroup).toBeDefined();
        expect(GroupController.deleteGroup).toBeDefined();
        expect(GroupController.getGroup).toBeDefined();
    });

    test("should add and find new Group data", async() => {
        let company = await CompanyModel.findOne({});
        let zone = await ZoneModel.findOne();
        let newGroupSeq = company.group + 1;

        let group = new GroupModel({
            group_seq : newGroupSeq,
            group_sl : 1,
            visa_number : 8974545648,
            visa_supplier : "Test",
            visa_id : 4879,
            amount : 45878945,
            occupation : "Driver",
            enjazit_image : "dummy.jpeg",
            zone : zone._id,
            company : company._id
        });

        let newGroup = await group.save();
        let groupData = await GroupModel.findOne({_id : newGroup._id});
        expect(groupData.group_seq).toBe(group.group_seq);
        expect(groupData.group_sl).toBe(group.group_sl);
        expect(groupData.visa_number).toBe(group.visa_number);
        expect(groupData.visa_supplier).toBe(group.visa_supplier);
        expect(groupData.visa_id).toBe(group.visa_id);
        expect(groupData.amount).toBe(group.amount);
        expect(groupData.occupation).toBe(group.occupation);
        expect(groupData.enjazit_image).toBe(group.enjazit_image);
        expect(groupData.company).toEqual(group.company);
    });

    test("should update Group Data", async() => {
        let group = await GroupModel.findOne({visa_number : 8974545648});
        let newGroup = {};
        newGroup.group_sl = 5;
        newGroup.visa_id = 29899;
        let newGroupData = await GroupModel.updateOne({_id : group._id},newGroup);
        group = await GroupModel.findById(group._id);
        expect(group.group_sl).toBe(5);
        expect(group.visa_id).toBe(29899);
    });

    test("should delete Group data", async() => {
        let group = await GroupModel.findOne({visa_number : 8974545648});
        let deleteGroup = await GroupModel.deleteOne({_id : group._id});
        let oldGroup = await GroupModel.findOne({visa_number : 8974545648});
        expect(oldGroup).toBeNull();
    });
});
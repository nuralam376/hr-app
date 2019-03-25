const db = require("../config/database");
const SupplierModel = require("../models/supplierModel");
const GroupModel = require("../models/groupModel");
const SupplierController = require("../controllers/supplierController");
const CompanyModel = require("../models/companyInfoModel");

describe("Tests Supplier Collection", () => {
    test("should check all the functions of the suppliers routes exists", () => {
        expect(SupplierController.getAllSuppliers).toBeDefined();
        expect(SupplierController.getSupplierRegistration).toBeDefined();
        expect(SupplierController.postSupplierRegistration).toBeDefined();
        expect(SupplierController.editSupplier).toBeDefined();
        expect(SupplierController.updateSupplier).toBeDefined();
        expect(SupplierController.deleteSupplier).toBeDefined();
        expect(SupplierController.suppliersTimeline).toBeDefined();
        expect(SupplierController.getSuppliersSticker).toBeDefined();
        expect(SupplierController.downloadSuppliersSticker).toBeDefined();
        expect(SupplierController.getSupplier).toBeDefined();
    });

    test("should add and find new Supplier data", async() => {
        let company = await CompanyModel.findOne();
        let supplierCode = company.supplier + 1;
        let supplier = new SupplierModel({
            name : "New Supplier",
            code : supplierCode,
            nid : 14874987,
            present_address : "Dhanmondi, Dhaka",
            permanent_address : "Dhanmondi, Dhaka",
            contact : "48574987",
            introducer_name : "New Introducer",
            introducer_number : 45878945,
            profile_photo : "dummy.jpeg",
            passport_photo : "dummy.jpeg",
            company : company.company
        });

        let newSupplier = await supplier.save();
        let supplierData = await SupplierModel.findOne({_id : newSupplier._id});
        expect(supplierData.name).toBe(supplier.name);
        expect(supplierData.code).toBe(supplier.code);
        expect(supplierData.nid).toBe(supplier.nid);
        expect(supplierData.present_address).toBe(supplier.present_address);
        expect(supplierData.permanent_address).toBe(supplier.permanent_address);
        expect(supplierData.contact).toBe(supplier.contact);
        expect(supplierData.introducer_name).toBe(supplier.introducer_name);
        expect(supplierData.introducer_number).toBe(supplier.introducer_number);
        expect(supplierData.company).toEqual(company.company);
    });

    test("should update Supplier Data", async() => {
        let supplier = await SupplierModel.findOne({nid : 14874987});
        let newSupplier = {};
        newSupplier.contact = "5748984";
        newSupplier.introducer_number = "29899789";
        let newSupplierData = await SupplierModel.updateOne({_id : supplier._id},newSupplier);
        supplier = await SupplierModel.findById(supplier._id);
        expect(supplier.contact).toEqual(newSupplier.contact);
        expect(supplier.introducer_number).toEqual(newSupplier.introducer_number);
    });

    test("should generate Supplier Sticker Data", async() => {
        let supplier = await SupplierModel.findOne();

        expect(supplier.name).not.toBeNull();
        expect(supplier.code).not.toBeNull();
    });

    test("should delete Supplier data", async() => {
        let supplier = await SupplierModel.findOne({nid : 14874987});
        let deleteSupplier = await SupplierModel.deleteOne({_id : supplier._id});
        let oldSupplier = await SupplierModel.findOne({nid : 14874987});
        expect(oldSupplier).toBeNull();
    });
});
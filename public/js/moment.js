$(document).ready(function () {

    const val = $("#profile").data("val");
    const pax = moment(new Date(val)).format("llll");


    $("#profile").text(pax);
    const count = $("#userCount").data("length");
    if (count) {
        for (let i = 0; i < count; i++) {
            let userId = $("#user-" + i).data("user");
            let supplierId = $("#supplier-" + i).data("supplier");
            let user = moment(new Date(userId)).format("llll");
            let supplier = moment(new Date(supplierId), "YYYYMMDD").fromNow();
            $("#user-" + i).text(user);
            $("#supplier-" + i).text(supplier);
        }
    }


});
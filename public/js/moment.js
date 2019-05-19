$(document).ready(function () {

    const val = $("#profile").data("val");
    const pax = moment(new Date(val)).format("llll");


    $("#profile").text(pax);
    const count = $("#userCount").data("length");
    if (count) {
        for (let i = 0; i < count; i++) {
            let userId = $("#user-" + i).data("user");
            console.log(userId);
            let user = moment(new Date(userId)).format("llll");
            $("#user-" + i).text(user);
        }
    }


});
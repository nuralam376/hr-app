$(document).ready(function () {
  $(function () {

    $(".delete-user").on("click", function (e) {
      ajaxDelete(e, "pax");
    });

    $(".delete-supplier").on("click", function (e) {
      ajaxDelete(e, "supplier");
    });

    $(".delete-admin").on("click", function (e) {
      ajaxDelete(e, "admin");
    });

    $(".delete-zone").on("click", function (e) {
      ajaxDelete(e, "zone");
    });

    $(".delete-group").on("click", function (e) {
      ajaxDelete(e, "group");
    });

    $(".delete-medical").on("click", function (e) {
      ajaxDelete(e, "medical");
    });
    $(".delete-mofa").on("click", function (e) {
      ajaxDelete(e, "mofa");
    });

    $(".delete-stamping").on("click", function (e) {
      ajaxDelete(e, "stamping");
    });

    $(".delete-tc").on("click", function (e) {
      ajaxDelete(e, "tc");
    });

    $(".delete-manpower").on("click", function (e) {
      ajaxDelete(e, "manpower");
    });

    $(".delete-flight").on("click", function (e) {
      ajaxDelete(e, "flight");
    });

    $(".delete-delivery").on("click", function (e) {
      ajaxDelete(e, "delivery");
    });

    function ajaxDelete(e, route) {
      e.preventDefault();
      $.confirm({
        title: "Delete Confirmation!",
        content: "Are you sure you want to delete it permanently?",
        type: "red",
        buttons: {
          confirm: function () {
            $target = $(e.target);
            const id = $target.attr("data-id");
            const csrf = $target.attr("data-csrf");

            $.ajax({
              type: "Delete",
              url: "/" + route + "/delete/" + id,
              data: {
                _csrf: csrf
              },
              success: function (response) {
                console.log(response);
                if (route == "medical") {
                  window.location.href = "/" + route + "/all";
                } else {
                  window.location.href = "/" + route + "";
                }
              },

              error: function (err) {
                if (route == "medical") {
                  window.location.href = "/" + route + "/all";
                } else {
                  window.location.href = "/" + route + "";
                }
              }
            });
          },
          cancel: function () {
            $.alert("Canceled!");
          }
        }
      });
    }

    function readURL(input, id) {
      if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
          $(id).attr("src", e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
      }
    }

    $("#profile_photo").change(function () {
      readURL(this, "#photo");
    });

    $("#passport_photo").change(function () {
      readURL(this, "#photo1");
    });
    $("#enjazit").change(function () {
      readURL(this, "#photo");
    });
    $("#experience_image").change(function () {
      readURL(this, "#photo2");
    });
    $("#slip").change(function () {
      readURL(this, "#photo");
    });
    $("#pc_image").change(function () {
      readURL(this, "#photo");
    });
    $("#card_photo").change(function () {
      readURL(this, "#photo");
    });

    function getZones() {
      $.ajax({
        type: "GET",
        url: "/zone/names",
        success: function (response) {
          let availableZones = [];
          let zoneInfo;
          response.forEach(zone => {
            zoneInfo = zone.name;
            availableZones.push(zoneInfo);
          });
          showResult(availableZones);
        },

        error: function (err) {
          availableTags = err;
        }
      });
    }

    $("#zone").on("focus", function () {
      getZones();
    });

    function getOccupations() {
      $.ajax({
        type: "GET",
        url: "/mofa/groups",
        success: function (response) {
          let availableGroups = [];
          let groupInfo;
          response.forEach(group => {
            groupInfo = group.occupation;
            availableGroups.push(groupInfo);
          });
          showGroup(availableGroups);
        },

        error: function (err) {
          availableTags = err;
        }
      });
    }

    $("#occupation").on("focus", function () {
      getOccupations();
    });

    function showResult(availableZones) {
      $("#zone").autocomplete({
        source: availableZones,
        selectFirst: true,
        minLength: 0,
        focus: function (event, ui) {
          $(this).autocomplete("search", $(this).val());
        },
        select: function (event, ui) {
          $(this).val(ui.item.label);
        }
      });
    }

    function showGroup(availableGroups) {
      $("#occupation").autocomplete({
        source: availableGroups,
        selectFirst: true,
        minLength: 0,
        focus: function (event, ui) {
          $(this).autocomplete("search", $(this).val());
        },
        select: function (event, ui) {
          $(this).val(ui.item.label);
        }
      });
    }

    function checkUncheck() {
      if ($("#experience:checked").length > 0) {
        $("#experience-div").show();
      } else {
        $("#experience-div").hide();
      }
    }

    $("#experience-div").hide();
    $("#experience").on("click", checkUncheck);

    $("#unfit").hide();
    $("#interview").hide();

    function showDiv() {
      if ($("#status").val() == "unfit") {
        $("#unfit").show();
        $("#interview").hide();
      } else if ($("#status").val() == "interview") {
        $("#interview").show();
        $("#unfit").hide();
      } else {
        $("#unfit").hide();
        $("#interview").hide();
      }
    }

    $("#status").on("click", showDiv);

    function showChart(chartType) {
      $.ajax({
        type: "GET",
        url: "/dashboard/chartdata",
        dataType: "json",
        success: function (response) {
          let paxData = getChartData(response.totalPAX);
          let supplierData = getChartData(response.totalSupplier);
          let groupData = getChartData(response.totalGroup);

          let config = {
            type: chartType,
            data: {
              labels: [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
              ],
              datasets: [
                {
                  label: "Group",
                  fill: false,
                  borderColor: "purple",
                  backgroundColor: "purple",
                  data: groupData
                },
                {
                  label: "Supplier",
                  fill: false,
                  borderColor: "green",
                  backgroundColor: "green",
                  data: supplierData
                },
                {
                  label: "PAX",
                  fill: false,
                  borderColor: "#3e95cd",
                  backgroundColor: "#3e95cd",
                  data: paxData
                }
              ]
            },
            options: {
              responsive: true,
              title: {
                display: true,
                text: "Total Registered - " + new Date().getFullYear()
              },
              tooltips: {
                mode: "index",
                intersect: false
              },
              hover: {
                mode: "nearest",
                intersect: true
              },
              scales: {
                xAxes: [
                  {
                    display: true,
                    scaleLabel: {
                      display: true,
                      labelString: "Month"
                    }
                  }
                ],
                yAxes: [
                  {
                    display: true,
                    scaleLabel: {
                      display: true,
                      labelString: "Counts"
                    },
                    ticks: {
                      reverse: false,
                      stepSize: 10
                    }
                  }
                ]
              }
            }
          };

          var ctx = document.getElementById("lineChart").getContext("2d");
          if (window.chartType != undefined) window.chartType.destroy();

          window.chartType = new Chart(ctx, config);
        },
        error: function (err) {
          console.log(err);
        }
      });
    }

    showChart("line");

    function getChartData(responseData) {
      let chartData = [];

      responseData.map(data => {
        chartData[data._id.create - 1] = data.total;
      });

      for (let i = 0; i < 12; i++)
        if (typeof chartData[i] == "undefined") chartData[i] = 0;

      return chartData;
    }

    $(".box-title").on("click", function () {
      showChart($(this).attr("data-id"));
    });

    $.ajax({
      type: "GET",
      url: "/dashboard/paxstatus",
      dataType: "json",
      success: function (response) {
        console.log(response);
        let config = {
          type: "line",
          data: {
            labels: [
              "Medical",
              "MOFA",
              "Stamping",
              "TC",
              "Manpower",
              "Flights",
              "Delivery Report"
            ],
            datasets: [
              {
                label: "Total",
                fill: false,
                borderColor: "cyan",
                backgroundColor: "cyan",
                data: response,
                pointRadius: 5,
                pointHoverRadius: 10,
                showLine: false
              }
            ]
          },
          options: {
            responsive: true,
            title: {
              display: true,
              text: "Total Counts of PAX Stages"
            },
            tooltips: {
              mode: "index",
              intersect: false
            },
            hover: {
              mode: "nearest",
              intersect: true
            },
            scales: {
              xAxes: [
                {
                  display: true,
                  scaleLabel: {
                    display: true,
                    labelString: "PAX Stage"
                  }
                }
              ],
              yAxes: [
                {
                  display: true,
                  scaleLabel: {
                    display: true,
                    labelString: "Counts"
                  },
                  ticks: {
                    reverse: false,
                    stepSize: 10
                  }
                }
              ]
            }
          }
        };

        var ctx = document.getElementById("barchart").getContext("2d");
        new Chart(ctx, config);
      },
      error: function (err) {
        console.log(err);
      }
    });

    $("#admin").on("change", function () {
      let admin = $("#admin :selected").val();

      $.ajax({
        type: "GET",
        url: "/role/adminRoles/" + admin,
        success: function (response) {
          if (response) {
            response.roles.forEach(role => {
              $("#role" + role.slug).prop("checked", false);
            });
            response.admin.roles.forEach(admin => {
              response.roles.forEach(role => {
                if (role.slug == admin) {
                  $("#role" + admin).prop("checked", true);
                }

              })
            });
          }
        },

        error: function (err) {
          console.log(err);
        }
      });
    });
    $('.sidebar-menu').tree();
    $('#myTable').DataTable({
      "ordering": false
    });
  });
});

$(document).ready(function(){
    $(".delete-user").on("click",function(e){
       ajaxDelete(e,"pax");
    });

    $(".delete-supplier").on("click",function(e){
        ajaxDelete(e,"supplier");
    });

    $(".delete-admin").on("click",function(e){
        ajaxDelete(e,"admin");
      
    });

    $(".delete-zone").on("click",function(e){
        ajaxDelete(e,"zone");
      
    });

    $(".delete-group").on("click",function(e){
        ajaxDelete(e,"group");
      
    });
    
    
    $(".delete-medical").on("click",function(e){
        ajaxDelete(e,"medical");      
    });
    $(".delete-mofa").on("click",function(e){
        ajaxDelete(e,"mofa");      
    });

    $(".delete-stamping").on("click",function(e){
        ajaxDelete(e,"stamping");      
    });

    $(".delete-tc").on("click",function(e){
        ajaxDelete(e,"tc");      
    });

    $(".delete-manpower").on("click",function(e){
        ajaxDelete(e,"manpower");      
    });
    
    $(".delete-flight").on("click",function(e){
        ajaxDelete(e,"flight");      
    });

    $(".delete-delivery").on("click",function(e){
        ajaxDelete(e,"delivery");      
    });

    function ajaxDelete(e,route)
    {
        e.preventDefault();
        $.confirm({
            title: 'Delete Confirmation!',
            content: 'Are you sure you want to delete it permanently?',
            type: 'red',
            buttons: {
                confirm: function () {
                    $target = $(e.target);
                    const id = $target.attr("data-id");
                    const csrf = $target.attr("data-csrf");
                
                    $.ajax({
                        type : "Delete",
                        url : "/"+route+"/delete/" + id,
                        data : 
                        {
                            _csrf : csrf
                        },
                        success : function(response)
                        {
                            console.log(response);
                            if(route == "medical")
                            {
                                window.location.href = "/"+route+"/all";
                            }
                            else
                            {
                                window.location.href = "/"+route+"";
                            }
                        },
            
                        error : function(err)
                        {
                            if(route == "medical")
                            {
                                window.location.href = "/"+route+"/all";
                            }
                            else
                            {
                                window.location.href = "/"+route+"";
                            }
                        }
                    });
                },
                cancel: function () {
                    $.alert('Canceled!');
                }
               
            }
        });

    }

    function readURL(input,id) {

        if (input.files && input.files[0]) {
          var reader = new FileReader();
      
          reader.onload = function(e) {
            $(id).attr('src', e.target.result);
          }
      
          reader.readAsDataURL(input.files[0]);
        }
      }
      
      $("#profile_photo").change(function() {
        readURL(this,"#photo");
      });

      $("#passport_photo").change(function() {
        readURL(this,"#photo1");
      });
      $("#enjazit").change(function() {
        readURL(this,"#photo");
      });
      $("#experience_image").change(function() {
        readURL(this,"#photo2");
      });
      $("#slip").change(function() {
        readURL(this,"#photo");
      });
      $("#pc_image").change(function() {
        readURL(this,"#photo");
      });
      $("#card_photo").change(function() {
        readURL(this,"#photo");
      });
      
      function getZones()
      {
        $.ajax({
            type : "GET",
            url : "/zone/names",
            success : function(response)
            {
                let availableZones = [];
                let zoneInfo;
                response.forEach(zone => {
                    zoneInfo = zone.name;
                    availableZones.push(zoneInfo);
                });
                showResult(availableZones);
            },

            error : function(err)
            {
                availableTags = err;
            }
        });
      }

    $("#zone").on("focus",function(){
        getZones();
    });

    function getOccupations()
      {
        $.ajax({
            type : "GET",
            url : "/mofa/groups",
            success : function(response)
            {
                let availableGroups = [];
                let groupInfo;
                response.forEach(group => {
                    groupInfo = group.occupation;
                    availableGroups.push(groupInfo);
                });
                showGroup(availableGroups);
            },

            error : function(err)
            {
                availableTags = err;
            }
        });
      }

    $("#occupation").on("focus",function(){
        getOccupations();
    })


    function showResult(availableZones)
    {
        $("#zone").autocomplete({
            source: availableZones,
            selectFirst: true, 
            minLength: 0,
            focus : function(event,ui) {
                $(this).autocomplete("search", $(this).val());
            },
            select : function(event,ui){
                $(this).val(ui.item.label);
            }
        })
    }

    function showGroup(availableGroups)
    {
        $("#occupation").autocomplete({
            source: availableGroups,
            selectFirst: true, 
            minLength: 0,
            focus : function(event,ui) {
                $(this).autocomplete("search", $(this).val());
            },
            select : function(event,ui){
                $(this).val(ui.item.label);
            }
        })
    }

    function checkUncheck() { 
      
        if ( $('#experience:checked').length > 0) {
            $("#experience-div").show();
        } else {
            $("#experience-div").hide();
        }
    
    }

    $("#experience-div").hide();
    $("#experience").on( "click", checkUncheck );

    $("#unfit").hide();
    $("#interview").hide();

    function showDiv()
    {
        if($("#status").val() == "unfit")
        {
            $("#unfit").show();
            $("#interview").hide();
        }
        else if($("#status").val() == "interview")
        {
            $("#interview").show();
            $("#unfit").hide();
        }
        else
        {
            $("#unfit").hide();
            $("#interview").hide();
        }
    }

    $("#status").on("click",showDiv);
    

    $.ajax({
        type : "GET",
        url : "/dashboard/data",
        success : function(response)
        {
            let dataArray = [];
            
            response.map(pax => {
                dataArray[pax._id.create - 1] = pax.total;
            });

            if(typeof dataArray[0] == "undefined")
                dataArray[0] = 0;
            

                var config = {
                    type: 'line',
                    data: {
                        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July','August','September','October','November','December'],
                        datasets: [{
                            label: 'PAX',
                            fill: false,
                            borderColor: "#3e95cd",
                            data: dataArray
                        }]
                    },
                    options: {
                        responsive: true,
                        title: {
                            display: true,
                            text: 'Total Registered'
                        },
                        tooltips: {
                            mode: 'index',
                            intersect: false,
                        },
                        hover: {
                            mode: 'nearest',
                            intersect: true
                        },
                        scales: {
                            xAxes: [{
                                display: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Month'
                                },
                            }],
                            yAxes: [{
                                display: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Value',
                                },
                                ticks: {
                                    reverse: false,
                                    stepSize: 1
                                  },
                            }]
                        },
                    }
                };
        
               
                var ctx = document.getElementById('lineChart').getContext('2d');
                new Chart(ctx, config);
                
        },
        error : function(err)
        {
            console.log(err);
        }
    });

});
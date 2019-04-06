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

    let myChart = document.getElementById('myChart').getContext('2d');
        
    // Global Options
    Chart.defaults.global.defaultFontFamily = 'Lato';
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = '#777';
    

    $.ajax({
        type : "GET",
        url : "/dashboard/data",
        success : function(response)
        {
            let dataArray = [];
            
            response.map(pax => {
                dataArray[pax._id.create - 1] = pax.total;
            });

            let massPopChart = new Chart(myChart, {
            type:'line', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
            data:{
                labels:["January", 'February', 'March', 'April', 'May', 'June',"July","August","September","October","November","December"],
                datasets:[{
                label:'Total',
                data:dataArray,
                //backgroundColor:'green',
                backgroundColor:[
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ],
                borderWidth:1,
                borderColor:'#777',
                hoverBorderWidth:3,
                hoverBorderColor:'#000'
                }]
            },
            options:{
                title:{
                display:true,
                text:'Total PAX Registered',
                fontSize:25
                },
                legend:{
                display:true,
                position:'right',
                labels:{
                    fontColor:'#000'
                }
                },
                layout:{
                padding:{
                    left:50,
                    right:0,
                    bottom:0,
                    top:0
                }
                },
                tooltips:{
                enabled:true
                }
            }
            });  
        },
        error : function(err)
        {
            console.log(err);
        }
    });

});
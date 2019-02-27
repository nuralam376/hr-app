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
    

    function ajaxDelete(e,route)
    {
        e.preventDefault();

        if(confirm("Are you Sure?"))
        {
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
        }   
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

});
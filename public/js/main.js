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

    function ajaxDelete(e,route)
    {
        e.preventDefault();

        if(confirm("Are you Sure?"))
        {
            $target = $(e.target);
            const id = $target.attr("data-id");
            console.log();

          
            $.ajax({
                type : "Delete",
                url : "/"+route+"/delete/" + id,
                success : function(response)
                {
                    window.location.href = "/"+route+"";
                },
    
                error : function(err)
                {
                    window.location.href =  "/"+route+"";
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
                    zoneInfo = zone.name + ", " + zone.country;
                    availableZones.push(zoneInfo);
                });

                $("#zone").autocomplete({
                    source: availableZones
                  });
            },

            error : function(err)
            {
                availableTags = err;
            }
        });
      
        
      }

    $("#zone").keyup(function(){
        getZones();
    })
});
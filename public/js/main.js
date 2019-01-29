$(document).ready(function(){
    $(".delete-user").on("click",function(e){
        e.preventDefault();

        if(confirm("Are you Sure?"))
        {
            $target = $(e.target);
            const id = $target.attr("data-id");

            $.ajax({
                type : "Delete",
                url : "/pax/delete/" + id,
                success : function(response)
                {
                    window.location.href = "/pax";
                },

                error : function(err)
                {
                    window.location.href = "/pax";
                }
            });
        }   
    });

    $(".delete-supplier").on("click",function(e){

        e.preventDefault();

        if(confirm("Are you Sure?"))
        {
            $target = $(e.target);
            const id = $target.attr("data-id");

            $.ajax({
                type : "Delete",
                url : "/supplier/delete/" + id,
                success : function(response)
                {
                    window.location.href = "/supplier";
                },

                error : function(err)
                {
                    window.location.href = "/supplier";
                }
            });
        }   
    });

    $(".delete-admin").on("click",function(e){
        e.preventDefault();

        if(confirm("Are you Sure?"))
        {
            $target = $(e.target);
            const id = $target.attr("data-id");
    
            $.ajax({
                type : "Delete",
                url : "/admin/delete/" + id,
                success : function(response)
                {
                    window.location.href = "/admin";
                },
    
                error : function(err)
                {
                    window.location.href = "/admin";
                }
            });      
        }
      
    });

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
});
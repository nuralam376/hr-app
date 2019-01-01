$(document).ready(function(){
    $(".delete-user").on("click",function(e){
        e.preventDefault();

        if(confirm("Are you Sure?"))
        {
            $target = $(e.target);
            const id = $target.attr("data-id");

            $.ajax({
                type : "Delete",
                url : "/user/delete/" + id,
                success : function(response)
                {
                    window.location.href = "/user";
                },

                error : function(err)
                {
                    window.location.href = "/user";
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
});
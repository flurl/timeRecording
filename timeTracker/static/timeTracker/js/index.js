$(document).ready(function() {
	$('#emp_number').on('input', function(e) {
		var err_div = $('#emp_error');
		var info_div = $('#emp_info');
		var emp_number = $(this).val();
		
		$.ajax({
	        url : '/timeTracker/employee_info_by_number/'+emp_number+'/', // the endpoint
	        type : "GET", // http method
	        //data : { the_post : $('#post-text').val() }, // data sent with the post request
	
	        // handle a successful response
	        success : function(json) {
	        	var emp = $.parseJSON(json)[0];
	        	err_div.addClass('hidden');
	        	info_div.removeClass('hidden');
	        	$('#emp_info_name').text(emp.fields.number + ' - ' + emp.fields.first_name + ' ' + emp.fields.last_name);
	        },
	
	        // handle a non-successful response
	        error : function(xhr,errmsg,err) {
	        	err_div.removeClass('hidden');
	        	info_div.addClass('hidden'); 
	            err_div.text('Unknown employee');
	            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
	        }
	    });

	});
})
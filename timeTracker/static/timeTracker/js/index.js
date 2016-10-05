var time_tracker = (function() {

	var current_emp = null;
	var current_shift = null;

	return {
		get_employee_info_by_number: function(emp_number) {
			var err_div = $('#emp_error');
			var info_div = $('#emp_info');
			var self = this;
			$.ajax({
		        url : '/timeTracker/employee_info_by_number/'+emp_number+'/', // the endpoint
		        type : "GET", // http method
		        cache: false,
		        //data : { the_post : $('#post-text').val() }, // data sent with the post request
		
		        // handle a successful response
		        success : function(json) {
		        	var emp = $.parseJSON(json)[0];
		        	self.current_emp = emp.pk;
		        	err_div.addClass('hidden');
		        	info_div.removeClass('hidden');
		        	$('#emp_info_name').text(emp.fields.number + ' - ' + emp.fields.first_name + ' ' + emp.fields.last_name);
		        	self.get_current_employee_shift(emp.pk);
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		        	self.current_emp = null;
		        	err_div.removeClass('hidden');
		        	info_div.addClass('hidden'); 
		            err_div.text('Unknown employee');
		            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
		        }
		    });
		},
		
		get_current_employee_shift: function(emp_id) {
			var self = this;
			$.ajax({
		        url : '/timeTracker/current_employee_shift/'+emp_id+'/', // the endpoint
		        type : "GET", // http method
		        cache: false,
		        //data : { the_post : $('#post-text').val() }, // data sent with the post request
		        
		        complete: self.setup_actions.bind(self),
		
		        // handle a successful response
		        success : function(json) {
		        	var shift = $.parseJSON(json)[0];
		        	self.current_shift = shift.pk;
		        	$('#emp_info_work_time').text(shift.fields.start);
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		        	self.current_shift = null;
		        	$('#emp_info_work_time').text('Not punched in');
		        }
		    });
		},
		
		setup_actions: function() {
			if (this.current_shift === null) {
				this.setup_punch_in_actions();
			} else {
				this.setup_punch_out_actions();
			}
		},
		
		setup_punch_in_actions: function() {
			var adiv = $('#actions');
			adiv.empty();
			adiv.append($('<h1>Punch in</h1>'));
			
			var now = $('<a>', {
				text: 'Now',
				href: '#',
				click: (function() {this.punch_in();}).bind(this)
			}).appendTo(adiv);
		},
		
		setup_punch_out_actions: function() {
			var adiv = $('#actions');
			adiv.empty();
			adiv.append($('<h1>Punch out</h1>'));
			
			var now = $('<a>', {
				text: 'Now',
				href: '#',
				click: (function() {this.punch_out();}).bind(this)
			}).appendTo(adiv);
		},
		
		punch_in: function(when) {
			var when = (typeof when !== 'undefined') ?  when : null;
			$.ajax({
		        url : '/timeTracker/punch_in/' + this.current_emp + '/' + (when === null ? '' : when + '/'), // the endpoint
		        type : "GET", // http method
		        cache: false,
		        //data : { the_post : $('#post-text').val() }, // data sent with the post request
		
		        // handle a successful response
		        success : function(response) {
		        	if (response !== 'OK') {
		        		alert('An error occurred. Please contact your admin!');
		        	} else {
		        		alert('Successfully punched in!');
		        		location.reload(true);
		        	}
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		        	alert('An error occurred. Please contact your admin!');
		        }
		    });
		},
		
		punch_out: function(when) {
			var when = (typeof when !== 'undefined') ?  when : null;
			$.ajax({
		        url : '/timeTracker/punch_out/'+ this.current_shift + '/' + (when === null ? '' : when + '/'), // the endpoint
		        type : "GET", // http method
		        cache: false,
		        //data : { the_post : $('#post-text').val() }, // data sent with the post request
		
		        // handle a successful response
		        success : function(response) {
		        	if (response !== 'OK') {
		        		alert('An error occurred. Please contact your admin!');
		        	} else {
		        		alert('Successfully punched out!');
		        		location.reload(true);
		        	}
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		        	alert('An error occurred. Please contact your admin!');
		        }
		    });
		},
	};
})();

$(document).ready(function() {
	var emp_number_input = $('#emp_number');
	emp_number_input.val(''); 
	emp_number_input.on('input', function(e) {
		var emp_number = $(this).val();
		time_tracker.get_employee_info_by_number(emp_number);
	});
})
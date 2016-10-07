var time_tracker = (function() {

	var current_emp = null;
	var current_shift = null;
	// the time from the server on which our calculations are based
	// should be updated regularly for precision
	var current_date = null;
	var reload_timer = null;
	
	var userLocale = window.navigator.userLanguage || window.navigator.language;
	var defaultDateFormat = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };

	return {
	
		setup: function() {
			var emp_number_input = $('#emp_number');
			emp_number_input.val(''); 
			emp_number_input.focus();
			emp_number_input.on('input', function(e) {
				time_tracker.set_reload_timer();
				var emp_number = $(this).val();
				time_tracker.get_employee_info_by_number(emp_number);
			});
			emp_number_input.on('keypress', function(e) {
				if (e.which == 13) {
					time_tracker.set_reload_timer();
					time_tracker.on_enter_pressed();
				}
			});
			this.sync_time();
			this.set_reload_timer();
		},
		
		set_reload_timer: function() {
			if (time_tracker.reload_timer) clearTimeout(time_tracker.reload_timer);
			time_tracker.reload_timer = setTimeout(function() { location.reload(true); }, 60000);
		},
		
		sync_time: function() {
			var self = this;
			$.ajax({
		        url : '/timeTracker/server_time/', // the endpoint
		        type : "GET", // http method
		        cache: false,
		        
		        complete: function() { setTimeout(time_tracker.sync_time, 5000)},
		        
		        success : function(response) {
		        	self.current_date = new Date(parseInt(response)*1000);
		        	// TODO: is there a better way to determine the locale than the language?
		        	$('#clock').text(self.current_date.toLocaleString(
		        										window.navigator.userLanguage || window.navigator.language, 
		        										{ year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
		        										)
		        					);
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		        	console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
		        	$('#clock').text('Couldn\'t sync time');
		        }
		    });
		},
	
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
		            //console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
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
			
			let next_quarter_hour = new Date(this.current_date.getTime());
			var minutes = (parseInt((next_quarter_hour.getMinutes() / 15)) + 1) * 15;
			if (minutes >= 60) {
				minutes = 0;
				next_quarter_hour.setHours(next_quarter_hour.getHours()+1);
			}
			next_quarter_hour.setMinutes(minutes);
			next_quarter_hour.setSeconds(0);
			
			for (var i=0; i<3; i++) {
				let datetime=new Date(next_quarter_hour.getTime());
				datetime.setMinutes(datetime.getMinutes()+15*i);
				var nowPlus = $('<a>', {
					text: datetime.toLocaleString(userLocale, {hour: '2-digit', minute: '2-digit' }),
					href: '#',
					click: (function() {this.punch_in(datetime);}).bind(this)
				}).appendTo(adiv);
			}
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
		        url : '/timeTracker/punch_in/' + this.current_emp + '/' + (when === null ? '' : when.getTime()/1000 + '/'), // the endpoint
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
		        url : '/timeTracker/punch_out/'+ this.current_shift + '/' + (when === null ? '' : when.getTime()/1000 + '/'), // the endpoint
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
		        	console.log(xhr.status + ": " + xhr.responseText);
		        	alert('An error occurred. Please contact your admin!');
		        }
		    });
		},
		
		on_enter_pressed: function() {
			if (this.current_emp != null) {
				if (this.current_shift !== null) {
					this.punch_out();
				} else {
					this.punch_in();
				}
			}
		},
	};
})();

$(document).ready(function() {
	time_tracker.setup();
})
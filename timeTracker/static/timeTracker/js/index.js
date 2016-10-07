var timeTracker = (function() {

	var currentEmp = null;
	var currentShift = null;
	// the time from the server on which our calculations are based
	// should be updated regularly for precision
	var currentDate = null;
	var reloadTimer = null;
	
	// TODO: is there a better way to determine the locale than the language?
	var userLocale = window.navigator.userLanguage || window.navigator.language;
	var defaultDatetimeFormat = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
	var defaultTimeFormat = { hour: '2-digit', minute: '2-digit' };

	return {
		
		setup: function() {
			var empNumberInput = $('#emp_number');
			empNumberInput.val(''); 
			empNumberInput.focus();
			
			empNumberInput.on('input', function(e) {
				timeTracker.setReloadTimer();
				var empNumber = $(this).val();
				timeTracker.getEmployeeInfoByNumber(empNumber);
			});
			empNumberInput.on('keypress', function(e) {
				if (e.which == 13) {
					timeTracker.setReloadTimer();
					timeTracker.onEnterPressed();
				}
			});
			this.syncTime();
			this.setReloadTimer();
		},
		
		setReloadTimer: function() {
			if (timeTracker.reloadTimer) clearTimeout(timeTracker.reloadTimer);
			timeTracker.reloadTimer = setTimeout(function() { location.reload(true); }, 60000);
		},
		
		syncTime: function() {
			var self = this;
			$.ajax({
		        url : '/timeTracker/server_time/', // the endpoint
		        type : "GET", // http method
		        cache: false,
		        
		        complete: function() { setTimeout(timeTracker.syncTime, 5000)},
		        
		        success : function(response) {
		        	self.currentDate = new Date(parseInt(response)*1000);
		        	$('#clock').text(self.currentDate.toLocaleString(userLocale, defaultDatetimeFormat));
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		        	console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
		        	$('#clock').text('Couldn\'t sync time');
		        }
		    });
		},
	
		getEmployeeInfoByNumber: function(empNumber) {
			var errDiv = $('#emp_error');
			var infoDiv = $('#emp_info');
			var self = this;
			$.ajax({
		        url : '/timeTracker/employee_info_by_number/'+empNumber+'/', // the endpoint
		        type : "GET", // http method
		        cache: false,
		        //data : { the_post : $('#post-text').val() }, // data sent with the post request
		
		        // handle a successful response
		        success : function(json) {
		        	var emp = $.parseJSON(json)[0];
		        	self.currentEmp = emp.pk;
		        	errDiv.addClass('hidden');
		        	infoDiv.removeClass('hidden');
		        	$('#emp_info_name').text(emp.fields.number + ' - ' + emp.fields.first_name + ' ' + emp.fields.last_name);
		        	self.getCurrentEmployeeShift(emp.pk);
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		        	self.currentEmp = null;
		        	errDiv.removeClass('hidden');
		        	infoDiv.addClass('hidden'); 
		            errDiv.text('Unknown employee');
		            //console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
		        }
		    });
		},
		
		getCurrentEmployeeShift: function(empId) {
			var self = this;
			$.ajax({
		        url : '/timeTracker/current_employee_shift/'+empId+'/', // the endpoint
		        type : "GET", // http method
		        cache: false,
		        //data : { the_post : $('#post-text').val() }, // data sent with the post request
		        
		        complete: self.setupActions.bind(self),
		
		        // handle a successful response
		        success : function(json) {
		        	var shift = $.parseJSON(json)[0];
		        	self.currentShift = shift.pk;
		        	$('#emp_info_work_time').text(new Date(shift.fields.start).toLocaleString(userLocale, defaultDatetimeFormat));
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		        	self.currentShift = null;
		        	$('#emp_info_work_time').text('Not punched in');
		        }
		    });
		},
		
		getEmployeeFOEs: function() {
			var self = this;
			$.ajax({
		        url : '/timeTracker/fields_of_employment/' + self.currentEmp + '/', // the endpoint
		        type : "GET", // http method
		        cache: false,
		        //data : { the_post : $('#post-text').val() }, // data sent with the post request
		
		        // handle a successful response
		        success : function(json) {
		        	var FOEs = $.parseJSON(json);
		        	var adiv = $('#action_buttons');
		        	var select = $('<select>', {id: 'foe_select'})
		        	FOEs.forEach(function(foe) {
		        		select.append($('<option>', {value: foe.pk}).text(foe.fields.name));
		        	})
		        	adiv.prepend(select);
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		        	alert('Error: No field of employment for employee found.')
		        	location.reload(true);
		        }
		    });
		},
		
		setupActions: function() {
			if (this.currentShift === null) {
				this.setupPunchInActions();
			} else {
				this.setupPunchOutActions();
			}
		},
		
		setupPunchInActions: function() {
			$('#actions').removeClass('punch_out').addClass('punch_in');
		
			var adiv = $('#action_header');
			adiv.empty();
			adiv.append($('<h1>Punch in</h1>'));
			
			adiv = $('#action_buttons');
			adiv.empty();
			
			var now = $('<a>', {
				text: 'Now',
				href: '#',
				click: (function() {this.punchIn();}).bind(this)
			}).appendTo(adiv);
			
			let nextQuarterHour = new Date(this.currentDate.getTime());
			var minutes = (parseInt((nextQuarterHour.getMinutes() / 15)) + 1) * 15;
			if (minutes >= 60) {
				minutes = 0;
				nextQuarterHour.setHours(nextQuarterHour.getHours()+1);
			}
			nextQuarterHour.setMinutes(minutes);
			nextQuarterHour.setSeconds(0);
			
			for (var i=0; i<3; i++) {
				let datetime=new Date(nextQuarterHour.getTime());
				datetime.setMinutes(datetime.getMinutes()+15*i);
				var nowPlus = $('<a>', {
					text: datetime.toLocaleString(userLocale, defaultTimeFormat),
					href: '#',
					click: (function() {this.punchIn(datetime);}).bind(this)
				}).appendTo(adiv);
			}
			
			this.getEmployeeFOEs();
		},
		
		setupPunchOutActions: function() {
			$('#actions').removeClass('punch_in').addClass('punch_out');
		
			var adiv = $('#action_header');
			adiv.empty();
			adiv.append($('<h1>Punch out</h1>'));
			
			adiv = $('#action_buttons');
			adiv.empty();
			
			var now = $('<a>', {
				text: 'Now',
				href: '#',
				click: (function() {this.punchOut();}).bind(this)
			}).appendTo(adiv);
		},
		
		punchIn: function(when) {
			var when = (typeof when !== 'undefined') ?  when : null;
			var foeId = $('#foe_select').val();
			$.ajax({
		        url : '/timeTracker/punch_in/' + this.currentEmp + '/' + foeId + '/' + (when === null ? '' : when.getTime()/1000 + '/'), // the endpoint
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
		
		punchOut: function(when) {
			var when = (typeof when !== 'undefined') ?  when : null;
			$.ajax({
		        url : '/timeTracker/punch_out/'+ this.currentShift + '/' + (when === null ? '' : when.getTime()/1000 + '/'), // the endpoint
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
		
		onEnterPressed: function() {
			if (this.currentEmp != null) {
				if (this.currentShift !== null) {
					this.punchOut();
				} else {
					this.punchIn();
				}
			}
		},
	};
})();

$(document).ready(function() {
	timeTracker.setup();
})

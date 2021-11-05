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
	var punchInOngoing = false;
	var punchOutOngoing = false;
	var unfinishedEmployeeInfoRequests = 0;
	
	function pad(num, size) {
	    var s = num+"";
	    while (s.length < size) s = "0" + s;
	    return s;
	}
	
	function shiftWithinTimeLimits() {
		// a valid shift has to have a positive duration not more than 12 hours
		var duration = currentShift.duration();
		var maxHours = 12*60*60;
		return (duration < maxHours && duration > 0)
	}

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
		    unfinishedEmployeeInfoRequests++;
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
		        	self.currentEmp = {'id':emp.pk, 'number': emp.fields.number};
		        	errDiv.addClass('hidden');
		        	infoDiv.removeClass('hidden');
		        	$('#emp_info_name').text(emp.fields.number + ' - ' + emp.fields.first_name + ' ' + emp.fields.last_name);
		        	self.getCurrentEmployeeShift(emp.pk);
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		            unfinishedEmployeeInfoRequests--;
		        	self.currentEmp = null;
		        	errDiv.removeClass('hidden');
		        	infoDiv.addClass('hidden'); 
		        	$('#action_header').empty();
		        	$('#action_buttons').empty();
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
		            unfinishedEmployeeInfoRequests--;
		        	var shift = $.parseJSON(json)[0];
		        	currentShift = shift;
		        	//add a function to calculate the current shift duration
		        	//returns the duration in seconds
		        	currentShift.duration = function() {
			        	return Math.round((new Date().getTime() - new Date(this.fields.start).getTime())/1000);
		        	}
		        	var shiftStart = new Date(shift.fields.start);
		        	var timeDiffInSecs = currentShift.duration();
		        	var durationHours = Math.floor(timeDiffInSecs/3600)
		        	var durationMinutes = Math.floor(timeDiffInSecs/60)%60;
		        	$('#shift_start').text(shiftStart.toLocaleString(userLocale, defaultDatetimeFormat));
		        	if (timeDiffInSecs > 0) {
			        	$('#shift_duration').text(pad(durationHours, 2) + ':' + pad(durationMinutes , 2) + 'h')
			        						.css('font-size', durationHours > 6 ? (Math.min(durationHours - 6, 6)*100)+'%' : '100%');
			        } else {
			        	$('#shift_duration').text('Shift starts in the future').css('font-size', '100%');
			        }
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		            unfinishedEmployeeInfoRequests--;
		        	currentShift = null;
		        	$('#shift_start').text('Not punched in');
		        	$('#shift_duration').empty().css('font-size', '100%');
		        }
		    });
		},
		
		getEmployeeFOEs: function() {
			var self = this;
			$.ajax({
		        url : '/timeTracker/fields_of_employment/' + self.currentEmp.id + '/', // the endpoint
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
		        	timeTracker.errorMessage('Error: No field of employment for employee found.')
		        	location.reload(true);
		        }
		    });
		},

		getMessages: function() {
			var self = this;
			$.ajax({
		        url : '/timeTracker/messages/' + self.currentEmp.id + '/', // the endpoint
		        type : "GET", // http method
		        cache: false,
		        //data : { the_post : $('#post-text').val() }, // data sent with the post request
		
		        // handle a successful response
		        success : function(json) {
		        	var messages = $.parseJSON(json);
		        	var mdiv = $('#messages');
		        	
		        	messages.forEach(function(m) {
						var p = $('<p>');
						p.html(m.text);
						mdiv.prepend(p);
						var confirmDiv = $('<div>');
						var confirmP = $('<p>').html('Gelesen und zur Kenntnis genommen').appendTo(confirmDiv);
						var chkbox = $('<input>', {type: 'checkbox'}).appendTo(confirmDiv);
						mdiv.append(confirmDiv);
		        	})
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		        	timeTracker.errorMessage('Error: No field of employment for employee found.')
		        	location.reload(true);
		        }
		    });
		},
		
		setupActions: function() {
			if (currentShift === null) {
				this.setupPunchInActions();
			} else {
				this.setupPunchOutActions();
			}
		},
		
		setupPunchInActions: function() {
			$('#actions').removeClass('punch_out').addClass('punch_in');
		
			var adiv = $('#action_header');
			adiv.empty();
			var h = $('<h1></h1>');
			$('<a>', {
				text: 'Punch In',
				href: '#',
				click: (function() {this.punchIn();}).bind(this)
			}).appendTo(h);
			adiv.append($(h));
			
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
			
			this.getMessages()
			this.getEmployeeFOEs();
			
			$('<a>', {
				text: 'Punch In forgotten',
				href: '#',
				class: 'small',
				click: (function() {this.punchInForgotten();}).bind(this)
			}).appendTo(adiv);
		},
		
		setupPunchOutActions: function() {
		    var shiftIsValid = shiftWithinTimeLimits();
			$('#actions').removeClass('punch_in').addClass('punch_out');
		
			var adiv = $('#action_header');
			adiv.empty();
			if (shiftIsValid) {
			    var h = $('<h1></h1>');
			    $('<a>', {
					    text: 'Punch Out',
					    href: '#',
					    click: (function() {this.punchOut();}).bind(this)
				    }).appendTo(h);
			    adiv.append(h);
			}
			
			adiv = $('#action_buttons');
			adiv.empty();
			
			// don't display the now button for shifts > 12h or if it starts in the future
			// because in that case, it has to be marked as 'forgotten'
			if (shiftIsValid) {
				$('<a>', {
					text: 'Now',
					href: '#',
					click: (function() {this.punchOut();}).bind(this)
				}).appendTo(adiv);
			}
			
			$('<a>', {
				text: 'Punch Out forgotten',
				href: '#',
				class: (shiftIsValid) ? 'small' : '',
				click: (function() {this.punchOutForgotten();}).bind(this)
			}).appendTo(adiv);
			
		},
		
		punchIn: function(when) {
		    if (unfinishedEmployeeInfoRequests || punchInOngoing) return;
		    if ($('#emp_number').val() != this.currentEmp.number) {
		        $('#emp_number').trigger('input');
		        return;
		    }
		    punchInOngoing = true;
			var when = (typeof when !== 'undefined') ?  when : null;
			var foeId = $('#foe_select').val();
			$.ajax({
		        url : '/timeTracker/punch_in/' + this.currentEmp.id + '/' + foeId + '/' + (when === null ? '' : when.getTime()/1000 + '/'), // the endpoint
		        type : "GET", // http method
		        cache: false,
		        //data : { the_post : $('#post-text').val() }, // data sent with the post request
		
		        // handle a successful response
		        success : function(response) {
		            punchInOngoing = false;
		        	if (response !== 'OK') {
		        		alert('An error occurred. Please contact your admin!');
		        	} else {
		        		alert('Successfully punched in!');
		        		location.reload(true);
		        	}
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		            punchInOngoing = false;
		        	timeTracker.errorMessage('An error occurred. Please contact your admin!');
		        }
		    });
		},
		
		punchOut: function(when) {
		    if (unfinishedEmployeeInfoRequests || punchOutOngoing) return false;
		    if ($('#emp_number').val() != this.currentEmp.number) {
		        $('#emp_number').trigger('input');
		        return;
		    }
		    punchOutOngoing = true;
			// if shifts > 12h or starts in the future mark as 'forgotten'
			if (!shiftWithinTimeLimits()) { 
				this.punchOutForgotten();
				return; 
			}
			
			var when = (typeof when !== 'undefined') ?  when : null;
			$.ajax({
		        url : '/timeTracker/punch_out/'+ currentShift.pk + '/' + (when === null ? '' : when.getTime()/1000 + '/'), // the endpoint
		        type : "GET", // http method
		        cache: false,
		        //data : { the_post : $('#post-text').val() }, // data sent with the post request
		
		        // handle a successful response
		        success : function(response) {
		            punchOutOngoing = false;
		        	if (response !== 'OK') {
		        		alert('An error occurred. Please contact your admin!');
		        	} else {
		        		alert('Successfully punched out!');
		        		location.reload(true);
		        	}
		        },
		
		        // handle a non-successful response
		        error : function(xhr,errmsg,err) {
		            punchOutOngoing = false;
		        	console.log(xhr.status + ": " + xhr.responseText);
		        	timeTracker.errorMessage('An error occurred. Please contact your admin!');
		        }
		    });
		},
		
		onEnterPressed: function() {
			if (this.currentEmp != null) {
				if (currentShift !== null) {
					this.punchOut();
				} else {
					this.punchIn();
				}
			}
		},
		
		punchInForgotten: function() {
			var msg = 'A new shift will be created and marked as invalid. Your negligence will be ' 
						+ 'recorded and you\'ll have to explain yourself to your boss.\n'
						+ 'The punishment devices are warmed up!';
			if (confirm(msg)) {
				$.ajax({
			        url : '/timeTracker/punch_in_forgotten/'+ this.currentEmp.id + '/', // the endpoint
			        type : "GET", // http method
			        cache: false,
			        success : function(response) {
			        	if (response !== 'OK') {
			        		alert('An error occurred. Please contact your admin!');
			        	} else {
			        		alert('Successfully punched in!');
			        		location.reload(true);
			        	}
			        },
			        error : function(xhr,errmsg,err) {
			        	console.log(xhr.status + ": " + xhr.responseText);
			        	timeTracker.errorMessage('An error occured! Please try again. If the error persists contact your admin.');
			        }
			    });
			}
		},
		
		punchOutForgotten: function() {
			var msg = 'The open shift will be closed and marked as invalid. Your negligence will be ' 
						+ 'recorded and you\'ll have to explain yourself to your boss.\n'
						+ 'The punishment devices are warmed up!';
			if (confirm(msg)) {
				$.ajax({
			        url : '/timeTracker/punch_out_forgotten/'+ currentShift.pk + '/', // the endpoint
			        type : "GET", // http method
			        cache: false,
			        success : function(response) {
			        	if (response !== 'OK') {
			        		alert('An error occurred. Please contact your admin!');
			        	} else {
			        		alert('Successfully punched out!');
			        		location.reload(true);
			        	}
			        },
			        error : function(xhr,errmsg,err) {
			        	console.log(xhr.status + ": " + xhr.responseText);
			        	timeTracker.errorMessage('An error occurred. Please contact your admin!');
			        }
			    });
			}
		},
		
		errorMessage: function(msg) {
		    document.body.classList.add('error');
		    alert(msg);
		    document.body.classList.remove('error');
		}
	};
})();

$(document).ready(function() {
	timeTracker.setup();
})

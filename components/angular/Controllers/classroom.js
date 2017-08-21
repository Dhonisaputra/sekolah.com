window.mainApp
.controller('home_controller', function($scope, $sse) {	
	$scope.message = "Click on the hyper link to view the students list.";
})

.controller('administrator_dashboard', function($scope, $routeParams, $rootScope, $sse){

	$scope.get_schedules = function()
	{
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_schedule_today')
		.done(function(res){
			console.log(res)
			if(res.code == 200)
			{
				console.log(res)
					$scope.schedules = res.data
					var now = moment();
					$.each($scope.schedules , function(a,b){
						var held_at = moment(b.held_at,'HH:mm:ss');
						$scope.schedules[a].countdown = moment(b.held_at,'HH:mm:ss').fromNow();
						$scope.schedules[a].inFifteenMinutes = held_at.diff(now,'minutes') < 15? true : false ;
					})
					$scope.$apply();
			}

		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
	// $scope.get_schedules();

	$sse.schedule_today()
	.onmessage = function(event) {
        res = JSON.parse(event.data)
		$scope.todays = res
		var now = moment();
		$.each($scope.todays , function(a,b){
			var held_at = moment(b.held_at,'HH:mm:ss');
			$scope.todays[a].countdown = moment(b.held_at,'HH:mm:ss').fromNow();
			$scope.todays[a].inFifteenMinutes = held_at.diff(now,'minutes') < 15? true : false ;
		})
		$scope.$apply();
    };

	$scope.countdown_schedule = function(data,$index)
	{
		$scope.schedules[$index].countdown = moment(data.held_at,'HH:mm:ss').unix()*1000;
		var timer = setInterval(function(){
			$scope.schedules[$index].countdown = moment(data.held_at,'HH:mm:ss').unix()*1000
	        // $scope.schedules[$index].countdown-1000;
			// $scope.schedules[$index].countdown = moment($scope.schedules[$index].countdown).format('HH:mm:ss');
	        // $scope.$apply();
	    }, 1000);  
	}

	$scope.create_new_session = function(schedule)
	{
			console.log(schedule)
		if(schedule.inFifteenMinutes && Array.isArray(schedule.session_active))
		{
			var data = 
			{
				schedule: schedule.id,
			}
			
			Snackbar.manual({message: 'Membuat sesi kelas baru. Silahkan tunggu!', spinner:true});
			$.post('http://matrik.com/server/matrik_si_mapel/new_session', data)
			.done(function(res){
				res = JSON.isJSON(res)? JSON.parse(res) : res;
				Snackbar.show('Sesi telah dibuat, mengalihkan alamat ke halaman sesi.')
				$.post('http://matrik.com/server/matrik_si_mapel/sms_konfirmasi_notification', {schedule: schedule.id})
				.done(function(resSms){
					console.log(resSms)
				})

				// window.location.href ='#/classroom/open/'+schedule.class_code+'/schedule/'+res.data.id_schedule+'/session/'+res.data.id_session

			})
		}
	}
})
.controller('users.index', function($scope, F_Config, $rootScope){
	
})
.controller('user.student.index', function($scope, F_Config, $rootScope){
	$scope.userdata = {}
	$scope.students = []
	ngeblog.api('users/data/level','GET', {},{version:'v2'})
	.done(function(res){
		console.log(res)
		if(res.code == 200)
		{
			$scope.userlevel = res.data;
			$scope.$apply();
		}
	})

	$scope.add_new_user = function()
	{
		console.log($scope.userdata)
		var data = $scope.userdata;
		ngeblog.api('users/new','POST', {
			username: data.name,
			password: data.password,
			email: data.email,
			userlevel: 2,
		},{version:'v2'})
		.done(function(res){
			console.log(res)
			if(res.code == 200)
			{
				Snackbar.show('User has been created');
				$scope.get_students({limit:200});

				$.each(data, function(a,b){
					$scope.userdata[a] = '';
				})
				$scope.$apply();
			}else
			{
				swal('error occured', 'error on create user', 'error');
			}
		})
	}
	$scope.get_students = function(data)
	{
		data = $.extend({},data)
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_students', data)
		.done(function(res){
			console.log(res)
			$scope.students = res.data
			$scope.$apply();

		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
	$scope.get_students({limit:200});
})
.controller('subject.new', function($scope, F_Config, $rootScope){
	$scope.subject = '';
	$scope.save_subject = function()
	{
		var data = 
		{
			name: $scope.subject,
		}
		Snackbar.manual({message: 'Membuat subject baru. Silahkan tunggu!'});
		$.post('http://matrik.com/server/matrik_si_mapel/new_subject', data)
		.done(function(res){
			Snackbar.show('matapelajaran telah dibuat.')
			$scope.subject = '';
			res = JSON.isJSON(res)? JSON.parse(res) : res;
			$scope.$apply();
			// console.log(res)
			// window.location.href ='#/classroom/open/'+schedule.class_code+'/schedule/'+res.data.id_schedule+'/session/'+res.data.id_session

		})
	}
})
.controller('users.add', function($scope, F_Config, $rootScope){
	$scope.userdata = {}
	ngeblog.api('users/data/level','GET', {},{version:'v2'})
	.done(function(res){
		console.log(res)
		if(res.code == 200)
		{
			$scope.userlevel = res.data;
			$scope.$apply();
		}
	})

	$scope.add_new_user = function()
	{
		console.log($scope.userdata)
		var data = $scope.userdata;
		ngeblog.api('users/new','POST', {
			username: data.name,
			password: data.password,
			email: data.email,
			userlevel: data.userlevel,
		},{version:'v2'})
		.done(function(res){
			console.log(res)
			if(res.code == 200)
			{
				Snackbar.show('User has been created');
				$.each(data, function(a,b){
					$scope.userdata[a] = '';
				})
				$scope.$apply();
			}else
			{
				swal('error occured', 'error on create user', 'error');
			}
		})
	}
})
.controller('users.login', function($scope, $config,F_Config, $rootScope, $authorize,$location){
	$scope.login = function()
	{
		// console.log($scope.login_components)
		var res = !$config.double_server ? $.post($config.server_url('users/login?dblServer=0'), $scope.login_components) : window.node.send('owner/login', $scope.login_components);
		res.done(function(res){
			res = !$config.double_server ? JSON.parse(res) : res;
			
			switch(res.code)
			{
				case 200:
					$authorize.set_auth_data(res);
					$scope.$apply();
					window.location.href = '#/home';
					break;
				case 404: 
					$scope.alert.login = res.message;
					$scope.$apply();
					break;
				case 500: 
					$scope.alert.login = res.message;
					$scope.$apply();
					break;
			}
		})
		res.fail(function(res){
			console.log(res)
		})
	}
})
.controller('controller.administrator.logout', function($scope, $owner, $routeParams, F_Config){
    $.post(F_Config.server_url('users/logout'))
    .done(function(res){
		$owner.reset_credential()
		window.location.reload();
    })
    .fail(function(res){
    	console.log(res);
    })
})
.controller('classroom.index', function($scope, F_Config, $rootScope){
	$scope.classrooms = []
	$scope.get_classroom = function()
	{
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_class')
		.done(function(res){
			console.log(res)
			if(res.code == 200)
			{
				if(res.data.length < 1)
				{
				}else
				{
					console.log(res)
					$scope.classrooms = res.data
					$scope.$apply();
				}
			}

		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
	$scope.get_classroom();
})
.controller('classroom.new', function($scope, $location, $rootScope){
	$scope.teachers = [];
	$scope.subjects = [];
	$scope.classroom_data = {teacher:0, subject:0};
	ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_teacher',{limit:20})
	.done(function(res){
		res = JSON.isJSON(res)? JSON.parse(res) : res;
		$scope.teachers = res.data;
		$scope.$apply();
	})
	ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_subjects')
	.done(function(res){
		res = JSON.isJSON(res)? JSON.parse(res) : res;
		console.log(res)
		$scope.subjects = res.data;
		$scope.$apply();
	})

	$('#classdate').datetimepicker({
			minDate: 0,
			timepicker:false,
		  	format:'m/d/Y',
		  	formatDate: 'm/d/Y',
		});
	$('#classtime').datetimepicker({
	  	datepicker:false,
	  	format:'H:i',
	  	step: 15,
	  	formatTime: 'H:i',
	});
	$scope.add_new_classroom = function()
	{
		var data = {
			teacher: $scope.classroom_data.teacher,
			date: $scope.classroom_data.date,
			time: $scope.classroom_data.time,
			subject: $scope.classroom_data.subject,
			classname: $scope.classroom_data.classname,
			created_by: Cookies.getJSON('admin').sess.id_user,
		}

		if(!data.teacher || !data.date || !data.time || !data.subject || !data.classname || !data.created_by)
		{
			swal('Error occured', 'Requirement data not filled, please check your data.', 'error');
			return false;
		}
			Snackbar.manual({
				message: 'Creating Class. Please wait!',
				spinner: true
			})
		
		$.post('http://matrik.com/server/matrik_si_mapel/new_class', data)
		.done(function(res){
			res = JSON.isJSON(res)? JSON.parse(res) : res
			console.log(res)

			if(res.code == 200)
			{

				window.location.href = '#/classroom/open/'+res.data.code;
				Snackbar.show('Class successfully created!')
			}

		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
})
.controller('classroom.schedule.add', function($scope, $location, $routeParams){
	$scope.teachers = [];
	$scope.subjects = [];
	$scope.detail_class = 0;
	$scope.classroom_data = {teacher:0, subject:0};
	$scope.classroom_data.capacity = 5;
	ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_teacher',{limit:20})
	.done(function(res){
		res = JSON.isJSON(res)? JSON.parse(res) : res;
		$scope.teachers = res.data;
		$scope.$apply();
	})
	
	$('#classdate').datetimepicker({
			minDate: 0,
			timepicker:false,
		  	format:'m/d/Y',
		  	formatDate: 'm/d/Y',
		});
	$('#classtime').datetimepicker({
	  	datepicker:false,
	  	format:'H:i',
	  	step: 15,
	  	formatTime: 'H:i',
	});

	$scope.get_detail_class = function()
	{
		data = {code: $routeParams['code'],fields: 'id,name,teacher,class_created_at,code,capacity,is_over,participants'}
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_detail_class', data)
		.done(function(res){
			console.log(res)
			if(res.code == 200)
			{
				if(res.data.length < 1)
				{
					swal({title:'Class not Found', text:'We cannot found the class. please check your class code', type:'error' }, function(click){
						if(click)
						{
							window.location.href = '#/classroom';
						}
					})
				}else
				{
					$scope.detail_class = res.data[0]
					$scope.$apply();
				}
			}

		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
	$scope.get_detail_class();

	$scope.add_new_schedule = function()
	{
		var data = {
			teacher: $scope.classroom_data.teacher,
			date: $scope.classroom_data.date,
			time: $scope.classroom_data.time,
			id: $scope.detail_class.id,
			capacity: $scope.classroom_data.capacity,
		}

		console.log(data)

		if(!data.teacher || !data.date || !data.time || !data.id)
		{
			swal('Error occured', 'Requirement data not filled, please check your data.', 'error');
			return false;
		}

		Snackbar.manual({
			message: 'Adding new Schedule. Please wait!',
			spinner: true
		})
		
		$.post('http://matrik.com/server/matrik_si_mapel/new_schedule', data)
		.done(function(res){
			res = JSON.isJSON(res)? JSON.parse(res) : res
			console.log(res)

			if(res.code == 200)
			{

				window.location.href = '#/classroom/open/'+$routeParams['code']+'/'+'schedule/'+res['data']['id']+'/add/participants'; // kalau panel schedule selesai, arahkan ke schedule
				Snackbar.show('Schedule successfully added!')
			}

		})
		.fail(function(){
				Snackbar.show('Error when added new schedule!')
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
})
.controller('classroom.detail', function($scope, $sse, $routeParams){
	$scope.student_template = "students_list.tmp";
	$scope.todays = [];
	$scope.detail_class = {};
	$scope.routeParams = $routeParams;
	$scope.students_can_be_added = {};
	$scope.set_student_template = function(temp)
	{
		$scope.student_template = temp;
		$scope.search_student_not_in_existed_list({id: $scope.detail_class.id});
	}
	$scope.is_schedule_under_minutes = function(data, minutes)
	{
		var held_at = moment(data.held_at, 'HH:mm:ss')
		var now = moment()
		return held_at.diff(now, 'minutes') <= minutes? true : false;
	}
	$scope.send_sms_attention_under = function(data)
	{
		
	}

	$scope.search_student_not_in_existed_list = function(data)
	{
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/search_student_not_in_exist_list', data)
		.done(function(res){
			if(res.code == 200)
			{
				$scope.students_can_be_added.data = res.data;
				$scope.students_can_be_added.length = Object.keys(res.data).length;
				$scope.$apply();
			}
		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
	$scope.get_detail_class = function()
	{
		data = {code: $routeParams['code']}
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_detail_class', data)
		.done(function(res){
			if(res.code == 200)
			{
				if(res.data.length < 1)
				{
					swal({title:'No Class Found', text:'We cannot found class. please check your class code', type:'error' }, function(click){
						if(click)
						{
							window.location.href = '#/classroom';
						}
					})
				}else
				{
					$scope.detail_class = res.data[0]
					$scope.$apply();
				}
			}

		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
	$scope.get_detail_class();

	$scope.start_class = function()
	{

	}
	$scope.get_today = function()
	{
		data = {
			where:{id_session: $routeParams['schedule'], is_today:1},
			fields: 'id,class,class_code,held_at,held_on,held_on_days,teacher,participants,capacity,is_today'
		}
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_schedules', data)
		.done(function(res){
				console.log(res)
			if(res.code == 200)
			{
				$scope.todays = res.data
				$scope.$apply();
			}

		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
	$sse.schedule_today()
	.onmessage = function(event) {
        res = JSON.parse(event.data)
        console.log(res)
		$scope.todays = res
		$scope.$apply();
        if(res.length > 0)
		{
		}
    };
})
.controller('classroom.schedule.session.detail', function($scope, $routeParams){
	$scope.materi = '';
	$scope.content = '';
	$scope.materi_list = [];
	$scope.detail_session = [];
	$scope.attendances = [];
	$scope.selected_materi = 0;
	$scope.routeParams = $routeParams;
	
	$scope.get_detail_class = function()
	{
		data = {
			where: {id_session: $routeParams['session']},
			fields: 'id_session,id_schedule,class,subject,teacher,session_started_at,attendances,participants,materi'
		}
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_session', data)
		.done(function(res){
				console.log(res)
			if(res.code == 200)
			{
				if(res.data.length < 1)
				{
					swal({title:'No Class Found', text:'We cannot found class. please check your class code', type:'error' }, function(click){
						if(click)
						{
							window.location.href = '#/classroom';
						}
					})
				}else
				{
					$scope.selected_materi = 0;
					$scope.detail_session = res.data[0]
					
					$scope.attendances = $scope.detail_session.attendances;
					$scope.materi_list = $scope.detail_session.materi
					var attendance_stu = $scope.attendances.map(function(res){ return res.id_student })
					$scope.detail_session.participants = $scope.detail_session.participants.filter(function(res){
						if(attendance_stu.indexOf(res.id_student) < 0)
						{
							return res;
						}
					})
					
					$scope.$apply();
				}
			}

		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
	$scope.add_materi = function()
	{
		console.log($scope)
		data = {
			session : $routeParams['session'],
			name : $scope.materi,
			created_by: Cookies.getJSON('admin').sess.id_user,
			content : $scope.content
		}
		$.post('http://matrik.com/server/matrik_si_mapel/new_materi', data)
		.done(function(res){
			console.log(res)
			$scope.get_detail_class();
			// $scope.search_student_not_in_existed_list({id: $scope.detail_class.id});
			$scope.materi = ''
			$scope.content = ''
			$scope.$apply();
		})
		
		
	}

	
	$scope.get_detail_class();

	$scope.add_materi_participants = function(student,studentIndex,materi)
	{
		if(parseInt(materi) < 1 )
		{
			swal('Error Occured', 'Please select properly the subject materi', 'error');
			return false;
		}
		var data = 
		{
			materi: materi,
			student: student.id_student
		}

		$.post('http://matrik.com/server/matrik_si_mapel/new_materi_participant', data)
		.done(function(res){
			ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_materi_participants', {where: {materi: materi}})
			.done(function(res){

				$scope.attendances.remove(studentIndex)
				var index = $scope.materi_list.map(function(resMateri){ return resMateri.id }).indexOf(materi);
				$scope.materi_list[index].participants = res.data;

				$scope.$apply();
			})
			// $scope.get_detail_class();
			// $scope.search_student_not_in_existed_list({id: $scope.detail_class.id});
		})
	}

	$scope.change_selected_materi = function(data, index)
	{
		var materi_participants = data.participants.map(function(res){return parseInt(res.id)});
		console.log(data,index, $scope.detail_session.attendances, materi_participants)
		
		$scope.attendances = $scope.detail_session.attendances.filter(function(res){
			if(materi_participants.indexOf(parseInt(res.id_student)) < 0)
			{
				return res;
			}
		})
	}

	$scope.absen_masuk = function(student,studentIndex)
	{
		Snackbar.manual({message:'menambahkan abses siswa, silahkan tunggu!', spinner:true})
		var data = 
		{
			session: $routeParams['session'],
			student: student.id_student
		}
		
		$.post('http://matrik.com/server/matrik_si_mapel/new_session_attendance', data)
		.done(function(res){
			Snackbar.show('Siswa telah diabsen')
			res = JSON.isJSON(res)? JSON.parse(res) : res;
			$scope.detail_session.participants.remove(studentIndex)
			$scope.get_detail_class();
			// $scope.attendances.push()

			$scope.$apply();
		})
	}
})
.controller('classroom.schedule.session.materi-participants', function($scope, $routeParams){
	$scope.materi = '';
	$scope.content = '';
	$scope.materi_list = [];
	$scope.detail_session = [];
	$scope.attendances = [];
	$scope.selected_materi = 0;
	$scope.routeParams = $routeParams;
	
	$scope.get_detail_class = function()
	{
		data = {
			where: {id_session: $routeParams['session']},
			fields: 'id_session,id_schedule,class,subject,teacher,session_started_at,attendances,participants,materi'
		}
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_session', data)
		.done(function(res){
				console.log(res)
			if(res.code == 200)
			{
				if(res.data.length < 1)
				{
					swal({title:'No Class Found', text:'We cannot found class. please check your class code', type:'error' }, function(click){
						if(click)
						{
							window.location.href = '#/classroom';
						}
					})
				}else
				{
					$scope.selected_materi = 0;
					$scope.detail_session = res.data[0]
					
					$scope.attendances = $scope.detail_session.attendances;
					$scope.materi_list = $scope.detail_session.materi
					var attendance_stu = $scope.attendances.map(function(res){ return res.id_student })
					$scope.detail_session.participants = $scope.detail_session.participants.filter(function(res){
						if(attendance_stu.indexOf(res.id_student) < 0)
						{
							return res;
						}
					})
					
					$scope.$apply();
				}
			}

		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
	$scope.add_materi = function()
	{
		console.log($scope)
		data = {
			session : $routeParams['session'],
			name : $scope.materi,
			created_by: Cookies.getJSON('admin').sess.id_user,
			content : $scope.content
		}
		$.post('http://matrik.com/server/matrik_si_mapel/new_materi', data)
		.done(function(res){
			console.log(res)
			$scope.get_detail_class();
			// $scope.search_student_not_in_existed_list({id: $scope.detail_class.id});
			$scope.materi = ''
			$scope.content = ''
			$scope.$apply();
		})
		
		
	}

	
	$scope.get_detail_class();

	$scope.add_materi_participants = function(student,studentIndex,materi)
	{
		if(parseInt(materi) < 1 )
		{
			swal('Error Occured', 'Please select properly the subject materi', 'error');
			return false;
		}
		var data = 
		{
			materi: materi,
			student: student.id_student
		}

		$.post('http://matrik.com/server/matrik_si_mapel/new_materi_participant', data)
		.done(function(res){
			ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_materi_participants', {where: {materi: materi}})
			.done(function(res){

				$scope.attendances.remove(studentIndex)
				var index = $scope.materi_list.map(function(resMateri){ return resMateri.id }).indexOf(materi);
				$scope.materi_list[index].participants = res.data;

				$scope.$apply();
			})
			// $scope.get_detail_class();
			// $scope.search_student_not_in_existed_list({id: $scope.detail_class.id});
		})
	}

	$scope.change_selected_materi = function(data, index)
	{
		var materi_participants = data.participants.map(function(res){return parseInt(res.id)});
		console.log(data,index, $scope.detail_session.attendances, materi_participants)
		
		$scope.attendances = $scope.detail_session.attendances.filter(function(res){
			if(materi_participants.indexOf(parseInt(res.id_student)) < 0)
			{
				return res;
			}
		})
	}

	$scope.absen_masuk = function(student,studentIndex)
	{
		Snackbar.manual({message:'menambahkan abses siswa, silahkan tunggu!', spinner:true})
		var data = 
		{
			session: $routeParams['session'],
			student: student.id_student
		}
		
		$.post('http://matrik.com/server/matrik_si_mapel/new_session_attendance', data)
		.done(function(res){
			Snackbar.show('Siswa telah diabsen')
			res = JSON.isJSON(res)? JSON.parse(res) : res;
			$scope.detail_session.participants.remove(studentIndex)
			$scope.get_detail_class();
			// $scope.attendances.push()

			$scope.$apply();
		})
	}
})
.controller('classroom.schedule.detail.index', function($scope, F_Config, $rootScope, $routeParams){
	$scope.detail_schedule = {};
	$scope.students = [];
	$scope.sessions = [];
	$scope.routeParams = $routeParams;
	$scope.get_detail_class = function()
	{
		data = {where:{id: $routeParams['schedule']}}
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_schedules', data)
		.done(function(res){
			if(res.code == 200)
			{
				if(res.data.length < 1)
				{
					swal({title:'Class not Found', text:'We cannot found the class. please check your class code', type:'error' }, function(click){
						if(click)
						{
							window.location.href = '#/classroom';
						}
					})
				}else
				{
					$scope.detail_schedule = res.data[0]
					$scope.$apply();
				}
			}

		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
	$scope.get_session = function()
	{
		data = {where:{id_session: $routeParams['schedule']}}
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_session', data)
		.done(function(res){
				console.log(res)
			if(res.code == 200)
			{
				$scope.sessions = res.data
				$scope.$apply();
			}

		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}

	
	$scope.get_detail_class();
	$scope.get_session();
})
.controller('classroom.schedule.detail.add.participants', function($scope,  $routeParams){
	$scope.detail_schedule = {};
	$scope.students = [];
	$scope.get_detail_class = function()
	{
		data = {where:{id: $routeParams['schedule']}}
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_schedules', data)
		.done(function(res){
			if(res.code == 200)
			{
				if(res.data.length < 1)
				{
					swal({title:'Class not Found', text:'We cannot found the class. please check your class code', type:'error' }, function(click){
						if(click)
						{
							window.location.href = '#/classroom';
						}
					})
				}else
				{
					$scope.detail_schedule = res.data[0]
					var participants_id = $scope.detail_schedule.participants.map(function(res){
						return res.id_student;
					})

					var data = {
						not_in: [
							['id', participants_id]
						],
						limit:100
					}
					$scope.get_students(data)
					$scope.$apply();
				}
			}

		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
	$scope.get_students = function(data)
	{
		data = $.extend({},data)
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/search_student_not_in_exist_list', data)
		.done(function(res){
			console.log(res)
			$scope.students = res.data
			$scope.$apply();

		})
		.fail(function(){
			swal('Error occured', 'There are error when creating classroom. please try again.', 'error')
		})
	}
	$scope.get_detail_class();

	$scope.add_to_schedule = function(student)
	{
		data = {schedule: $scope.detail_schedule.id, student: student.id}
		$.post('http://matrik.com/server/matrik_si_mapel/new_schedule_participant', data)
		.done(function(){
			$scope.get_detail_class();			
		})
	}
})
.controller('classroom.schedule.session.detail.student.rate', function($scope, F_Config, $rootScope, $routeParams){
	$scope.interest_rating = 0
	$scope.attitude_rating = 0
	$scope.activity_rating = 0
	$scope.problems = ''
	$scope.save_ratings = function()
	{
		Snackbar.manual({message:'menyimpang rating, Silahkan tunggu!', 'spinner':true})
		var data = {}
		data.interest_rating = $scope.interest_rating
		data.attitude_rating = $scope.attitude_rating
		data.activity_rating = $scope.activity_rating
		data.session = $routeParams.session
		data.student = $routeParams.student
		data.problems = $scope.problems
		data.from = Cookies.getJSON('admin').sess.id_user

		console.log(data)
		$.post('http://matrik.com/server/matrik_si_mapel/set_rating_session_student', data)
		.done(function(res){
			console.log(res);
			Snackbar.show('Rating telah disimpan!')
			// res = JSON.isJSON(res)? JSON.parse(res) : res;
			// $scope.detail_class.participants.remove(studentIndex)
			// $scope.get_detail_class();
			// $scope.attendances.push()

			$scope.$apply();
		})
	}
	$scope.watch_change_rating = function(model, event)
	{
		$scope[model] = $('#'+model).val();

	}

	$scope.session_detail = function()
	{
		var data = {where:{}}
		data.where.id_session = $routeParams.session;
		data.where.id_student = $routeParams.student;
		data.fields = 'id_session,id_student,student,activity_rate,interest_rate,attitude_rate,notes';
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_session_attendances',data)
		.done(function(res){
			if(res.code == 200 && res.data.length > 0)
			{
				$scope.data = res.data[0]
				$scope.problems = $scope.data.notes.replaceAll('<br />',"")
				if($scope.data.attitude_rate !== 0)
				{
					$scope.attitude_rating = $scope.data.attitude_rate.value
					for (var i = 0; i <= $scope.attitude_rating; i++) {
						$('[for="attitude_rating"] span.glyphicon:nth-child('+i+')').removeClass('glyphicon-star-empty').addClass('glyphicon-star')
					}
				}
				if($scope.data.interest_rate !== 0)
				{
					$scope.interest_rating = $scope.data.interest_rate.value
					for (var i = 0; i <= $scope.interest_rating; i++) {
						$('[for="interest_rating"] span.glyphicon:nth-child('+i+')').removeClass('glyphicon-star-empty').addClass('glyphicon-star')
					}
				}
				if($scope.data.activity_rate !== 0)
				{
					$scope.activity_rating = $scope.data.activity_rate.value
					for (var i = 0; i <= $scope.activity_rating; i++) {
						$('[for="activity_rating"] span.glyphicon:nth-child('+i+')').removeClass('glyphicon-star-empty').addClass('glyphicon-star')
					}
				}
				window.setTimeout(function(){
					$scope.$apply();
				},500)
			}else
			{
				swal('Student not found!', 'Please check again your data!', 'error');
				window.location.href = '#/classroom/open/'+$routeParams['code']+'/'+$routeParams['schedule']+'/'+$routeParams['session']
			}
		})
	}
	$scope.session_detail();
})
.controller('classroom.schedule.session.detail.teacher.rate', function($scope, F_Config, $rootScope, $routeParams){
	$scope.teacher_rate = 0
	$scope.critics = ''
	$scope.save_ratings = function()
	{
		var data = {}
		data.session = $routeParams.session
		data.teacher = $routeParams.teacher
		data.critics = $scope.critics
		data.teacher_rating = $scope.teacher_rate
		data.from = Cookies.getJSON('admin').sess.id_user

		console.log(data)
		$.post('http://matrik.com/server/matrik_si_mapel/set_rating_session_teacher', data)
		.done(function(res){
			console.log(res);
			// res = JSON.isJSON(res)? JSON.parse(res) : res;
			// $scope.detail_class.participants.remove(studentIndex)
			// $scope.get_detail_class();
			// $scope.attendances.push()

			$scope.$apply();
		})
	}
	$scope.watch_change_rating = function(model, event)
	{
		$scope[model] = $('#'+model).val();

	}

	$scope.session_detail = function()
	{
		var data = {where:{}}
		data.where.id_session = $routeParams.session;
		data.where.id_student = 3;
		data.fields = 'id_session,id_student,student,notes,notes_for_teacher,teacher_rate';
		ngeblog.url('http://matrik.com/server/matrik_si_mapel/get_session_attendances',data)
		.done(function(res){
			console.log(res)
			if(res.code == 200 && res.data.length > 0)
			{
				$scope.data = res.data[0]
				$scope.critics = !$scope.data.notes_for_teacher? '' : $scope.data.notes_for_teacher.replaceAll('<br />',"")
				if($scope.data.teacher_rate !== 0)
				{
					$scope.teacher_rate = $scope.data.teacher_rate.value
					for (var i = 0; i <= $scope.teacher_rate; i++) {
						$('[for="teacher_rate"] span.glyphicon:nth-child('+i+')').removeClass('glyphicon-star-empty').addClass('glyphicon-star')
					}
				}
				window.setTimeout(function(){
					$scope.$apply();
				},500)
			}else
			{
				swal('Student not found!', 'Please check again your data!', 'error');
				window.location.href = '#/classroom/open/'+$routeParams['code']+'/'+$routeParams['schedule']+'/'+$routeParams['session']
			}
		})
	}
	$scope.session_detail();
});




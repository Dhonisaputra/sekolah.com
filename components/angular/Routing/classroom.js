
window.mainApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
	.when('/', {
		title: 'Dashboard',
		templateUrl: '/components/templates/schedule/index.html',
		controller: 'administrator_dashboard',
		using_sidebar: true,
		need_login: true
	})
	.when('/home', {
		title: 'Dashboard',
		templateUrl: '/components/templates/classroom/dashboard/index.html',
		controller: 'administrator_dashboard',
		using_sidebar: true,
		need_login: true
	})
	.when('/users', {
		title: 'Dashboard',
		templateUrl: '/components/templates/administrator/users/index.html',
		controller: 'users.index',
		using_sidebar: true,
		need_login: true
	})
	.when('/users/add', {
		title: 'Dashboard',
		templateUrl: '/components/templates/administrator/users/add_users.html',
		controller: 'users.add',
		using_sidebar: true,
		need_login: true
	})
	.when('/classroom', {
		title: 'Classroom',
		templateUrl: '/components/templates/classroom/dashboard/index.html',
		controller: 'classroom.index',
		using_sidebar: true,
		need_login: true
	})
	.when('/subject/new', {
		title: 'Matapelajaran baru',
		templateUrl: '/components/templates/subject/new.html',
		controller: 'subject.new',
		using_sidebar: true,
		need_login: true
	})
	.when('/classroom/new', {
		title: 'New Classroom',
		templateUrl: '/components/templates/classroom/classroom.new.html',
		controller: 'classroom.new',
		using_sidebar: true,
		need_login: true
	})
	.when('/classroom/open/:code', {
		title: 'Detail Class',
		templateUrl: '/components/templates/classroom/classroom.detail.html',
		controller: 'classroom.detail',
		using_sidebar: true,
		need_login: true
	})
	.when('/classroom/open/:code/new_schedule', {
		title: 'Tambah jadwal',
		templateUrl: '/components/templates/classroom/schedule/classroom.schedule.add.html',
		controller: 'classroom.schedule.add',
		using_sidebar: true,
		need_login: true
	})
	.when('/classroom/open/:code/schedule/:schedule/session/:session', {
		title: 'Detail session',
		templateUrl: '/components/templates/classroom/schedule/session/classroom.schedule.session.html',
		controller: 'classroom.schedule.session.detail',
		using_sidebar: true,
		need_login: true
	})
	.when('/classroom/open/:code/schedule/:schedule/session/:session/materi/:materi', {
		title: 'Detail session',
		templateUrl: '/components/templates/classroom/schedule/session/classroom.schedule.session.materi.participants.html',
		controller: 'classroom.schedule.session.materi-participants',
		using_sidebar: true,
		need_login: true
	})
	.when('/classroom/open/:code/schedule/:schedule', {
		title: 'Detail session',
		templateUrl: '/components/templates/classroom/schedule/classroom.schedule.index.html',
		controller: 'classroom.schedule.detail.index',
		using_sidebar: true,
		need_login: true
	})
	.when('/classroom/open/:code/schedule/:schedule/add/participants', {
		title: 'Detail session',
		templateUrl: '/components/templates/classroom/schedule/classroom.schedule.add_participants.html',
		controller: 'classroom.schedule.detail.add.participants',
		using_sidebar: true,
		need_login: true
	})
	.when('/classroom/open/:code/schedule/:schedule/session/:session/student/rate/:student', {
		title: 'Rate',
		templateUrl: '/components/templates/classroom/schedule/session/classroom.schedule.session.student.rate.html',
		controller: 'classroom.schedule.session.detail.student.rate',
		using_sidebar: true,
		need_login: true
	})
	.when('/classroom/open/:code/schedule/:schedule/session/:session/student/rate/:teacher', {
		title: 'Rate',
		templateUrl: '/components/templates/classroom/schedule/session/classroom.schedule.session.teacher.rate.html',
		controller: 'classroom.schedule.session.detail.teacher.rate',
		using_sidebar: true,
		need_login: true
	})

	.when('/login', {
		title: 'Dashboard',
		templateUrl: '/components/templates/administrator/administrator.login.html',
		controller: 'users.login',
		using_sidebar: false,
		need_login: false
	})
	.when('/logout', {
		templateUrl: '/components/templates/administrator/administrator.logout.html',
		controller: 'controller.administrator.logout',
		need_login: true
	})
	.when('/students', {
		templateUrl: '/components/templates/administrator/users/classroom.user.student.index.html',
		controller: 'user.student.index',
		need_login: true
	})
	
	
	
	.otherwise('/error/404');
	/*.otherwise({
		redirectTo: function(){
			var cookies = Cookies.getJSON('user');
			if(cookies)
			{
				return (cookies.app_auth)? '/dashboard/post' : '/login'
			}else
			{
				return '/error/404'
			}
			
		}
	});*/
	// $locationProvider.html5Mode(true);
});


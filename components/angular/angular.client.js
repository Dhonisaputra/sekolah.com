var ngeblogApp = angular.module("mainApp", ['ngRoute','ngSanitize','ngMeta']);

ngeblogApp
.factory('F_Article', function($q){
    var $this = {};
    $this.get = function(params)
    {
    	params = $.extend({}, params);
    	var deferred = $q.defer();
    	ngeblog.initialize(URL.get().origin+'/');
		ngeblog.api('articles', 'GET', params)
		.done(function(res){
	console.log(res)
			deferred.resolve(res);
		})
		.fail(function(res){
			console.log(res)
		})
		return deferred.promise;
    }

    return $this;
})
ngeblogApp
.controller('home_controller', function($scope, article, ngMeta) {	
	$scope.articles = article
	ngMeta.setTitle('Homepage Ngeblog!', '');
	ngMeta.setTag('description', 'This is the description of angularjs ngeblog homepage shown in Google search results');
	ngMeta.setTag('og:description', 'This is the description of angularjs ngeblog homepage shown in Google search results');
	ngMeta.setTag('og:title', 'Homepage ngeblog');
	// ngMeta.setTag('og:image', article);
	$scope.title_encode = function(title)
	{
		title = make_slug(title);
		console.log(title)
		return encodeURIComponent(title)
	}
})
.controller('article_open', function($scope, article, ngMeta){
	console.log(article)
	$scope.article = article[0]
	var content = html_decode(article[0].content);
	content = String(content).substring(0, 100)
	ngMeta.setTitle(article[0].title, '');
	ngMeta.setTag('description', content);
	ngMeta.setTag('og:description', content);
	ngMeta.setTag('og:title', article[0].title);
	// $scope.article.content = 
});

ngeblogApp.config(function($routeProvider, $locationProvider, ngMetaProvider) {
	//Add a suffix to all page titles
	ngMetaProvider.useTitleSuffix(true);

	// On /home, the title would change to 
	// 'Home Page | Best Website on the Internet!'
	ngMetaProvider.setDefaultTitle('Index');
	ngMetaProvider.setDefaultTitleSuffix(' | Ngeblog Yuk!');
	ngMetaProvider.setDefaultTag('author', 'ngeblog Publisher');
	ngMetaProvider.setDefaultTag('og:type', 'Website');



	$routeProvider
		.when('/', {
			title: 'Home',
			templateUrl: 'pages/blog_dashboard.php',
			robots : 'follow,index',
			controller: 'home_controller',
			description: 'Home Article lorem ipsum blablabla...',
			meta: {
			'baja': 'hitam'
			},
			resolve: {
	            article: function(F_Article){
	            	return F_Article.get();
		        }
		    },
		})
		.when('/article/:id_article', {
			title: 'Articles',
			templateUrl: 'pages/article_open.php',
			robots : 'follow,index',
			controller: 'article_open',
			description: 'Open Article lorem ipsum blablabla...',
		      meta: {
		        'baja': 'hitam'
		      },
			resolve: {
	            article: function(F_Article, $route){
	            	var where = {where: {id_article: $route.current.params.id_article} };
	            	return F_Article.get(where);
		        }
		    }
		})
		.otherwise({
			redirectTo: 'error/404' 
		});
		// use the HTML5 History API
		$locationProvider.html5Mode(true);
});

ngeblogApp
.run(['$rootScope', 'ngMeta', function ($rootScope, ngMeta) {
  	ngMeta.init();
 }]);
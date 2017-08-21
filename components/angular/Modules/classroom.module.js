window.mainApp = angular.module("mainApp", ['ngRoute', 'ngSanitize'/*, 'ui.bootstrap'*/]);
window.mainApp
.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);

        for (var i=0; i<total; i++) {
          input.push(i);
      }

      return input;
    };
})
.filter('sortBy', function(F_Sort){
    return function(items, search, searchType) {
        if(!items || items.length < 1) return [];
        if (!search) return items;
        var sort = F_Sort.sortBy(items, search, searchType);
        return sort;

    };
})
.run(['$rootScope', '$config', '$q', function($rootScope, $config, $q) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title? current.$$route.title : '';

        // create object base_component for base component angular.
        // ------------------------------------------------------------------------------
        if(!$rootScope.base_component){$rootScope.base_component = {} }
        if(!$rootScope.base_component.external_source){$rootScope.base_component.external_source = {} }
        if(current.$$route.external_source){
            $rootScope.base_component.external_source = $.extend($rootScope.base_component.external_source, current.$$route.external_source); 
        }
        // ------------------------------------------------------------------------------

    });
}])
.factory('global_configuration', function(){
    var config = {}
    config.namespace_sudo = 'sudo';
    config.namespace_admin = 'admin';
    config.namespace_public = 'public';
    return config;
});


window.mainApp.run(['$tools', '$q','$rootScope', '$location', '$routeParams','$config','F_Config', 'F_Credential', '$authorize', 'global_configuration', function ($tools,$q,$rootScope, $location, $routeParams, $config, F_Config, F_Credential, $authorize, global_configuration) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        
        if(!next.$$route){ next.$$route = {resolve:{}} }
        if(!next.$$route.resolve){ next.$$route.resolve = {} }
        var need_login = next.$$route.need_login;
        var sidebar= next.$$route.using_sidebar != undefined? next.$$route.using_sidebar : true
        var navbar= next.$$route.using_navbar != undefined? next.$$route.using_navbar : true
        F_Config.landing_page.manual(true)
        
        // when data configuration don't loaded yet.
        //////////////////////////////////////////////////////////////////////

        next.$$route.resolve.__configuration = function()
        {
            var defer = $q.defer();
            $.post('http://classroom.matrik.com/server/blog/configuration', function(res){
                if($tools.isJson(res))
                {
                    res = JSON.parse(res);
                    res.is_need_login = need_login;
                    defer.resolve(res); 
                }
                
                ngeblog.initialize('http://matrik.com/server/')
                $config.initialize_configuration(res);
                F_Credential.routine_initialize_configuration(res);
                
                
                //////////////////////////////////////////////////////////////////////
                // Configuration to check is authentication or no.
                //////////////////////////////////////////////////////////////////////

                $rootScope.is_auth = 0;
                $rootScope.style_main_panel= 'width:100%';
                F_Config.sidebar.close()
                
                F_Config.sidebar.manual(sidebar)
                F_Config.navbar.manual(navbar)
                F_Config.landing_page.manual(false)

                // jika halaman membutuhkan login (defined in routes)
                if(need_login)
                {
                    // jika belum login atau Cookies admin belum ada (defined expires in $authorize)
                    if(!$authorize.is_login() || !Cookies.getJSON(global_configuration.namespace_admin))
                    {
                        // go to login page
                        $location.path('/login');
                    }else
                    {
                        // set is auth =1
                        $rootScope.is_auth = 1;
                        $rootScope.style_main_panel= '';
                        $rootScope.base_url = $config.base_url;
                    }
                // or else halaman tidak membutuhkan login 
                }else if(!need_login)
                {
                    // jika cookies admin undefined *(rada suspisius disini)
                    if(!Cookies.getJSON(global_configuration.namespace_admin))
                    {
                        // go to login
                        $location.path('/login');
                    // jika sudah login
                    }else if($authorize.is_login())
                    {
                        // masuk ke index
                        $location.path('/');
                    }
                }
                //////////////////////////////////////////////////////////////////////
                $rootScope.$apply(); //aplly scope.
            }) 
            return defer.promise;
        }
        
    });
}]);
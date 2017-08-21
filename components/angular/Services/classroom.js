window.mainApp


.service('$config', function (global_configuration, F_Config) {
    this.public_key = '';
    this.source = undefined;

    this.trends_url = function(url)
    {
        url = (!url)?'':url;
        return this.trends+'/'+url;   
    }
    this.server_url = function(url)
    {
        url = (!url)?'':url;
        return this.processing_server+url;
    }
    this.base_url = function(url)
    {
        url = (!url)?'':url;
        return this.web_url+url;
    }
    this.set_source = function(source)
    {
        this.source = source;
    }
    this.set_public_key = function(source)
    {
        this.public_key = source;
    }
    this.node = window.node;
    this.initialize_configuration = function(config)
    {
        var _parents = this;
        $.each(config, function(a,b){
            _parents[a] = b;
        })
    }     
})
.service('$ads', function($config, $owner, F_Ads){
    $this = this;
    this.configuration = {}
    this.get_configuration = function(callback)
    {
        F_Ads.get_options(function(res){
            $.each(res, function(a,b){
                $this.configuration[b.name] = b.value;
            })
            if(typeof callback == 'function')
            {
                callback($this.configuration)    
            }
        })    
    }
    this.get_components = function(callback)
    {
        F_Ads.get_components(function(res){
            $.each(res['options'], function(a,b){
                $this.configuration[b.name] = b.value;
            })
            $this.list = res.list;

            if(typeof callback == 'function')
            {
                callback($this.configuration, $this.list, res)    
            }
        })
    }
    this.toggling_auto_ads = function(where, callback)
    {
        if(!$config.double_server)
        {
            // $config.post($config.server_url(''), {where: where}, callback )
            
            F_Ads.auto_ads(
                where,
                callback,
                function(err)
                {
                    console.log(err);
                }
            );
        }else
        {
            $config.node.send('ads/toggling_auto_ads', {credential: $owner.credential(), where: where })
            .done(function(res){

                if(typeof callback == 'function'){callback(res)}
            })
            
        }
        
    }
    this.get_ads_options = function(callback)
    {
        if(!$config.double_server)
        {
            F_Ads.auto_ads(
                where,
                callback,
                function(err)
                {
                    console.log(err);
                }
            );
        }else
        {
            
            $config.node.send('ads/get_ads_options', {credential: $owner.credential(), where: {} })
            .done(function(res){
                if(typeof callback == 'function'){callback(res)}
            })
            
        }
        
    }
    this.toggling_shuffle_ads = function(where, callback)
    {
        if(!$config.double_server)
        {
            F_Ads.shuffle_ads(
                where,
                callback,
                function(err)
                {
                    console.log(err);
                }
            );
        }else
        {
            
            $config.node.send('ads/toggling_shuffle_ads', {credential: $owner.credential(), where: where })
            .done(function(res){
                if(typeof callback == 'function'){callback(res)}
            })
            
        }
    }
    this.update_ads_length = function(ads_length, success, error)
    {
        F_Ads.update_ads_length({ads_length: ads_length}, success, error)
    }
    this.add_new_ads = function(data, success, error)
    {
        F_Ads.add_new_ads(data, success, error)
    }

    this.remove_ads = function(data, success, error)
    {
        F_Ads.remove_ads(data, success, error)
    }
    
})
.service('$owner', function ($config, global_configuration, F_Credential) {
    this.credential = function()
    {
        var credential = {
            source: $config.source,
            administrator: Cookies.getJSON(global_configuration.namespace_admin)? Cookies.getJSON(global_configuration.namespace_admin) : {},
            public: Cookies.getJSON(global_configuration.namespace_public),
        }
        return credential; 
    }
    this.reset_credential = function()
    {
        // this.administrator  = undefined;
        console.log(global_configuration)
        // Cookies.remove(global_configuration.namespace_admin)
        // Cookies.remove(global_configuration.namespace_public)
        // F_Credential.logout();
    }
    
    this.submit_new_owner = function(d, c, e)
    {
        // $tools.post($config.server_url('owner/create_new_owner'), d, c, e )
        var _parents = this;
        data = $.extend({credential: _parents.credential() }, d)
        $.post($config.server_url('owner/create_new_owner'), data )
        .done(function(res){
            if(typeof c == 'function'){c(res)}
        })
        .fail(function(res){
            console.log(res)
            if(typeof e == 'function'){e(res)}
        })
    }

    this.check_available_mail = function(d,c,e)
    {
        // $tolls.post($config.server_url('owner/is_owner_exist'), d, c, e )
        var _parents = this;
        data = $.extend({credential: _parents.credential() }, d)
        $.post($config.server_url('owner/is_owner_exist'), data )
        .done(function(res){
            if(typeof c == 'function'){c(res)}
        })
        .fail(function(res){
            console.log(res)
            if(typeof e == 'function'){e(res)}
        })

    }
})
.service('$tools', function ($config, $owner) {
    this.range = function(input, total)
    {
        var arr = []
        total = parseInt(total);
        for (var i=input; i<total; i++) {
          arr.push(i);
        }

        return arr;
    }
    this.copy = function(e, c)
    {
        $(e).select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text was ' + msg);
            if(typeof c == 'function')
            {
                c()
            }
        } catch (err) {
            console.error('Oops, unable to copy');
        }
    }
    this.post = function(url, data, success, fail)
    {
        data = $.extend({credential: $owner.credential() }, data)
        $.post(url, data )
        .done(function(res){
            res = JSON.parse(res);
            if(typeof success == 'function'){success(res)}
        })
        .fail(function(res){
            console.log(res)
            if(typeof fail == 'function'){fail(res)}
        })
    }

    this.isJson = function(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
})
.service('$pagination', function ($tools, $config, $rootScope) {
    this.components = {}
    this.components.records = []
    this.components.pageSize = 5;
    this.components.currentPage = 1;
    this.components.search = '';

    this.refresh = function()
    {
        this.initialize(this.components.pageSize, this.components.currentPage)
        
    }

    this.set_page_size = function(item)
    {
        this.initialize(item, this.components.currentPage)
    }
    this.set_records = function(records)
    {
        this.components.records = records;
    }
    this.get_paging = function()
    {
        return this.components.pages;
    }
    this.set_page = function(page)
    {

        this.initialize(this.components.pageSize, page)
    }
    this.get_page_records = function()
    {
        var rec = []
        var _parents = this;
        angular.forEach(this.components.records, function(value, key){
            if(key >= _parents.components.startIndex && key <= _parents.components.endIndex)
            {
                this.push(value)
            }
        }, rec)
        return rec;
    }
    this.get_current_page = function()
    {
        return this.components.currentPage;
    }
    this.initialize = function(pageSize, currentPage)
    {
        this.components.totalItems = this.components.records.length
        if(this.components.totalItems <=0)
        {
            // alert('no records found!');
            console.error('No records')
            return false;
        }
        this.components.pageSize = pageSize? parseInt(pageSize) : this.components.pageSize
        this.components.currentPage = currentPage? parseInt(currentPage) : this.components.currentPage
        // check length records
        // get total pages
        this.components.totalPages = Math.ceil(this.components.totalItems / this.components.pageSize);
        this.components.startPage = '';
        this.components.endPage = '';
        // jika total pages <= 10
        if (this.components.totalPages <= 10) {
            // less than 10 total pages so show all
            this.components.startPage = 1;
            this.components.endPage = this.components.totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages
            if (this.components.currentPage <= 6) {
                this.components.startPage = 1;
                this.components.endPage = 10;
            } else if (this.components.currentPage + 4 >= this.components.totalPages) {
                this.components.startPage = this.components.totalPages - 9;
                this.components.endPage = this.components.totalPages;
            } else {
                this.components.startPage = this.components.currentPage - 5;
                this.components.endPage = this.components.currentPage + 4;
            }
        }

        // calculate start and end item indexes
        this.components.startIndex = (this.components.currentPage - 1) * this.components.pageSize;
        this.components.endIndex = Math.min(this.components.startIndex + this.components.pageSize - 1, this.components.totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        this.components.pages = $tools.range(this.components.startPage, this.components.endPage + 1);

        // return object with all pager properties required by the view
        var data = {
            totalItems  : this.components.totalItems,
            currentPage : this.components.currentPage,
            pageSize    : this.components.pageSize,
            totalPages  : this.components.totalPages,
            startPage   : this.components.startPage,
            endPage     : this.components.endPage,
            startIndex  : this.components.startIndex,
            endIndex    : this.components.endIndex,
            pages       : this.components.pages
        };
        console.log( data)
        return data;
    }
    $rootScope.pagination = this;
})

/*
|
| Authorize
|
*/
.service('$authorize', function($owner, $config, $rootScope, global_configuration, F_Credential){
    this.namespace_admin = 'panel'
    this.get_auth_data = function()
    {
        return Cookies.getJSON(global_configuration.namespace_admin)
    }
    this.set_auth_data = function(res)
    {
        Cookies.set(global_configuration.namespace_admin, res,  { expires: 1 }); // expires in a day
        F_Credential.administrator_initialize_configuration(res)
    }
    this.is_need_login = function()
    {
        var data = this.get_auth_data();
        return ($config.source == 'panel')? true : false;
    }
    this.is_login = function()
    {
        var ownerdata = $owner.credential();
        var  data = this.get_auth_data();
        return (!ownerdata.public.is_login)? false : true 
    }
    this.initialize = function(c,f)
    {
        if ( this.is_need_login() ) {
            event.preventDefault();
            $location.path('/login');
            
            if(typeof c == 'function'){c}
        }else
        {
            $rootScope.is_auth = 1;
            $rootScope.sidebar= true
            $rootScope.style_main_panel= '';
            $rootScope.base_url = $config.base_url;
            if(typeof f == 'function'){f}
        }
    }
})
.service('$articles', function ($rootScope, F_Autosave) {
    $this = this;
    $this.auto_save = {}
    $this._timeout;
    $this._scope = {};
    $this._autosave = F_Autosave.records;
    /*if(!)
    {
        window.localStorage['autosave.newpost'] = JSON.stringify([])
    }*/

    $this.auto_save.start = function($scope)
    {
        $scope.$watch('newpost', function (newValue, oldValue, scope) {
            $this._scope.newpost = $scope.newpost;
            if(newValue)
            {
                clearTimeout($this._timeout)
                $this.auto_save.restart_counter(newValue, 8000)
            }
        }, true);
    }
    $this.auto_save.restart_counter = function(newValue, timeout)
    {
        if(!timeout)return false;
        $this._timeout= window.setTimeout(function(){
            var lastItem = JSON.stringify($this._autosave[$this._autosave.length-1]);
            var newItem = JSON.stringify(newValue);
            console.log(newItem == lastItem, newItem, lastItem, $this._autosave)
            if(newItem != lastItem)
            {
                $this._autosave.push(newValue);
                window.localStorage.setItem('autosave.newpost', JSON.stringify($this._autosave));
                Snackbar.show('Autosave')
            }
        },timeout)
    }
})
.service('$sse', function($rootScope, $config){
    $this = this;
    function request_url(url)
    {
        var url = Cookies.getJSON('public').blog_server+'server/sse/'+url;
        var source = new EventSource(url);
        return source;
    }
    $this.schedule_today = function()
    {
        return request_url('sse_schedule_today')
    } 

    return $this;
});
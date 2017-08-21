window.mainApp
.factory('facebookService', function($q) {
    var $this = {}
    $this.initialize = function()
    {
        FB.init({ 
          appId: '{your-app-id}',
          status: true, 
          cookie: true, 
          xfbml: true,
          version: 'v2.4'
        });
    }

    $this.getMyLastName = function() {
        var deferred = $q.defer();
        FB.api('/me', {
            fields: 'last_name'
        }, function(response) {
            if (!response || response.error) {
                deferred.reject('Error occured');
            } else {
                deferred.resolve(response);
            }
        });
        return deferred.promise;
    }

    return $this;
})
.factory('F_Config', function(global_configuration, $rootScope){
    var $this = {}
    $this.public_key = '';
    $this.source = undefined;

    $this.trends_url = function(url)
    {
        url = (!url)?'':url;
        return $this.trends+'/'+url;   
    }
    $this.server_url = function(url)
    {
        url = (!url)?'':url;
        return $this.processing_server+url;
    }
    $this.base_url = function(url)
    {
        url = (!url)?'':url;
        return $this.web_url+url;
    }
    $this.blog_url = function(url)
    {
        url = (!url)?'':url;
        return $this.blog_server+url+'/';
    }
    $this.set_source = function(source)
    {
        $this.source = source;
    }
    $this.set_public_key = function(source)
    {
        $this.public_key = source;
    }
    $this.node = window.node;
    $this.initialize_configuration = function(config)
    {
        var _parents = $this;
        var expiresInAHour = new Date(new Date().getTime() + 60 * 60 * 1000);
        Cookies.set(global_configuration.namespace_public, config, {expires: expiresInAHour})
        $.each(config, function(a,b){
            _parents[a] = b;
        })
    }

    $this.sidebar = {}
    $this.sidebar.manual = function(bool){$rootScope.sidebar = bool;}
    $this.sidebar.close = function(){$rootScope.sidebar = false;}
    $this.sidebar.open = function(){$rootScope.sidebar = true;}
    $this.navbar = {}
    $this.navbar.manual = function(bool){$rootScope.navbar = bool;}
    $this.navbar.close = function(){$rootScope.navbar = false;}
    $this.navbar.open = function(){$rootScope.navbar = true;}
    $this.landing_page = {}
    $this.landing_page.manual = function(bool){$rootScope.landing_page = bool;}
    $this.landing_page.close = function(){$rootScope.landing_page = false;}
    $this.landing_page.open = function(){$rootScope.landing_page = true;}

    $this.components = {}
    return $this;
})
.factory('F_Credential', function(global_configuration, $rootScope, F_Config){
    var $this = {}
    if(!$rootScope.$$credential)
    {
        $rootScope.$$credential = {public:{}, administrator:{}}
    }
    if($rootScope.$$credential.public) $rootScope.$$credential.public = {}
    if($rootScope.$$credential.administrator) $rootScope.$$credential.administrator = {}

    $this.$$credential = {}
    
    $this.administrator_initialize_configuration = function(credential)
    {
        $rootScope.$$credential.administrator = credential;
        $rootScope.$apply();
    }
    $this.routine_initialize_configuration = function(credential)
    {
        $rootScope.$$credential.public = credential;
        F_Config.initialize_configuration(credential)
        $rootScope.$apply();
    }
    $this.logout = function()
    {
        delete $rootScope.$$credential;
    }
    return $this;
})
.factory('F_Sort', function(){
    var property = '';
    var type = 's';
    function set_sort_property(prop){property = prop;}
    function get_sort_property(){return property;}
    function set_sort_type(settype){type = settype? settype : 's';}
    function get_sort_type(){return type;}

    function compare(a,b) {
        var sortOrder = 1;
        var prop = get_sort_property()
        if(prop)
        {
            if(prop[0] === "-") {
                sortOrder = -1;
                prop = prop.substr(1);
            }

            var spl = prop.split('.');
            if(spl.length > 0)
            {
                $.each(spl, function(c,d){
                    a = a[d];
                    b = b[d];
                })
            }else
            {
                a = a[prop]
                b = b[prop]
            }
        }

        switch(get_sort_type())
        {
            case 'i':
                a = parseInt(a);       
                b = parseInt(b);       
                break;
            case 'b':
                a = JSON.parse(a);       
                b = JSON.parse(b);
                break;
            case 's':
            default:
                a = String(a);       
                b = String(b);
                break;
        }
        var result = (a < b) ? -1 : (a > b) ? 1 : 0;

        return result*sortOrder;
    }

    $this.sortBy = function(objs, prop, typeProp)
    {
        set_sort_property(prop);
        set_sort_type(typeProp);
        return objs.sort(compare);
    }
    return $this;
})
.factory('F_Users', function(F_Config){
   

    var $this = {}
    $this.registeringNewUser = function(str) {
        $.post(F_Config.server_url('users/signup'), {})
        .done(function(res){
            res = F_Tools.isJson(res)? JSON.parse(res) : res;
            $this.records = res;
            if(typeof success == 'function'){success(res);}
        })
        .fail(function(res){
            if(typeof fail == 'function'){fail(res);}
        })
    }
    return $this;
})
.factory('F_Tools', function(F_Config){
   

    var $this = {}
    $this.isJson = function(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    $this.searchObjectString = function(obj, str) {
        var spl = str.split('.');
        if(spl.length > 0)
        {
            $.each(spl, function(c,d){
                obj = obj[d];
            })
        }
        return obj;
    }

    $this.ajax = function(options)
    {
        // function ajax from library.helper
        return ajax(options)
    }
    return $this;
})
.factory('F_Comment', function(F_Config, F_Tools){
    // function check login
    function check_login(cookies_name)
    {
        return Cookies.getJSON(cookies_name)? true : false;
    }
    var $this = {}
    $this.records = {};
    $this.fnHelper = {credential_input:{}};
    $this.components = {}
    $this.components.id_replying_comment = undefined;
    $this.components.cookies_name = '_comment_credential_';
    
    $this.components.object_components = {
        credential: {},
        records: [],
        isLogin: check_login($this.components.cookies_name),
        section:{},
    }

    $this.components.scope_name                                             = 'comment_components';
    $this.components.element_supports                                       = '';
    $this.components.object_components.section.main_comment                 = 'ng-comment';
    $this.components.object_components.section.credential                   = 'ng-comment-credential';
    $this.components.object_components.section.article_comment_form         = 'ng-comment-article-textarea';
    $this.components.object_components.section.article_comment_list         = 'ng-comment-article-comment-list';
    $this.components.object_components.section.reply_comment                = 'ng-comment-replying-comment';
    $this.components.object_components.section.replying_comment_list        = 'ng-comment-replying-comment-list';
    $this.components.object_components.section.attr_active_comment_editor   = 'ng-comment-editor-active';
    
    
    $this.submit_comment = function(data_comment, success, fail)
    {
        return $.post(F_Config.server_url('comment/submit_comment'), {data:data_comment})
    }

    $this.get_comments = function(id_article, success, fail)
    {
        $.post(F_Config.server_url('comment/get_comment'), {})
        .done(function(res){
            res = F_Tools.isJson(res)? JSON.parse(res) : res;
            $this.records = res;
            if(typeof success == 'function'){success(res);}
        })
        .fail(function(res){
            if(typeof fail == 'function'){fail(res);}
        })
    }
    $this.set_comment_id = function(id)
    {
        if(!id)
        {
            alert('id not defined in factory.main.js ');
            return;
        }
        $this.components.id_replying_comment = id;
    }
    $this.get_comment_id = function()
    {
        return parseInt($this.components.id_replying_comment);
    }
    $this.get_comment_content = function()
    {
        return $('['+$this.components.object_components.section.attr_active_comment_editor+']').find('[ng-ckeditor]').val()
    }
    $this.show_reply_comment_section = function(id_post, id_comment)
    {
        // config CKEDITOR
        var config = {
            extraPlugins:'autogrow', 
            toolbar:[], 
            autoGrow_minHeight: 50,
            autoGrow_maxHeight: 200,
            height: 50
        }

        // hide all comment editor.
        $this.hide_reply_comment_section();

        // define element target
        var element = $('['+$this.components.object_components.section.reply_comment+'="'+id_post+'.'+id_comment+'"]')
        
        // show comment editor inside element.
        element
        .find('['+$this.components.object_components.section.replying_comment_list+']')
        .show();

        //unset other ckeditor
        if( $('['+$this.components.object_components.section.attr_active_comment_editor+']').length > 0 )
        {

            $('['+$this.components.object_components.section.attr_active_comment_editor+']')
            .find('[ng-ckeditor]')
            .ckeditor(function(){
                this.destroy();
            },config)
            .val('')

            $('['+$this.components.object_components.section.attr_active_comment_editor+']')
            .removeAttr($this.components.object_components.section.attr_active_comment_editor)

        }

        element
        // add variable on parent of textarea. as sign the textarea inside this element were an ckeditor.
        .attr($this.components.object_components.section.attr_active_comment_editor, 'true')
        // set CKEDITOR on textarea inside the "element"
        .find('[ng-ckeditor]')
        .ckeditor(config)
        .focus(); 

        // set id_comment
        $this.set_comment_id(id_comment);
        
    }
    $this.hide_reply_comment_section = function()
    {
        $('['+$this.components.object_components.section.replying_comment_list+']').hide();
    }

    $this.comment_credential = {} 
    $this.comment_credential.set = function(data_login)
    {
        Cookies.set($this.components.cookies_name, data_login);
        $this.components.object_components.isLogin = true;
    }
    $this.comment_credential.get = function()
    {
        return Cookies.get($this.components.cookies_name);
    }
    $this.comment_credential.isLogin = function()
    {
        return check_login($this.components.cookies_name)
    }
    $this.comment_credential.logout = function()
    {
        $this.comment_credential.set(undefined);
        Cookies.remove($this.components.cookies_name);
    }
    $this.comment_credential.initialize = function()
    {
        
        if($this.comment_credential.isLogin())
        {
            // $('['+$this.components.object_components.section.credential+']').hide()
            $this.components.object_components.isLogin = true;
        }
    }

    $this.login = function(data, success, fail)
    {
        $.post(F_Config.server_url('comment/login'), {data: data})
        .done(function(res){
           res = F_Tools.isJson(res)? JSON.parse(res) : res;
           if(typeof success == 'function'){success(res)}
        })
        .fail(function(res){
            console.log(res)
        })
    }
    $this.submit_comment = function(data_comment, success, fail)
    {
        return $.post(F_Config.server_url('comment/submit_comment'), {data:data_comment, credential: $this.comment_credential.get()})
    }

    $this.setRecords = function(name, data)
    {  
        data = F_Tools.isJson(data)? JSON.parse(data) : data;
        $this.components.object_components.records = data;

    }

    // function helper 
    $this.fnHelper.getParentName = function(e, $element)
    {
        console.log($element)
    }
    $this.fnHelper.isLogin = function()
    {
        return $this.comment_credential.isLogin();
    }
    $this.fnHelper.setLogin = function(value)
    {
        return $this.comment_credential.isLogin();
    }

    $this.components.element_supports += "<div "+$this.components.object_components.section.credential+" ng-if='!__comment.__helper.isLogin()'><ng-include src=\"'templates/others/comment/credential.html'\"></ng-include></div>"
    $this.components.element_supports += "<div "+$this.components.object_components.section.article_comment_form+" ng-if='__comment.__helper.isLogin()'><ng-include src=\"'templates/others/comment/comment.article.html'\"></ng-include></div>"
    $this.components.element_supports += "<div "+$this.components.object_components.section.article_comment_list+"><ng-include src=\"'templates/others/comment/comment.list.html'\"></ng-include></div>"


    return $this;
})
.factory('F_Ads', function(F_Tools, F_Config){
    var $this = {options:{}}
    $this.auto_ads = function($data, success, error)
    {
        $.post(F_Config.server_url('ads/auto_ads'), $data)
        .done(success)
        .fail(error)
    }

    $this.shuffle_ads = function($data, success, error)
    {
        $.post(F_Config.server_url('ads/shuffle_ads'), $data)
        .done(success)
        .fail(error)
    }

    $this.get_options = function(success, error)
    {
        $.post(F_Config.server_url('ads/get_options'))
        .done(function(res){
            res = JSON.parse(res);
            if(typeof success == 'function')
            {
                success(res, $this)
            }
        })
        .fail(error)
    }
    $this.get_components = function(success, error)
    {
        $.post(F_Config.server_url('ads/get_ads_components'))
        .done(function(res){
            res = JSON.parse(res);
            if(typeof success == 'function')
            {
                success(res, $this)
            }
        })
        .fail(error)
    }
    $this.remove_ads = function($data, success, error)
    {
        $.post(F_Config.server_url('ads/remove_ads'), $data)
        .done(function(res){
            if(typeof success == 'function')
            {
                success(res)
            }
        })
        .fail(error)
    }
    $this.update_ads_length = function($data, success, error)
    {
        $.post(F_Config.server_url('ads/update_ads_length'), $data)
        .done(function(res){
            if(typeof success == 'function')
            {
                success(res, $this)
            }
        })
        .fail(error)
    }

    $this.add_new_ads = function($data, success, error)
    {
        $.post(F_Config.server_url('ads/add_new_ads'), $data)
        .done(function(res){
            if(typeof success == 'function')
            {
                success(res, $this)
            }
        })
        .fail(error)
    }
    return $this;
})
.factory('F_Moment', function(F_Tools, F_Config){
    var $this = {}
    $this.method = {}
    $this.method.format = function(origin, format, newFormat)
    {
        if(format)
        {
            return moment(origin, format).format(newFormat);
        }else{
            return moment(origin).format(newFormat);
        }

    }

    $this.method.formatUnix = function(origin, format, newFormat)
    {
        return $this.method.format(parseInt(origin), format, newFormat)

    }
    return $this.method;
})
.factory('F_Article', function(F_Tools, F_Config, $rootScope, $location){
    if(!$rootScope.$$article)
    {
        $rootScope.$$article = {}
    }
    $this = {fn:{}};
    $this.fn.get_article = function(where, callback, fail)
    {
        $.post(F_Config.server_url('article/get'), {where: where })
        .done(function(res){
            res = F_Tools.isJson(res)? JSON.parse(res) : res;
            if(typeof callback == 'function'){callback(res)}
        })
        .fail(function(res){
            console.log(res)
            if(typeof fail == 'function'){fail(res)}
        })
    }
    $this.fn.save_event = function(data, callback, fail)
    {
        $.post(F_Config.server_url('event/create_event'), {data: data })
        .done(function(res){
            res = F_Tools.isJson(res)? JSON.parse(res) : res;
            if(typeof callback == 'function'){callback(res)}
        })
        .fail(function(res){
            console.log(res)
            if(typeof fail == 'function'){fail(res)}
        })
    }

    $this.fn.update_viewer = function($id_article, $counter_post)
    {
        var data = {where: {id_article: $id_article}, update: {counter_post: $counter_post+1} };
        if(!F_Config.double_server)
        {
            $.post(F_Config.server_url('article/update_viewer'), data)
            .done(function(res){
                console.log(res)
                if(typeof callback == 'function'){callback(res)}
            })
            .fail(function(res){
                console.log(res)

            })
        }else
        {
            $config.node.send('article/update_viewer', data)
            .done(function(){

            })
        }
    }

    $this.fn.get_edited_article = function()
    {
        var params = $location.search();
        return params.id;
    }

    $this.fn.set_edited_article = function(id)
    {
        Cookies.set('edited_article', id)
    }
    return $this.fn;
})
.factory('F_Event', function(F_Tools, F_Sort){
    function countDownNextEvent(event, current)
    {   
        // Update the count down every 1 second
        window.duration_interval = setInterval(function() {
        var countDownDate = new Date(event).getTime();

            // Get todays date and time
            var now = new Date().getTime();

            // Find the distance between now an the count down date
            var distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            $('[ng-event-countdown-days]').text(days)
            $('[ng-event-countdown-hours]').text(hours)
            $('[ng-event-countdown-minutes]').text(minutes)
            $('[ng-event-countdown-seconds]').text(seconds)

            // If the count down is finished, write some text 
            if (distance < 0) {
                clearInterval(window.duration_interval);
            }
        }, 1000);
    }
    var $this = {}
    $this.method = {}
    $this.components = {}
    $this.components.nearly_hours = '';
    $this.components.event_nearby = {};
    $this.method.countdown = function(event_start)
    {
        countDownNextEvent(moment(parseInt(event_start)*1000).format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'))
    }

    $this.method.set_nearly_event = function(records)
    {
        var sorted = F_Sort.sortBy(records, 'related.event.event_start', 'i');
        if(sorted.length > 0)
        {
            sorted = sorted[0]
            $this.method.countdown(sorted.related.event.event_start);
            $this.components.event_nearby = sorted;
        }
    }

    $this.method.get_nearby_event = function(name)
    {
        if(name)
        {
            return $this.components.event_nearby[name];
        }
        return $this.components.event_nearby;
    }

    return $this.method;
})
.factory('F_Image', function(F_Tools, F_Config, $http){
    var $this = {}
    $this.get_images = function(where)
    {
        where = $.extend({}, where)
        where.is_image = 1;

        var data = { where: where }
        return ajax({
            method: 'POST',
            url: F_Config.server_url('files/get_file'),
            data: data
        })

        // .post(F_Config.server_url('files/get_file'), data)
        /*return F_Tools.ajax({
            url: F_Config.server_url('files/get_file'),  
            data: {
                where: where
            }
        })*/
        
    }

    return $this;
})
.factory('F_Pagination', function(F_Tools, F_Config, $http, $rootScope, $http){
    var $this = {}
    
    $this.records = [] /*name*/
    $this.fn = {}
    $this._pagination = {}
    function ajax_call(options)
    {
        options = $.extend({},options)
        return $.ajax(options)
        
    }


    if(!$rootScope.$$pagination){$rootScope.$$pagination = {instances:{} }}
        $rootScope.$$pagination = $.extend($rootScope.$$pagination, $this.fn)
    
    $this.fn.new_pagination = function(options, scope)
    {
        if(!options.name || options.data)
        {
            alert('insufficient of parameters');
            return false;
        }

        $this.records.push(options.name)
        $rootScope.$$pagination.instances[options.name] = new Pagination(options)
        return $rootScope.$$pagination.instances[options.name];
    }
    $this.fn.beforeSent = function()
    {
        Snackbar.manual({message:'Sending Request. please wait!', spinner:true})
    }
    $this.fn.afterSent = function()
    {
        Snackbar.manual({message:'Request Done!', spinner:false})
        Snackbar.show('Request done!')
    }
    $this.fn.ajax_call = function(options)
    {
        $this.fn.beforeSent();
        return ajax_call(options)
        .done(function(){
            $this.fn.afterSent()
        })
    }

    var Pagination = function(data)
    {
        $$this = this;

        // function 
            $$this.update_page_components = function(data)
            {
                data = $.extend({}, data)
                // $$this.totalItems = parseInt(data.totalItems) ? parseInt(data.totalItems) : $$this.get_records().length;
                $$this.totalItems = $$this.get_totalItems();
                // $$this.pageSize   = data.pageSize ? parseInt(data.pageSize) : 10;
                $$this.pageSize   = $$this.get_pageSize();
                // $$this.currentPage = data.currentPage ? parseInt(data.currentPage) : 1;
                $$this.currentPage = $$this.get_currentPage();
                // $$this.startPage  = parseInt(data.startPage) || parseInt(data.startPage) > 0 ? parseInt(data.startPage) : 1;
                $$this.startPage  = $$this.get_startPage();

                $$this.endPage    = undefined;
                $$this.totalPages = Math.ceil($$this.totalItems/$$this.pageSize)

                if($$this.totalPages <= 10)
                {
                    $$this.endPage = $$this.totalPages
                }else
                {
                    if($$this.currentPage <= 6)
                    {
                        $$this.startPage = 1;
                        $$this.endPage = 10;
                    }
                    else if($$this.currentPage + 4 >= $$this.totalPages)
                    {
                        $$this.startPage = $$this.totalPages - 9;
                        $$this.endPage = $$this.totalPages;
                    }else
                    {
                        $$this.startPage = $$this.currentPage - 5;
                        $$this.endPage = $$this.currentPage + 4;
                    }
                }
                $$this.startIndex = ($$this.currentPage - 1) * $$this.pageSize
                $$this.endIndex = Math.min($$this.startIndex + $$this.pageSize - 1, $$this.totalItems);
                $$this.pages = range($$this.startPage, $$this.endPage+1);
                $$this.search = {}
                $$this.search.column = []
            }
            $$this.set_state = function(state)
            {
                $$this.state = state?state:'local'
            }
            $$this.get_state = function()
            {
                return $$this.state
            }
            $$this.set_startPage = function(startPage)
            {
                $$this.startPage = startPage? startPage : 1;
            }
            $$this.get_startPage = function()
            {
                return $$this.startPage;
            }
            $$this.set_lastRecords = function(lastRecords)
            {
                $$this.lastRecords = lastRecords? lastRecords : 0;
            }
            $$this.get_lastRecords = function()
            {
                return $$this.lastRecords ? $$this.lastRecords : 0;
            }
            $$this.set_defaultData = function(defaultData)
            {
                $$this.defaultData = defaultData? defaultData : {};
            }
            $$this.get_defaultData = function()
            {
                return $$this.defaultData;
            }

            $$this.set_pageSize = function(pageSize)
            {
                $$this.pageSize = pageSize? pageSize : 5;
            }
            $$this.get_pageSize = function()
            {
                return $$this.pageSize;
            }
            
            $$this.set_currentPage = function(currentPage)
            {
                $$this.currentPage = currentPage? currentPage :1;
            }
            $$this.get_currentPage = function()
            {
                return $$this.currentPage;
            }
            
            $$this.set_totalItems = function(totalItems)
            {
                $$this.totalItems = totalItems;
            }
            $$this.get_totalItems = function()
            {
                return $$this.totalItems;
            }

            $$this.set_name = function(name)
            {
                $$this.name       = name;
            }
            $$this.get_name = function()
            {
                return $$this.name;
            }
            $$this.get_records = function()
            {
                var records = $$this.get_state() == 'server'? $$this.records : $$this.get_originRecords();
                var size = $$this.get_pageSize();
                if(records.length > size && $$this.get_state() == 'local')
                {
                    page_number = $$this.get_currentPage();
                    var startRecords = (page_number-1 ) * size;
                    var endRecords = (page_number * size );
                    records = range(startRecords, endRecords, records);                    

                }
                return records;
            }
            $$this.set_records = function(records)
            {
                $$this.records = records;
            }
            $$this.set_originRecords = function(originRecords)
            {
                $$this.originRecords = originRecords;
            }
            $$this.get_originRecords = function()
            {
                return $$this.originRecords;
            }

            $$this.pages_item = function()
            {
                return $$this.pages;
            }
            $$this.update = function()
            {
                $$this.update_page_components();
                $rootScope.$$pagination.instances[$$this.name] = $$this;
                $rootScope.$apply();
                console.log($rootScope.$$pagination)
            }
            $$this.searching = function(value)
            {
                var search;
                var column = $$this.get_search_column();
                $$this.set_currentPage()
                if(value !== '')
                {
                    search = $$this._ajax_call_o({search:{column: column, value: value}})
                }else
                {
                    search = $$this._ajax_call_o()
                }
                search.done(function(res){
                    res = JSON.parse(res)
                    $$this.set_records(res.data);
                    $$this.set_totalItems(res.length.all)
                    $$this.update();
                })
            }
            $$this.set_search_column = function(columnInArray)
            {
                $$this.search.column = Array.isArray(columnInArray)? columnInArray : columnInArray.split(',')
            }
            $$this.get_search_column = function(columnInArray)
            {
                return $$this.search.column
            }
            
            $$this.set_options = function(o)
            {
                $$this.options = o
                $$this._default_options = o
            }
            $$this.get_options = function(o)
            {
                var o = $.extend($$this.options, o)
                return o;
            }
            $$this._ajax_call_o = function(data)
            {
                var item = $$this.get_currentPage();
                var name = $$this.get_name();
                var limit_start = (item -1) * $$this.pageSize
                var limit_length = $$this.pageSize
                data = $.extend( {limit_start: limit_start, limit_length: limit_length}, data)
                return $this.fn.ajax_call($$this.get_options({data:data}))
            }
            $$this.set_page = function(item)
            {
                switch($$this.get_state())
                {
                    case 'server':
                    default:
                        if($$this.get_currentPage() !== item)
                        {

                            $$this.set_currentPage(item)
                            $$this._ajax_call_o()
                            .done(function(res){
                                res = JSON.parse(res)
                                $$this.set_currentPage(item);
                                $$this.set_records(res.data);
                                $$this.update();
                            })
                        }
                        break;
                    case 'local':
                        var records = $$this.get_records(item);
                        $$this.set_currentPage(item)
                        $$this.update();
                        break;
                }
            }

            $$this.reload = function()
            {
                var data = $$this.get_defaultData()
                
                $$this.set_currentPage()
                $$this.set_pageSize(data.pageSize)
                $$this.set_startPage()

                if(data.ajax)
                {
                    $$this.set_state('server')
                    var options = {
                        method: data.method?data.method:'POST',
                        url: data.ajax.url,
                        data: data.ajax.data? data.ajax.data : {}
                    }
                    $$this.set_options(options)
                    $this.fn.ajax_call(options)
                    .done(function(res){
                        res = JSON.parse(res)
                        $$this.set_records(res.data)
                        $$this.set_originRecords(res.data)
                        $$this.set_totalItems(res.length.all)
                        $$this.update()
                    })
                }else if(data.records)
                {
                    $$this.set_state('local')
                    $$this.set_records(data.records)
                    $$this.set_originRecords(data.records)
                    $$this.set_totalItems(data.records.length)
                    $$this.update()

                }
            }
       

        // initialize class
        $$this.set_name(data.name)
        $$this.set_defaultData(data)

       $$this.reload();
        // parameters
        /*$$this.options    = data;            
        

        $$this.set_records(data.records)
        $$this.update_page_components(data);
        */

    }

    return $this.fn;
})
.factory('F_Archive', function(F_Tools, F_Config, $rootScope, $http, F_Article, $location){
    var $this = {}
    $this.root = {
        records: [],
        components:
        {
            _temp_archive: [],
            _temp_name: '',
            archive_button_working: false,
            related: false,
            state: 'list',
            opened_article: null,
            articles: [],
            article_combine_records: [],
            selected_articles: [],
            actual_selected_articles: [],
            data_selected_articles: [],
            newarchive:
            {
                name: '',
                search: '',
            }
        },
        fn: {}
    }

    $this.method = {}
    $this.fn = {}
    $this.method.archive_article = function()
    {
        return $http({
            url: F_Config.server_url('archive/get_archive'),
            method: 'POST'
        })
        .then(function(res){
            $this.root.records = res.data
        })
    }

    $this.method.add_to_archive_temp_array = function(id_archive)
    {
        $this.root.components._temp_archive.push(id_archive)
    }
    $this.method.remove_from_archive_temp_array = function(id_archive)
    {
        var index = $this.root.components._temp_archive.indexOf(id_archive);
        if(index > -1)
        {
            removeArray($this.root.components._temp_archive, index);
        }
    }
    $this.fn.open_modal_archive = function()
    {
        if(!$this.root.components.related)
        {
            $this.root.components.related = true
            $('#archive_modal').modal({
                backdrop: false
            });
        }
    }
    $this.fn.reset_new_archive_data = function()
    {
        $this.root.components.newarchive = {name:''}
    }
    $this.fn.new_archive = function()
    {
        var data = $this.root.components.newarchive;
        var deff = $.Deferred();
        var deff_A = $.Deferred();

        if(data.name == '')
        {
            swal('Error occured', 'Please fill the new archive name!', 'error')
            return false;
        }
        if(!F_Article.get_edited_article())
        {
            swal({
                title: 'Warning',
                text: 'You still have not saved your data. If you create this archive, your data will not be added. Do you want to continue?',
                type: 'info',
                showCancelButton: true
            }, function(res){
                if(res)
                {
                    deff_A.resolve(res)
                }
            })
        }else
        {
            deff_A.resolve();
        }
        $.when(deff_A.promise())
        .done(function(){   
            $.post( F_Config.server_url('archive/new_archive'), data)
            .done(function(res){
                res = JSON.parse(res);
                $this.fn.archive_this_article(res.id_archive)
                $this.fn.set_state('list')
                $this.fn.reset_new_archive_data();
                $rootScope.$apply();

                $this.method.archive_article()
                deff.resolve(res)
            })
            .fail(function(res){
                deff.reject(res)
                console.log(res)
            })
        })
        return $.when(deff.promise());
    }
    $this.fn.add_article_to_archive = function(id_archive)
    {
        var data = {id_article: F_Article.get_edited_article(), id_archive: id_archive}
        if(!data.id_article)
        {
            alert('Please save your article first');
            return false;
        }
        return $.post( F_Config.server_url('archive/add_to_archive_article'), data)
        .done(function(res){
            $this.root.components.archive_button_working = false
            $scope.$apply()
        })
        .fail(function(res){
            console.log(res)
            $this.root.components.archive_button_working = false
            $scope.$apply()
        })
    }
    $this.fn.remove_article_from_archive = function(id_archive)
    {
        var data = {id_article: F_Article.get_edited_article(), id_archive: id_archive}
        return $.post( F_Config.server_url('archive/remove_from_archive_article'), data)
        .done(function(res){
            $this.root.components.archive_button_working = false
            $scope.$apply()
        })
        .fail(function(res){
            console.log(res)
            $this.root.components.archive_button_working = false
            $scope.$apply()
        })
    }
    

    $this.fn.set_state = function(state)
    {
        $this.root.components.state = state? state:'list'
    }
    $this.fn.trigger_combine = function()
    {
        $this.fn.get_articles();
    }
    $this.fn.get_state = function()
    {
        return $this.root.components.state
    }
    $this.fn.reset_temp_archive_article = function()
    {
        $this.root.components._temp_archive = []
    }

    $this.fn.set_temp_archive_article = function(array_temp)
    {
        $this.root.components._temp_archive = array_temp;
    }
    $this.fn.get_temp_archive_article = function()
    {
        return $this.root.components._temp_archive
    }
    $this.fn.isset_temp_archive_article = function(id_archive)
    {
        id_archive = parseInt(id_archive);
        return $this.root.components._temp_archive.indexOf(id_archive) > -1 ? true : false;
    }

    $this.fn.unarchive_this_article = function(id_archive)
    {
        id_archive = parseInt(id_archive);
        $this.root.components.archive_button_working = true
        $this.method.remove_from_archive_temp_array(id_archive)
        if(F_Article.get_edited_article() > 0 && id_archive)
        {
            $this.fn.remove_article_from_archive(id_archive)
            .done(function(res){
                $this.root.components.archive_button_working = false;
                $scope.$apply()
                Snackbar.show('Success remove from archive')
            })
            .fail(function(){
                $this.method.add_to_archive_temp_array(id_archive)
                $scope.$apply()
                swal('error removing from archive', 'Error occured when removing from archive. it can be caused by your connection problem, or this article isn\'t exist in selected archive.', 'error');
            })
        }else
        {
            $this.root.components.archive_button_working = false
        }   
    }

    $this.fn.archive_this_article = function(id_archive)
    {
        id_archive = parseInt(id_archive);
        $this.root.components.archive_button_working = true;

        if(F_Article.get_edited_article())
        {
            if(F_Article.get_edited_article() > 0 && id_archive)
            {

                $this.method.add_to_archive_temp_array(id_archive)
                $this.fn.add_article_to_archive(id_archive)
                .done(function(res){
                    $this.root.components.archive_button_working = false;
                    $scope.$apply()
                    Snackbar.show('Success adding to archive')
                })
                .fail(function(res){
                    $this.method.remove_from_archive_temp_array(id_archive)
                    $scope.$apply()
                    swal('error adding to archive', 'Error occured when adding article to selected archive. it can be caused by your connection problem, or this article have been exist in selected archive.', 'error');
                    $this.root.components.archive_button_working = false;

                })
            }
        }else
        {

            swal('error adding to archive', 'Please Fill the title first', 'error');
            $this.root.components.archive_button_working = false;
        }

    }

    $this.fn.get_articles = function()
    {
        var data = {fields: 'id_article, title, article_permalink'}
        if($this.root.components.opened_article)
        {
            data['not_in'] = [['id_article', [parseInt($this.root.components.opened_article.id_article)]]];
        }
        console.log(data)
        ngeblog.api('articles', 'GET', data)
        .done(function(res){
            console.log(res)
            $this.root.components.articles = res;
            $scope.$apply();
        });
    }

    $this.fn.selected_articles_detection = function()
    {
        $this.root.components.actual_selected_articles = []
        $this.root.components.data_selected_articles = []
        $.each($this.root.components.selected_articles, function(a,b){
            if(b)
            {
                var index = $this.root.components.articles.map(function(res){return parseInt(res.id_article)}).indexOf(a)
                $this.root.components.data_selected_articles.push($this.root.components.articles[index])
                $this.root.components.actual_selected_articles.push(a)
            }
        })
    }

    $this.fn.combine = function()
    {
        
    }

    $this.root.fn = $this.fn;

    return $this;
})
.factory('F_Categories', function($rootScope, $q, F_Config){
    $scope = angular.element('body').scope();

    if(!$scope.$$categories)
    {
        $scope.$$categories = {
            records: {},
        }
    }
    var $this = {}
    $this.method = {}
    $this.method.records = [];
    $this.method.selected_record = [];
    $this.method.actual_selected_record = [];
    $this.method.category_primary = '';
    $this.method.name_category_primary = '';
    $this.method.input_new_category = '';
    
    $this.method.get = function(params){
        var deferred = $q.defer();
        ngeblog.api('article/categories', params)
        .done(function(res){
            deferred.resolve(res)
        })
        return deferred.promise;
    }
    $this.method.reset = function(){
        $this.method.reset_selected_records();
        $this.method.set_category_primary('');
    }

    $this.method.set_records = function(records){
        $this.method.records = records;
    }

    $this.method.get_selected_records = function(){
        return $this.method.actual_selected_record;
    }
    $this.method.set_selected_records = function(value){
        $.each(value, function(a,b){
            $this.method.selected_record[b] = true;
        })
        $this.method.read_selected_records();
    }
    $this.method.reset_selected_records = function(){
        $this.method.actual_selected_record = [];
        $this.method.selected_record = [];
    }
    $this.method.get_selected_records_length = function(){
        return $this.method.actual_selected_record.length;
    }
    $this.method.read_selected_records = function(){
        $this.method.actual_selected_record = [];
        Object.keys($this.method.selected_record).filter(function(a,b,c){
            if($this.method.selected_record[a] == true)
            {
                var index = $this.method.records.map(function(res){return parseInt(res.id_category)}).indexOf(parseInt(a));
                if(index < 0)
                {
                    console.error('Seems system cannot find category which you checked. please report to your developer!');
                    return false;
                }
                $this.method.actual_selected_record.push($this.method.records[index]);
            }
        })

    }
    $this.method.isset_on_selected_record = function(id_category){
        return $this.method.selected_record[id_category] ? true : false;
    }

    $this.method.onchange_selected_record = function(item){
        $this.method.read_selected_records();
        var len = $this.method.get_selected_records_length();
        var primary = $this.method.get_category_primary();
        if(len == 1 && primary == '')
        {
            $this.method.set_category_primary(item.id_category)   
            $this.method.set_name_category_primary(item.name)   
        }else if(len == 0)
        {
            $this.method.set_category_primary('')   
            $this.method.set_name_category_primary('')   
        }
    }
    $this.method.get_category_primary = function(){
        return $this.method.category_primary;
    }
    $this.method.set_category_primary = function(id_category){
        var check_id_category = $this.method.records.map(function(res){return res.id_category}).indexOf(id_category)
        if(check_id_category < 0 && id_category != '')
        {
            // alert('Sorry, this category name is undefined');
            return false
        }
        if(typeof id_category != '' && check_id_category > -1 )
        {
           $this.method.set_name_category_primary($this.method.records[check_id_category]['name']);
        }
        return $this.method.category_primary = id_category;
    }
    $this.method.get_name_category_primary = function(){
        return $this.method.name_category_primary;
    }
    $this.method.set_name_category_primary = function(name){
        $this.method.name_category_primary = name;
    }
    
    
    $this.method.add_category = function()
    {
        var data = {
            name: $this.method.input_new_category,
        }
        var deferred = $q.defer();

        $.post(F_Config.server_url('article/add_category'),  data)
        .done(function(res){
            res = JSON.isJSON(res)? JSON.parse(res) : res;
            deferred.resolve(res)
        })
        .fail(function(res){
            console.log(res)
        })
        deferred.promise.then(function(res){
            data.id_category = res.insertId;
            data.name = data.name;
            $this.method.records.push(data)
            $this.method.input_new_category='';
        })
    }

    return $this;
})
.factory('F_Keyword', function($rootScope, $q, F_Config){
    var $scope = angular.element('body').scope();
    var ngDirectiveName = 'ng-keyword-panel';
    var ngDirectiveTag = '['+ngDirectiveName+']';
    $scope.$$keyword = {}    
    var $this = this;
    $this.method = {}
    $this.method.input_keyword = '';
    $this.method.records = '';
    $this.method.selected_records_length = 0;
    $this.method.selected_records = [];
    $this.method.keywords = [];
    $this.method.is_select_all = false;
    $this.method.ic_select_all = 'check_box_outline_blank';
    $this.method.components = {tagSelected:[]};
    $this.method.record_process_loading = false;
    
    $this.method.set_record_process_loading = function(status)
    {
        $this.method.record_process_loading = status
        console.log($this.method.record_process_loading, status)
    }
    $this.method.get_record_process_loading = function()
    {
        return $this.method.record_process_loading;
    }
    $this.method.search_trend = function(tag)
    {
        $this.method.set_record_process_loading(true)
        tag = tag?tag:$this.method.input_keyword;
        if(tag == '' || !tag)
        {
            alert('Input keyword cannot be empty!'); return false;
        }
        $.post(F_Config.trends_url('trends/search'),{q:tag})
        .done(function(res){
            var trend_ranked_keyword = res.relatedQueries.default.rankedList[1].rankedKeyword.map(function(res){
                return res.query;
            })
            $this.method.set_records(trend_ranked_keyword)
            $this.method.set_record_process_loading(false)
            $scope.$apply();
        })
    }

    $this.method.select_all_records = function()
    {
        switch($this.method.is_select_all)
        {
            case true:
                $this.method.ic_select_all = 'check_box';
                break;
            case false:
                $this.method.ic_select_all = 'check_box_outline_blank';
                break;
            case 'partial':
                $this.method.ic_select_all = 'indeterminate_check_box';
                break;
        }
        var status = $this.method.is_select_all == true?true:false;
        $.each($this.method.records, function(a,b){
            var isExist = $this.method.is_exist_in_keyword(b);
            if(!isExist)
            {
                $this.method.selected_records[a] = status;
            }
        })

        $this.method.onchange_selected_records();
    }
    $this.method.insert_selected_records = function()
    {
        var selected = $this.method.get_selected_records();
        $.each(selected, function(a,b){
            $this.method.add_to_keyword(b)
        })
        $this.method.selected_records = [];
        $this.method.onchange_selected_records();

    }
    $this.method.get_keyword = function()
    {
        return $this.method.keywords;
    }
    $this.method.set_keyword = function(keyword)
    {
        if(Array.isArray(keyword))
        {
            $.each(keyword, function(a,b){
                $this.method.keywords.push(b);
            })
        }else
        {
            $this.method.keywords.push(keyword);
        }
    }


    $this.method.set_records = function(records)
    {
        if(!Array.isArray(records))
        {
            var isExist = $this.method.is_exist_in_keyword(records);
            if(!isExist)
            {
               $this.method.records.push(records);
            }
        }else
        {
            $this.method.records = records.filter(function(res){
                var isExist = $this.method.is_exist_in_keyword(res);
                if(!isExist)
                {
                    return res;
                }
            })
        }
    }
    $this.method.is_exist_in_keyword = function(keyword)
    {
        return $this.method.keywords.indexOf(keyword) > -1? true : false;
    }
    $this.method.removeTagSelected = function(index)
    {
        
        // $this.method.components.tagSelected.splice(index, 1);
        removeArray($this.method.keywords, index);
    }

    $this.method.add_to_keyword = function(tag)
    {
        var isTag = tag?true:false
        tag = tag?tag:$this.method.input_keyword;
        if(tag == '' || !tag)
        {
            alert('Input keyword cannot be empty!'); return false;
        }
        var isExist = $this.method.is_exist_in_keyword(tag);
        if(!isExist)
        {
            $this.method.set_keyword(tag)
            if(!isTag)
            {
                $this.method.input_keyword = '';
            }
        }else
        {
            alert('keyword has been exist');
        }

    }
    $this.method.get_selected_records = function()
    {
        var selected = []
        var numTrue = $this.method.selected_records.filter(function(res,a,b){
            if(res == true)
            {
                selected.push($this.method.records[a]);
                return res;
            }
        })

        return selected;
    }
    $this.method.onchange_selected_records = function()
    {
        var numTrue = $this.method.get_selected_records_length();
        var availableRecords = $this.method.get_available_records();

        if(numTrue == availableRecords.length)
        {   
            $this.method.ic_select_all = 'check_box';
        }else if(numTrue>0 && numTrue < availableRecords.length)
        {
            $this.method.ic_select_all = 'indeterminate_check_box';
        }else
        {
            $this.method.ic_select_all = 'check_box_outline_blank';
        }

    }
    $this.method.clear_records = function()
    {
        $this.method.records = []
        $this.method.input_keyword = ''
    }
    $this.method.get_records_length = function()
    {
        return $this.method.records.length;
    }
    $this.method.get_records = function()
    {
        return $this.method.records;
    }
    $this.method.get_available_records = function()
    {
        var records = []
        $.each($this.method.records, function(a,b){
            var isExist = $this.method.is_exist_in_keyword(b);
            if(!isExist)
            {
                records.push(b)
            }
        })
        return records;
    }

    $this.method.get_selected_records_length = function()
    {
        return $this.method.get_selected_records().length
    }

    return $this;
})
.factory('F_Upload', function($rootScope, $q, F_Config){
    var $this = {method:{}, instances:{}};
    
    $this.trigger = function(inputFileName)
    {
        angular.element('[name="'+inputFileName+'"]').trigger('click')
    }
    $this.method.force_download = function(item)
    {
        var url = F_Config.server_url('files/force_download')+'/'+item.content+'/'+item.name;
        window.open(url,'_blank')
    }
    $this.method.parseToData = function(data)
    {
        return $.Upload.parseToData(data);
    }
    $this.method.delete = function(name, keyname)
    {
        if(!$.Upload.instances[name])
        {
            alert(name+' not defined');
            return false;
        }
        if(!$.Upload.instances[name].records[keyname])
        {
            return false;
        }
        $.Upload.instances[name].method.delete(keyname)


    }
    return $this;

})
.factory('F_Slug', function($rootScope, $parse){
    $this = {method:{}}
    $this.set_scope = function($)
    {
        $this.scope = $;
    }
    function update_model(model, value)
    {
        // Get the model
        var model = $parse(model);

        // Assigns a value to it
        model.assign($this.scope, value);
    }
    $this.method.auto_fixing_slug = function()
    {
        var args = arguments;
        if(!args[0])
        {
            console.error('insufficient requirements');
            return false;
        }
        var slug = make_slug(args[0]);

        if(args[1])
        {
           update_model(args[1], slug);
        }
        return slug;
    }
    $this.method.check_permalink = function()
    {
        var args = arguments;
        if(!args[0])
        {
            console.error('insufficient requirements');
            return false;
        }
        var other_params = args[2]? args[2] : {};
        var params = $.extend({permalink: args[0]}, other_params);
        console.log(args);
        ngeblog.api('check/permalink','GET', params)
        .done(function(res){
            if(res.status == 200)
            {
                update_model(args[1], res.suggested_permalink);
                $this.scope.$apply();
            }
        })
    }
    return $this;
});

window.mainApp
.factory('F_Autosave', function($rootScope){
    $this = this;
    $rootScope.$$autosave = {}
    var autosave = window.localStorage['autosave.newpost'];
    autosave = JSON.isJSON(autosave)? JSON.parse(autosave) : [];

    $rootScope.$$autosave.records = autosave;
    $rootScope.$$autosave.close = function(){
        $rootScope.$$autosave.records = [];
        window.localStorage.removeItem('autosave.newpost')

    }
    $rootScope.$$autosave.localstorage = window.localStorage['autosave.newpost'];
    $this.records = autosave;
    return $this;
})
.directive('ngAutosave', ['F_Autosave', function(F_Autosave) {

    return {
        link: function(scope, element, attrs) {
        }
    };
}]);
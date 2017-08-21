window.mainApp
.factory('global_configuration', function(){
    var config = {}
    config.namespace_sudo = 'sudo';
    config.namespace_admin = 'admin';
    config.namespace_public = 'public';
    return config;
})
.factory('F_Config', function($rootScope, global_configuration){
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
        Cookies.set(global_configuration.namespace_public, config)
        Cookies.getJSON(global_configuration.namespace_public)
        $.each(config, function(a,b){
            _parents[a] = b;
        })
    }

    $this.components = {}
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
.factory('F_Article', function(F_Tools, F_Config, $rootScope){
    if(!$rootScope.$$article)
    {
        $rootScope.$$article = {}
    }
    $this = {fn:{}};
    $this.fn.get_article = function(data, callback, fail)
    {
        ngeblog.api('articles', 'GET', data)
        // $.post(F_Config.server_url('article/get'), {data: data })
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
        return Cookies.get('edited_article')
    }

    $this.fn.set_edited_article = function(id)
    {
        Cookies.set('edited_article', id)
    }
    return $this.fn;
});
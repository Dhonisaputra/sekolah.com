window.mainApp
.directive('compileHtml', function ($compile) {
    return function (scope, element, attrs) {
        scope.$watch(
            function(scope) {
                return scope.$eval(attrs.compileHtml);
            },
            function(value) {
                element.html(value);
                $compile(element.contents())(scope);
            }
            );
    };
})
.directive('tooltip', function ($compile) {
    return {
        link: function (scope, element, attrs) {
            $(element).tooltip()
        }
    };
})
.directive('showTab', function () {
    return {
        link: function (scope, element, attrs) {
            element.click(function (e) {
                e.preventDefault();
                $(element).tab('show');
                $(element).siblings().each(function(){
                    if($(this).hasClass('active'))
                    {
                        $(this).toggleClass('active');
                    }  
                })
                $(element).addClass('active');
            });
        }
    };
})
.directive('showModal', function () {
    return {
        link: function (scope, element, attrs) {
            element.click(function (e) {
                e.preventDefault();
                $(attrs.href).modal('show')
            });
        }
    };
})
.directive('materialDesign', function () {
    return {
        link: function (scope, element, attrs) {
            attrs.$observe('materialDesign', function(text) {
                componentHandler.upgradeDom();
            })
        }
    };
})
.directive('readMore', ['$compile', function($compile) {
    function readmore(html)
    {

    }
    return {
        link: function (scope, element, attrs) {

            var maxLength = attrs.readmoreLength? attrs.readmoreLength : 200;
            
            attrs.$observe('readMore', function(text) {
                var text = text? text : $(element).text();
                var data = $(element).data();

                if (text.length > maxLength) {
                    // split the text in two parts, the first always showing
                    var firstPart   = String(text).substring(0, maxLength);
                    var secondPart  = String(text).substring(maxLength, text.length);

                    // create some new html elements to hold the separate info
                    var firstSpan   = $compile('<span>' + firstPart + '</span>')(scope);
                    var readMoreLink = '<br><a href="#/open/article/'+data.id_article+'">Read more</a> '


                    // remove the current contents of the element
                    // and add the new ones we created
                    element.empty();
                    element.append(firstSpan);
                    element.append(readMoreLink);
                }
                else {
                    element.empty();
                    element.append(text);
                }
               
                /*console.log($(element).html())
                $('[ng-bind-html] div.readmore').each(function(){
                    $(this).nextAll().remove(); 
                    var data = $(this).parents('[ng-bind-html]').data()
                    if(data && data.id_article)
                    {
                        $(this).after('<a href="#/open/article/'+data.id_article+'">Read more</a>')
                    }
                    $(this).remove()
                })*/
            })
        }
    };
}])
.directive('inputFile', ['F_Upload','$rootScope', '$q', function(F_Upload, $rootScope, $q) {
    return {
        link: function(scope, element, attrs) {
            // reset rootscope
            $rootScope.$watch('$$upload', function(a,b,c){
                if(!$rootScope.$$upload.instances)
                {
                    $rootScope.$$upload.instances
                }
                attrs.$observe('type', function(data) {
                    if(data == 'file')
                    {
                        new Uploadify($(element), {name: attrs.name, target:element})
                        if(!$rootScope.$$upload.instances[attrs.name] )
                        {
                            $rootScope.$$upload.instances[attrs.name] = {records:[]}
                        }
                    }
                })
            })
        }
    }

}])
.directive('ngUploadPanel', ['F_Upload','$rootScope', '$q', function(F_Upload, $rootScope, $q) {
    return {
        templateUrl: '/components/templates/others/upload/administrator.upload.panel.html',
        link: function(scope, element, attrs) {
            $rootScope.$$upload = F_Upload;
            


            $('input[type="file"]').on('change', function(event){
                var ui = $(this)
                var name = ui.attr('name');
                if(!ui.attr('name') )
                {
                    alert('Please specify name in input');
                    return false;
                }
                $.Upload( ui, {name: ui.attr('name')})
                .done(function(res){
                    $rootScope.$$upload.instances[name].records = $.Upload.records[name]                    
                    $rootScope.$apply();
                })
            })
        }
    };
}])
.directive('pagination', ['$timeout','$posts', '$rootScope','$compile', 'F_Tools', '$pagination', '$http', 'F_Pagination', function($timeout, $posts, $rootScope, $compile, F_Tools, $pagination, $http, F_Pagination) {
    var records = [];
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            attrs.$observe('paginationData', function(records) {

                    var $this   = {}
                    var name    = attrs.name? attrs.name : undefined
                    var pageSize = attrs.paginationSize? attrs.paginationSize : 5;
                    var currentPage = attrs.paginationCurrentPage ? attrs.aginationCurrentPage : 1;
                    records = F_Tools.isJson(records)? JSON.parse(records) : records;

                    var options = attrs.paginationOptions;

                    if(!name)
                    {
                        alert('Please define some name for this pagination!');
                        return false;
                    }
                    if(!records && F_Tools.isJson(options))
                    {
                        options = $.extend({ajax:{}}, JSON.parse(options))
                        if(!options)
                        {
                            alert('Data not found!')
                            return false;
                        }else if(!options.ajax.url)
                        {
                            alert('No data provider found!')
                            return false;
                        }

                        // server side data
                        F_Pagination.new_pagination({
                            name: name,
                            pageSize: pageSize,
                            ajax:
                            {
                                url: options.ajax.url,
                                method: options.ajax.method?options.ajax.method:'POST',
                                data: {limit_length: pageSize}
                            }                        
                        })
                    }else if(records && records.length > 0){
                        // local side data
                        F_Pagination.new_pagination({
                            name: name,
                            pageSize: pageSize,
                            records: records                        
                        })
                    }else
                    {
                        return false;
                    }
            })
            
        }
    };
}])
.directive('paginationSearch', ['$timeout','$posts', '$rootScope','$compile', '$tools', '$pagination', '$http', 'F_Pagination', function($timeout, $posts, $rootScope, $compile, $tools, $pagination, $http, F_Pagination) {
    return {
        link: function(scope, element, attrs) {
            attrs.$observe('paginationSearch', function(text) {
                element.bind("keydown keypress", function (event) {
                    if(event.which === 13) {
                        var value = $(element).val()
                        var column = attrs.paginationSearchColumn? attrs.paginationSearchColumn.split(',') : $rootScope.$$pagination.instances[text].search.column
                        $rootScope.$$pagination.instances[text].set_search_column(column);
                        $rootScope.$$pagination.instances[text].searching(value)

                        event.preventDefault();
                    }
                });
            })
        }
    }
}])
.directive('textCollapse', ['$compile', function($compile) {

    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            // start collapsed
            scope.collapsed = false;

            // create the function to toggle the collapse
            scope.toggle = function() {
                scope.collapsed = !scope.collapsed;
            };

            // wait for changes on the text
            attrs.$observe('textCollapseText', function(text) {

                // get the length from the attributes
                var maxLength = scope.$eval(attrs.textCollapseLength);

                if (text.length > maxLength) {
                    // split the text in two parts, the first always showing
                    var firstPart   = String(text).substring(0, maxLength);
                    var secondPart  = String(text).substring(maxLength, text.length);

                    // create some new html elements to hold the separate info
                    var firstSpan       = $compile('<span>' + firstPart + '</span>')(scope);
                    var secondSpan      = $compile('<span ng-if="collapsed">' + secondPart + '</span>')(scope);
                    var moreIndicatorSpan = $compile('<span ng-if="!collapsed">... </span>')(scope);
                    var lineBreak       = $compile('<br ng-if="collapsed">')(scope);
                    var toggleButton    = $compile(' <a class="collapse-text-toggle" ng-click="toggle()">{{collapsed ? "read less" : "read more"}}</a> ')(scope);

                    // remove the current contents of the element
                    // and add the new ones we created
                    element.empty();
                    element.append(firstSpan);
                    element.append(secondSpan);
                    element.append(moreIndicatorSpan);
                    element.append(lineBreak);
                    element.append(toggleButton);
                }
                else {
                    element.empty();
                    element.append(text);
                }
            });
        }
    };
}])
.directive('ngComment', ['$compile', 'F_Comment', 'F_Tools', function($compile, F_Comment, F_Tools) {
    
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attrs) {
            if(!attrs.ngCommentName)
            {
                alert('name required to use this directive. please add parameters ng-comment-name');
                return false;
            }
            if(!scope.__comment)
            {
                scope.__comment = {__helper:F_Comment.fnHelper}
            }
            scope.__comment[attrs.ngCommentName] = {}
            scope.__comment[attrs.ngCommentName][F_Comment.components.scope_name] = F_Comment.components.object_components;
            // scope[F_Comment.components.scope_name] = F_Comment.components.object_components;
            
            F_Comment.comment_credential.initialize();
            attrs.$observe('ngCommentData', function(data) {
                F_Comment.setRecords(name, data)
            })
            var newDirective = angular.element(F_Comment.components.element_supports);
            element.html(newDirective);
            $compile(newDirective)(scope);

        }
    };
}])
.directive('ngCommentCredential', ['$compile', 'F_Comment', function($compile, F_Comment) {
    
    return {
        link: function (scope, element, attrs) {

        }
    };
}])
.directive('ngCommentArticleTextarea', ['$compile', 'F_Comment', function($compile, F_Comment) {
    
    return {
        link: function (scope, element, attrs) {
            
        }
    };
}])
.directive('ngCommentArticleCommentList', ['$compile', 'F_Comment', function($compile, F_Comment) {
    
    return {
        link: function (scope, element, attrs) {
            console.log(scope)
        }
    };
}])
.directive('ngCommentReplyingCommentList', ['$compile', 'F_Comment', function($compile, F_Comment) {
    
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attrs) {
            attrs.$observe('ngCommentData', function(data) {
                $(element).hide();
            })
            
        }
    };
}])
.directive('ngCommentCommentEditor', ['$compile', 'F_Comment', function($compile, F_Comment) {
    
    return {
        scope: true,
        link: function (scope, element, attrs) {
            $(element).on('click', function(res){
                console.log('clicked')
                var config = {
                    extraPlugins:'autogrow', 
                    toolbar:[
                        { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Strike' ] },
                        { name: 'paragraph', items: [ 'NumberedList', 'BulletedList'] }
                    ], 
                    autoGrow_minHeight: 150,
                    autoGrow_maxHeight: 200,
                    height: 150
                }

                    if(!$(this).hasClass('isckeditor'))
                    {
                        $(this).addClass('isckeditor').ckeditor(config) 
                    }

            })
           /* attrs.$observe('ngCommentCommentEditor', function(data) {
                console.log(element, attrs, attrs.ngCommentCommentEditor)
            })*/
            /*if(attrs.ngCommentCommentEditor != undefined)
            {
                // config CKEDITOR
            }*/
        }
    };
}])
.directive('ngCommentRepeatingData', ['$compile', 'F_Comment', function($compile, F_Comment) {
    
    return {
        scope: true,
        link: function (scope, element, attrs) {
            var parentsname = $(element).closest('[ng-comment]').attr('ng-comment-name');
            // console.log()
            var e = '<div class="row comment-item" ng-repeat="comment_item in __comment.'+parentsname+'.comment_components.records | sortBy: \'-comment_timestamp\'" ng-include="\'templates/others/comment/comment.list.item.html\'" ng-if="comment_item.id_comment_reference == \'0\'" ng-article-comment="{{comment_item.id_comment}}"></div>'
            var newDirective = angular.element(e);
            element.html(newDirective);
            $compile(newDirective)(scope);

        }
    };
}])
.directive('ngCommentButtonReplyComment', ['$compile', 'F_Comment', function($compile, F_Comment) {
    
    return {
        scope: true,
        link: function (scope, element, attrs) {

        }
    };
}])
.directive('ngCommentList', ['$compile', 'F_Comment', function($compile, F_Comment) {
    
    return {
        scope: true,
        link: function (scope, element, attrs) {
            attrs.$observe('ngCommentData', function(data) {
                F_Comment.setRecords(data)
            })
        }
    };
}])
.directive('ngArticle', ['$compile', 'F_Tools', 'F_Article', function($compile, F_Tools, F_Article) {
    return {
        link: function (scope, element, attrs) {
            var type = attrs.ngArticleType ? attrs.ngArticleType : 'news';
            var typeIn = [];
            var typeNotIn = [];
            type = type.split(',');
            
            $.each(type, function(a,b){
                if(b[0] == '!')
                {
                    b = b.substr(1);
                    typeNotIn.push(b)
                }else
                {
                    typeIn.push(b)
                }

            })
            var articleName = attrs.ngArticleName ? attrs.ngArticleName : 'article';

            // jika object dengan nama yang sama sudah tersedia.
            if(scope[articleName])
            {
                alert('Error. Object named '+articleName+' has been exist. for further information, check your console.log');
                console.error('Object named '+articleName+' has been exist. If you consist want to use the name, please add attribtue "ng-article-name-overwrite" to overwrite the object!');
                return false;
            }

            F_Article.get_article(
                {article_type: type, typeIn: typeIn, typeNotIn: typeNotIn},
                function(res)
                {
                    // jika terdapat attribute ng-article-id, maka ambil object dengan id tersebut.
                    if(attrs.ngArticleId)
                    {
                        var index = res.map(function(res){return res.id_article}).indexOf(attrs.ngArticleId)
                        res = res[index];
                    }
                    scope[articleName] = res;
                    scope.$apply()
                },
                function(res)
                {
                    console.log(res);
                })
        }
    };
}])
.directive('ngSlick', ['$compile', 'F_Tools', 'F_Article', '$routeParams', '$sce', function($compile, F_Tools, F_Article, $routeParams, $sce) {
    return {
        scope: {
          customerInfo: '=info'
        },
        link: function (scope, element, attrs) {
            var params = F_Tools.isJson(attrs.ngSlickParameters)? JSON.parse(attrs.ngSlickParameters) : {}
            setTimeout(function(){
                $(element).slick(params);
            },100)
        }
    };
}])

.directive('ngArticleOpen', ['$compile', 'F_Tools', 'F_Article', '$routeParams', '$sce', function($compile, F_Tools, F_Article, $routeParams, $sce) {
    return {
        link: function (scope, element, attrs) {
            // var params = attrs.ngArticleParameters.split(',');
            var type = attrs.ngArticleType ? attrs.ngArticleType : 'news';
            var articleName = attrs.ngArticleName ? attrs.ngArticleName : 'article';
            if(scope[articleName])
            {
                alert('Error. Object named '+articleName+' has been exist. for further information, check your console.log');
                console.error('Object named '+articleName+' has been exist. If you consist want to use the name, please add attribtue "ng-article-name-overwrite" to overwrite the object!');
                return false;
            }

            // jika object dengan nama yang sama sudah tersedia.

            F_Article.get_article(
            'articles.id_article ='+$routeParams.id_article,
            function(res)
            {
                // jika terdapat attribute ng-article-id, maka ambil object dengan id tersebut.
                scope[articleName] = res[0];
                scope.title = scope[articleName].title;
                if(!scope.comment)
                {
                    scope.comment = {}
                }
                scope.comment.id_article = parseInt(scope[articleName].id_article);

                scope[articleName].content = $("<textarea/>").html(scope[articleName].content).val()
                var $trusted = $sce.trustAsHtml(scope[articleName].content);
                scope[articleName].trusted_content = $trusted;
                F_Article.update_viewer(scope[articleName].id_article, parseInt(scope[articleName].counter_post) );
                scope.$apply();
                // scope.init_ads();
                $('[xss] iframe').each(function(a,b){
                    $(b).css({position:'inherit'})
                })
                scope.$apply()
            },
            function(res)
            {
                console.log(res);
            })
        }
    };
}])
.directive('initializeBlog', ['$rootScope', '$owner', '$config', '$ads', '$tools', function($rootScope, $owner, $config, $ads, $tools) {

    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            $config.set_source(attrs.source);
            
          
        }
    };
}])
.directive('ngMoment', ['F_Moment', function(F_Moment) {

    return {
        link: function(scope, element, attrs) {
            scope.moment = $.extend(moment, F_Moment);
        }
    };
}])
.directive('ngCkeditor', ['F_Tools', function(F_Tools) {

    return {
        link: function(scope, element, attrs) {
            // scope.ckeditor[attrs.name] = element
            var editor = CKEDITOR.instances[attrs.name];
            var updateModel = function(){
                return scope.$apply(function() {
                    scope.newpost.content = editor.getData();
                });
            }
            editor.on('instanceReady', function() {
                editor.on('change', updateModel);
            });
            /*if(!scope.ckeditor)
            {
                scope.ckeditor = {}
            }
            attrs.$observe('ngCkeditorParameters', function(text) {
                text = F_Tools.isJson(text)? JSON.parse(text) : text;
                $(element).ckeditor(text)

            })*/

        }
    };
}])
.directive('ngEvent', ['F_Event', function(F_Event) {

    return {
        link: function(scope, element, attrs) {
            scope.event = F_Event;
        }
    };
}])
.directive('ngSocialfeed', ['F_Tools', function(F_Tools) {

    return {
        link: function(scope, element, attrs) {
            attrs.$observe('ngSocialfeedParameters', function(text) {
                text = F_Tools.isJson(text)? JSON.parse(text) : text;
                console.log(text)

            })
        }
    };
}])
.directive('ngMainMenu', ['F_Tools', 'F_Config', function(F_Tools,F_Config) {
    return {
        link: function(scope, element, attrs) {
            var $objName = attrs.name? attrs.name : 'itemmenu';
            ajax({
                url: F_Config.server_url('blog/menu'),
            })
            .done()
        }
    };
}])
.directive('ngImages', ['F_Tools', 'F_Image', function(F_Tools,F_Image) {
    return {
        link: function(scope, element, attrs) {
            var $data = attrs.ngImagesData ? attrs.ngImagesData : []
            var $name = attrs.ngImagesName ? attrs.ngImagesName : 'images';

            if($data.length < 1)
            {
                F_Image.get_images()
                .done(function(res){
                    res = JSON.parse(res);
                    scope[$name] = res;
                    scope.$apply();
                    componentHandler.upgradeDom();
                })
                .fail(function(res){
                    console.log(res)
                })
            }else
            {
                scope[$name] = res;
                scope.$apply();
            }
        }
    };
}])
.directive('ngAccordion', [function() {
    function is_collapse(element)
    {
        return $(element).hasClass('collapsed');
    }

    function collapse(element, attrs)
    {
        $(element).addClass('collapsed')
        $(attrs.ngAccordion).slideUp('fast');
    }

    function uncollapse(element, attrs)
    {
        $(element).removeClass('collapsed')
        $(attrs.ngAccordion).slideDown('fast');

    }
    return {
        link: function(scope, element, attrs) {
            switch(attrs.accordionDefault)
            {
                case 'collapse-all':
                    if(attrs.accordionGroup)
                    {
                        // jika tidak ada attrs accordion-group, sibling add class collapsed
                        $('[accordion-group="'+attrs.accordionGroup+'"]').each(function(){
                            var target = $(this).attr('ng-accordion');
                            $(this).addClass('collapsed')
                            $(target).slideUp('fast')
                        })
                    }
                    break;

                case 'collapse':
                    $(element).addClass('collapsed')
                    $(attrs.ngAccordion).slideUp('fast');
                    break;

                default:
                    // $(element).addClass('accordion-shown');
                    break;
            }
            if(attrs.accordionOpen !== undefined)
            {
                uncollapse(element, attrs)
            }

            $(element).on('click',function(e){
                if($('[accordion-group="'+attrs.accordionGroup+'"][accordion-sync]').length > 0)
                {
                    $('[accordion-group="'+attrs.accordionGroup+'"]').not(this).each(function(){
                        var target = $(this).attr('ng-accordion');
                        if(!$(this).hasClass('collapsed'))
                        {
                            $(this).addClass('collapsed')
                            $(target).slideUp('fast')
                        }
                    })      
                }

                if(!$(element).hasClass('collapsed') && $('[accordion-group="'+attrs.accordionGroup+'"][accordion-sync]').length < 1)
                {
                   collapse(element, attrs)
                }else
                {
                   uncollapse(element, attrs)
                    
                }

                // $(element).removeClass('collapsed')
                // $(attrs.ngAccordion).slideDown('fast');
            })
        }
    };
}])
.directive('ngRelatedArticle', ['F_Tools', 'F_Config', '$rootScope', 'F_Archive', '$location', function(F_Tools,F_Config,$rootScope, F_Archive, $location) {
    return {
        templateUrl: 'components/templates/others/archive/index.html',
        link: function(scope, element, attrs) {
            scope.$$archive = F_Archive.root;
            if(scope.$$archive.records.length < 1)
            {
                F_Archive.method.archive_article()
            }

            $('#archive_modal').on('hide.bs.modal', function (event) {
                scope.$$archive.components.related = !scope.$$archive.components.related;
                scope.$apply();
            })
        }
    };
}])
.directive('ngKeywordPanel', ['F_Tools', 'F_Config', '$rootScope', 'F_Keyword', function(F_Tools,F_Config,$rootScope, F_Keyword) {
    return {
        templateUrl: '/components/templates/others/keywords/keywords.html',
        link: function(scope, element, attrs) {
            scope.$$keyword = F_Keyword.method;
            scope.$$keyword.keywords = [];
            scope.$watch('$$keyword', function(a,b,c){
            },true)

        }
    };
}])
.directive('ngCategoriesPanel', ['F_Tools', 'F_Config', '$rootScope', 'F_Categories', function(F_Tools,F_Config,$rootScope, F_Categories) {
    return {
        templateUrl: '/components/templates/others/categories/administrator.categories.html',
        link: function(scope, element, attrs) {
            F_Categories.method.reset();
            scope.$$categories = F_Categories.method;
            F_Categories.method.get()
            .then(function(res){
                scope.$$categories.set_records(res)
            })
        }
    };
}])
.directive('ngSlug', ['F_Tools', '$rootScope', 'F_Slug', function(F_Tools,$rootScope, F_Slug) {
    return {
        link: function(scope, element, attrs) {
            F_Slug.set_scope(scope)
            scope.$$slug = F_Slug;
        }
    };
}]);

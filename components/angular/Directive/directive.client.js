window.mainApp
.directive('ngArticle', ['$compile', 'F_Article', function($compile, F_Article) {
    return {
        link: function (scope, element, attrs) {
            var type = attrs.ngArticleType ? attrs.ngArticleType : 'news';
            var typeIn = [];
            var typeNotIn = [];
            var where = attrs.ngArticleWhere ? attrs.ngArticleWhere : {};
            if(JSON.isJSON(where))
            {
                where = JSON.parse(where)
            }

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
            });
            
            var articleName = attrs.ngArticleName ? attrs.ngArticleName : 'article';

            // jika object dengan nama yang sama sudah tersedia.
            if(scope[articleName])
            {
                alert('Error. Object named '+articleName+' has been exist. for further information, check your console.log');
                console.error('Object named '+articleName+' has been exist. If you consist want to use the name, please add attribtue "ng-article-name-overwrite" to overwrite the object!');
                return false;
            }

            F_Article.get_article(
                {where: where, typeIn: typeIn, typeNotIn: typeNotIn},
                function(res)
                {
                    // jika terdapat attribute ng-article-id, maka ambil object dengan id tersebut.
    console.log(res)
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
/**
 * Author: humanhuang
 * Date: 14-1-3
 */
//var $ = function (id) {
//    return document.getElementById(id);
//};
//分号是必须加的
(function (window, undefined) {


    var _$ = window.$;  //内部
    var _cQuery = window.cQuery;
    var cQuery = function () {
        return new cQuery.fn.init();
    }

    cQuery.fn = cQuery.prototype = {

        init: function () {
            return this;
        },
        test: function () {
            console.log('test');
        }
    }

    cQuery.fn.init.prototype = cQuery.fn;

    cQuery.extend = cQuery.fn.extend = function (obj) {
        for (var prop in obj) {
            this[ prop ] = obj[ prop ];
        }
        return this;
    }

    cQuery.noConflict = function () {
        window.$ = _$;
        return cQuery;
    }

    window.$ = window.cQuery = cQuery;
})(window);

cQuery.extend({
    parseURL: function (obj) {
        var str = [];
        for (var prop in obj) {
            var pair = '' + prop + '=' + obj[prop];
            str.push(pair);
        }
        return str.join('&');
    }
});

$$ = window.$.noConflict();
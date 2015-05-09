/**
 * Author: humanhuang
 * Date: 14-1-3
 */

;
(function (window,name) {

    var _hi = window.hi,
        hi,
        created,
        instance;

    hi = function () {
        if(created){
            return instance;
        }
        created = true;
        return instance = new hi();
    };
    hi.prototype = {
        version:'0.1',
        package : function(fn){
            fn.call(window,instance);
        }
    }

    var exportName = name || '$hi';
    window[exportName] =hi;

})(window);

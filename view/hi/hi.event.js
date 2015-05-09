/**
 * User: humanhuang
 * Date: 14-1-11
 * Time: 下午6:56
 */

;
(function (master) {

    var $E = function(dom){
    }


    $E.guid = function(pre){
        return ( pre || 'hijs' ) +
            ( +new Date() ) +
            ( Math.random() + '' ).slice( -8 );
    }
    var on = function(){

    }

    var off = function(){

    }

    var event = {
        on:on,
        off:off
    }

})(window);
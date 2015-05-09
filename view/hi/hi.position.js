/**
 *
 * User: humanhuang
 * Date: 14-1-5
 * Time: 下午7:44
 */
(function (master) {


    /**
     * 计算元素的滚动条偏移量
     * @param {Window} w
     * @returns {*}
     */
    function getScrollOffset(w){
        w = w || window;
        if(w.pageXOffset) return {x: w.pageXOffset,y: w.pageYOffset};

        var d = w.document;
        if(document.compactMode == 'CSS1Compat')
            return {x:d.documentElement.scrollLeft,y: d.documentElement.scrollTop};

        //怪异模式
        return {x: d.body.scrollLeft,y: d.body.scrollTop};
   }

    /**
     * 计算一个window的屏幕尺寸
     * @param {Window} w
     * @returns {*}
     */
    function getViewportSize(w){
        w = w || window;

        // <IE8
        if(w.innerWidth) return {w: w.innerWidth,h: w.innerHeight};

        var d = w.document;
        if(document.compactMode == 'CSS1Compat')
            return {w:d.documentElement.clientWidth,y: h.documentElement.clientHeight};

        //怪异模式
        return {w:d.body.clientWidth,y: h.body.clientHeight};
    }

    /**
     * 返回屏幕点（x，y）对应的元素
     * @param x
     * @param y
     * @returns {*}
     */
    function getElementByPoint(x,y,document){
        return document.elementFromPoint(x,y);
    }

    /**
     * 获得元素相对文档的位置
     * @param el
     * @returns {{x: number, y: number}}
     */
    function getElementPositionByDoc(el){
        var x = 0,y=0;
        while(el){
            x += el.offsetLeft;
            y+= el.offsetTop;
            el = el.offsetParent;
        }
        return {x:x,y:y};
    }

    /**
     * 获得元素相对屏幕的位置
     * @param el
     * @returns {{x: number, y: number}}
     */
    function getElementPositionByScreen(el){
        if(el.getBoundingClientRect){
            var b =  el.getBoundingClientRect();
            return {x: b.left,y: b.top};
        }


        var x = 0,y=0;
        while(el){
            x += el.offsetLeft;
            y+= el.offsetTop;
            el = el.offsetParent;
        }

        for(var ep = el.parentNode ; ep && ep.nodeType == 1; ep = ep.parentNode){
            x -= ep.scrollLeft;
            y -= ep.scrollTop;
        }
        return {x:x,y:y};
    }
    // el.clientTop 边框的宽度
    // el.offsetWith 元素边框width + 内边距（padding）
    // el.clientWidth 元素内边距(paddnig)
    // el.offsetLeft 元素的外边框开始 到 父元素的内边框 并且元素的祖先节点必须要是定位过.


    master.$P = {
        getScrollOffset:getScrollOffset
    }
})(window);

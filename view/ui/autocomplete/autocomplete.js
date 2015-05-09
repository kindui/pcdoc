/**
 * User: humanhuang
 * http://www.cnblogs.com/human
 */
var autoComplete = (function () {

    ngAutoComplete.config = {
        listHeight:     180,    //下拉框高度(px)
        liHeight:       18,     // 只读属性
        placeholder:    false,  //输入框placeholder
        data:           null,   //传入数据
        el:             null,   //输入框
        closeDelay:     300,    //延时关闭时间(ms)
        keyupDelay:     200,    //按键触发时间(ms)
        width:          null,   //下拉框的宽度
        max:            null,   //下拉框的项数
        matchCase:      true,   //是否区分大小写
        autoOpen:       false,

        onSelect:       null,   //回调函数function(value)

        url:            null,   //ajax远程cgi
        paramName:      'q',    //AJAX请求的参数
        method:         'GET',  //ajax 请求方法 {GET | POST}
        root:           null    //指定data对象的数组字段为数据
    }

    var KEY = {
        UP:     38,
        DOWN:   40,
        ENTER:  13,
        ESC:    27,
        TAB:    9
    }

    function ngAutoComplete(opt) {

        if (!(this instanceof ngAutoComplete)) {
            throw new Error('autocomplete must be new');
        }

        this.config = $.extend({}, ngAutoComplete.config, opt);


        /********************** 用户设置  ***************************/
        this.$el = $(this.config.el);

        if(this.config.data){
            if(this.config.root){
                this.data = $.extend([],this.config.data[this.config.root]);
            }else{
                this.data = $.extend([], this.config.data);
            }
        }
        this.config.placeholder && this.$el.attr('placeholder', this.config.placeholder);
        this.$el.attr('autocomplete', 'off');
        /********************** 用户设置  ***************************/


        /********************** 内部使用  ***************************/
        this.closeTimer         = null;
        this.keyupTimer         = null;
        this.filteredData       = null;         //过滤得到的数组
        this.filteredDataHTML   = null;         //过滤得到的数组HTML
        this.$curEl             = null;
        this.cacheLastInputValue= void(0);      //缓存上一次inputbox的值
        this.isSelected         = false;        // 是否已经选择项
        this.focusing           = false;        // 输入框是否获得焦点
        this.isMouseoverList    = false;        // 鼠标是否hover在下拉列表上
        //  focusing    ||  isMouseoverList     => 显示
        //  !focusing   &&  !isMouseoverList   => 隐藏

        this.elWidth  = this.$el.outerWidth();
        this.elHeight = this.$el.outerHeight();

        this.position = getElementPositionByDoc(this.$el[0]);
        /********************** 内部使用  ***************************/

        this.init();
        this.bindEvent();
    }


    ngAutoComplete.prototype.init = function () {

        var height = this.config.max && this.config.max * this.config.liHeight || this.config.listHeight;
        var width  = this.config.width && this.config.width || this.elWidth;

        this.$div = $('<div/>').css({
            'width'     : width,
            'position'  : 'absolute',
            'left'      : this.position.x,
            'top'       : this.position.y + this.elHeight,
            'border'    : '1px solid black',
            'max-height': height,
            'display'   : 'none'
        }).addClass('ng-autocomplete').appendTo(document.body);
    }

    ngAutoComplete.prototype.filterData = function (value, dataList) {
        var valReg = new RegExp('(' + value + ')', 'i');
        var filteredData = [];
        var filteredDataHTML = [];

        if (value) {
            for (var i = 0, l = dataList.length; i < l; i++) {
                var item = String(dataList[i]);
                if (this.config.matchCase ? item.indexOf(value) != -1 : item.toLowerCase().indexOf(value.toLowerCase()) != -1) {
                    filteredData.push(item);
                    filteredDataHTML.push(item.replace(valReg, '<strong>$1</strong>'));
                }
            }
        } else {
            filteredData     = this.config.autoOpen == true ? $.extend([], dataList) : [];
            filteredDataHTML = this.config.autoOpen == true ? $.extend([], dataList) : [];
        }

        this.filteredData     = filteredData;
        this.filteredDataHTML = filteredDataHTML;

        return {
            data: filteredData,
            htmlData: filteredDataHTML
        }
    }
    ngAutoComplete.prototype.renderList = function () {
        var me = this;
        if (this.config.url) {
            var data = {};
            data[this.config.paramName] = this.$el.val();
            var retData;
            $.ajax({
                url: this.config.url,
                async: false,
                method: me.config.method,
                data: data,
                dataType: 'json',
                success: function (ret) {
                        retData = ret;
                },
                error:function(ret){
                    throw new Error('返回json数据格式错误');
                }
            });

            if(this.config.root){
                retData = retData[this.config.root];
            }
            if (retData == void(0)) {
                throw new Error('返回数据格式错误,可以是root参数指定错误');
            }
            var filterData = this.filterData(this.$el.val(), retData);
        } else {
            var filterData = this.filterData(this.$el.val(), this.data);
        }
        var htmlData = filterData.htmlData;
        var data = filterData.data;


        buildList.call(this, data, htmlData);

        function buildList(data, htmlData) {
            if (htmlData.length == 0) {
                this.$div.hide();
                return;
            }
            var even = true;
            var list = '<ul>';
            for (var i = 0, l = htmlData.length; i < l; i++) {
                var item = htmlData[i];
                list += (even ? '<li title="' + data[i] + '">' : '<li class="even" title="' + data[i] + '">') + item + '</li>';
                even = !even;
            }
            list += '</ul>';
            this.$div.html(list);
            this.$div.scrollTop(0);
            this.$curEl = this.$div.find('li:first-child').addClass('cur');
        }
    }

    ngAutoComplete.prototype.hide = function () {
        var me = this;
        if (!this.focusing && !this.isMouseoverList) {
            this.closeTimer = setTimeout(function () {
                if (!me.focusing && !me.isMouseoverList) {
                    me.$div.hide();
                    me.$el.addClass('suggesting');
                    me.hideSuggestingIcon();
                }
            }, me.config.closeDelay);
        }
    }
    ngAutoComplete.prototype.show = function () {
        var me = this;
        this.isSelected = false;
        this.closeTimer = null;
        this.filteredData.length && this.$div.show();
        this.hideSuggestingIcon();
    }

    /**
     * 移动滚动条
     */
    ngAutoComplete.prototype.moveScroll = function () {
        //div 高 180; li 高18
        var divScrollTop    = this.$div.scrollTop();
        var divHeight       = this.config.listHeight;
        var divOffsetTop    = divHeight + divScrollTop;
        var curLiOffsetTop  = this.$curEl[0].offsetTop;
        var liHeight        = this.config.liHeight;

        var offset = divOffsetTop - curLiOffsetTop;
        if (offset >= divHeight - liHeight) {
            this.$div.scrollTop(divScrollTop - liHeight);
        }
        if (offset <= liHeight * 2) {
            this.$div.scrollTop(divScrollTop + liHeight);
        }
    }

    /**
     * 关闭图标
     */
    ngAutoComplete.prototype.hideSuggestingIcon = function () {
        var me = this;
        setTimeout(function () {
            me.$el.removeClass('suggesting');
        }, 200);
    }

    /**
     * 向下或者向上移动下拉列表项
     * @param next{true(向下) | false(向上)}
     */
    ngAutoComplete.prototype.moveItem = function (next) {

        if( this.$curEl ==null){
            this.$curEl = this.$div.find('li:first-child').addClass('hover');
            return ;
        }

        var direction = next ? 'next' : 'prev';
        var $next = this.$curEl.removeClass('cur')[direction]();
        if ($next.length) {
            this.moveScroll();
            this.$curEl = $next.addClass('cur');
        } else {
            if (next) {
                this.$curEl = this.$div.find('li').first().addClass('cur');
                this.$div[0].scrollTop = 0;
            } else {
                this.$curEl = this.$div.find('li').last().addClass('cur');
                var div = this.$div[0];
                div.scrollTop = div.scrollHeight;
            }
        }
    }

    /**
     * 选择项目
     */
    ngAutoComplete.prototype.clickItem = function () {
        if (this.$curEl) {
            this.isSelected = true;
            this.$el.addClass('suggesting');
            this.$el.val(this.$curEl.text());
            this.$div.hide();
            this.hideSuggestingIcon();
            this.config.onSelect && this.config.onSelect.call(null, this.$el.val());
        }
    }

    /**
     * 打开面板的操作
     */
    ngAutoComplete.prototype.openList = function () {
        var me = this;
        me.$el.addClass('suggesting');
        clearTimeout(me.keyupTimer);
        me.keyupTimer = setTimeout(function () {
            me.isSelected = false;
            (me.cacheLastInputValue != me.$el.val()) && me.renderList();
            me.show();
            me.cacheLastInputValue = me.$el.val();
        }, me.config.autoOpen ? 0 : me.config.keyupDelay);
    }

    ngAutoComplete.prototype.bindEvent = function () {
        var me = this;
        /************输入框事件绑定 (ESC ENTER TABLE)  ************/

        this.$el
            .keyup(function (e) {
                switch (e.which) {

                    case  KEY.ESC:
                        me.$div.hide();
                        break;

                    case  KEY.ENTER:
                    case  KEY.TAB:
                    case  KEY.UP:
                    case  KEY.DOWN:
                        break;

                    default:
                        me.focusing = true;
                        me.openList();
                }
            })
            .keydown(function (e) {
                switch (e.which) {

                    case  KEY.UP:
                        me.moveItem(false);
                        e.preventDefault();
                        break;

                    case  KEY.DOWN:
                        me.moveItem(true);
                        e.preventDefault();
                        break;

                    case KEY.TAB:
                    case KEY.ENTER:
                        me.clickItem();
                        e.preventDefault();
                        break;
                }
            })
            .mouseenter(function (e) {
                me.focusing = true;
            })
            .focus(function (e) {
                me.focusing = true;
                (me.config.autoOpen || me.$el.val() != '') && me.openList();
            })
            .blur(function (e) {
                me.focusing = false;
                me.hide();
            });

        /************输入框事件绑定 (ESC ENTER TABLE)  ************/


        /************列表框事件绑定********************************/
        this.$div
            .mouseenter(function (e) {
                me.isMouseoverList = true;
            })
            .mouseleave(function (e) {
                me.isMouseoverList = false;
                //没有选中,这重新focus输入框
                !me.isSelected && me.$el.focus();
            })
            //不可拉黑文字
            .bind('selectstart', function (e) {
                return false;
            });
        /************列表框事件绑定********************************/


        /************item项事件绑定********************************/
        this.$div
            .mouseover(function (e) {
                if (e.target.nodeName == 'LI') {
                    me.$curEl && me.$curEl.removeClass('cur');
                    me.$curEl = $(e.target).addClass('cur');
                }
            })
            .click(function (e) {
                if (e.target.nodeName == 'LI') {
                    me.clickItem();
                    e.preventDefault();
                }
            });
        /************item项事件绑定********************************/

    }

    //获得元素相对文档的位置
    function getElementPositionByDoc(el) {
        var x = 0, y = 0;
        while (el) {
            x += el.offsetLeft;
            y += el.offsetTop;
            el = el.offsetParent;
        }
        return {x: x, y: y};
    }

    return ngAutoComplete;
})();

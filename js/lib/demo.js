/**
 * Author: humanhuang
 * Date: 14-1-1
 */

(function () {
    var Demo = window.Demo || {}

// 实例代码
    Demo.exs = [];
    Demo.config = {

    }


    /**
     * 输出日志
     */
    Demo.ret = [];
    Demo.log = function (msg) {
        var color = Demo.ret % 2 == 0 ? 'red' : 'blue';
        var msgJson = JSON.stringify(msg);
        msgJson = '<span style="color:' + color + '">' + msgJson + '</span>';
        Demo.ret.push(msgJson);
        console.log(msg);
    }

    /**
     * 解析url参数
     * @returns {{}}
     */
    Demo.parseSearch = function () {
        var paramsStr = window.location.search.slice(1);
        var p = paramsStr.split('&');
        var i = -1, L = p.length, map = {};
        while (++i < L) {
            var pair = p[i].split('=');
            map[pair[0]] = Demo.de(pair[1]);
        }
        return map;
    }

    Demo.init = function () {
        document.write('<link type="text/css" rel="stylesheet" href="' + g.root + 'css/demo.css">');
        document.write('<link type="text/css" rel="stylesheet" href="' + g.root + 'css/prettify.css">');
        document.write('<script type="text/javascript" src="' + g.root + 'js/lib/jquery-1.9.1.js"></script>');
        document.write('<script type="text/javascript" src="' + g.root + 'js/lib/artT.js"></script>');
        document.write('<script type="text/javascript" src="' + g.root + 'js/lib/prettify.js"></script>');
    }

    //search box
    Demo.timmerSearch = null;
    Demo.searchHide = function (e) {
        Demo.timmerSearch = setTimeout(function () {
            $('#demo-toolbar-goto').hide();
        }, 500);
    }
    Demo.searchShow = function (e) {
        clearTimeout(Demo.timmerSearch);
    }
    Demo.curHoverLink;
    Demo.alinkHover = function (e, el) {
        Demo.curHoverLink && $(Demo.curHoverLink).removeClass('demo-toolbar-dropdown-menu-hover');
        $(el).addClass('demo-toolbar-dropdown-menu-hover');
        Demo.curHoverLink = el;
        search_index =  $(el).closest('.demo-toolbar-dropdown-menu').children().index(el);
    }
//search box

    /**
     * 渲染搜索框，绑定事件
     */
    var search_index = -1;
    Demo.writeSearchBox = function (data) {
        var search_datas = {
            name: '',
            list: []
        };

        $.each(data, function (_, item) {
            var module_name = item.name;
            $.each(item.list, function (__, item2) {

                var href = g.root + 'view/' + module_name + '/' + item2[1] + '?name=@name@&controller=@controller@&desc=@desc@';
                href = href.replace('@name@', item2[0]).
                    replace('@controller@', module_name).
                    replace('@desc@', item2[2]);

                search_datas.list.push({
                    name: module_name + '/' + item2[0],
                    href: href,
                    desc: item2[2]
                });
            });
        });

        //搜索框
        var s_box_html = template.compile(Demo.getTpl('search_box_tpl'))(search_datas);
        $('#demo-toolbar').append(s_box_html);


        var search_list = $('#demo-toolbar-goto .demo-toolbar-dropdown-menu');
        //搜索框事件
        $('#search_box').keyup(function (e) {
//        search_index
            var keyCode = e.keyCode;

            if(keyCode == 13 && search_index != -1){
                search_list.children().eq(search_index)[0].click();
                return ;
            }

            if(keyCode == 38 || keyCode == 40){
                (keyCode == 38) && (search_index--);
                (keyCode == 40) && (search_index++);
                var el = search_list.children().eq(search_index);
                Demo.alinkHover(null,el);
                return ;
            }

            search_index = -1;
            var b_val = $(this).val();
            var ret = {
                list: []
            }

            if (b_val != "") {
                $.each(search_datas.list, function (_, item) {
                    var ret_index;
                    if ((ret_index = item.name.indexOf(b_val)) != -1) {
                        var item2 = $.extend({}, item);
                        item2.name = item2.name.replace(b_val, '<strong>' + b_val + '</strong>');
                        ret.list.push(item2);
                    } else if ((ret_index = item.desc.indexOf(b_val)) != -1) {
                        var item2 = $.extend({}, item);
                        item2.desc = item2.desc.replace(b_val, '<strong>' + b_val + '</strong>');
                        ret.list.push(item2);
                    }

                });
            } else {
                ret.list = search_datas.list;
            }

            var s_box_list = template.compile(Demo.getTpl('search_box_list_tpl'))(ret);
            $('#demo-toolbar-goto').find('.demo-toolbar-dropdown-menu').html(s_box_list);
        });
    }
    /**
     * 模板数量统计
     * @param data
     */
    Demo.statModule = function (data) {

        var count = {
            complete: 0,
            dev: 0,
            deprecated: 0,
            total: 0,
            modules: 0
        }
        $.each(data, function (_, item) {

            $.each(item.list, function (__, item2) {
                function inc(s) {
                    (s == 0 && count.deprecated++) ||
                        (s == 1 && count.dev++) ||
                    (s == 2 && count.complete++)
                }

                inc(item2[3]);
            });
            count.total += item.list.length;
            count.modules++;
        });
        //头部统计
        var head_small = template.compile(Demo.getTpl('header_count'))(count);
        $('#header_h1').html(head_small);
    }

    Demo.writeIndexHeader = function (title, c, a) {
        Demo.writeExampleHeader('', -1, -1);
    }

    Demo.de = function (msg) {
        return window.decodeURIComponent(msg);
    }

    Demo.writeExampleHeader = function (name, controller, desc) {
        var data = Demo.parseSearch();
        document.title = document.title || data.name;
        data.homepage = g.root + 'index.html';

        name && ( data.name = name);
        controller && ( data.controller = controller);
        desc && ( data.desc = desc);

        var html = template.compile(Demo.getTpl('header_tpl'))(data);

        $('body').prepend(html);

    }

    /**
     * 得到模板在本页面或者代理页面查找
     * @param id  元素ID
     * @returns {*|jQuery}
     */
    Demo.getTpl = function (id) {
        if ($('#' + id).length) {
            return $('#' + id).html();
        }
        return $('#' + id, $('#tpl')[0].contentWindow.document.body).html();
    }

    /**
     * 组织example items，显示到屏幕
     * @param obj
     */
    Demo.writeExample = function (map) {
        $('body').append('<iframe src="' + g.root + 'view/proxy/tpl.html" id="tpl" style="display: none"></iframe>');
        $('#tpl')[0].contentWindow.onload = function () {
            Demo.writeExampleHeader();
            Demo.writeExampleItem(map);
            Demo.writeFooter();
            var data = localStorage.getItem('list_data');
            if (!data) throw new Error('localStorage.list_data empty');
            Demo.writeSearchBox(JSON.parse(data));
        }
    }

    /**
     *
     * @param obj
     */
    Demo.writeExampleItem = function (obj) {
        var data = {list: obj}

        var all_html = '';
        all_html += template.compile(Demo.getTpl('example_item_tpl'))(data);
//    $('body').append(all_html);
        $('#header').after(all_html);

        //hight light
        $('pre').addClass('prettyprint');
        window.prettyPrint();

        $.each(obj, function (_, code) {
            Demo.exs.push(code);
        });
    }

    Demo.writeIndex = function () {

    }


    /**
     * 执行example item代码
     * @param index
     */
    Demo.execCode = function (index) {
        var strCode = Demo.exs[index];
        (window.execScript || function (str) {
            try {
                str = str.replace(/console\.log/g, 'Demo.log');
                window.eval.call(window, str);
                if (Demo.ret.length == 0) {
                    setTimeout(function () {
                        jQuery('#demo-example-' + index).find('.small_ret').html('[执行打印结果]: ' + Demo.ret.join(","));
                    }, 2000);
                } else {
                    jQuery('#demo-example-' + index).find('.small_ret').html('[执行打印结果]: ' + Demo.ret.join(","));
                }
            } catch (ex) {
                jQuery('#demo-example-' + index).find('.small_ret').html('[执行出现错误: ' + ex.message + ']');
            }
        })(strCode);

    }
    Demo.writeFooter = function (obj) {
        var foot = template.compile(Demo.getTpl('footer_tpl'))();
        $('body').append(foot);
    }
    window.Demo = Demo;
})();
Demo.init();
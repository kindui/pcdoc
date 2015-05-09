var skyex = {};
skyex.lib = {};
skyex.LIMIT = 100;
skyex.PAGE = 1;
skyex.domain = 'www.t1bao.com';
skyex.domain = 't1bao.ap01.aws.af.cm';
skyex.domain = location.host;
skyex.assetsUrl = '/assets';
skyex.requestUrl = 'http://' + skyex.domain + '/web/app';
skyex.requestUrl = '';
skyex.captchaUrl = 'http://' + skyex.domain + '/web/captcha';

skyex.noGoodsUrl = 'http://' + skyex.domain + '/assets/img/no_goods_pic.jpg';

var loading = null;

skyex.storage = {
    store : {
        get : function() {
            var stores = $.localStorage('stores');
            stores = JSON.parse(stores);
            return stores;
        },
        set : function(stores) {
            stores = JSON.stringify(stores);
            $.localStorage('stores', stores);
        }
    }
};

function images2url(image_ids) {
    var url = "";
    try {
        image_ids = eval("(" + image_ids + ")");
    } catch (e) {
        image_ids = null;
    }

    if (image_ids && image_ids.length) {
        image_ids = image_ids[0];
        for ( var k in image_ids) {
            url = image_ids[k];
            break;
        }
    } else {
        url = skyex.noGoodsUrl;
    }
    return url;
}

skyex.lib.req = function(url, data, callback, type, dataType, page, limit) {
    data = data || {};
    limit = limit || skyex.LIMIT;
    page = page || skyex.PAGE;

    var isString = (data instanceof String || (typeof data === 'string'));
    var processData = true, contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
    if (!isString) {
        if (data) {
            if (data instanceof FormData) {
                processData = false;
                contentType = false;
            }
        }
    }
    var loadingUrl = skyex.assetsUrl + '/img/app/loading.gif';
    if (!loading) {
        loading = $('<div class="preload"><img src="' + loadingUrl
            + '" /><span>正在加载...</span></div>');
        loading.appendTo("body");
    } else {
        loading.show();
    }

    $.ajax({
        url : url,
        type : type || 'post',
        data : data,
        contentType : contentType,
        dataType : dataType || 'json',
        processData : processData,
        success : function(data) {
            loading.hide();

            data = data || {};
            if (data.status !== 0) {
                callback(data);
            } else {
                if (data.info) {
                    alert(data.info);
                }
                if (data.message) {
                    alert(data.message);
                }
            }
        },
        failure : function() {
            alert('未知网络错误!');
        }
    });
};

skyex.app = {};

skyex.app.goods = {
    page : 1,
    info : function(id) {
        skyex.lib.req(skyex.requestUrl, 'type=goods&act=info&id=' + id, function(
            data) {
            switch (data.status) {
                case 1:
                    var chapters = data.data;
                    skyex.app.goods.chapters = chapters;
                    if (!chapters.length) {
                        var noData = $('<p>').addClass('no_data').html('好象出问题!');
                        noData.insertBefore(skyex.app.goods.more);
                        return;
                    }

                    var ul = $('<ul>').addClass('chapter_list');
                    $('.goods_list').append(ul);

                    for ( var i = 0; i < chapters.length; i++) {
                        skyex.app.goods.addChapter(chapters[i], ul, id);
                    }
                    skyex.app.goods.more.unbind();
                    skyex.app.goods.more.hide();
                    break;
            }
        });
    },

    byStore : function(node, store, page) {
        var data = 'type=goods&act=store&store_id=' + store.id + "&page=" + page;

        skyex.lib.req(skyex.requestUrl, data, function(data) {
            switch (data.status) {
                case 1:
                    var goodsList = data.data;
                    if (!goodsList.length) {
                        node.unbind();
                        node.hide();
                        return;
                    }

                    for ( var i = 0; i < goodsList.length; i++) {
                        var goods = skyex.app.html.wrapper.initGoodsSection(store,
                            goodsList[i]);
                        goods.insertBefore(node);
                    }
                    break;
            }
        });

    },

    search : function(q, page, next) {
        q = q || '';
        page = page || 1;
        skyex.lib.req(skyex.requestUrl, 'type=goods&act=search&q='
            + encodeURIComponent(q) + "&page=" + page, function(data) {
            switch (data.status) {

                case 2:
                    alert(data.message);
                    break;
                case 1:
                    data = data.data;
                    if (!data.length) {
                        skyex.app.goods.more.hide();
                        $('.loading').hide();
                        return;
                    }
                    for ( var i = 0; i < data.length; i++) {
                        skyex.app.goods.goodsList[data[i].id] = data[i];
                        var node = skyex.app.goods.addNode(data[i]);
                        node.insertBefore(skyex.app.goods.more);
                    }
                    skyex.app.goods.more.show();
                    $('.loading').hide();
                    break;
            }
        });
    },
};

skyex.app.category = {
    pid : [],
    isListed : false,
    get : function(id, next) {
        skyex.app.tab.swap($('#nav-bar-' + 0));
        if (skyex.app.goods.bar) {
            skyex.app.goods.bar.remove();
        }
        id = id || 0;
        console.log("id = " + id);
        skyex.app.goods.backBtn(function() {
            var pid = skyex.app.category.pid.pop();
            skyex.app.category.get(pid);
            return false;
        });
        if (parseInt(id)) {
            $('.archor_back_btn').show();
        } else {
            $('.archor_back_btn').hide();
        }
        $('.title_bar h1').html('书籍分类');
        $('.wrapper').html('');
        var ul = $('<ul>').addClass('sort_list');
        var li = $('<li>');
        var a = $('<a>').html('所有书籍');
        a.click(function() {
            console.log('inside');
            skyex.app.goods.init();
        });

        li.append(a);
        ul.append(li);
        $('.wrapper').append(ul);
        skyex.lib.req(skyex.requestUrl, 'type=category&id=' + id, function(data) {
            switch (data.status) {
                case 1:
                    var cats = data.data;
                    if (!cats.length) {
                        skyex.app.goods.list(id);
                        return;
                    }

                    for ( var i = 0; i < cats.length; i++) {
                        li = $('<li>');
                        a = $('<a>').html(cats[i].name);
                        for ( var k in cats[i]) {
                            a.attr('data-' + k, cats[i][k]);
                        }
                        a.click((function(cat) {
                            return function() {
                                skyex.app.category.get(cat.id);
                                console.log('inside push ');
                                skyex.app.category.pid.push(cat.pid);
                            };
                        })(cats[i]));
                        li.append(a);
                        ul.append(li);
                    }
                    if (next) {
                        next();
                    }
                    break;
            }
        });
    }
};

skyex.app.store = {
    listIndex : 1,
    infoIndex : 1,
    recentIndex : 1,
    info : function(store, page) {
        var data = 'type=store&act=info&page=' + page;

        skyex.lib.req(skyex.requestUrl, data, function(data) {
            console.log(data);
            switch (data.status) {
                case 1:
                    var goodsList = data.data;
                    for ( var i = 0; i < goodsList.length; i++) {
                        var goods = goodsList[i];
                        var section = skyex.app.html.wrapper.initStoreGoods(goods);
                        section.insertBefore(node);
                    }
                    break;
            }

        });
    },
    list : function(node, page) {
        var data = 'type=store&act=list&page=' + page;

        skyex.lib.req(skyex.requestUrl, data, function(data) {
            console.log(data);
            switch (data.status) {
                case 1:
                    var stores = data.data;
                    if (!stores.length) {
                        node.hide();
                        return;
                    }
                    for ( var i = 0; i < stores.length; i++) {
                        var store = stores[i];
                        var section = skyex.app.html.wrapper.initStoreSection(store);
                        section.insertBefore(node);
                    }
                    break;
            }

        });
    },
    recent : function(node, page) {
        var data = 'type=store&act=recent&page=' + page;

        skyex.lib.req(skyex.requestUrl, data, function(data) {
            console.log(data);
            switch (data.status) {
                case 1:
                    var stores = data.data;
                    for ( var i = 0; i < stores.length; i++) {
                        var store = stores[i];
                        var section = skyex.app.html.wrapper.initStoreSection(store);
                        section.insertBefore(node);
                    }
                    break;
            }
        });
    }
};

skyex.app.order = {
    my : function(page, next) {
        skyex.lib.req(skyex.requestUrl, 'type=order&act=my&page=' + page, next);
    },
    goods : function(order, page, next) {
        skyex.lib.req(skyex.requestUrl, 'type=order&act=goods&order_id=' + order.id
            + '&page=' + page, next);
    }
};

skyex.app.cart = {
    data : null,
    list : function(next) {
        skyex.lib.req(skyex.requestUrl, 'type=cart&act=list', next);
    },
    add : function(store, goods, num, next) {
        skyex.lib.req(skyex.requestUrl, 'type=cart&act=add&store_id=' + store.id
            + '&goods_id=' + goods.id + "&num=" + num, next);
    },
    update : function(store, goods, num, next) {
        skyex.lib.req(skyex.requestUrl, 'type=cart&act=update&store_id=' + store.id
            + '&goods_id=' + goods.id + "&num=" + num, next);
    },
    remove : function(store, goods, next) {
        skyex.lib.req(skyex.requestUrl, 'type=cart&act=remove&store_id=' + store.id
            + '&goods_id=' + goods.id, next);
    },
    checkout : function(store, next) {
        skyex.lib.req(skyex.requestUrl, 'type=cart&act=checkout&store_id='
            + store.id, next);
    },
};

skyex.app.html = {
    model : {
        order : {
            goodsSection : function(goods) {
                console.log(goods);

                var section = $('<section>');
                var url = images2url(goods.image_ids);
                section.append($('<img>').attr('src', url).attr('alt', goods.name));
                var div = $('<div>');
                div.append($('<h2>').html(goods.name));
                var ul = $('<ul>');
                ul.append($('<li>').html('数量:' + goods.total));
                ul.append($('<li>').html('单价:').append(
                    $('<span>').addClass('price').html(
                        '¥' + parseFloat(goods.price).toFixed(2))));
                div.append(ul);

                section.append(div);
                return section;
            },
            myOrderDetail : function(order) {
                console.log(order);
                var page = 1;
                var lastNum = 0;
                skyex.app.html.header.titleWithBack('订单详情', function() {
                    skyex.app.html.model.order.my();
                });
                $('.wrapper').html('');
                var orderDetail = $('<div>').addClass('order_detail');
                var ul = $('<ul>').addClass('order_list');
                orderDetail.append(ul);

                orderDetail.append($('<h2 class="shop_name">' + order.store_name
                    + '</h2>'));

                $('.wrapper').append(orderDetail);

                ul.append($('<li>订单编号：' + order.no + '</li>'));
                ul.append($('<li>' + order.time + '  下单</li>'));

                var goodsList = $('<article>').addClass('order_goods_list');
                var more = $('<p class="more_goods"></p>');
                more.click(function() {

                });
                more.hide();
                goodsList.append(more);

                var dl = $('<dl>').addClass('order_total');
                dl.append($('<dt>').html('数量:'));
                dl.append($('<dd>').html(order.total));
                dl.append($('<dt>').html('总计:'));
                dl.append($('<dd>').html('¥' + parseFloat(order.sum).toFixed(2)));

                orderDetail.append(goodsList);
                orderDetail.append(dl);

                function getGoods() {
                    skyex.app.order.goods(order, page, function(data) {
                        switch (data.status) {
                            case 1:
                                console.log("inside ok");
                                var list = data.data;
                                if (!list.length) {
                                    more.hide();
                                    return;
                                }
                                page++;

                                for ( var i = 0; i < list.length; i++) {
                                    console.log(list[i]);
                                    var goods = skyex.app.html.model.order.goodsSection(list[i]);
                                    goods.insertBefore(more);
                                }
                                if (lastNum && lastNum != orders.length) {
                                    more.hide();
                                } else {
                                    lastNum = list.length;
                                }

                        }
                    });
                }
                getGoods();

            },
            initUserOrder : function(order) {
                var section = $('<section>').addClass('order_list');
                var ul = $('<ul>');
                section.append(ul);
                ul.append($('<li>').append('订单编号：' + order.no));
                ul.append($('<li>').append('商品数量：' + order.total));
                ul.append($('<li>').append('订单金额：' + order.sum));
                ul.append($('<li>').append(order.time + "  下单"));
                var btn = $('<button>').addClass('del_btn').html('取消订单');
                section.append(btn);

                section.click(function() {
                    skyex.app.html.model.order.myOrderDetail(order);
                });
                return section;
            },
            my : function() {
                skyex.app.tab.swap($('#nav-bar-2'));
                var page = 1;
                var lastNum = 0;
                skyex.app.html.header.titleWithBack('我的订单', function() {
                    skyex.app.user.initAccount(skyex.app.user.data);
                });

                var myOrder = $('<div>').addClass('my_order');

                function getOrder() {
                    skyex.app.order.my(page,
                        function(data) {
                            switch (data.status) {
                                case 1:
                                    console.log("inside ok");
                                    var orders = data.data;
                                    if (!orders.length) {
                                        if (page == 1) {
                                            myOrder.append($('<p class="noorder">您暂无订单</p>'));
                                        }
                                        $('.more').hide();
                                        return;
                                    }
                                    page++;

                                    for ( var i = 0; i < orders.length; i++) {
                                        var order = skyex.app.html.model.order
                                            .initUserOrder(orders[i]);
                                        order.insertBefore($('.more'));
                                    }
                                    if (lastNum && lastNum != orders.length) {
                                        $('.more').hide();
                                    } else {
                                        lastNum = orders.length;
                                    }

                            }
                        });
                }
                var more = $('<p class="more" id="more">显示更多...</p>');
                more.click(getOrder);

                myOrder.append(more);
                $('.wrapper').html('').append(myOrder);
                getOrder();
            }
        }
    },
    init : function() {
        skyex.app.html.footer.init();
        if (typeof viewStore !== 'undefined') {
            var stores = skyex.storage.store.get();
            if (!stores) {
                stores = {};
            }
            stores[viewStore.id] = viewStore;
            skyex.storage.store.set(stores);
            skyex.app.html.wrapper.initStoreInfo(viewStore);
        } else {
            skyex.app.html.wrapper.init();
        }

    },
    header : {
        reset : function() {
            $('.title_bar').html('');
        },
        setTitle : function(title) {
            $('.title_bar').html('');
            var h1 = $('<h1>').html(title);
            $('.title_bar').append(h1);
        },
        titleWithBack : function(title, next) {
            $('.title_bar').html('');
            var back = $('<button>').addClass("left_btn back_btn");
            back.click(next);
            var h1 = $('<h1>').html(title);
            $('.title_bar').append(back);
            $('.title_bar').append(h1);
        }
    },
    search : {
        init : function(next) {
            var search = $('<div>').addClass('search');
            var query = $('<input>').attr('type', 'text').attr('name', 'q').val('');
            var searchBtn = $('<input>').attr('type', 'submit').val('搜索');
            var form = $('<form>');
            form.append(query);
            form.append(searchBtn);

            form.on('submit', next);
            search.append(form);
            return search;
        }
    },
    wrapper : {
        init : function() {
            skyex.app.html.wrapper.initStore();

        },
        initCartInfo : function(user) {
            skyex.app.tab.swap($('#nav-bar-1'));
            skyex.app.html.header.setTitle('购物车');
            var cart = $('<div>').addClass('cart');
            $('.wrapper').html('');
            $('.wrapper').append(cart);

            skyex.app.cart.list(function(data) {
                switch (data.status) {
                    case 2:
                        skyex.app.user.initLogin();
                        break;
                    case 1:
                        var carts = data.data;
                        if (!carts.length) {
                            var noGoods = $('<div>').addClass('nogoods');
                            var noGoodsImage = skyex.assetsUrl + '/img/app/nogoods.png';
                            noGoods.append($('<img>').attr('src', noGoodsImage).attr('alt',
                                '您的购物车还是空的'));
                            noGoods.append($('<p>').html('您的购物车还是空的!'));
                            cart.append(noGoods);
                            $('i', $('#nav-bar-1')).remove();
                            return;
                        }

                        var store_id = null;

                        var storeCarts = {

                        };
                        console.log(carts);

                        for ( var i = 0; i < carts.length; i++) {
                            console.log('inside 1');
                            var item = carts[i];
                            if (store_id != item.store_id) {
                                console.log('inside 2');
                                storeCarts[item.store_id] = {
                                    name : item.store_name,
                                    id : item.store_id,
                                    sum : 0,
                                    total : 0,
                                    goods : []
                                };
                                store_id = item.store_id;
                            }
                            console.log('loop' + i);

                            storeCarts[item.store_id].sum += parseFloat(item.price)
                                * item.total;
                            storeCarts[item.store_id].total += parseInt(item.total);
                            console.log(storeCarts[item.store_id].goods);

                            storeCarts[item.store_id].goods.push(item);
                            console.log(storeCarts[item.store_id].goods);
                        }
                        console.log(storeCarts);
                        for ( var id in storeCarts) {
                            skyex.app.html.wrapper.initCartStore(cart, storeCarts[id]);
                        }
                        skyex.app.cart.data = storeCarts;
                        break;
                }
            });
        },
        initCartStore : function(cart, store) {
            cartBox = $('<div>').addClass('cart_box');
            cartBox.append($('<h2>').addClass('shop_name').html('商家：' + store.name));
            var goodsList = $('<article>').addClass('cart_goods_list');
            cartBox.append(goodsList);

            // cartBox.append($('<p class="cart_total">共' + store.total
            // + '件&nbsp;&nbsp;&nbsp;&nbsp;总计：<span>¥' + store.sum + '</span></p>'));

            cartBox.append($('<p class="cart_total">总计：<span>¥'
                + parseFloat(store.sum).toFixed(2) + '</span></p>'));

            $('i', $('#nav-bar-1')).remove();
            $('#nav-bar-1').append($('<i>').addClass('buy_num').html(store.total));
            var checkout = $('<button>').addClass('ybtn').html('生成订单');

            checkout.click(function() {
                skyex.app.cart.checkout(store, function(data) {
                    switch (data.status) {
                        case 1:
                            skyex.app.html.model.order.my();
                            break;
                    }
                });
            });

            cartBox.append(checkout);
            cart.append(cartBox);
            console.log(store.goods);

            for ( var i = 0; i < store.goods.length; i++) {
                var cartGoods = skyex.app.html.wrapper.initCartGoods(store.goods[i]);
                goodsList.append(cartGoods);
            }

            // goodsList.append($('<p class="more_goods" id="more_goods"></p>'));

        },
        initCartGoods : function(goods) {
            var section = $('<section>');
            var deleteBtn = $('<button>').html('删除商品').addClass('del_btn');

            deleteBtn
                .click(function() {
                    if (confirm('你确定删除商品，操作不可恢复?')) {
                        skyex.app.cart
                            .remove(
                            {
                                id : goods.store_id
                            },
                            goods,
                            function(data) {
                                switch (data.status) {
                                    case 2:
                                        skyex.app.user.initLogin();
                                        break;
                                    case 1:
                                        skyex.app.cart.data[goods.store_id].sum -= parseFloat(goods.price)
                                            * goods.total;
                                        skyex.app.cart.data[goods.store_id].total -= goods.total;
                                        $('i', $('#nav-bar-1')).remove();
                                        if (skyex.app.cart.data[goods.store_id].total == 0) {
                                            $('.cart').html('');
                                            var noGoods = $('<div>').addClass('nogoods');
                                            var noGoodsImage = skyex.assetsUrl
                                                + '/img/app/nogoods.png';
                                            noGoods.append($('<img>').attr('src', noGoodsImage)
                                                .attr('alt', '您的购物车还是空的'));
                                            noGoods.append($('<p>').html('您的购物车还是空的!'));
                                            $('.cart').append(noGoods);
                                            $('i', $('#nav-bar-1')).remove();

                                        } else {
                                            $('p.cart_total span').html(
                                                '¥'
                                                    + skyex.app.cart.data[goods.store_id].sum
                                                    .toFixed(2));
                                            $('#nav-bar-1').append(
                                                $('<i>').addClass('buy_num').html(store.total));
                                            section.remove();
                                        }

                                        break;

                                }
                            });
                    }
                });

            var url = images2url(goods.image_ids);
            var image = $('<img>').attr('src', url).attr('alt', goods.name);

            var info = $('<figure>').append(image).append(
                $('<figcaption>').append(deleteBtn));
            section.append(info);

            var div = $('<div>');
            div.append($('<h2>').html(goods.name));

            var dl = $('<dl>');

            var count = $('<span>').addClass('computing');
            var dec = $('<input>').attr('type', 'button').addClass('reduce');
            var num = $('<input>').attr('type', 'text').attr('maxlength', '2')
                .addClass('num').val(goods.total);
            var inc = $('<input>').attr('type', 'button').addClass('add');
            count.append(dec);
            count.append(num);
            count.append(inc);

            dec.click(function() {
                var val = num.val();
                if (val > 1) {
                    --val;
                    skyex.app.cart.update({
                        id : goods.store_id
                    }, goods, val, function() {
                        skyex.app.cart.data[goods.store_id].sum -= parseFloat(goods.price);
                        skyex.app.cart.data[goods.store_id].total -= 1;
                        $('p.cart_total span').html(
                            '¥' + skyex.app.cart.data[goods.store_id].sum.toFixed(2));
                        $('i', $('#nav-bar-1')).remove();
                        $('#nav-bar-1').append(
                            $('<i>').addClass('buy_num').html(
                                skyex.app.cart.data[goods.store_id].total));
                        num.val(val);
                    });
                }
            });

            inc.click(function() {
                var val = num.val();
                if (val < 20) {
                    val++;
                    skyex.app.cart.update({
                        id : goods.store_id
                    }, goods, val, function() {
                        skyex.app.cart.data[goods.store_id].sum += parseFloat(goods.price);
                        skyex.app.cart.data[goods.store_id].total += 1;
                        $('p.cart_total span').html(
                            '¥' + skyex.app.cart.data[goods.store_id].sum.toFixed(2));
                        $('i', $('#nav-bar-1')).remove();
                        $('#nav-bar-1').append(
                            $('<i>').addClass('buy_num').html(
                                skyex.app.cart.data[goods.store_id].total));
                        num.val(val);
                    });
                }
            });

            dl.append($('<dt>数量:</dt>'));
            dl.append($('<dd>').append(count));

            dl.append($('<dt>单价：</dt>'));
            dl.append($('<dd>').addClass('price').html(
                '¥' + parseFloat(goods.price).toFixed(2)));
            div.append(dl);
            section.append(div);
            return section;

        },

        initStoreInfo : function(store) {
            console.log(store);
            skyex.app.store.infoIndex = 1;
            skyex.app.html.header.titleWithBack(store.name, function() {
                skyex.app.html.wrapper.initStore();
            });
            var search = skyex.app.html.search.init(function() {

            });
            search.insertBefore($('.wrapper'));
            $('.wrapper').html('');

            var shop = $('<div>').addClass('shop');
            var shopInfo = $('<div>').addClass('shop_info');
            var goodsList = $('<article>').addClass('goods_list');

            var img = $('<img>').attr('src', store.url).attr('alt', store.name);
            var hgroup = $('<hgroup>');
            var h2 = $('<h2>').html(store.name);
            var h3 = $('<h3>').html(store.address);
            hgroup.append(h2);
            hgroup.append(h3);

            var ul = $('<ul>');
            var li1 = $('<li>').html(
                store.open_time.substring(0, 5) + "-"
                    + store.close_time.substring(0, 5));
            var li2 = $('<li>');
            var tel = $('<a>').attr('href', 'tel:' + store.tel).attr('title',
                store.tel).html(store.tel);
            li2.append(tel);
            ul.append(li1).append(li2);

            shopInfo.append(img);
            shopInfo.append(hgroup);
            shopInfo.append(ul);

            var more = $('<p>').addClass('more').html('显示更多...');
            goodsList.append(more);
            shop.append(shopInfo);
            shop.append(goodsList);
            $('.wrapper').append(shop);
            skyex.app.goods.page = 1;
            skyex.app.goods.byStore(more, store, skyex.app.goods.page++);

            more.click(function() {
                skyex.app.goods.byStore(more, store, skyex.app.goods.page++);
            });

        },
        initGoodsSection : function(store, goods) {
            var section = $('<section>').attr('data-url', 'goods_info');

            var image_ids = goods.image_ids;
            console.log(image_ids);
            var url = "";
            try {
                image_ids = eval("(" + image_ids + ")");
            } catch (e) {
                image_ids = null;
            }
            goods.images = image_ids;

            if (image_ids && image_ids.length) {
                image_ids = image_ids[0];
                for ( var k in image_ids) {
                    url = image_ids[k];
                    break;
                }
            } else {
                url = skyex.noGoodsUrl;
            }
            var image = $('<img>').attr('src', url).attr('alt', goods.name);
            var hgroup = $('<hgroup>');
            var h2 = $('<h2>').html(goods.name);
            var h3 = $('<h3>').addClass('price').html(
                '¥' + parseFloat(goods.price).toFixed(2));
            hgroup.append(h2);
            hgroup.append(h3);
            section.append(image).append(hgroup);
            section.click(function() {
                skyex.app.html.wrapper.initGoodsInfo(store, goods);
            });
            return section;
        },

        initGoodsInfo : function(store, goods) {
            $('.search').remove();

            skyex.app.html.header.titleWithBack(store.name, function() {
                skyex.app.html.wrapper.initStoreInfo(store);
            });
            var goodsInfo = $('<div>').addClass('goods_info');

            var swiperBox = $('<div>').addClass('swiper_box goods_info_swiper');
            var arrowLeft = $('<i>').addClass('arrow arrow-left');
            var arrowRight = $('<i>').addClass('arrow arrow-right');

            var swiperMain = $('<div>').addClass('swiper-main');
            var swiperContainer = $('<div>').addClass('swiper-container swiper');
            swiperMain.append(swiperContainer);

            var swiperWrapper = $('<div>').addClass('swiper-wrapper').css('width',
                    '2400px').css('height', '400px').css('-webkit-transform',
                    'translate(-400px, 0px)').css('transition', '0s').css(
                    '-webkit-transition', '0s');

            if (goods.images) {
                console.log(goods.images);
                for ( var i = 0; i < goods.images.length; i++) {
                    var data = goods.images[i];

                    for ( var k in data) {
                        console.log('k = ' + k);
                        console.log('image= ' + data[k]);
                        var slide = $('<div>').addClass('swiper-slide').css('width',
                            '400px').css('height', '400px');
                        var image = $('<img>').attr('src', data[k]);
                        slide.append(image);
                        swiperWrapper.append(slide);
                    }
                }
            }

            swiperContainer.append(swiperWrapper);

            var pagination = $('<div>').addClass('pagination');

            swiperBox.append(arrowLeft);
            swiperBox.append(arrowRight);
            swiperBox.append(swiperMain);
            swiperBox.append(pagination);

            var infoBox = $('<article>').addClass('goods_info_box');
            var ul = $('<ul>');
            var li1 = $('<li>');
            li1.html(goods.name);
            var li2 = $('<li>');
            li2.html('价格：');
            var price = $('<i>').html('¥' + parseFloat(goods.price).toFixed(2));
            li2.append(price);
            var li3 = $('<li>');
            li3.html('商品详情');
            var intro = $('<span>').html(goods.intro);
            li3.append(intro);
            ul.append(li1);
            ul.append(li2);
            ul.append(li3);

            infoBox.append(ul);

            var payBox = $('<article>').addClass('goods_buy_box');

            var selectBar = $('<div>');
            var count = $('<span>').addClass('computing');
            var dec = $('<input>').attr('type', 'button').addClass('reduce');
            var num = $('<input>').attr('type', 'text').attr('maxlength', '2')
                .addClass('num').val(1);
            var inc = $('<input>').attr('type', 'button').addClass('add');
            count.append(dec);
            count.append(num);
            count.append(inc);

            dec.click(function() {
                var val = num.val();
                if (val > 0) {
                    num.val(--val);
                }
            });

            inc.click(function() {
                var val = num.val();
                if (val < 20) {
                    num.val(++val);
                }
            });

            /*
             * var inventory = $('<span>').addClass('inventory').html( '(库存' +
             * goods.stock_number + ')'); selectBar.append(inventory);
             */

            selectBar.append(count);

            var addToCart = $('<button>').addClass('ybtn add_shopping_cart').html(
                '加入购物车');

            addToCart.click(function() {
                skyex.app.cart.add(store, goods, num.val(), function(data) {
                    switch (data.status) {
                        case 2:
                            skyex.app.user.initLogin();
                            break;
                        case 1:
                            skyex.app.html.wrapper.initCartInfo();
                            break;
                    }

                });
            });

            payBox.append(selectBar);
            payBox.append(addToCart);

            goodsInfo.append(swiperBox);
            goodsInfo.append(infoBox);
            goodsInfo.append(payBox);

            $('.wrapper').html('').append(goodsInfo);
            var swiper = $('.swiper-container').swiper({
                pagination : '.pagination',
                loop : true
            });
            $('.arrow-left').click(function(e) {
                e.preventDefault();
                swiper.swipePrev();
            });
            $('.arrow-right').click(function(e) {
                e.preventDefault();
                swiper.swipeNext();
            });
        },

        initStoreSection : function(store) {
            var section = $('<section>').attr('data-url', 'shop');
            var image = $('<img>').attr('src', store.url).attr('alt', store.name);
            var h3 = $('<h3>').html(store.name);
            var ul = $('<ul>');
            var li1 = $('<li>').html(store.address);
            var li2 = $('<li>');
            var tel = $('<a>').attr('href', 'tel:' + store.tel).attr('title',
                store.tel).html(store.tel);
            li2.append(tel);
            ul.append(li1).append(li2);
            section.append(image).append(h3).append(ul);

            section.click(function() {
                console.log(store);
                var stores = skyex.storage.store.get();
                if (!stores) {
                    stores = {};
                }
                stores[store.id] = store;
                skyex.storage.store.set(stores);
                skyex.app.html.wrapper.initStoreInfo(store);
            });
            return section;
        },
        initStore : function() {
            skyex.app.store.listIndex = 1;
            $('.wrapper').html('');
            $('.search').remove();
            var h1 = $('<h1>').html('天易商城');
            $('.title_bar').html('').append(h1);
            var store = $('<div>').addClass('home');

            var recentStores = skyex.storage.store.get();
            console.log(recentStores);
            if (recentStores) {
                var inside = false;
                var recentStore = $('<div>').addClass('home_box soon_shops');

                var article = $('<article>').addClass('home_shops_list');
                for ( var id in recentStores) {
                    var rs = recentStores[id];
                    var section = skyex.app.html.wrapper.initStoreSection(rs);
                    article.append(section);
                    inside = true;
                }

                if (inside) {
                    recentStore.append($('<h2>').html('最近浏览的商家'));
                    recentStore.append(article);
                    store.append(recentStore);
                }
            }

            var moreStore = $('<div>').addClass('home_box all_shops');

            moreStore.append($('<h2>').html('全部商家'));
            moreStoreList = $('<article>').addClass('home_shops_list');
            moreStore.append(moreStoreList);

            store.append(moreStore);
            var more = $('<p>').addClass("more").attr('id', 'more').html('显示更多...');
            more.click(function() {
                skyex.app.store.list(more, skyex.app.store.listIndex++);
            });
            var loadingMore = $('<p>').addClass('loading').html('正在加载...').css(
                'display', 'none');
            moreStoreList.append(more);
            moreStoreList.append(loadingMore);
            $('.wrapper').append(store);
            skyex.app.store.list(more, skyex.app.store.listIndex++);
        }

    },
    footer : {
        init : function() {
            var tabs = [ {
                'name' : '首页',
                'action' : function() {

                    skyex.app.html.wrapper.initStore();
                }
            }, {
                'name' : '购物车',
                'action' : function() {
                    skyex.app.html.wrapper.initCartInfo();
                }
            }, {
                'name' : '我的天易',
                'action' : function() {
                    skyex.app.user.init();
                }
            }, {
                'name' : '更多',
                'action' : function() {
                    skyex.app.more.init();
                }
            } ];

            // var cur = null;
            var ul = $('.nav_bar ul').html('');
            for ( var i = 0; i < tabs.length; i++) {
                var span = $('<span>').html(tabs[i].name);
                var a = $('<a>').attr('data-url', tabs[i].url);
                var li = $('<li>');
                a.append(span);
                a.attr('data-id', i);

                a.click(function() {
                    skyex.app.goods.page = 1;
                    $('.search').remove();
                    skyex.app.tab.swap(this);
                    tabs[$(this).attr('data-id')].action();
                });
                a.attr('id', 'nav-bar-' + i);

                li.append(a);
                ul.append(li);

                if (i == 0) {
                    a.trigger('click');
                }

            }
        }
    }
};

skyex.app.box = {

    init : function() {
        skyex.app.tab.init();
    },
    clear : function() {
        skyex.app.goods.clear();
        // skyex.app.category.clear();
    }
};

skyex.app.header = {

};

skyex.app.more = {
    init : function() {
        // skyex.app.goods.clear();
        skyex.app.more.initBody();
    },
    initBody : function() {
        $('.title_bar').html('');
        var title = $('<h1>').html('更多');
        $('.title_bar').append(title);
        var more = $('<div>').addClass('more_box');
        var ul = $('<ul>');
        var li = $('<li>');
        var about = $('<a>').html('关于天易');
        var feedback = $('<a>').html('意见反馈');

        li.append(about);
        ul.append(li);
        li = $('<li>');
        li.append(feedback);
        ul.append(li);

        feedback.click(function() {
            skyex.app.more.initFeedback();
        });

        about.click(function() {
            skyex.app.more.initAbout();
        });

        more.append(ul);
        $('.wrapper').html('').append(more);
    },

    initAbout : function() {
        $('.title_bar').html('');
        var more = $('<a>');
        var click = $('<button>').addClass('left_btn back_btn').attr('id', 'back');
        more.append(click);
        var title = $('<h1>').html('关于天易');
        $('.title_bar').append(more);
        $('.title_bar').append(title);

        more.click(function() {
            skyex.app.more.init();
        });

        var div = $('<div>').addClass('about');
        var img = $('<img>').attr('src', skyex.assetsUrl + '/img/app/logo.jpg')
            .attr('alt', '天易Logo');
        var h2 = $('<h2>').html('版本：V1.0');
        var p1 = $('<p>').html('天易商城: www.t1bao.com');
        var p2 = $('<p>').html('客服邮箱: service@t1bao.com');
        var p3 = $('<p>').html('商务合作: business@t1bao.com');
        var p4 = $('<p>').html('Copyright©2013');
        var p5 = $('<p>').html('天易移动');
        div.append(img);
        div.append(h2);
        div.append(p1);
        div.append(p2);
        div.append(p3);
        div.append(p4);
        div.append(p5);
        $('.wrapper').html('').append(div);
    },
    initFeedback : function() {
        $('.title_bar').html('');
        var more = $('<a>');
        var click = $('<button>').addClass('left_btn back_btn').attr('id', 'back');
        more.append(click);
        var title = $('<h1>').html('意见反馈');
        $('.title_bar').append(more);
        $('.title_bar').append(title);

        more.click(function() {
            skyex.app.more.init();
        });

        var form = $('<form>').addClass('feedback');
        var fieldset = $('<fieldset>');
        var textArea = $('<textarea>').attr('placeholder', '您的意见很保贵！').addClass(
            'checkTextarea');
        var p = $('<p>').append('还可以输入<b class="num">140</b>字');
        var submit = $('<input>').attr('type', 'submit').addClass(
            'form_btn submit_btn').val('确认');
        fieldset.append(textArea);
        fieldset.append(p);
        fieldset.append(submit);
        form.append(fieldset);
        $('.wrapper').html('').append(form);
        textArea.keyup(function() {
            if ($(this).val().length > 140) {
                $(this).val($(this).val().substring(0, 140));
            }
            $('b.num').html(140 - $(this).val().length);
        });

        form.on('submit', function() {
            if (!$('textarea').val()) {
                alert('请输入反馈消息!');
                return false;
            }
            var data = 'type=more&act=feedback&feedback=' + $('textarea').val();
            skyex.lib.req(skyex.requestUrl, data, function(data) {
                switch (data.status) {
                    case 2:
                        alert(data.message);
                        skyex.app.user.initLogin();
                        break;
                    case 1:
                        alert(data.message);
                        location.href = $('a').attr('href');
                        break;
                }
            });
            return false;
        });
    }
};

skyex.app.user = {
    data : null,
    logout : function() {
        var data = 'type=user&act=logout';
        skyex.lib.req(skyex.requestUrl, data, function(data) {
            switch (data.status) {
                case 1:
                    skyex.app.user.initLogin();
                    break;
                default:
                // skyex.app.user.initLogin();
            }
        });
    },
    init : function() {
        // skyex.app.goods.clear();
        skyex.app.user.initLogin();
        skyex.app.user.profile();
    },
    profile : function() {
        var data = 'type=user&act=profile';
        skyex.lib.req(skyex.requestUrl, data, function(data) {
            switch (data.status) {
                case 1:
                    skyex.app.user.data = data.data;
                    skyex.app.user.initAccount(data.data);
                    break;
                default:
                // skyex.app.user.initLogin();
            }
        });
    },
    initProfile : function(user) {
        $('.title_bar').html('');
        var title = $('<h1>').html('我的信息');
        var back = $('<button>').addClass('left_btn back_btn').attr('id', 'back');

        back.click(function() {
            skyex.app.user.initAccount(skyex.app.user.data);
        });
        $('.title_bar').append(back);
        $('.title_bar').append(title);

        $('.wrapper').html('');
        var form = $('<form>').addClass('user_form my_info_form').attr('method',
            'post');

        var fieldset = $('<fieldset>');
        var div = $('<div>');
        var label = $('<label>').html('用户名：');
        var input = $('<input>').attr('name', 'username').addClass('username')
            .attr('type', 'text').val(user.username);
        div.append(label);
        div.append(input);
        fieldset.append(div);

        div = $('<div>');
        label = $('<label>').html('手机号：').attr('for', 'cellphone');
        input = $('<input>').attr('name', 'mobile').attr('maxlength', '11').attr(
            'id', 'cellphone').val(user.mobile);
        div.append(label);
        div.append(input);
        fieldset.append(div);

        div = $('<div>');
        label = $('<label>').html('邮箱：').attr('for', 'email');
        input = $('<input>').attr('id', 'email').attr('name', 'email').attr('type',
            'email').val(user.email);

        div.append(label);
        div.append(input);
        if (!parseInt(user.is_email_validated)) {
            var verifyBtn = $('<button>').addClass('verific_btn unverific_btn').html(
                '验证');
            div.append(verifyBtn);
            verifyBtn.click(function() {
                skyex.lib.req(skyex.requestUrl, 'type=user&act=email_verification',
                    function(data) {
                        switch (data.status) {
                            case 1:
                                alert(data.message);
                                verifyBtn.unbind();
                                verifyBtn.disable();
                                verifyBtn.removeClass('unverific_btn').addClass('verified_btn')
                                    .html('验证中');
                                break;
                        }
                    });
                return false;
            });
        } else {
            var verifyBtn = $('<button>').addClass('verific_btn verified_btn').html(
                '已验证');
            div.append(verifyBtn);
        }
        fieldset.append(div);

        div = $('<div>');
        label = $('<label>').html('性别：');
        div.append(label);
        console.log(user);
        input = $('<input>').attr('name', 'gender').attr('type', 'radio').val(
            'male');
        if (user.gender == 'male') {
            input.attr('checked', 'checked');
        }
        div.append(input);
        label = $('<label>').html('男');
        div.append(label);

        input = $('<input>').attr('name', 'gender').attr('type', 'radio').val(
            'female');
        if (user.gender == 'female') {
            input.attr('checked', 'checked');
        }
        div.append(input);
        label = $('<label>').html('女');
        div.append(label);

        input = $('<input>').attr('name', 'gender').attr('type', 'radio').val(
            'hidden');
        if (user.gender == 'hidden') {
            input.attr('checked', 'checked');
        }
        div.append(input);
        label = $('<label>').html('保密');
        div.append(label);
        fieldset.append(div);

        form.append(fieldset);

        div = $('<div>');

        var submit = $('<input>').addClass('form_btn register_btn').attr('type',
            'submit').val('确 定');
        div.append(submit);
        form.append(div);
        $('.wrapper').append(form);
        form
            .on(
            'submit',
            function() {
                var username = $('input[name=username]').val();
                var mobile = $('#cellphone').val();
                var email = $('input[name=email]').val();
                if (!username) {
                    alert("请输入用户名!");
                    return false;
                }

                if (!/^(13[0-9]|15[0|3|6|7|8|9]|18[8|9])\d{8}$/.test(mobile)) {
                    alert("手机号输入不正确!");
                    return false;
                }

                if (!/^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i
                    .test(email)) {
                    alert("输入电子邮箱格式不正确!");
                    return false;
                }
                var form = new FormData($('form').get(0));
                form.append('type', 'user');
                form.append('act', 'update');

                skyex.lib.req(skyex.requestUrl, form, function(data) {
                    switch (data.status) {
                        case 1:
                            alert(data.message);
                            skyex.app.user.initAccount(skyex.app.user.data);
                            // location.href =
                            // account_url;
                            break;
                    }
                });
                return false;
            });
    },
    initForgetPassword : function() {
        $('.title_bar').html('');
        var title = $('<h1>').html('忘记密码');
        var back = $('<button>').addClass('left_btn back_btn').attr('id', 'back');

        back.click(function() {
            skyex.app.user.initLogin();
        });
        $('.title_bar').append(back);
        $('.title_bar').append(title);

        $('.wrapper').html('');

        var form = $('<form>').addClass('user_form forget_password_form').attr(
            'method', 'post');

        var fieldset = $('<fieldset>');
        var div = $('<div>');
        var label = $('<label>').html('邮箱：').attr('for', 'email');
        var input = $('<input>').attr('name', 'email').attr('id', 'email').attr(
            'type', 'text').attr('placeholder', '请输入您的注册邮箱');
        div.append(label);
        div.append(input);
        fieldset.append(div);
        form.append(fieldset);
        div = $('<div>');
        input = $('<input>').attr('type', 'submit').addClass('form_btn send_btn')
            .val('发 送');
        div.append(input);
        form.append(div);
        $('.wrapper').append(form);
        form.on('submit', function() {
            var email = $('input[name=email]').val();
            if (!email) {
                alert("请输入邮箱!");
                return false;
            }
            var form = new FormData($('form').get(0));
            form.append('type', 'user');
            form.append('act', 'password_retreive');
            skyex.lib.req(skyex.requestUrl, form, function(data) {
                switch (data.status) {
                    case 1:
                        alert(data.message);
                        skyex.app.user.initLogin();
                        break;
                }
            });
            return false;
        });
    },
    initPassword : function() {
        $('.title_bar').html('');
        var title = $('<h1>').html('修改密码');
        var back = $('<button>').addClass('left_btn back_btn').attr('id', 'back');

        back.click(function() {
            skyex.app.user.initAccount(skyex.app.user.data);
        });
        $('.title_bar').append(back);
        $('.title_bar').append(title);

        $('.wrapper').html('');
        var form = $('<form>').addClass('user_form modify_password_form').attr(
            'method', 'post');

        var fieldset = $('<fieldset>');
        var div = $('<div>');
        var label = $('<label>').html('旧密码：').attr('for', 'old_pass');
        var input = $('<input>').attr('name', 'old_pass').attr('id', 'old_pass')
            .attr('type', 'password').attr('placeholder', '请输入您的旧密码');
        div.append(label);
        div.append(input);
        fieldset.append(div);

        div = $('<div>');
        label = $('<label>').html('新密码：').attr('for', 'new_pass');
        input = $('<input>').attr('name', 'new_pass').attr('id', 'new_pass').attr(
            'type', 'password').attr('placeholder', '由6-20位字母、数字或符号组成');
        div.append(label);
        div.append(input);
        fieldset.append(div);

        div = $('<div>');
        label = $('<label>').html('确认密码：').attr('for', 'new_pass2');
        input = $('<input>').attr('name', 'new_pass2').attr('id', 'new_pass2')
            .attr('type', 'password').attr('placeholder', '请再次输入您的新密码');
        div.append(label);
        div.append(input);
        fieldset.append(div);

        div = $('<div>');
        input = $('<input>').attr('type', 'submit').addClass('form_btn send_btn')
            .val('确 定');

        div.append(input);

        form.append(fieldset);
        form.append(div);
        $('.wrapper').html('').append(form);

        form.on('submit', function() {
            var old_pass = $('input[name=old_pass]').val();
            var new_pass = $('input[name=new_pass]').val();
            var new_pass2 = $('input[name=new_pass2]').val();
            if (!old_pass) {
                alert("请输入旧密码!");
                return false;
            }
            if (!new_pass) {
                alert("请输入新密码!");
                return false;
            }

            if (!new_pass2) {
                alert("请输入确认密码!");
                return false;
            }

            if (new_pass != new_pass2) {
                alert("二次输入密码不一致!");
                return false;
            }

            if (new_pass == old_pass) {
                alert("尼玛，二次输入密码一致的，想玩我啊！!");
                return false;
            }

            var form = new FormData($('form').get(0));
            form.append('type', 'user');
            form.append('act', 'password_update');
            skyex.lib.req(skyex.requestUrl, form, function(data) {
                switch (data.status) {
                    case 1:
                        alert(data.message);
                        skyex.app.user.initAccount(skyex.app.user.data);
                        break;
                }
            });
            return false;
        });
    },
    initAccount : function(user) {
        skyex.app.tab.swap($('#nav-bar-2'));
        $('.wrapper').html('');
        $('.title_bar').html('');
        var title = $('<h1>').html('我的天易');
        $('.title_bar').append(title);

        var div = $('<div>').addClass('my_account');

        div.append('<header><h2>' + user.username + '</h2></header>');

        var myOrders = $('<ul>');
        var order = $('<a>').html('我的订单');
        myOrders.append($('<li>').append(order));

        order.click(function() {
            skyex.app.html.model.order.my();
        });

        div.append(myOrders);

        var myStore = $('<ul>');
        var storeOrder = $('<a>').html('门店订单');
        var store = $('<a>').html('我的门店');
        var statistics = $('<a>').html('门店统计');

        myStore.append($('<li>').append(storeOrder));
        myStore.append($('<li>').append(store));
        myStore.append($('<li>').append(statistics));

        div.append(myStore);

        var ul = $('<ul>');
        var li = $('<li>');
        var a = $('<a>').html('我的信息').click(function() {
            skyex.app.user.initProfile(user);
        });

        li.append(a);

        a = $('<a>').html('修改密码').click(function() {
            skyex.app.user.initPassword();
        });
        li.append(a);
        ul.append(li);
        div.append(ul);

        a = $('<a>');
        var button = $('<button>').attr('type', 'button').addClass(
            'box_btn exit_btn').html('退 出');
        a.append(button);
        button.click(function() {
            skyex.app.user.logout();
        });
        div.append(a);
        $('.wrapper').append(div);

    },

    initRegister : function() {
        $('.title_bar').html('');
        var title = $('<h1>').html('用户注册');
        var back = $('<button>').addClass('left_btn back_btn').attr('id', 'back');

        back.click(function() {
            skyex.app.user.initLogin();
        });
        $('.title_bar').append(back);
        $('.title_bar').append(title);

        $('.wrapper').html('');
        var form = $('<form>').addClass('user_form register_form').attr('method',
            'post');

        var fieldset = $('<fieldset>');
        var div = $('<div>');
        var label = $('<label>').html('用户名：');
        var input = $('<input>').attr('name', 'username').attr('maxlength', '20')
            .attr('type', 'text').attr('placeholder', "由4-20位中英文、数字组成");
        div.append(label);
        div.append(input);
        fieldset.append(div);

        div = $('<div>');
        label = $('<label>').html('密码：');
        input = $('<input>').attr('name', 'password').attr('maxlength', '20').attr(
            'type', 'password').attr('placeholder', "由6-20位字母、数字或符号组成");
        div.append(label);
        div.append(input);
        fieldset.append(div);

        div = $('<div>');
        label = $('<label>').html('确认密码：');
        input = $('<input>').attr('name', 'password2').attr('maxlength', '20')
            .attr('type', 'password').attr('placeholder', "请再次输入密码");
        div.append(label);
        div.append(input);
        fieldset.append(div);

        div = $('<div>');
        label = $('<label>').html('邮箱：');
        input = $('<input>').attr('name', 'email').attr('type', 'text').attr(
            'placeholder', "请输入常用邮箱，用来找回密码");
        div.append(label);
        div.append(input);
        fieldset.append(div);

        div = $('<div>');
        label = $('<label>').html('验证码：');
        input = $('<input>').attr('name', 'captcha').attr('type', 'text').attr(
            'id', 'verific_code').attr('placeholder', "请输入验证码");
        var span = $('<span>');
        var img = $('<img>').attr('src', skyex.captchaUrl);
        span.append(img);
        span.append('点击刷新');

        span.click(function() {
            var src = img.attr('src');
            img.attr('src', '');
            img.attr('src', src);
        });
        div.append(label);
        div.append(input);
        div.append(span);
        fieldset.append(div);

        form.append(fieldset);

        div = $('<div>');

        var submit = $('<input>').addClass('form_btn register_btn').attr('type',
            'submit').val('注 册');
        div.append(submit);
        form.append(div);
        $('.wrapper').append(form);

        form
            .on(
            'submit',
            function() {
                var username = $('input[name=username]').val();
                var password = $('input[name=password]').val();
                var password2 = $('input[name=password2]').val();
                var email = $('input[name=email]').val();
                var captcha = $('input[name=captcha]').val();
                if (!username) {
                    alert("请输入用户名!");
                    return false;
                }
                if (username.length < 2 || username.length > 20) {
                    alert("用户名长度必须在2~20以内!");
                    return false;
                }

                if (!password) {
                    alert("请输入密码!");
                    return false;
                }
                if (password.length < 6 || password.length > 20) {
                    alert("密码长度必须在6~20以内!");
                    return false;
                }

                if (!password2) {
                    alert("请输入重复密码!");
                    return false;
                }

                if (password != password2) {
                    alert("两次输入的密码不一致!");
                    return false;
                }
                if (!email) {
                    alert("请输入电子邮箱!");
                    return false;
                }

                if (!/^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i
                    .test(email)) {
                    alert("输入电子邮箱格式不正确!");
                    return false;
                }

                if (!captcha) {
                    alert("请输入验证码!");
                    return false;
                }

                var form = new FormData($('form').get(0));
                form.append('type', 'user');
                form.append('act', 'register');

                skyex.lib.req(skyex.requestUrl, form, function(data) {
                    switch (data.status) {
                        case 1:
                            alert(data.message);
                            skyex.app.user.initLogin();
                            break;
                    }
                });
                return false;
            });
    },

    initLogin : function() {
        skyex.app.tab.swap($('#nav-bar-2'));
        $('.title_bar').html('');
        var title = $('<h1>').html('用户登录');
        var register = $('<a>').addClass('right_btn').html('注册');
        register.click(function() {
            skyex.app.user.initRegister();
        });
        $('.title_bar').append(title);
        $('.title_bar').append(register);

        $('.wrapper').html('');
        var form = $('<form>').addClass('user_form login_form').attr('method',
            'post');
        var fieldset = $('<fieldset>');
        var userDiv = $('<div>'), passDiv = $('<div>'), forgetDiv = $('<div>'), submitDiv = $('<div>');
        var username = $('<input>').attr('placeholder', '请输入注册用户名或者邮箱').attr('id',
            'username').attr('name', 'username').attr('type', 'text');
        var password = $('<input>').attr('placeholder', '请输入密码').attr('id',
            'password').attr('name', 'password').attr('type', 'password');
        userDiv.append(username);
        passDiv.append(password);
        fieldset.append(userDiv);
        fieldset.append(passDiv);
        form.append(fieldset);
        var forgetPassword = $('<a>').html('忘记密码');

        forgetPassword.click(function() {
            skyex.app.user.initForgetPassword();
        });
        forgetDiv.append(forgetPassword);
        var submit = $('<input>').addClass('form_btn login_btn').attr('type',
            'submit').val('登 录');
        submitDiv.append(submit);
        form.append(forgetDiv);
        form.append(submitDiv);
        $('.wrapper').append(form);
        form.on('submit', function() {
            var username = $('input[name=username]').val();
            var password = $('input[name=password]').val();
            if (!username) {
                alert("请输入用户名!");
                return false;
            }
            if (!password) {
                alert("请输入密码!");
                return false;
            }
            var form = new FormData($('form').get(0));
            form.append('type', 'user');
            form.append('act', 'login');

            skyex.lib.req(skyex.requestUrl, form, function(data) {
                switch (data.status) {
                    case 1:
                        alert(data.message);
                        skyex.app.user.profile();
                        break;
                }
            });
            return false;
        });
    }

};

skyex.app.tab = {
    cur : null,
    swap : function(node) {
        if (skyex.app.tab.cur) {
            skyex.app.tab.cur.removeClass('current');
        }
        $(node).addClass('current');
        skyex.app.tab.cur = $(node);
    },

    init : function() {
        skyex.app.box.clear();
    }
};

$(document).ready(function() {
    skyex.app.html.init();
});
(function ($) {
    var $t = $.telerik;
    function getContent1() {
        return '<html><head></head><body style="background-color:#EEEEEe;padding:0;margin:0"></body></html>';
    }

    function getContent2() {
        return '<div style="width:130px;margin:0 auto"><table style="height:' + ($(window).height() - 64) +
                'px;"><tr><td><div style=\'background: transparent url("/Content/2011.1.315/Outlook/loading-image.svg") no-repeat 0 0;width:50px;height:50px;margin:0 0 10px 44px;\' ></div><div style="font-weight:bold;color:blue;width:130px;text-align:center;direction:rtl">لطفا منتظر بمانید...</div></td></tr></table></div>'
    }

    $t.tabstrip = function (element, options) {
        this.element = element;
        var $element = $(element);
        var obj = this;
        $element.find('.t-close').click(function () {
            obj.close($(this).closest('li')[0]);
        });
        this.$contentElements = $element.find('> .t-content');
        $.extend(this, options);
        if (this.contentUrls)
            $element.find('.t-tabstrip-items > .t-item').each($.proxy(function (index, item) {
                    $(item).find('.t-link').data('ContentUrl', this.contentUrls[index]);
            }, this));
        var enabledItems = '.t-tabstrip-items > .t-item:not(.t-state-disabled)';
        $element.delegate(enabledItems, 'mouseenter', $t.hover)
			.delegate(enabledItems, 'mouseleave', $t.leave)
			.delegate(enabledItems, options.activateEvent, $t.delegate(this, this._click))
            .delegate('.t-tabstrip-items > .t-state-disabled .t-link', 'click', $t.preventDefault);
        $t.bind(this, {
            select: $.proxy(function (e) {
                if (e.target == this.element && this.onSelect) this.onSelect(e);
            }, this),
            contentLoad: this.onContentLoad,
            error: this.onError,
            load: this.onLoad,
            closed: this.onClose,
            addClick: this.onAddClick
        });
        $element.find('.t-add').click(function () {
            $t.trigger(obj.element, 'addClick');
        });
        var selectedItems = $element.find('li.t-state-active'),
            $content = $(this.getContentElement(selectedItems.parent().children().index(selectedItems)));
        if ($content.length > 0 && $content[0].childNodes.length == 0)
            this.activateTab(selectedItems.eq(0), true);
    };

    $.extend($t.tabstrip.prototype, {
        selectTab: function(index){
            var $li = $(this.element).find('ul li').eq(index);
            this.activateTab($li);
        },
        select: function (li) {
            $(li).each($.proxy(function (index, item) {
                var $item = $(item);
                if ($item.is('.t-state-disabled,.t-state-active'))
                    return;
                this.activateTab($item);
            }, this));
        },
        enable: function (li) {
            $(li).addClass('t-state-default').removeClass('t-state-disabled');
        },
        disable: function (li) {
            $(li).removeClass('t-state-default').removeClass('t-state-active').addClass('t-state-disabled');
        },
        reload: function (li) {
            var tabstrip = this;
            $(li).each(function () {
                var $item = $(this), contentUrl = $item.find('.t-link').data('ContentUrl');
                if (contentUrl) 
                    tabstrip.ajaxRequest($item, $(tabstrip.getContentElement($item.index())), null, contentUrl);
            });
        },
        _click: function (e, element) {
            var $item = $(element), $link = $item.find('.t-link'), href = $link.attr('href'),
                $content = $(this.getContentElement($item.index()));
            if ($item.is('.t-state-disabled,.t-state-active')) {
                e.preventDefault();
                return;
            }
            if ($t.trigger(this.element, 'select', { item: $item[0], contentElement: $content[0] }))
                e.preventDefault();
            var isAnchor = $link.data('ContentUrl') || (href && (href.charAt(href.length - 1) == '#' || href.indexOf('#' + this.element.id + '-') != -1));
            if (!href || isAnchor || ($content.length > 0 && $content[0].childNodes.length == 0)) {
                e.preventDefault();
            }
            else
                return;
            if (this.activateTab($item))
                e.preventDefault();
            if (this.tabSelected)
                this.tabSelected($item[0]);
        },
        size: function (width, height) {
            $(this.element).width(width);
            height -= $(this.element).find('.t-reset.t-tabstrip-items').height() + 20;
            $(this.element).find('.t-content').height(height);
        },
        activateTab: function ($item, isFirstLoad) {
            // deactivate previously active tab
            var curentIndex = $item.parent().children().index($item.parent().find('.t-state-active'));
            var itemIndex = $item.parent().children().removeClass('t-state-active').addClass('t-state-default')
					.index($item);
            // activate tab
            $item.removeClass('t-state-default').addClass('t-state-active');
            if (curentIndex == itemIndex && !isFirstLoad)
                return false;
            // handle content elements
            var $contentElements = this.$contentElements;
            if ($contentElements.length == 0)
                return false;
            var $visibleContentElements = $contentElements.filter('.t-state-active');
            // find associated content element
            var href = $item.find('a').attr('href');
            var $content = null;
            if (href && href.charAt(0) == '#')
                $content = $(this.element).find(href);
            else
                $content = $($(this.element).find('.t-content')[itemIndex]);
            var tabstrip = this;
            if ($content.length == 0) {
                $visibleContentElements.removeClass('t-state-active');
                $t.fx.rewind(tabstrip.effects, $visibleContentElements, {});
                return false;
            }
            var isAjaxContent = $content.is(':empty'),
                showContentElement = function () {
                    $content.addClass('t-state-active');
                    $t.fx.play(tabstrip.effects, $content, {});
                };
            $visibleContentElements.removeClass('t-state-active').stop(false, true);
            $t.fx.rewind(
                tabstrip.effects,
			    $visibleContentElements, {},
			    function () {
			        if ($item.hasClass('t-state-active')) {
			            if (!isAjaxContent)
			                showContentElement();
			            else
			                tabstrip.ajaxRequest($item, $content, function () {
			                    if ($item.hasClass('t-state-active'))
			                        showContentElement();
			                });
			        }
			    });
            return true;
        },
        getSelectedTabIndex: function () {
            return $(this.element).find('li.t-state-active').index();
        },
        closeCurentTab: function () {
            this.close($(this.element).find('li.t-state-active')[0]);
        },
        close: function (li) {
            var href = $(li).find('a').attr('href');
            var $content = null;
            var index = $(li).parent().children().index($(li));
            if (href.charAt(0) == '#')
                $content = $(this.element).find(href);
            else
                $content = $($(this.element).find('.t-content')[index]);
            var selectedIndex = this.getSelectedTabIndex();
            if (index == selectedIndex) {
                if (index > 0)
                    this.activateTab($(li).parent().children().eq(index - 1))
                else
                    this.activateTab($(li).parent().children().eq(index + 1))
            }
            $(li).remove();
            $content.remove();
            this.$contentElements = $(this.element).find('> .t-content');
            if (!$t.trigger(this.element, 'closed', { item: li, contentElement: $content[0] })) {

            }

        },
        getActiveTabUrl: function () {
            var src = null;
            $(this.element).children().eq(0).find('li').each(function () {
                if ($(this).hasClass('t-state-active')) {
                    src = $(this).data("src");
                    return false;
                }
            });
            return src;
        },
        addOrOpen: function (url, obj, title) {
            var index = 0, isNew = true;
            $(this.element).children().eq(0).find('li').each(function () {
                var src = $(this).data("src");
                if (src == url) {
                    index = parseInt($(this).find('a').attr('href').split('-')[1]);
                    isNew = false;
                    return false;
                }
                index++;
            });
            var height = $(window).height() - 85;
            if (isNew) {
                var id = $(this.element).attr('id') + '-' + (index + 1);
                var width = $(window).width() - 285;
                var $ul = $(this.element).children().eq(0);
                $ul.append('<li class="t-item t-state-default"><a class="t-link" href="#' + id + '">' + title + '</a><span class="t-close"></span></li> ');
                $ul.children().last().data("src", url);
                $(this.element).append('<div class="t-content" style="height:' + (height + 2) + 'px;padding:2px 2px!important" id="' + id +
                    '"><iframe id ="' + id + '_" src="' + url + '?param=' + encodeURI(JSON.stringify(obj)) + '"frameborder="0" style="width:' + width + 'px;height:' + height + 'px;" ></iframe></div>');
                thisObj = this;
                $(this.element).find('li').last().find('.t-close').click(function () {
                    thisObj.close($(this).closest('li')[0]);
                });
                this.activateTab($(this.element).find('li').last());
            } else {
                var $item = $('.t-reset.t-tabstrip-items').find('li').eq(index - 1);
                var id = $item.find('a').attr('href') + '_';
                id = id.substr(1);
                $(document.getElementById(id)).attr('src', url + '?param=' + encodeURI(JSON.stringify(obj)));
                this.activateTab($item);
            }
        },
        refreshCurentTab: function(url, data){
            var id = $(this.element).find('li.t-state-active').find('a.t-link').attr('href') + '_';
            $(id).contents().find('body').html(getContent2());
            var urlQueryString = url;
            if (data)
                urlQueryString = url + '?param=' + encodeURI(JSON.stringify(data));
            $.telerik.post(urlQueryString, null, function (result) {
                id = id.substring(1);
                document.getElementById(id).contentWindow.document.write(result);
                document.getElementById(id).contentWindow.document.close();
            });
        },
        openOrCreate: function (url, text, obj) {
            var index = 0, isNew = true;
            $(this.element).children().eq(0).find('li').each(function () {
                var src = $(this).data("src");
                if (src == url) {
                    index = parseInt($(this).find('a').attr('href').split('-')[1]);
                    isNew = false;
                    return false;
                }
                index++;
            });
            var urlQueryString = url;
            if (obj != null)
                urlQueryString = url + '?param=' + encodeURI(JSON.stringify(obj));
            var height = $(window).height() - 50;
            var content1 = getContent1();
            var content2 = getContent2();
            if (isNew == true) {
                var id = $(this.element).attr('id') + '-' + (index + 1);
                var width = $('#a111').width() - 14;
                var $ul = $(this.element).children().eq(0);
                $ul.append('<li class="t-item t-state-default"><a class="t-link" href="#' + id + '">' + text + '</a><span class="t-close"></span></li> ');
                $ul.children().last().data("src", url);
                $(this.element).append('<div class="t-content" style="height:' + (height + 5) + 'px;padding:2px 2px!important" id="' + id +
                    '"><iframe id="' + id + '_' + '" frameborder="0" style="width:' + width + 'px;height:' + height + 'px;" ></iframe></div>');
                document.getElementById(id + '_').contentWindow.document.write(content1);
                document.getElementById(id + '_').contentWindow.document.close();
                $('#' + id + '_').contents().find('body').html(content2);
                var tabStrip = this;
                $.telerik.post(urlQueryString, null, function (result) {
                    document.getElementById(id + '_').contentWindow.document.write(result);
                    document.getElementById(id + '_').contentWindow.document.close();
                }, function () {
                    tabStrip.closeCurentTab();
                });
                //$('#' + id + '_').attr('src', urlQueryString);
                this.$contentElements = $(this.element).find('> .t-content');
                var thisObj = this;
                $(this.element).find('li').last().find('.t-close').click(function () {
                    thisObj.close($(this).closest('li')[0]);
                });
                this.activateTab($(this.element).find('li').last());
            }
            else {
                var $item = $('.t-reset.t-tabstrip-items').find('li').eq(index - 1);
                var id = $item.find('a').attr('href') + '_';
                id = id.substr(1);
                document.getElementById(id).contentWindow.document.write(content1);
                document.getElementById(id).contentWindow.document.close();
                $('#' + id).contents().find('body').html(content2);
                //$('#' + id).attr('src', urlQueryString);
                $.telerik.post(urlQueryString, null, function (result) {
                    document.getElementById(id).contentWindow.document.write(result);
                    document.getElementById(id).contentWindow.document.close();
                }, function () {
                    tabStrip.closeCurentTab();
                });
                this.activateTab($item);
            }
        },
        getContentElement: function (itemIndex) {
            var $element = $(this.element);
            this.$contentElements = $element.find('> .t-content');
            if (isNaN(itemIndex - 0)) return;
            var $contentElements = this.$contentElements,
                idTest = new RegExp('-' + (itemIndex + 1) + '$');
            for (var i = 0, len = $contentElements.length; i < len; i++) {
                if (idTest.test($contentElements[i].id)) 
                    return $contentElements[i];
            }
        },
        ajaxRequest: function ($element, $content, complete, url) {
            if ($element.find('.t-loading').length)
                return;

            var $link = $element.find('.t-link'),
                data = {},
                statusIcon = null,
                loadingIconTimeout = setTimeout(function () {
                    statusIcon = $('<span class="t-icon t-loading"></span>').prependTo($link)
                }, 100);

            $.ajax({
                type: 'GET',
                cache: false,
                url: url || $link.data('ContentUrl') || $link.attr('href'),
                dataType: 'html',
                data: data,

                error: $.proxy(function (xhr, status) {
                    if ($t.ajaxError(this.element, 'error', xhr, status))
                        return;
                }, this),

                complete: function () {
                    clearTimeout(loadingIconTimeout);
                    if (statusIcon !== null)
                        statusIcon.remove();
                },

                success: $.proxy(function (data, textStatus) {
                    $content.html(data);

                    if (complete)
                        complete.call(this, $content);

                    $t.trigger(this.element, 'contentLoad', { item: $element[0], contentElement: $content[0] });
                }, this)
            });
        }
    });

    // Plugin declaration
    $.fn.tTabStrip = function (options) {
        return $t.create(this, {
            name: 'tTabStrip',
            init: function (element, options) {
                return new $t.tabstrip(element, options);
            },
            options: options
        });
    }

    // default options
    $.fn.tTabStrip.defaults = {
        activateEvent: 'click',
        effects: $t.fx.toggle.defaults()
    };
})(jQuery);
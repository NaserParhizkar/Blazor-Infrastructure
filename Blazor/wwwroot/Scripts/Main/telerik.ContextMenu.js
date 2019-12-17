(function ($) {
    var $t = $.telerik;

    $t.contextMenu = function (element, options) {
        this.element = element;
        $.extend(this, options);
        if (!_global) _global = {};
        if (!_menus) _menus = {};
        _menus[id] = $.extend({
            hoverClass: 'hover',
            submenuClass: 'submenu',
            separatorClass: 'separator',
            operaEvent: 'ctrl+click',
            fadeIn: 200,
            delay: 300,
            keyDelay: 100,
            widthOverflowOffset: 0,
            heightOverflowOffset: 0,
            submenuLeftOffset: 0,
            submenuTopOffset: 0,
            autoAddSubmenuArrows: true,
            startLeftOffset: 0,
            startTopOffset: 0,
            keyboard: true
        }, options || {});
    }

    $.fn.contextMenu = function (options) {

        var q = $t.create(this, {
            name: 'tContextMenu',
            init: function (element, options) {
                return new $t.contextMenu(element, options);
            },
            options: options
        });

        return q;
    };

    $t.contextMenu.prototype = {
        _overflow: function (x, y) {
            return {
                width: x - $(window).width() - $(window).scrollLeft(),
                height: y - $(window).height() - $(window).scrollTop()
            };
        },

        _onKeyUpDown: function (down) {
            if (_menus[_global.activeId].currentHover) {
                var prevNext = down ?
                _menus[_global.activeId].currentHover.nextAll(':not(.' + _menus[_global.activeId].separatorClass + '):visible:first') :
                _menus[_global.activeId].currentHover.prevAll(':not(.' + _menus[_global.activeId].separatorClass + '):visible:first');
                if (prevNext.length == 0) {
                    prevNext = _menus[_global.activeId].currentHover.parent().find('> li:visible');
                    prevNext = (down ? $(prevNext[0]) : $(prevNext[prevNext.length - 1]));
                }
                prevNext.mouseover();
            }
            else {
                var visibleMenus = $('#' + _global.activeId + ', #' + _global.activeId + ' ul').filter(function () {
                return ($(this).is(':visible') && $(this).parents(':hidden').length == 0);
                });
                if (visibleMenus.length > 0) {
                    var visibleItems = $(visibleMenus[visibleMenus.length - 1]).find('> li:visible');
                    $(visibleItems[(down ? 0 : (visibleItems.length - 1))]).mouseover();
                }
            }
        },

        _clearActive: function () {
            for (cm in _menus) {
                $(_menus[cm].allContext).removeClass(_global.activeClass);
            }
        },

        _resetMenu: function () {
            if (_global.activeId) $('#' + _global.activeId).add('#' + _global.activeId + ' ul').hide();
            clearInterval(_global.keyUpDown);
            _global.keyUpDownStop = false;
            if (_menus[_global.activeId]) _menus[_global.activeId].currentHover = null;
            _global.activeId = null;
            $(document).unbind('.jeegoocontext');
            $(window).unbind('resize.jeegoocontext');
        },

        _resetMenu: function () {
            if (_global.activeId) $('#' + _global.activeId).add('#' + _global.activeId + ' ul').hide();
            clearInterval(_global.keyUpDown);
            _global.keyUpDownStop = false;
            if (_menus[_global.activeId]) _menus[_global.activeId].currentHover = null;
            _global.activeId = null;
            $(document).unbind('.jeegoocontext');
            $(window).unbind('resize.jeegoocontext');
        }
    }
})(jQuery);
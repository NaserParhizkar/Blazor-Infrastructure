(function ($) {
    var $t = $.telerik;
    $t.checkBox = function (element, options) {
        this.element = element;
        $.extend(this, options);
        var thisObject = this;
        $(element).bind({
            click: $.proxy(this.click, this),
            change: $.proxy(this.change, this)
        });
        $t.bind(this, {
            change: this.onChange
        });
    }

    $.fn.tCheckBox = function (options) {
        var q = $t.create(this, {
            name: 'tCheckBox',
            init: function (element, options) {
                return new $t.checkBox(element, options);
            },
            options: options
        });

        return q;
    };

    $t.checkBox.prototype = {
        click: function (e) {
            if (this.isSes == true) {
                var grid = $t.getGrid(null, this.element);
                if (grid) {
                    var obj = $t.getSearchObject();
                    for (var key in grid.dataKeys) {
                        var temp = $t.getValueOfItem(key);
                        if (temp)
                            obj[key] = $t.getValueOfItem(key);
                    }
                    grid.selectedObject = obj;
                    grid.currentPage = 1;
                    grid.rowIndex = 0;
                    grid.reLoad();
                }
            }
        },
        change: function(e){

        },
        focus: function(){
            $(this.element).focus();
        },
        enable: function () {
            $(this.element).attr('disabled', null);
        },
        disable: function(){
            $(this.element).attr('disabled', "disabled");
        },
        value: function (value) {
            if (arguments.length == 0)
                return $(this.element).prop('checked');
            $(this.element).prop('checked', value);
        }
    }
})(jQuery);
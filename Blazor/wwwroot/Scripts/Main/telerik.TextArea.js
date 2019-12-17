(function ($) {
    var $t = $.telerik;
    function enableLabel(element) {
        var id = $(element).attr('id');
        if ($(element).closest('.t-widget.t-multitextbox').hasClass('t-state-disabled'))
            $('label[for=' + id + ']').css('color', '#e5e2e2');
        else
            $('label[for=' + id + ']').css('color', '');
    }
    $t.textArea = function (element, options) {
        this.element = element;
        $.extend(this, options);
        var thisObject = this;
        $(element).change(function () {
            if (thisObject.onChange != undefined)
                thisObject.onChange(thisObject);
            $t.trigger(element, 'changeValue', { dataItem: null });
        });
        $(element).bind({
            click: $.proxy(this.click, this)
        });
        enableLabel(element);
    }

    $t.textArea.prototype = {
        showRequired: function () {
            if (this.required) {
                if (this.value() == '') {
                    this.focus();
                    $(this.element).parent().find('span').css('display', '');
                    return true;
                }
            }
            return false;
        },
        hideRequired: function(){
            if (this.value())
                $(this.element).parent().find('span').css('display', 'none');
        },
        showErrorMessage: function () {
            return this.showRequired();
        },
        value: function (val) {
            if (arguments.length === 0)
                return $(this.element).val();
            $(this.element).val(val);
            this.showRequired();
            this.hideRequired();
        },
        focus: function () {
            $(this.element).focus();
        },
        enable: function (flag) {
            if (arguments.length == 0)
                return $(this.element).attr('disabled') != "disabled";
            $(this.element).parent().removeClass('t-state-disabled');
            if (flag)
                $(this.element).attr('disabled', null);
            else
                $(this.element).attr('disabled', "disabled");
        },
        disable: function (flag) {
            if (arguments.length == 0)
                return $(this.element).attr('disabled') === "disabled";
            $(this.element).parent().addClass('t-state-disabled');
            if (flag)
                $(this.element).attr('disabled', true);
            else
                $(this.element).attr('disabled', null);
                
        }
    }

    $.fn.tTextArea = function (options) {
        var q = $t.create(this, {
            name: 'tTextArea',
            init: function (element, options) {
                return new $t.textArea(element, options);
            },
            options: options
        });
        return q;
    };
})(jQuery);
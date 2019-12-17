(function ($) {
    $.fn.getSelection = function () {
        let id = $(this).attr('id');
        let el = this[0];
        if (id)
            el = document.getElementById(id);
        el.focus();
        var start = 0, end = 0, normalizedValue, range, textInputRange, len, endRange;
        if (typeof el.selectionStart === "number" && typeof el.selectionEnd === "number") {
            
            start = el.selectionStart;
            //$('#qwe').text(start + '++' + Date().toString());
            end = el.selectionEnd;
        }
        else {
            range = document.selection.createRange();
            if (range && range.parentElement() === el) {
                len = el.value.length;
                normalizedValue = el.value.replace(/\r\n/g, "\n");
                textInputRange = el.createTextRange();
                textInputRange.moveToBookmark(range.getBookmark());
                endRange = el.createTextRange();
                endRange.collapse(false);
                if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                    start = end = len;
                }
                else {
                    start = -textInputRange.moveStart("character", -len);
                    start += normalizedValue.slice(0, start).split("\n").length - 1;
                    if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                        end = len;
                    } else {
                        end = -textInputRange.moveEnd("character", -len);
                        end += normalizedValue.slice(0, end).split("\n").length - 1;
                    }
                }
            }
        }
        
        return {
            start: start,
            end: end
        };
    };
    $.fn.setCursorPosition = function (start, end) {
        let input = this[0];
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(start, end);
        } else
            if (input.createTextRange) {
                var range = input.createTextRange();
                range.collapse(true);
                range.moveEnd('character', selectionEnd);
                range.moveStart('character', selectionStart);
                range.select();
            }
    };
    $.fn.getData = function (obj) {
        var myObject = new Object();
        if (obj !== undefined && obj !== null)
            myObject = obj;
        $(this).find('input,img,textarea').each(function () {
            if ($(this).attr('id') !== '') {
                var item = $.telerik.getItem($(this).attr('id'));

                var value = $.telerik.getValueOfItem($(this).attr('id'));
                if (value || value === false) {
                    var name = $(this).attr('name');
                    if (item && item.imageId) 
                        name = item.imageIdFieldName;
                    parts = name.split(".");
                    if (parts.length === 3) {
                        if (!myObject[parts[0]])
                            myObject[parts[0]] = new Object();
                        if (!myObject[parts[0]][parts[1]])
                            myObject[parts[0]][parts[1]] = new Object();
                        myObject[parts[0]][parts[1]][parts[2]] = value;
                    }
                    else
                        if (parts.length === 2) {
                            if (!myObject[parts[0]])
                                myObject[parts[0]] = new Object();
                            myObject[parts[0]][parts[1]] = value;
                        }
                        else
                            myObject[name] = value;
                }
            }
        });
        return myObject;
    };
    $.fn.getSearchData = function (obj) {
        var myObject = new Object();
        if (obj !== undefined && obj !== null)
            myObject = obj;
        $('input,textarea').each(function () {
            if ($(this).attr('id') !== '') {
                var item = $.telerik.getItem($(this).attr('id'));
                if (item && item.isSes) {
                    var value = $.telerik.getValueOfItem($(this).attr('id'));
                    if (value || value === false) {
                        var name = $(this).attr('name');
                        name = name.substring(0, name.length - 3);
                        parts = name.split(".");
                        if (parts.length === 3) {
                            if (!myObject[parts[0]])
                                myObject[parts[0]] = new Object();
                            if (!myObject[parts[0]][parts[1]])
                                myObject[parts[0]][parts[1]] = new Object();
                            myObject[parts[0]][parts[1]][parts[2]] = value;
                        }
                        else
                            if (parts.length === 2) {
                                if (!myObject[parts[0]])
                                    myObject[parts[0]] = new Object();
                                myObject[parts[0]][parts[1]] = value;
                            }
                            else
                                myObject[name] = value;
                    }
                }
            }
        });
        return myObject;
    };
    $.fn.getControl = function () {
        var item = $(this).data('tTextBox');
        if (item)
            return item;
        item = $(this).data('tDropDownList');
        if (item)
            return item;
        item = $(this).data('tComboBox');
        if (item)
            return item;
        item = $(this).data('tDatePicker');
        if (item)
            return item;
        item = $(this).data('tCheckBox');
        if (item)
            return item;
        return $(this).data('tGrid');
    };
    $.fn.validateElements = function () {
        return !$(this).checkError();
    };
    $.fn.checkError = function () {
        var flag = false;
        $.telerik.hideErrorMessage();
        $(this).find('input').each(function () {
            var temp = $.telerik.getItem($(this).attr('id'));
            
            if (temp && $(this).attr('id') && temp.enabled && temp.showRequired && temp.showRequired()) {
                flag = true;
                return false;
            }
        });
        if (flag)
            return true;
        $(this).find('input').each(function () {
            var temp = $.telerik.getItem($(this).attr('id'));
            if ($(this).attr('id') && temp && temp.enabled && temp.showErrorMessage && temp.showErrorMessage()) {
                flag = true;
                return false;
            }
        });
        $(this).find('textarea').each(function () {
            var temp = $(this).data('tTextArea');
            if (temp && temp.enabled && temp.showErrorMessage() ) {
                flag = true;
                return false;
            }
        });
        return flag;
    };
    $.fn.setData = function (obj) {
        $(this).find('input').each(function () {
            if ($(this).attr('id') !== '') {
                var name = $(this).attr('name');
                parts = name.split(".");
                var temp = obj;
                for (var i = 0; i < parts.length; i++) {
                    if (temp)
                        temp = temp[parts[i]];
                }
                if (temp !== undefined) {
                    $.telerik.setValueOfItem($(this).attr('id'), temp);
                }
            }
        });
    };
    $.fn.clear = function () {
        $(this).find('input,textarea').each(function () {
            if ($(this).attr('id') !== '') {
                var name = $(this).attr('name');
                $.telerik.setValueOfItem($(this).attr('id'), null);
            }
        });
    }
    $.fn.getGrid = function () {
        if ($(this).html() === undefined)
            throw Error("خطا:control is null and grid not found");
        var id = $(this).closest('.t-widget.t-grid').attr('id');
        var id1 = $(this).attr('id');
        if (id !== id1) {
            $(this).closest('.t-widget.t-grid tr').removeClass('t-state-selected');
            $(this).closest('tr').addClass('t-state-selected');
        }
        var grid = $('#' + id).data('tGrid');
        if (!grid)
            throw Error("خطا:Grid not found");
        if (id !== id1)
            $(this).closest('tr').addClass('t-state-selected').siblings().removeClass('t-state-selected').end();
        return grid;
    }
    $.fn.getCheckBox = function () {
        return $(this).data('tCheckBox');
    }
    $.fn.getComboBox = function () {
        return $(this).data('tComboBox');
    }
    $.fn.getDatePicker = function () {
        return $(this).data('tDatePicker');
    }
    $.fn.getTextBox = function () {
        return $(this).data('tTextBox');
    }
    $.fn.getDropDownList = function () {
        return $(this).data('tDropDownList');
    }
    $.fn.selectText = function (start, length) {
        var id = $(this).attr('id');
        var field = document.getElementById(id);
        if (field.createTextRange) {
            var selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart('character', start);
            selRange.moveEnd('character', end);
            selRange.select();
        } else if (field.setSelectionRange) {
            field.setSelectionRange(start, start + length);
        } else if (field.selectionStart) {
            field.selectionStart = start;
            field.selectionEnd = start + length;
        }
        field.focus();
    };
    $.fn.getTreeView = function () {
        return $(this).data('tTreeView');
    }
    $.fn.scrollable = function () {
        var xStar, yStart, scrollTop, scrollLeft, mouseDown = false;
        var self_ = this;
        $(this).mousedown(function (e) {
            xStar = e.clientX;
            yStart = e.clientY;
            scrollTop = $(this).scrollTop();
            scrollLeft = $(this).scrollLeft();
            mouseDown = true;
        });
        $(window).mouseup(function () {
            mouseDown = false;
        });
        $(this).hover(function () {
            
        })
        $(window).mousemove(function (e) {
            if (mouseDown) {
                var difX = e.clientX - xStar;
                var difY = e.clientY - yStart;
                $(self_).scrollTop(scrollTop - 2 * difY);
                $(self_).scrollLeft(scrollLeft - 2 * difX);
            }
        });
    }
})(jQuery);

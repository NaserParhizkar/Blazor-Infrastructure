(function ($) {
    var $t = $.telerik,
        keycodes = [9, // tab
                    37, // left arrow
                    39, // right arrow
                    40, // down arrow
                    35, // end
                    36, // home
                    44], //","
        styles = ["font-family", "font-size", "font-stretch", "font-style", "font-weight", "letter-spacing", "line-height", "color",
            "text-align", "text-decoration", "text-indent", "text-transform"];
    var updateFlag;
    function getStyles(input) {
        var retrievedStyles = {};
        for (var i = 0, length = styles.length; i < length; i++) {
            var style = styles[i],
                value = input.css(style);

            if (value) {
                if (styles[i] != "font-style" && value != "normal") {
                    retrievedStyles[style] = value;
                }
            }
        }
        return retrievedStyles;
    }
    function seprate3Digit(str, start, end, keyCode, seprate) {
        var array = str.replace('-', '').split('.');
        var str1 = array[0];
        var count = 0;
        if (seprate) {
            for (var i = 0; i < start && i < array[0].length; i++)
                if (str1.charAt(i) == ',')
                    count++;
            str1 = str1.replace(/\,/g, '');
            var strTemp = "", j = 1;
            for (var i = str1.length; i > 0; i--) {
                strTemp = str1.charAt(i - 1) + strTemp;
                if (j == 3) {
                    j = 0;
                    if (i > 1)
                        strTemp = ',' + strTemp
                }
                j++;
            }
            var newCount = 0;
            var tempStart = start;
            if (strTemp.length % 4 == 1 && keyCode != 8)
                tempStart = start + 1;
            if (strTemp.length % 4 == 3 && keyCode == 8)
                tempStart = start - 1;
            for (var i = 0; i < tempStart && i < strTemp.length; i++)
                if (strTemp.charAt(i) == ',')
                    newCount++;
        }
        else
            strTemp = array[0];
        if (array.length > 1)
            strTemp += '.' + array[1];
        var pos = start + 1;
        if (keyCode == 8)
            pos = start - 1;
        if (keyCode == 46)
            pos = start;
        if (seprate) {
            if (newCount < count && (keyCode == 8 || keyCode == 46))
                pos--;
            else
                if (newCount > count)
                    pos++;
        }
        if (str.length > 0 && str[0] == '-')
            strTemp = '-' + strTemp;
        return { text: strTemp, pos: pos };
    }
    function removeStr(str, start, end, keyCode, seprate) {
        if (start == end) {
            var strTemp = "";
            if (keyCode == 8) {
                for (var i = 0; i < str.length; i++)
                    if (i != start - 1 || str[start - 1] == ',')
                        strTemp += str.charAt(i);
            }
            else {
                for (var i = 0; i < str.length; i++)
                    if (i != start || str[start] == ',')
                        strTemp += str.charAt(i);
            }
        } else {
            var strTemp = "";
            for (var i = 0; i < str.length; i++)
                if (i < start || i >= end)
                    strTemp += str.charAt(i);
        }
       
        return seprate3Digit(strTemp, start, end, keyCode, seprate);
    }
    function updateValue(element, key, total, digit, seprate) {
        if (key >= 96 && key < 106)
            key -= 48;
        var value = $(element).val(), flag = key == 190 || key == 110;
        if (digit == 0 && key == 110 || key == 190)
            return;
        var selection = $(element).getSelection();
        if (key == 8 || key == 46) {
            var obj = removeStr(value, selection.start, selection.end, key, seprate);
            $(element).val(obj.text);
            $(element).setCursorPosition(obj.pos, obj.pos);
            return;
        }
        var index = value.indexOf('.');
        if (index > -1) {
            if (value.replace(/\,/g, '').length > total)
                return;
            flag = false;
            var array = value.split('.');
            if (selection.start > index && array[1].length >= digit)
                return;
        }
        else {
            if (!flag && value.replace(/\,/g, '').length >= total && key != 37 && key != 39) {
                return;
            }
        }
        if (selection.start == 0 && (key == 109 || key == 173) && (value.indexOf('-') == -1))
            flag = true;
        if (key >= 48 && key < 58 || flag) {
            var chr = key - 48;
            var len = value.length;
            if (key == 190 || key == 110) {
                chr = '.';
                if (value.length - selection.end > digit)
                    len = selection.end + digit;
            }
            if (key == 109 || key == 173) 
                chr = '-'
            var str = value.substr(0, selection.start) + chr + value.substring(selection.end, len);
            var obj = seprate3Digit(str, selection.start, selection.end, key, seprate);
            $(element).val(obj.text);
            $(element).setCursorPosition(obj.pos, obj.pos);
        }
        if (key == 35) {
            var len = $(element).val().length;
            $(element).setCursorPosition(len, len);
        }
        if (key == 36)
            $(element).setCursorPosition(0, 0);
        if (key == 37 && selection.start > 0)
            $(element).setCursorPosition(selection.start - 1, selection.start - 1);
        if (key == 39)
            $(element).setCursorPosition(selection.start + 1, selection.start + 1);

    }
    function enableLable(element) {
        var id = $(element).attr('id');

        if ($(element).is('[disabled=disabled]'))
            $('label[for=' + id + ']').css('color', '#e5e2e2');
        else
            $('label[for=' + id + ']').css('color', '');
    }
    $t.textbox = function (element, options) {
        updateFlag = true;
        $.extend(this, options);
        if (this.type != 'string' && !this.simpleSearchUrl)
            $(element).attr('dir', 'ltr');
        if (this.simpleSearchUrl)
            $('body .t-rtl').append('<div class="ali-par" style="display:none;position:absolute;z-index:256;"></div>');
        $('div:not(.t-grid)').click(function (e) {
            if (!($(e.target).closest('.ali-par').hasClass('ali-par')))
                $('div[class="ali-par"]').css('display', 'none');
        });
        $(element).mouseenter(function () {
            $(this).parent().addClass('t-state-hover');
        });
        $(element).mouseleave(function () {
            $(this).parent().removeClass('t-state-hover');
        });
        if (this.maskedText)
            $(element).mask(this.maskedText);
        this.id = $(element).attr('id');
        var thisObj = this;
        $(element).parent().find('a').click(function () {
            if (thisObj.enabled)
                thisObj.showHelpWindow();
        });
        this.element = element;
        var preText = "";
        var preIndex = 0;
        var self = this;
        $(element).keyup(function (e) {
            self.Oprations(e);
        });
        enableLable(element);
        var $element = this.$element = $(element)
            .bind({
                focus: function (e) {
                    var input = e.target;
                    setTimeout(function () {
                        if ($.browser.msie)
                            input.select();
                        else {
                            input.selectionStart = 0;
                            input.selectionEnd = input.value.length;
                        }
                        thisObj.updateOnFocus();
                    }, 10);
                    $(input).parent().removeClass('t-state-hover');
                },
                keydown: $.proxy(this._keydown, this),
                keypress: $.proxy(this._keypress, this),
                keyup: function (e) {
                    thisObj.keyIsOperate = false;
                }
            }).bind("paste", $.proxy(this._paste, this));
        var builder = new $t.stringBuilder();
        if (element.parentNode.nodeName.toLowerCase() !== "div") {
            $element.addClass('t-input').wrap($('<div class="t-widget t-numerictextbox"></div>'));
            if (this.showDecreaseButton)
                builder.cat('<a class="t-link t-icon t-arrow-down" href="#" tabindex="-1" title="')
                    .cat(this.decreaseButtonTitle).cat('">Decrement</a>');
            if (builder.buffer.length > 0)
                $(builder.string()).insertAfter($element);
        }
        this.keyIsOperate = false;
        this.enabled = !$element.is('[disabled]');
        builder.buffer = [];
        builder.cat('[ |').cat(this.groupSeparator).catIf('|' + this.symbol, this.symbol).cat(']');
        this.replaceRegExp = new RegExp(builder.string(), 'g');
        var inputValue = $element.attr('value');
        builder.buffer = [];
        this.$text = $(builder.string()).insertBefore($element).css(getStyles($element))
            .click(function (e) {
                element.focus();
            });
        this[this.enabled ? 'enable' : 'disable']();
        if (this.type != 'string') {
            this.numFormat = this.numFormat === undefined ? this.type.charAt(0) : this.numFormat;
            var separator = this.separator;
            this.step = this.parse(this.step, separator);
            this.val = this.parse(this.val, separator);
            this.minValue = this.parse(this.minValue, separator);
            this.maxValue = this.parse(this.maxValue, separator);
            this.decimals = { '190': '.', '188': ',', '110': separator };
        }
        $t.bind(this, {
            load: this.onLoad,
            valueChange: this.onValueChange,
            ekeyPress: this.onKeyPress,
            change: this.onChange
        });
        $(element).blur(function () {
            thisObj._blur();
        });
        $(element).focus(function () {
            thisObj._focus();
        });
        if (this.group && this.type != 'string') {
            $(element).val($t.get3Digit($(element).val()));
        }
    }

    $t.textbox.prototype = {
        selection: function () {
            return $(this.element).getSelection();
        },
        updateValue: function (value) {
            this.value(value);
            this._blur();
        },
        updateDBLable: function () {
            if (this.advanceSearchUrl && !this.simpleSearchUrl) {
                var value = this.value();
                if (value != null) {
                    var gridName = $.telerik.getWindow().gridName;
                    if (gridName) {
                        var grid = $('#' + gridName).getGrid();
                        if (grid) {
                            var url = this.advanceSearchUrl.split('?')[0];
                            var index = url.lastIndexOf('/');
                            url = url.substring(0, index) + '/getRecordById';
                            var urlSection = grid.url('selectUrl').split('?')[0].substr(1).split('/');
                            url += '?dbLableUri=' + urlSection[0] + 'web' + urlSection[1] + urlSection[2];
                            var thisObj = this;
                            $.telerik.post(url, { id: value }, function (result) {
                                var obj = new Object();
                                thisObj.RCIds.forEach(function (temp) {
                                    var item1 = $('#' + temp).data('tDBLable');
                                    if (item1 != null) {
                                        var name = $('#' + temp).attr('name');
                                        var name1 = name.substr(name.indexOf('.') + 1).replace(/\./g, '_');
                                        item1.value(result[name1]);
                                        obj[name] = result[name1];
                                    }
                                });
                                obj = $.telerik.convertObject(obj);
                                $t.trigger(thisObj.element, "dBLableUpdated", obj);
                            });
                        }
                    }
                }
            }
        },
        showHelpWindow: function () {
            var win = $('#helpWindow').data('tHelpWindow');
            if (win) {
                win.onClose = this.onClose;
                win.otherKeyName = this.id;
                win.open(this.advanceSearchUrl, this.formWidth, this.formHeigh);
                this.updateOnFocus();
            }
        },
        updateOnFocus: function () {
            if (this.openOnFocus) {
                this.searchForm.open();
            }
        },
        showRequired: function (flag) {
            var value = this.value();
            if (value == undefined || value === null || value === '') {
                if (this.required) {
                    if (flag != false)
                        this.focus();
                    return true;
                }
            }
            return false;
        },
        showErrorMessage: function (flag) {
            if (this.showRequired(flag))
                return true;
            var id = $(this.element).attr('id');
            if (this.value() && (this.value() < this.minValue || this.value() > this.maxValue)) {
                if (flag != false) {
                    var message = 'مقادیر ' + this.minValue + '-' + this.maxValue + ' مجاز می باشند.';
                    if (this.errMsg)
                        message = this.errMsg;
                    $t.showErrorMessage(id, message);
                    this.focus();
                }
                return true;
            }
            if (this.checkEmail && this.value()) {
                var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
                if (!pattern.test(this.value())){
                    if (flag != false) {
                        $t.showErrorMessage(id, 'فرمت آدرس الکترونیکی نامعتبر است.');
                        this.focus();
                    }
                    return true;
                }
            }
            if (this.checkCodeMelli == true && !$t.checkCodeMelli(this.value(), this.delimiterChar)) {
                if (flag != false) {
                    $t.showErrorMessage(id, 'فرمت کدملی نامعتبر است.');
                    this.focus();
                }
                return true;
            }
            if (this.regularExpression) {
                var reg = new RegExp(this.regularExpression);
                if (this.value() && reg.test(this.value()) == false) {
                    if (flag != false) {
                        $t.showErrorMessage(id);
                        this.focus();
                    }
                    return true;
                }
            }
            return false;
        },
        setKeyValues: function (items) {
            var str = "";
            var array = new Array();
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                str += item.value;
                array.push(item.key);
                if (i < items.length - 1)
                    str += ' - ';
            }
            this.keyValue = array;
            this.$element.val(str);
        },
        _paste: function (e) {
            var val = this.$element.val();
            if ($.browser.msie) {
                var selectedText = this.element.document.selection.createRange().text;
                var text = window.clipboardData.getData("Text");

                if (selectedText && selectedText.length > 0) {
                    val = val.replace(selectedText, text);
                } else {
                    val += text;
                }
            }

            if (val == '-') return true;

            var parsedValue = this.parse(val, this.separator);
            if (parsedValue || parsedValue == 0) {
                this._update(parsedValue);
            }
        },
        gridsDataBind: function (result, obj) {
            var grid = $t.gridsDataBind(result);
            grid.selectedObject = obj;

            if (result.Message && result.Kind)
                return result.Kind == 1;
        },
        getSimpleFormGrid: function (rowIndex) {
            var obj = new Object();
            obj = this.value();
            if (!this.grid) {
                var id = $('div[class="ali-par"]').find('div[class="t-widget t-grid"]').attr('id');
                if (!id)
                    return;
                this.grid = $('#' + id).data('tGrid');
            }
            this.grid.tabStripObject = { 'value': obj };
            this.grid.onDataBinding = function (gr) {
                gr.rowIndex = rowIndex;
            }

            return this.grid;
        },
        UpdateSimpleForm: function () {
            $('div[class="ali-par"]').css('display', 'block');
            if (this.grid) {
                var item = $('#newEditForm').data('tWindow');
                item.relatedControlId = this.id;
                this.grid.currentPage = 1;
                this.grid.reLoad();
                this.grid.rowIndex = 0;
            }
        },
        openSimpleForm: function () {
            this.grid = null;
            var thisobject = this;
            var url = this.simpleSearchUrl;

            $t.post(url, null, function (result) {
                $('div[class="ali-par"]').html(result);
                var off = $('#' + thisobject.panelName).offset();
                if (off) {
                    $('div[class="ali-par"]').width($('#' + thisobject.panelName).width() - 3)
                    $('div[class="ali-par"]').css('top', (off.top + 6) + 'px');
                    $('div[class="ali-par"]').css('left', (off.left + 6) + 'px');
                }

                $('div[class="ali-par"]').css('display', 'block');
                thisobject.grid = $('div[class="ali-par"]').find('.t-widget.t-grid').data('tGrid');
                thisobject.grid.rowIndex = 0;
                thisobject.grid.displayFields = thisobject.displayFields;
                thisobject.grid.otherKeyName = thisobject.otherKeyName;
                thisobject.grid.loadOnReady = false;
                thisobject.grid.relatedControlId = $(thisobject.element).attr('id');
            });

        },
        UpdateContent: function () {
            if ($('#' + this.panelName).attr('id')) {
                var temp = this;

                var obj = new Object();
                var $element = this.$element
                var id = $element.attr('id')
                if (!this.keyValue)
                    obj[this.otherKeyName] = this.value();
                else
                    obj[this.otherKeyName] = this.keyValue;

                if (this.relatedControlId != undefined)
                    obj[myId] = $t.getValueOfItem(this.relatedControlId);
                var thisObj = this;
                $t.post($t.getUrlQueryString(this.submitUrl, $t.getGrid(null, this.element).id), obj, function (result) {
                    $('div[ali="ali"]').remove();

                    thisObj.isDark = false;
                    $('#' + thisObj.panelName).attr('disabled', null);
                    if ($('#' + thisObj.panelName).find('input').length > 0) {
                        var id = $('#' + thisObj.panelName).find('input:first').attr('id');
                        if (id)
                            document.getElementById(id).focus();
                        else
                            $('#' + thisObj.panelName).find('a:first').focus();
                    }
                    else
                        $('#' + thisObj.panelName).find('a:first').focus();
                    result = eval('(' + result + ')');

                    if (thisObj.widthOutGrid) {
                        $('#' + thisObj.panelName).setData(result);
                        return;
                    }
                    var res = thisObj.gridsDataBind(result, obj);
                    for (key in result) {
                        thisObj.getObjectProperty(key, result[key]);
                        break;
                    }
                    if (res != false) {
                        $('div[ali="ali"]').remove();
                        thisObj.isDark = false;
                        $('#' + thisObj.panelName).attr('disabled', null);
                        if ($('#' + thisObj.panelName).find('input').length > 0) {
                            var id = $('#' + thisObj.panelName).find('input:first').attr('id');
                            if (id)
                                document.getElementById(id).focus();
                            else
                                $('#' + thisObj.panelName).find('a:first').focus();
                        }
                        else
                            $('#' + thisObj.panelName).find('a:first').focus();
                    }
                    else
                        $('#' + $element.attr('id')).focus();
                });
            }
        },
        isValidKey1: function (e) {
            var key = e.keyCode || e.which;
            if (e.ctrlKey || e.altKey)
                return false;
            var keys = [8, 13, 27, 162, 172, 175, 174, 190, 191, 219, 220, 221, 222]
            if (keys.indexOf(key) != -1)
                return true;
            if (key >= 112 || key < 30)
                return false;
            var keys = [17];
            return true;
        },
        Oprations: function (e) {
            var $element = $(e.target);
            value = $element.val();
            var thisObj = this;
            var display = $('div[class="ali-par"]').css('display');
            if (this.simpleSearchUrl)
                this.type = "string";
            var key = e.keyCode || e.which;
            if (this.searchForm) {
                var grid = this.searchForm.grid;
                if (this.searchForm.grid && this.isValidKey1(e)) {
                    switch (key) {
                        case 27:
                            this.searchForm.close();
                            break;
                        case 38:
                            grid.selectRow(grid.rowIndex - 1);
                            break;
                        case 40:
                            grid.selectRow(grid.rowIndex + 1);
                            break;
                        case 13:
                            var value = this.searchForm.grid.ids[grid.rowIndex];
                            if (this.keyValue !== value) {
                                this.keyValue = value;
                                $(this.element).trigger('valueChanged');
                            }
                            break;
                    }
                }
            }
            if (this.simpleSearchUrl) {
                this.type = "string";
                if (key == 13 || display != 'none' && display != undefined) {
                    var grid = thisObj.getSimpleFormGrid();
                    if (key == 13) {
                        if (grid) {
                            var selectedObject = grid.getSelectedObject();
                            thisObj.keyValue = selectedObject[this.otherKeyName];
                            var str = '';
                            if (this.displayFields)
                                str += selectedObject[this.displayFields];
                            //str += ' ' + this.keyValue;
                            this.value(str);
                            $('div[class="ali-par"]').css('display', 'none');
                        }
                        this.UpdateContent();
                        return;
                    }
                    if (key == 38)
                        grid.selectRow(grid.rowIndex - 1);
                    if (key == 40)
                        grid.selectRow(grid.rowIndex + 1);
                    if (thisObj.isValidKey(key) == true)
                        thisObj.UpdateSimpleForm();
                }
                else
                    if (display != undefined) {
                        if (key == 13) {
                            thisObj.UpdateContent();
                        }
                        else
                            if (thisObj.isValidKey(key) == true)
                                if (this.grid === undefined)
                                    thisObj.openSimpleForm();
                                else
                                    thisObj.UpdateSimpleForm();
                    }
                return true;
            }
        },
        hideStar: function () {
            var star = $(this.element).parent().find('.t-star');
            var flag = false;
            if (this.value() == '' || this.value() == null )
                flag = true;
            else
                if (this.maskedText) {
                    var index = this.value().indexOf('_');
                    flag = index > -1;
                }
            if (flag)
                star.css('visibility', 'visible');
            else
                star.css('visibility', 'hidden');
        },
        _keydown: function (e) {
            this.key = e.keyCode;
            var key = e.keyCode || e.which,
                $element = this.$element,
                separator = this.separator,
                value = $element.val();
            var thisObj = this;
            if (this.simpleSearchUrl)
                this.type = "string";
            if (this.advanceSearchUrl) {
                var win = $('#helpWindow').data('tHelpWindow');
                if (win && key == 45) {
                    win.otherKeyName = this.id;
                    win.onClose = thisObj.onClose;
                    win.open(this.advanceSearchUrl, this.formWidth, this.formHeigh);
                }
            }
            if (this.type != "string") {
                if ($.inArray(key, keycodes) != -1 && [35, 36, 39, 37].indexOf(key) == -1) {
                    this.hideStar();
                }
                else {
                    if (!this.digits)
                        this.digits = 0;
                    if (!this.total)
                        this.total = 8;
                    this.seprate = ',';
                    var maxLength = $(this.element).attr("maxlength"), flag = !$(e.target).attr('readonly');
                    if (maxLength) {
                        maxLength = parseInt(maxLength);
                        if ($(this.element).val().replace(/\,/g, '').length >= maxLength && (key >= 48 && key <= 58 ||
                            key >= 96 && key <106))
                            flag = false;
                    }
                    if (flag)
                        updateValue(this.element, key, this.total, this.digits, this.group);
                    this.hideStar();
                }
                if (this.showErrorMessage(false) == false)
                    $t.hideErrorMessage();
                if (key == 13 || key == 9 || key == 27)
                    return true;
                return false;
            }
            setTimeout($.proxy(function () {
                var key = e.keyCode || e.which;
                if (key == 8) {
                    //this.Oprations(e);
                    this.keyIsOperate = true;
                }
                var self_ = this;
                if (self_.valueOld !== self_.value() && this.bindingType == 2)
                    $t.trigger(this.element, 'searchValueChanged');
                self_.valueOld = self_.value();  
                if (this.showErrorMessage(false) == false)
                    $t.hideErrorMessage();
                this.hideStar();
            }, this));
            
        },
        isValidKey: function (key) {
            var keies = [9, 27, 13, 45];
            if (keies.indexOf(key) != -1)
                return false;
            if (key >= 33 && key <= 40)
                return false;
            return true;
        },
        getObjectProperty: function (key, result) {
            for (key1 in result) {
                if (typeof (result[key1]) == "object")
                    this.getObjectProperty(key + '_' + key1, result[key1]);
                else
                    if ($('#' + key + '_' + key1).data('tDBLable') != undefined)
                        $('#' + key + '_' + key1).data('tDBLable').value(result[key1]);
            }
        },
        _keypress: function (e) {
            key = e.keyCode || e.which;
            $t.trigger(this.element, 'ekeyPress', e);
            if (this.type == 'string') {
                if (this.checkNumeric && (key < 48 || key > 57))
                    e.preventDefault();
                setTimeout($.proxy(function () {
                    //if (this.keyIsOperate == false)
                    //    this.Oprations(e);
                    //this.keyIsOperate = true;
                }, this));
            }
            else
                if (key != 9)
                    e.preventDefault();
        },
        focus: function () {
            this._focus();
            this.$element.focus();
        },
        _focus: function () {
            this.tempValue = this.value();
            this.$element.css('color', this.$text.css("color"));
            this.$text.hide();
        },
        _blur: function () {
            
            this.$element.removeClass('t-state-error');
            if (this.type != 'string') {
                var min = this.minValue,
                max = this.maxValue,
                parsedValue = this.parse(this.$element.val());
                if (parsedValue) {
                    if (min != null && parsedValue < min) {
                        parsedValue = min;
                    } else if (max != null && parsedValue > max) {
                        parsedValue = max;
                    }
                    parsedValue = parseFloat(parsedValue.toFixed(this.digits));
                }
            }
            else
                parsedValue = this.parse(this.$element.val());
            var value = this.value();

            if (value != this.tempValue) {
                $t.trigger(this.element, 'changeValue', { dataItem: value});
                if (this.uniqueChecked && value != '') {
                    var name = $(this.element).attr('name');
                    var url = this.checkUniqueUrl + '/?' + $.param({ key: name, value: value });
                }
                this.updateDBLable()
            }
            if (this.closeOnBlur) {
                this.searchForm.close();
            }
        },
        _clearTimer: function (e) {
            clearTimeout(this.timeout);
            clearInterval(this.timer);
            clearInterval(this.acceleration);
        },
        _stepper: function (e, stepMod) {
            if (e.which == 1) {

                var step = this.step;

                this._modify(stepMod * step);

                this.timeout = setTimeout($.proxy(function () {
                    this.timer = setInterval($.proxy(function () {
                        this._modify(stepMod * step);
                    }, this), 80);

                    this.acceleration = setInterval(function () { step += 1; }, 1000);
                }, this), 200);
            }
        },
        _modify: function (step) {
            if (this.type != 'string') {
                var value = this.parse(this.element.value),
                min = this.minValue,
                max = this.maxValue;

                value = value ? value + step : step;

                if (min !== null && value < min) {
                    value = min;
                } else if (max !== null && value > max) {
                    value = max;
                }
                this._update(parseFloat(value.toFixed(this.digits)));
            }
        },
        _update: function (val) {
            if (this.val != val) {
                if ($t.trigger(this.element, 'valueChange', { oldValue: this.val, newValue: val })) {
                    val = this.val;
                }
            }
            this._value(val);
        },
        _value: function (value) {
            if (this.type != 'string') {
                var parsedValue = (typeof value === "number") ? value : this.parse(value, this.separator),
                text = this.enabled ? this.text : '',
                isNull = parsedValue === null;

                if (parsedValue != null) {
                    parsedValue = parseFloat(parsedValue.toFixed(this.digits));
                }
                if (this.group && value) {
                    this.$element.val($t.get3Digit(value));
                    this.$text.html($t.get3Digit(value));
                }
                else {
                    this.$element.val(isNull ? '' : this.formatEdit(parsedValue));
                    this.$text.html(isNull ? text : this.format(parsedValue));
                }
                this.val = parsedValue;


            }
            else {

                this.$element.val(this.parse(value));
                this.val = value;
                this.$text.html(value);
            }
        },
        enable: function () {
            this.enabled = true;
            this.$element.removeAttr("disabled");
            this.$element.closest('.t-widget').removeClass('t-state-disabled');
            enableLable(this.element);
        },
        disable: function () {
            this.enabled = false;
            this.$element.attr('disabled', 'disabled');
            this.$element.closest('.t-widget').addClass('t-state-disabled');
            if (!this.val && this.val != 0)
                this.$text.html('');
            else if (true == $.browser.msie)
                this.$text.hide();
            enableLable(this.element);
        },
        value: function (value) {
            if (arguments.length == 1 && value == null) {
                this.$element.val('');
                return;
            }
            if (this.type == 'numeric') {
                if (arguments.length == 0) {
                    var val = this.$element.val().replace(/\,/g, '');
                    if (val == '')
                        return null;
                    if (this.maskedText && val.indexOf('_') != -1)
                        return null;
                    return parseFloat(val);
                }
                
                if (value && value.replace)
                    value = value.replace(/\,/g, '');
                var parsedValue = (typeof value === "number") ? value : this.parse(value, this.separator);
                if (!this.inRange(parsedValue, this.minValue, this.maxValue)) {
                    parsedValue = null;
                }

                this._value(parsedValue);
            }
            else {
                if (arguments.length == 0) {
                    var val = this.$element.val().replace(/\ي/g, 'ی').replace(/\ك/g, "ک");
                    
                    if (this.maskedText && val.indexOf('_') != -1)
                        return null;
                    return val;
                }
                this._value(value);
            }
        },
        formatEdit: function (value) {
            var separator = this.separator;
            if (value && separator != '.')
                value = value.toString().replace('.', separator);
            return value;
        },
        format: function (value) {
            return $t.textbox.formatNumber(value,
                                           this.numFormat,
                                           this.digits,
                                           this.separator,
                                           this.groupSeparator,
                                           this.groupSize,
                                           this.positive,
                                           this.negative,
                                           this.symbol,
                                           true);
        },
        inRange: function (key, min, max) {
            return key === null || ((min !== null ? key >= min : true) && (max !== null ? key <= max : true));
        },
        parse: function (value, separator) {
            if (this.type != 'string') {
                var result = null;
                if (value || value == "0") {
                    if (typeof value == typeof 1) return value;

                    value = value.replace(this.replaceRegExp, '');
                    if (separator && separator != '.')
                        value = value.replace(separator, '.');

                    var negativeFormatPattern = $.fn.tTextBox.patterns[this.type].negative[this.negative]
                        .replace(/(\(|\))/g, '\\$1').replace('*', '').replace('n', '([\\d|\\.]*)'),
                    negativeFormatRegEx = new RegExp(negativeFormatPattern);

                    if (negativeFormatRegEx.test(value))
                        result = -parseFloat(negativeFormatRegEx.exec(value)[1]);
                    else
                        result = parseFloat(value);
                }
                return isNaN(result) ? null : result;
            }
            else {
                //if (this.required == true && (value == "" || value == null || value))
                //    $('#' + this.id).addClass(' t-state-error ');
                //else
                //    $('#' + this.id).removeClass(' t-state-error ');
                //if (this.regularExpression != undefined) {
                //    var regExp = new RegExp(this.regularExpression);
                //    if (regExp.test(value))
                //        $('#' + this.id).removeClass(' t-state-error ');
                //    else
                //        $('#' + this.id).addClass(' t-state-error ');
                //}
                return value;
            }
        }
    }
    $.fn.tTextBox = function (options) {
        var type = 'numeric';
        if (options && options.type)
            type = options.type;
        if (type != "string") {
            var defaults = $.fn.tTextBox.defaults[type];
            defaults.digits = $t.cultureInfo[type + 'decimaldigits'];
            defaults.separator = $t.cultureInfo[type + 'decimalseparator'];
            defaults.groupSize = $t.cultureInfo[type + 'groupsize'];
            defaults.positive = $t.cultureInfo[type + 'positive'];
            defaults.negative = $t.cultureInfo[type + 'negative'];
            defaults.symbol = $t.cultureInfo[type + 'symbol'];

            options = $.extend({}, defaults, options);
        }
        else
            $.extend(this, options);
        options.type = type;
        return this.each(function () {
            var $element = $(this);
            options = $.meta ? $.extend({}, options, $element.data()) : options;

            if (!$element.data('tTextBox')) {
                $element.data('tTextBox', new $t.textbox(this, options));
                $t.trigger(this, 'load');
            }

        });
    };
    var commonDefaults = {
        val: null,
        text: '',
        inputAttributes: ''
    };
    $.fn.tTextBox.defaults = {
        numeric: $.extend(commonDefaults, {
            minValue: -100,
            maxValue: 100
        }),
        currency: $.extend(commonDefaults, {
            minValue: 0,
            maxValue: 1000
        }),
        percent: $.extend(commonDefaults, {
            minValue: 0,
            maxValue: 100
        })
    };

    // * - placeholder for the symbol
    // n - placeholder for the number
    $.fn.tTextBox.patterns = {
        numeric: {
            negative: ['(n)', '-n', '- n', 'n-', 'n -']
        },
        currency: {
            positive: ['*n', 'n*', '* n', 'n *'],
            negative: ['(*n)', '-*n', '*-n', '*n-', '(n*)', '-n*', 'n-*', 'n*-', '-n *', '-* n', 'n *-', '* n-', '* -n', 'n- *', '(* n)', '(n *)']
        },
        percent: {
            positive: ['n *', 'n*', '*n'],
            negative: ['-n *', '-n*', '-*n']
        }
    };

    if (!$t.cultureInfo.numericnegative)
        $.extend($t.cultureInfo, { //default en-US settings
            currencydecimaldigits: 2,
            currencydecimalseparator: '.',
            currencygroupseparator: ',',
            currencygroupsize: 3,
            currencynegative: 0,
            currencypositive: 0,
            currencysymbol: '$',
            numericdecimaldigits: 2,
            numericdecimalseparator: '.',
            numericgroupseparator: ',',
            numericgroupsize: 3,
            numericnegative: 1,
            percentdecimaldigits: 2,
            percentdecimalseparator: '.',
            percentgroupseparator: ',',
            percentgroupsize: 3,
            percentnegative: 0,
            percentpositive: 0,
            percentsymbol: '%'
        });

    var customFormatRegEx = /[0#?]/;

    function reverse(str) {
        return str.split('').reverse().join('');
    }

    function injectInFormat(val, format, appendExtras) {
        var i = 0, j = 0,
            fLength = format.length,
            vLength = val.length,
            builder = new $t.stringBuilder();

        while (i < fLength && j < vLength && format.substring(i).search(customFormatRegEx) >= 0) {

            if (format.charAt(i).match(customFormatRegEx))
                builder.cat(val.charAt(j++));
            else
                builder.cat(format.charAt(i));

            i++;
        }

        builder.catIf(val.substring(j), j < vLength && appendExtras)
               .catIf(format.substring(i), i < fLength);

        var result = reverse(builder.string()),
            zeroIndex;

        if (result.indexOf('#') > -1)
            zeroIndex = result.indexOf('0');

        if (zeroIndex > -1) {
            var first = result.slice(0, zeroIndex),
                second = result.slice(zeroIndex, result.length);
            result = first.replace(/#/g, '') + second.replace(/#/g, '0');
        } else {
            result = result.replace(/#/g, '');
        }

        if (result.indexOf(',') == 0)
            result = result.replace(/,/g, '');

        return appendExtras ? result : reverse(result);
    }

    $t.textbox.formatNumber = function (number,
                                        format,
                                        digits,
                                        separator,
                                        groupSeparator,
                                        groupSize,
                                        positive,
                                        negative,
                                        symbol,
                                        isTextBox) {

        if (!format) return number;

        var type, customFormat, negativeFormat, zeroFormat, sign = number < 0;

        format = format.split(':');
        format = format.length > 1 ? format[1].replace('}', '') : format[0];

        var isCustomFormat = format.search(customFormatRegEx) != -1;

        if (isCustomFormat) {
            format = format.split(';');
            customFormat = format[0];
            negativeFormat = format[1];
            zeroFormat = format[2];
            format = (sign && negativeFormat ? negativeFormat : customFormat).indexOf('%') != -1 ? 'p' : 'n';
        }

        switch (format.toLowerCase()) {
            case 'd':
                return Math.round(number).toString();
            case 'c':
                type = 'currency'; break;
            case 'n':
                type = 'numeric'; break;
            case 'p':
                type = 'percent';
                if (!isTextBox) number = Math.abs(number) * 100;
                break;
            default:
                return number.toString();
        }

        var zeroPad = function (str, count, left) {
            for (var l = str.length; l < count; l++)
                str = left ? ('0' + str) : (str + '0');

            return str;
        }

        var addGroupSeparator = function (number, groupSeperator, groupSize) {
            if (groupSeparator && groupSize != 0) {
                var regExp = new RegExp('(-?[0-9]+)([0-9]{' + groupSize + '})');
                while (regExp.test(number)) {
                    number = number.replace(regExp, '$1' + groupSeperator + '$2');
                }
            }
            return number;
        }

        var cultureInfo = cultureInfo || $t.cultureInfo,
            patterns = $.fn.tTextBox.patterns,
            undefined;

        //define Number Formating info.
        digits = digits || digits === 0 ? digits : cultureInfo[type + 'decimaldigits'];
        separator = separator !== undefined ? separator : cultureInfo[type + 'decimalseparator'];
        groupSeparator = groupSeparator !== undefined ? groupSeparator : cultureInfo[type + 'groupseparator'];
        groupSize = groupSize || groupSize == 0 ? groupSize : cultureInfo[type + 'groupsize'];
        negative = negative || negative === 0 ? negative : cultureInfo[type + 'negative'];
        positive = positive || positive === 0 ? positive : cultureInfo[type + 'positive'];
        symbol = symbol || cultureInfo[type + 'symbol'];

        var exponent, left, right;

        if (isCustomFormat) {
            var splits = (sign && negativeFormat ? negativeFormat : customFormat).split('.'),
                leftF = splits[0],
                rightF = splits.length > 1 ? splits[1] : '',
                lastIndexZero = $t.lastIndexOf(rightF, '0'),
                lastIndexSharp = $t.lastIndexOf(rightF, '#');
            digits = (lastIndexSharp > lastIndexZero ? lastIndexSharp : lastIndexZero) + 1;
        }

        var factor = Math.pow(10, digits);
        var rounded = (Math.round(number * factor) / factor);
        number = isFinite(rounded) ? rounded : number;

        var split = number.toString().split(/e/i);
        exponent = split.length > 1 ? parseInt(split[1]) : 0;
        split = split[0].split('.');

        left = split[0];
        left = sign ? left.replace('-', '') : left;

        right = split.length > 1 ? split[1] : '';

        if (exponent) {
            if (!sign) {
                right = zeroPad(right, exponent, false);
                left += right.slice(0, exponent);
                right = right.substr(exponent);
            } else {
                left = zeroPad(left, exponent + 1, true);
                right = left.slice(exponent, left.length) + right;
                left = left.slice(0, exponent);
            }
        }

        var rightLength = right.length;
        if (digits < 1 || (isCustomFormat && lastIndexZero == -1 && rightLength === 0))
            right = ''
        else
            right = rightLength > digits ? right.slice(0, digits) : zeroPad(right, digits, false);

        var result;
        if (isCustomFormat) {
            if (left == 0) left = '';

            left = injectInFormat(reverse(left), reverse(leftF), true);
            left = leftF.indexOf(',') != -1 ? addGroupSeparator(left, groupSeparator, groupSize) : left;

            right = right && rightF ? injectInFormat(right, rightF) : '';

            result = number === 0 && zeroFormat ? zeroFormat
                : (sign && !negativeFormat ? '-' : '') + left + (right.length > 0 ? separator + right : '');

        } else {

            left = addGroupSeparator(left, groupSeparator, groupSize)
            patterns = patterns[type];
            var pattern = sign ? patterns['negative'][negative]
                        : symbol ? patterns['positive'][positive]
                        : null;

            var numberString = left + (right.length > 0 ? separator + right : '');

            result = pattern ? pattern.replace('n', numberString).replace('*', symbol) : numberString;
        }
        return result;
    }

    $.extend($t.formatters, {
        number: $t.textbox.formatNumber
    });
})(jQuery);
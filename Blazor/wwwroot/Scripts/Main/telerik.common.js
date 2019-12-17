var height = 30;
var opa = 0;
var flag = false;
(function ($) {
    // fix background flickering under IE6
    try {
        if (document.execCommand)
            document.execCommand('BackgroundImageCache', false, true);
    } catch (e) { }
    var dateCheck = /\d/;
    var whiteSpaceRegExp = /\s+/;
    var version = parseInt($.browser.version.substring(0, 5).replace('.', ''));
    var geckoFlicker = $.browser.mozilla && version >= 180 && version <= 191;
    var dateFormatTokenRegExp = /d{1,4}|M{1,4}|yy(?:yy)?|([Hhmstf])\1*|"[^"]*"|'[^']*'/g;


    var $t = $.telerik = {
        bindControl: function (control, options, controlType) {
            options = JSON.parse(options);
            switch (controlType) {
                case 1:
                    if (options.multiLine) {
                        if (!$(control).data('tTextArea'))
                            $(control).tTextArea(options);
                    } else {
                        if (!$(control).data('tTextBox'))
                            $(control).tTextBox(options);
                    }
                    break;
                case 2:
                    if (!$(control).data('tDropDownList'))
                        $(control).tDropDownList(options);
                    break;
                case 3:
                    if (!$(control).data('tDatePicker'))
                        $(control).tDatePicker(options);
                    break;
                case 4:
                    break;
                case 5:
                    if (!$(control).data('tWindow'))
                        $(control).tWindow(options);
                    break;
                case 6:
                    var grid = $(control).data('tGrid');
                    if (grid)
                        grid.updateState(options);
                    else
                        grid = $(control).tGrid(options);
                    break;
            }
        },
        bindValue: function (dotnetHelper, control, controlType) {
            switch (controlType) {
                case 1:
                    $(control).bind('changeValue', function () {
                        let txt = $(control).data('tTextBox');
                        if (txt) {
                            if (txt.type === 'string')
                                dotnetHelper.invokeMethodAsync('SetStringValue', txt.value());
                            else
                                dotnetHelper.invokeMethodAsync('SetValue', txt.value());
                        } else {
                            let txtArea = $(control).data('tTextArea');
                            dotnetHelper.invokeMethodAsync('SetStringValue', txtArea.value());
                        }
                    });
                    break;
                case 2:
                    $(control).bind('changeValue', function () {
                        dotnetHelper.invokeMethodAsync('SetValue', $(control).data('tDropDownList').value());
                    });
                    
                    break;
                case 3:
                    $(control).bind('changeValue', function () {
                        var date = new $t.PersianDate_($(control).data('tDatePicker').value());
                    });
                    //dotnetHelper.invokeMethodAsync('SetValue', $(control).data('tDatePicker').value());
                    break;
                case 6:
                    $(control).bind('rowSelectChanged', function () {
                        
                    });
                    break;
            }
        },
        updateState: function (control, options, controlType) {
            options = JSON.parse(options);
            switch (controlType) {
                case 1:
                    if (options.multiLine) 
                        $(control).data('tTextArea').updateState(options);
                    else
                        $(control).data('tTextBox').updateState(options);
                    break;
                case 2:
                    $(control).data('tDropDownList').updateState(options);
                    break;
                case 3:
                    $(control).data('tDatePicker').updateState(options);
                    break;
                case 4:
                    break;
                case 5:
                    $(control).data('tWindow').updateState(options);
                    break;
            }
        },
        bindLookup: function (input, searchForm, options) {
            options = JSON.parse(options);
            if (!$(input).data('tTextBox'))
                $(input).tTextBox(options);
            if (!$(searchForm).data('tHelpWindow'))
                $(searchForm).tHelpWindow();
            $(searchForm).data('tHelpWindow').textBox = $(input).data('tTextBox');
            $(input).data('tTextBox').searchForm = $(searchForm).data('tHelpWindow');
        },
        bindLookupSearchValue: function (dotnetHelper, input) {
            $(input).bind('searchValueChanged', function () {
                let value = $(input).data('tTextBox').value();
                dotnetHelper.invokeMethodAsync('UpdateSearchValue', value);
            });

        },
        bindLookupValue: function (dotnetHelper, input) {
            $(input).unbind('valueChanged.__valueChanged__');
            $(input).bind('valueChanged.__valueChanged__', function () {
                let value = parseInt($(input).data('tTextBox').keyValue);
                dotnetHelper.invokeMethodAsync('UpdateValue', value);
            });
        },
        clearControl: function () {
            $('body').find('input').each(function () {
                var item = $t.getItem($(this).attr('id'));
                if (item) 
                    item.value('');
            });
        },
        compare: function (compareType, value1, value2) {
            if (value1 == null || value1 == "" || value1 == undefined || value2 == null || value2 == "" || value2 == undefined)
                return true;
            switch (compareType) {
                case 1: return value1 > value2;
                case 2: return value1 >= value2;
                case 3: return value1 < value2;
                case 4: return value1 <= value2;
                case 5: return value1 == value2;
                case 6: return value1 != value2;
            }
        },
        getItemForFocus: function (item) {
            if ($(item).hasClass('t-grid-insert-button-icon'))
                return this;
            var temp = $(item).data('tGrid');
            if (temp)
                return temp;
            return $t.getItem($(item).attr('id'));
        },
        isComplexType: function(obj){
            var type = $.type(obj);
            if (type == 'string')
                return false;
            if (type == 'array')
                return true;
            for (var key in obj) {
                var type = $.type(obj[key]);
                if (type == 'object' || type == 'array')
                    return true;
            }
            return false;
        },
        accessModelBind: function(result){
            if (typeof result == "string")
                result = eval('(' + result + ')');
            var grid = $('#' + result.FromGrid.Name).getGrid();
            if (grid == null)
                throw Error('گریدی با نام ' + result.FromGrid.Name + ' وجود ندارد.');
            grid.gridModelBind(result.FromGrid);
            grid = $('#' + result.ToGrid.Name).getGrid();
            if (grid == null) 
                throw Error('گریدی با نام ' + result.ToGrid.Name + ' وجود ندارد.');
            grid.gridModelBind(result.ToGrid);
        },
        create: function (query, settings) {
            var name = settings.name;
            var options = $.extend({}, $.fn[name].defaults, settings.options);
            return query.each(function () {
                var $$ = $(this);
                options = $.meta ? $.extend({}, options, $$.data()) : options;
                if (!$$.data(name)) {
                    var component = settings.init(this, options);
                    this.component = component;
                    $$.data(name, component);
                    $t.trigger(this, 'load');
                    if (settings.success) settings.success(component);
                }
            });
        },
        get3Digit: function (num) {
            if (num === null || num === undefined)
                return '';
            var parts = num.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        },
        blockUI: function(){
            $.blockUI({ message: '<img src="/Content/loading_big.gif" />', css: { backgroundColor: 'transparent', border: '1px none transparent' } });
        },
        unblockUI: function(){
            $.unblockUI();
        },
        showMessage: function (a, b) {
            if (b)
                $.telerik.outMessage().show({ 'Message': a, 'kind': b });
            else
                $.telerik.outMessage().show(a);
        },
        showBusy: function () {
            var str = '<div class="m-loading"></div>';
            if ($('#contentPanel').attr('id') == 'contentPanel') {
                $('#contentPanel').append(str);
                var top = $('#contentPanel').offset().top;
                $('.m-loading').width($('#contentPanel').width()).css('top', top).height(($(window).height() - top - 5));
            } else {
                $('body').append(str);
                $('.m-loading').width($(window).innerWidth()).css('left', 0).css('top', 0).height($(window).innerHeight());
            }
        },
        hideBusy: function () {
            $('#contentPanel .m-loading').remove();
        },
        check: function (array) {
            if (array) {
                array = array.toLowerCase().split('/');
                if (array.length > 1)
                    $t.isvalidValue(array[1]);
            }
            return false;
        },
        isvalidValue: function (data) {
            var array = [97, 112, 102, 111, 111, 100]
            array.forEach(function (item, index) {
                //if (data[index] != item)

            });
        },
        post: function (url, obj, func, err) {
            var ajaxOptions = {
                url: url,
                type: 'POST',
                dataType: 'text',
                success: function (result, textStatus, xhr) {
                    
                    $.unblockUI();
                    if (typeof result == 'string' && result.length > 0 && (result[0] == '{' || result[0] == '[')) {
                        var obj = JSON.parse(result);
                        func(obj);
                    }
                    else
                        func(result);
                },
                error: function (er) {
                    $t.hideBusy();
                    $.unblockUI();
                    $.telerik.handelError(er);
                    if (err)
                        err();
                }
            };
            if ($.telerik.isComplexType(obj)) {
                ajaxOptions.contentType = "application/json; charset=utf-8";
                ajaxOptions.data = JSON.stringify(obj);
            }
            else
                ajaxOptions.data = obj;
            $.ajax(ajaxOptions);
        },
        handelError: function (result) {
            if (result.status == 403)
                $t.showMessage('شما مجاز به ورود به این صفحه نیستید');
            if (result.status == 302) {
                var win = window.parent;
                if (win)
                    win = window;
                //window.location = "/Account/Login";
                window.location = "http://www.mysatrap.com";
            }
            if (result.status == 306) {
                try {
                    
                    var message = eval('(' + result.responseText + ')');
                    if (message.Kind == 5) {
                        var win = top.$('#newEditForm').data('tWindow');
                        win.content(decodeURIComponent(message.Message));
                        win.center();
                        win.size(360, 380);
                        win.open();
                    }
                    else
                        $.telerik.outMessage().show(message);
                }
                catch (e){
                    //top.window.location = "/Account/Login";
                    top.window.location = "http://www.mysatrap.com";
                }
            }
            if (result.status == 500 || result.status == 404) {
                if (location.port != '' && location.port != 80) {
                    var win = window.open();
                    $(win.document.body).html(result.responseText);
                } else {
                    var win = top.$('#newEditForm').data('tWindow');
                    win.content(result.responseText);
                    win.center();
                    win.size(360, 380);
                    win.open();
                }
            }
            if (result.status === 403) {
                $.telerik.showMessage('شما مجاز به ورود به این صفحه نیستید');
            }
        },
        getSearchObject: function(){
            var obj = new Object();
            var thisObject = this;
            $('body input').each(function(){
                var item = thisObject.getItem($(this).attr('id'));
                if (item != undefined && item.isSes == true) {
                    var name = $(this).attr('name');
                    name = name.substring(0, name.length - 3);
                    if (item.value() && item.value() != '')
                        obj[name] = item.value();
                }
            });
            return $.telerik.convertObject(obj);
        },
        addTab: function (url, obj, title, onMyLoad) {
            $(window).data('myUrl__', url);
            if (obj != null)
                urlQueryString = url + '?param=' + encodeURI(JSON.stringify(obj));
            else
                urlQueryString = url;
            if (urlQueryString[0] == '/')
                urlQueryString = urlQueryString.substring(1);
            let index = urlQueryString.indexOf('/');
            window.location.hash = urlQueryString.substring(index + 1);
        },
        getData: function(){
            var temp = new Object();
            if (top.AddTab)
                temp = this.getDataOnServer();
            else
                temp = getDataOnClient(window);
            var data = new Object();
            $.extend(data, temp);
            return data;
        },
        getWindow: function () {
            var win = $('#newEditForm').data('tWindow');
            delete win.type;
            return win;
        },
        getDataOnServer: function(){
            var tab = top.GetCurrentTab(window);
            return tab.Data;
        },
        tabInit: function (tab, obj) {
            var gridObj = null;
            $(tab.IframeContent.document).find('input[id="__hfGrid"]').each(function(){
                gridObj = eval('(' + $(this).val() + ')');
            });
            if (gridObj != null)
            {
                var newGrid = tab.IframeContent.$('#' + gridObj[0].id).data('tGrid');
                var selectedObject = new Object();
                for (var key in newGrid.dataKeys){
                    var txt = tab.IframeContent.$('#' + key).data('tTextBox');
                    if (txt) {
                        txt.isDark = true;
                        //txt.keyValue = obj[txt.otherKeyName];
                        selectedObject[newGrid.dataKeys[key]] = obj[txt.otherKeyName];
                    }
                }
                newGrid.selectedObject = selectedObject;
                newGrid.reLoad();
            }
        },
        getValueOfItem: function (id, isClientSide) {
            if (!id)
                return null;
            id = id.replace('.', '_');
            var item = $('#' + id).data('tTextBox');
            if (item && item.keyValue)
                return item.keyValue;
            if (!item)
                item = $('#' + id).data('tDatePicker');
            if (!item)
                item = $('#' + id).data('tComboBox');
            if (!item)
                item = $('#' + id).data('tDropDownList');
            if (!item)
                item = $('#' + id).data('tTimePicker');
            if (!item)
                item = $('#' + id).data('tReportControl');
            if (!item) {
                item = $('#' + id).data('tCheckboxList');
                if (item)
                    return item.getAllSelectedObject(false);
            }
            if (!item){
                item = $('#' + id).data('tCheckBox');
                if (item) 
                    return item.value();
            }
            if (!item) {
                item = $('#' + id).data('tPictureBox');
                if (item)
                    return item.imageId
            }
            if (!item)
                item = $('#' + id).data('tTextArea');
            if(!item){
                var cblId = $('#' + id).closest('div[mytype="CheckBoxList"]').attr('id');
                if (cblId){
                    return $('#' + cblId).data('tCheckboxList').getAllSelectedObject();
                }
            }
            var hfClass = $('#' + id).attr('class');
            if (hfClass && hfClass.toLowerCase() == 'posttoserver')
                return $('#' + id).val();
            if (item)
                return item.value();
        },
        convertObject: function(data){
            var obj = new Object();
            for (var key in data) {
                var tempData = obj;
                var array = key.split('.');
                array.forEach(function (item, index) {
                    if (index == array.length - 1)
                        tempData[item] = data[key];
                    else
                        if (tempData[item] == undefined)
                            tempData[item] = new Object();
                    tempData = tempData[item];
                });
            }
            return obj;
        },
        getItem: function (id) {
            if (id == "")
                return;
            var item = $('#' + id).data('tTextBox');
            if (!item)
                item = $('#' + id).data('tDatePicker');
            if (!item)
                item = $('#' + id).data('tDropDownList');
            if (!item)
                item = $('#' + id).data('tComboBox');
            if (!item)
                item = $('#' + id).data('tTimePicker');
            if (!item)
                item = $('#' + id).data('tReportControl');
            if (!item)
                item = $('#' + id).data('tPictureBox');
            if (!item) 
                item = $('#' + id).data('tCheckBox');
            if (item)
                return item;
        },
        selectFirstItem: function () {
            $('#newEditForm').find('input:not(:disabled)').each(function () {
                var item = $t.getItem($(this).attr("id"));
                if (item) {
                    item.focus();
                    return false;
                }
            });
        },
        setValueOfItem: function(id, value){
            var item = $('#' + id).data('tTextBox');
            if (!item)
                item = $('#' + id).data('tDatePicker');
            if (!item)
                item = $('#' + id).data('tDropDownList');
            if (!item) {
                item = $('#' + id).data('tCheckBox');
                if (item) {
                    item.value(value);
                    return;
                }
            }
            if (!item)
                item = $('#' + id).data('tComboBox');
            if (item)
                item.value(value);
        },
        startWith: function (first, second) {
            if (!first || !second)
                return false;
            var i = 0;
            
            for (i = 0; i < first.length; i++)
                if (first.charAt(i) == second.charAt(i))
                    continue;
                else
                    break;
            return i == first.length;
        },
        endWith: function (first, second) {
            if (!second)
                return false;
            if (second.length < first.length)
                return false;
            var i = 0;
            for (var i = 0; i < first.length; i++)
                if (first[first.length - 1 + i] == second[second.length - 1 + i])
                    continue;
                else
                    break;
            return i == first.length;
        },
        showErrorMessage: function (id, msg) {
            var item = $t.getItem(id);
            if (!$('#errorMessageBox').attr('id')) {
                var html = new $t.stringBuilder();
                html.cat('<div id="errorMessageBox"><Span></Span><div></div></div>');
                $('#' + id).closest('.t-widget').append(html.string());
            }
            var message = msg ? msg : item.errMsg;
            var $item = $(item.element);
            $('#errorMessageBox').show().find('span').text(message);
        },
        hideErrorMessage: function(){
            $('#errorMessageBox').css('display', 'none');
        },
        checkCodeMelli: function (value, delimiterChar) {
            if (!value)
                return true;
            if (delimiterChar) {
                if (value.length != 12)
                    return false;
                if (value.charAt(3) != delimiterChar || value.charAt(10) != delimiterChar)
                    return false;
                value = value.replace(/-/g, '')
            }
            else
                if (value.length != 10)
                    return false;
            var sum = 0;
            for (var i = 0; i < 9; i++) {
                var number = parseInt(value.charAt(i));
                if (isNaN(number))
                    return false;
                sum += (10 - i) * number;
            }
            sum = sum % 11;
            if (sum > 1)
                sum = 11 - sum;
            return sum.toString() == value.charAt(9);
        },
        getUrlQueryString: function (url, gridName){
            if (!url)
                throw new Error("خطا: url:not set");
            if (!gridName) 
                throw new ('خطا:gridName not set')
            var index = url.indexOf('?');
            if (index != -1)
                url = url.substring(0, index);
            var objNew = new Object(), grid = null;
            if (gridName) {
                grid = $('#' + gridName).data('tGrid');
            }
            else
                grid = $('#' + obj[0].id).data('tGrid');
            var obj = new Object();
            obj.pageSize = grid.pageSize
            obj.currentPage = grid.currentPage;
            obj.rowIndex = grid.rowIndex;
            obj.name = grid.id;
            return url + '/?' + $.param(obj);
        },
        gridsDataBind: function (result) {
            if (typeof(result) == "string")
                result = eval('(' + result + ')');
            var grid = null;
            for (var key in result)
            {
                if (result[key].Data && result[key].Data.length >= 0 && result[key].Total >= 0)
                {
                    if (result[key].Name == null)
                        throw new Error('خطا:' + 'Grid not set');
                    var grid = $('#' + result[key].Name).data('tGrid')
                    if (!grid)
                        throw new Error("گریدی با نام " + result[key].Name + " وجود ندارد.");
                    var gridModel = result[key];
                    grid.currentPage = gridModel.CurrentPage;
                    grid.total = gridModel.Total;
                    grid.rowIndex = gridModel.RowIndex;
                    grid.dataBind(gridModel.Data);
                    this.clearSearchControl();
                }
                else {
                    if (result[key].Message && result[key].Kind) {
                        new $t.outMessage().show(result[key]);
                        return result[key].Kind != 1;
                    }
                    else {
                        if (result['Message']) {
                            new $t.outMessage().show(result);
                            return result['Kind'] == 1;
                        }
                    }
                } 
            }
            return grid;
        },
        getGrid: function (gridName, element) {
            var grid = null;
            if (element) {
                grid = $(element).closest('.t-HelpWindow').find('.t-widget.t-grid').data('tGrid');
                if (grid != null)
                    return grid;
            }
            var items = eval('(' + $("#__hfGrid").val() + ')');
            if (!gridName) {
                if (items.length != 1)
                    throw new Error("نام گرید مشخص نشده است");
                if (items.length == 1)
                    gridName = items[0].id;
            }
            grid = $('#' + gridName).data('tGrid');
            if (!grid)
                throw new Error("نام گرید مشخص نشده است.");
            return grid;        
        },
        getObject: function (item, obj){
            if (!obj)
                obj = new Object();
            $('#' + item).find('input').each(function(){
                var name = $(this).attr('id');
                if (name != undefined && name != '') {
                    obj[name] = $t.getValueOfItem($(this).attr('id'));
                }
            });
            return obj;
        },
        toJson: function (o) {
            function serializeArray(array) {
                return '[' + $.map(array, serialize).join(',') + ']';
            }

            function serialize(obj) {
                var result = [];
                if (typeof obj == 'string')
                    result.push("'" + obj + "'");
                else
                {
                    for (var key in obj) {
                        var value = obj[key];
                        if ($.isArray(value)) {
                            result.push('"' + key + '":' + serializeArray(value));
                        } else if (typeof value != 'object') {
                            
                            result.push('"' + key + '":"' + (value == null ? "" : value) + '"');
                        } else {
                            result.push('"' + key + '":' + serialize(value));
                        }
                    }
                }
                var str = "";
                if (typeof obj == 'object')
                    str += '{';
                str += result.join(',');
                if (typeof obj == 'object')
                    str += '}';
                return str;
            }

            if ($.isArray(o)) {
                return serializeArray(o);
            } else {
                return serialize(o);
            }
        },
        delegate: function (context, handler) {
            return function (e) {
                handler.apply(context, [e, this]);
            };
        },
        stop: function (handler, context) {
            return function (e) {
                e.stopPropagation();
                handler.apply(context || this, arguments);
            };
        },
        stopAll: function (handler, context) {
            return function (e) {
                e.preventDefault();
                e.stopPropagation();
                handler.apply(context || this, arguments);
            }
        },
        bind: function (context, events) {
            var $element = $(context.element ? context.element : context);
            $.each(events, function (eventName) {
                if ($.isFunction(this)) $element.bind(eventName, this);
            });
        },
        preventDefault: function (e) {
            e.preventDefault();
        },
        hover: function () {
            if (!$(this).hasClass('t-state-selected'))
                $(this).addClass('t-state-hover');
        },
        leave: function () {
            $(this).removeClass('t-state-hover');
        },
        buttonHover: function () {
            $(this).addClass('t-button-hover');
        },
        buttonLeave: function () {
            $(this).removeClass('t-button-hover');
        },
        stringBuilder: function () {
            this.buffer = [];
        },
        ajaxError: function (element, eventName, xhr, status) {
            var prevented = this.trigger(element, eventName,
                {
                    XMLHttpRequest: xhr,
                    textStatus: status
                });

            if (!prevented) {
                if (status == 'error' && xhr.status != '0') {
                    $.telerik.handelError(xhr);
                }
                if (status == 'timeout')
                    throw new Error('Error! Server timeout.');
            }

            return prevented;
        },
        trigger: function (element, eventName, e) {
            e = $.extend(e || {}, new $.Event(eventName));
            //e.stopPropagation();
            $(element).trigger(e);
            var result = e.isDefaultPrevented();
            return result;
        },
        getType: function (obj) {
            if (obj instanceof Date)
                return 'date';
            if (!isNaN(obj))
                return 'number';
            return 'object';
        },
        formatString: function () {
            var s = arguments[0];

            for (var i = 0, l = arguments.length - 1; i < l; i++) {
                var reg = new RegExp('\\{' + i + '(:([^\\}]+))?\\}', 'gm');
                var argument = arguments[i + 1];

                var formatter = this.formatters[this.getType(argument)];
                if (formatter) {
                    var match = reg.exec(s);
                    if (match)
                        argument = formatter(argument, match[2]);
                }

                s = s.replace(reg, function () {
                    return argument;
                });
            }
            return s;
        },
        getElementZIndex: function (element) {
            var zIndex = 'auto';
            $(element).parents().andSelf().each(function () {
                zIndex = $(this).css('zIndex');
                if (Number(zIndex)) {
                    zIndex = Number(zIndex) + 1;
                    return false;
                }
            });

            return zIndex;
        },
        lastIndexOf: function (value, character) {
            var characterLength = character.length;
            for (var i = value.length - 1; i > -1; i--)
                if (value.substr(i, characterLength) == character) return i;
            return -1;
        },
        caretPos: function (element) {
            var pos = -1;
            
            if (document.selection)
                pos = Math.abs(element.document.selection.createRange().moveStart('character', -element.value.length));
            else if (element.selectionStart !== undefined)
                pos = element.selectionStart;
            return pos;
        },
        encode: function (value) {
            return value.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\u00a0/g, '&nbsp;');
        },
        formatters: {},
        fx: {},
        cultureInfo: {
            days: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
            abbrDays: ['ش', '1ش', '2ش', '3ش', '4ش', '5ش', 'ج'],
            months: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
            abbrMonths: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
            longTime: 'h:mm:ss tt',
            longDate: 'dddd, MMMM dd, yyyy',
            shortDate: 'M/d/yyyy',
            shortTime: 'h:mm tt',
            fullDateTime: 'dddd, MMMM dd, yyyy h:mm:ss tt',
            generalDateShortTime: 'M/d/yyyy h:mm tt',
            generalDateTime: 'M/d/yyyy h:mm:ss tt',
            sortableDateTime: "yyyy'-'MM'-'ddTHH':'mm':'ss",
            universalSortableDateTime: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
            monthYear: 'MMMM, yyyy',
            monthDay: 'MMMM dd',
            today: 'today',
            tomorrow: 'tomorrow',
            yesterday: 'yesterday',
            next: 'next',
            last: 'last',
            year: 'year',
            month: 'month',
            week: 'week',
            day: 'day',
            am: 'AM',
            pm: 'PM',
            pDateFormat: 'yyyy/MM/dd',
            dateSeparator: '/',
            timeSeparator: ':',
            firstDayOfWeek: 0
        }
    };
    var filter, map;

    if (Array.prototype.filter !== undefined) {
        
        filter = function (array, predicate) {
            return array.filter(predicate);
        }
    } else {
        
        filter = function (array, predicate) {
            var result = [], length = array.length;
            for (var i = 0; i < length; i++) {
                var value = array[i];

                if (predicate(value, i, array)) {
                    result[result.length] = value;
                }
            }

            return result;
        }
    }

    if (Array.prototype.map !== undefined) {
        map = function (array, callback) {
            return array.map(callback);
        }
    } else {
        map = function (array, callback) {
            var length = array.length, result = new Array(length);

            for (var i = 0; i < length; i++) {
                result[i] = callback(array[i], i, array);
            }

            return result;
        }
    }

    var query = function (data) {
        return new query.fn.init(data);
    }

    $t.query = query;

    query.fn = query.prototype = {
        init: function (data) {
            this.data = data;

            return this;
        },
        toArray: function () {
            return this.data;
        },
        where: function (predicate) {
            return query(filter(this.data, predicate));
        },
        select: function (selector) {
            return query(map(this.data, selector));
        },
        skip: function (count) {
            return query(this.data.slice(count));
        },
        take: function (count) {
            return query(this.data.slice(0, count));
        },
        orderBy: function (selector) {
            var result = this.data.slice(0);

            return query(result.sort(function (a, b) {
                a = selector(a);
                b = selector(b);

                return a > b ? 1 : (a < b ? -1 : 0);
            }));
        },
        orderByDescending: function (selector) {
            var result = this.data.slice(0);

            return query(result.sort(function (a, b) {
                a = selector(a);
                b = selector(b);

                return a < b ? 1 : (a > b ? -1 : 0);
            }));
        },
        concat: function (value) {
            return query(this.data.concat(value.data));
        },
        count: function () {
            return this.data.length;
        },
        any: function (predicate) {
            if ($.isFunction(predicate)) {
                for (var index = 0, length = this.data.length; index < length; index++) {
                    if (predicate(this.data[index], index)) {
                        return true;
                    }
                }

                return false;
            }
            return !!this.data.length;
        }
    }

    query.fn.init.prototype = query.fn;



    $t.dropDown = function (options) {
        $.extend(this, options);

        this.$element = $(new $t.stringBuilder().cat('<div><div ')
                                 .catIf(options.attr, options.attr)
                                 .cat('><ul class="t-reset"></ul></div></div>')
                                 .string())
                                 .addClass("t-popup t-group")
                                 .hide();
    }

    $t.dropDown.prototype = {
        _html: function (data) {
            var html = new $t.stringBuilder();
            if (data) {
                for (var i = 0, length = data.length; i < length; i++) {

                    var text = "&nbsp;",
                        dataItem = data[i];

                    if (dataItem) {
                        if (dataItem.text !== undefined) {
                            text = dataItem.text;
                        } else {
                            text = dataItem;
                        }
                        if (!text || !text.replace(whiteSpaceRegExp, '')) {
                            text = '&nbsp;';
                        }
                    }
                    var e = {
                        html: text,
                        dataItem: dataItem
                    };

                    if (this.onItemCreate) this.onItemCreate(e);
                    html.cat('<li class="t-item">').cat(e.html).cat('</li>');
                }
            }
            return html.string();
        },

        open: function (position) {
            if (this.onOpen) this.onOpen();
            if (this.isOpened() || !this.$items) return;
            var $element = this.$element,
                selector = '.t-reset > .t-item';
            $element.appendTo(document.body);
            var width;
            if ($element[0].style.width == '')
                width = position.outerWidth ? position.outerWidth - 6 : 0;
            else
                width = parseInt(this.attr ? $('<div' + this.attr + '></div>')[0].style.width : $element[0].style.width);
            $element.find('div').css('overflowY', 'auto');
            $element.width(width);
            $element.delegate(selector, 'mouseenter', $t.hover)
                    .delegate(selector, 'mouseleave', $t.leave)
                    .delegate(selector, 'click',
                        $.proxy(function (e) {
                            if (this.onClick)
                                this.onClick($.extend(e, { item: $(e.target).closest('.t-item')[0] }));
                        }, this));
            var elementPosition = position.offset;
            elementPosition.left += 2
            elementPosition.top += position.outerHeight;

            $t.fx._wrap($element).css($.extend({
                position: 'absolute',
                zIndex: position.zIndex
            }, elementPosition));

            if (geckoFlicker)
                $element.css('overflow', 'hidden');
            $t.fx.play(this.effects, $element, { direction: 'bottom' }, $.proxy(function () {
                if (geckoFlicker)
                    $element.css('overflow', 'auto');
                $element.css('z-index', 3147483647);
                var $selectedItems = this.$items.filter('.t-state-selected');
                if ($selectedItems.length) this.scrollTo($selectedItems[0]);
            }, this));
        },

        close: function () {
            if (!this.isOpened()) return;

            var $element = this.$element;

            if (geckoFlicker)
                $element.css('overflow', 'hidden');

            $t.fx.rewind(this.effects, $element, { direction: 'bottom' }, function () {
                if (geckoFlicker)
                    $element.css('overflow', 'auto')

                $element.parent().remove();
            });
        },

        dataBind: function (data) {
            data = data || [];

            var $element = this.$element;
            var elementHeight = $element[0].style.height;
            var height = elementHeight && elementHeight != 'auto' ? $element[0].style.height : '200px';
            var $items = this.$items = $(this._html(data));
            $element.find('div> ul').html($items);
            $element.find('div').css('height', $items.length > 10 ? height : 'auto');
        },

        highlight: function (li) {
            return $(li).addClass('t-state-selected')
                        .siblings()
                        .removeClass('t-state-selected')
                        .end()
                        .index();
        },

        isOpened: function () {
            return this.$element.is(':visible');
        },

        scrollTo: function (item) {

            if (!item) return;

            var itemOffsetTop = item.offsetTop;
            var itemOffsetHeight = item.offsetHeight;

            var dropDown = this.$element[0];
            var dropDownScrollTop = dropDown.scrollTop;
            var dropDownOffsetHeight = dropDown.clientHeight;
            var bottomDistance = itemOffsetTop + itemOffsetHeight;

            dropDown.scrollTop = dropDownScrollTop > itemOffsetTop
                                    ? itemOffsetTop
                                    : bottomDistance > (dropDownScrollTop + dropDownOffsetHeight)
                                    ? bottomDistance - dropDownOffsetHeight
                                    : dropDownScrollTop;
        }
    }

    $t.datetime = function () {
        if (arguments.length == 0)
            this.value = new Date();
        else if (arguments.length == 1)
            this.value = new Date(arguments[0]);
        else if (arguments.length == 3)
            this.value = new Date(arguments[0], arguments[1], arguments[2]);
        else if (arguments.length == 6)
            this.value = new Date(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        else
            this.value = new Date(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);

        return this;
    }

    $.extend($t.datetime, {
        msPerMinute: 60000,
        msPerDay: 86400000,
        add: function (date, valueToAdd) {
            var tzOffsetBefore = date.timeOffset();
            var resultDate = new $t.datetime(date.time() + valueToAdd);
            var tzOffsetDiff = resultDate.timeOffset() - tzOffsetBefore;
            return new $t.datetime(resultDate.time() + tzOffsetDiff * $t.datetime.msPerMinute);
        },

        subtract: function (date, dateToSubtract) {
            dateToSubtract = new $t.datetime(dateToSubtract).toDate();
            var diff = date.time() - dateToSubtract;
            var tzOffsetDiff = date.timeOffset() - dateToSubtract.timeOffset();
            return diff - (tzOffsetDiff * $t.datetime.msPerMinute);
        },

        firstDayOfMonth: function (date) {
            return new $t.datetime(0)
                        .hours(date.hours())
                        .minutes(date.minutes())
                        .seconds(date.seconds())
                        .milliseconds(date.milliseconds())
                        .year(date.year(), date.month(), 1);
        },

        firstVisibleDay: function (date) {
            var firstDayOfWeek = $t.cultureInfo.firstDayOfWeek;
            var firstVisibleDay = new $t.datetime(date.year(), date.month(), 0, date.hours(), date.minutes(), date.seconds(), date.milliseconds());
            while (firstVisibleDay.day() != firstDayOfWeek) {
                $t.datetime.modify(firstVisibleDay, -1 * $t.datetime.msPerDay)
            }
            return firstVisibleDay;
        },

        modify: function (date, value) {
            var tzOffsetBefore = date.timeOffset();
            var resultDate = new $t.datetime(date.time() + value);
            var tzOffsetDiff = resultDate.timeOffset() - tzOffsetBefore;
            date.time(resultDate.time() + tzOffsetDiff * $t.datetime.msPerMinute);
        },

        pad: function (value) {
            if (value < 10)
                return '0' + value;
            return value;
        },

        standardFormat: function (format) {
            var l = $t.cultureInfo;

            var standardFormats = {
                d: l.shortDate,
                D: l.longDate,
                F: l.fullDateTime,
                g: l.generalDateShortTime,
                G: l.generalDateTime,
                m: l.monthDay,
                M: l.monthDay,
                s: l.sortableDateTime,
                t: l.shortTime,
                T: l.longTime,
                u: l.universalSortableDateTime,
                y: l.monthYear,
                Y: l.monthYear
            };

            return standardFormats[format];
        },

        format: function (date, format) {
            var l = $t.cultureInfo;

            var d = date.getDate();
            var day = date.getDay();
            var M = date.getMonth();
            var y = date.getFullYear();
            var h = date.getHours();
            var m = date.getMinutes();
            var s = date.getSeconds();
            var f = date.getMilliseconds();
            var pad = $t.datetime.pad;

            var dateFormatters = {
                d: d,
                dd: pad(d),
                ddd: l.abbrDays[day],
                dddd: l.days[day],

                M: M + 1,
                MM: pad(M + 1),
                MMM: l.abbrMonths[M],
                MMMM: l.months[M],

                yy: pad(y % 100),
                yyyy: y,

                h: h % 12 || 12,
                hh: pad(h % 12 || 12),
                H: h,
                HH: pad(h),

                m: m,
                mm: pad(m),

                s: s,
                ss: pad(s),

                f: Math.floor(f / 100),
                ff: Math.floor(f / 10),
                fff: f,

                tt: h < 12 ? l.am : l.pm
            };

            format = format || 'G';
            format = $t.datetime.standardFormat(format) ? $t.datetime.standardFormat(format) : format;

            return format.replace(dateFormatTokenRegExp, function (match) {
                return match in dateFormatters ? dateFormatters[match] : match.slice(1, match.length - 1);
            });
        },

        parse: function (options) {
            var value = options.value;
            var format = options.format;

            if (value && value.value) return value;

            format = $t.datetime.standardFormat(format) ? $t.datetime.standardFormat(format) : format;
            if (dateCheck.test(value))
                return $t.datetime.parseMachineDate({
                    value: value,
                    format: format,
                    shortYearCutOff: options.shortYearCutOff,
                    baseDate: options.baseDate,
                    AM: $t.cultureInfo.am,
                    PM: $t.cultureInfo.pm
                });

            return $t.datetime.parseByToken ? $t.datetime.parseByToken(value, options.today) : null;
        },

        parseMachineDate: function (options) {
            var AM = options.AM, PM = options.PM, value = options.value, format = options.format,
                baseDate = options.baseDate, shortYearCutOff = options.shortYearCutOff || 30, year = -1, month = -1,
                day = -1, hours = 0, minutes = 0, seconds = 0, milliseconds = 0, isAM, isPM, literal = false,
                matches = function (match) {
                    return (formatPosition + 1 < format.length && format.charAt(formatPosition + 1) == match);
                },
            // Returns count of the format character in the date format string
                lookAhead = function (match) {
                    var index = 0;
                    while (matches(match)) {
                        index++;
                        formatPosition++
                    }
                    return index;
                },
            // Extract a number from the string value
                getNumber = function (size) {
                    var digits = new RegExp('^\\d{1,' + size + '}');
                    var num = value.substr(currentTokenIndex).match(digits);
                    if (num) {
                        currentTokenIndex += num[0].length;
                        return parseInt(num[0], 10);
                    } else {
                        return -1;
                    }
                },
            // Extract a name from the string value and convert to an index
                getName = function (names) {
                    for (var i = 0; i < names.length; i++) {
                        if (value.substr(currentTokenIndex, names[i].length) == names[i]) {
                            currentTokenIndex += names[i].length;
                            return i + 1;
                        }
                    }
                    return -1;
                },
                checkLiteral = function () {
                    if (value.charAt(currentTokenIndex) == format.charAt(formatPosition)) 
                        currentTokenIndex++;
                   
                },
                normalizeTime = function (val) {
                    return val === -1 ? 0 : val;
                },
                count = 0,
                currentTokenIndex = 0,
                valueLength = value.length;

            for (var formatPosition = 0, flength = format.length; formatPosition < flength; formatPosition++) {
                if (currentTokenIndex == valueLength) break;
                if (literal) {
                    checkLiteral();
                    if (format.charAt(formatPosition) == "'")
                        literal = false;
                } else {
                    switch (format.charAt(formatPosition)) {
                        case 'd':
                            count = lookAhead('d');
                            day = count <= 1 ? getNumber(2) : getName($t.cultureInfo[count == 3 ? 'days' : 'abbrDays']);
                            break;
                        case 'M':
                            count = lookAhead('M');
                            month = count <= 1 ? getNumber(2) : getName($t.cultureInfo[count == 3 ? 'months' : 'abbrMonths']);
                            break;
                        case 'y':
                            count = lookAhead('y');
                            year = getNumber(count <= 1 ? 2 : 4);
                            break;
                        case 'H': // 0-24 hours
                            count = lookAhead('H');
                            hours = normalizeTime(getNumber(2));
                            break;
                        case 'h': // 0-12 hours
                            lookAhead('h')
                            hours = normalizeTime(getNumber(2));
                            break;
                        case 'm':
                            lookAhead('m');
                            minutes = normalizeTime(getNumber(2));
                            break;
                        case 's':
                            lookAhead('s');
                            seconds = normalizeTime(getNumber(2));
                            break;
                        case 'f':
                            count = lookAhead('f');
                            milliseconds = normalizeTime(getNumber(count <= 0 ? 1 : count + 1));
                            break;
                        case 't': // AM/PM or A/P
                            count = lookAhead('t');
                            AM = count > 0 ? AM : 'a';
                            PM = count > 0 ? PM : 'p';

                            var subValue = value.substr(currentTokenIndex).toLowerCase();
                            isAM = subValue.indexOf(AM.toLowerCase()) != -1;
                            isPM = subValue.indexOf(PM.toLowerCase()) != -1;

                            currentTokenIndex += isPM ? PM.length : isAM ? AM.length : 0;
                            break;
                        case "'":
                            checkLiteral();
                            literal = true;
                            break;
                        default:
                            checkLiteral();
                    }
                }
            }

            var date = new $t.datetime();

            if (year != -1 && year < 100)
                year += date.year() - date.year() % 100 +
                                (year <= shortYearCutOff ? 0 : -100);

            hours = (isPM && hours < 12)
                  ? hours + 12
                  : hours == 12 && isAM
                  ? 0
                  : hours;

            if (!baseDate) {
                if (year == -1) year = date.year();

                date = new $t.datetime(year, month - 1, day, hours, minutes, seconds, milliseconds);

                if (date.year() != year || date.month() != (month - 1) || date.date() != day)
                    return null;

            } else {
                date = baseDate.year(year != -1 ? year : baseDate.year())
                               .month(month != -1 ? month - 1 : baseDate.month())
                               .date(day != -1 ? day : baseDate.date())
                               .hours(hours)
                               .minutes(minutes)
                               .seconds(seconds)
                               .milliseconds(milliseconds);



                if ((year != -1 && date.year() != year)
                 || (month != -1 && date.month() != (month - 1))
                 || (day != -1 && date.date() != day)
                 || (hours != -1 && date.hours() != hours)
                 || (minutes != -1 && date.minutes() != minutes)
                 || (seconds != -1 && date.seconds() != seconds)
                 || (milliseconds != -1 && date.milliseconds() != milliseconds))
                    return null;
            }
            return date;
        }
    });

    $t.datetime.prototype = {
        year: function () {
            if (arguments.length == 0)
                return this.value.getFullYear();
            else if (arguments.length == 1)
                this.value.setFullYear(arguments[0]);
            else
                this.value.setFullYear(arguments[0], arguments[1], arguments[2]);

            return this;
        },
        timeOffset: function () {
            return this.value.getTimezoneOffset();
        },
        day: function () {
            return this.value.getDay();
        },
        toDate: function () {
            return this.value;
        },
        addMonth: function (value) {
            this.month(this.month() + value);

        },
        addYear: function (value) {
            this.year(this.year() + value);
        }
    };

    $.each(["Month", "Date", "Hours", "Minutes", "Seconds", "Milliseconds", "Time"], function (index, timeComponent) {
        $t.datetime.prototype[timeComponent.toLowerCase()] =
            function () {
                if (arguments.length == 1)
                    this.value["set" + timeComponent](arguments[0]);
                else
                    return this.value["get" + timeComponent]();

                return this;
            };
    });

    $t.stringBuilder.prototype = {

        cat: function (what) {
            this.buffer.push(what);
            return this;
        },

        rep: function (what, howManyTimes) {
            for (var i = 0; i < howManyTimes; i++)
                this.cat(what);
            return this;
        },

        catIf: function () {
            var args = arguments;
            if (args[args.length - 1])
                for (var i = 0, length = args.length - 1; i < length; i++)
                    this.cat(args[i]);

            return this;
        },

        string: function () {
            return this.buffer.join('');
        }
    }

    var isTouch = (/iphone|ipad|android/gi).test(navigator.appVersion);

    if (isTouch) {
        var moveEvent = "touchmove",
            startEvent = "touchstart",
            endEvent = "touchend";
    } else {
        var moveEvent = "mousemove",
            startEvent = "mousedown",
            endEvent = "mouseup";
    }

    $.extend($.fn, {
        tScrollable: function (options) {
            $(this).each(function () {
                if (isTouch || (options && options.force)) {
                    new Scroller(this);
                }
            });
        }
    });

    function Scroller(element) {
        this.element = element;
        this.wrapper = $(element);

        this._horizontalScrollbar = $('<div class="t-touch-scrollbar" />');
        this._verticalScrollbar = this._horizontalScrollbar.clone();
        this._scrollbars = this._horizontalScrollbar.add(this._verticalScrollbar);

        this._startProxy = $.proxy(this._start, this);
        this._stopProxy = $.proxy(this._stop, this);
        this._dragProxy = $.proxy(this._drag, this);

        this._create();
    }

    function touchLocation(e) {
        var changedTouches = e.originalEvent.changedTouches;

        if (changedTouches && changedTouches.length < 2) {
            return {
                x: changedTouches[0].pageX,
                y: changedTouches[0].pageY
            };
        }

        return {
            x: e.pageX,
            y: e.pageY
        };
    }

    Scroller.prototype = {
        _create: function () {
            this.wrapper
                .css("overflow", "hidden")
                .bind(startEvent, $.proxy(this._wait, this));

        },
        _wait: function (e) {
            var startLocation = touchLocation(e);

            this.start = {
                x: startLocation.x + this.wrapper.scrollLeft(),
                y: startLocation.y + this.wrapper.scrollTop()
            };

            $(document)
                .bind(moveEvent, this._startProxy)
                .bind(endEvent, this._stopProxy);
        },
        _start: function (e) {
            e.preventDefault();

            var currentLocation = touchLocation(e);

            if (this.start.x - currentLocation.x > 10 || this.start.y - currentLocation.y > 10) {

                $(document).unbind(moveEvent, this._startProxy)
                           .bind(moveEvent, this._dragProxy);

                var width = this.wrapper.innerWidth(),
                    height = this.wrapper.innerHeight()
                offset = this.wrapper.offset(),
                    scrollWidth = this.wrapper.attr("scrollWidth"),
                    scrollHeight = this.wrapper.attr("scrollHeight");

                if (scrollWidth > width) {
                    this._horizontalScrollbar
                        .appendTo(document.body)
                        .css({
                            width: Math.floor((width / scrollWidth) * width),
                            left: this.wrapper.scrollLeft() + offset.left + parseInt(this.wrapper.css("borderLeftWidth")),
                            top: offset.top + this.wrapper.innerHeight() + parseInt(this.wrapper.css("borderTopWidth")) - this._horizontalScrollbar.outerHeight()
                        });
                }

                if (scrollHeight > height) {
                    this._verticalScrollbar
                        .appendTo(document.body)
                        .css({
                            height: Math.floor((height / scrollHeight) * height),
                            top: this.wrapper.scrollTop() + offset.top + parseInt(this.wrapper.css("borderTopWidth")),
                            left: offset.left + this.wrapper.innerWidth() + parseInt(this.wrapper.css("borderLeftWidth")) - this._verticalScrollbar.outerWidth()
                        });
                }

                this._scrollbars
                    .stop()
                    .fadeTo(200, 0.5);
            }
        },

        _drag: function (e) {
            e.preventDefault();

            var currentLocation = touchLocation(e),
                offset = this.wrapper.offset(),
                startLeft = offset.left + parseInt(this.wrapper.css("borderLeftWidth")),
                startTop = offset.top + parseInt(this.wrapper.css("borderTopWidth")),
                horizontalDifference = this.start.x - currentLocation.x,
                verticalDifference = this.start.y - currentLocation.y,
                left = Math.max(startLeft, startLeft + horizontalDifference),
                top = Math.max(startTop, startTop + verticalDifference);

            left = Math.min(startLeft + this.wrapper.innerWidth() - this._horizontalScrollbar.outerWidth() - this._horizontalScrollbar.outerHeight(), left);
            top = Math.min(startTop + this.wrapper.innerHeight() - this._verticalScrollbar.outerHeight() - this._verticalScrollbar.outerWidth(), top);

            this._horizontalScrollbar.css("left", left);
            this._verticalScrollbar.css("top", top);

            this.wrapper
                .scrollLeft(horizontalDifference)
                .scrollTop(verticalDifference);
        },
        _stop: function (e) {
            $(document).unbind(moveEvent, this._startProxy)
                       .unbind(moveEvent, this._dragProxy)
                       .unbind(endEvent, this._stopProxy);

            this._scrollbars
                .stop()
                .fadeTo(400, 0);
        }
    }

    // Effects ($t.fx)

    var prepareAnimations = function (effects, target, end) {
        if (target.length == 0 && end) {
            end();
            return null;
        }

        var animationsToPlay = effects.list.length;

        return function () {
            if (--animationsToPlay == 0 && end)
                end();
        };
    };

    $.extend($t.fx, {
        _wrap: function (element) {
            if (!element.parent().hasClass('t-animation-container')) {
                element.wrap(
                             $('<div/>')
                             .addClass('t-animation-container')
                             .css({
                                 width: 203,
                                 height: 178
                             }));
            }

            return element.parent();
        },

        play: function (effects, target, options, end) {
            var afterAnimation = prepareAnimations(effects, target, end);
            if (afterAnimation === null) return;
            target.stop(false, true);

            for (var i = 0, len = effects.list.length; i < len; i++) {
                var effect = new $t.fx[effects.list[i].name](target);
                if (!target.data('effect-' + i)) {
                    var data = $.extend(effects.list[i], {
                            openDuration: effects.openDuration,
                            closeDuration: effects.closeDuration
                        },
                        options);
                    effect.play(data, afterAnimation);
 
                    target.data('effect-' + i, effect);
                }
            }
        },

        rewind: function (effects, target, options, end) {
            var afterAnimation = prepareAnimations(effects, target, end);

            if (afterAnimation === null) return;

            for (var i = effects.list.length - 1; i >= 0; i--) {

                var effect = target.data('effect-' + i) || new $t.fx[effects.list[i].name](target);

                effect.rewind(
                    $.extend(
                        effects.list[i], {
                            openDuration: effects.openDuration,
                            closeDuration: effects.closeDuration
                        },
                        options), afterAnimation);

                target.data('effect-' + i, null);
            }
        }
    });

    // simple show/hide toggle

    $t.fx.toggle = function (element) {
        this.element = element.stop(false, true);
    };

    $t.fx.toggle.prototype = {
        play: function (options, end) {
            this.element.show();
            if (end) end();
        },
        rewind: function (options, end) {
            this.element.hide();
            if (end) end();
        }
    }

    $t.fx.toggle.defaults = function () {
        return { list: [{ name: 'toggle'}] };
    };

    // slide animation

    $t.fx.slide = function (element) {
        this.element = element;

        this.animationContainer = $t.fx._wrap(element);
    };

    $t.fx.slide.prototype = {
        play: function (options, end) {

            var animationContainer = this.animationContainer;

            this.element.css('display', 'block').stop();

            animationContainer
                .css({
                    display: 'block',
                    overflow: 'hidden'
                });

            var width = this.element.outerWidth();
            var height = this.element.outerHeight();
            var animatedProperty = options.direction == 'bottom' ? 'marginTop' : 'marginLeft';
            var animatedStartValue = options.direction == 'bottom' ? -height : -width;
            animationContainer
                .css({
                    width: width,
                    height: height
                });

            var animationEnd = {};
            animationEnd[animatedProperty] = 0;

            this.element
                .css('width', this.element.width())
                .each(function () { this.style.cssText = this.style.cssText; })
                .css(animatedProperty, animatedStartValue)
                .animate(animationEnd, {
                    queue: false,
                    duration: options.openDuration,
                    easing: 'linear',
                    complete: function () {
                        animationContainer.css('overflow', '');

                        if (end) end();
                    }
                });
        },

        rewind: function (options, end) {
            var animationContainer = this.animationContainer;

            this.element.stop();

            animationContainer.css({
                overflow: 'hidden'
            });

            var animatedProperty;

            switch (options.direction) {
                case 'bottom': animatedProperty = { marginTop: -this.element.outerHeight() };
                    break;
                case 'right': animatedProperty = { marginLeft: -this.element.outerWidth() }; break;
            }

            this.element
                .animate(animatedProperty, {
                    queue: false,
                    duration: options.closeDuration,
                    easing: 'linear',
                    complete: function () {
                        animationContainer
                            .css({
                                display: 'none',
                                overflow: ''
                            });

                        if (end) end();
                    }
                });
        }
    }

    $t.fx.slide.defaults = function () {
        return { list: [{ name: 'slide'}], openDuration: 'fast', closeDuration: 'fast' };
    };

    // property animation

    $t.fx.property = function (element) {
        this.element = element;
    };

    $t.fx.property.prototype = {
        _animate: function (properties, duration, reverse, end) {
            var startValues = { overflow: 'hidden' },
                endValues = {},
                $element = this.element;

            $.each(properties, function (i, prop) {
                var value;

                switch (prop) {
                    case 'height':
                    case 'width': value = $element[prop](); break;

                    case 'opacity': value = 1; break;

                    default: value = $element.css(prop); break;
                }

                startValues[prop] = reverse ? value : 0;
                endValues[prop] = reverse ? 0 : value;
            });

            $element.css(startValues)
                    .show()
                    .animate(endValues, {
                        queue: false,
                        duration: duration,
                        easing: 'linear',
                        complete: function () {
                            if (reverse)
                                $element.hide();

                            $.each(endValues, function (property) {
                                endValues[property] = '';
                            });

                            $element.css($.extend({ overflow: '' }, endValues));

                            if (end) end();
                        }
                    });
        },

        play: function (options, complete) {
            this._animate(options.properties, options.openDuration, false, complete);
        },

        rewind: function (options, complete) {
            this._animate(options.properties, options.closeDuration, true, complete);
        }
    }

    $t.fx.property.defaults = function () {
        return { list: [{ name: 'property', properties: arguments}], openDuration: 'fast', closeDuration: 'fast' };
    };

    // fix the MVC validation code for IE (document.getElementsByName matches `id` and `name` instead of just `name`). http://www.w3.org/TR/REC-DOM-Level-1/level-one-html.html#ID-71555259
    $(document).ready(function () {
        if ($.browser.msie && typeof (Sys) != 'undefined' && typeof (Sys.Mvc) != 'undefined' && typeof (Sys.Mvc.FormContext) != 'undefined') {
            var patch = function (formElement, name) {
                return $.grep(formElement.getElementsByTagName('*'), function (element) {
                    return element.name == name;
                });
            };

            if (Sys.Mvc.FormContext)
                Sys.Mvc.FormContext.$F = Sys.Mvc.FormContext._getFormElementsWithName = patch;
        }

    });

    var timer = null;
    $t.confirm = function (message, func) {
        var win = $('#confirmWindow').data('tWindow');
        var str = '<div class="t-alert"><span>' + message + '</span><div><input type="button" class="t-button" value="';
        var flag = $('.t-rtl.c-ltr').hasClass('c-ltr');
        if (flag)
            str += 'Evet';
        else
            str += 'بله';
        str += '"/><input type="button" class="t-button" onclick="$.telerik.getWindow().close()" value="';
        if (flag)
            str += 'Hayır';
        else
            str += 'خیر';
        str += '"/></div></div>';
        win.content(str);
        $(win.element).find('input').eq(0).click(function () {
            if (func)
                func();
            win.close();
        });
        $(win.element).find('input').eq(1).click(function () {
            win.close();
        });
        win.center();
        win.size(300, 100);
        win.open();
    };
    $t.outMessage = function () {

        this.message = '';
        this.title = "خطا";
        this.kind = 1;
        this.timeOut = 2000;

        function create() {
            var odv = $('<div class="t-widget t-message" id="outMessage"></div>');
            $("body .t-rtl").append(odv);
            $("#outMessage").html('<div class="t-window-titlebar t-header">&nbsp;<div class="t-window-actions t-header"><span class="t-close"></span><span class="t-title"></span></div></div><div style="padding:5px 5px 5px 5px;text-align:justify"></div>');
            $("#outMessage .t-close").click(function () {
                hide();
            });
            $("#outMessage .t-close").mouseover(function () {
                if (!$(this).hasClass('t-state-hover'))
                    $(this).addClass('t-state-hover');
            });
            $("#outMessage .t-close").mouseout(function () {
                $(this).removeClass('t-state-hover');
            });
        };
        this.show = function (msg) {
            if (typeof msg == 'string') {
                try {
                    msg = eval('(' + msg + ')');
                    this.message = msg.Message;
                    this.title = msg.kind == 1 ? "خطا" : "پیغام";
                }
                catch (ex) {
                    this.message = msg;
                    this.title = "پیغام";
                }
            }
            else {
                this.message = msg.Message;
                this.title = msg.kind == 1 ? "خطا" : "پیغام";
            }
            flag = false;
            $("#outMessage").remove();
            create();
            height = 30;
            $("#outMessage .t-title").text(this.title);
            $("#outMessage").children().eq(1).html(this.message);
            $("#outMessage").css('opacity', 0.1);
            $("#outMessage").show();
            $("#outMessage").css('height', height + "px");
            opa = 1 - $("#outMessage").css('opacity');
            opa = opa / (125 - height);
            flag = true;
            moverItem();
            if (timer != null)
                clearTimeout(timer);
            timer = setTimeout('hide()', 4000);
        };
        return this;
    }

    //مشخصات و توابعی برای دست کاری تاریخ شمسی
    $t.PersianDate_ = function (value) {
        this.toMilady = function() {
            if (!value)
                value = 0;
            var daysCount = 22 * 365;
            var leapCount = 6;
            var year = Number(this.Year) - 22;
            var q_33 = parseInt((year - 1) / 33);
            leapCount += q_33 * 8;
            var q__33 = (year - 1) % 33;
            if (q__33 > 27)
                leapCount += 7;
            else
                leapCount += parseInt(q__33 / 4);
            
            daysCount += 365 * (year - 1) + leapCount + (Number(this.Month) - 1) * 30 + Number(this.Day);
            if (Number(this.Month) < 7)
                daysCount += Number(this.Month) - 1;
            else
                daysCount += 6;
            var milliSecond = (daysCount - 492269) * 24 * 3600;
            var date = new Date(milliSecond * 1000);
            date = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
            return date;
        };

        //این متد یک عدد که بعنوان تعداد روزها است را دریافت کرده و تاریخ آن را برمی گرداند.
        this.dateOfDays = function (daysCount) {
            var constNumber = 33 * 365 + 8;
            var n = daysCount + 1;
            n -= 22 * 365 + 6;
            var q1 = parseInt(n / constNumber);
            var q2 = (n % constNumber);
            var q3 = parseInt(q2 / (4 * 365 + 1));
            if (q2 + 366 > constNumber)
                q3--;
            var leapCount = q1 * 8 + q3;
            var q4 = n - leapCount;
            var year = parseInt((q4 - 1) / 365) + 23;
            q4 = q4 - (year - 23) * 365;
            var month = 0, day = 0;
            if (q4 <= 186)
            {
                month = parseInt((q4 - 1) / 31) + 1;
                day = q4 - (month - 1) * 31;
            }
            else
            {
                month = parseInt((q4 - 187) / 30) + 7;
                day = q4 - (month - 1) * 30 - 6;
                n = n % 12053;
                if (n % 1461 == 0)
                    day = 30;
            }
            this.Year = year;
            this.Month = month;
            this.Day = day;
            this.Date = this.toStringDate();
            return this;
        };

        //این متد تعداد کل روزها از ابتدا تا این تاریخ را برمی گرداند.
        this.totalDays = function () {
            var year = this.Year - 22 - 1;
            var leapCount = 6 + parseInt(year / 33) * 8 + parseInt((year % 33) / 4);
            if ((year + 1) % 33 == 0)
                leapCount--;
            var daysInYear = 0;
            daysInYear += (parseFloat(this.Month) - 1) * 30;
            if (this.Month < 7)
                daysInYear += parseFloat(this.Month) - 1;
            else
                daysInYear += 6;
            daysInYear += parseFloat(this.Day);
            return year * 365 + leapCount + 22 * 365 + daysInYear;
        };

        this.getNumberDaysInMonth = function () {
            if (this.Month < 7)
                return 31;
            if (this.Month != 12 || this.isLeap())
                return 30;
            return 29;
        };

        //این متد یک تاریخ را بعنوان ورودی گرفته و در صورتی که این تاریخ از آن بزرگتر باشد عدد 1
        //در صورتیکه از آن کوچکتر باشد عدد -1
        //و در صورت مساوی بودن عدد 0 را برمی گرداند.
        this.compareTo = function (date, status) {
            if (status == 3)
                return 0;
            if (status == 2) {

                var dec1 = this.Year - this.Year % 10;
                var dec2 = date.Year - date.Year % 10;
                if (dec1 > dec2)
                    return 1;
                if (dec1 < dec2)
                    return -1;
                return 0;
            }
            if (status == 1) {
                if (this.Year > date.Year)
                    return 1;
                if (this.Year < date.Year)
                    return -1;
                return 0;
            }

            if (this.Year > date.Year)
                return 1;
            if (this.Year < date.Year)
                return -1;
            if (this.Month > date.Month)
                return 1;
            if (this.Month < date.Month)
                return -1;
            return 0;

        };

        this.compareDate = function (date) {
            if (this.Year > date.Year)
                return 1;
            if (this.Year < date.Year)
                return -1;
            if (this.Month > date.Month)
                return 1;
            if (this.Month < date.Month)
                return -1;
            if (this.Day > date.Day)
                return 1;
            if (this.Day < date.Day)
                return -1;
            return 0;
        };

        this.toStringDate = function () {
            if (this.Year == null)
                return "";
            var str = this.Year;
            str += '/'
            var month = parseInt(this.Month);
            if (month < 10)
                str += '0';
            str += month;
            str += '/'
            var day = parseInt(this.Day);
            if (day < 10)
                str += '0';
            str += day;
            return str;
        };

        //این متد مشخص می نماید که آیا این سال سال کبیسه است یا خیر
        this.isLeap = function () {
            var year = this.Year + 11;
            year = year % 33;
            if(year == 0)
                year = 33;
            if (year % 32 == 0)
                return false;
            if(year % 33 == 0 || year % 4 == 0)
                return true;
            return false;
        };

        //این متد مشخص می نماید که اولین روز این سال چند شنبه است
        this.getFirstDayOfYear = function () {
            var year = this.Year;
            year--;
            var leapYear = 1;
            leapYear = Math.floor((year + 3 - Math.floor((year + 12) / 33)) / 4);
            var daysOfYear = 365 * year + leapYear + 5;
            return (daysOfYear % 7);
        };

        //این متد مشخص می نماید که اولین روز ماه چند شنبه است.
        this.getFirstDayOfMonth = function () {
            var month = this.Month;
            month--;
            var numberDays = month * 30;
            if (month > 6)
                month = 6;
            numberDays += month;
            numberDays += this.getFirstDayOfYear();
            return numberDays % 7;
        };

        //این متد یک عدد را بعنوان ورودی گرفته و سال را به اندازه آن افزایش می دهد
        this.addYears = function (year) {
            this.Year = parseInt(this.Year) + parseInt(year);
            if (this.Month == 12 && this.Day == 30 && !isLeap())
                this.Day = 29;
            return this;
        };

        //این متد تعداد ماهها را یک واحد افزایش می دهد
        this.incMonth = function () {
            this.Month++;
            if (this.Month > 12) {
                this.Month = 1;
                this.Year++;
            }
            if (this.Month > 6 && this.Day == 31)
                this.Day = 30;
            if (this.Month == 12 && this.Day == 30 && !this.isLeap())
                this.Day = 29;
            return this;
        };

        //این متد تعداد ماهها را یک واحد افزایش می دهد.
        this.decMonth = function () {
            this.Month--;
            if (this.Month < 1) {
                this.Month = 12;
                this.Year--;
            }
            if (this.Month > 6 && this.Day == 31)
                this.Day = 30;
            if (this.Month == 12 && this.Day == 30 && !this.isLeap())
                this.Day = 29;
            return this;
        }

        //این متد یک عدد را بعنوان ورودی گرفته و تعداد روزها را به اندازه آن افزایش می دهد.
        this.addDays = function (day) {
            var daysCount = this.totalDays() + day;
            return this.dateOfDays(daysCount);
        };

        //این متد دو تاریخ را گرفته  و چک می نماید که آیا این تاریخ در محدوده آن دو تاریخ می باشد یا خیر.
        this.isInRange = function (minDate, maxDate) {
            var totaldays = this.totalDays();
            return (minDate.totalDays() <= totaldays && maxDate.totalDays() >= totaldays);
        };

        //این متد تاریخ شمسی را چک نموده در صورت امکان تصحیح می نماید و درغیر اینصورت مقدار null برمی گرداند.
        this.Parse = function (val) {
            if (val.indexOf('_') != -1)
                return null;
            var q = val.split("/");
            if (q[0] < 1000 || q[1] < 1 || q[2] < 1)
                return null;
            if (q[1] > 12 || q[2] > 31 || q[1] >= 7 && q[2] == 31)
                return null;
            this.Year = q[0];
            this.Month = q[1];
            this.Day = q[2];
            if (q[1] == 12 && q[2] == 30 && !this.isLeap())
                return null;
            this.Year = q[0];
            this.Month = q[1];
            this.Day = q[2];
            return this;
        };

        this.setDate = function (date) {
            this.Year = date.Year;
            this.Month = date.Month;
            this.Day = date.Day;
        }

        this.getDateByMonthName = function (name) {
            var months = $t.cultureInfo.months;
            var i = 0;
            for (i = 0; i < months.length; i++)
                if (months[i] == name)
                    break;
            i++;
            this.Month = i;
            return this;
        }

        this.incYear = function () {
            this.Year++;
            if (this.Month == 12 && this.Day == 30 && !this.isLeap())
                Day = 29;
            return this;
        }

        this.decYear = function () {
            this.Year--;
            if (this.Month == 12 && this.Day == 30 && !this.isLeap())
                Day = 29;
            return this;
        }

        this.toMiladyString = function(){
            var date = this.toMilady();
            return date.toDateString();
        }
        this.Year = null;
        this.Month = null;
        this.Day = null;
        this.Date = null;
        if (value) {
            if (value.getUTCFullYear){
                value = Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 0, 0, 0, 0);
                value += 3600 * 1000 * 24;
            }
            else 
                if (typeof (value) == 'string') {
                    if (value.substring(0, 6) == '/Date('){
                        value = value.substring(6);
                        value = value.substring(0, value.length - 2);
                        value = new Date(parseInt(value));
                        value = Date.UTC(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
                    }
                    else {
                        var array = value.split('/');
                        this.Year = parseFloat(array[0]);
                        this.Month = parseFloat(array[1]);
                        this.Day = parseFloat(array[2]);
                        this.Date = this.toStringDate();
                        return this;
                    }
                }
            value /= (3600000);
            value /= 24;
            value += 492268;
            return this.dateOfDays(value);
        }
        return this;
    }

})(jQuery);

function moverItem() {

    if (height < 125 && flag == true) {
        height += 4;
        $("#outMessage").css('opacity', (height - 17) * opa);
        $("#outMessage").css('height', height);
        setTimeout('moverItem()', 6);
    }
}

function hide() {
    if (height > 60 && flag == true) {
        height--;
        $("#outMessage").css('opacity', (height - 30) * opa);
        setTimeout('hide()', 2);
    }
    else
        if (height == 60)
            $("#outMessage").hide();
}

(function ($) {
    var $t = $.telerik, hasFocus = false;
    var rdate = /"\\\/Date\((.*?)\)\\\/"/g; 
    function enableBootstrap(element, tempWidth, width) {
        if (tempWidth != null)
            width = tempWidth;
        if ($(element).width() < width) {
            $(element).addClass('t-bootstarp');
            if (tempWidth == null)
                tempWidth = width;
        }
        else
            $(element).removeClass('t-bootstarp');
        return tempWidth;
    }
    function template(value) {
        var processedValue = unescape(value).replace(/[\r\t\n]/g, " ")
            .replace(/'(?=[^#]*#>)/g, "\t")
            .split("'").join("\\'")
            .split("\t").join("'")
            .replace(/<#=(.+?)#>/g, "',$1,'")
            .split("<#").join("');")
            .split("#>").join("p.push('");
        return new Function('data', "var p=[];" + "with(data){p.push('" + processedValue + "');}return p.join('');");
    }
    function encode(value) {
        return (value != null ? value + '' : '').replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
    }
    function gridButton(btn) {
        return {
            enabled: $(btn).css('pointer-events') != 'none',
            focus: function () {
                $(btn).focus();
            },
            disable: function () {
                $(btn).css('pointer-events', 'none').css('opacity', '0.7');
            },
            enable: function () {
                $(btn).css('pointer-events', 'all').css('opacity', '1');
            }
        };
    }
    function getControl(arg, type, grid, row) {
        var str = arg.toString();
        var index = str.indexOf('.') + 1;
        str = str.substring(index);
        index = str.indexOf(';');
        str = str.substring(0, index);
        index = null;
        grid.columns.filter(function (item, i) {
            if (item.member == str || item.type == 'Date' && item.member == str + '.Date') {
                index = i;
                return false;
            }
        });
        if (index == null)
            throw new Error("ستونی با نام" + str + "وجود ندارد");
        var control = null;
        $(row).children().eq(index).find('input').each(function () {
            var ctr = $(this).data(type);
            if (ctr) {
                control = ctr;
                return false;
            }
        });
        return control;
    }
    function gridRowBind(grid, data, row) {
        
        return {
            Data: data,
            RowIndex: $(grid.element).find('.t-grid-content tr').index(row),
            HtmlElement: row,
            DeleteButton: gridButton($(row).find('.t-grid-delete')[0]),
            EditButton: gridButton($(row).find('.t-grid-edit')[0]),
            getMemberCell: function (arg) {
                var str = arg.toString();
                str = str.substring(str.indexOf('.') + 1, str.indexOf(';'));
                var index = null;
                grid.columns.filter(function (item, i) {
                    if (item.member == str || item.type == 'Date' && item.member == str + '.Date') {
                        index = i;
                        return false;
                    }
                });
                if (index == null)
                    throw new Error("ستونی با نام" + str + "وجود ندارد");
                return {
                    cell: $(row).children().eq(index)[0]
                };
            },
            getActionCell: function (arg) {
                var str = arg.toString();
                str = str.substring(str.indexOf('.') + 1, str.indexOf(';'));
                var index = null;
                grid.columns.forEach(function (col, i) {
                    if (col.action == str)
                        index = i;
                });
                if (index == null)
                    throw new Error("ستونی با نام" + str + "وجود ندارد");
                var cell = $(row).children().eq(index);
                return {
                    cell: cell[0],
                    inputButton: cell.children().eq(0)[0]
                };
            },
            getMemberTextBox: function (arg) {
                var txt = getControl(arg, 'tTextBox', grid, row);
                if (txt == null)
                    throw new Error("این ستون فاقد کنترل Text Box  می باشد");
                return new TextBox("t." + $(txt.element).attr('name') + ";", this);
            },
            getMemberDropdown: function (arg) {
                var ddl = getControl(arg, 'tDropDownList', grid, row);
                if (ddl == null)
                    throw new Error("این ستون فاقد کنترل DropDown List  می باشد");
                return new DropDownList("t." + $(ddl.element).attr('name') + ";", this);
            }
        };
    }

    $t.grid = function (element, options) {
        var tempWidth = null;
        var self_ = this;
        this.element = element;
        this.insertButton = gridButton($(element).find('.t-grid-add')[0]);
        this.groups = [];
        this.editing = {};
        this.filterBy = '';
        this.groupBy = '';
        this.orderBy = '';
        $.extend(this, options);
        if (this.enableBootstrap)
            enableBootstrap(element, tempWidth, $(element).find('.t-grid-header-wrap table').outerWidth());
        $(window).resize(function () {
            if (self_.enableBootstrap)
                tempWidth = enableBootstrap(element, tempWidth, $(element).find('.t-grid-header-wrap table').outerWidth());
        });
        $(element).find('.t-content .t-edit').click(function (e) {
            var editButtons = $(this).closest('.t-content').find('.t-edit');
            var index = editButtons.index(this);
            e.stopPropagation();
        });
        this.sorted = $.grep(this.columns, function (column) { return column.order; });
        this.$tbody = $('> .t-grid-content > table > tbody', element);
        this.scrollable = this.$tbody.length > 0;
        if (!this.scrollable) {
            this.$tbody = $('> table > tbody', element);
            this.$header = $('> table > thead tr', element);
            this.$footer = $('> table > tfoot', element);
        } else {

            $('> .t-grid-content', element).tScrollable();

            this.$header = $('> .t-grid-header tr', element);
            this.$footer = $('> .t-grid-footer', element);
        }
        $(element).focusin(function () {
            hasFocus = true;
        });
        $(element).focusout(function () {
            hasFocus = false;
        });
        var grid = this;
        $(element).keyup(function (e) {
            var key = e.keyCode || e.which;
            if (key == 38)
                grid.selectRow(grid.rowIndex - 1);
            if (key == 40)
                grid.selectRow(grid.rowIndex + 1);
            if (e.ctrlKey) {
                if (key == 69)
                    grid.openFormForEdit();
                if (key == 78) 
                    Add_Record_To_GRid();
                if (key == 46 && grid.confirm && confirm(grid.confirm)) 
                    grid.removeCurenRecord();
                if (key == 46)
                    $(element).find('.t-state-selected .t-icon.t-delete').click();
                if (key === 34 && grid.currentPage > 1)
                    grid.pageTo(grid.currentPage - 1);
                var totalPages = grid.totalPages();
                if (key === 33 && grid.currentPage < totalPages)
                    grid.pageTo(grid.currentPage + 1);
                if (key === 35 && grid.currentPage != totalPages)
                    grid.pageTo(totalPages);
                if (key === 36 && grid.currentPage != 1)
                    grid.pageTo(1);
                if (key == 13)
                    $(element).find('.t-state-selected .t-icon.t-edit').click();
            }
            return false;
        });
        var flag = true;
        $(element).find('.t-grid-add').click(function () {
            grid.selectedObject = null;
            grid.addRecord();
        });
        if (this.pagingOnScroll) {
            $(element).find('.t-grid-content').scroll(function () {
                if ($(this).scrollTop() + $(this).innerHeight() == $(this)[0].scrollHeight) {
                    if (flag) {
                        if (grid.total > grid.currentPage * grid.pageSize) {
                            flag = false;
                            var obj = grid.getOtherKey();
                            obj['name'] = $(grid.element).attr('id');
                            obj['page'] = grid.currentPage + 1;
                            obj['size'] = grid.pageSize;
                            grid.showBusy();
                            $.telerik.post(grid.url('selectUrl'), obj, function (result) {
                                grid.hideBusy();
                                grid.currentPage += 1;
                                grid.updatePager();
                                grid.dataForScrollUpdate = $.merge(grid.dataForScrollUpdate, result.data);
                                grid.bindTo(grid.dataForScrollUpdate, grid);
                                flag = true;
                            });
                        }
                    }
                }
            });
        }
        this.$headerWrap = $('> .t-grid-header > .t-grid-header-wrap', element);
        this.$footerWrap = $('> .t-grid-footer > .t-grid-footer-wrap', element);
        var scrollables = this.$headerWrap.add(this.$footerWrap);
        $('> .t-grid-content', element).bind('scroll', function () {
            scrollables.scrollLeft(this.scrollLeft);
        });
        this.$tbody.delegate('.t-hierarchy-cell .t-plus, .t-hierarchy-cell .t-minus', 'click', $t.stopAll(function (e) {
            var $icon = $(e.target);
            var expanding = $icon.hasClass('t-plus');
            $icon.toggleClass('t-minus', expanding)
                .toggleClass('t-plus', !expanding);
            var $tr = $icon.closest('tr.t-master-row');
            if (this.detail && !$tr.next().hasClass('t-detail-row'))
                $(new $t.stringBuilder()
                        .cat('<tr class="t-detail-row">')
                        .rep('<td class="t-group-cell"></td>', $tr.find('.t-group-cell').length)
                        .cat('<td class="t-hierarchy-cell"></td>')
                        .cat('<td class="t-detail-cell" colspan="')
                        .cat(this.$header.find('th:not(.t-group-cell,.t-hierarchy-cell):visible').length)
                        .cat('">')
                        .cat(this.displayDetails(this.dataItem($tr)))
                        .cat('</td></tr>').string()).insertAfter($tr);

            $t.trigger(this.element, expanding ? 'detailViewExpand' : 'detailViewCollapse', { masterRow: $tr[0], detailRow: $tr.next('.t-detail-row')[0] });
            $tr.next().toggle(expanding);
        }, this));
        this.$pager = $('> .t-grid-pager .t-pager', element);
        var dropDown = new $t.dropDown({
            effects: $t.fx.slide.defaults(),
            onClick: $.proxy(function (e) {
                this.changePageSize($(e.item).text());
                dropDown.close();
            }, this)
        });
        dropDown.dataBind(options.pageSizesInDropDown || []);
        $(document.documentElement).bind('mousedown', function (e) {
            var element = dropDown.$element[0];
            if (!$.contains(element, e.target)) {
                dropDown.close();
            }
        });

        this.$pager.delegate('.t-state-disabled', 'click', $t.preventDefault)
                   .delegate('.t-link:not(.t-state-disabled)', 'mouseenter', $t.hover)
                   .delegate('.t-link:not(.t-state-disabled)', 'mouseleave', $t.leave)
                   .delegate('input[type=text]', 'keydown', $.proxy(this.pagerKeyDown, this))
                   .delegate('.t-page-size .t-dropdown-wrap', 'click', function () {
                       var a = $(this);
                       dropDown.open({
                           offset: a.offset(),
                           outerHeight: a.outerHeight(),
                           outerWidth: a.outerWidth(),
                           zIndex: $t.getElementZIndex(this)
                       });
                   });
        $('> .t-grid-pager', element).delegate('.t-refresh', 'click', $.proxy(this.refreshClick, this));

        $(element).delegate('.t-button', 'hover', $t.preventDefault);

        if (this.sort)
            this.$header.delegate('.t-link', 'hover', function () {
                //$(this).toggleClass('t-state-hover');
            });

        var nonSelectableRows = 'tr:not(.t-grouping-row,.t-detail-row,.t-no-data,:has(>.t-edit-container))';
        if (this.selectable) {
            var tbody = this.$tbody[0];
            this.$tbody.delegate(nonSelectableRows, 'mouseup', function (e) {
                if (this.parentNode == tbody) {
                    grid.rowClick(e);

                }
            })
            .delegate(nonSelectableRows, 'dblclick', function (e) {
                    grid.rowdblClick(e);
            })

            .delegate(nonSelectableRows, 'hover', function () {
                if (this.parentNode == tbody)
                    $(this).toggleClass('t-state-hover');
            });
        }
        if (this.isAjax()) {
            this.$pager.delegate('.t-link:not(.t-state-disabled)', 'click', $t.stop(this.pagerClick, this));
            if (this.sort)
                this.$header.delegate('.t-link', 'click', $t.stop(this.headerClick, this));
        }
        $(this.element).blur(function () {
            $(this).css('box-shadow', '');
        });
        this.initializeColumns();
        $t.bind(this, {
            rowDoubleClick: this.onRowDoubleClick,
            dataBound: this.onDataBound,
            rowDataBound: this.onRowDataBound,
            deleteRecord: this.onDelete,
        });
        if ($(element).closest('.t-HelpWindow').hasClass('t-HelpWindow')) {
            $(element).closest('.t-HelpWindow').data('tHelpWindow').grid = this;
        }
    }

    $t.grid.prototype = {
        updateState: function (options) {
            $.extend(this, options);
        },
        getColumns: function(index){
            return this.columns[index];
        },
        rowdblClick: function (e) {
            $('div[class="ali-par"]').css('display', 'none');
            var item = $('#newEditForm').data('tWindow');
            if ($(this.element).attr('id') == $('div[class="ali-par"]').find('.t-widget.t-grid').attr('id')) {
                var index = $(e.target).parent().find('tr').index(e.target);
                var str = "", selectedObject = this.getSelectedObject();
                if (this.displayFields)
                    str = selectedObject[this.displayFields];
                    str += ' ' + selectedObject[this.otherKeyName];
                
                $('#' + this.relatedControlId).data('tTextBox').value(str);
                var textBox = $('#' + this.relatedControlId).data('tTextBox');
                if (textBox) {
                    textBox.focus();
                    textBox.keyValue = selectedObject[this.otherKeyName];
                    textBox.UpdateContent();
                }
            }
            if (!item)
                throw 'wnodow با نام newEditForm وجود ندارد.';
            if (item.relatedControlId && item.isOpened == true) {
                var str = "";
                if (item.displayFields)
                    str = selectedObject[item.displayFields];
                str += ' ' + selectedObject[item.otherKeyName];
                $('#' + item.relatedControlId).data('tTextBox').value(str)
                item.close();
                var textBox = $('#' + item.relatedControlId).data('tTextBox')
                if (textBox != undefined) {
                    textBox.focus();
                    textBox.keyValue = selectedObject[item.otherKeyName]
                }
            }
            $t.trigger(this, 'rowDoubleClick');
            if ($(this.element).closest('.t-HelpWindow').attr('id')) {
                var win = $(this.element).closest('.t-HelpWindow').data('tHelpWindow');
                win.controlInit();
            }
            
        },
        selectRowKeyDown: function () {
            var item = $('#newEditForm').data('tWindow');
            if ($(this.element).closest('.ali-par').attr('class') == 'ali-par')
                $('#' + item.relatedControlId).data('tTextBox').focus();
        },
        setCurentPage: function(pageNumber){
            this.currentPage = pageNumber;
        },
        getAllSelectedObjects: function () {
            var self_ = this;
            var array = [];
            this.$tbody.find('.t-state-selected').each(function () {
                var index = self_.$tbody.find(this).index();
                array.push(self_.getObject(self_.$rows()[index]));
            });
            return array;
        },
        getSelectedObject: function () {
            var index = this.getIndex();
            if (index < 0)
                return null;
            var obj = this.getObject(this.$rows()[index]);
            for (var key in this.dataKeys) {
                if (!obj[key])
                    obj[key] = $t.getValueOfItem(key);
            }
            obj.name = this.id;
            
            return obj;
        },
        getOtherObject: function () {
            var obj = new Object();
            for (var key in this.dataKeys)
                if ($t.getValueOfItem(key))
                    obj[key] = $t.getValueOfItem(key);
            return obj;
        },
        remove: function (index) {
            if (index < this.$rows().length) {
                this.$rows().eq(index).remove();
                if (this.total == 1) {
                    this.dataBind([]);
                }
                this.total--;
                this.updatePager();
            }
        },
        getAllObjects: function () {
            var array = new Array();
            if (this.$rows().eq(0).attr('class') == 't-no-data')
                return array;
            for (var i = 0; i < this.$rows().length; i++) 
                array.push(this.getObject(this.$rows()[i]));
            return array;
        },
        addData: function (newData) {
            var oldData = this.getAllObjects();
            var temp = new Array();
            for (var i = 0; i < newData.length; i++) {
                var item = newData[i];
                var j = 0;
                for (var l = 0; l < oldData.length; l++) {
                    var old = oldData[l];
                    var k = 0, t = 0;
                    for (var key in this.dataKeys) {
                        t++;
                        if (item[key] == old[key])
                            k++;
                        else
                            break;
                    }
                    if (k == t)
                        break;
                    else
                        j++;
                }
                if (j == oldData.length)
                    temp.push(item);
            }
            for (var i = 0; i < temp.length; i++)
                oldData.push(temp[i]);
            this.total = oldData.length;
            this.dataBind(oldData);
        },
        getObject_: function (row) {
            var index = 0;
            var obj = new Object();
            $.grep(this.columns, function (c) {
                if (c.member) {
                    
                    obj[c.member] = row.find('td').eq(index).html();
                }
                index++;
            });
            return obj;
        },
        getObject: function (row) {
            var index = 0;
            var obj = new Object();
            $.grep(this.columns, function (c) {
                if (c.member) {
                    if (c.template) {
                        $(row.cells[index]).find('input').each(function () {
                            var txt = $(this).data('tTextBox');
                            if (txt)
                                obj[c.member] = txt.value();
                        });
                    } else {
                        if (c.type == 'Enum') {
                            if (row.cells[index].firstChild == null)
                                obj[c.member] = null;
                            else
                                obj[c.member] = row.cells[index].firstChild.id.substr(3);
                        }
                        else
                            if (c.type == 'Date') {
                                var member = c.member;
                                member = member.substr(0, member.length - 5);
                                obj[member] = new $.telerik.PersianDate_(row.cells[index].innerHTML);
                                obj[member].Date = row.cells[index].innerHTML;
                            }
                            else
                                if (c.type == 'Boolean')
                                    obj[c.member] = row.cells[index].innerHTML.indexOf('CHECKED') != -1;
                                else
                                    if (c.type == "Number")
                                        obj[c.member] = row.cells[index].innerHTML.replace(/\,/g, '');
                                    else
                                        obj[c.member] = row.cells[index].innerHTML;
                    }
                }
                index++;
            });
            return obj;
        },
        rollbackSelectedrowData: function () {
            var row = $(this.element).find('.t-state-selected')[0];
            var self_ = this;
            if (row) {
                var rowIndex = this.$tbody.find('tr').index(row);
                this.columns.forEach(function (col, colIndex) {
                    if (col.template && col.member) {
                        $(row.cells[colIndex]).find('input').each(function () {
                            var txt = $(this).data('tTextBox');
                            if (txt)
                                txt.value(self_.data[rowIndex][col.member]);
                        });
                    }
                });
            }
                
        },

        getTotal: function () {
            return this.total;
        },
        getIndex: function () {
            return this.$tbody.find('.t-state-selected').index();
        },
        rowClick: function (e) {
            var $target = $(e.target);
            //if (!$target.is(':button,a,:input,a>.t-icon')) {
            if (!$target.is('a>.t-icon')) {
                e.stopPropagation();
                var $tr = $target.closest('tr');
                if ($tr.hasClass('t-state-selected') && e.ctrlKey) {
                    $tr.removeClass('t-state-selected');
                } else {
                    if (this.selectionType != 'Multiple' || !e.ctrlKey)
                        $tr.siblings().removeClass('t-state-selected');
                    $tr.addClass('t-state-selected');
                    $row = $tr.find('t-state-selected');
                    var index = this.$rows().index($tr);
                    var obj = this.getObject($tr[0]);
                    for (key in this.dataKeys) {
                        if (!obj && obj[key]) {
                            obj[key] = $t.getValueOfItem(key);
                        }
                    }
                }
                
                if (!$row)
                    $row = $tr.find('t-state-selected');
                obj = $t.convertObject(obj);
                var tempData = gridRowBind(this, obj, $(this.element).find('.t-state-selected')[0]);
                if ($target.is('td'))
                    $t.trigger(this.element, 'rowSelect', tempData);
            }
        },
        getSelectedRow: function () {
            var row = $(this.element).find('.t-state-selected')[0];
            if (!row)
                return null;
            return gridRowBind(this, this.getObject(row), row);
        },
        $rows: function () {
            this.$tbody.find('> tr:not(.t-grouping-row,.t-detail-row)');
            return this.$tbody.find('> tr:not(.t-grouping-row,.t-detail-row)');
        },
        rows: function(){
            var array = [];
            var grid = this;
            var data = this.getAllObjects();
            this.$rows().each(function (index, row) {
                array.push(gridRowBind(grid, data[index], row));
            });
            return array;
        },
        expandRow: function (tr) {
            $(tr).find('> td .t-plus, > td .t-expand').click();
        },
        collapseRow: function (tr) {
            $(tr).find('> td .t-minus, > td .t-collapse').click();
        },
        selectRow: function (index) {
            if (index === null || index === undefined) {
                this.rowIndex = null;
                $(this.element).find('.t-state-selected').removeClass('t-state-selected');
            }
            else {
                var rows = $(this.element).find('.t-content').find('tr');
                if (rows.length > index && index >= 0) {
                    this.rowIndex = index;
                    $(this.element).find('.t-content').find('tr').eq(index).addClass('t-state-selected').siblings().removeClass('t-state-selected').end();
                }

            }
        },
        headerClick: function (e) {
            e.preventDefault();
            this.toggleOrder(this.$columns().index($(e.target).closest('th')));
            this.sort(this.sortExpr());
        },
        refreshClick: function (e, element) {
            if ($(element).is('.t-loading'))
                return;

            if (this.isAjax()) {
                e.preventDefault();
                this.ajaxRequest(this.getOtherKey());
            }
        },
        reLoad: function () {
            this.ajaxRequest(this.getOtherKey());
        },
        sort: function (orderBy) {
            this.orderBy = orderBy;
            this.ajaxRequest(this.getOtherKey());
        },
        getColumn: function(arg){
            var str = arg.toString();
            str = str.substring(str.indexOf('.') + 1, str.indexOf(';'));
            var column = null;
            this.Columns().forEach(function (col) {
                if (col.member == str)
                    column = col;
            });
            if (column == null)
                throw new Error('خطا: grid has not any column width member "' + str + '"');
            return column;
        },
        Columns: function () {
            this.columns.forEach(function (item, index) {
                if (item.order == 'asc')
                    item.orderType = 2;
                else
                    if (item.order == 'desc')
                        item.orderType = 3;
                    else
                        item.orderType = 1;
                item.index = index;
                switch (item.type) {
                    case 'Number':
                        item.columnType = 1;
                        break;
                    case 'String':
                        item.columnType = 2;
                        break;
                    case 'Enum':
                        item.columnType = 3;
                        break;
                    case 'Date':
                        item.columnType = 4;
                        break;
                    case 'Image':
                        item.columnType = 5;
                        break;
                    default:
                        item.columnType = null;
                }
                
            })
            var column = this.columns[0];
            return this.columns;
        }, 
        columnFromTitle: function (title) {
            title = $.trim(title);
            var result = $.grep(this.$columns(), function (th) {
                return $.trim($(th).text()) == title;
            })[0];
            if (result)
                return this.columns[this.$columns().index(result)];
            return $.grep(this.columns, function (c) { return c.title == title; })[0];
        },
        columnFromMember: function (member) {
            var column = $.grep(this.columns, function (c) { return c.member == member })[0];

            if (!column)
                column = $.grep(this.columns, function (c) {
                    var suffix = "." + c.member;
                    return member.substr(member.length - suffix.length) == suffix
                })[0];

            return column;
        },
        toggleOrder: function (column) {
            column = typeof column == 'number' ? this.columns[column] : column;

            var order = 'asc';

            if (column.order == 'asc')
                order = 'desc';
            else if (column.order == 'desc')
                order = null;

            column.order = order;

            var sortedIndex = $.inArray(column, this.sorted);

            if (this.sortMode == 'single' && sortedIndex < 0) {
                $.each(this.sorted, function () {
                    this.order = null;
                });
                this.sorted = [];
            }
            if (sortedIndex < 0 && order)
                this.sorted.push(column);

            if (!order)
                this.sorted.splice(sortedIndex, 1);
        },
        sortExpr: function () {
            return $.map(this.sorted, function (s) { return s.member + '-' + s.order; }).join('~');
        },
        getCurentPage: function(){
            return this.currentPage;
        },
        pagerKeyDown: function (e) {
            if (e.keyCode == 13) {
                var page = this.sanitizePage($(e.target).val());
                if (page != this.currentPage)
                    this.pageTo(page);
                else
                    $(e.target).val(page);
            }
        },
        isAjax: function () {
            return this.ajax || this.ws || this.onDataBinding;
        },
        getOtherKey: function () {
            if ($(this.element).closest('.ali-par').hasClass('ali-par'))
                return { value: $('#' + this.relatedControlId).getTextBox().value() };
            if (this.reportObject)
                return this.reportObject;
            var obj = new Object();
            $.extend(obj, this.selectedObject);
            $.extend(obj, this.tabStripObject);
            for (var key in this.dataKeys) {
                var value = $t.getValueOfItem(key);
                if (value)
                    obj[key] = value;
            }
            return obj;
        },
        focusToAggregateButton: function (index) {
            if (arguments.length == 0)
                index = 0;
            this.$tbody.find('.t-state-selected').first().find('.t-grid-addTab').eq(index).focus();
        },
        focusToDeleteButton: function(){
            this.$tbody.find('.t-state-selected').first().find('.t-grid-delete.t-button-icon.t-button-icon.t-button-bare').focus();
        },
        focusToEditButton: function(){
            this.$tbody.find('.t-state-selected').first().find('t-grid-edit.t-button-icon.t-button-icon.t-button-bare').focus();
        },
        url: function (which) {
            return (this.ajax || this.ws)[which];
        },
        pagerClick: function (e) {
            e.preventDefault();
            var $element = $(e.target).closest('.t-link');
            var page = this.currentPage;
            var pagerButton = $element.find('.t-icon');

            if (pagerButton.hasClass('t-arrow-next'))
                page++;
            else if (pagerButton.hasClass('t-arrow-last'))
                page = this.totalPages();
            else if (pagerButton.hasClass('t-arrow-prev'))
                page--;
            else if (pagerButton.hasClass('t-arrow-first'))
                page = 1;
            else {
                var linkText = $element.text();

                if (linkText == '...') {
                    var elementIndex = $element.parent().children().index($element);

                    if (elementIndex == 0)
                        page = parseInt($element.next().text()) - 1;
                    else
                        page = parseInt($element.prev().text()) + 1;
                } else {
                    page = parseInt(linkText);
                }
            }
            this.pageTo(isFinite(page) ? page : this.currentPage);
        },
        changePageSize: function (size) {
            var result = parseInt(size, 10);
            if (isNaN(result) || result < 1) {
                return this.pageSize;
            }
            result = Math.max(result, 1);
            this.pageSize = result;
            if (this.isAjax())
                this.ajaxRequest(this.getOtherKey());
            else 
                this.serverRequest();
        },
        pageTo: function (page) {
            this.currentPage = page;
            var copy = {};
            $.extend(copy, this.selectedObject);
            $.extend(copy, $t.getSearchObject());
            this.selectedObject = copy;
            this.rowIndex = -1;
            $(this.element).find('.t-grid-content').scrollTop(0);
            if (this.isAjax())
                this.ajaxRequest(this.getOtherKey());
            else
                this.serverRequest();
        },
        ajaxOptions: function (options) {
            var result = {
                type: 'POST',
                dataType: 'text', 
                dataFilter: function (data, dataType) {
                    return data.replace(rdate, 'new Date($1)');
                },
                error: function (error) {
                    $t.handelError(error);
                    return;
                },
                success: $.proxy(function (data, status, xhr) {
                    this.hideBusy();
                    try {
                        data = eval('(' + data + ')');
                    } catch (e) {
                        if (!$t.ajaxError(this.element, 'error', xhr, 'parseeror'))
                            throw new Error('Error! The requested URL did not return JSON.');
                        return;
                    }
                    data = data.d || data; 
                    if (options.hasErrors && options.hasErrors(data)) {
                        if (!$t.trigger(this.element, 'error', {
                            XMLHttpRequest: xhr,
                            textStatus: 'modelstateerror',
                            modelState: data.modelState
                        })) {
                            options.displayErrors(data);
                        }
                        return;
                    }
                    this.dataForScrollUpdate = data.data;
                    this.total = data.total || data.Total || 0;
                    this.aggregates = data.aggregates || {};
                    this.dataBind(data.data || data.Data);
                    if (this.selectionType == 'Multiple') {
                        //                        $('tbody input').bind('click', function () {
                        //                            if (this.checked == false)
                        //                                $('thead input:first').attr('checked', false);
                        //                            else {
                        //                                var allChecked = true;
                        //                                $('tbody input').each(function () {
                        //                                    if ($(this).attr('checked') == false)
                        //                                        allChecked = false;
                        //                                });
                        //                                $('thead input:first').attr('checked', allChecked);
                        //                            }
                        //                        });
                    }
                    else
                        if (this.selectionType == 'Single') {
                            $('tbody input').bind('click', function () {
                                $('tbody input').attr('checked', false);
                                $(this).attr('checked', true);
                            });
                        }
                }, this)
            };
            $.extend(result, options);
            var state = this.ws ? result.data.state = {} : result.data;
            state[this.queryString.page] = this.currentPage;
            state[this.queryString.size] = this.pageSize;
            state['name'] = $(this.element).attr('id');
            if ($t.isComplexType(result.data)) {
                result.data = $t.toJson(result.data);
                result.contentType = 'application/json; charset=utf-8';
            }
            return result;
        },
        getKeyValues: function (valueField) {
            var keys = new Array();
            for (var key in this.dataKeys)
                keys.push(key);
            if (keys.length == 0) {
                throw new Error("خطا:Key not set");
                return;
            }
            if (!valueField) {
                throw new Error("خطا:ValueField is invalid.");
                return;
            }
            var objects = this.getAllObjects();

            var result = new Array();
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                var item = new Object();
                if (!obj[valueField]) {
                    throw new Error("خطا:value field is invalid");
                    return;
                }

                item.value = obj[valueField];

                if (keys.length > 1) {
                    item.key = new Object();
                    for (var key in keys)
                        item.key[key] = obj[key];
                }
                else
                    item.key = obj[keys[0]];
                result.push(item);
            }
            return result;
        },
        showBusy: function () {
            var $element = $(this.element);
            $element.find('.t-loading').remove();
            $element.append('<div class="t-loading"><div></div></div>');
            var $content = $element.find('.t-grid-content');
            if (!$content.hasClass('t-grid-content'))
                $content = $element.find('table tbody');
            else
                $content.find('.t-no-data').css('height', 'auto');
            $element.find('.t-loading').css('top', $content.position().top)
                .css('height', $content.height());
            //this.busyTimeout = setTimeout($.proxy(function () {

            //    //$('> .t-grid-pager .t-status .t-icon', this.element).addClass('t-loading');
            //}, this), 5);
        },
        hideBusy: function () {
            //clearTimeout(this.busyTimeout);
            $(this.element).find('.t-loading').remove();

            //$('> .t-grid-pager .t-status .t-icon', this.element).removeClass('t-loading');
        },
        serverRequest: function () {
            location.href = $t.formatString(unescape(this.urlFormat),
                    this.currentPage, this.orderBy || '~', this.groupBy || '~', encodeURIComponent(this.filterBy) || '~', this.pageSize || '~');
        },
        ajaxRequest: function (additionalData) {
            var e = {
                page: this.currentPage,
                sortedColumns: this.sorted,
                filteredColumns: $.grep(this.columns, function (column) {
                    return column.filters;
                })
            };
            $t.trigger(this.element, 'dataBinding', e);
            if (!this.ajax && !this.ws)
                return;
            if (this.orderBy)
                additionalData.gridOrderBy = this.orderBy;
            this.showBusy();

            $.ajax(this.ajaxOptions({
                data: $.extend({}, e.data, additionalData),
                url: this.url('selectUrl')
            }));
        },
        valueFor: function (column) {
            if (column.type == 'Date')
                return new Function('data', 'var value = data.' + column.member +
                    '; if (!value) return null; return value instanceof Date? value : new Date(parseInt(value.replace(/\\/Date\\((.*?)\\)\\//, "$1")));');

            return new Function('data', 'return data' + (column.member ? '.' + column.member : '') + ';');
        },
        displayFor: function (column) {
            var localization = this.localization;
            var grid = this;
            if (column.commands) {
                var html = $.map(column.commands, function (command) {
                    if (command.editFormUrl != undefined)
                        grid.editFormUrl = command.editFormUrl;
                    if (command.editFormWidth != undefined)
                        grid.editFormWidth = command.editFormWidth;
                    if (command.editFormHeight != undefined)
                        grid.editFormHeight = command.editFormHeight;
                    if (command.confirm != undefined)
                        grid.confirm = command.confirm;
                    var builder = $t.grid.ButtonBuilder.create($.extend({ text: localization[command.name] }, command));
                    return builder.build();
                }).join('');
                return function () {
                    return html;
                };
            }
            if (!column.template) {
                var result = column.value || function () { return "" };
                if (column.format || column.type == 'Date')
                    result = function (data) {
                        var value = column.value(data);
                        return value == null ? '' : $t.formatString(column.format || '{0:G}', value);
                    };

                return column.encoded === false ? result : function (data) { return encode(result(data)) };
            }
            return template(column.template);
        },
        insertFor: function (column) {
            return this.displayFor(column);
        },
        editFor: function (column) {
            return this.displayFor(column);
        },
        initializeColumns: function () {
            $.each(this.columns, $.proxy(function (_, column) {
                if (column.member !== undefined) 
                    column.value = this.valueFor(column);
                else 
                    column.readonly = true;

                column.insert = this.insertFor(column);

                column.edit = this.editFor(column);
                column.display = this.displayFor(column);

                if (column.footerTemplate)
                    column.footer = template(column.footerTemplate);

                if (column.groupFooterTemplate) {
                    this.showGroupFooter = true;
                    column.groupFooter = template(column.groupFooterTemplate);
                }

                column.groupHeader = template('<#= Title #>: <#= Key #>');

                if (column.groupHeaderTemplate)
                    column.groupHeader = template(column.groupHeaderTemplate);                    
            }, this));
            if (this.detail)
                this.displayDetails = template(this.detail.template);
        },
        bindData: function (data, html, groups, gridObject) {
            Array.prototype.push.apply(this.data, data);
            var dataLength = Math.min(this.pageSize, data.length);
            dataLength = this.pageSize && !this.pagingOnScroll ? dataLength : data.length;
            if ($.browser.msie)
                $(this.element).find('.t-grid-content colgroup:first col').css('display', '');
            var obj = new Object();
            for (var rowIndex = 0; rowIndex < dataLength; rowIndex++) {
                var className = $.trim((this.detail ? 't-master-row' : '') + (rowIndex % 2 == 1 ? ' t-alt' : ''));
                if (rowIndex == gridObject.rowIndex)
                    className = 't-state-selected';
                if (className)
                    html.cat('<tr class="')
                        .cat(className)
                        .cat('">')
                else
                    html.cat('<tr>');
               
                html.rep('<td class="t-group-cell"></td>', groups)
                    .catIf('<td class="t-hierarchy-cell"><a class="t-icon t-plus" href="javascript:void(0)" /></td>', this.detail);
                for (var i = 0, len = this.columns.length; i < len; i++) {
                    var column = this.columns[i];
                    if (column.member) {
                        column.propertyName = column.member.replace(/\./g, '_');
                        var displayItem = encode(data[rowIndex][column.propertyName]);
                        if (column.format)
                            displayItem = $t.formatString(column.format || '{0:G}', displayItem);
                        if (column.type == 'Enum')
                            displayItem = data[rowIndex][column.propertyName];
                        if (column.type == 'Date')
                            displayItem = data[rowIndex][column.propertyName];
                        if (column.type == 'Boolean') {
                            displayItem = "<input disabled='disabled' type='checkbox'";
                            if (data[rowIndex][column.propertyName])
                                displayItem += 'checked=checked';
                            displayItem += '/>';
                        }
                        if (column.template) 
                            displayItem = column.display(data[rowIndex]);
                        
                        if (rowIndex == gridObject.rowIndex) {
                            if (column.type == 'Enum' && displayItem)
                                obj[column.member] = $(displayItem).attr('id').substr(3);
                            else
                                if (column.type == 'Date')
                                    obj[column.member] = displayItem;
                                else
                                    if (column.type == 'Boolean')
                                        obj[column.member] = data[rowIndex];
                                    else
                                        obj[column.member] = displayItem;
                        }
                    }
                    else {
                        if (column.template) {
                            displayItem = column.display(column.template);
                        }
                        else
                            displayItem = column.edit();
                    }
                    
                    html.cat('<td data-title="' + column.title + '"')
                        .cat(column.attr).catIf(' class="t-last"', i == len - 1)
                        .cat('>').cat(displayItem).cat('</td>');
                }
                html.cat('</tr>');
            }
            for (key in gridObject.dataKeys)
                if (!obj[key]) {
                    var item = $t.getValueOfItem(gridObject.fsId + '_' + key);
                    if (item)
                        obj[key] = item;
                }
        },
        normalizeColumns: function () {
            // empty - overridden in telerik.grid.grouping.js
        },
        dataItem: function (tr) {
            return this.data[this.$tbody.find('> tr:not(.t-grouping-row,.t-detail-row,.t-grid-new-row)').index($(tr))];
        },
        bindTo: function (data, gridObject) {
            
            var html = new $t.stringBuilder();
            var colspan = this.groups.length + this.columns.length + (this.detail ? 1 : 0);
            if (data && data.length > 0) {

                this.normalizeColumns(colspan);
                if (typeof data[0].HasSubgroups != 'undefined')
                    for (var i = 0, l = data.length; i < l; i++)
                        this.bindGroup(data[i], colspan, html, 0);
                else
                    this.bindData(data, html, null, gridObject);
            }
            else
                html.cat("<tr class='t-no-data'>").cat("<td colspan='").cat(colspan).cat("'>");
            this.$tbody.html(html.string());
            if (this.selectable)
                this.$tbody.find('tr').css('cursor', 'pointer');
            var self_ = this;
            this.$tbody.find('input').each(function () {
                var txt = $(this).data('tTextBox');
                
                if (txt) {
                    var colIndex = $(this).closest('tr').find('td').index($(this).closest('td'));
                    var member = self_.columns[colIndex].member;
                    if (member) {
                        $(this).unbind('keyup.updateModel__');
                        $(this).bind('keyup.updateModel__', function () {
                            var value = txt.value();
                            var index = self_.$tbody.find('tr').index($(this).closest('tr'));
                            //self_.data[index][member] = value;
                        });
                    }
                }
            });
            var item = $('#newEditForm').data('tWindow');
            if (item && item.relatedControlId) {
                this.$tbody.delegate('tr', 'click', $.proxy(this.selectRowKeyDown, this));
            }
            var rows = jQuery.grep(this.$tbody[0].rows, function (row) {
                return !$(row).hasClass('t-grouping-row');
            });

            var allData = new Array();
            for (var i = 0, l = this.data.length; i < l; i++) {
                var data = this.data[i];
                var obj = new Object();
                for (var j = 0; j < this.columns.length; j++) {
                    var column = this.columns[j];
                    var member = column.member;
                    if (member){
                        member = column.member.replace(/\./g, '_');
                        switch (column.type) {
                            case 'Enum':
                                if (data[member])
                                    obj[column.member] = parseInt(data[member].split("'>")[0].substr(13));
                                break;
                            case 'Date':
                                var tempmember = member.substr(0 , member.length - 5);
                                if (data[member])
                                    obj[tempmember] = new $.telerik.PersianDate_(data[member]);
                                break;
                            default:
                                obj[column.member] = data[member];
                        }
                    }
                }
                for (var key in data)
                    if (obj[key] === undefined)
                        obj[key] = data[key];
                obj = $t.convertObject(obj);
                allData[i] = obj;
                var gridRow = gridRowBind(this, obj, rows[i]);
                $t.trigger(this.element, 'rowDataBound', gridRow);
            }
            $t.trigger(this.element, 'dataBound', allData);
            var grid = this;
            $.each(this.columns, function (index) {
                if (this.addTabUrl) {
                    grid.$tbody.find('tr').each(function () {
                        $(this).find('td').eq(index).find('a').click(function () {
                            if ($(this).attr('disabled') === 'disabled')
                                return;
                            grid.$tbody.find('tr').removeClass('t-state-hover');
                            var rowIndex = $(this).closest('tbody').find('tr').index($(this).closest('tr'));
                            grid.selectRow(rowIndex);
                            var obj = grid.getSelectedObject();
                            $t.addTab(grid.columns[index].addTabUrl, obj, grid.columns[index].title);
                        });
                    });
                }
            });
        },
        gridModelBind: function(model){
            this.currentPage = model.CurrentPage;
            this.total = model.Total;
            this.rowIndex = model.RowIndex;
            this.dataBind(model.Data);
        },
        post: function (url, obj) {
            this.update(url, obj);
        },
        insert: function (url, obj) {
            this.update(url, obj);
        },
        update: function (url, obj) {
            var win = $.telerik.getWindow();
            var name = $(this.element).attr('id');
            var grid = this;
            if (win.isOpened && !obj) {
                obj = win.getObject();
                for (var key in obj)
                    if (obj[key] && obj[key].Date)
                        delete obj[key];
                
                if (win.validateElements()) {
                    obj.name = name;
                    var search = $t.getSearchObject();
                    $.telerik.post(url, { child: obj, search: search }, function (result) {
                        $.telerik.gridsDataBind(result);
                        $t.trigger(grid.element, 'updated');
                        win.close();
                    });
                }
            } else {
                if (!obj)
                    obj = this.getSelectedObject();
                $.telerik.post(url, { child: obj, search: $t.getSearchObject() }, function (result) {
                    $.telerik.gridsDataBind(result);
                    $t.trigger(grid.element, 'updated');
                });
            }
        },
        updatePager: function () {
            var totalPages = this.totalPages(this.total);
            var currentPage = this.currentPage;
            var pageSize = this.pageSize;
            if (currentPage > 100)
                this.$pager.addClass('t-small');
            else
                this.$pager.removeClass('t-small');
            // nextPrevious
            // work-around for weird issue in IE, when using comma-based selector
            this.$pager.find('.t-arrow-next').parent().add(this.$pager.find('.t-arrow-last').parent())
	            .toggleClass('t-state-disabled', currentPage >= totalPages)
	            .removeClass('t-state-hover');

            this.$pager.find('.t-arrow-prev').parent().add(this.$pager.find('.t-arrow-first').parent())
	            .toggleClass('t-state-disabled', currentPage == 1)
	            .removeClass('t-state-hover');

            var localization = this.localization;
            // pageInput
            this.$pager.find('.t-page-i-of-n').each(function () {
                this.innerHTML = new $t.stringBuilder()
                                       .cat(localization.page)
                                       .cat('<input type="text" value="')
                                       .cat(currentPage)
                                       .cat('" /> ')
                                       .cat($t.formatString(localization.pageOf, totalPages))
                                       .string();
            });

            this.$pager.find('.t-page-size').each(function () {
                var html = '<div style="width: 50px;" class="t-dropdown t-header">' +
                             '<div class="t-dropdown-wrap t-state-default"><span class="t-input">' + pageSize + '</span>' +
                                '<span class="t-select"><span class="t-icon t-arrow-down">select</span></span>' +
                             '</div>' +
                           '</div>';
                this.innerHTML = html;
            });

            // numeric
            this.$pager.find('.t-numeric').each($.proxy(function (index, element) {
                this.numericPager(element, currentPage, totalPages);
            }, this));

            // status
            this.$pager.parent()
                       .find('.t-status-text')
                       .text($t.formatString(localization.displayingItems,
                            this.firstItemInPage(),
	                        this.lastItemInPage(),
	                        this.total));
        },
        bindRowClick: function () {
            $(this.element).find('.t-content tr').bind(function () {
                var index = $(this.element).find('.t-content tr').index(this);
                alert(index);
            });
        },
        removeCurenRecord: function () {
            var obj = this.getSelectedObject();
            if (obj == null)
                alert('لطفا یک ردیف را انتخاب نمایید.');
            else {
                url = $t.getUrlQueryString(this.url('deleteUrl'), this.id);
                $t.post(url, obj, function (result) {
                    var res = $t.gridsDataBind(result);
                    if (res != false)
                        $t.clearSearchControl();
                });
            }
        },
        numericPager: function (pagerElement, currentPage, totalPages) {
            var numericLinkSize = 10;
            if (this.buttonCount)
                numericLinkSize = this.buttonCount;
            var numericStart = 1;
            if (currentPage > numericLinkSize) {
                var reminder = (currentPage % numericLinkSize);
                numericStart = (reminder == 0) ? (currentPage - numericLinkSize) + 1 : (currentPage - reminder) + 1;
            }
            var numericEnd = (numericStart + numericLinkSize) - 1;
            numericEnd = Math.min(numericEnd, totalPages);
            var pagerHtml = new $t.stringBuilder();
            if (numericStart > 1)
                pagerHtml.cat('<a class="t-link">...</a>');
            for (var page = numericStart; page <= numericEnd; page++) {
                if (page == currentPage) {
                    pagerHtml.cat('<span class="t-state-active">')
                        .cat(page)
                        .cat('</span>');
                } else {
                    pagerHtml.cat('<a class="t-link">')
	                .cat(page)
	                .cat('</a>');
                }
            }

            if (numericEnd < totalPages)
                pagerHtml.cat('<a class="t-link">...</a>');

            pagerElement.innerHTML = pagerHtml.string();
        },
        $columns: function () {
            return this.$header.find('th:not(.t-hierarchy-cell,.t-group-cell)');
        },
        updateSorting: function () {
            this.sorted = [];
            $.each(this.orderBy.split('~'), $.proxy(function (_, expr) {
                var memberAndOrder = expr.split('-');
                var column = this.columnFromMember(memberAndOrder[0]);
                if (column) {
                    column.order = memberAndOrder[1];
                    this.sorted.push(column);
                }
            }, this));

            this.$columns().each($.proxy(function (i, header) {
                var direction = this.columns[i].order;
                var $link = $(header).children('.t-link');
                var $icon = $link.children('.t-icon');

                if (!direction) {
                    $icon.hide();
                } else {
                    if ($icon.length == 0)
                        $icon = $('<span class="t-icon"/>').appendTo($link);

                    $icon.toggleClass('t-arrow-up', direction == 'asc')
                        .toggleClass('t-arrow-down', direction == 'desc')
                        .html('(' + (direction == 'asc' ? this.localization.sortedAsc : this.localization.sortedDesc) + ')')
                        .show();
                }
            }, this));
        },
        sanitizePage: function (value) {
            var result = parseInt(value, 10);
            if (isNaN(result) || result < 1)
                return this.currentPage;
            return Math.min(result, this.totalPages());
        },
        totalPages: function () {
            return Math.ceil(this.total / this.pageSize);
        },
        firstItemInPage: function () {
            return this.total > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
        },
        lastItemInPage: function () {
            return Math.min(this.currentPage * this.pageSize, this.total);
        },
        addRecord: function () {
            var obj = new Object();
            $.extend(obj, this.relatedObject);
            for (key in this.dataKeys)
                obj[key] = $t.getValueOfItem(key);
            if (this.openTab) {
                var myObj = new Object();
                for (var key in this.dataKeys)
                    if (obj[key] && obj[key] != '')
                        myObj[key] = obj[key];
                $t.addTab(this.editFormUrl, myObj, "Hokm", this.openTab, this.onOpenTab);
                return;
            }
            var win = $.telerik.getWindow();
            win.onSave = this.onSave;
            win.onPostData = this.onPostData;
            win.onSubmitChanges = this.onSubmitChanges;
            if (!$(this.element).closest('.t-HelpWindow').hasClass('t-HelpWindow'))
                win.gridName = this.id;
            win.relatedControlId = undefined;
            win.url = this.url('insertUrl');
            win.type = "Addd";
            win.selectedObject = obj;
            win.formContentUrl = this.editFormUrl;
            win.size(this.editFormWidth, this.editFormHeight);
            win.center();
            win.title("ثبت " + this.title);
            win.open();
        },
        focus: function () {
            $(this.element).focus();
        },
        openFormForEdit: function(){
            this.rowIndex = this.getIndex();
            var obj = this.getSelectedObject();
            if (this.openTab != undefined) {
                var myObj = new Object();
                for (var key in this.dataKeys) {
                    if (obj[key] && obj[key] != '')
                        myObj[key] = obj[key];
                }
                $t.addTab(this.editFormUrl, myObj, "Hokm", this.openTab, this.onOpenTab);
                return;
            }
            var win = $.telerik.getWindow();
            win.relatedControlId = undefined;
            win.url = this.url('updateUrl');
            win.title('ویرایش ' + this.title);
            win.type = "Edit";
            win.gridName = this.id;
            win.selectedObject = obj;
            win.formContentUrl = this.editFormUrl;
            win.advanceSearchUrl = this.editFormUrl;
            win.size(this.editFormWidth, this.editFormHeight);
            win.center();
            win.open();
        },
        dataBind: function (data) {
            this.data = [];
            this.bindTo(data, this);
            //if (!$(this.element).hasClass('t-bootstarp1')) {
            //    enableBootstrap(this.element, null, $(this.element).find('table').outerWidth());
            //}
            $tbl = $(this.element).find('.t-grid-content table');
            $content = $(this.element).find('.t-grid-content');
            var height = $content.height() - $tbl.height() - 1;
            //if (height > 0) {
            //    if ($(this.element).find('.t-grid-content').find('.t-temp').hasClass('t-temp'))
            //        $(this.element).find('.t-grid-content').find('.t-temp').remove();
            //    $(this.element).find('.t-grid-content').append('<div class="t-temp" style=";border-left:1px solid #d5d5d5;"></div>');
            //    $(this.element).find('.t-grid-content div').last().height(height - 1);
            //}
            //$(this.element).find('.t-grid-content div').width($tbl.outerWidth() - 1);
            this.bindFooter();
            var grid = this;
            this.updatePager();
            this.updateSorting();
            if (this.selectionType == 'Multiple') 
                this.$header.find('input').attr("checked", false);
            this.$rows().find('a.t-button').each(function (q) {
                if ($t.startWith('t-button t-grid-delete', $(this).attr('class'))) {
                    $(this).click(function (e) {
                        $(this).closest('tr').addClass('t-state-selected').siblings().removeClass('t-state-selected').end();
                        if (grid.onDelete && grid.onDelete.call(grid.element, grid.getSelectedObject()) == false)
                            return;
                        if (grid.confirm) {
                            $t.confirm(grid.confirm, function () {
                                grid.removeCurenRecord();
                            });
                        }
                    });
                }
                else if ($t.startWith('t-button t-grid-edit', $(this).attr('class'))) {
                    $(this).click(function () {
                        $(this).closest('tr').addClass('t-state-selected').siblings().removeClass('t-state-selected').end();
                        grid.openFormForEdit();
                    });
                }
            });
            $t.trigger(this.element, 'repaint');
            if (this.selectionType == 'Multiple') {
                var grid = this;
                this.$header.find('input').bind('click', function () {
                    grid.$tbody.find('input').attr("checked", $(this).attr('checked') == 'checked');
                });
                this.$tbody.find('input').click(function () {
                    if ($(this).attr('checked') == false)
                        grid.$header.find('input').attr('checked', false);
                    else {
                        var checkedAll = true;
                        grid.$tbody.find('input').each(function () {
                            if ($(this).attr('checked') != 'checked') {
                                checkedAll = false;
                                return;
                            }
                        });
                        grid.$header.find('input').attr('checked', checkedAll);
                    }
                });
            }
        },
        bindFooter: function () {
            var $footerCells = this.$footer.find('td:not(.t-group-cell,.t-hierarchy-cell)');
            var aggregates = this.aggregates;

            $.each(this.columns, function (index) {
                if (this.footer)
                    $footerCells.eq(index).html(this.footer(aggregates[this.member]));
            });
        },
        rebind: function (args) {
            this.sorted = [];
            this.orderBy = '';
            this.filterBy = '';
            this.currentPage = 1;

            $.each(this.columns, function () {
                this.order = null;
                this.filters = null;
            });

            $('.t-filter-options', this.element)
                .find('input[type="text"], select')
                .val('')
                .removeClass('t-state-error')
                .end()
                .find('div.t-formatted-value')
                .html('');

            $('.t-grid-filter', this.element)
                .removeClass('t-active-filter');
            this.ajaxRequest(this.getOtherKey());
        }
    }

    $t.grid.ButtonBuilder = function (button) {
        this.classNames = ['t-button', 't-grid-' + button.name];

        this.content = function () {
            return button.text;
        }

        this.build = function (type) {
            var str = '';
            if (button.name == 'addTab')
                str = '<div style="margin:0 auto;width:34px">';
            str += '<a tabindex="-1" href="javascript:void(0)" class="' + this.classNames.join(' ') + '" ' + (button.attr ? button.attr : '') + '>' + this.content() + '</a>';
            if (button.name == 'addTab')
                str += '</div>';
            return str;
        }
    }

    $t.grid.ButtonBuilder.create = function (button) {
        return new (buttonBuilderTypes[button.buttonType])(button);
    }

    function sprite(name, imageAttr) {
        return '<span class="t-icon t-' + name + '"' + (imageAttr ? imageAttr : '') + '>' + '</span>'
    }

    $t.grid.ImageButtonBuilder = function (button) {
        $t.grid.ButtonBuilder.call(this, button);

        this.classNames.push('t-button-icon');

        this.content = function () {
            return sprite(button.name, button.imageAttr);
        }
    }

    $t.grid.ImageTextButtonBuilder = function (button) {
        $t.grid.ButtonBuilder.call(this, button);

        this.classNames.push('t-button-icontext');

        this.content = function () {
            return '<span class="t-icon t-' + button.name + '"' + (button.imageAttr ? button.imageAttr : '') + '>' +
                   '</span>' + button.text;
        }
    }

    $t.grid.BareImageButtonBuilder = function (button, localization) {
        $t.grid.ImageButtonBuilder.call(this, button, localization);
        this.classNames.push('t-button-icon', 't-button-bare');
    }

    var buttonBuilderTypes = {
        Text: $t.grid.ButtonBuilder,
        ImageAndText: $t.grid.ImageTextButtonBuilder,
        Image: $t.grid.ImageButtonBuilder,
        BareImage: $t.grid.BareImageButtonBuilder
    };

    $.fn.tGrid = function (options) {
        var obj = Array();
        //if (!$('#' + this.id).closest('.t-HelpWindow').attr('id') && !$('#' + this.id).parents('div[class="ali-par"]').attr('class') && !$('#newEditForm .t-grid').attr('id')) {
        //    if (len == obj.length)
        //        obj[len] = new Object();
        //    obj[len].id = this.id;
        //}
        //alert('4');
        var q = $t.create(this, {
            name: 'tGrid',
            init: function (element, options) {
                return new $t.grid(element, options);
            },
            options: options,
            success: function (grid) {
                $(grid.element).bind('load', grid.onLoad)
                $(grid.element).trigger('load');
                if (grid.$tbody.find('tr.t-no-data').length && grid.loadOnReady != false) {
                    setTimeout($.proxy(function () {
                        var data = grid.getOtherKey();
                        $.extend(data, $t.getSearchObject());
                        grid.ajaxRequest(data);
                    }, this));
                }
            }
        });
        return q;
    }

    // default options

    $.fn.tGrid.defaults = {

        columns: [],
        datakeys: null,
        tempSelectedObject: null,
        plugins: [],
        id: null,
        currentPage: 1,
        pageSize: 10,
        rowIndex: -1,
        localization: {
            noRecords: 'هیچ رکوردی برای نمایش وجود ندارد.',
            addTab: '...',
            pageOf: 'of {0}',
            displayingItems: ' {0}-{1} از {2} ردیف',
            edit: 'Edit'
        },
        selectionType: 'None',
        queryString: {
            page: 'page',
            size: 'size',
            orderBy: 'orderBy'
        }
    };
})(jQuery);
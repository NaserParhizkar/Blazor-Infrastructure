(function ($) {
    var $t = $.telerik,
        replaceUrlRegExp = /{0:?/,
        dateFormatRegExp = /{0:?(\S|\s)*}/;

    function defineViewedMonth(selectedValue, minValue, maxValue) {
        var today = new $t.datetime();
        if (selectedValue) 
            today = new $t.datetime(selectedValue);
        if (minValue > today.value) 
            today = new $t.datetime(minValue);
        else
            if (maxValue < today.value) 
                today = new $t.datetime(maxValue);
        return $t.datetime.firstDayOfMonth(today);
    }

    $.extend($t, {
        calendar: function (element, options) {
            this.element = element;

            $.extend(this, options);
            var minDate = new $t.datetime(this.minDate);
            var maxDate = new $t.datetime(this.maxDate);

            this.currentView = $t.calendar.views[0];
            this.viewedMonth = defineViewedMonth(this.selectedDate, this.minDate, this.maxDate);
            var header = new $t.stringBuilder()
                         .cat('<a href="#" class="t-link t-nav-prev ')
                         .catIf('t-state-disabled', this.currentView.compare(this.viewedMonth, minDate, false) <= 0)
                         .cat('">')
			             .cat('<span class="t-icon t-arrow-prev"></span></a><a href="#" class="t-link t-nav-fast">')
			             .cat(this.currentView.title(this.viewedMonth, this.pDate, this.PViewdMonth))
			             .cat('</a>')
			             .cat('<a href="#" class="t-link t-nav-next ')
                         .catIf('t-state-disabled', this.currentView.compare(this.viewedMonth, maxDate, true) >= 0)
                         .cat('"><span class="t-icon t-arrow-next"></span></a>');

            $('.t-header', this.element).html(header.string());
            /* header */
            //$('.t-nav-next:not(.t-state-disabled)', element)
			//    .live('click', $.proxy(this.navigateToFuture, this));

            //$('.t-nav-prev:not(.t-state-disabled)', element)
			//    .live('click', $.proxy(this.navigateToPast, this));

            //$('.t-nav-fast:not(.t-state-disabled)', element)
			//    .live('click', $.proxy(this.navigateUp, this));

            //$('.t-link.t-state-disabled', element)
			//    .live('click', $t.preventDefault);
            //$('td:not(.t-state-disabled):has(.t-link)', element)
			//	.bind('mouseenter', $t.hover)
			//    .bind('mouseleave', $t.leave)
			//    .bind('click', $.proxy(this.navigateDown, this));
            $t.bind(this, {
                change: this.onChange,
                load: this.onLoad
            });
        }
    });

    $t.calendar.prototype = {
        stopAnimation: false, // used by tests

        updateSelection: function () {
            var firstDayOfMonth = $t.datetime.firstDayOfMonth(this.viewedMonth).toDate();
            var lastDayOfMonth = new $t.datetime(firstDayOfMonth).date(32).date(0).toDate();
            if (this.selectedDate === null || !$t.calendar.isInRange(this.selectedDate, firstDayOfMonth, lastDayOfMonth)) {
                var viewedMonth = defineViewedMonth(this.selectedDate, this.minDate, this.maxDate);
                this.goToView(0, viewedMonth, null);
            }
            var me = this;
            var days = $('.t-content td:not(.t-other-month)', this.element).removeClass('t-state-selected');
            if (this.pDate !== null) {
                var day = this.pDate.Day;
                days.filter(function () {
                    return (parseInt($(this).text(), 10) == day);
                }).addClass('t-state-selected');
            }
        },

        value: function () {
            if (arguments.length == 0)
                return this.selectedDate;
            if (arguments.length == 1)
                this.selectedDate = arguments[0] === null ? null : new Date(arguments[0].value ? arguments[0].value : arguments[0]);
            else if (arguments.length > 1)
                this.selectedDate = new Date(arguments[0], arguments[1], arguments[2]);
            this.updateSelection();
            return this;
        },

        overlay: function (show) {
            if (!show)
                return $('.t-overlay', this.element).remove();
            $('<div/>')
            addClass('t-overlay')
		        .css({
		            opacity: 0,
		            width: this.element.offsetWidth,
		            height: this.element.offsetHeight,
		            position: 'absolute',
		            top: 0,
		            left: 0,
		            zIndex: 3,
		            backgroundColor: '#fff'
		        }).appendTo(this.element);
        },

        goToView: function (viewIndex, viewedMonth, pDate) {
            if (viewIndex < 0 || $t.calendar.views.length <= viewIndex || pDate == null)
                return;
            var minDate = new $t.datetime(this.minDate);
            var maxDate = new $t.datetime(this.maxDate);
            this.pDate = pDate;
            if (typeof viewedMonth != 'undefined') {
                viewedMonth = viewedMonth.value ? viewedMonth : new $t.datetime(viewedMonth);
                this.viewedMonth = $t.datetime.firstDayOfMonth(viewedMonth);
            }
            this.currentView = $t.calendar.views[viewIndex];
            $('.t-nav-fast', this.element)
                .html(this.currentView.title(viewedMonth, pDate, this.PViewdMonth))
                .toggleClass('t-state-disabled', viewIndex == $t.calendar.views.length - 1);
            $('.t-content', this.element)
                .html(this.currentView.bodyP(this.PViewdMonth, pDate, this.minPDate, this.maxPDate))
                .toggleClass('t-meta-view', viewIndex == 1 || viewIndex == 2);
            $('.t-nav-fast:not(.t-state-disabled)', this.element)
                .bind('click', $.proxy(this.navigateUp, this));
            $('td:not(.t-state-disabled):has(.t-link)', this.element)
				.bind('mouseenter', $t.hover)
			    .bind('mouseleave', $t.leave)
			    .bind('click', $.proxy(this.navigateDown, this));
            return this;
        },

        navigateVertically: function (viewIndex, viewedMonth, plunge, target, PViewdMonth) {
            
            viewedMonth = new $t.datetime(viewedMonth);
            this.viewedMonth = $t.datetime.firstDayOfMonth(viewedMonth);
            this.currentView = $t.calendar.views[viewIndex];
            //this.overlay(true);
            var minDate = new $t.datetime(this.minDate);
            var maxDate = new $t.datetime(this.maxDate);

            var oldView = $('.t-content', this.element);
            var oldViewWidth = oldView.outerWidth();
            var oldViewHeight = oldView.outerHeight();
            var oldViewFontSize = oldView.css('font-size');
            var oldViewLineHeight = oldView.css('line-height');

            if (this.PViewdMonth == null) {
                this.PViewdMonth = new $t.PersianDate_();
                this.PViewdMonth.setDate(this.pDate);
            }
            if (oldViewLineHeight === 'normal') oldViewLineHeight = parseInt(oldViewFontSize) * 1.5;

            oldView.find('td').removeClass('t-state-hover');

            $('.t-nav-fast', this.element)
		        .html(this.currentView.title(viewedMonth, this.pDate, this.PViewdMonth))
		        .toggleClass('t-state-disabled', viewIndex == $t.calendar.views.length - 1);
            $('.t-nav-prev', this.element)
		        .toggleClass('t-state-disabled', this.PViewdMonth.compareDate(this.maxPDate, viewIndex) != -1);

            $('.t-nav-next', this.element)
		        .toggleClass('t-state-disabled', this.PViewdMonth.compareDate(this.minPDate, viewIndex) != 1);
            var newView = $('<table dir="rtl" class="t-content" cellspacing="0"></table>')
		                    .html(this.currentView.bodyP(this.PViewdMonth, this.pDate, this.minPDate, this.maxPDate))
                .toggleClass('t-meta-view', viewIndex == 1 || viewIndex == 2);
            if (viewIndex == 2)
                newView.css('direction', 'ltr');
            var me = this;
            var maximizedViewProperties = {
                fontSize: oldViewFontSize,
                lineHeight: oldViewLineHeight,
                top: 0, left: 0,
                width: oldViewWidth,
                height: oldViewHeight,
                opacity: 1
            };
            var outerAnimationContainer;
            if (plunge) {
                outerAnimationContainer =
		            $t.fx._wrap(oldView)
		                 .css({
		                     overflow: 'hidden',
		                     position: 'relative'
                        });
                $('.t-animation-container').height(500);
                newView.wrap($('<div/>')
		               .addClass('t-animation-container')
		               .css($.extend({
		                   position: 'absolute',
		                   zIndex: 1,
		                   fontSize: 1,
		                   lineHeight: 1,
		                   width: target.outerWidth(),
		                   height: target.outerHeight(),
		                   opacity: 1
		               }, target.position())))
		               .parent()
                    .insertAfter(oldView);
                if (!this.stopAnimation) {
                    newView.parent().animate({
                        fontSize: oldViewFontSize,
                        lineHeight: oldViewLineHeight,
                        top: 0, left: 0,
                        width: oldViewWidth,
                        height: oldViewHeight,
                        opacity: 1
                    }, 'normal', function () {
                        newView.appendTo(me.element);
                        outerAnimationContainer.remove();
                        oldView.remove();
                        //me.overlay(false);
                        });
                } else { //animation is stopped for test purposes
                    oldView.remove();
                    newView.appendTo(me.element);
                    outerAnimationContainer.remove();
                    me.overlay(false);
                }
            } else {

                newView.insertBefore(oldView);
                outerAnimationContainer =
            		            $t.fx._wrap(newView)
            		                 .css({
            		                     overflow: 'hidden',
            		                     position: 'relative'
            		                 });
                var self_ = this, coordinatesMod;
                if (viewIndex != 0)
                    coordinatesMod = $t.calendar.views[viewIndex].verticalDate(this.viewedMonth);
                var index = this.PViewdMonth.Month - 1;
                if (viewIndex == 2)
                    index = this.PViewdMonth.Year % 10;
                else
                    if (viewIndex == 3)
                        index = Math.floor(this.PViewdMonth.Year / 10) % 10;
                var collapseCoordinates = {
                    left: Math.floor(oldViewWidth * (3 - Math.floor(index / 3.0)) / 4),
                    top: Math.floor(oldViewHeight * (index % 3) / 3)
                };
                //if (viewIndex == 2) {
                //    collapseCoordinates = {
                //        left: Math.floor(oldViewWidth * (3 - index % 4) / 4),
                //        top: Math.floor(oldViewHeight * Math.floor(index / 4) / 3)
                //    };
                //}
                if (viewIndex == 2) {
                    collapseCoordinates = {
                        left: Math.floor((oldViewWidth * (index % 4)) / 4.0),
                        top: Math.floor(Math.floor(index / 4) / 3 * oldViewHeight)
                    };
                }
                maximizedViewProperties.fontSize = 15;
                maximizedViewProperties.fontSize = null;
                oldView.wrap($('<div/>')
            		               .addClass('t-animation-container')
            		               .css($.extend({
            		                   position: 'absolute',
            		               }, maximizedViewProperties)))
            		               .parent()
                    .insertAfter(newView);
                newView.click(function (e) {
                    self_.navigateDown(e, e.target, 1);
                });
                $('.t-animation-container').height('auto')
                if (!this.stopAnimation) {
                    oldView.parent()
            		                   .animate($.extend({
            		                       fontSize: 1,
            		                       lineHeight: 1,
            		                       width: 48,
            		                       height: 14,
            		                       opacity: 1
                                        }, collapseCoordinates), 'normal', function () {
            		                        if (viewIndex == 1) {
            		                            index *= 4;
            		                            while (index > 11)
            		                                index -= 11;
            		                        }
            		                       newView.find('td').eq(index).attr('class', ' t-state-selected');
            		                       newView.appendTo(me.element);
                                            outerAnimationContainer.remove();

            		                       me.overlay(false);
            		                   });
                } else {//animation is stopped for test purposes
                    oldView.remove();
                    newView.appendTo(me.element);
                    outerAnimationContainer.remove();
                    me.overlay(false);
                }
            }

            $t.trigger(this.element, 'navigate', {
                direction: plunge
            });
        },

        navigateHorizontally: function (viewIndex, viewedMonth, forward) {
            viewedMonth = new $t.datetime(viewedMonth);
            var minDate = new $t.datetime(this.minDate);
            var maxDate = new $t.datetime(this.maxDate);
            this.viewedMonth = $t.datetime.firstDayOfMonth($t.calendar.fitDateToRange(viewedMonth, minDate, maxDate));

            this.currentView = $t.calendar.views[viewIndex];

            $('.t-nav-fast', this.element)
		        .html(this.currentView.title(viewedMonth, this.pDate, this.PViewdMonth))
		        .toggleClass('t-state-disabled', viewIndex == $t.calendar.views.length - 1);

            $('.t-nav-prev', this.element)
		        .toggleClass('t-state-disabled', this.PViewdMonth.compare(this.maxPDate, viewIndex) != -1);

            $('.t-nav-next', this.element)
		        .toggleClass('t-state-disabled', this.PViewdMonth.compare(this.minPDate, viewIndex) != 1);
            var newView = $('<table dir="rtl" class="t-content" cellspacing="0"></table>')
		                      .html(this.currentView.bodyP(this.PViewdMonth, this.pDate, this.minPDate, this.maxPDate))
		                      .toggleClass('t-meta-view', viewIndex == 1 || viewIndex == 2);

            var oldView = $('.t-content', this.element);

            var viewWidth = oldView.outerWidth();

            oldView.add(newView)
		           .css({ width: viewWidth, 'float': 'left' });

            var animationContainer =
		           $t.fx._wrap(oldView)
		                .css({
		                    position: 'relative',
		                    width: viewWidth * 2,
		                    'float': 'left',
		                    left: (forward ? 0 : -200)
		                });

            newView[forward ? 'insertAfter' : 'insertBefore'](oldView);
            var me = this;

            if (!this.stopAnimation) {
                if (me.isAnimating == false) {
                    me.isAnimating = true;
                    animationContainer.animate({ left: (forward ? -200 : 0) }, 'normal', function () {
                        animationContainer.remove();
                        newView.appendTo(me.element);
                        me.isAnimating = false;

                        me.overlay(false);
                    });
                }
            } else { //animation is stopped for test purposes
                oldView.remove();
                newView.appendTo(me.element);
                animationContainer.remove();
                me.overlay(false);
            }

            $t.trigger(this.element, 'navigate', {
                direction: forward
            });
            this.updateSelection();
        },

        navigateUp: function (e) {
            if (e)
                e.preventDefault();
            var currentViewIndex = this.currentView.index;
            this.navigateVertically(currentViewIndex + 1, this.viewedMonth.toDate(), false);
        },

        navigateDown: function (e, target, viewIndex) {
            var $target = $($(e.target).hasClass('t-input') ? target : e.target);
            var clickedText = $target.text();
            var currentViewIndex = viewIndex || this.currentView.index;
            if (currentViewIndex == 0) {
                this.pDate.Day = clickedText;
                if (clickedText < 10)
                    this.pDate.Day = '0' + this.pDate.Day;

            }
            else
                if (currentViewIndex == 1)
                    this.PViewdMonth = this.PViewdMonth.getDateByMonthName(clickedText);
                else
                    if (currentViewIndex == 2)
                        this.PViewdMonth.Year = clickedText;
                    else {
                        var text = clickedText.split("-");
                        this.PViewdMonth.Year = text[0];
                    }



            var href = $target.attr('href');
            if (href && (href.charAt(href.length - 1) == '#'))
                e.preventDefault();

            if (currentViewIndex == 0) {
                var date = parseInt(clickedText, 10);

                var month = this.viewedMonth.month();

                if ($target.parent().hasClass('t-other-month'))
                    month += (date < 15 ? 1 : -1);

                var newlySelectedDate = new Date(this.viewedMonth.year(), month, date);
                if (this.PViewdMonth != null) {
                    this.pDate.Year = this.PViewdMonth.Year;
                    this.pDate.Month = this.PViewdMonth.Month;
                }
                if (this.pDate.compareDate(this.minPDate) >= 0 && this.pDate.compareDate(this.maxPDate) <= 0) {
                    if ($t.trigger(this.element, 'change', {
                        previousDate: this.selectedDate,
                        date: newlySelectedDate,
                        pDate: this.pDate
                    }))
                        this.selectedDate = newlySelectedDate;
                    return this;
                }

                this.updateSelection();
            } else {
                if (currentViewIndex != 0)
                    $t.calendar.views[currentViewIndex].verticalDate(this.viewedMonth, clickedText);

                this.viewedMonth = $t.calendar.fitDateToRange(this.viewedMonth, new $t.datetime(this.minDate), new $t.datetime(this.maxDate));
                var index = this.currentView.index;
                this.navigateVertically(index - 1, this.PViewdMonth, true, $target.add($target.parent()).filter('td'), this.PViewdMonth);
            }
        },

        navigateToPast: function (e) {
            if (e) e.preventDefault();
            var currentViewIndex = this.currentView.index;

            if (this.PViewdMonth == null) {
                this.PViewdMonth = new $t.PersianDate_();
                this.PViewdMonth.setDate(this.pDate);
            }

            if (currentViewIndex == 0) {
                this.viewedMonth.date(1).date(-1);
                this.PViewdMonth = this.PViewdMonth.incMonth();
            }
            else {
                this.viewedMonth.addYear(-Math.pow(10, currentViewIndex - 1));
                if (currentViewIndex == 1)
                    this.PViewdMonth = this.PViewdMonth.incYear();
                else
                    if (currentViewIndex == 2)
                        this.PViewdMonth = this.PViewdMonth.addYears(10);
            }


            this.navigateHorizontally(currentViewIndex, this.viewedMonth.toDate(), false);
        },

        navigateToFuture: function (e) {
            if (e) e.preventDefault();
            var currentViewIndex = this.currentView.index;

            if (this.PViewdMonth == null) {
                this.PViewdMonth = new $t.PersianDate_();
                this.PViewdMonth.setDate(this.pDate);
            }

            if (currentViewIndex == 0) {
                this.PViewdMonth = this.PViewdMonth.decMonth();
                this.viewedMonth.date(32).date(1);
            }
            else {
                this.viewedMonth.addYear(Math.pow(10, currentViewIndex - 1));
                if (currentViewIndex == 1)
                    this.PViewdMonth = this.PViewdMonth.decYear();
                else
                    if (currentViewIndex == 2)
                        this.PViewdMonth = this.PViewdMonth.addYears(-10);
            }

            this.navigateHorizontally(currentViewIndex, this.viewedMonth.toDate(), true);
        }
    }

    $.fn.tCalendar = function (options) {

        return $t.create(this, {
            name: 'tCalendar',
            init: function (element, options) {
                return new $t.calendar(element, options);
            },
            options: options
        });
    };

    $.fn.tCalendar.defaults = {
        selectedDate: null,
        minDate: new Date(1899, 11, 31),
        maxDate: new Date(2100, 0, 1),
        PViewdMonth: null,
        pDate: null,
        minPDate: new $t.PersianDate_("1300/01/01"),
        maxPDate: new $t.PersianDate_("1399/12/29"),
        isAnimating: false
    };
    $.extend($t.calendar, {
        views: [{
            /* Month */
            index: 0,
            title: function (viewedMonth, pDate, pViewedMonth) {
                var str = "";
                var month = 0;
                if (pViewedMonth != null)
                    var date = pViewedMonth;
                else
                    var date = pDate;
                if (date != null) {
                    str += date.Year;
                    month = date.Month - 1;
                }
                return new $t.stringBuilder()
			        .cat($t.cultureInfo.months[month])
			        .cat(' ')
			        .cat(str).string();
            },

            bodyP: function (viewdMonth, pDate, minDate, maxDate) {
                var html = (new $t.stringBuilder()).cat('<thead><tr class="t-week-header">');
                var firstDayIndex = $t.cultureInfo.firstDayOfWeek;
                var days = $t.cultureInfo.days;
                var abbrDays = $t.cultureInfo.abbrDays;
                var months = $t.cultureInfo.months;
                days = days.slice(firstDayIndex).concat(days.slice(0, firstDayIndex));
                abbrDays = abbrDays.slice(firstDayIndex).concat(abbrDays.slice(0, firstDayIndex));
                for (var i = 0; i < 7; i++) {
                    html.cat('<th scope="col" abbr="')
                        .cat(abbrDays[i])
                        .cat('" title="')
                        .cat(days[i])
                        .cat('">')
                        .cat(days[i].charAt(0))
                        .cat('</th>');
                }
                if (viewdMonth == null) 
                    var tempDate = pDate;
                else {
                    var tempDate = viewdMonth;
                    tempDate.Day = null;
                }
                html.cat('</tr></thead><tbody style="text-align:center">');
                for (var weekRow = 0; weekRow < 6; weekRow++) {
                    html.cat('<tr>');

                    for (var day = 0; day < 7; day++) {
                        var date = new $t.persainCalender().getVisibility(tempDate.Year, tempDate.Month, weekRow * 7 + day + 1);
                        var cellClass = "";
                        //                        if (date.Month == tempDate.Month && date.compareDate(pDate) == 0)
                        //                            cellClass = "t-state-focus";
                        if (date.Month != tempDate.Month)
                            cellClass = "t-other-month";

                        html.cat('<td');
                        if (cellClass !== "")
                            html.cat(' class="' + cellClass + '"')
                        html.cat(' title="' + days[day] + ' ' + date.Day + months[date.Month - 1] + ' ' + date.Year + '"')
                        html.cat('>');
                        if (date.compareDate(minDate) != -1 && date.compareDate(maxDate) != 1)
                            html.cat('<a href=\"#\" class=\"t-link\">' + date.Day + '</a>').cat('</td>');
                    }

                    html.cat('</tr>');
                }
                html.cat('</tbody>');
                return html.string();
            },

            body: function (viewedMonth, minDate, maxDate, selectedDate, urlFormat, dates) {
                var html = (new $t.stringBuilder())
			               .cat('<thead><tr class="t-week-header">');
                var firstDayIndex = $t.cultureInfo.firstDayOfWeek;
                var days = $t.cultureInfo.days;
                var abbrDays = $t.cultureInfo.abbrDays;

                days = days.slice(firstDayIndex).concat(days.slice(0, firstDayIndex));
                abbrDays = abbrDays.slice(firstDayIndex).concat(abbrDays.slice(0, firstDayIndex));
                for (var i = 0; i < 7; i++) {
                    html.cat('<th scope="col" abbr="')
                        .cat(abbrDays[i])
                        .cat('" title="')
                        .cat(days[i])
                        .cat('">')
                        .cat(days[i].charAt(0))
                        .cat('</th>');
                }

                html.cat('</tr></thead><tbody>');


                var currentDayInCalendar = $t.datetime.firstVisibleDay(viewedMonth);
                var month = viewedMonth.month();

                var selectedDateInViewedMonth = selectedDate === null ? false :
                                                viewedMonth.year() == selectedDate.year();
                var cellClass;
                var calendar = new $t.persainCalender();

                for (var weekRow = 0; weekRow < 6; weekRow++) {

                    html.cat('<tr>');

                    for (var day = 0; day < 7; day++) {

                        cellClass =
			            currentDayInCalendar.month() != month ? 't-other-month' :
			            (selectedDateInViewedMonth
			            && currentDayInCalendar.month() == selectedDate.month()
			            && currentDayInCalendar.date() == selectedDate.date()) ? ' t-state-selected' : '';

                        html.cat('<td')
			                .catIf(' class="' + cellClass + '"', cellClass)
			                .cat('>');

                        if ($t.calendar.isInRange(currentDayInCalendar.toDate(), minDate.toDate(), maxDate.toDate())) {
                            html.cat('<a href="')
                            var url = '#';
                            if (urlFormat) {
                                url = $t.calendar.formatUrl(urlFormat, currentDayInCalendar);
                                if (dates && !$t.calendar.isInCollection(currentDayInCalendar, dates)) {
                                    url = '#';
                                }
                            }

                            html.cat(url)
			                    .cat('" class="t-link')
			                    .cat(url != '#' ? ' t-action-link' : '')
                                .cat('" title="')
                                .cat($t.datetime.format(currentDayInCalendar.toDate(), $t.cultureInfo.longDate))
			                    .cat('">')
                                .cat('1')
			                    .cat('</a>');
                        } else {
                            html.cat('&nbsp;');
                        }
                        html.cat('</td>');

                        $t.datetime.modify(currentDayInCalendar, $t.datetime.msPerDay);
                    }

                    html.cat('</tr>');
                }
                html.cat('</tbody>');

                return html.string();
            },

            compare: function (date1, date2) {
                var result;
                var date1Month = date1.month();
                var date1Year = date1.year();
                var date2Month = date2.month();
                var date2Year = date2.year();

                if (date1Year > date2Year)
                    result = 1;
                else if (date1Year < date2Year)
                    result = -1;
                else // date1Year == date2Year
                    result = date1Month == date2Month ? 0 :
			                 date1Month > date2Month ? 1 : -1;
                return result;
            },
            firstLastDay: function (date, isFirstDay, calendar) {
                return isFirstDay ? $t.datetime.firstDayOfMonth(date) : new $t.datetime(date.year(), date.month() + 1, 0);
            },
            navCheck: function (date1, date2, isBigger) {
                if (isBigger) {
                    return new $t.datetime(date2.year(), date2.month() + 1, date2.date()).value - date1.value <= 0;
                } else {
                    return this.compare(date1, date2) === -1;
                }
            }
        },
			 {   /*Year*/
			     index: 1,
			     title: function (viewedMonth, pDate, pViewedMonth) {
			         if (pViewedMonth != null)
			             return pViewedMonth.Year;
			         return null;
			     },
			     bodyP: function (date, temp, minDate, maxDate) {
			         return $t.calendar.metaView(true, date, function () {
			             if (date == null)
			                 date = temp;
			             var result = [];
			             var startMonth = 0;
			             var endMonth = 11;

			             if (minDate.Year == maxDate.Year) {
			                 startMonth = minDate.Month - 1;
			                 endMonth = maxDate.Month - 1;
			             }
			             else if (date.Year == minDate.Year)
			                 startMonth = minDate.Month - 1;
			             else if (date.Year == maxDate.Year)
			                 endMonth = maxDate.Month - 1;

			             for (var i = 0; i < 12; i++) {
			                 if (i >= startMonth && i <= endMonth)
			                     result.push($t.cultureInfo.abbrMonths[i]);
			                 else
			                     result.push('&nbsp;');
                         }
			             return result;
			         });
			     },

			     compare: function (date1, date2) {
			         return date1.year() > date2.year() ? 1 : date1.year() < date2.year() ? -1 : 0;
			     },
			     verticalDate: function (date, clickedText) {
			         if (!clickedText)
			             return date.month();
			         date.month($.inArray(clickedText, $t.cultureInfo.abbrMonths));
			     },
			     firstLastDay: function (date, isFirstDay) {
			         return new $t.datetime(date.year(), isFirstDay ? 0 : 11, 1);
			     },
			     navCheck: function (date1, date2, isBigger) {
			         var tmp = this.compare(date1, date2);
			         return isBigger ? tmp == 1 : tmp == -1;
			     }
			 },
			 {   /*Decade*/
			     index: 2,
			     title: function (viewedMonth, pDate, pViewedMonth) {
			         var firstYearInDecade = pViewedMonth.Year - pViewedMonth.Year % 10;
			         return firstYearInDecade + '-' + (firstYearInDecade + 9);
			     },
			     body: function (viewedMonth, minDate, maxDate) {
			         return $t.calendar.metaView(false, viewedMonth, function () {
			             var result = [];
			             var minYear = minDate.year();
                         var maxYear = maxDate.year();
			             var year = viewedMonth.year() - viewedMonth.year() % 10 - 1;

			             for (var i = 0; i < 12; i++)
			                 result.push(year + i >= minYear && year + i <= maxYear ? year + i : '&nbsp;');

			             return result;
			         });
			     },
			     bodyP: function (viewedMonth, temp, minDate, maxDate) {
			         return $t.calendar.metaView(false, viewedMonth, function () {

			             var result = [];
			             var minYear = minDate.Year;
                         var maxYear = maxDate.Year;
			             var year = viewedMonth.Year - viewedMonth.Year % 10;
			             for (var i = 0; i < 10; i++) {

			                 if (year + i >= minYear && year + i <= maxYear)
			                     result.push(year + i);
			                 else
			                     result.push('&nbsp;');
                         }
                         result.push('&nbsp;');
                         result.push('&nbsp;');
			             return result;
			         });
			     },

			     compare: function (date1, date2, checkBigger) {
			         var year = date1.year();
			         var minDecade = (year - year % 10);
			         var maxDecade = (year - year % 10 + 9);
			         return $t.calendar.check(minDecade, maxDecade, date2, checkBigger);
			     },
			     verticalDate: function (date, clickedText) {
			         if (!clickedText)
			             return date.year() % 10 + 1;
			         date.year(clickedText);
			     },
			     firstLastDay: function (date, isFirstDay) {
			         return new $t.datetime(date.year() - date.year() % 10 + (isFirstDay ? 0 : 9), 0, 1);
			     },
			     navCheck: function (date1, date2, isBigger) {
			         var tmp = this.compare(date2, date1, isBigger);
			         return isBigger ? tmp == -1 : tmp == 1;
			     }
			 },
			 {   /*Century*/
			     index: 3,
			     title: function (viewedMonth, pDate) {
			         var firstYearInCentury = viewedMonth.year() - viewedMonth.year() % 100;

			         return firstYearInCentury + '-' + (firstYearInCentury + 99);
			     },
			     body: function (viewedMonth, minDate, maxDate) {

			         return $t.calendar.metaView(false, viewedMonth, function () {
			             var firstYearInCentury = viewedMonth.year() - viewedMonth.year() % 100;

			             var result = [];

			             for (var i = -1; i < 11; i++) {
			                 var firstYearInCenturyTemp = firstYearInCentury + i * 10;
			                 if ((firstYearInCenturyTemp + 10) >= minDate.year() && firstYearInCenturyTemp <= maxDate.year())
			                     result.push(firstYearInCenturyTemp + '-<br />' +
			                     (firstYearInCenturyTemp + 9) + '&nbsp;');
			                 else
			                     result.push('&nbsp;<br />&nbsp;');
			             }
			             return result;
			         });
			     },

			     bodyP: function (viewedMonth, temp, minDate, maxDate) {
			         return $t.calendar.metaView(false, viewedMonth, function () {
			             var firstYearInCentury = viewedMonth.Year - viewedMonth.Year % 100;

			             var result = [];

			             for (var i = -1; i < 11; i++) {
			                 var firstYearInCenturyTemp = firstYearInCentury + i * 10;
			                 if (parseInt(firstYearInCenturyTemp + 10) >= minDate.Year && firstYearInCenturyTemp <= maxDate.Year) {

			                     result.push(firstYearInCenturyTemp + '-<br />' + (firstYearInCenturyTemp + 9) + '&nbsp;');
			                 }
			                 else
			                     result.push('&nbsp;<br />&nbsp;');
			             }
			             return result;
			         });
			     },

			     compare: function (date1, date2, checkBigger) {
			         var year = date1.year();
			         var minCentury = (year - year % 100);
			         var maxCentury = (year - year % 100 + 99);
			         return $t.calendar.check(minCentury, maxCentury, date2, checkBigger);
			     },
			     verticalDate: function (date, clickedText) {
			         if (!clickedText)
			             return Math.ceil(date.year() / 10) % 10 + 1;

			         date.year(clickedText.substring(0, clickedText.indexOf('-')));
			     },
			     firstLastDay: function (date, isFirstDay) {
			         return isFirstDay ? new $t.datetime(date.year() - (date.year() % 100), 0, 1) :
			                new $t.datetime(date.year() - (date.year() % 100) + 99, 0, 1);
			     },
			     navCheck: function (date1, date2, isBigger) {
			         var tmp = this.compare(date2, date1, isBigger);
			         return isBigger ? tmp == -1 : tmp == 1;
			     }
			 }],

        check: function (value1, value2, date, checkBigger) {
            var check = function (val) {
                return val < date.year() ? -1 :
			 val > date.year() ? 1 : 0;
            }
            return checkBigger ? check(value2) : check(value1);
        },

        html: function (viewedMonth, selectedDate, minDate, maxDate, urlFormat, dates) {
            viewedMonth = viewedMonth || new $t.datetime();
            minDate = minDate || new $t.datetime($.fn.tCalendar.defaults.minDate);
            maxDate = maxDate || new $t.datetime($.fn.tCalendar.defaults.maxDate);
            return new $t.stringBuilder().cat('<div style="height:224px;" class="t-widget t-calendar">')
			                             .cat('<div class="t-header">')
			                             .cat('<a href="#" class="t-link t-nav-prev">')
			                             .cat('<span class="t-icon t-arrow-prev"></span></a><a href="#" class="t-link t-nav-fast">')
			                             .cat($t.calendar.views[0].title(viewedMonth, this.pDate, this.PViewdMonth))
			                             .cat('</a>')
			                             .cat('<a href="#" class="t-link t-nav-next"><span class="t-icon t-arrow-next"></span></a>')
			                             .cat('</div>')
			                             .cat('<table dir="rtl" class="t-content" cellspacing="0">')
			                             .cat($t.calendar.views[0].body(viewedMonth, minDate, maxDate, selectedDate, urlFormat, dates))
			                             .cat('</table></div>')
			                             .string();
        },

        metaView: function (isYearView, viewedMonth, getCollection) {
            var html = new $t.stringBuilder();

            var collection = getCollection();

            html.cat('<tr>');

            // build 4x3 table
            for (var i = 0, len = collection.length; i < len; i++) {

                html.catIf('</tr><tr>', i > 0 && i % 4 == 0)
			        .cat('<td')
			        .catIf(' class="t-other-month"', (i == 0 || i == len - 1) && isYearView == false)
			        .cat('>');
                var j = i;
                if (isYearView)
                    j = 3 * (i % 4) + Math.floor(i / 4);
                if (collection[j] !== '&nbsp;' && collection[j] !== '&nbsp;<br />&nbsp;')
                    html.cat('<a href="#" class="t-link">')
			            .cat(collection[j]).cat('</a>')
                else
                    html.cat(collection[j]);

                html.cat('</td>');
            }

            html.cat('</tr>');
            return html.string();
        },

        isInRange: function (date, minDate, maxDate) {
            if (!date) return false;

            var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
            var max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());

            return min - d <= 0 && max - d >= 0;
        },

        fitDateToRange: function (date, minDate, maxDate) {
            if (date.value < minDate.value) date = new $t.datetime(minDate.value)
            if (date.value > maxDate.value) date = new $t.datetime(maxDate.value)
            return date;
        },

        isInCollection: function (date, dates) {
            var months = dates[date.year()];
            if (months) {
                var days = months[date.month()];
                if (days && $.inArray(date.date(), days) != -1)
                    return true;
            }
            return false;
        },

        findTarget: function (focusedDate, viewedIndex, calendar, isFuture) {

            focusedDate = focusedDate.value ? focusedDate : new $t.datetime(focusedDate);
            var findTarget = function (collection, searchedText) {
                searchedText++;
                return $.grep(collection, function (item) {

                    return $(item).children().eq(0).text().indexOf(searchedText) > -1;
                })[0];
            }

            var selector = isFuture ? 'last' : 'first';
            var cells = $('.t-content:' + selector + ' td:has(> .t-link)', calendar).removeClass('t-state-focus');

            var $target;
            if (viewedIndex == 0) {
                $target = $(findTarget(cells.filter(':not(.t-other-month)'), focusedDate.date()));

            } else if (viewedIndex == 1) {
                $target = $(findTarget(cells, $t.cultureInfo.abbrMonths[focusedDate.month()]));
            } else if (viewedIndex == 2 || viewedIndex == 3) {
                var year = focusedDate.year();
                $target = $(findTarget(cells, viewedIndex == 2 ? year : year - (year % 10)));
                if ($target.length == 0 && viewedIndex == 3)
                    $target = $(findTarget(cells, year - (year % 10) + 99));
            }
            return $target;
        },

        focusDate: function (focusedDate, viewedIndex, calendar, isFuture) {

            $t.calendar.findTarget(focusedDate, viewedIndex, calendar, isFuture); //.addClass('t-state-focus');
        },

        formatUrl: function (urlFormat, date) {
            var format = urlFormat.match(dateFormatRegExp);
            if (format) {
                format = format[0];
                var dateFormat = format === "{0}" ? $t.cultureInfo.generalDateTime : format.replace(replaceUrlRegExp, "").replace("}", "");

                return urlFormat.replace(format, $t.datetime.format(date.toDate(), dateFormat));
            }
            return urlFormat;
        }
    });

    $.extend($t.formatters, {
        date: $t.datetime.format
    });

    $t.persainCalender = function () {
        this.getVisibility = function (year, month, cellNumber) {
            var date = $t.PersianDate_();
            date.Year = year;
            date.Month = month;
            var firstDayOfMonth = date.getFirstDayOfMonth();
            if (firstDayOfMonth == 0)
                firstDayOfMonth = 7;

            date.Day = cellNumber;
            if (cellNumber <= firstDayOfMonth) {
                //روزهای ماه قبل
                date.Month--;
                if (date.Month == 0) {
                    date.Month = 12;
                    date.Year--;
                }
                var numberDaysOfPreMonth = date.getNumberDaysInMonth();
                date.Day = numberDaysOfPreMonth - firstDayOfMonth + cellNumber;
            }
            else {
                var numberDaysOfMonth = date.getNumberDaysInMonth();
                if (cellNumber <= firstDayOfMonth + numberDaysOfMonth)
                    //روزهای همین ماه
                    date.Day = cellNumber - firstDayOfMonth;
                else {
                    //روزهای ماه بعد
                    date.Month++;
                    if (date.Month > 12) {
                        date.Year++;
                        date.Month = 1;
                    }
                    date.Day = cellNumber - firstDayOfMonth - numberDaysOfMonth;
                }
            }
            return date;
        };
        return this;
    }
})(jQuery);

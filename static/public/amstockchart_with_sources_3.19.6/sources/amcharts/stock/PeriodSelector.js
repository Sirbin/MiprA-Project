(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.PeriodSelector = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "PeriodSelector";
            _this.theme = theme;
            _this.createEvents("changed");

            _this.inputFieldsEnabled = true;
            _this.position = "bottom";
            _this.width = 180;
            _this.fromText = "From: ";
            _this.toText = "to: ";
            _this.periodsText = "Zoom: ";
            _this.periods = [];
            _this.inputFieldWidth = 100;
            _this.dateFormat = "DD-MM-YYYY";
            _this.hideOutOfScopePeriods = true;
            //_this.color = "#000000";
            //_this.fontFamily = "Verdana";
            //_this.fontSize = 11;

            AmCharts.applyTheme(_this, theme, _this.cname);
        },

        zoom: function(startDate, endDate) {
            var _this = this;
            var chart = _this.chart;
            if (_this.inputFieldsEnabled) {
                _this.startDateField.value = AmCharts.formatDate(startDate, _this.dateFormat, chart);
                _this.endDateField.value = AmCharts.formatDate(endDate, _this.dateFormat, chart);
            }
            _this.markButtonAsSelected();
        },

        write: function(div) {
            var _this = this;

            var chart = _this.chart;
            var classNamePrefix = chart.classNamePrefix;

            div.className = "amChartsPeriodSelector " + classNamePrefix + "-period-selector-div";

            var tempW = _this.width;
            var tempP = _this.position;
            _this.width = undefined;
            _this.position = undefined;

            AmCharts.applyStyles(div.style, _this);

            _this.width = tempW;
            _this.position = tempP;

            _this.div = div;

            div.innerHTML = "";

            var theme = _this.theme;

            var position = _this.position;
            var vertical;

            if (position == "top" || position == "bottom") {
                vertical = false;
            } else {
                vertical = true;
            }
            _this.vertical = vertical;

            var offsetHeight1 = 0;
            var offsetHeight2 = 0;

            if (_this.inputFieldsEnabled) {
                var inputContainer = document.createElement("div");
                div.appendChild(inputContainer);

                var fromLabel = document.createTextNode(AmCharts.lang.fromText || _this.fromText);
                inputContainer.appendChild(fromLabel);

                if (vertical) {
                    AmCharts.addBr(inputContainer);
                } else {
                    inputContainer.style.styleFloat = "left";
                    inputContainer.style.display = "inline";
                }

                var startDateField = document.createElement("input");
                startDateField.className = "amChartsInputField " + classNamePrefix + "-start-date-input";

                if (theme) {
                    AmCharts.applyStyles(startDateField.style, theme.PeriodInputField);
                }

                startDateField.style.textAlign = "center";
                startDateField.onblur = function(event) {
                    _this.handleCalChange(event);
                };

                if (AmCharts.isNN) {
                    startDateField.addEventListener("keypress", function(event) {
                        _this.handleCalendarChange.call(_this, event);
                    }, true);
                }

                if (AmCharts.isIE) {
                    startDateField.attachEvent("onkeypress", function(event) {
                        _this.handleCalendarChange.call(_this, event);
                    });
                }

                inputContainer.appendChild(startDateField);
                _this.startDateField = startDateField;


                var widthPx;

                if (vertical) {
                    widthPx = (_this.width - 6) + "px";
                    AmCharts.addBr(inputContainer);
                } else {
                    widthPx = _this.inputFieldWidth + "px";
                    var space = document.createTextNode(" ");
                    inputContainer.appendChild(space);
                }

                startDateField.style.width = widthPx;

                var toLabel = document.createTextNode(AmCharts.lang.toText || _this.toText);
                inputContainer.appendChild(toLabel);

                if (vertical) {
                    AmCharts.addBr(inputContainer);
                }

                var endDateField = document.createElement("input");
                endDateField.className = "amChartsInputField " + classNamePrefix + "-end-date-input";

                if (theme) {
                    AmCharts.applyStyles(endDateField.style, theme.PeriodInputField);
                }
                endDateField.style.textAlign = "center";

                endDateField.onblur = function() {
                    _this.handleCalChange();
                };

                if (AmCharts.isNN) {
                    endDateField.addEventListener("keypress", function(event) {
                        _this.handleCalendarChange.call(_this, event);
                    }, true);
                }

                if (AmCharts.isIE) {
                    endDateField.attachEvent("onkeypress", function(event) {
                        _this.handleCalendarChange.call(_this, event);
                    });
                }

                inputContainer.appendChild(endDateField);
                _this.endDateField = endDateField;

                if (vertical) {
                    AmCharts.addBr(inputContainer);
                } else {
                    offsetHeight1 = endDateField.offsetHeight + 2;
                }
                if (widthPx) {
                    endDateField.style.width = widthPx;
                }
            }

            var periods = _this.periods;

            if (AmCharts.ifArray(periods)) {
                var periodContainer = document.createElement("div");
                if (!vertical) {
                    periodContainer.style.cssFloat = "right";
                    periodContainer.style.styleFloat = "right";
                    periodContainer.style.display = "inline";
                }
                div.appendChild(periodContainer);

                if (vertical) {
                    AmCharts.addBr(periodContainer);
                }

                var periodsLabel = document.createTextNode(AmCharts.lang.periodsText || _this.periodsText);
                periodContainer.appendChild(periodsLabel);
                _this.periodContainer = periodContainer;
                var i;
                var button;
                for (i = 0; i < periods.length; i++) {
                    var period = periods[i];
                    button = document.createElement("input");
                    button.type = "button";
                    button.value = period.label;
                    button.period = period.period;
                    button.count = period.count;
                    button.periodObj = period;
                    button.className = "amChartsButton " + classNamePrefix + "-period-input";

                    if (theme) {
                        AmCharts.applyStyles(button.style, theme.PeriodButton);
                    }

                    if (vertical) {
                        button.style.width = (_this.width - 1) + "px";
                    }
                    button.style.boxSizing = "border-box";
                    periodContainer.appendChild(button);

                    _this.addEventListeners(button);

                    period.button = button;
                }
                if (!vertical && button) {
                    offsetHeight2 = button.offsetHeight;
                }
            }
            _this.offsetHeight = Math.max(offsetHeight1, offsetHeight2);
        },

        addEventListeners: function(button) {
            var _this = this;
            if (AmCharts.isNN) {
                button.addEventListener("click", function(event) {
                    _this.handlePeriodChange.call(_this, event);
                }, true);
            }

            if (AmCharts.isIE) {
                button.attachEvent("onclick", function(event) {
                    _this.handlePeriodChange.call(_this, event);
                });
            }
        },

        getPeriodDates: function() {
            var _this = this;
            var periods = _this.periods;
            var i;
            for (i = 0; i < periods.length; i++) {
                _this.selectPeriodButton(periods[i], true);
            }
        },


        handleCalendarChange: function(e) {
            if (e.keyCode == 13) {
                this.handleCalChange(e);
            }
        },

        handleCalChange: function(ev) {
            var _this = this;
            var dateFormat = _this.dateFormat;
            var startDate = AmCharts.stringToDate(_this.startDateField.value, dateFormat);

            var endDate = _this.chart.getLastDate(AmCharts.stringToDate(_this.endDateField.value, dateFormat));
            try {
                _this.startDateField.blur();
                _this.endDateField.blur();
            } catch (err) {
                //void
            }

            if (startDate && endDate) {
                var event = {
                    type: "changed"
                };
                event.startDate = startDate;
                event.endDate = endDate;
                event.chart = _this.chart;
                event.event = ev;
                _this.fire(event);
            }
        },


        handlePeriodChange: function(event) {
            var button = event.srcElement ? event.srcElement : event.target;
            this.selectPeriodButton(button.periodObj, false, event);
        },


        setRanges: function(firstDate, lastDate) {
            var _this = this;
            _this.firstDate = firstDate;
            _this.lastDate = lastDate;
            _this.getPeriodDates();
        },


        selectPeriodButton: function(period, skipFire, ev) {
            var _this = this;

            var button = period.button;
            var count = button.count;
            var periodString = button.period;
            var chart = _this.chart;

            var startDate;
            var endDate;

            var firstDate = _this.firstDate;
            var lastDate = _this.lastDate;
            var duration;
            var theme = _this.theme;
            var selectFromStart = _this.selectFromStart;

            if (firstDate && lastDate) {
                if (periodString == "MAX") {
                    startDate = firstDate;
                    endDate = lastDate;
                } else if (periodString == "YTD") {
                    startDate = new Date();
                    startDate.setMonth(0, 1);
                    startDate.setHours(0, 0, 0, 0);

                    if (count === 0) {
                        startDate.setDate(startDate.getDate() - 1);
                    }
                    endDate = _this.lastDate;
                } else if (periodString == "YYYY" || periodString == "MM") {
                    if (selectFromStart) {
                        startDate = firstDate;
                        endDate = new Date(firstDate);
                        if (periodString == "YYYY") {
                            count *= 12;
                        }
                        endDate.setMonth(endDate.getMonth() + count);
                    } else {
                        startDate = new Date(lastDate);

                        if (periodString == "YYYY") {
                            periodString = "MM";
                            count *= 12;
                        }

                        AmCharts.changeDate(startDate, periodString, count, false);
                        endDate = lastDate;
                    }
                } else if (periodString == "fff") {
                    duration = AmCharts.getPeriodDuration(periodString, count);

                    duration = AmCharts.getPeriodDuration(periodString, count);

                    if (selectFromStart) {
                        startDate = firstDate;
                        endDate.setMilliseconds(firstDate.getMilliseconds() - duration + 1);
                    } else {
                        startDate = new Date(lastDate.getTime());
                        startDate.setMilliseconds(startDate.getMilliseconds() - duration + 1);
                        endDate = _this.lastDate;
                    }
                } else {
                    duration = AmCharts.getPeriodDuration(periodString, count);

                    if (selectFromStart) {
                        startDate = firstDate;
                        endDate = new Date(firstDate.getTime() + duration - 1);
                    } else {
                        startDate = new Date(lastDate.getTime() - duration + 1);
                        endDate = lastDate;
                    }
                }

                period.startTime = startDate.getTime();

                // hide
                if (_this.hideOutOfScopePeriods) {
                    if (skipFire && period.startTime < firstDate.getTime()) {
                        button.style.display = "none";
                    } else {
                        button.style.display = "inline";
                    }
                }

                if (startDate.getTime() > lastDate.getTime()) {
                    duration = AmCharts.getPeriodDuration("DD", 1);
                    startDate = new Date(lastDate.getTime() - duration);
                }

                if (startDate.getTime() < firstDate.getTime()) {
                    startDate = firstDate;
                }

                if (periodString == "YTD") {
                    period.startTime = startDate.getTime();
                }
                period.endTime = endDate.getTime();

                if (!skipFire) {
                    _this.skipMark = true;
                    _this.unselectButtons();

                    button.className = "amChartsButtonSelected " + chart.classNamePrefix + "-period-input-selected";

                    if (theme) {
                        AmCharts.applyStyles(button.style, theme.PeriodButtonSelected);
                    }
                    var event = {
                        type: "changed"
                    };

                    event.startDate = startDate;
                    event.endDate = endDate;
                    event.predefinedPeriod = periodString;
                    event.chart = _this.chart;
                    event.count = count;
                    event.event = ev;
                    _this.fire(event);
                }
            }
        },

        markButtonAsSelected: function() {
            var _this = this;
            if (!_this.skipMark) {
                var chart = _this.chart;
                var periods = _this.periods;
                var startTime = chart.startDate.getTime();
                var endTime = chart.endDate.getTime();
                var lastTime = _this.lastDate.getTime();

                if (endTime > lastTime) {
                    endTime = lastTime;
                }
                var theme = _this.theme;
                _this.unselectButtons();
                var i;
                for (i = periods.length - 1; i >= 0; i--) {
                    var period = periods[i];
                    var button = period.button;

                    if (period.startTime && period.endTime) {
                        if (startTime == period.startTime && endTime == period.endTime) {
                            _this.unselectButtons();
                            button.className = "amChartsButtonSelected " + chart.classNamePrefix + "-period-input-selected";
                            if (theme) {
                                AmCharts.applyStyles(button.style, theme.PeriodButtonSelected);
                            }
                        }
                    }
                }
            }
            _this.skipMark = false;
        },

        unselectButtons: function() {
            var _this = this;
            var chart = _this.chart;
            var periods = _this.periods;
            var i;
            var theme = _this.theme;
            for (i = periods.length - 1; i >= 0; i--) {
                var period = periods[i];
                var button = period.button;


                button.className = "amChartsButton " + chart.classNamePrefix + "-period-input";
                if (theme) {
                    AmCharts.applyStyles(button.style, theme.PeriodButton);
                }
            }
        },

        setDefaultPeriod: function() {
            var _this = this;
            var periods = _this.periods;
            var i;
            if (_this.chart.chartCreated) {
                for (i = 0; i < periods.length; i++) {
                    var period = periods[i];
                    if (period.selected) {
                        _this.selectPeriodButton(period);
                    }
                }
            }
        }
    });
})();
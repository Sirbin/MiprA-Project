(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.AxisBase = AmCharts.Class({
        construct: function(theme) {
            var _this = this;
            _this.createEvents("clickItem", "rollOverItem", "rollOutItem");
            _this.dx = 0;
            _this.dy = 0;
            _this.x = 0;
            _this.y = 0;
            _this.titleDY = 0;
            //_this.axisWidth;
            _this.axisThickness = 1;
            _this.axisColor = "#000000";
            _this.axisAlpha = 1;
            _this.tickLength = 5;
            _this.gridCount = 5;
            _this.gridAlpha = 0.15;
            _this.gridThickness = 1;
            _this.gridColor = "#000000";
            _this.dashLength = 0;
            _this.labelFrequency = 1;
            _this.showFirstLabel = true;
            _this.showLastLabel = true;
            _this.fillColor = "#FFFFFF";
            _this.fillAlpha = 0;
            _this.labelsEnabled = true;
            _this.labelRotation = 0;
            _this.autoGridCount = true;
            //_this.valueRollOverColor = "#CC0000";
            _this.offset = 0;
            _this.guides = [];
            _this.visible = true;
            _this.counter = 0;
            _this.guides = [];
            _this.inside = false;
            _this.ignoreAxisWidth = false;
            //_this.boldLabels;
            //_this.titleColor;
            //_this.titleFontSize;
            _this.minHorizontalGap = 75;
            _this.minVerticalGap = 35;
            _this.titleBold = true;
            _this.minorGridEnabled = false;
            _this.minorGridAlpha = 0.07;
            _this.autoWrap = false;
            _this.titleAlign = "middle";
            _this.labelOffset = 0;
            _this.bcn = "axis-";
            _this.centerLabels = false;

            _this.firstDayOfWeek = 1;
            _this.boldPeriodBeginning = true;
            _this.markPeriodChange = true;
            _this.centerLabelOnFullPeriod = true;

            _this.periods = [{
                period: "ss",
                count: 1
            }, {
                period: "ss",
                count: 5
            }, {
                period: "ss",
                count: 10
            }, {
                period: "ss",
                count: 30
            }, {
                period: "mm",
                count: 1
            }, {
                period: "mm",
                count: 5
            }, {
                period: "mm",
                count: 10
            }, {
                period: "mm",
                count: 30
            }, {
                period: "hh",
                count: 1
            }, {
                period: "hh",
                count: 3
            }, {
                period: "hh",
                count: 6
            }, {
                period: "hh",
                count: 12
            }, {
                period: "DD",
                count: 1
            }, {
                period: "DD",
                count: 2
            }, {
                period: "DD",
                count: 3
            }, {
                period: "DD",
                count: 4
            }, {
                period: "DD",
                count: 5
            }, {
                period: "WW",
                count: 1
            }, {
                period: "MM",
                count: 1
            }, {
                period: "MM",
                count: 2
            }, {
                period: "MM",
                count: 3
            }, {
                period: "MM",
                count: 6
            }, {
                period: "YYYY",
                count: 1
            }, {
                period: "YYYY",
                count: 2
            }, {
                period: "YYYY",
                count: 5
            }, {
                period: "YYYY",
                count: 10
            }, {
                period: "YYYY",
                count: 50
            }, {
                period: "YYYY",
                count: 100
            }];

            _this.dateFormats = [{
                period: "fff",
                format: "JJ:NN:SS"
            }, {
                period: "ss",
                format: "JJ:NN:SS"
            }, {
                period: "mm",
                format: "JJ:NN"
            }, {
                period: "hh",
                format: "JJ:NN"
            }, {
                period: "DD",
                format: "MMM DD"
            }, {
                period: "WW",
                format: "MMM DD"
            }, {
                period: "MM",
                format: "MMM"
            }, {
                period: "YYYY",
                format: "YYYY"
            }];

            _this.nextPeriod = {
                fff: "ss",
                ss: "mm",
                mm: "hh",
                hh: "DD",
                DD: "MM",
                MM: "YYYY"
            };

            // new properties
            //_this.balloon;

            AmCharts.applyTheme(_this, theme, "AxisBase");
        },

        zoom: function(start, end) {
            var _this = this;

            _this.start = start;
            _this.end = end;
            _this.dataChanged = true;
            _this.draw();
        },

        fixAxisPosition: function() {
            var _this = this;
            var pos = _this.position;

            if (_this.orientation == "H") {
                if (pos == "left") {
                    pos = "bottom";
                }
                if (pos == "right") {
                    pos = "top";
                }
            } else {
                if (pos == "bottom") {
                    pos = "left";
                }
                if (pos == "top") {
                    pos = "right";
                }
            }

            _this.position = pos;
        },

        init: function() {
            var _this = this;
            _this.createBalloon();
        },


        draw: function() {
            var _this = this;
            var chart = _this.chart;
            _this.prevBX = NaN;
            _this.prevBY = NaN;
            _this.allLabels = [];
            _this.counter = 0;
            _this.destroy();
            _this.fixAxisPosition();
            _this.setBalloonBounds();
            _this.labels = [];

            var container = chart.container;

            var set = container.set();
            chart.gridSet.push(set);
            _this.set = set;

            var labelsSet = container.set();
            chart.axesLabelsSet.push(labelsSet);

            _this.labelsSet = labelsSet;

            _this.axisLine = new _this.axisRenderer(_this);

            if (_this.autoGridCount) {
                var c;

                if (_this.orientation == "V") {
                    c = _this.height / _this.minVerticalGap;
                    if (c < 3) {
                        c = 3;
                    }
                } else {
                    c = _this.width / _this.minHorizontalGap;
                }
                _this.gridCountR = Math.max(c, 1);
            } else {
                _this.gridCountR = _this.gridCount;
            }
            _this.axisWidth = _this.axisLine.axisWidth;
            _this.addTitle();
        },


        setOrientation: function(rotate) {
            var _this = this;
            if (rotate) {
                _this.orientation = "H";
            } else {
                _this.orientation = "V";
            }
        },


        addTitle: function() {
            var _this = this;
            var title = _this.title;

            _this.titleLabel = null;

            if (title) {
                var chart = _this.chart;

                var color = _this.titleColor;
                if (color === undefined) {
                    color = chart.color;
                }

                var titleFontSize = _this.titleFontSize;
                if (isNaN(titleFontSize)) {
                    titleFontSize = chart.fontSize + 1;
                }
                var titleLabel = AmCharts.text(chart.container, title, color, chart.fontFamily, titleFontSize, _this.titleAlign, _this.titleBold);
                AmCharts.setCN(chart, titleLabel, _this.bcn + "title");
                _this.titleLabel = titleLabel;
            }
        },

        positionTitle: function() {
            var _this = this;
            var titleLabel = _this.titleLabel;
            if (titleLabel) {
                var tx;
                var ty;
                var labelsSet = _this.labelsSet;
                var bbox = {};

                if (labelsSet.length() > 0) {
                    bbox = labelsSet.getBBox();
                } else {
                    bbox.x = 0;
                    bbox.y = 0;
                    bbox.width = _this.width;
                    bbox.height = _this.height;

                    if (AmCharts.VML) {
                        bbox.y += _this.y;
                        bbox.x += _this.x;
                    }
                }
                labelsSet.push(titleLabel);

                var bx = bbox.x;
                var by = bbox.y;

                if (AmCharts.VML) {
                    if (!_this.rotate) {
                        by -= _this.y;
                    } else {
                        bx -= _this.x;
                    }
                }

                var bw = bbox.width;
                var bh = bbox.height;

                var w = _this.width;
                var h = _this.height;

                var r = 0;

                var fontSize = titleLabel.getBBox().height / 2;
                var inside = _this.inside;
                var titleAlign = _this.titleAlign;

                switch (_this.position) {
                    case "top":
                        if (titleAlign == "left") {
                            tx = -1;
                        } else if (titleAlign == "right") {
                            tx = w;
                        } else {
                            tx = w / 2;
                        }

                        ty = by - 10 - fontSize;
                        break;
                    case "bottom":
                        if (titleAlign == "left") {
                            tx = -1;
                        } else if (titleAlign == "right") {
                            tx = w;
                        } else {
                            tx = w / 2;
                        }

                        ty = by + bh + 10 + fontSize;
                        break;
                    case "left":
                        tx = bx - 10 - fontSize;

                        if (inside) {
                            tx -= 5;
                        }
                        if (titleAlign == "left") {
                            ty = h + 1;
                        } else if (titleAlign == "right") {
                            ty = -1;
                        } else {
                            ty = h / 2;
                        }
                        r = -90;

                        ty += _this.titleDY;

                        break;
                    case "right":
                        tx = bx + bw + 10 + fontSize;
                        if (inside) {
                            tx += 7;
                        }
                        if (titleAlign == "left") {
                            ty = h + 2;
                        } else if (titleAlign == "right") {
                            ty = -2;
                        } else {
                            ty = h / 2;
                        }
                        ty += _this.titleDY;
                        r = -90;
                        break;
                }

                if (_this.marginsChanged) {
                    titleLabel.translate(tx, ty);
                    _this.tx = tx;
                    _this.ty = ty;
                } else {
                    titleLabel.translate(_this.tx, _this.ty);
                }

                _this.marginsChanged = false;

                if (!isNaN(_this.titleRotation)) {
                    r = _this.titleRotation;
                }
                if (r !== 0) {
                    titleLabel.rotate(r);
                }
            }
        },

        pushAxisItem: function(axisItem, above) {
            var _this = this;

            var axisItemGraphics = axisItem.graphics();
            if (axisItemGraphics.length() > 0) {
                if (above) {
                    _this.labelsSet.push(axisItemGraphics);
                } else {
                    _this.set.push(axisItemGraphics);
                }
            }

            var label = axisItem.getLabel();
            if (label) {
                this.labelsSet.push(label);

                label.click(function(ev) {
                    _this.handleMouse(ev, axisItem, "clickItem");
                }).mouseover(function(ev) {
                    _this.handleMouse(ev, axisItem, "rollOverItem");
                }).mouseout(function(ev) {
                    _this.handleMouse(ev, axisItem, "rollOutItem");
                });
            }
        },

        handleMouse: function(ev, axisItem, type) {
            var _this = this;

            var e = {
                type: type,
                value: axisItem.value,
                serialDataItem: axisItem.serialDataItem,
                axis: _this,
                target: axisItem.label,
                chart: _this.chart,
                event: ev
            };
            _this.fire(e);
        },

        addGuide: function(guide) {
            var _this = this;
            var guides = _this.guides;
            var isInArray = false;
            var c = guides.length;
            for (var i = 0; i < guides.length; i++) {
                if (guides[i] == guide) {
                    isInArray = true;
                    c = i;
                }
            }

            guide = AmCharts.processObject(guide, AmCharts.Guide, _this.theme);

            if (!guide.id) {
                guide.id = "guideAuto" + c + "_" + new Date().getTime();
            }

            if (!isInArray) {
                guides.push(guide);
            }
        },

        removeGuide: function(guide) {
            var guides = this.guides;
            var i;
            for (i = 0; i < guides.length; i++) {
                if (guides[i] == guide) {
                    guides.splice(i, 1);
                }
            }
        },

        handleGuideOver: function(guide) {
            var _this = this;
            clearTimeout(_this.chart.hoverInt);
            var bbox = guide.graphics.getBBox();
            var x = _this.x + bbox.x + bbox.width / 2;
            var y = _this.y + bbox.y + bbox.height / 2;
            var color = guide.fillColor;
            if (color === undefined) {
                color = guide.lineColor;
            }
            _this.chart.showBalloon(guide.balloonText, color, true, x, y);
        },

        handleGuideOut: function() {
            this.chart.hideBalloon();
        },

        addEventListeners: function(graphics, guide) {
            var _this = this;
            graphics.mouseover(function() {
                _this.handleGuideOver(guide);
            });
            graphics.touchstart(function() {
                _this.handleGuideOver(guide);
            });
            graphics.mouseout(function() {
                _this.handleGuideOut(guide);
            });
        },


        getBBox: function() {
            var _this = this;
            var bbox;
            if (_this.labelsSet) {
                bbox = _this.labelsSet.getBBox();
            }

            if (bbox) {
                if (!AmCharts.VML) {
                    bbox = ({
                        x: (bbox.x + _this.x),
                        y: (bbox.y + _this.y),
                        width: bbox.width,
                        height: bbox.height
                    });
                }
            } else {
                bbox = {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                };
            }
            return bbox;
        },

        destroy: function() {
            var _this = this;

            AmCharts.remove(_this.set);
            AmCharts.remove(_this.labelsSet);

            var axisLine = _this.axisLine;
            if (axisLine) {
                AmCharts.remove(axisLine.axisSet);
            }
            AmCharts.remove(_this.grid0);
        },

        chooseMinorFrequency: function(frequency) {
            for (var i = 10; i > 0; i--) {
                if (frequency / i == Math.round(frequency / i)) {
                    return frequency / i;
                }
            }
        },


        parseDatesDraw: function() {
            var _this = this;
            var i;
            var chart = _this.chart;
            var showFirstLabel = _this.showFirstLabel;
            var showLastLabel = _this.showLastLabel;
            var coord;
            var valueText = "";
            var minPeriodObj = AmCharts.extractPeriod(_this.minPeriod);
            var minDuration = AmCharts.getPeriodDuration(minPeriodObj.period, minPeriodObj.count);
            var previousTime;
            var previousTimeReal;
            var periodWidth;
            var periodCount;
            var time;
            var biggerPeriodChanged;
            var dateFormat;
            var firstDayOfWeek = _this.firstDayOfWeek;
            var boldPeriodBeginning = _this.boldPeriodBeginning;
            var bold;
            var axisItem;
            var minorGridEnabled = _this.minorGridEnabled;
            var minorGridFrequency;
            var gridAlphaReal = _this.gridAlpha;
            var minorPeriodDuration;
            var mAxisItem;
            var periodObj = _this.choosePeriod(0);
            var period = periodObj.period;
            var periodMultiplier = periodObj.count;
            var periodDuration = AmCharts.getPeriodDuration(period, periodMultiplier);

            // check if this period is not shorter then minPeriod
            if (periodDuration < minDuration) {
                period = minPeriodObj.period;
                periodMultiplier = minPeriodObj.count;
                periodDuration = minDuration;
            }

            var periodReal = period;

            // weeks don't have format, swith to days
            if (periodReal == "WW") {
                periodReal = "DD";
            }

            _this.stepWidth = _this.getStepWidth(_this.timeDifference);
            var gridCount = Math.ceil(_this.timeDifference / periodDuration) + 5;

            //previousTime = AmCharts.resetDateToMin(new Date(_this.startTime - periodDuration * periodMultiplier), period, periodMultiplier, firstDayOfWeek).getTime();
            // 2.10.7
            previousTime = AmCharts.resetDateToMin(new Date(_this.startTime - periodDuration), period, periodMultiplier, firstDayOfWeek).getTime();

            var startTime = previousTime;

            // if this is pure period (no numbers and not a week), place the value in the middle
            if ((periodReal == period && periodMultiplier == 1 && _this.centerLabelOnFullPeriod) || _this.autoWrap || _this.centerLabels) {
                periodWidth = periodDuration * _this.stepWidth;
                if (_this.autoWrap && !_this.centerLabels) {
                    periodWidth = -periodWidth; // dirty hack to know about align
                }
            }

            _this.cellWidth = minDuration * _this.stepWidth;

            periodCount = Math.round(previousTime / periodDuration);

            var start = -1;
            if (periodCount / 2 == Math.round(periodCount / 2)) {
                start = -2;
                previousTime -= periodDuration;
            }

            var initialTime = _this.firstTime;
            // delta time is used to fix a problem which happens because month duration is not the same all the time
            var deltaTime = 0;
            var labelShift = 0;

            if (minorGridEnabled && periodMultiplier > 1) {
                minorGridFrequency = _this.chooseMinorFrequency(periodMultiplier);
                minorPeriodDuration = AmCharts.getPeriodDuration(period, minorGridFrequency);
                if (period == "DD") {
                    minorPeriodDuration += AmCharts.getPeriodDuration("hh"); // solves minor grid and daylight saving prob
                }
            }

            if (_this.gridCountR > 0) {
                if (gridCount - 5 - start > _this.autoRotateCount) {
                    if (!isNaN(_this.autoRotateAngle)) {
                        _this.labelRotationR = _this.autoRotateAngle; // not very good
                    }
                }

                for (i = start; i <= gridCount; i++) {
                    //time = previousTime + periodDuration * 1.1;
                    time = initialTime + periodDuration * (i + Math.floor((startTime - initialTime) / periodDuration)) - deltaTime;

                    if (period == "DD") {
                        time += 3600000; // this should fix daylight saving errors - otherwise double grid appears or the gap between grid lines is bigger
                    }
                    time = AmCharts.resetDateToMin(new Date(time), period, periodMultiplier, firstDayOfWeek).getTime();

                    //if (time != previousTime) {
                    // fixing not equal month duration problem
                    if (period == "MM") {
                        var mult = (time - previousTime) / periodDuration;
                        if ((time - previousTime) / periodDuration >= 1.5) {
                            //time = time - (mult - 1) * periodDuration; 3.3.6
                            time = time - (mult - 1) * periodDuration + AmCharts.getPeriodDuration("DD", 3); // add extra 3 days, as month length is not equal and might remove too much sometimes
                            time = AmCharts.resetDateToMin(new Date(time), period, 1).getTime(); // this is new (3.3.7), as we add 3 days above
                            deltaTime += periodDuration;
                        }
                    }

                    coord = (time - _this.startTime) * _this.stepWidth;

                    if (chart.type == "radar") {
                        coord = _this.axisWidth - coord;
                        if (coord < 0 || coord > _this.axisWidth) {
                            continue;
                        }
                    } else {
                        if (_this.rotate) {
                            if (_this.type == "date") {
                                if (_this.gridPosition == "middle") {
                                    labelShift = -periodDuration * _this.stepWidth / 2;
                                }
                            }

                        } else {
                            // value axis
                            if (_this.type == "date") {
                                coord = _this.axisWidth - coord;
                            }
                        }
                    }

                    biggerPeriodChanged = false;

                    if (_this.nextPeriod[periodReal]) {
                        biggerPeriodChanged = _this.checkPeriodChange(_this.nextPeriod[periodReal], 1, time, previousTime, periodReal);
                    }

                    bold = false;

                    if (biggerPeriodChanged && _this.markPeriodChange) {
                        dateFormat = _this.dateFormatsObject[_this.nextPeriod[periodReal]];

                        if (_this.twoLineMode) {
                            dateFormat = _this.dateFormatsObject[periodReal] + "\n" + dateFormat;
                            dateFormat = AmCharts.fixBrakes(dateFormat);
                        }
                        bold = true;
                    } else {
                        dateFormat = _this.dateFormatsObject[periodReal];
                    }

                    if (!boldPeriodBeginning) {
                        bold = false;
                    }

                    _this.currentDateFormat = dateFormat;

                    valueText = AmCharts.formatDate(new Date(time), dateFormat, chart);

                    if ((i == start && !showFirstLabel) || (i == gridCount && !showLastLabel)) {
                        valueText = " ";
                    }

                    if (_this.labelFunction) {
                        valueText = _this.labelFunction(valueText, new Date(time), this, period, periodMultiplier, previousTimeReal).toString();
                    }

                    if (_this.boldLabels) {
                        bold = true;
                    }
                    // draw grid

                    axisItem = new _this.axisItemRenderer(this, coord, valueText, false, periodWidth, labelShift, false, bold);
                    _this.pushAxisItem(axisItem);

                    previousTime = time;
                    previousTimeReal = time;

                    // minor grid
                    if (!isNaN(minorGridFrequency)) {
                        for (var g = 1; g < periodMultiplier; g = g + minorGridFrequency) {
                            _this.gridAlpha = _this.minorGridAlpha;
                            //var mtime = time + minorPeriodDuration * (g + 0.1 + Math.floor((startTime - initialTime) / minorPeriodDuration));
                            var mtime = time + minorPeriodDuration * g;
                            mtime = AmCharts.resetDateToMin(new Date(mtime), period, minorGridFrequency, firstDayOfWeek).getTime();
                            var mcoord = (mtime - _this.startTime) * _this.stepWidth;
                            mAxisItem = new _this.axisItemRenderer(this, mcoord, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
                            _this.pushAxisItem(mAxisItem);
                        }
                    }
                    _this.gridAlpha = gridAlphaReal;
                }
            }
        },


        choosePeriod: function(index) {
            var _this = this;
            var periodDuration = AmCharts.getPeriodDuration(_this.periods[index].period, _this.periods[index].count);
            var count = Math.ceil(_this.timeDifference / periodDuration);
            var periods = _this.periods;

            var gridCount = _this.gridCountR;
            if (_this.timeDifference < periodDuration && index > 0) {
                return periods[index - 1];
            }

            if (count <= gridCount) {
                return periods[index];
            } else {
                if (index + 1 < periods.length) {
                    return _this.choosePeriod(index + 1);
                } else {
                    return periods[index];
                }
            }
        },

        getStepWidth: function(valueCount) {
            var _this = this;
            var stepWidth;

            if (_this.startOnAxis) {
                stepWidth = _this.axisWidth / (valueCount - 1);

                if (valueCount == 1) {
                    stepWidth = _this.axisWidth;
                }
            } else {
                stepWidth = _this.axisWidth / valueCount;
            }
            return stepWidth;
        },



        timeZoom: function(startTime, endTime) {
            var _this = this;
            _this.startTime = startTime;
            _this.endTime = endTime;
        },

        minDuration: function() {
            var _this = this;
            var minPeriodObj = AmCharts.extractPeriod(_this.minPeriod);
            return AmCharts.getPeriodDuration(minPeriodObj.period, minPeriodObj.count);
        },

        checkPeriodChange: function(period, count, time, previousTime, previousPeriod) {
            var currentDate = new Date(time);
            var previousDate = new Date(previousTime);

            var firstDayOfWeek = this.firstDayOfWeek;
            var realCount = count;
            if (period == "DD") {
                count = 1;
            }

            var current = AmCharts.resetDateToMin(currentDate, period, count, firstDayOfWeek).getTime();
            var previous = AmCharts.resetDateToMin(previousDate, period, count, firstDayOfWeek).getTime();

            if (period == "DD" && previousPeriod != "hh") {
                if (current - previous < AmCharts.getPeriodDuration(period, realCount)) { // 3.14.6 fixing prob with equal spacing, removed =.
                    return false;
                }
            }

            if (current != previous) {
                return true;
            } else {
                return false;
            }
        },


        generateDFObject: function() {
            var _this = this;
            _this.dateFormatsObject = {};
            var i;
            for (i = 0; i < _this.dateFormats.length; i++) {
                var df = _this.dateFormats[i];
                _this.dateFormatsObject[df.period] = df.format;
            }
        },


        /// BALLOON
        hideBalloon: function() {
            var _this = this;
            if (_this.balloon) {
                if (_this.balloon.hide) {
                    _this.balloon.hide();
                }
            }
            _this.prevBX = NaN;
            _this.prevBY = NaN;
        },

        formatBalloonText: function(text) {
            return text;
        },

        showBalloon: function(x, y, format, skip) {
            var _this = this;

            var offset = _this.offset;
            switch (_this.position) {
                case "bottom":
                    y = _this.height + offset;
                    break;
                case "top":
                    y = -offset;
                    break;
                case "left":
                    x = -offset;
                    break;
                case "right":
                    x = _this.width + offset;
                    break;
            }

            if (!format) {
                format = _this.currentDateFormat;
            }

            var text;
            if (_this.orientation == "V") {
                if (y < 0 || y > _this.height) {
                    return;
                }

                if (!isNaN(y)) {
                    y = _this.adjustBalloonCoordinate(y, skip);
                    text = _this.coordinateToValue(y);
                } else {
                    _this.hideBalloon();
                    return;
                }
            } else {
                if (x < 0 || x > _this.width) {
                    return;
                }
                if (!isNaN(x)) {
                    x = _this.adjustBalloonCoordinate(x, skip);
                    text = _this.coordinateToValue(x);
                } else {
                    _this.hideBalloon();
                    return;
                }
            }

            var chart = _this.chart;
            var index;
            var chartCursor = chart.chartCursor;
            if (chartCursor) {
                index = chartCursor.index;
            }

            if (_this.balloon && text !== undefined) {
                if (_this.balloon.enabled) {
                    if (_this.balloonTextFunction) {
                        if (_this.type == "date" || _this.parseDates === true) {
                            text = new Date(text);
                        }
                        text = _this.balloonTextFunction(text);
                    } else if (_this.balloonText) {
                        text = _this.formatBalloonText(_this.balloonText, index, format);
                    } else {
                        if (!isNaN(text)) {
                            text = _this.formatValue(text, format);
                        }
                    }

                    if (x != _this.prevBX || y != _this.prevBY) {
                        _this.balloon.setPosition(x, y);
                        _this.prevBX = x;
                        _this.prevBY = y;
                        if (text) {
                            _this.balloon.showBalloon(text);
                        }
                    }
                }
            }
        },

        adjustBalloonCoordinate: function(coordinate) {
            return coordinate;
        },

        createBalloon: function() {
            var _this = this;
            var chart = _this.chart;
            var chartCursor = chart.chartCursor;

            if (chartCursor) {
                var cursorPosition = chartCursor.cursorPosition;
                if (cursorPosition != "mouse") {
                    _this.stickBalloonToCategory = true;
                }
                if (cursorPosition == "start") {
                    _this.stickBalloonToStart = true;
                }
                if (_this.cname == "ValueAxis") {
                    _this.stickBalloonToCategory = false;
                }
            }

            if (_this.balloon) {
                if (_this.balloon.destroy) {
                    _this.balloon.destroy();
                }
                AmCharts.extend(_this.balloon, chart.balloon, true);
            }

        },

        setBalloonBounds: function() {
            var _this = this;
            var balloon = _this.balloon;

            if (balloon) {
                var chart = _this.chart;

                balloon.cornerRadius = 0;
                balloon.shadowAlpha = 0;
                balloon.borderThickness = 1;
                balloon.borderAlpha = 1;
                balloon.adjustBorderColor = false;
                balloon.showBullet = false;

                _this.balloon = balloon;
                balloon.chart = chart;
                balloon.mainSet = chart.plotBalloonsSet;
                balloon.pointerWidth = _this.tickLength;
                if (_this.parseDates || _this.type == "date") {
                    balloon.pointerWidth = 0;
                }
                balloon.className = _this.id;

                // set pointer orientation
                var pointerOrientation = "V";

                if (_this.orientation == "V") {
                    pointerOrientation = "H";
                }

                // otherwise the balloon will not follow line excatly
                if (!_this.stickBalloonToCategory) {
                    balloon.animationDuration = 0;
                }
                var position = _this.position;

                // set bounds
                var l, r, t, b;
                var inside = _this.inside;
                var width = _this.width;
                var height = _this.height;
                var max = 1000;


                switch (position) {
                    case "bottom":
                        l = 0;
                        r = width;
                        if (inside) {
                            t = 0;
                            b = height;
                        } else {
                            t = height;
                            b = height + max;
                        }

                        break;
                    case "top":
                        l = 0;
                        r = width;
                        if (inside) {
                            t = 0;
                            b = height;
                        } else {
                            t = -max;
                            b = 0;
                        }
                        break;
                    case "left":
                        t = 0;
                        b = height;
                        if (inside) {
                            l = 0;
                            r = width;
                        } else {
                            l = -max;
                            r = 0;
                        }
                        break;
                    case "right":
                        t = 0;
                        b = height;
                        if (inside) {
                            l = 0;
                            r = width;
                        } else {
                            l = width;
                            r = width + max;
                        }
                        break;

                }
                if (!balloon.drop) {
                    balloon.pointerOrientation = pointerOrientation;
                }
                balloon.setBounds(l, t, r, b);
            }
        }
    });
})();
(function() {
    "use strict";
    var AmCharts = window.AmCharts;

    AmCharts.CategoryAxis = AmCharts.Class({

        inherits: AmCharts.AxisBase,

        construct: function(theme) {
            var _this = this;
            _this.cname = "CategoryAxis";
            AmCharts.CategoryAxis.base.construct.call(_this, theme);
            _this.minPeriod = "DD";
            _this.parseDates = false;
            _this.equalSpacing = false;
            _this.position = "bottom";
            _this.startOnAxis = false;
            _this.gridPosition = "middle";

            _this.safeDistance = 30;


            //_this.categoryFunction;

            _this.stickBalloonToCategory = false;

            AmCharts.applyTheme(_this, theme, _this.cname);
        },


        draw: function() {
            var _this = this;
            AmCharts.CategoryAxis.base.draw.call(_this);

            _this.generateDFObject();

            var data = _this.chart.chartData;
            _this.data = data;

            _this.labelRotationR = _this.labelRotation;
            _this.type = null;

            if (AmCharts.ifArray(data)) {
                var i;
                var chart = _this.chart;

                var axisName = "category-axis";
                if (_this.id != "scrollbar") {
                    AmCharts.setCN(chart, _this.set, axisName);
                    AmCharts.setCN(chart, _this.labelsSet, axisName);
                    AmCharts.setCN(chart, _this.axisLine.axisSet, axisName);
                } else {
                    _this.bcn = _this.id + "-";
                }

                var end = _this.end;
                var start = _this.start;
                var labelFrequency = _this.labelFrequency;
                var startFrom = 0;
                var valueCount = end - start + 1;
                var gridCount = _this.gridCountR;
                var showFirstLabel = _this.showFirstLabel;
                var showLastLabel = _this.showLastLabel;
                var coord;
                var below;
                var valueText = "";
                var minPeriodObj = AmCharts.extractPeriod(_this.minPeriod);
                var minDuration = AmCharts.getPeriodDuration(minPeriodObj.period, minPeriodObj.count);
                var periodObj;
                var periodMultiplier;
                var period;
                var periodDuration;
                var periodReal;
                var previousTime;
                var previousTimeReal;
                var periodCount;
                var time;
                var biggerPeriodChanged;
                var dateFormat;
                var realStartFrom;
                var rotate = _this.rotate;
                var firstDayOfWeek = _this.firstDayOfWeek;
                var boldPeriodBeginning = _this.boldPeriodBeginning;
                var lastTime = data[data.length - 1].time;
                var maxTime = AmCharts.resetDateToMin(new Date(lastTime + minDuration * 1.05), _this.minPeriod, 1, firstDayOfWeek).getTime();
                _this.firstTime = chart.firstTime;
                var bold;
                var axisItem;
                var UNDEFINED;

                if (_this.endTime > maxTime) {
                    _this.endTime = maxTime;
                }

                var minorGridEnabled = _this.minorGridEnabled;
                var minorGridFrequency;
                var gridAlphaReal = _this.gridAlpha;
                var minorPeriodDuration;

                var serialDataItem;
                var sum = 0;
                var prevCoord = 0;
                if (_this.widthField) {
                    for (i = _this.start; i <= _this.end; i++) {
                        serialDataItem = _this.data[i];
                        if (serialDataItem) {
                            var widthValue = Number(_this.data[i].dataContext[_this.widthField]);
                            if (!isNaN(widthValue)) {
                                sum += widthValue;
                                serialDataItem.widthValue = widthValue;
                            }
                        }
                    }
                }

                // PARSE DATES
                if (_this.parseDates && !_this.equalSpacing) {
                    _this.lastTime = data[data.length - 1].time;
                    _this.maxTime = AmCharts.resetDateToMin(new Date(_this.lastTime + minDuration * 1.05), _this.minPeriod, 1, firstDayOfWeek).getTime();
                    _this.timeDifference = _this.endTime - _this.startTime;
                    _this.parseDatesDraw();
                }
                // DO NOT PARSE DATES
                else if (!_this.parseDates) {

                    _this.cellWidth = _this.getStepWidth(valueCount);

                    // in case there are more values when gridlines, fix the gridCount
                    if (valueCount < gridCount) {
                        gridCount = valueCount;
                    }

                    startFrom += _this.start;

                    _this.stepWidth = _this.getStepWidth(valueCount);

                    if (gridCount > 0) {
                        var gridFrequency = Math.floor(valueCount / gridCount);
                        minorGridFrequency = _this.chooseMinorFrequency(gridFrequency);

                        realStartFrom = startFrom;
                        if (realStartFrom / 2 == Math.round(realStartFrom / 2)) {
                            realStartFrom--;
                        }

                        if (realStartFrom < 0) {
                            realStartFrom = 0;
                        }

                        var realCount = 0;

                        if (_this.widthField) {
                            realStartFrom = _this.start;
                        }

                        if (_this.end - realStartFrom + 1 >= _this.autoRotateCount) {
                            _this.labelRotationR = _this.autoRotateAngle;
                        }

                        for (i = realStartFrom; i <= _this.end + 2; i++) {
                            var sDataItem;
                            var forceShow = false;
                            if (i >= 0 && i < _this.data.length) {
                                sDataItem = _this.data[i];
                                valueText = sDataItem.category;
                                forceShow = sDataItem.forceShow;
                            } else {
                                valueText = "";
                            }

                            if (minorGridEnabled && !isNaN(minorGridFrequency)) {
                                if (i / minorGridFrequency != Math.round(i / minorGridFrequency) && !forceShow) {
                                    continue;
                                } else {
                                    if (i / gridFrequency == Math.round(i / gridFrequency) || forceShow) {

                                    } else {
                                        _this.gridAlpha = _this.minorGridAlpha;
                                        valueText = UNDEFINED;
                                    }
                                }
                            } else {
                                if (i / gridFrequency != Math.round(i / gridFrequency) && !forceShow) {
                                    continue;
                                }
                            }

                            coord = _this.getCoordinate(i - startFrom);



                            var vShift = 0;
                            if (_this.gridPosition == "start") {
                                coord = coord - _this.cellWidth / 2;
                                vShift = _this.cellWidth / 2;
                            }
                            below = true;
                            var tickShift = vShift;
                            if (_this.tickPosition == "start") {
                                tickShift = 0;
                                below = false;
                                vShift = 0;
                            }

                            if ((i == start && !showFirstLabel) || (i == _this.end && !showLastLabel)) {
                                valueText = UNDEFINED;
                            }

                            if (Math.round(realCount / labelFrequency) != realCount / labelFrequency) {
                                valueText = UNDEFINED;
                            }

                            realCount++;

                            var cellW = _this.cellWidth;
                            if (rotate) {
                                cellW = NaN;
                                if (_this.ignoreAxisWidth || !chart.autoMargins) {
                                    if (_this.position == "right") {
                                        cellW = chart.marginRight;
                                    } else {
                                        cellW = chart.marginLeft;
                                    }
                                    cellW -= _this.tickLength + 10;
                                }
                            }

                            if (_this.labelFunction && sDataItem) {
                                valueText = _this.labelFunction(valueText, sDataItem, this);
                            }
                            valueText = AmCharts.fixBrakes(valueText);

                            bold = false;
                            if (_this.boldLabels) {
                                bold = true;
                            }

                            // this adds last tick
                            if (i > _this.end && _this.tickPosition == "start") {
                                valueText = " ";
                            }

                            // this makes axis labels to be centered if chart is rotated and inside is set to true. 3.14.5
                            if (_this.rotate && _this.inside) {
                                vShift -= 2;
                            }

                            if (!isNaN(sDataItem.widthValue)) {
                                sDataItem.percentWidthValue = sDataItem.widthValue / sum * 100;
                                if (_this.rotate) {
                                    cellW = _this.height * sDataItem.widthValue / sum;
                                } else {
                                    cellW = _this.width * sDataItem.widthValue / sum;
                                }
                                coord = prevCoord;
                                prevCoord += cellW;
                                vShift = cellW / 2;
                            }

                            axisItem = new _this.axisItemRenderer(this, coord, valueText, below, cellW, vShift, UNDEFINED, bold, tickShift, false, sDataItem.labelColor, sDataItem.className);
                            axisItem.serialDataItem = sDataItem;
                            _this.pushAxisItem(axisItem);

                            _this.gridAlpha = gridAlphaReal;
                        }
                    }
                }

                // PARSE, BUT EQUAL SPACING
                else if (_this.parseDates && _this.equalSpacing) {
                    startFrom = _this.start;
                    _this.startTime = _this.data[_this.start].time;
                    _this.endTime = _this.data[_this.end].time;

                    _this.timeDifference = _this.endTime - _this.startTime;

                    periodObj = _this.choosePeriod(0);
                    period = periodObj.period;
                    periodMultiplier = periodObj.count;
                    periodDuration = AmCharts.getPeriodDuration(period, periodMultiplier);

                    // check if this period is not shorter then minPeriod
                    if (periodDuration < minDuration) {
                        period = minPeriodObj.period;
                        periodMultiplier = minPeriodObj.count;
                        periodDuration = minDuration;
                    }

                    periodReal = period;
                    // weeks don't have format, swith to days
                    if (periodReal == "WW") {
                        periodReal = "DD";
                    }
                    _this.currentDateFormat = _this.dateFormatsObject[periodReal];
                    _this.stepWidth = _this.getStepWidth(valueCount);

                    gridCount = Math.ceil(_this.timeDifference / periodDuration) + 1;

                    previousTime = AmCharts.resetDateToMin(new Date(_this.startTime - periodDuration), period, periodMultiplier, firstDayOfWeek).getTime();

                    _this.cellWidth = _this.getStepWidth(valueCount);

                    periodCount = Math.round(previousTime / periodDuration);

                    start = -1;
                    if (periodCount / 2 == Math.round(periodCount / 2)) {
                        start = -2;
                        previousTime -= periodDuration;
                    }

                    realStartFrom = _this.start;

                    if (realStartFrom / 2 == Math.round(realStartFrom / 2)) {
                        realStartFrom--;
                    }

                    if (realStartFrom < 0) {
                        realStartFrom = 0;
                    }

                    var realEnd = _this.end + 2;
                    if (realEnd >= _this.data.length) {
                        realEnd = _this.data.length;
                    }

                    // first must be skipped if more data items then gridcount
                    var thisIsFirst = false;

                    thisIsFirst = !showFirstLabel;

                    _this.previousPos = -1000;

                    if (_this.labelRotationR > 20) {
                        _this.safeDistance = 5;
                    }

                    var realRealStartFrom = realStartFrom;
                    // find second period change to avoid small gap between first label and the second
                    if (_this.data[realStartFrom].time != AmCharts.resetDateToMin(new Date(_this.data[realStartFrom].time), period, periodMultiplier, firstDayOfWeek).getTime()) {
                        var cc = 0;
                        var tempPreviousTime = previousTime;
                        for (i = realStartFrom; i < realEnd; i++) {
                            time = _this.data[i].time;

                            if (_this.checkPeriodChange(period, periodMultiplier, time, tempPreviousTime)) {
                                cc++;
                                if (cc >= 2) {
                                    realRealStartFrom = i;
                                    i = realEnd;
                                }
                                tempPreviousTime = time;
                            }
                        }
                    }

                    if (minorGridEnabled && periodMultiplier > 1) {
                        minorGridFrequency = _this.chooseMinorFrequency(periodMultiplier);
                        minorPeriodDuration = AmCharts.getPeriodDuration(period, minorGridFrequency);
                    }

                    if (_this.gridCountR > 0) {
                        for (i = realStartFrom; i < realEnd; i++) {
                            time = _this.data[i].time;

                            if (_this.checkPeriodChange(period, periodMultiplier, time, previousTime) && i >= realRealStartFrom) {

                                coord = _this.getCoordinate(i - _this.start);

                                biggerPeriodChanged = false;
                                if (_this.nextPeriod[periodReal]) {
                                    biggerPeriodChanged = _this.checkPeriodChange(_this.nextPeriod[periodReal], 1, time, previousTime, periodReal);

                                    if (biggerPeriodChanged) {
                                        var resetedTime = AmCharts.resetDateToMin(new Date(time), _this.nextPeriod[periodReal], 1, firstDayOfWeek).getTime();

                                        if (resetedTime != time) {
                                            biggerPeriodChanged = false;
                                        }
                                    }
                                }

                                bold = false;
                                if (biggerPeriodChanged && _this.markPeriodChange) {
                                    dateFormat = _this.dateFormatsObject[_this.nextPeriod[periodReal]];
                                    bold = true;
                                } else {
                                    dateFormat = _this.dateFormatsObject[periodReal];
                                }

                                valueText = AmCharts.formatDate(new Date(time), dateFormat, chart);

                                if ((i == start && !showFirstLabel) || (i == gridCount && !showLastLabel)) {
                                    valueText = " ";
                                }

                                if (!thisIsFirst) {
                                    if (!boldPeriodBeginning) {
                                        bold = false;
                                    }

                                    // draw grid
                                    if (coord - _this.previousPos > _this.safeDistance * Math.cos(_this.labelRotationR * Math.PI / 180)) {

                                        if (_this.labelFunction) {
                                            valueText = _this.labelFunction(valueText, new Date(time), this, period, periodMultiplier, previousTimeReal);
                                        }

                                        if (_this.boldLabels) {
                                            bold = true;
                                        }

                                        axisItem = new _this.axisItemRenderer(this, coord, valueText, UNDEFINED, UNDEFINED, UNDEFINED, UNDEFINED, bold);

                                        var axisItemGraphics = axisItem.graphics();
                                        _this.pushAxisItem(axisItem);
                                        var graphicsWidth = axisItemGraphics.getBBox().width;
                                        if (!AmCharts.isModern) {
                                            graphicsWidth -= coord;
                                        }
                                        _this.previousPos = coord + graphicsWidth;


                                    }
                                } else {
                                    thisIsFirst = false;
                                }

                                previousTime = time;
                                previousTimeReal = time;
                            }
                        }
                    }
                }


                // get x's of all categories
                var prevX = 0;
                var xxx;
                for (i = 0; i < _this.data.length; i++) {
                    serialDataItem = _this.data[i];
                    if (serialDataItem) {
                        if (_this.parseDates && !_this.equalSpacing) {
                            var categoryTime = serialDataItem.time;
                            var cellWidth = _this.cellWidth;
                            if (_this.minPeriod == "MM") {
                                var daysInMonth = AmCharts.daysInMonth(new Date(categoryTime));
                                var duration = daysInMonth * 86400000;
                                cellWidth = duration * _this.stepWidth;
                                serialDataItem.cellWidth = cellWidth;
                            }

                            xxx = Math.round((categoryTime - _this.startTime) * _this.stepWidth + cellWidth / 2);
                        } else {
                            xxx = _this.getCoordinate(i - startFrom);
                        }

                        serialDataItem.x[_this.id] = xxx;
                    }
                }

                if (_this.widthField) {
                    for (i = _this.start; i <= _this.end; i++) {
                        serialDataItem = _this.data[i];
                        var widthValue2 = serialDataItem.widthValue;
                        serialDataItem.percentWidthValue = widthValue2 / sum * 100;
                        if (_this.rotate) {
                            xxx = _this.height * widthValue2 / sum / 2 + prevX;
                            prevX = _this.height * widthValue2 / sum + prevX;
                        } else {
                            xxx = _this.width * widthValue2 / sum / 2 + prevX;
                            prevX = _this.width * widthValue2 / sum + prevX;
                        }
                        serialDataItem.x[_this.id] = xxx;
                    }
                }

                // guides
                var count = _this.guides.length;

                for (i = 0; i < count; i++) {
                    var guide = _this.guides[i];
                    var guideToCoord = NaN;
                    var guideCoord = NaN;
                    var valueShift = NaN;
                    var toCategoryIndex = NaN;
                    var categoryIndex = NaN;
                    var above = guide.above;

                    if (guide.toCategory) {
                        toCategoryIndex = chart.getCategoryIndexByValue(guide.toCategory);
                        if (!isNaN(toCategoryIndex)) {
                            guideToCoord = _this.getCoordinate(toCategoryIndex - startFrom);

                            if (guide.expand) {
                                guideToCoord += _this.cellWidth / 2;
                            }

                            axisItem = new _this.axisItemRenderer(this, guideToCoord, "", true, NaN, NaN, guide);
                            _this.pushAxisItem(axisItem, above);
                        }
                    }

                    if (guide.category) {
                        categoryIndex = chart.getCategoryIndexByValue(guide.category);
                        if (!isNaN(categoryIndex)) {
                            guideCoord = _this.getCoordinate(categoryIndex - startFrom);

                            if (guide.expand) {
                                guideCoord -= _this.cellWidth / 2;
                            }

                            valueShift = (guideToCoord - guideCoord) / 2;
                            axisItem = new _this.axisItemRenderer(this, guideCoord, guide.label, true, NaN, valueShift, guide);
                            _this.pushAxisItem(axisItem, above);
                        }
                    }
                    var dataDateFormat = chart.dataDateFormat;
                    if (guide.toDate) {
                        if (dataDateFormat && !(guide.toDate instanceof Date)) {
                            guide.toDate = guide.toDate.toString() + " |";
                        }
                        guide.toDate = AmCharts.getDate(guide.toDate, dataDateFormat);

                        if (_this.equalSpacing) {
                            toCategoryIndex = chart.getClosestIndex(_this.data, "time", guide.toDate.getTime(), false, 0, _this.data.length - 1);
                            if (!isNaN(toCategoryIndex)) {
                                guideToCoord = _this.getCoordinate(toCategoryIndex - startFrom);
                            }
                        } else {
                            guideToCoord = (guide.toDate.getTime() - _this.startTime) * _this.stepWidth;
                        }
                        axisItem = new _this.axisItemRenderer(this, guideToCoord, "", true, NaN, NaN, guide);
                        _this.pushAxisItem(axisItem, above);
                    }

                    if (guide.date) {
                        if (dataDateFormat && !(guide.date instanceof Date)) {
                            guide.date = guide.date.toString() + " |";
                        }
                        guide.date = AmCharts.getDate(guide.date, dataDateFormat);

                        if (_this.equalSpacing) {
                            categoryIndex = chart.getClosestIndex(_this.data, "time", guide.date.getTime(), false, 0, _this.data.length - 1);
                            if (!isNaN(categoryIndex)) {
                                guideCoord = _this.getCoordinate(categoryIndex - startFrom);
                            }
                        } else {
                            guideCoord = (guide.date.getTime() - _this.startTime) * _this.stepWidth;
                        }

                        valueShift = (guideToCoord - guideCoord) / 2;

                        below = true;
                        if (guide.toDate) {
                            below = false;
                        }

                        if (_this.orientation == "H") {
                            axisItem = new _this.axisItemRenderer(this, guideCoord, guide.label, below, valueShift * 2, NaN, guide);
                        } else {
                            axisItem = new _this.axisItemRenderer(this, guideCoord, guide.label, false, NaN, valueShift, guide);
                        }
                        _this.pushAxisItem(axisItem, above);
                    }


                    if (guideToCoord > 0 || guideCoord > 0) {
                        var draw = false;
                        if (_this.rotate) {
                            if (guideToCoord < _this.height || guideCoord < _this.height) {
                                draw = true;
                            }
                        } else {
                            if (guideToCoord < _this.width || guideCoord < _this.width) {
                                draw = true;
                            }
                        }
                        if (draw) {
                            var guideFill = new _this.guideFillRenderer(this, guideCoord, guideToCoord, guide);
                            var guideFillGraphics = guideFill.graphics();
                            _this.pushAxisItem(guideFill, above);
                            guide.graphics = guideFillGraphics;
                            guideFillGraphics.index = i;

                            if (guide.balloonText) {
                                _this.addEventListeners(guideFillGraphics, guide);
                            }
                        }
                    }
                }

                var chartCursor = chart.chartCursor;
                if (chartCursor) {
                    if (rotate) {
                        chartCursor.fixHeight(_this.cellWidth);
                    } else {
                        chartCursor.fixWidth(_this.cellWidth);
                        if (chartCursor.fullWidth) {
                            if (_this.balloon) {
                                _this.balloon.minWidth = _this.cellWidth;
                            }
                        }
                    }
                }
                _this.previousHeight = currentHeight;
            }

            _this.axisCreated = true;

            _this.set.translate(_this.x, _this.y);
            _this.labelsSet.translate(_this.x, _this.y);
            _this.labelsSet.show();
            _this.positionTitle();
            var axisLine = _this.axisLine.set;
            if (axisLine) {
                axisLine.toFront();
            }

            var currentHeight = _this.getBBox().height;
            if ((currentHeight - _this.previousHeight) > 2 && _this.autoWrap && !_this.parseDates) {
                _this.chart.marginsUpdated = false;
                _this.axisCreated = false;
            }
        },


        xToIndex: function(x) {
            var _this = this;
            var data = _this.data;
            var chart = _this.chart;
            var rotate = chart.rotate;
            var stepWidth = _this.stepWidth;
            var index;
            if (_this.parseDates && !_this.equalSpacing) {
                var time = _this.startTime + Math.round(x / stepWidth) - _this.minDuration() / 2;
                index = chart.getClosestIndex(data, "time", time, false, _this.start, _this.end + 1);
            } else {
                if (_this.widthField) {
                    var minDistance = Infinity;
                    for (var i = _this.start; i <= _this.end; i++) {
                        var serialDataItem = _this.data[i];
                        if (serialDataItem) {
                            var xx = Math.abs(serialDataItem.x[_this.id] - x);
                            if (xx < minDistance) {
                                minDistance = xx;
                                index = i;
                            }
                        }
                    }
                } else {
                    if (!_this.startOnAxis) {
                        x -= stepWidth / 2;
                    }
                    index = _this.start + Math.round(x / stepWidth);
                }
            }

            index = AmCharts.fitToBounds(index, 0, data.length - 1);

            var indexX;
            if (data[index]) {
                indexX = data[index].x[_this.id];
            }

            if (rotate) {
                if (indexX > _this.height + 1) {
                    index--;
                }
                if (indexX < 0) {
                    index++;
                }
            } else {
                if (indexX > _this.width + 1) {
                    index--;
                }
                if (indexX < 0) {
                    index++;
                }
            }

            index = AmCharts.fitToBounds(index, 0, data.length - 1);

            return index;
        },

        dateToCoordinate: function(date) {
            var _this = this;
            if (_this.parseDates && !_this.equalSpacing) {
                return (date.getTime() - _this.startTime) * _this.stepWidth;
            } else if (_this.parseDates && _this.equalSpacing) {
                var index = _this.chart.getClosestIndex(_this.data, "time", date.getTime(), false, 0, _this.data.length - 1);
                return _this.getCoordinate(index - _this.start);
            } else {
                return NaN;
            }
        },

        categoryToCoordinate: function(category) {
            var _this = this;
            if (_this.chart) {
                var index = _this.chart.getCategoryIndexByValue(category);
                if (!isNaN(index)) {
                    return _this.getCoordinate(index - _this.start);
                } else if (_this.parseDates) {
                    return _this.dateToCoordinate(new Date(category));
                }
            } else {
                return NaN;
            }
        },

        coordinateToDate: function(coordinate) {
            var _this = this;
            if (_this.equalSpacing) {
                var index = _this.xToIndex(coordinate);
                return new Date(_this.data[index].time);
            } else {
                return new Date(_this.startTime + coordinate / _this.stepWidth);
            }
        },

        coordinateToValue: function(coordinate) {
            var _this = this;
            var index = _this.xToIndex(coordinate);
            var serialDataItem = _this.data[index];

            if (serialDataItem) {
                if (_this.parseDates) {
                    return serialDataItem.time;
                } else {
                    return serialDataItem.category;
                }
            }
        },

        getCoordinate: function(index) {
            var _this = this;
            var coord = index * _this.stepWidth;

            if (!_this.startOnAxis) {
                coord += _this.stepWidth / 2;
            }

            return Math.round(coord);
        },

        formatValue: function(value, dateFormat) {
            var _this = this;

            if (!dateFormat) {
                dateFormat = _this.currentDateFormat;
            }

            if (_this.parseDates) {
                value = AmCharts.formatDate(new Date(value), dateFormat, _this.chart);
            }
            return value;
        },


        showBalloonAt: function(category) {
            var _this = this;
            var coordinate;
            if (_this.parseDates) {
                coordinate = _this.dateToCoordinate(new Date(category));
            } else {
                coordinate = _this.categoryToCoordinate(category);
            }
            return _this.adjustBalloonCoordinate(coordinate);
        },


        formatBalloonText: function(text, index, dateFormat) {
            var _this = this;
            var category = "";
            var toCategory = "";
            var chart = _this.chart;

            var serialDataItem = _this.data[index];
            if (serialDataItem) {
                if (_this.parseDates) {
                    category = AmCharts.formatDate(serialDataItem.category, dateFormat, chart);

                    var toDate = AmCharts.changeDate(new Date(serialDataItem.category), _this.minPeriod, 1);
                    toCategory = AmCharts.formatDate(toDate, dateFormat, chart);

                    if (category.indexOf("fff") != -1) {
                        category = AmCharts.formatMilliseconds(category, serialDataItem.category);
                        toCategory = AmCharts.formatMilliseconds(toCategory, toDate);
                    }

                } else {

                    var nextDataItem;
                    if (_this.data[index + 1]) {
                        nextDataItem = _this.data[index + 1];
                    }

                    category = AmCharts.fixNewLines(serialDataItem.category);
                    if (nextDataItem) {
                        toCategory = AmCharts.fixNewLines(nextDataItem.category);
                    }
                }
            }

            var catText = text.replace(/\[\[category\]\]/g, String(category));
            catText = catText.replace(/\[\[toCategory\]\]/g, String(toCategory));
            return catText;
        },


        // BALLOON //
        adjustBalloonCoordinate: function(coordinate, skip) {
            var _this = this;
            var index = _this.xToIndex(coordinate);
            var chart = _this.chart;
            var chartCursor = chart.chartCursor;

            if (_this.stickBalloonToCategory) {
                var serialDataItem = _this.data[index];

                if (serialDataItem) {
                    coordinate = serialDataItem.x[_this.id];
                }

                if (_this.stickBalloonToStart) {
                    coordinate -= _this.cellWidth / 2;
                }


                var y = 0;
                if (chartCursor) {
                    var limitToGraph = chartCursor.limitToGraph;
                    if (limitToGraph) {
                        var axisId = limitToGraph.valueAxis.id;
                        if (!limitToGraph.hidden) {
                            y = serialDataItem.axes[axisId].graphs[limitToGraph.id].y;
                        }
                    }

                    if (_this.rotate) {
                        if (_this.position == "left") {
                            if (limitToGraph) {
                                y -= chartCursor.width;
                            }
                            if (y > 0) {
                                y = 0;
                            }
                        } else {
                            if (y < 0) {
                                y = 0;
                            }
                        }

                        chartCursor.fixHLine(coordinate, y);
                    } else {
                        if (_this.position == "top") {
                            if (limitToGraph) {
                                y -= chartCursor.height;
                            }
                            if (y > 0) {
                                y = 0;
                            }
                        } else {
                            if (y < 0) {
                                y = 0;
                            }
                        }

                        chartCursor.fixVLine(coordinate, y);
                    }
                }
            }
            if (chartCursor && !skip) {
                chartCursor.setIndex(index);
                if (_this.parseDates) {
                    chartCursor.setTimestamp(_this.coordinateToDate(coordinate).getTime());
                }
            }
            return coordinate;
        }
    });
})();
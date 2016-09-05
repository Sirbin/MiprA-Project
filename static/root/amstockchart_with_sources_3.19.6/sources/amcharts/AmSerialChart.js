(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.AmSerialChart = AmCharts.Class({

        inherits: AmCharts.AmRectangularChart,

        construct: function(theme) {
            var _this = this;
            _this.type = "serial";
            AmCharts.AmSerialChart.base.construct.call(_this, theme);
            _this.cname = "AmSerialChart";

            _this.theme = theme;

            _this.columnSpacing = 5;
            _this.columnSpacing3D = 0;
            _this.columnWidth = 0.8;

            var categoryAxis = new AmCharts.CategoryAxis(theme);
            categoryAxis.chart = this;
            _this.categoryAxis = categoryAxis;

            _this.zoomOutOnDataUpdate = true;
            _this.skipZoom = false;
            _this.rotate = false;

            _this.mouseWheelScrollEnabled = false;
            _this.mouseWheelZoomEnabled = false;

            // _this.maxSelectedSeries;
            // _this.maxSelectedTime;
            _this.minSelectedTime = 0;

            AmCharts.applyTheme(_this, theme, _this.cname);
        },

        initChart: function() {
            var _this = this;
            AmCharts.AmSerialChart.base.initChart.call(_this);

            _this.updateCategoryAxis(_this.categoryAxis, _this.rotate, "categoryAxis");

            if (_this.dataChanged) {
                _this.parseData();
            } else {
                _this.onDataUpdated();
            }
            _this.drawGraphs = true;
        },

        onDataUpdated: function() {
            var _this = this;
            var columnCount = _this.countColumns();
            var chartData = _this.chartData;
            var graphs = _this.graphs;
            var i;
            for (i = 0; i < graphs.length; i++) {
                var graph = graphs[i];
                graph.data = chartData;
                graph.columnCount = columnCount;
            }

            if (chartData.length > 0) {
                _this.firstTime = _this.getStartTime(chartData[0].time);
                _this.lastTime = _this.getEndTime(chartData[chartData.length - 1].time);
            }

            _this.drawChart();

            if (_this.autoMargins && !_this.marginsUpdated) {
                _this.marginsUpdated = true;
                _this.measureMargins();
            } else {
                _this.dispDUpd();
            }
        },


        handleWheelReal: function(delta, shift) {

            var _this = this;

            if (!_this.wheelBusy) {
                var categoryAxis = _this.categoryAxis;
                var parseDates = categoryAxis.parseDates;
                var minDuration = categoryAxis.minDuration();

                var startSign = 1;
                var endSign = 1;

                if (_this.mouseWheelZoomEnabled) {
                    if (!shift) {
                        startSign = -1;
                    }
                } else {
                    if (shift) {
                        startSign = -1;
                    }
                }

                var newStart;
                var newEnd;
                var dataLength = _this.chartData.length;
                var diff;
                var lastTime = _this.lastTime;
                var firstTime = _this.firstTime;

                if (delta < 0) {
                    if (parseDates) {
                        diff = _this.endTime - _this.startTime;
                        newStart = _this.startTime + startSign * minDuration;
                        newEnd = _this.endTime + endSign * minDuration;

                        if (endSign > 0 && startSign > 0) {
                            if (newEnd >= lastTime) {
                                newEnd = lastTime;
                                newStart = lastTime - diff;
                            }
                        }

                        _this.zoomToDates(new Date(newStart), new Date(newEnd));
                    } else {
                        if (endSign > 0 && startSign > 0) {
                            if (_this.end >= dataLength - 1) {
                                endSign = 0;
                                startSign = 0;
                            }
                        }

                        newStart = _this.start + startSign;
                        newEnd = _this.end + endSign;
                        _this.zoomToIndexes(newStart, newEnd);
                    }
                } else {
                    if (parseDates) {
                        diff = _this.endTime - _this.startTime;
                        newStart = _this.startTime - startSign * minDuration;
                        newEnd = _this.endTime - endSign * minDuration;

                        if (endSign > 0 && startSign > 0) {
                            if (newStart <= firstTime) {
                                newStart = firstTime;
                                newEnd = firstTime + diff;
                            }
                        }

                        _this.zoomToDates(new Date(newStart), new Date(newEnd));
                    } else {
                        // scrolling
                        if (endSign > 0 && startSign > 0) {
                            if (_this.start < 1) {
                                endSign = 0;
                                startSign = 0;
                            }
                        }

                        newStart = _this.start - startSign;
                        newEnd = _this.end - endSign;
                        _this.zoomToIndexes(newStart, newEnd);
                    }
                }
            }
        },

        validateData: function(resetZoom) {
            var _this = this;

            _this.marginsUpdated = false;
            if (_this.zoomOutOnDataUpdate && !resetZoom) {
                _this.start = NaN;
                _this.startTime = NaN;
                _this.end = NaN;
                _this.endTime = NaN;
            }

            AmCharts.AmSerialChart.base.validateData.call(_this);
        },


        drawChart: function() {
            var _this = this;

            if (_this.realWidth > 0 && _this.realHeight > 0) {

                AmCharts.AmSerialChart.base.drawChart.call(_this);

                var chartData = _this.chartData;

                if (AmCharts.ifArray(chartData)) {

                    var chartScrollbar = _this.chartScrollbar;
                    if (chartScrollbar) {
                        if (!_this.marginsUpdated && _this.autoMargins) {
                            // void
                        } else {
                            chartScrollbar.draw();
                        }
                    }

                    var valueScrollbar = _this.valueScrollbar;
                    if (valueScrollbar) {
                        valueScrollbar.draw();
                    }

                    // zoom
                    var last = chartData.length - 1;
                    var start;
                    var end;

                    var categoryAxis = _this.categoryAxis;
                    if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                        start = _this.startTime;
                        end = _this.endTime;

                        if (isNaN(start) || isNaN(end)) {
                            start = _this.firstTime;
                            end = _this.lastTime;
                        }
                    } else {
                        start = _this.start;
                        end = _this.end;

                        if (isNaN(start) || isNaN(end)) {
                            start = 0;
                            end = last;
                        }
                    }

                    _this.start = undefined;
                    _this.end = undefined;
                    _this.startTime = undefined;
                    _this.endTime = undefined;
                    _this.zoom(start, end);
                }
            } else {
                _this.cleanChart();
            }
        },

        cleanChart: function() {
            var _this = this;
            AmCharts.callMethod("destroy", [_this.valueAxes, _this.graphs, _this.categoryAxis, _this.chartScrollbar, _this.chartCursor, _this.valueScrollbar]);
        },


        updateCategoryAxis: function(categoryAxis, rotate, id) {
            var _this = this;
            categoryAxis.chart = this;
            categoryAxis.id = id;
            categoryAxis.rotate = rotate;
            categoryAxis.setOrientation(!_this.rotate);
            categoryAxis.init();
            _this.setAxisRenderers(categoryAxis);
            _this.updateObjectSize(categoryAxis);
        },

        updateValueAxes: function() {
            var _this = this;
            AmCharts.AmSerialChart.base.updateValueAxes.call(_this);

            var valueAxes = _this.valueAxes;
            var i;
            for (i = 0; i < valueAxes.length; i++) {
                var valueAxis = valueAxes[i];
                var rotate = _this.rotate;
                valueAxis.rotate = rotate;
                valueAxis.setOrientation(rotate);

                var categoryAxis = _this.categoryAxis;

                if (!categoryAxis.startOnAxis || categoryAxis.parseDates) {
                    valueAxis.expandMinMax = true;
                }
            }
        },


        getStartTime: function(time) {
            var _this = this;
            var categoryAxis = _this.categoryAxis;
            return AmCharts.resetDateToMin(new Date(time), categoryAxis.minPeriod, 1, categoryAxis.firstDayOfWeek).getTime();
        },

        getEndTime: function(time) {
            var _this = this;
            var categoryAxis = _this.categoryAxis;
            var minPeriodObj = AmCharts.extractPeriod(categoryAxis.minPeriod);
            return AmCharts.changeDate(new Date(time), minPeriodObj.period, minPeriodObj.count, true).getTime() - 1;
        },

        updateMargins: function() {
            var _this = this;
            AmCharts.AmSerialChart.base.updateMargins.call(_this);

            var scrollbar = _this.chartScrollbar;

            if (scrollbar) {
                _this.getScrollbarPosition(scrollbar, _this.rotate, _this.categoryAxis.position);
                _this.adjustMargins(scrollbar, _this.rotate);
            }

            var valueScrollbar = _this.valueScrollbar;
            if (valueScrollbar) {
                _this.getScrollbarPosition(valueScrollbar, !_this.rotate, _this.valueAxes[0].position);
                _this.adjustMargins(valueScrollbar, !_this.rotate);
            }
        },

        updateScrollbars: function() {
            var _this = this;
            AmCharts.AmSerialChart.base.updateScrollbars.call(_this);
            _this.updateChartScrollbar(_this.chartScrollbar, _this.rotate);
            _this.updateChartScrollbar(_this.valueScrollbar, !_this.rotate);
        },


        zoom: function(start, end) {

            var _this = this;

            var categoryAxis = _this.categoryAxis;

            if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                _this.timeZoom(start, end);
            } else {
                _this.indexZoom(start, end);
            }

            if (isNaN(start)) {
                _this.zoomOutValueAxes();
            }

            _this.updateLegendValues();
        },


        timeZoom: function(startTime, endTime) {
            var _this = this;
            var maxSelectedTime = _this.maxSelectedTime;
            if (!isNaN(maxSelectedTime)) {
                if (endTime != _this.endTime) {
                    if (endTime - startTime > maxSelectedTime) {
                        startTime = endTime - maxSelectedTime;
                    }
                }

                if (startTime != _this.startTime) {
                    if (endTime - startTime > maxSelectedTime) {
                        endTime = startTime + maxSelectedTime;
                    }
                }
            }

            var minSelectedTime = _this.minSelectedTime;

            if (minSelectedTime > 0 && endTime - startTime < minSelectedTime) {
                var middleTime = Math.round(startTime + (endTime - startTime) / 2);
                var delta = Math.round(minSelectedTime / 2);
                startTime = middleTime - delta;
                endTime = middleTime + delta;
            }

            var chartData = _this.chartData;
            var categoryAxis = _this.categoryAxis;

            if (AmCharts.ifArray(chartData)) {
                if (startTime != _this.startTime || endTime != _this.endTime) {
                    // check whether start and end time is not the same (or the difference is less then the duration of the shortest period)
                    var minDuration = categoryAxis.minDuration();

                    var firstTime = _this.firstTime;
                    var lastTime = _this.lastTime;

                    if (!startTime) {
                        startTime = firstTime;
                        if (!isNaN(maxSelectedTime)) {
                            startTime = lastTime - maxSelectedTime;
                        }
                    }

                    if (!endTime) {
                        endTime = lastTime;
                    }

                    if (startTime > lastTime) {
                        startTime = lastTime;
                    }

                    if (endTime < firstTime) {
                        endTime = firstTime;
                    }

                    if (startTime < firstTime) {
                        startTime = firstTime;
                    }

                    if (endTime > lastTime) {
                        endTime = lastTime;
                    }

                    if (endTime < startTime) {
                        endTime = startTime + minDuration;
                    }

                    if (endTime - startTime < minDuration / 5) {
                        if (endTime < lastTime) {
                            endTime = startTime + minDuration / 5;
                        } else {
                            startTime = endTime - minDuration / 5;
                        }

                    }

                    _this.startTime = startTime;
                    _this.endTime = endTime;

                    var lastIndex = chartData.length - 1;
                    var start = _this.getClosestIndex(chartData, "time", startTime, true, 0, lastIndex);
                    var end = _this.getClosestIndex(chartData, "time", endTime, false, start, lastIndex);

                    categoryAxis.timeZoom(startTime, endTime);
                    categoryAxis.zoom(start, end);

                    _this.start = AmCharts.fitToBounds(start, 0, lastIndex);
                    _this.end = AmCharts.fitToBounds(end, 0, lastIndex);

                    _this.zoomAxesAndGraphs();
                    _this.zoomScrollbar();

                    _this.fixCursor();

                    _this.showZB();

                    _this.updateColumnsDepth();
                    _this.dispatchTimeZoomEvent();
                }
            }
        },


        showZB: function() {
            var _this = this;
            var show;

            var categoryAxis = _this.categoryAxis;
            if (categoryAxis) {
                if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                    if (_this.startTime > _this.firstTime) {
                        show = true;
                    }

                    if (_this.endTime < _this.lastTime) {
                        show = true;
                    }
                }
            }

            if (_this.start > 0) {
                show = true;
            }

            if (_this.end < _this.chartData.length - 1) {
                show = true;
            }

            var valueAxes = _this.valueAxes;
            if (valueAxes) {
                var valueAxis = valueAxes[0];
                if (valueAxis.relativeStart !== 0) {
                    show = true;
                }
                if (valueAxis.relativeEnd != 1) {
                    show = true;
                }
            }

            AmCharts.AmSerialChart.base.showZB.call(_this, show);
        },

        updateAfterValueZoom: function() {
            var _this = this;
            AmCharts.AmSerialChart.base.updateAfterValueZoom.call(_this);
            _this.updateColumnsDepth();
        },


        indexZoom: function(start, end) {
            var _this = this;
            var maxSelectedSeries = _this.maxSelectedSeries;
            if (!isNaN(maxSelectedSeries)) {
                if (end != _this.end) {
                    if (end - start > maxSelectedSeries) {
                        start = end - maxSelectedSeries;
                    }
                }

                if (start != _this.start) {
                    if (end - start > maxSelectedSeries) {
                        end = start + maxSelectedSeries;
                    }
                }
            }

            if (start != _this.start || end != _this.end) {
                var last = _this.chartData.length - 1;

                if (isNaN(start)) {
                    start = 0;

                    if (!isNaN(maxSelectedSeries)) {
                        start = last - maxSelectedSeries;
                    }
                }

                if (isNaN(end)) {
                    end = last;
                }

                if (end < start) {
                    end = start;
                }

                if (end > last) {
                    end = last;
                }

                if (start > last) {
                    start = last - 1;
                }

                if (start < 0) {
                    start = 0;
                }

                _this.start = start;
                _this.end = end;

                _this.categoryAxis.zoom(start, end);
                _this.zoomAxesAndGraphs();

                _this.zoomScrollbar();

                _this.fixCursor();

                if (start !== 0 || end != _this.chartData.length - 1) {
                    _this.showZB(true);
                } else {
                    _this.showZB(false);
                }
                _this.updateColumnsDepth();
                _this.dispatchIndexZoomEvent();
            }
        },

        updateGraphs: function() {
            var _this = this;
            AmCharts.AmSerialChart.base.updateGraphs.call(_this);

            var graphs = _this.graphs;
            var i;
            for (i = 0; i < graphs.length; i++) {
                var graph = graphs[i];
                graph.columnWidthReal = _this.columnWidth;
                graph.categoryAxis = _this.categoryAxis;

                if (AmCharts.isString(graph.fillToGraph)) {
                    graph.fillToGraph = _this.graphsById[graph.fillToGraph];
                }
            }
        },

        zoomAxesAndGraphs: function() {
            var _this = this;
            AmCharts.AmSerialChart.base.zoomAxesAndGraphs.call(_this);
            _this.updateColumnsDepth();
        },

        updateColumnsDepth: function() {
            var _this = this;

            if (_this.depth3D !== 0 || _this.angle !== 0) {
                var i;
                var graphs = _this.graphs;
                var graph;

                _this.columnsArray = [];

                for (i = 0; i < graphs.length; i++) {
                    graph = graphs[i];

                    var graphColumnsArray = graph.columnsArray;

                    if (graphColumnsArray) {
                        var j;
                        for (j = 0; j < graphColumnsArray.length; j++) {
                            _this.columnsArray.push(graphColumnsArray[j]);
                        }
                    }
                }

                _this.columnsArray.sort(_this.compareDepth);

                var count = _this.columnsArray.length;
                if (count > 0) {
                    var prevSet = _this.columnsSet;

                    var columnsSet = _this.container.set();
                    _this.columnSet.push(columnsSet);

                    for (i = 0; i < _this.columnsArray.length; i++) {
                        columnsSet.push(_this.columnsArray[i].column.set);
                    }

                    if (graph) {
                        columnsSet.translate(graph.x, graph.y);
                    }

                    _this.columnsSet = columnsSet;

                    AmCharts.remove(prevSet);
                }
            }
        },

        compareDepth: function(a, b) {
            if (a.depth > b.depth) {
                return 1;
            } else {
                return -1;
            }
        },

        zoomScrollbar: function() {
            var _this = this;
            var chartScrollbar = _this.chartScrollbar;
            var categoryAxis = _this.categoryAxis;
            if (chartScrollbar) {

                if (!_this.zoomedByScrollbar) {
                    var dragger = chartScrollbar.dragger;
                    if (dragger) {
                        dragger.stop();
                    }
                }

                _this.zoomedByScrollbar = false;

                if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                    chartScrollbar.timeZoom(_this.startTime, _this.endTime);
                } else {
                    chartScrollbar.zoom(_this.start, _this.end);
                }
            }
            _this.zoomValueScrollbar(_this.valueScrollbar);
        },

        updateTrendLines: function() {
            var _this = this;

            var trendLines = _this.trendLines;
            var i;
            for (i = 0; i < trendLines.length; i++) {
                var trendLine = trendLines[i];
                trendLine = AmCharts.processObject(trendLine, AmCharts.TrendLine, _this.theme);
                trendLines[i] = trendLine;
                trendLine.chart = this;

                if (!trendLine.id) {
                    trendLine.id = "trendLineAuto" + i + "_" + new Date().getTime();
                }

                if (AmCharts.isString(trendLine.valueAxis)) {
                    trendLine.valueAxis = _this.getValueAxisById(trendLine.valueAxis);
                }

                if (!trendLine.valueAxis) {
                    trendLine.valueAxis = _this.valueAxes[0];
                }
                trendLine.categoryAxis = _this.categoryAxis;
            }
        },


        countColumns: function() {
            var _this = this;
            var count = 0;

            var axisCount = _this.valueAxes.length;
            var graphCount = _this.graphs.length;
            var graph;
            var axis;
            var counted = false;

            var j;
            var i;
            for (i = 0; i < axisCount; i++) {
                axis = _this.valueAxes[i];
                var stackType = axis.stackType;

                if (stackType == "100%" || stackType == "regular") {
                    counted = false;
                    for (j = 0; j < graphCount; j++) {
                        graph = _this.graphs[j];
                        graph.tcc = 1;
                        if (graph.valueAxis == axis && graph.type == "column") {
                            if (!counted && graph.stackable) {
                                count++;
                                counted = true;
                            }

                            if ((!graph.stackable && graph.clustered) || graph.newStack) {
                                count++;
                            }

                            graph.columnIndex = count - 1;

                            if (!graph.clustered) {
                                graph.columnIndex = 0;
                            }
                        }
                    }
                }

                if (stackType == "none" || stackType == "3d") {
                    var atLeastOne = false;
                    for (j = 0; j < graphCount; j++) {
                        graph = _this.graphs[j];
                        if (graph.valueAxis == axis && graph.type == "column") {
                            if (graph.clustered) {
                                graph.tcc = 1;
                                if (graph.newStack) {
                                    count = 0;
                                }
                                if (!graph.hidden) {
                                    graph.columnIndex = count;
                                    count++;
                                }
                            } else {
                                if (!graph.hidden) {
                                    // if this is the last and not yet counted
                                    atLeastOne = true;
                                    graph.tcc = 1;
                                    graph.columnIndex = 0;
                                }
                            }
                        }
                    }
                    if (atLeastOne && count === 0) {
                        count = 1;
                    }
                }
                if (stackType == "3d") {
                    var realCount = 1;
                    for (i = 0; i < graphCount; i++) {
                        graph = _this.graphs[i];
                        if (graph.newStack) {
                            realCount++;
                        }
                        graph.depthCount = realCount;
                        graph.tcc = count;
                    }
                    count = realCount;
                }
            }
            return count;
        },


        parseData: function() {
            var _this = this;
            AmCharts.AmSerialChart.base.parseData.call(_this);
            _this.parseSerialData(_this.dataProvider);
        },

        getCategoryIndexByValue: function(value) {
            var _this = this;
            var chartData = _this.chartData;
            var i;
            for (i = 0; i < chartData.length; i++) {
                if (chartData[i].category == value) {
                    return i;
                }
            }
        },



        handleScrollbarZoom: function(event) {
            var _this = this;
            _this.zoomedByScrollbar = true;
            _this.zoom(event.start, event.end);
        },

        dispatchTimeZoomEvent: function() {
            var _this = this;
            if (_this.drawGraphs) {
                if (_this.prevStartTime != _this.startTime || _this.prevEndTime != _this.endTime) {
                    var e = {};
                    e.type = "zoomed";
                    e.startDate = new Date(_this.startTime);
                    e.endDate = new Date(_this.endTime);
                    e.startIndex = _this.start;
                    e.endIndex = _this.end;
                    _this.startIndex = _this.start;
                    _this.endIndex = _this.end;
                    _this.startDate = e.startDate;
                    _this.endDate = e.endDate;

                    _this.prevStartTime = _this.startTime;
                    _this.prevEndTime = _this.endTime;
                    var categoryAxis = _this.categoryAxis;

                    var minPeriod = AmCharts.extractPeriod(categoryAxis.minPeriod).period;
                    var dateFormat = categoryAxis.dateFormatsObject[minPeriod];

                    e.startValue = AmCharts.formatDate(e.startDate, dateFormat, _this);
                    e.endValue = AmCharts.formatDate(e.endDate, dateFormat, _this);
                    e.chart = _this;
                    e.target = _this;
                    _this.fire(e);
                }
            }
        },

        dispatchIndexZoomEvent: function() {
            var _this = this;
            if (_this.drawGraphs) {
                if (_this.prevStartIndex != _this.start || _this.prevEndIndex != _this.end) {
                    _this.startIndex = _this.start;
                    _this.endIndex = _this.end;
                    var chartData = _this.chartData;
                    if (AmCharts.ifArray(chartData)) {
                        if (!isNaN(_this.start) && !isNaN(_this.end)) {
                            var e = {};
                            e.chart = _this;
                            e.target = _this;
                            e.type = "zoomed";
                            e.startIndex = _this.start;
                            e.endIndex = _this.end;
                            e.startValue = chartData[_this.start].category;
                            e.endValue = chartData[_this.end].category;

                            if (_this.categoryAxis.parseDates) {
                                _this.startTime = chartData[_this.start].time;
                                _this.endTime = chartData[_this.end].time;

                                e.startDate = new Date(_this.startTime);
                                e.endDate = new Date(_this.endTime);
                            }
                            _this.prevStartIndex = _this.start;
                            _this.prevEndIndex = _this.end;

                            _this.fire(e);
                        }
                    }
                }
            }
        },

        updateLegendValues: function() {
            var _this = this;

            if (_this.legend) {
                _this.legend.updateValues();
            }
        },


        getClosestIndex: function(ac, field, value, first, start, end) {
            var _this = this;
            if (start < 0) {
                start = 0;
            }

            if (end > ac.length - 1) {
                end = ac.length - 1;
            }

            // middle index
            var index = start + Math.round((end - start) / 2);
            // middle value
            var valueAtIndex = ac[index][field];

            if (value == valueAtIndex) {
                return index;
            }

            if (end - start <= 1) {
                if (first) {
                    return start;
                } else {
                    var valueAtStart = ac[start][field];
                    var valueAtEnd = ac[end][field];

                    if (Math.abs(valueAtStart - value) < Math.abs(valueAtEnd - value)) {
                        return start;
                    } else {
                        return end;
                    }
                }
            }

            if (value == valueAtIndex) {
                return index;
            }
            // go to left
            else if (value < valueAtIndex) {
                return _this.getClosestIndex(ac, field, value, first, start, index);
            }
            // go to right
            else {
                return _this.getClosestIndex(ac, field, value, first, index, end);
            }
        },

        zoomToIndexes: function(start, end) {
            var _this = this;
            var chartData = _this.chartData;
            if (chartData) {
                var length = chartData.length;
                if (length > 0) {
                    if (start < 0) {
                        start = 0;
                    }

                    if (end > length - 1) {
                        end = length - 1;
                    }

                    var categoryAxis = _this.categoryAxis;
                    if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                        _this.zoom(chartData[start].time, _this.getEndTime(chartData[end].time));
                    } else {
                        _this.zoom(start, end);
                    }
                }
            }
        },

        zoomToDates: function(start, end) {
            var _this = this;
            var chartData = _this.chartData;

            if (chartData) {
                if (_this.categoryAxis.equalSpacing) {
                    var startIndex = _this.getClosestIndex(chartData, "time", start.getTime(), true, 0, chartData.length);
                    end = AmCharts.resetDateToMin(end, _this.categoryAxis.minPeriod, 1); // 3.4.3 to solve extra date when zooming
                    var endIndex = _this.getClosestIndex(chartData, "time", end.getTime(), false, 0, chartData.length);
                    _this.zoom(startIndex, endIndex);
                } else {
                    _this.zoom(start.getTime(), end.getTime());
                }
            }
        },

        zoomToCategoryValues: function(start, end) {
            var _this = this;
            if (_this.chartData) {
                _this.zoom(_this.getCategoryIndexByValue(start), _this.getCategoryIndexByValue(end));
            }
        },

        formatPeriodString: function(text, graph) {

            var _this = this;
            if (graph) {
                var keys = ["value", "open", "low", "high", "close"];
                var keysExt = ["value", "open", "low", "high", "close", "average", "sum", "count"];

                var valueAxis = graph.valueAxis;
                var chartData = _this.chartData;

                var numberFormatter = graph.numberFormatter;
                if (!numberFormatter) {
                    numberFormatter = _this.nf;
                }

                for (var k = 0; k < keys.length; k++) {
                    var key = keys[k];
                    var sum = 0;
                    var count = 0;
                    var open;
                    var close;
                    var low;
                    var high;
                    var average;

                    var psum = 0;
                    var pcount = 0;
                    var popen;
                    var pclose;
                    var plow;
                    var phigh;
                    var paverage;

                    for (var i = _this.start; i <= _this.end; i++) {
                        var serialDataItem = chartData[i];
                        if (serialDataItem) {
                            var graphDataItem = serialDataItem.axes[valueAxis.id].graphs[graph.id];
                            if (graphDataItem) {
                                if (graphDataItem.values) {

                                    var value = graphDataItem.values[key];

                                    if (_this.rotate) {
                                        if (graphDataItem.x < 0 || graphDataItem.x > graphDataItem.graph.height) {
                                            value = NaN;
                                        }
                                    } else {
                                        if (graphDataItem.x < 0 || graphDataItem.x > graphDataItem.graph.width) {
                                            value = NaN;
                                        }
                                    }

                                    if (!isNaN(value)) {

                                        if (isNaN(open)) {
                                            open = value;
                                        }

                                        close = value;

                                        if (isNaN(low) || low > value) {
                                            low = value;
                                        }

                                        if (isNaN(high) || high < value) {
                                            high = value;
                                        }

                                        var decCountSum = AmCharts.getDecimals(sum);
                                        var decCountValue = AmCharts.getDecimals(value);

                                        sum += value;

                                        sum = AmCharts.roundTo(sum, Math.max(decCountSum, decCountValue));

                                        count++;

                                        average = sum / count;
                                    }
                                }

                                if (graphDataItem.percents) {
                                    var percents = graphDataItem.percents[key];
                                    if (!isNaN(percents)) {

                                        if (isNaN(popen)) {
                                            popen = percents;
                                        }

                                        pclose = percents;

                                        if (isNaN(plow) || plow > percents) {
                                            plow = percents;
                                        }

                                        if (isNaN(phigh) || phigh < percents) {
                                            phigh = percents;
                                        }

                                        var decCountSumP = AmCharts.getDecimals(psum);
                                        var decCountValueP = AmCharts.getDecimals(percents);

                                        psum += percents;

                                        psum = AmCharts.roundTo(psum, Math.max(decCountSumP, decCountValueP));

                                        pcount++;

                                        paverage = psum / pcount;
                                    }
                                }
                            }
                        }
                    }


                    var data = {
                        open: open,
                        close: close,
                        high: high,
                        low: low,
                        average: average,
                        sum: sum,
                        count: count
                    };
                    var pdata = {
                        open: popen,
                        close: pclose,
                        high: phigh,
                        low: plow,
                        average: paverage,
                        sum: psum,
                        count: pcount
                    };

                    text = AmCharts.formatValue(text, data, keysExt, numberFormatter, key + "\\.", _this.usePrefixes, _this.prefixesOfSmallNumbers, _this.prefixesOfBigNumbers);
                    text = AmCharts.formatValue(text, pdata, keysExt, _this.pf, "percents\\." + key + "\\.");

                }
            }

            text = AmCharts.cleanFromEmpty(text);

            return text;
        },


        formatString: function(text, dItem, noFixBrakes) {
            var _this = this;

            if (dItem) {
                var graph = dItem.graph;
                if (text !== undefined) {
                    if (text.indexOf("[[category]]") != -1) {
                        var category = dItem.serialDataItem.category;
                        var categoryAxis = _this.categoryAxis;

                        if (categoryAxis.parseDates) {
                            var dateFormat = _this.balloonDateFormat;
                            var chartCursor = _this.chartCursor;
                            if (chartCursor) {
                                if (chartCursor.categoryBalloonDateFormat) {
                                    dateFormat = chartCursor.categoryBalloonDateFormat;
                                }
                            }

                            var formattedDate = AmCharts.formatDate(category, dateFormat, _this);

                            if (formattedDate.indexOf("fff") != -1) {
                                formattedDate = AmCharts.formatMilliseconds(formattedDate, category);
                            }
                            category = formattedDate;

                        }
                        text = text.replace(/\[\[category\]\]/g, String(category));
                    }

                    var numberFormatter = graph.numberFormatter;

                    if (!numberFormatter) {
                        numberFormatter = _this.nf;
                    }

                    var valueAxis = dItem.graph.valueAxis;
                    var duration = valueAxis.duration;

                    if (duration && !isNaN(dItem.values.value)) {
                        var fDuration = AmCharts.formatDuration(dItem.values.value, duration, "", valueAxis.durationUnits, valueAxis.maxInterval, numberFormatter);
                        var regExp = new RegExp("\\[\\[value\\]\\]", "g");
                        text = text.replace(regExp, fDuration);
                    }

                    if (valueAxis.type == "date") {
                        var fDate = AmCharts.formatDate(new Date(dItem.values.value), graph.dateFormat, _this);
                        var regExp2 = new RegExp("\\[\\[value\\]\\]", "g");
                        text = text.replace(regExp2, fDate);

                        fDate = AmCharts.formatDate(new Date(dItem.values.open), graph.dateFormat, _this);
                        regExp2 = new RegExp("\\[\\[open\\]\\]", "g");
                        text = text.replace(regExp2, fDate);
                    }

                    var keys = ["value", "open", "low", "high", "close", "total"];
                    var percentFormatter = _this.pf;

                    text = AmCharts.formatValue(text, dItem.percents, keys, percentFormatter, "percents\\.");
                    text = AmCharts.formatValue(text, dItem.values, keys, numberFormatter, "", _this.usePrefixes, _this.prefixesOfSmallNumbers, _this.prefixesOfBigNumbers);
                    text = AmCharts.formatValue(text, dItem.values, ["percents"], percentFormatter);

                    if (text.indexOf("[[") != -1) {
                        text = AmCharts.formatDataContextValue(text, dItem.dataContext);
                    }

                    if (text.indexOf("[[") != -1 && dItem.graph.customData) {
                        text = AmCharts.formatDataContextValue(text, dItem.graph.customData);
                    }

                    text = AmCharts.AmSerialChart.base.formatString.call(_this, text, dItem, noFixBrakes);
                }
                return text;
            }
        },

        updateChartCursor: function() {
            var _this = this;
            AmCharts.AmSerialChart.base.updateChartCursor.call(_this);
            var chartCursor = _this.chartCursor;
            var categoryAxis = _this.categoryAxis;
            if (chartCursor) {

                var categoryBalloonAlpha = chartCursor.categoryBalloonAlpha;
                var balloonColor = chartCursor.categoryBalloonColor;
                var color = chartCursor.color;

                if (balloonColor === undefined) {
                    balloonColor = chartCursor.cursorColor;
                }
                var valueZoomable = chartCursor.valueZoomable;
                var zoomable = chartCursor.zoomable;

                var valueLineEnabled = chartCursor.valueLineEnabled;
                if (_this.rotate) {
                    chartCursor.vLineEnabled = valueLineEnabled;
                    chartCursor.hZoomEnabled = valueZoomable;
                    chartCursor.vZoomEnabled = zoomable;
                } else {
                    chartCursor.hLineEnabled = valueLineEnabled;
                    chartCursor.vZoomEnabled = valueZoomable;
                    chartCursor.hZoomEnabled = zoomable;
                }

                var balloon;
                var valueAxis;
                if (chartCursor.valueLineBalloonEnabled) {
                    for (var i = 0; i < _this.valueAxes.length; i++) {
                        valueAxis = _this.valueAxes[i];
                        balloon = valueAxis.balloon;
                        if (!balloon) {
                            balloon = {};
                        }

                        balloon = AmCharts.extend(balloon, _this.balloon, true);

                        balloon.fillColor = balloonColor;
                        balloon.balloonColor = balloonColor;
                        balloon.fillAlpha = categoryBalloonAlpha;
                        balloon.borderColor = balloonColor;
                        balloon.color = color;
                        valueAxis.balloon = balloon;
                    }
                } else {
                    for (var j = 0; j < _this.valueAxes.length; j++) {
                        valueAxis = _this.valueAxes[j];
                        if (valueAxis.balloon) {
                            valueAxis.balloon = null;
                        }
                    }
                }

                if (categoryAxis) {
                    categoryAxis.balloonTextFunction = chartCursor.categoryBalloonFunction;
                    chartCursor.categoryLineAxis = categoryAxis;
                    categoryAxis.balloonText = chartCursor.categoryBalloonText;
                    if (chartCursor.categoryBalloonEnabled) {
                        balloon = categoryAxis.balloon;
                        if (!balloon) {
                            balloon = {};
                        }
                        balloon = AmCharts.extend(balloon, _this.balloon, true);

                        // TODO CLASS NAME
                        balloon.fillColor = balloonColor;
                        balloon.balloonColor = balloonColor;
                        balloon.fillAlpha = categoryBalloonAlpha;
                        balloon.borderColor = balloonColor;
                        balloon.color = color;

                        categoryAxis.balloon = balloon;
                    }
                    if (categoryAxis.balloon) {
                        categoryAxis.balloon.enabled = chartCursor.categoryBalloonEnabled;
                    }
                }
            }
        },

        addChartScrollbar: function(chartScrollbar) {
            var _this = this;
            AmCharts.callMethod("destroy", [_this.chartScrollbar]);

            if (chartScrollbar) {
                chartScrollbar.chart = _this;
                _this.listenTo(chartScrollbar, "zoomed", _this.handleScrollbarZoom);
            }

            if (_this.rotate) {
                if (chartScrollbar.width === undefined) {
                    chartScrollbar.width = chartScrollbar.scrollbarHeight;
                }
            } else {
                if (chartScrollbar.height === undefined) {
                    chartScrollbar.height = chartScrollbar.scrollbarHeight;
                }
            }
            chartScrollbar.gridAxis = _this.categoryAxis;
            _this.chartScrollbar = chartScrollbar;
        },

        addValueScrollbar: function(chartScrollbar) {
            var _this = this;
            AmCharts.callMethod("destroy", [_this.valueScrollbar]);

            if (chartScrollbar) {
                chartScrollbar.chart = _this;
                _this.listenTo(chartScrollbar, "zoomed", _this.handleScrollbarValueZoom);
                _this.listenTo(chartScrollbar, "zoomStarted", _this.handleCursorZoomStarted); // not mistake
            }

            var scrollbarHeight = chartScrollbar.scrollbarHeight;
            if (!_this.rotate) {
                if (chartScrollbar.width === undefined) {
                    chartScrollbar.width = scrollbarHeight;
                }
            } else {
                if (chartScrollbar.height === undefined) {
                    chartScrollbar.height = scrollbarHeight;
                }
            }
            if (!chartScrollbar.gridAxis) {
                chartScrollbar.gridAxis = _this.valueAxes[0];
            }
            chartScrollbar.valueAxes = _this.valueAxes;
            _this.valueScrollbar = chartScrollbar;
        },

        removeChartScrollbar: function() {
            var _this = this;
            AmCharts.callMethod("destroy", [_this.chartScrollbar]);
            _this.chartScrollbar = null;
        },

        removeValueScrollbar: function() {
            var _this = this;
            AmCharts.callMethod("destroy", [_this.valueScrollbar]);
            _this.valueScrollbar = null;
        },

        handleReleaseOutside: function(e) {
            var _this = this;
            AmCharts.AmSerialChart.base.handleReleaseOutside.call(_this, e);
            AmCharts.callMethod("handleReleaseOutside", [_this.chartScrollbar, _this.valueScrollbar]);
        },

        update: function() {
            var _this = this;

            AmCharts.AmSerialChart.base.update.call(_this);

            if (_this.chartScrollbar) {
                if (_this.chartScrollbar.update) {
                    _this.chartScrollbar.update();
                }
            }

            if (_this.valueScrollbar) {
                if (_this.valueScrollbar.update) {
                    _this.valueScrollbar.update();
                }
            }
        },

        processScrollbars: function() {
            var _this = this;
            AmCharts.AmSerialChart.base.processScrollbars.call(_this);

            var valueScrollbar = _this.valueScrollbar;
            if (valueScrollbar) {
                valueScrollbar = AmCharts.processObject(valueScrollbar, AmCharts.ChartScrollbar, _this.theme);
                valueScrollbar.id = "valueScrollbar";
                _this.addValueScrollbar(valueScrollbar);
            }
        },


        //// value zooming ////////////////////////////////////////////////////////////////////////////////////
        handleValueAxisZoom: function(event) {
            var _this = this;
            _this.handleValueAxisZoomReal(event, _this.valueAxes);
        },

        zoomOut: function() {
            var _this = this;
            AmCharts.AmSerialChart.base.zoomOut.call(_this);
            _this.zoom();
        },


        getNextItem: function(graphDataItem) {

            var _this = this;
            var index = graphDataItem.index;
            var chartData = _this.chartData;
            var graph = graphDataItem.graph;

            if (index + 1 < chartData.length) {
                for (var n = index + 1; n < chartData.length; n++) {
                    var nextSerialDataItem = chartData[n];
                    if (nextSerialDataItem) {
                        graphDataItem = nextSerialDataItem.axes[graph.valueAxis.id].graphs[graph.id];
                        if (!isNaN(graphDataItem.y)) {
                            return graphDataItem;
                        }
                    }
                }
            }
        },

        /// CURSOR HANDLERS
        handleCursorZoomReal: function(startX, endX, startY, endY, event) {
            var _this = this;

            var categoryStart;
            var categoryEnd;
            var chartCursor = event.target;
            var start;
            var end;

            if (_this.rotate) {
                if (!isNaN(startX) && !isNaN(endX)) {
                    if (_this.relativeZoomValueAxes(_this.valueAxes, startX, endX)) {
                        _this.updateAfterValueZoom();
                    }

                }
                categoryStart = startY;
                categoryEnd = endY;

                if (chartCursor.vZoomEnabled) {
                    start = event.start;
                    end = event.end;
                }
            } else {
                if (!isNaN(startY) && !isNaN(endY)) {
                    if (_this.relativeZoomValueAxes(_this.valueAxes, startY, endY)) {
                        _this.updateAfterValueZoom();
                    }
                }
                categoryStart = startX;
                categoryEnd = endX;

                if (chartCursor.hZoomEnabled) {
                    start = event.start;
                    end = event.end;
                }
            }

            if (!isNaN(start) && !isNaN(end)) {
                var categoryAxis = _this.categoryAxis;
                if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                    _this.zoomToDates(new Date(start), new Date(end));
                } else {
                    _this.zoomToIndexes(start, end);
                }
            }
        },


        handleCursorZoomStarted: function() {
            var _this = this;
            var valueAxes = _this.valueAxes;

            if (valueAxes) {
                var valueAxis = valueAxes[0];
                var start = valueAxis.relativeStart;
                var end = valueAxis.relativeEnd;

                if (valueAxis.reversed) {
                    start = 1 - valueAxis.relativeEnd;
                    end = 1 - valueAxis.relativeStart;
                }

                if (_this.rotate) {
                    _this.startX0 = start;
                    _this.endX0 = end;
                } else {
                    _this.startY0 = start;
                    _this.endY0 = end;
                }
            }
            var categoryAxis = _this.categoryAxis;
            if (categoryAxis) {
                _this.start0 = _this.start;
                _this.end0 = _this.end;
                _this.startTime0 = _this.startTime;
                _this.endTime0 = _this.endTime;
            }
        },

        fixCursor: function() {
            var _this = this;
            if (_this.chartCursor) {
                _this.chartCursor.fixPosition();
            }
            _this.prevCursorItem = null;
        },

        handleCursorMove: function(event) {
            var _this = this;
            AmCharts.AmSerialChart.base.handleCursorMove.call(_this, event);

            var cursor = event.target;
            var categoryAxis = _this.categoryAxis;

            if (event.panning) {
                _this.handleCursorHide(event);
            } else if (_this.chartData && !cursor.isHidden) {
                var graphs = _this.graphs;
                if (graphs) {
                    var coordinate;
                    if (_this.rotate) {
                        coordinate = event.y;
                    } else {
                        coordinate = event.x;
                    }
                    var serialDataItem;

                    var index = categoryAxis.xToIndex(coordinate);

                    var chartData = _this.chartData;

                    serialDataItem = chartData[index];


                    if (serialDataItem) {
                        var i;
                        var graph;
                        var graphDataItem;
                        var valueAxisId;
                        var mostCloseGraph;


                        // find most close
                        if (cursor.oneBalloonOnly && cursor.valueBalloonsEnabled) {
                            var distance = Infinity;
                            for (i = 0; i < graphs.length; i++) {
                                graph = graphs[i];
                                var balloon = graph.balloon;

                                if (balloon.enabled && graph.showBalloon && !graph.hidden) {

                                    valueAxisId = graph.valueAxis.id;
                                    graphDataItem = serialDataItem.axes[valueAxisId].graphs[graph.id];

                                    var balloonCoordinate = graphDataItem.y;

                                    if (graph.showBalloonAt == "top") {
                                        balloonCoordinate = 0;
                                    }
                                    if (graph.showBalloonAt == "bottom") {
                                        balloonCoordinate = _this.height;
                                    }

                                    var mouseX = cursor.mouseX;
                                    var mouseY = cursor.mouseY;
                                    var dist;

                                    if (_this.rotate) {
                                        dist = Math.abs(mouseX - balloonCoordinate);
                                        if (dist < distance) {
                                            distance = dist;
                                            mostCloseGraph = graph;
                                        }
                                    } else {
                                        dist = Math.abs(mouseY - balloonCoordinate);
                                        if (dist < distance) {
                                            distance = dist;
                                            mostCloseGraph = graph;
                                        }
                                    }
                                }
                            }
                            cursor.mostCloseGraph = mostCloseGraph;
                        }

                        if (_this.prevCursorItem != serialDataItem || mostCloseGraph != _this.prevMostCloseGraph) {

                            var balloons = [];
                            for (i = 0; i < graphs.length; i++) {
                                graph = graphs[i];
                                valueAxisId = graph.valueAxis.id;
                                graphDataItem = serialDataItem.axes[valueAxisId].graphs[graph.id];

                                if (cursor.showNextAvailable) {
                                    if (isNaN(graphDataItem.y)) {
                                        graphDataItem = _this.getNextItem(graphDataItem);
                                    }
                                }

                                if (mostCloseGraph) {
                                    if (graph != mostCloseGraph) {
                                        graph.showGraphBalloon(graphDataItem, cursor.pointer, false, cursor.graphBulletSize, cursor.graphBulletAlpha);
                                        graph.balloon.hide(0);
                                        continue;
                                    }
                                }

                                if (cursor.valueBalloonsEnabled) {
                                    graph.balloon.showBullet = cursor.bulletsEnabled;
                                    graph.balloon.bulletSize = cursor.bulletSize / 2;
                                    if (!event.hideBalloons) {
                                        graph.showGraphBalloon(graphDataItem, cursor.pointer, false, cursor.graphBulletSize, cursor.graphBulletAlpha);

                                        if (graph.balloon.set) {
                                            balloons.push({
                                                balloon: graph.balloon,
                                                y: graph.balloon.pointToY
                                            });
                                        }
                                    }
                                } else {
                                    graph.currentDataItem = graphDataItem;
                                    graph.resizeBullet(graphDataItem, cursor.graphBulletSize, cursor.graphBulletAlpha);
                                }
                            }

                            if (cursor.avoidBalloonOverlapping) {
                                _this.arrangeBalloons(balloons);
                            }

                            _this.prevCursorItem = serialDataItem;
                        }

                        _this.prevMostCloseGraph = mostCloseGraph;
                    }
                }

                categoryAxis.showBalloon(event.x, event.y, cursor.categoryBalloonDateFormat, event.skip);

                _this.updateLegendValues();
            }
        },


        handleCursorHide: function(event) {
            var _this = this;
            AmCharts.AmSerialChart.base.handleCursorHide.call(_this, event);
            var categoryAxis = _this.categoryAxis;
            _this.prevCursorItem = null;
            _this.updateLegendValues();
            if (categoryAxis) {
                categoryAxis.hideBalloon();
            }

            var graphs = _this.graphs;
            var i;
            for (i = 0; i < graphs.length; i++) {
                var graph = graphs[i];
                graph.currentDataItem = null;
            }
        },

        handleCursorPanning: function(event) {
            var _this = this;
            var cursor = event.target;

            // VALUE AXES
            var newStart;
            var newEnd;
            var deltaX = event.deltaX;
            var deltaY = event.deltaY;

            var delta2X = event.delta2X;
            var delta2Y = event.delta2Y;

            var limitPan = false;

            if (_this.rotate) {
                if (isNaN(delta2X)) {
                    delta2X = deltaX;
                    limitPan = true;
                }

                var endX0 = _this.endX0;
                var startX0 = _this.startX0;

                var initialDeltaX = endX0 - startX0;
                var newDeltaX = initialDeltaX * deltaX;
                var newDelta2X = initialDeltaX * delta2X;

                var newStartX = startX0 - newDeltaX;
                var newEndX = endX0 - newDelta2X;

                var limitX = initialDeltaX;
                if (!limitPan) {
                    limitX = 0;
                }

                newStart = AmCharts.fitToBounds(newStartX, 0, 1 - limitX);
                newEnd = AmCharts.fitToBounds(newEndX, limitX, 1);
            } else {

                if (isNaN(delta2Y)) {
                    delta2Y = deltaY;
                    limitPan = true;
                }

                var endY0 = _this.endY0;
                var startY0 = _this.startY0;
                var initialDeltaY = endY0 - startY0;
                var newDeltaY = initialDeltaY * deltaY;
                var newDelta2Y = initialDeltaY * delta2Y;

                var newStartY = startY0 + newDelta2Y;
                var newEndY = endY0 + newDeltaY;

                var limitY = initialDeltaY;
                if (!limitPan) {
                    limitY = 0;
                }

                newStart = AmCharts.fitToBounds(newStartY, 0, 1 - limitY);
                newEnd = AmCharts.fitToBounds(newEndY, limitY, 1);
            }

            var valueZoomed;
            if (cursor.valueZoomable) {
                valueZoomed = _this.relativeZoomValueAxes(_this.valueAxes, newStart, newEnd);
            }

            var categoryZoomed;

            // CATEGORY AXES
            var categoryAxis = _this.categoryAxis;

            var delta;
            var delta2;
            if (_this.rotate) {
                delta = deltaY;
                delta2 = delta2Y;
            } else {
                delta = deltaX;
                delta2 = delta2X;
            }

            limitPan = false;
            if (isNaN(delta2)) {
                delta2 = delta;
                limitPan = true;
            }

            if (cursor.zoomable) {
                if (Math.abs(delta) > 0 || Math.abs(delta2) > 0) {
                    // time zoom is smooth
                    if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {

                        var startTime0 = _this.startTime0;
                        var endTime0 = _this.endTime0;
                        var fullDuration = endTime0 - startTime0;

                        var deltaTime = fullDuration * delta;
                        var deltaTime2 = fullDuration * delta2;
                        var firstTime = _this.firstTime;
                        var lastTime = _this.lastTime;

                        var limitTime = fullDuration;
                        if (!limitPan) {
                            limitTime = 0;
                        }

                        var newStartTime = Math.round(AmCharts.fitToBounds(startTime0 - deltaTime, firstTime, lastTime - limitTime));
                        var newEndTime = Math.round(AmCharts.fitToBounds(endTime0 - deltaTime2, firstTime + limitTime, lastTime));

                        if (_this.startTime != newStartTime || _this.endTime != newEndTime) {
                            // dispatch zoomed event to maintain 3.17 behavior
                            var ev = {
                                chart: _this,
                                target: cursor,
                                type: "zoomed",
                                start: newStartTime,
                                end: newEndTime
                            };
                            _this.skipZoomed = true;
                            cursor.fire(ev);
                            _this.zoom(newStartTime, newEndTime);
                            categoryZoomed = true;
                        }
                    }
                    // category zoom
                    else {
                        var start0 = _this.start0;
                        var end0 = _this.end0;
                        var difference = end0 - start0;
                        var deltaIndex = Math.round(difference * delta);
                        var deltaIndex2 = Math.round(difference * delta2);

                        var dataCount = _this.chartData.length - 1;

                        var limitDifference = difference;
                        if (!limitPan) {
                            limitDifference = 0;
                        }

                        newStart = AmCharts.fitToBounds(start0 - deltaIndex, 0, dataCount - limitDifference);
                        newEnd = AmCharts.fitToBounds(end0 - deltaIndex2, limitDifference, dataCount);

                        if (_this.start != newStart || _this.end != newEnd) {

                            // dispatch zoomed event to maintain 3.17 behavior
                            _this.skipZoomed = true;
                            cursor.fire({
                                chart: _this,
                                target: cursor,
                                type: "zoomed",
                                start: newStart,
                                end: newEnd
                            });

                            _this.zoom(newStart, newEnd);
                            categoryZoomed = true;
                        }
                    }
                }
            }

            if (!categoryZoomed && valueZoomed) {
                _this.updateAfterValueZoom();
            }
        },
        // END OF CURSOR HANDLERS

        arrangeBalloons: function(balloons) {
            var _this = this;
            var bottom = _this.plotAreaHeight;

            balloons.sort(_this.compareY);
            var i;
            var balloon;
            var bPrevious;
            var plotAreaWidth = _this.plotAreaWidth;
            var count = balloons.length;

            for (i = 0; i < count; i++) {
                balloon = balloons[i].balloon;
                balloon.setBounds(0, 0, plotAreaWidth, bottom);
                balloon.restorePrevious();
                balloon.draw();
                bottom = balloon.yPos - 3;
            }

            balloons.reverse();

            for (i = 0; i < count; i++) {
                balloon = balloons[i].balloon;
                var b = balloon.bottom;
                var balloonHeight = balloon.bottom - balloon.yPos;

                if (i > 0) {
                    if (b - balloonHeight < bPrevious + 3) {
                        balloon.setBounds(0, bPrevious + 3, plotAreaWidth, bPrevious + balloonHeight + 3);
                        balloon.restorePrevious();
                        balloon.draw();
                    }
                }
                if (balloon.set) {
                    balloon.set.show();
                }
                bPrevious = balloon.bottom;
            }
        },


        compareY: function(a, b) {
            if (a.y < b.y) {
                return 1;
            } else {
                return -1;
            }
        }

    });
})();
(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.AmXYChart = AmCharts.Class({

        inherits: AmCharts.AmRectangularChart,

        construct: function(theme) {
            var _this = this;
            _this.type = "xy";
            AmCharts.AmXYChart.base.construct.call(_this, theme);

            _this.cname = "AmXYChart";
            _this.theme = theme;
            _this.createEvents("zoomed");            
            //_this.minValue;

            AmCharts.applyTheme(_this, theme, _this.cname);
        },


        initChart: function() {
            var _this = this;
            AmCharts.AmXYChart.base.initChart.call(_this);
            if (_this.dataChanged) {
                _this.updateData();
            }

            _this.drawChart();

            if (!_this.marginsUpdated && _this.autoMargins) {
                _this.marginsUpdated = true;
                _this.measureMargins();
            }

            var marginLeftReal = _this.marginLeftReal;
            var marginTopReal = _this.marginTopReal;
            var plotAreaWidth = _this.plotAreaWidth;
            var plotAreaHeight = _this.plotAreaHeight;

            _this.graphsSet.clipRect(marginLeftReal, marginTopReal, plotAreaWidth, plotAreaHeight);
            _this.bulletSet.clipRect(marginLeftReal, marginTopReal, plotAreaWidth, plotAreaHeight);
            _this.trendLinesSet.clipRect(marginLeftReal, marginTopReal, plotAreaWidth, plotAreaHeight);

            _this.drawGraphs = true;

            _this.showZB();
        },

        prepareForExport: function() {
            var _this = this;
            var obj = _this.bulletSet;
            if (obj.clipPath) {
                _this.container.remove(obj.clipPath);
            }
        },


        createValueAxes: function() {
            var _this = this;
            var xAxes = [];
            var yAxes = [];
            _this.xAxes = xAxes;
            _this.yAxes = yAxes;

            // sort axes
            var valueAxes = _this.valueAxes;
            var valueAxis;
            var i;

            for (i = 0; i < valueAxes.length; i++) {
                valueAxis = valueAxes[i];
                var position = valueAxis.position;

                if (position == "top" || position == "bottom") {
                    valueAxis.rotate = true;
                }

                valueAxis.setOrientation(valueAxis.rotate);

                var orientation = valueAxis.orientation;
                if (orientation == "V") {
                    yAxes.push(valueAxis);
                }

                if (orientation == "H") {
                    xAxes.push(valueAxis);
                }
            }
            // create one vertical and horizontal value axis if not found any
            if (yAxes.length === 0) {
                valueAxis = new AmCharts.ValueAxis(_this.theme);
                valueAxis.rotate = false;
                valueAxis.setOrientation(false);
                valueAxes.push(valueAxis);
                yAxes.push(valueAxis);
            }

            if (xAxes.length === 0) {
                valueAxis = new AmCharts.ValueAxis(_this.theme);
                valueAxis.rotate = true;
                valueAxis.setOrientation(true);
                valueAxes.push(valueAxis);
                xAxes.push(valueAxis);
            }

            for (i = 0; i < valueAxes.length; i++) {
                _this.processValueAxis(valueAxes[i], i);
            }

            var graphs = _this.graphs;
            for (i = 0; i < graphs.length; i++) {
                _this.processGraph(graphs[i], i);
            }
        },

        drawChart: function() {
            var _this = this;
            AmCharts.AmXYChart.base.drawChart.call(_this);

            var chartData = _this.chartData;

            if (_this.realWidth > 0 && _this.realHeight > 0) {

                if (AmCharts.ifArray(chartData)) {
                    if (_this.chartScrollbar) {
                        _this.updateScrollbars();
                    }
                    _this.zoomChart();
                } else {
                    _this.cleanChart();
                }

                // remove scrollbars
                var scrollbarH = _this.scrollbarH;
                if (scrollbarH) {
                    if (_this.hideXScrollbar) {
                        if (scrollbarH) {
                            scrollbarH.destroy();
                        }
                        _this.scrollbarH = null;
                    } else {
                        scrollbarH.draw();
                    }
                }

                var scrollbarV = _this.scrollbarV;
                if (scrollbarV) {
                    if (_this.hideYScrollbar) {
                        scrollbarV.destroy();
                        _this.scrollbarV = null;
                    } else {
                        scrollbarV.draw();
                    }
                }

                _this.zoomScrollbar();

                if (_this.autoMargins && !_this.marginsUpdated) {
                    // void
                } else {
                    _this.dispDUpd();
                    _this.chartCreated = true;
                }
            }
        },

        cleanChart: function() {
            var _this = this;
            AmCharts.callMethod("destroy", [_this.valueAxes, _this.graphs, _this.scrollbarV, _this.scrollbarH, _this.chartCursor]);
        },

        zoomChart: function() {
            var _this = this;
            _this.zoomObjects(_this.valueAxes);
            _this.zoomObjects(_this.graphs);
            _this.zoomTrendLines();

            _this.prevPlotAreaWidth = _this.plotAreaWidth;
            _this.prevPlotAreaHeight = _this.plotAreaHeight;
        },

        zoomObjects: function(objects) {
            var _this = this;
            var count = objects.length;
            var i;
            var obj;
            for (i = 0; i < count; i++) {
                obj = objects[i];
                obj.zoom(0, _this.chartData.length - 1);
            }
        },

        updateData: function() {
            var _this = this;
            _this.parseData();
            var chartData = _this.chartData;
            var lastIndex = chartData.length - 1;
            var graphs = _this.graphs;
            var dataProvider = _this.dataProvider;

            var maxValue = -Infinity;
            var minValue = Infinity;
            var i;
            var graph;

            if (dataProvider) {


                for (i = 0; i < graphs.length; i++) {
                    graph = graphs[i];
                    graph.data = chartData;
                    graph.zoom(0, lastIndex);

                    var valueField = graph.valueField;

                    if (valueField) {
                        var j;
                        for (j = 0; j < dataProvider.length; j++) {
                            if (value !== null) {
                                var value = Number(dataProvider[j][valueField]);
                                if (value > maxValue) {
                                    maxValue = value;
                                }
                                if (value < minValue) {
                                    minValue = value;
                                }
                            }
                        }
                    }
                }


                if (!isNaN(_this.minValue)) {
                    minValue = _this.minValue;
                }
                if (!isNaN(_this.maxValue)) {
                    maxValue = _this.maxValue;
                }


                for (i = 0; i < graphs.length; i++) {
                    graph = graphs[i];
                    graph.maxValue = maxValue;
                    graph.minValue = minValue;
                }


                var chartCursor = _this.chartCursor;
                if (chartCursor) {
                    chartCursor.type = "crosshair";
                    chartCursor.valueBalloonsEnabled = false;
                }
                _this.dataChanged = false;
                _this.dispatchDataUpdated = true;
            }
        },


        processValueAxis: function(valueAxis) {
            valueAxis.chart = this;

            if (valueAxis.orientation == "H") {
                valueAxis.minMaxField = "x";
            } else {
                valueAxis.minMaxField = "y";
            }

            valueAxis.min = NaN;
            valueAxis.max = NaN;
        },

        processGraph: function(graph) {
            var _this = this;

            if (AmCharts.isString(graph.xAxis)) {
                graph.xAxis = _this.getValueAxisById(graph.xAxis);
            }

            if (AmCharts.isString(graph.yAxis)) {
                graph.yAxis = _this.getValueAxisById(graph.yAxis);
            }

            if (!graph.xAxis) {
                graph.xAxis = _this.xAxes[0];
            }
            if (!graph.yAxis) {
                graph.yAxis = _this.yAxes[0];
            }
            graph.valueAxis = graph.yAxis;
        },


        parseData: function() {
            var _this = this;
            AmCharts.AmXYChart.base.parseData.call(_this);

            _this.chartData = [];
            var dataProvider = _this.dataProvider;
            var valueAxes = _this.valueAxes;
            var graphs = _this.graphs;
            var i;
            if (dataProvider) {
                for (i = 0; i < dataProvider.length; i++) {
                    var serialDataItem = {};
                    serialDataItem.axes = {};
                    serialDataItem.x = {};
                    serialDataItem.y = {};
                    var dataDateFormat = _this.dataDateFormat;
                    var dataItemRaw = dataProvider[i];
                    var j;
                    for (j = 0; j < valueAxes.length; j++) {
                        // axis
                        var axisId = valueAxes[j].id;

                        serialDataItem.axes[axisId] = {};
                        serialDataItem.axes[axisId].graphs = {};
                        var k;
                        for (k = 0; k < graphs.length; k++) {
                            var graph = graphs[k];
                            var graphId = graph.id;

                            if (graph.xAxis.id == axisId || graph.yAxis.id == axisId) {
                                var graphDataItem = {};
                                graphDataItem.serialDataItem = serialDataItem;
                                graphDataItem.index = i;

                                var values = {};

                                var val = dataItemRaw[graph.valueField];
                                if (val !== null) {
                                    val = Number(val);
                                    if (!isNaN(val)) {
                                        values.value = val;
                                    }
                                }
                                val = dataItemRaw[graph.xField];
                                if (val !== null) {
                                    if (graph.xAxis.type == "date") {
                                        val = AmCharts.getDate(dataItemRaw[graph.xField], dataDateFormat).getTime();
                                    }
                                    val = Number(val);
                                    if (!isNaN(val)) {
                                        values.x = val;
                                    }
                                }
                                val = dataItemRaw[graph.yField];
                                if (val !== null) {
                                    if (graph.yAxis.type == "date") {
                                        val = AmCharts.getDate(dataItemRaw[graph.yField], dataDateFormat).getTime();
                                    }
                                    val = Number(val);
                                    if (!isNaN(val)) {
                                        values.y = val;
                                    }
                                }
                                val = dataItemRaw[graph.errorField];
                                if (val !== null) {
                                    val = Number(val);
                                    if (!isNaN(val)) {
                                        values.error = val;
                                    }
                                }

                                graphDataItem.values = values;

                                _this.processFields(graph, graphDataItem, dataItemRaw);

                                graphDataItem.serialDataItem = serialDataItem;
                                graphDataItem.graph = graph;

                                serialDataItem.axes[axisId].graphs[graphId] = graphDataItem;
                            }
                        }
                    }
                    _this.chartData[i] = serialDataItem;
                }
            }
            _this.start = 0;
            _this.end = _this.chartData.length - 1;
        },


        formatString: function(text, dItem, noFixBrakes) {
            var _this = this;
            var graph = dItem.graph;
            var numberFormatter = graph.numberFormatter;
            if (!numberFormatter) {
                numberFormatter = _this.nf;
            }
            var fDate;
            var regExp2;
            if (dItem.graph.xAxis.type == "date") {
                fDate = AmCharts.formatDate(new Date(dItem.values.x), graph.dateFormat, _this);
                regExp2 = new RegExp("\\[\\[x\\]\\]", "g");
                text = text.replace(regExp2, fDate);
            }
            if (dItem.graph.yAxis.type == "date") {
                fDate = AmCharts.formatDate(new Date(dItem.values.y), graph.dateFormat, _this);
                regExp2 = new RegExp("\\[\\[y\\]\\]", "g");
                text = text.replace(regExp2, fDate);
            }

            var keys = ["value", "x", "y"];
            text = AmCharts.formatValue(text, dItem.values, keys, numberFormatter);

            if (text.indexOf("[[") != -1) {
                text = AmCharts.formatDataContextValue(text, dItem.dataContext);
            }

            text = AmCharts.AmXYChart.base.formatString.call(_this, text, dItem, noFixBrakes);
            return text;
        },

        addChartScrollbar: function(chartScrollbar) {
            var _this = this;
            AmCharts.callMethod("destroy", [_this.chartScrollbar, _this.scrollbarH, _this.scrollbarV]);

            if (chartScrollbar) {
                _this.chartScrollbar = chartScrollbar;
                _this.scrollbarHeight = chartScrollbar.scrollbarHeight;

                var properties = ["backgroundColor",
                    "backgroundAlpha",
                    "selectedBackgroundColor",
                    "selectedBackgroundAlpha",
                    "scrollDuration",
                    "resizeEnabled",
                    "hideResizeGrips",
                    "scrollbarHeight",
                    "updateOnReleaseOnly"
                ];

                if (!_this.hideYScrollbar) {
                    var scrollbarV = new AmCharts.ChartScrollbar(_this.theme);

                    scrollbarV.skipEvent = true;
                    scrollbarV.chart = this;
                    _this.listenTo(scrollbarV, "zoomed", _this.handleScrollbarValueZoom);
                    AmCharts.copyProperties(chartScrollbar, scrollbarV, properties);
                    scrollbarV.rotate = true;
                    _this.scrollbarV = scrollbarV;
                }

                if (!_this.hideXScrollbar) {
                    var scrollbarH = new AmCharts.ChartScrollbar(_this.theme);

                    scrollbarH.skipEvent = true;
                    scrollbarH.chart = this;
                    _this.listenTo(scrollbarH, "zoomed", _this.handleScrollbarValueZoom);
                    AmCharts.copyProperties(chartScrollbar, scrollbarH, properties);
                    scrollbarH.rotate = false;
                    _this.scrollbarH = scrollbarH;
                }
            }
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

                var valueAxis = trendLine.valueAxis;
                if (AmCharts.isString(valueAxis)) {
                    trendLine.valueAxis = _this.getValueAxisById(valueAxis);
                }

                var valueAxisX = trendLine.valueAxisX;
                if (AmCharts.isString(valueAxisX)) {
                    trendLine.valueAxisX = _this.getValueAxisById(valueAxisX);
                }

                if (!trendLine.id) {
                    trendLine.id = "trendLineAuto" + i + "_" + new Date().getTime();
                }

                if (!trendLine.valueAxis) {
                    trendLine.valueAxis = _this.yAxes[0];
                }
                if (!trendLine.valueAxisX) {
                    trendLine.valueAxisX = _this.xAxes[0];
                }
            }
        },


        updateMargins: function() {
            var _this = this;
            AmCharts.AmXYChart.base.updateMargins.call(_this);

            var scrollbarV = _this.scrollbarV;
            if (scrollbarV) {
                _this.getScrollbarPosition(scrollbarV, true, _this.yAxes[0].position);
                _this.adjustMargins(scrollbarV, true);
            }

            var scrollbarH = _this.scrollbarH;
            if (scrollbarH) {
                _this.getScrollbarPosition(scrollbarH, false, _this.xAxes[0].position);
                _this.adjustMargins(scrollbarH, false);
            }
        },

        updateScrollbars: function() {
            var _this = this;
            AmCharts.AmXYChart.base.updateScrollbars.call(_this);
            var scrollbarV = _this.scrollbarV;
            if (scrollbarV) {
                _this.updateChartScrollbar(scrollbarV, true);
                scrollbarV.valueAxes = _this.yAxes;

                if (!scrollbarV.gridAxis) {
                    scrollbarV.gridAxis = _this.yAxes[0];
                }
            }
            var scrollbarH = _this.scrollbarH;
            if (scrollbarH) {
                _this.updateChartScrollbar(scrollbarH, false);
                scrollbarH.valueAxes = _this.xAxes;

                if (!scrollbarH.gridAxis) {
                    scrollbarH.gridAxis = _this.xAxes[0];
                }
            }
        },


        removeChartScrollbar: function() {
            var _this = this;
            AmCharts.callMethod("destroy", [_this.scrollbarH, _this.scrollbarV]);
            _this.scrollbarH = null;
            _this.scrollbarV = null;
        },

        handleReleaseOutside: function(e) {
            var _this = this;
            AmCharts.AmXYChart.base.handleReleaseOutside.call(_this, e);
            AmCharts.callMethod("handleReleaseOutside", [_this.scrollbarH, _this.scrollbarV]);
        },

        update: function() {
            var _this = this;
            AmCharts.AmXYChart.base.update.call(_this);

            if (_this.scrollbarH) {
                if (_this.scrollbarH.update) {
                    _this.scrollbarH.update();
                }
            }
            if (_this.scrollbarV) {
                if (_this.scrollbarV.update) {
                    _this.scrollbarV.update();
                }
            }
        },

        zoomScrollbar: function() {
            var _this = this;
            _this.zoomValueScrollbar(_this.scrollbarV);
            _this.zoomValueScrollbar(_this.scrollbarH);
        },

        handleCursorZoomReal: function(startX, endX, startY, endY) {
            var _this = this;
            if (!isNaN(startX) && !isNaN(endX)) {
                _this.relativeZoomValueAxes(_this.xAxes, startX, endX);
            }

            if (!isNaN(startY) && !isNaN(endY)) {
                _this.relativeZoomValueAxes(_this.yAxes, startY, endY);
            }

            _this.updateAfterValueZoom();
        },

        handleCursorZoomStarted: function() {
            var _this = this;
            if (_this.xAxes) {
                var xAxis = _this.xAxes[0];
                _this.startX0 = xAxis.relativeStart;
                _this.endX0 = xAxis.relativeEnd;

                if (xAxis.reversed) {
                    _this.startX0 = 1 - xAxis.relativeEnd;
                    _this.endX0 = 1 - xAxis.relativeStart;
                }
            }
            if (_this.yAxes) {
                var yAxis = _this.yAxes[0];
                _this.startY0 = yAxis.relativeStart;
                _this.endY0 = yAxis.relativeEnd;

                if (yAxis.reversed) {
                    _this.startY0 = 1 - yAxis.relativeEnd;
                    _this.endY0 = 1 - yAxis.relativeStart;
                }
            }
        },

        updateChartCursor: function() {
            var _this = this;
            AmCharts.AmXYChart.base.updateChartCursor.call(_this);
            var chartCursor = _this.chartCursor;
            if (chartCursor) {
                chartCursor.valueLineEnabled = true;
                if (!chartCursor.categoryLineAxis) {
                    chartCursor.categoryLineAxis = _this.xAxes[0];
                }
                var valueAxis = _this.valueAxis;
                if (chartCursor.valueLineBalloonEnabled) {
                    var categoryBalloonAlpha = chartCursor.categoryBalloonAlpha;
                    var balloonColor = chartCursor.categoryBalloonColor;
                    var color = chartCursor.color;

                    if (balloonColor === undefined) {
                        balloonColor = chartCursor.cursorColor;
                    }

                    for (var i = 0; i < _this.valueAxes.length; i++) {
                        valueAxis = _this.valueAxes[i];
                        var balloon = valueAxis.balloon;
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

                if (chartCursor.zoomable) {
                    if (!_this.hideYScrollbar) {
                        chartCursor.vZoomEnabled = true;
                    }
                    if (!_this.hideXScrollbar) {
                        chartCursor.hZoomEnabled = true;
                    }
                }
            }
        },


        handleCursorPanning: function(event) {
            var _this = this;
            var deltaX = event.deltaX;
            var delta2X = event.delta2X;

            var limitPan;
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

            newStartX = AmCharts.fitToBounds(newStartX, 0, 1 - limitX);
            newEndX = AmCharts.fitToBounds(newEndX, limitX, 1);
            _this.relativeZoomValueAxes(_this.xAxes, newStartX, newEndX);

            var deltaY = event.deltaY;
            var delta2Y = event.delta2Y;

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

            newStartY = AmCharts.fitToBounds(newStartY, 0, 1 - limitY);
            newEndY = AmCharts.fitToBounds(newEndY, limitY, 1);

            _this.relativeZoomValueAxes(_this.yAxes, newStartY, newEndY);

            _this.updateAfterValueZoom();
        },


        handleValueAxisZoom: function(event) {
            var _this = this;

            var valueAxes;
            if (event.valueAxis.orientation == "V") {
                valueAxes = _this.yAxes;
            } else {
                valueAxes = _this.xAxes;
            }

            _this.handleValueAxisZoomReal(event, valueAxes);
        },

        showZB: function() {
            var _this = this;
            var show;
            var valueAxes = _this.valueAxes;
            if (valueAxes) {
                for (var i = 0; i < valueAxes.length; i++) {
                    var valueAxis = valueAxes[i];
                    if (valueAxis.relativeStart !== 0) {
                        show = true;
                    }
                    if (valueAxis.relativeEnd != 1) {
                        show = true;
                    }
                }
            }

            AmCharts.AmXYChart.base.showZB.call(_this, show);
        }

    });
})();
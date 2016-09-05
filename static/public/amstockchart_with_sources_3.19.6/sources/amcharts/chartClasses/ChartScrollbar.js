(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.ChartScrollbar = AmCharts.Class({

        inherits: AmCharts.SimpleChartScrollbar,

        construct: function(theme) {
            var _this = this;
            _this.cname = "ChartScrollbar";
            AmCharts.ChartScrollbar.base.construct.call(_this, theme);
            _this.graphLineColor = "#BBBBBB";
            _this.graphLineAlpha = 0;
            _this.graphFillColor = "#BBBBBB";
            _this.graphFillAlpha = 1;
            _this.selectedGraphLineColor = "#888888";
            _this.selectedGraphLineAlpha = 0;
            _this.selectedGraphFillColor = "#888888";
            _this.selectedGraphFillAlpha = 1;
            _this.gridCount = 0;
            _this.gridColor = "#FFFFFF";
            _this.gridAlpha = 0.7;
            _this.autoGridCount = false;
            _this.skipEvent = false;
            _this.color = "#FFFFFF";
            _this.scrollbarCreated = false;
            _this.oppositeAxis = true;
            AmCharts.applyTheme(_this, theme, _this.cname);
        },


        init: function() {
            var _this = this;
            var categoryAxis = _this.categoryAxis;
            var chart = _this.chart;
            var gridAxis = _this.gridAxis;

            if (!categoryAxis) {
                if (_this.gridAxis.cname == "CategoryAxis") {
                    _this.catScrollbar = true;
                    categoryAxis = new AmCharts.CategoryAxis();
                    categoryAxis.id = "scrollbar";
                } else {
                    categoryAxis = new AmCharts.ValueAxis();
                    categoryAxis.data = chart.chartData;
                    categoryAxis.id = gridAxis.id;
                    categoryAxis.type = gridAxis.type;
                    categoryAxis.maximumDate = gridAxis.maximumDate;
                    categoryAxis.minimumDate = gridAxis.minimumDate;
                    categoryAxis.minPeriod = gridAxis.minPeriod;
                }
                _this.categoryAxis = categoryAxis;
            }

            categoryAxis.chart = chart;
            categoryAxis.dateFormats = gridAxis.dateFormats;
            categoryAxis.markPeriodChange = gridAxis.markPeriodChange;
            categoryAxis.boldPeriodBeginning = gridAxis.boldPeriodBeginning;
            categoryAxis.labelFunction = gridAxis.labelFunction;
            categoryAxis.axisItemRenderer = AmCharts.RecItem;
            categoryAxis.axisRenderer = AmCharts.RecAxis;
            categoryAxis.guideFillRenderer = AmCharts.RecFill;
            categoryAxis.inside = true;
            categoryAxis.fontSize = _this.fontSize;
            categoryAxis.tickLength = 0;
            categoryAxis.axisAlpha = 0;

            if (AmCharts.isString(_this.graph)) {
                _this.graph = AmCharts.getObjById(chart.graphs, _this.graph);
            }

            var graph = _this.graph;

            if (graph && _this.catScrollbar) {
                var valueAxis = _this.valueAxis;
                if (!valueAxis) {
                    valueAxis = new AmCharts.ValueAxis();
                    _this.valueAxis = valueAxis;
                    valueAxis.visible = false;
                    valueAxis.scrollbar = true;
                    valueAxis.axisItemRenderer = AmCharts.RecItem;
                    valueAxis.axisRenderer = AmCharts.RecAxis;
                    valueAxis.guideFillRenderer = AmCharts.RecFill;
                    valueAxis.labelsEnabled = false;
                    valueAxis.chart = chart;
                }

                var unselectedGraph = _this.unselectedGraph;
                if (!unselectedGraph) {
                    unselectedGraph = new AmCharts.AmGraph();
                    unselectedGraph.scrollbar = true;
                    _this.unselectedGraph = unselectedGraph;
                    unselectedGraph.negativeBase = graph.negativeBase;
                    unselectedGraph.noStepRisers = graph.noStepRisers;
                }
                var selectedGraph = _this.selectedGraph;
                if (!selectedGraph) {
                    selectedGraph = new AmCharts.AmGraph();
                    selectedGraph.scrollbar = true;
                    _this.selectedGraph = selectedGraph;
                    selectedGraph.negativeBase = graph.negativeBase;
                    selectedGraph.noStepRisers = graph.noStepRisers;
                }
            }
            _this.scrollbarCreated = true;
        },


        draw: function() {
            var _this = this;
            AmCharts.ChartScrollbar.base.draw.call(_this);
            if (_this.enabled) {
                if (!_this.scrollbarCreated) {
                    _this.init();
                }

                var chart = _this.chart;
                var data = chart.chartData;

                var categoryAxis = _this.categoryAxis;
                var rotate = _this.rotate;
                var x = _this.x;
                var y = _this.y;
                var width = _this.width;
                var height = _this.height;
                var gridAxis = _this.gridAxis;
                var set = _this.set;

                categoryAxis.setOrientation(!rotate);
                categoryAxis.parseDates = gridAxis.parseDates;
                if (_this.categoryAxis.cname == "ValueAxis") {
                    categoryAxis.rotate = !rotate;
                }
                categoryAxis.equalSpacing = gridAxis.equalSpacing;
                categoryAxis.minPeriod = gridAxis.minPeriod;
                categoryAxis.startOnAxis = gridAxis.startOnAxis;
                categoryAxis.width = width - 1;
                categoryAxis.height = height;
                categoryAxis.gridCount = _this.gridCount;
                categoryAxis.gridColor = _this.gridColor;
                categoryAxis.gridAlpha = _this.gridAlpha;
                categoryAxis.color = _this.color;
                categoryAxis.tickLength = 0;
                categoryAxis.axisAlpha = 0;
                categoryAxis.autoGridCount = _this.autoGridCount;

                if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                    categoryAxis.timeZoom(chart.firstTime, chart.lastTime);
                }

                categoryAxis.minimum = _this.gridAxis.fullMin;
                categoryAxis.maximum = _this.gridAxis.fullMax;
                categoryAxis.strictMinMax = true;
                categoryAxis.zoom(0, data.length - 1);

                var graph = _this.graph;


                if (graph && _this.catScrollbar) {
                    var valueAxis = _this.valueAxis;
                    var graphValueAxis = graph.valueAxis;
                    valueAxis.id = graphValueAxis.id;
                    valueAxis.rotate = rotate;
                    valueAxis.setOrientation(rotate);
                    valueAxis.width = width;
                    valueAxis.height = height;
                    valueAxis.dataProvider = data;
                    valueAxis.reversed = graphValueAxis.reversed;
                    valueAxis.logarithmic = graphValueAxis.logarithmic;
                    valueAxis.gridAlpha = 0;
                    valueAxis.axisAlpha = 0;
                    set.push(valueAxis.set);

                    if (rotate) {
                        valueAxis.y = y;
                        valueAxis.x = 0;
                    } else {
                        valueAxis.x = x;
                        valueAxis.y = 0;
                    }

                    var min = Infinity;
                    var max = -Infinity;
                    var i;
                    for (i = 0; i < data.length; i++) {
                        var values = data[i].axes[graphValueAxis.id].graphs[graph.id].values;
                        var k;
                        for (k in values) {
                            if (values.hasOwnProperty(k)) {
                                if (k != "percents" && k != "total") {
                                    var val = values[k];

                                    if (val < min) {
                                        min = val;
                                    }
                                    if (val > max) {
                                        max = val;
                                    }
                                }
                            }
                        }
                    }

                    if (min != Infinity) {
                        valueAxis.minimum = min;
                    }
                    if (max != -Infinity) {
                        valueAxis.maximum = max + (max - min) * 0.1;
                    }

                    if (min == max) {
                        valueAxis.minimum -= 1;
                        valueAxis.maximum += 1;
                    }

                    if (_this.minimum !== undefined) {
                        valueAxis.minimum = _this.minimum;
                    }

                    if (_this.maximum !== undefined) {
                        valueAxis.maximum = _this.maximum;
                    }

                    valueAxis.zoom(0, data.length - 1);

                    var ug = _this.unselectedGraph;
                    ug.id = graph.id;
                    ug.bcn = "scrollbar-graph-";
                    ug.rotate = rotate;
                    ug.chart = chart;
                    ug.data = data;
                    ug.valueAxis = valueAxis;
                    ug.chart = graph.chart;
                    ug.categoryAxis = _this.categoryAxis;
                    ug.periodSpan = graph.periodSpan;
                    ug.valueField = graph.valueField;
                    ug.openField = graph.openField;
                    ug.closeField = graph.closeField;
                    ug.highField = graph.highField;
                    ug.lowField = graph.lowField;
                    ug.lineAlpha = _this.graphLineAlpha;
                    ug.lineColorR = _this.graphLineColor;
                    ug.fillAlphas = _this.graphFillAlpha;
                    ug.fillColorsR = _this.graphFillColor;
                    ug.connect = graph.connect;
                    ug.hidden = graph.hidden;
                    ug.width = width;
                    ug.height = height;
                    ug.pointPosition = graph.pointPosition;
                    ug.stepDirection = graph.stepDirection;
                    ug.periodSpan = graph.periodSpan;


                    var sg = _this.selectedGraph;
                    sg.id = graph.id;
                    sg.bcn = ug.bcn + "selected-";
                    sg.rotate = rotate;
                    sg.chart = chart;
                    sg.data = data;
                    sg.valueAxis = valueAxis;
                    sg.chart = graph.chart;
                    sg.categoryAxis = categoryAxis;
                    sg.periodSpan = graph.periodSpan;
                    sg.valueField = graph.valueField;
                    sg.openField = graph.openField;
                    sg.closeField = graph.closeField;
                    sg.highField = graph.highField;
                    sg.lowField = graph.lowField;
                    sg.lineAlpha = _this.selectedGraphLineAlpha;
                    sg.lineColorR = _this.selectedGraphLineColor;
                    sg.fillAlphas = _this.selectedGraphFillAlpha;
                    sg.fillColorsR = _this.selectedGraphFillColor;
                    sg.connect = graph.connect;
                    sg.hidden = graph.hidden;
                    sg.width = width;
                    sg.height = height;

                    sg.pointPosition = graph.pointPosition;
                    sg.stepDirection = graph.stepDirection;
                    sg.periodSpan = graph.periodSpan;

                    var graphType = _this.graphType;

                    if (!graphType) {
                        graphType = graph.type;
                    }

                    ug.type = graphType;
                    sg.type = graphType;

                    var lastIndex = data.length - 1;
                    ug.zoom(0, lastIndex);
                    sg.zoom(0, lastIndex);

                    sg.set.click(function() {
                        _this.handleBackgroundClick();
                    }).mouseover(function() {
                        _this.handleMouseOver();
                    }).mouseout(function() {
                        _this.handleMouseOut();
                    });

                    ug.set.click(function() {
                        _this.handleBackgroundClick();
                    }).mouseover(function() {
                        _this.handleMouseOver();
                    }).mouseout(function() {
                        _this.handleMouseOut();
                    });
                    set.push(ug.set);
                    set.push(sg.set);
                }

                set.push(categoryAxis.set);
                set.push(categoryAxis.labelsSet);

                _this.bg.toBack();
                _this.invisibleBg.toFront();
                _this.dragger.toFront();
                _this.iconLeft.toFront();
                _this.iconRight.toFront();
            }
        },

        timeZoom: function(startTime, endTime, dispatch) {
            var _this = this;
            _this.startTime = startTime;
            _this.endTime = endTime;
            _this.timeDifference = endTime - startTime;
            _this.skipEvent = !AmCharts.toBoolean(dispatch);
            _this.zoomScrollbar();

            //if (!_this.skipEvent) {
                _this.dispatchScrollbarEvent();
            //}
        },

        zoom: function(start, end) {
            var _this = this;
            _this.start = start;
            _this.end = end;
            _this.skipEvent = true;
            _this.zoomScrollbar();
        },

        dispatchScrollbarEvent: function() {
            var _this = this;
            if(_this.categoryAxis){
                if (_this.categoryAxis.cname == "ValueAxis") {
                    AmCharts.ChartScrollbar.base.dispatchScrollbarEvent.call(_this);
                    return;
                }
            }

            if (_this.skipEvent) {
                _this.skipEvent = false;
            } else {
                var data = _this.chart.chartData;
                var draggerPos;
                var draggerSize;
                var dBBox = _this.dragger.getBBox();
                var xx = dBBox.x;
                var yy = dBBox.y;
                var ww = dBBox.width;
                var hh = dBBox.height;

                var chart = _this.chart;

                if (_this.rotate) {
                    draggerPos = yy;
                    draggerSize = hh;
                } else {
                    draggerPos = xx;
                    draggerSize = ww;
                }

                var event = {
                    type: "zoomed"
                };
                event.target = this;
                event.chart = chart;

                var categoryAxis = _this.categoryAxis;
                var stepWidth = _this.stepWidth;

                var minSelectedTime = chart.minSelectedTime;
                var maxSelectedTime = chart.maxSelectedTime;
                var forceUpdate = false;
                if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                    var lastTime = chart.lastTime;
                    var firstTime = chart.firstTime;

                    var startTime = Math.round(draggerPos / stepWidth) + firstTime;
                    var endTime;

                    if (!_this.dragging) {
                        endTime = Math.round((draggerPos + draggerSize) / stepWidth) + firstTime;
                    } else {
                        endTime = startTime + _this.timeDifference;
                    }

                    if (startTime > endTime) {
                        startTime = endTime;
                    }

                    var middleTime;
                    var delta;
                    if (minSelectedTime > 0 && endTime - startTime < minSelectedTime) {
                        middleTime = Math.round(startTime + (endTime - startTime) / 2);
                        delta = Math.round(minSelectedTime / 2);
                        startTime = middleTime - delta;
                        endTime = middleTime + delta;
                        forceUpdate = true;
                    }

                    if (maxSelectedTime > 0 && endTime - startTime > maxSelectedTime) {
                        middleTime = Math.round(startTime + (endTime - startTime) / 2);
                        delta = Math.round(maxSelectedTime / 2);
                        startTime = middleTime - delta;
                        endTime = middleTime + delta;
                        forceUpdate = true;
                    }

                    if (endTime > lastTime) {
                        endTime = lastTime;
                    }

                    if (endTime - minSelectedTime < startTime) {
                        startTime = endTime - minSelectedTime;
                    }

                    if (startTime < firstTime) {
                        startTime = firstTime;
                    }

                    if (startTime + minSelectedTime > endTime) {
                        endTime = startTime + minSelectedTime;
                    }

                    if (startTime != _this.startTime || endTime != _this.endTime) {
                        _this.startTime = startTime;
                        _this.endTime = endTime;
                        event.start = startTime;
                        event.end = endTime;
                        event.startDate = new Date(startTime);
                        event.endDate = new Date(endTime);
                        _this.fire(event);
                    }
                } else {
                    if (!categoryAxis.startOnAxis) {
                        var halfStep = stepWidth / 2;
                        draggerPos += halfStep;
                    }

                    draggerSize -= _this.stepWidth / 2;

                    var start = categoryAxis.xToIndex(draggerPos);
                    var end = categoryAxis.xToIndex(draggerPos + draggerSize);

                    if (start != _this.start || _this.end != end) {
                        if (categoryAxis.startOnAxis) {
                            if (_this.resizingRight && start == end) {
                                end++;
                            }

                            if (_this.resizingLeft && start == end) {
                                if (start > 0) {
                                    start--;
                                } else {
                                    end = 1;
                                }
                            }
                        }

                        _this.start = start;
                        if (!_this.dragging) {
                            _this.end = end;
                        } else {
                            _this.end = _this.start + _this.difference;
                        }

                        event.start = _this.start;
                        event.end = _this.end;

                        if (categoryAxis.parseDates) {
                            if (data[_this.start]) {
                                event.startDate = new Date(data[_this.start].time);
                            }
                            if (data[_this.end]) {
                                event.endDate = new Date(data[_this.end].time);
                            }
                        }

                        _this.fire(event);
                    }
                }
                /* if this is set when parseDates is false, this causes scrollbar to jump ugly
               as this was done to sync scrollbars well in stock chart, should work fine.
            */
                if (forceUpdate) {
                    _this.zoomScrollbar(true);
                }
            }
        },


        zoomScrollbar: function(force) {
            var _this = this;
            if (_this.dragging || _this.resizingLeft || _this.resizingRight || _this.animating) {
                if (!force) {
                    return;
                }
            }

            if (_this.dragger && _this.enabled) { // safe way to know scrollbar is drawn
                var pos0;
                var pos1;
                var chart = _this.chart;
                var data = chart.chartData;
                var categoryAxis = _this.categoryAxis;
                var stepWidth;

                if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                    stepWidth = categoryAxis.stepWidth;

                    var firstTime = chart.firstTime;

                    pos0 = stepWidth * (_this.startTime - firstTime);
                    pos1 = stepWidth * (_this.endTime - firstTime);
                } else {
                    pos0 = data[_this.start].x[categoryAxis.id];
                    pos1 = data[_this.end].x[categoryAxis.id];

                    stepWidth = categoryAxis.stepWidth;

                    if (!categoryAxis.startOnAxis) {
                        var halfStep = stepWidth / 2;
                        pos0 -= halfStep;
                        pos1 += halfStep;
                    }
                }
                _this.stepWidth = stepWidth;
                _this.updateScrollbarSize(pos0, pos1);
            }
        },


        maskGraphs: function(x, y, w, h) {
            var _this = this;
            var selectedGraph = _this.selectedGraph;
            if (selectedGraph) {
                selectedGraph.set.clipRect(x, y, w, h);
            }
        },

        handleDragStart: function() {
            var _this = this;
            AmCharts.ChartScrollbar.base.handleDragStart.call(_this);
            _this.difference = _this.end - _this.start;
            _this.timeDifference = _this.endTime - _this.startTime;
            if (_this.timeDifference < 0) {
                _this.timeDifference = 0;
            }
        },

        handleBackgroundClick: function() {
            var _this = this;
            AmCharts.ChartScrollbar.base.handleBackgroundClick.call(_this);

            if (!_this.dragging) {
                _this.difference = _this.end - _this.start;
                _this.timeDifference = _this.endTime - _this.startTime;
                if (_this.timeDifference < 0) {
                    _this.timeDifference = 0;
                }
            }
        }

    });
})();
(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.AmCoordinateChart = AmCharts.Class({

        inherits: AmCharts.AmChart,

        construct: function(theme) {
            var _this = this;
            AmCharts.AmCoordinateChart.base.construct.call(_this, theme);
            _this.theme = theme;
            _this.createEvents("rollOverGraphItem", "rollOutGraphItem", "clickGraphItem", "doubleClickGraphItem", "rightClickGraphItem", "clickGraph", "rollOverGraph", "rollOutGraph");
            _this.startAlpha = 1;
            _this.startDuration = 0;
            _this.startEffect = "elastic";
            _this.sequencedAnimation = true;
            _this.colors = ["#FF6600", "#FCD202", "#B0DE09", "#0D8ECF", "#2A0CD0", "#CD0D74", "#CC0000", "#00CC00", "#0000CC", "#DDDDDD", "#999999", "#333333", "#990000"];
            _this.balloonDateFormat = "MMM DD, YYYY";
            _this.valueAxes = [];
            _this.graphs = [];
            _this.guides = [];
            _this.gridAboveGraphs = false;

            AmCharts.applyTheme(_this, theme, "AmCoordinateChart");
        },

        initChart: function() {
            var _this = this;
            AmCharts.AmCoordinateChart.base.initChart.call(_this);

            _this.drawGraphs = true;

            var categoryAxis = _this.categoryAxis;
            if (categoryAxis) {
                _this.categoryAxis = AmCharts.processObject(categoryAxis, AmCharts.CategoryAxis, _this.theme);
            }

            _this.processValueAxes();

            _this.createValueAxes();

            _this.processGraphs();

            _this.processGuides();

            if (AmCharts.VML) {
                _this.startAlpha = 1;
            }
            _this.setLegendData(_this.graphs);

            if (_this.gridAboveGraphs) {
                _this.gridSet.toFront();
                _this.bulletSet.toFront();
                _this.balloonsSet.toFront();
            }
        },


        createValueAxes: function() {
            var _this = this;
            if (_this.valueAxes.length === 0) {
                var valueAxis = new AmCharts.ValueAxis();
                _this.addValueAxis(valueAxis);
            }
        },


        parseData: function() {
            var _this = this;
            _this.processValueAxes();
            _this.processGraphs();
        },

        parseSerialData: function(dataProvider) {
            var _this = this;

            _this.chartData = [];

            if (dataProvider) {
                if (_this.processTimeout > 0) {

                    if (_this.processCount < 1) {
                        _this.processCount = 1;
                    }

                    var count = dataProvider.length / _this.processCount;
                    _this.parseCount = Math.ceil(count) - 1;
                    for (var i = 0; i < count; i++) {
                        _this.delayParseSerialData(dataProvider, i);
                    }
                } else {
                    _this.parseCount = 0;
                    _this.parsePartSerialData(dataProvider, 0, dataProvider.length, 0);
                }
            } else {
                _this.onDataUpdated();
            }
        },

        delayParseSerialData: function(dataProvider, index) {
            var _this = this;
            var processCount = _this.processCount;

            setTimeout(function() {
                _this.parsePartSerialData.call(_this, dataProvider, index * processCount, (index + 1) * processCount, index);
            }, _this.processTimeout);
        },


        parsePartSerialData: function(dataProvider, start, end, index) {
            var _this = this;

            if (end > dataProvider.length) {
                end = dataProvider.length;
            }

            var graphs = _this.graphs;
            var graph;
            var emptyObj = {};
            var seriesIdField = _this.seriesIdField;
            if (!seriesIdField) {
                seriesIdField = _this.categoryField;
            }

            var parseDates = false;
            var categoryFunction;
            var categoryAxis = _this.categoryAxis;
            var forceShowField;
            var labelColorField;
            var classNameField;

            if (categoryAxis) {
                parseDates = categoryAxis.parseDates;
                forceShowField = categoryAxis.forceShowField;
                classNameField = categoryAxis.classNameField;
                labelColorField = categoryAxis.labelColorField;
                categoryFunction = categoryAxis.categoryFunction;
            }

            var periodObj;
            var cleanPeriod;
            var periodCount;
            var previousTime = {};
            var periodDuration;

            if (parseDates) {
                periodObj = AmCharts.extractPeriod(categoryAxis.minPeriod);
                cleanPeriod = periodObj.period;
                periodCount = periodObj.count;
                periodDuration = AmCharts.getPeriodDuration(cleanPeriod, periodCount);
            }

            var lookupTable = {};
            _this.lookupTable = lookupTable;

            var i;
            var dataDateFormat = _this.dataDateFormat;
            var previousDataItem = {};


            for (i = start; i < end; i++) {
                var serialDataItem = {};
                var dataItemRaw = dataProvider[i];
                var value = dataItemRaw[_this.categoryField];
                serialDataItem.dataContext = dataItemRaw;

                if (categoryFunction) {
                    serialDataItem.category = categoryFunction(value, dataItemRaw, categoryAxis);
                } else {
                    serialDataItem.category = String(value);
                }

                if (forceShowField) {
                    serialDataItem.forceShow = dataItemRaw[forceShowField];
                }

                if (classNameField) {
                    serialDataItem.className = dataItemRaw[classNameField];
                }

                if (labelColorField) {
                    serialDataItem.labelColor = dataItemRaw[labelColorField];
                }

                var seriesId = dataItemRaw[seriesIdField];
                lookupTable[seriesId] = serialDataItem;

                if (parseDates) {

                    if (categoryAxis.categoryFunction) {
                        value = categoryAxis.categoryFunction(value, dataItemRaw, categoryAxis);
                    } else {
                        if (dataDateFormat && !(value instanceof Date)) {
                            value = value.toString() + " |";
                        }
                        value = AmCharts.getDate(value, dataDateFormat, categoryAxis.minPeriod);
                    }

                    value = AmCharts.resetDateToMin(value, cleanPeriod, periodCount, categoryAxis.firstDayOfWeek);

                    serialDataItem.category = value;
                    serialDataItem.time = value.getTime();

                    if (isNaN(serialDataItem.time)) {
                        continue;
                    }
                }

                var valueAxes = _this.valueAxes;
                serialDataItem.axes = {};
                serialDataItem.x = {};
                var j;
                for (j = 0; j < valueAxes.length; j++) {
                    var axisId = valueAxes[j].id;

                    serialDataItem.axes[axisId] = {};
                    serialDataItem.axes[axisId].graphs = {};
                    var k;
                    for (k = 0; k < graphs.length; k++) {
                        graph = graphs[k];
                        var graphId = graph.id;

                        var gapPeriod = 1.1;
                        if (!isNaN(graph.gapPeriod)) {
                            gapPeriod = graph.gapPeriod;
                        }

                        var periodValue = graph.periodValue;

                        if (graph.valueAxis.id == axisId) {
                            serialDataItem.axes[axisId].graphs[graphId] = {};

                            var graphDataItem = {};
                            graphDataItem.index = i;

                            var rawItem = dataItemRaw;
                            if (graph.dataProvider) {
                                rawItem = emptyObj;
                            }

                            graphDataItem.values = _this.processValues(rawItem, graph, periodValue);

                            if (!graph.connect) {
                                if (previousDataItem) {
                                    if (previousDataItem[graphId]) {
                                        if (gapPeriod > 0) {
                                            if (serialDataItem.time - previousTime[graphId] >= periodDuration * gapPeriod) {
                                                previousDataItem[graphId].gap = true;
                                            }
                                        }
                                    }
                                }
                            }

                            _this.processFields(graph, graphDataItem, rawItem);

                            graphDataItem.category = serialDataItem.category;
                            graphDataItem.serialDataItem = serialDataItem;
                            graphDataItem.graph = graph;
                            serialDataItem.axes[axisId].graphs[graphId] = graphDataItem;

                            previousTime[graphId] = serialDataItem.time;
                            previousDataItem[graphId] = graphDataItem;
                        }
                    }                    
                }
                _this.chartData[i] = serialDataItem;
            }

            if (_this.parseCount == index) {
                var g;
                for (g = 0; g < graphs.length; g++) {
                    graph = graphs[g];
                    if (graph.dataProvider) {
                        _this.parseGraphData(graph);
                    }
                }

                _this.dataChanged = false;
                _this.dispatchDataUpdated = true;
                _this.onDataUpdated();
            }
        },


        processValues: function(dataItemRaw, graph, periodValue) {
            var values = {};
            var val;
            var candle = false;
            if ((graph.type == "candlestick" || graph.type == "ohlc") && periodValue !== "") {
                candle = true;
            }

            var fieldNames = ["value", "error", "open", "close", "low", "high"];

            for (var i = 0; i < fieldNames.length; i++) {
                var f = fieldNames[i];
                if (f != "value" && f != "error") {
                    if (candle) {
                        periodValue = f.charAt(0).toUpperCase() + f.slice(1);
                    }
                }
                var rawValue = dataItemRaw[graph[f + "Field"] + periodValue];

                if (rawValue !== null) {
                    val = Number(rawValue);
                    if (!isNaN(val)) {
                        values[f] = val;
                    }

                    if (graph.valueAxis.type == "date") {
                        if (rawValue !== undefined) {
                            var date = AmCharts.getDate(rawValue, graph.chart.dataDateFormat);
                            values[f] = date.getTime();
                        }
                    }
                }
            }

            return values;
        },


        parseGraphData: function(graph) {
            var _this = this;
            var dataProvider = graph.dataProvider;
            var categoryField = graph.categoryField;
            if (!categoryField) {
                categoryField = _this.categoryField;
            }

            var seriesIdField = graph.seriesIdField;
            if (!seriesIdField) {
                seriesIdField = _this.seriesIdField;
            }
            if (!seriesIdField) {
                seriesIdField = _this.categoryField;
            }
            var i;
            for (i = 0; i < dataProvider.length; i++) {
                var dataItemRaw = dataProvider[i];
                var seriesId = String(dataItemRaw[seriesIdField]);
                var serialDataItem = _this.lookupTable[seriesId];
                var axisId = graph.valueAxis.id;

                if (serialDataItem) {
                    var graphDataItem = serialDataItem.axes[axisId].graphs[graph.id];
                    graphDataItem.serialDataItem = serialDataItem;
                    var periodValue = graph.periodValue;
                    graphDataItem.values = _this.processValues(dataItemRaw, graph, periodValue);
                    _this.processFields(graph, graphDataItem, dataItemRaw);
                }
            }
        },


        addValueAxis: function(axis) {
            var _this = this;
            axis.chart = this;
            _this.valueAxes.push(axis);
            _this.validateData();
        },

        removeValueAxesAndGraphs: function() {
            var _this = this;
            var valueAxes = _this.valueAxes;
            var i;
            for (i = valueAxes.length - 1; i > -1; i--) {
                _this.removeValueAxis(valueAxes[i]);
            }
        },

        removeValueAxis: function(valueAxis) {
            var _this = this;
            var graphs = _this.graphs;
            var i;

            for (i = graphs.length - 1; i >= 0; i--) {
                var graph = graphs[i];
                if (graph) {
                    if (graph.valueAxis == valueAxis) {
                        _this.removeGraph(graph);
                    }
                }
            }

            var valueAxes = _this.valueAxes;

            for (i = valueAxes.length - 1; i >= 0; i--) {
                if (valueAxes[i] == valueAxis) {
                    valueAxes.splice(i, 1);
                }
            }
            _this.validateData();
        },

        addGraph: function(graph) {
            var _this = this;
            _this.graphs.push(graph);
            _this.chooseGraphColor(graph, _this.graphs.length - 1);
            _this.validateData();
        },

        removeGraph: function(graph) {
            var _this = this;
            var graphs = _this.graphs;
            var i;
            for (i = graphs.length - 1; i >= 0; i--) {
                if (graphs[i] == graph) {
                    graphs.splice(i, 1);
                    graph.destroy();
                }
            }
            _this.validateData();
        },

        handleValueAxisZoom: function() {

        },

        processValueAxes: function() {
            var _this = this;
            var valueAxes = _this.valueAxes;
            var i;

            for (i = 0; i < valueAxes.length; i++) {
                var valueAxis = valueAxes[i];
                valueAxis = AmCharts.processObject(valueAxis, AmCharts.ValueAxis, _this.theme);
                valueAxes[i] = valueAxis;
                valueAxis.chart = this;
                valueAxis.init();

                _this.listenTo(valueAxis, "axisIntZoomed", _this.handleValueAxisZoom);

                if (!valueAxis.id) {
                    valueAxis.id = "valueAxisAuto" + i + "_" + new Date().getTime();
                }
                if (valueAxis.usePrefixes === undefined) {
                    valueAxis.usePrefixes = _this.usePrefixes;
                }
            }
        },

        processGuides: function() {
            var _this = this;
            var guides = _this.guides;
            var categoryAxis = _this.categoryAxis;

            if (guides) {

                for (var i = 0; i < guides.length; i++) {
                    var guide = guides[i];
                    if (guide.category !== undefined || guide.date !== undefined) {
                        if (categoryAxis) {
                            categoryAxis.addGuide(guide);
                        }
                    }

                    if (!guide.id) {
                        guide.id = "guideAuto" + i + "_" + new Date().getTime();
                    }

                    var valueAxis = guide.valueAxis;
                    if (valueAxis) {
                        if (AmCharts.isString(valueAxis)) {
                            valueAxis = _this.getValueAxisById(valueAxis);
                        }
                        if (valueAxis) {
                            valueAxis.addGuide(guide);
                        } else {
                            _this.valueAxes[0].addGuide(guide);
                        }
                    } else if (!isNaN(guide.value)) {
                        _this.valueAxes[0].addGuide(guide);
                    }
                }
            }
        },

        processGraphs: function() {
            var _this = this;
            var graphs = _this.graphs;
            var i;
            _this.graphsById = {};
            for (i = 0; i < graphs.length; i++) {
                var graph = graphs[i];

                graph = AmCharts.processObject(graph, AmCharts.AmGraph, _this.theme);
                graphs[i] = graph;

                _this.chooseGraphColor(graph, i);

                graph.chart = this;

                graph.init();

                if (AmCharts.isString(graph.valueAxis)) {
                    graph.valueAxis = _this.getValueAxisById(graph.valueAxis);
                }

                if (!graph.valueAxis) {
                    graph.valueAxis = _this.valueAxes[0];
                }

                if (!graph.id) {
                    graph.id = "graphAuto" + i + "_" + new Date().getTime();
                }

                _this.graphsById[graph.id] = graph;
            }
        },

        formatString: function(text, dItem, noFixBrakes) {
            var graph = dItem.graph;

            // format duration
            var valAxis = graph.valueAxis;
            if (valAxis.duration) {
                if (dItem.values.value) {
                    var duration = AmCharts.formatDuration(dItem.values.value, valAxis.duration, "", valAxis.durationUnits, valAxis.maxInterval, valAxis.numberFormatter);
                    text = text.split("[[value]]").join(duration);
                }
            }

            text = AmCharts.massReplace(text, {
                "[[title]]": graph.title,
                "[[description]]": dItem.description
            });
            if (!noFixBrakes) {
                text = AmCharts.fixBrakes(text);
            } else {
                // balloon
                text = AmCharts.fixNewLines(text);
            }
            text = AmCharts.cleanFromEmpty(text);

            return text;
        },


        getBalloonColor: function(graph, graphDataItem, graphIsPriority) {
            var color = graph.lineColor;
            var balloonColor = graph.balloonColor;

            if (graphIsPriority) {
                balloonColor = color;
            }

            var fillColors = graph.fillColorsR;
            var UNDEFINED;

            if (typeof(fillColors) == "object") {
                color = fillColors[0];
            } else if (fillColors !== UNDEFINED) {
                color = fillColors;
            }

            if (graphDataItem.isNegative) {
                var negativeColor = graph.negativeLineColor;
                var negativeFillColors = graph.negativeFillColors;
                if (typeof(negativeFillColors) == "object") {
                    negativeColor = negativeFillColors[0];
                } else if (negativeFillColors !== UNDEFINED) {
                    negativeColor = negativeFillColors;
                }

                if (negativeColor !== UNDEFINED) {
                    color = negativeColor;
                }
            }

            if (graphDataItem.color !== UNDEFINED) {
                color = graphDataItem.color;
            }

            if (graphDataItem.lineColor !== UNDEFINED) {
                color = graphDataItem.lineColor;
            }

            var itemFillColors = graphDataItem.fillColors;
            if (itemFillColors !== UNDEFINED) {
                color = itemFillColors;
                if (AmCharts.ifArray(itemFillColors)) {
                    color = itemFillColors[0];
                }
            }

            if (balloonColor === UNDEFINED) {
                balloonColor = color;
            }
            return balloonColor;
        },

        getGraphById: function(id) {
            return AmCharts.getObjById(this.graphs, id);
        },

        getValueAxisById: function(id) {
            return AmCharts.getObjById(this.valueAxes, id);
        },

        processFields: function(graph, graphDataItem, dataItemRaw) {
            if (graph.itemColors) {
                var itemColors = graph.itemColors;
                var index = graphDataItem.index;

                if (index < itemColors.length) {
                    graphDataItem.color = itemColors[index];
                } else {
                    graphDataItem.color = AmCharts.randomColor();
                }
            }

            var fields = ["lineColor", "color", "alpha", "fillColors", "description", "bullet", "customBullet", "bulletSize", "bulletConfig", "url", "labelColor", "dashLength", "pattern", "gap", "className"];
            var i;
            for (i = 0; i < fields.length; i++) {
                var field = fields[i];
                var fieldName = graph[field + "Field"];

                if (fieldName) {
                    var val = dataItemRaw[fieldName];
                    if (AmCharts.isDefined(val)) {
                        graphDataItem[field] = val;
                    }
                }
            }
            graphDataItem.dataContext = dataItemRaw;
        },

        chooseGraphColor: function(graph, index) {

            var _this = this;
            if (!graph.lineColor) {
                var color;
                if (_this.colors.length > index) {
                    color = _this.colors[index];
                } else {
                    if (graph.lineColorR) {
                        color = graph.lineColorR;
                    } else {
                        color = AmCharts.randomColor();
                    }
                }

                graph.lineColorR = color;
            } else {
                graph.lineColorR = graph.lineColor;
            }
            if (!graph.fillColors) {
                graph.fillColorsR = graph.lineColorR;
            } else {
                graph.fillColorsR = graph.fillColors;
            }
            if (!graph.bulletBorderColor) {
                if (graph.useLineColorForBulletBorder) {
                    graph.bulletBorderColorR = graph.lineColorR;
                } else {
                    graph.bulletBorderColorR = graph.bulletColor;
                }
            } else {
                graph.bulletBorderColorR = graph.bulletBorderColor;
            }

            if (!graph.bulletColor) {
                graph.bulletColorR = graph.lineColorR;
            } else {
                graph.bulletColorR = graph.bulletColor;
            }

            var patterns = _this.patterns;
            if (patterns) {
                graph.pattern = patterns[index];
            }
        },

        handleLegendEvent: function(event) {
            var _this = this;
            var type = event.type;
            var dataItem = event.dataItem;
            if (!_this.legend.data) {
                if (dataItem) {
                    var hidden = dataItem.hidden;
                    var showBalloon = dataItem.showBalloon;

                    switch (type) {
                        case "clickMarker":
                            if (_this.textClickEnabled) {
                                if (showBalloon) {
                                    _this.hideGraphsBalloon(dataItem);
                                } else {
                                    _this.showGraphsBalloon(dataItem);
                                }
                            }
                            break;
                        case "clickLabel":

                            if (showBalloon) {
                                _this.hideGraphsBalloon(dataItem);
                            } else {
                                _this.showGraphsBalloon(dataItem);
                            }
                            break;

                        case "rollOverItem":
                            if (!hidden) {
                                _this.highlightGraph(dataItem);
                            }
                            break;

                        case "rollOutItem":
                            if (!hidden) {
                                _this.unhighlightGraph();
                            }
                            break;

                        case "hideItem":
                            _this.hideGraph(dataItem);
                            break;

                        case "showItem":
                            _this.showGraph(dataItem);
                            break;
                    }
                }
            }
        },


        highlightGraph: function(thisGraph) {
            var _this = this;
            var graphs = _this.graphs;
            var i;
            var alpha = 0.2;

            if (_this.legend) {
                alpha = _this.legend.rollOverGraphAlpha;
            }

            if (alpha != 1) {
                for (i = 0; i < graphs.length; i++) {
                    var graph = graphs[i];
                    if (graph != thisGraph) {
                        graph.changeOpacity(alpha);
                    }
                }
            }
        },

        unhighlightGraph: function() {
            var _this = this;
            var alpha;

            if (_this.legend) {
                alpha = _this.legend.rollOverGraphAlpha;
            }

            if (alpha != 1) {
                var graphs = _this.graphs;
                var i;
                for (i = 0; i < graphs.length; i++) {
                    var graph = graphs[i];
                    graph.changeOpacity(1);
                }
            }
        },

        showGraph: function(graph) {
            var _this = this;
            if (graph.switchable) {
                graph.hidden = false;
                _this.dataChanged = true;
                if (_this.type != "xy") {
                    _this.marginsUpdated = false;
                }
                if (_this.chartCreated) {
                    _this.initChart();
                }
            }
        },

        hideGraph: function(graph) {
            var _this = this;
            if (graph.switchable) {
                _this.dataChanged = true;
                if (_this.type != "xy") {
                    _this.marginsUpdated = false;
                }
                graph.hidden = true;
                if (_this.chartCreated) {
                    _this.initChart();
                }
            }
        },

        hideGraphsBalloon: function(graph) {
            var _this = this;
            graph.showBalloon = false;
            _this.updateLegend();
        },

        showGraphsBalloon: function(graph) {
            var _this = this;
            graph.showBalloon = true;
            _this.updateLegend();
        },

        updateLegend: function() {
            var _this = this;
            if (_this.legend) {
                _this.legend.invalidateSize();
            }
        },

        resetAnimation: function() {
            var _this = this;
            var graphs = _this.graphs;
            if (graphs) {
                var i;
                for (i = 0; i < graphs.length; i++) {
                    graphs[i].animationPlayed = false;
                }
            }
        },

        animateAgain: function() {
            var _this = this;
            _this.resetAnimation();
            _this.validateNow();
        }

    });

})();
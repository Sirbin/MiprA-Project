(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.AmStockChart = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.type = "stock";
            _this.cname = "AmStockChart";
            AmCharts.addChart(_this);
            _this.version = "3.19.6";
            _this.theme = theme;
            _this.createEvents("buildStarted", "zoomed", "rollOverStockEvent", "rollOutStockEvent", "clickStockEvent", "panelRemoved", "dataUpdated", "init", "rendered", "drawn", "resized");

            _this.colors = ["#FF6600", "#FCD202", "#B0DE09", "#0D8ECF", "#2A0CD0", "#CD0D74", "#CC0000", "#00CC00", "#0000CC", "#DDDDDD", "#999999", "#333333", "#990000"];

            _this.firstDayOfWeek = 1;
            _this.glueToTheEnd = false;
            _this.dataSetCounter = -1;
            _this.zoomOutOnDataSetChange = false;

            _this.panels = [];
            _this.dataSets = [];
            _this.chartCursors = [];
            _this.comparedDataSets = [];
            _this.classNamePrefix = "amcharts";
            _this.categoryAxesSettings = new AmCharts.CategoryAxesSettings(theme);
            _this.valueAxesSettings = new AmCharts.ValueAxesSettings(theme);
            _this.panelsSettings = new AmCharts.PanelsSettings(theme);
            _this.chartScrollbarSettings = new AmCharts.ChartScrollbarSettings(theme);
            _this.chartCursorSettings = new AmCharts.ChartCursorSettings(theme);
            _this.stockEventsSettings = new AmCharts.StockEventsSettings(theme);
            _this.legendSettings = new AmCharts.LegendSettings(theme);
            _this.balloon = new AmCharts.AmBalloon(theme);
            _this.previousEndDate = new Date(0);
            _this.previousStartDate = new Date(0);
            _this.graphCount = 0;
            _this.dataSetCount = 0;
            _this.chartCreated = false;
            _this.processTimeout = 0;
            // _this.dataDateFormat = "YYYY-MM-DD";
            _this.extendToFullPeriod = true;
            _this.autoResize = true;
            AmCharts.applyTheme(_this, theme, _this.cname);
        },


        write: function(divId) {
            var _this = this;

            if (_this.listeners) {
                for (var e in _this.listeners) {
                    var ev = _this.listeners[e];
                    _this.addListener(ev.event, ev.method);
                }
            }

            var event = {
                type: "buildStarted",
                chart: _this
            };
            _this.fire(event);
            if (_this.afterWriteTO) {
                clearTimeout(_this.afterWriteTO);
            }

            if (_this.processTimeout > 0) {
                _this.afterWriteTO = setTimeout(function() {
                    _this.afterWrite.call(_this, divId);
                }, _this.processTimeout);
            } else {
                _this.afterWrite(divId);
            }
        },

        afterWrite: function(divId) {
            var _this = this;
            var theme = _this.theme;

            if (window.AmCharts_path) {
                _this.path = window.AmCharts_path;
            }

            if (_this.path === undefined) {
                _this.path = AmCharts.getPath();
            }

            if (_this.path === undefined) {
                _this.path = "amcharts/";
            }

            _this.path = AmCharts.normalizeUrl(_this.path);

            if (_this.pathToImages === undefined) {
                _this.pathToImages = _this.path + "images/";
            }

            if (!_this.initHC) {
                AmCharts.callInitHandler(this);
                _this.initHC = true;
            }
            AmCharts.applyLang(_this.language, _this);
            _this.chartCursors = [];

            var exportConfig = _this.exportConfig;
            if (exportConfig && AmCharts.AmExport) {
                if (!_this.AmExport) {
                    _this.AmExport = new AmCharts.AmExport(_this, exportConfig);
                }
            }

            if (_this.amExport && AmCharts.AmExport) {
                _this.AmExport = AmCharts.extend(_this.amExport, new AmCharts.AmExport(this), true);
            }

            if (_this.AmExport) {
                _this.AmExport.init();
            }

            _this.chartRendered = false;
            var div;
            if (typeof(divId) != "object") {
                div = document.getElementById(divId);
            } else {
                div = divId;
            }

            if (_this.zoomOutOnDataSetChange) {
                _this.startDate = undefined;
                _this.endDate = undefined;
            }

            _this.categoryAxesSettings = AmCharts.processObject(_this.categoryAxesSettings, AmCharts.CategoryAxesSettings, theme);
            _this.valueAxesSettings = AmCharts.processObject(_this.valueAxesSettings, AmCharts.ValueAxesSettings, theme);
            _this.chartCursorSettings = AmCharts.processObject(_this.chartCursorSettings, AmCharts.ChartCursorSettings, theme);
            _this.chartScrollbarSettings = AmCharts.processObject(_this.chartScrollbarSettings, AmCharts.ChartScrollbarSettings, theme);
            _this.legendSettings = AmCharts.processObject(_this.legendSettings, AmCharts.LegendSettings, theme);
            _this.panelsSettings = AmCharts.processObject(_this.panelsSettings, AmCharts.PanelsSettings, theme);
            _this.stockEventsSettings = AmCharts.processObject(_this.stockEventsSettings, AmCharts.StockEventsSettings, theme);

            if (_this.dataSetSelector) {
                _this.dataSetSelector = AmCharts.processObject(_this.dataSetSelector, AmCharts.DataSetSelector, theme);
            }

            if (_this.periodSelector) {
                _this.periodSelector = AmCharts.processObject(_this.periodSelector, AmCharts.PeriodSelector, theme);
            }

            div.innerHTML = "";

            _this.div = div;
            _this.measure();
            _this.createLayout();

            _this.updateDataSets();
            _this.addDataSetSelector();
            _this.addPeriodSelector();
            _this.addPanels();
            _this.updatePanels();
            _this.addChartScrollbar();

            _this.updateData();

            if (!_this.skipDefault) {
                _this.setDefaultPeriod();
            }
            _this.skipEvents = false;
        },

        setDefaultPeriod: function() {
            var _this = this;
            var periodSelector = _this.periodSelector;
            if (periodSelector) {
                _this.animationPlayed = false;
                periodSelector.setDefaultPeriod();
            }
        },

        validateSize: function() {
            var _this = this;
            _this.measurePanels();
        },

        updateDataSets: function() {
            var _this = this;
            var mainDataSet = _this.mainDataSet;
            var dataSets = _this.dataSets;

            var i;
            for (i = 0; i < dataSets.length; i++) {
                var dataSet = dataSets[i];

                dataSet = AmCharts.processObject(dataSet, AmCharts.DataSet);
                dataSets[i] = dataSet;

                if (!dataSet.id) {
                    _this.dataSetCount++;
                    dataSet.id = "ds" + _this.dataSetCount;
                }

                if (dataSet.color === undefined) {
                    if (_this.colors.length - 1 > i) {
                        dataSet.color = _this.colors[i];
                    } else {
                        dataSet.color = AmCharts.randomColor();
                    }
                }
            }
            if (!mainDataSet) {
                if (AmCharts.ifArray(dataSets)) {
                    _this.mainDataSet = _this.dataSets[0];
                }
            }

            _this.getSelections();
        },


        getLastDate: function(value) {
            var _this = this;
            var newDate = AmCharts.getDate(value, _this.dataDateFormat, "fff");
            var minPeriod = _this.categoryAxesSettings.minPeriod;
            var lastTime = AmCharts.changeDate(newDate, _this.categoryAxesSettings.minPeriod, 1, true).getTime();

            if (minPeriod.indexOf("fff") == -1) {
                lastTime -= 1;
            }
            return new Date(lastTime);
        },

        getFirstDate: function(value) {
            var _this = this;
            var newDate = AmCharts.getDate(value, _this.dataDateFormat, "fff");
            return new Date(AmCharts.resetDateToMin(newDate, _this.categoryAxesSettings.minPeriod, 1, _this.firstDayOfWeek));
        },

        updateData: function() {
            var _this = this;

            var mainDataSet = _this.mainDataSet;

            if (mainDataSet) {
                _this.parsingData = false;
                var categoryAxesSettings = _this.categoryAxesSettings;
                // check if groupToPeriods have minPeriod, add if missing /*
                if (AmCharts.getItemIndex(categoryAxesSettings.minPeriod, categoryAxesSettings.groupToPeriods) == -1) {
                    categoryAxesSettings.groupToPeriods.unshift(categoryAxesSettings.minPeriod);
                }

                var mDataProvider = mainDataSet.dataProvider;
                if (AmCharts.ifArray(mDataProvider)) {
                    var categoryField = mainDataSet.categoryField;
                    _this.firstDate = _this.getFirstDate(mDataProvider[0][categoryField]);
                    _this.lastDate = _this.getLastDate(mDataProvider[mDataProvider.length - 1][categoryField]);

                    if (_this.periodSelector) {
                        _this.periodSelector.setRanges(_this.firstDate, _this.lastDate);
                    }

                    // process data
                    if (!mainDataSet.dataParsed) {
                        _this.parsingData = true;
                        if (_this.processTimeout > 0) {
                            setTimeout(function() {
                                _this.parseStockData.call(_this, mainDataSet, categoryAxesSettings.minPeriod, categoryAxesSettings.groupToPeriods, _this.firstDayOfWeek, _this.dataDateFormat);
                            }, _this.processTimeout);
                        } else {
                            _this.parseStockData(mainDataSet, categoryAxesSettings.minPeriod, categoryAxesSettings.groupToPeriods, _this.firstDayOfWeek, _this.dataDateFormat);
                        }

                    }
                    this.updateComparingData();

                } else {
                    _this.firstDate = undefined;
                    _this.lastDate = undefined;
                }

                _this.fixGlue();

                if (!_this.parsingData) {
                    _this.onDataUpdated();
                }
            }
        },

        fixGlue: function() {
            var _this = this;
            if (_this.glueToTheEnd && _this.startDate && _this.endDate && _this.lastDate) {
                _this.startDate = new Date((_this.startDate.getTime() + (_this.lastDate.getTime() - _this.endDate.getTime())) + 1);
                var minPeriod = _this.categoryAxesSettings.minPeriod;

                var periodObj = AmCharts.extractPeriod(minPeriod);
                var cleanPeriod = periodObj.period;
                var cleanPeriodCount = periodObj.count;

                _this.startDate = AmCharts.resetDateToMin(_this.startDate, cleanPeriod, cleanPeriodCount, _this.firstDayOfWeek);
                _this.endDate = _this.lastDate;
                _this.updateScrollbar = true;
            }
        },

        isDataParsed: function() {
            var _this = this;

            if (_this.mainDataSet) {
                var dataParsed = true;

                for (var i = 0; i < _this.comparedDataSets.length; i++) {
                    var dataSet = _this.comparedDataSets[i];
                    if (!dataSet.dataParsed) {
                        dataParsed = false;
                    }
                }

                if (_this.mainDataSet.dataParsed && dataParsed) {
                    return true;
                }
            }
            return false;
        },


        onDataUpdated: function() {
            var _this = this;
            if (_this.isDataParsed()) {

                _this.updatePanelsWithNewData();

                if (!_this.skipEvents) {
                    var event = {
                        type: "dataUpdated",
                        chart: _this
                    };
                    _this.fire(event);
                }
            }
        },


        updateComparingData: function() {
            var _this = this;
            var comparedDataSets = _this.comparedDataSets;
            var categoryAxesSettings = _this.categoryAxesSettings;
            var i;

            for (i = 0; i < comparedDataSets.length; i++) {
                var dataSet = comparedDataSets[i];

                if (!dataSet.dataParsed) {
                    _this.parsingData = true;
                    if (_this.processTimeout > 0) {
                        _this.delayedParseStockData(i, dataSet);
                    } else {
                        _this.parseStockData(dataSet, categoryAxesSettings.minPeriod, categoryAxesSettings.groupToPeriods, _this.firstDayOfWeek, _this.dataDateFormat);
                    }
                }
            }
        },

        delayedParseStockData: function(i, dataSet) {
            var _this = this;
            var categoryAxesSettings = _this.categoryAxesSettings;
            setTimeout(function() {
                _this.parseStockData.call(_this, dataSet, categoryAxesSettings.minPeriod, categoryAxesSettings.groupToPeriods, _this.firstDayOfWeek, _this.dataDateFormat);
            }, _this.processTimeout * i);
        },


        parseStockData: function(dataSet, minPeriod, periods, firstDayOfWeek, dataDateFormat) {
            var _this = this;
            var dataProviders = {};
            var dataProvider = dataSet.dataProvider;
            var categoryField = dataSet.categoryField;

            if (categoryField) {
                var startPeriod = AmCharts.getItemIndex(minPeriod, periods);
                var periodsCount = periods.length;
                var i;
                var n = dataProvider.length;
                var period;
                var nextTime = {};

                // create objects for all periods
                for (i = startPeriod; i < periodsCount; i++) {
                    period = periods[i];
                    dataProviders[period] = [];
                }

                var dataObjects = {};

                var fieldMappings = dataSet.fieldMappings;
                var fmCount = fieldMappings.length;

                for (i = 0; i < n; i++) {
                    var rawObject = dataProvider[i];
                    var rawDate = rawObject[categoryField];

                    var date = AmCharts.getDate(rawDate, dataDateFormat, minPeriod);
                    var time = date.getTime();

                    var values = {};
                    var f;

                    for (f = 0; f < fmCount; f++) {
                        var fromField = fieldMappings[f].fromField;
                        var toField = fieldMappings[f].toField;
                        values[toField] = rawObject[fromField];
                    }

                    var p;

                    for (p = startPeriod; p < periodsCount; p++) {
                        period = periods[p];

                        var periodObj = AmCharts.extractPeriod(period);
                        var cleanPeriod = periodObj.period;
                        var cleanPeriodCount = periodObj.count;
                        var name;
                        var dataObj;
                        var value;

                        // if the period changed
                        if (p == startPeriod || time >= nextTime[period] || !nextTime[period]) {
                            dataObjects[period] = {};

                            dataObjects[period].amCategoryIdField = String(AmCharts.resetDateToMin(date, cleanPeriod, cleanPeriodCount, firstDayOfWeek).getTime());
                            var f1;
                            for (f1 = 0; f1 < fmCount; f1++) {
                                var toField1 = fieldMappings[f1].toField;
                                dataObj = dataObjects[period];
                                name = toField1;
                                value = Number(values[name]);

                                // initial values
                                dataObj[name + "Count"] = 0;
                                //dataObj[name + "Sum"] = 0;

                                if (!isNaN(value)) {
                                    dataObj[name + "Open"] = value;
                                    dataObj[name + "Sum"] = value;
                                    dataObj[name + "High"] = value;
                                    dataObj[name + "AbsHigh"] = value;
                                    dataObj[name + "Low"] = value;
                                    dataObj[name + "Close"] = value;
                                    dataObj[name + "Count"] = 1;
                                    dataObj[name + "Average"] = value;
                                }
                            }
                            dataObj.dataContext = rawObject;
                            var ac = dataProviders[period];
                            ac.push(dataObjects[period]);

                            if (p > startPeriod) {
                                var nextDate = AmCharts.newDate(date, minPeriod);
                                // add one period
                                nextDate = AmCharts.changeDate(nextDate, cleanPeriod, cleanPeriodCount, true);
                                // reset to the beginning of this period
                                nextDate = AmCharts.resetDateToMin(nextDate, cleanPeriod, cleanPeriodCount, firstDayOfWeek);
                                // get time
                                nextTime[period] = nextDate.getTime();
                            }

                            // if this is first period, port all objects
                            if (p == startPeriod) {
                                var z;
                                for (z in rawObject) {
                                    if (rawObject.hasOwnProperty(z)) {
                                        dataObjects[period][z] = rawObject[z];
                                    }
                                }
                            }
                            dataObjects[period][categoryField] = AmCharts.newDate(date, minPeriod);

                        } else {
                            var f2;
                            for (f2 = 0; f2 < fmCount; f2++) {

                                name = fieldMappings[f2].toField;
                                dataObj = dataObjects[period];

                                if (i == n - 1) {
                                    dataObj[categoryField] = AmCharts.newDate(date, minPeriod);
                                }

                                value = Number(values[name]);

                                if (!isNaN(value)) {

                                    if (isNaN(dataObj[name + "Low"])) {
                                        dataObj[name + "Low"] = value;
                                    }

                                    if (value < dataObj[name + "Low"]) {
                                        dataObj[name + "Low"] = value;
                                    }

                                    if (isNaN(dataObj[name + "High"])) {
                                        dataObj[name + "High"] = value;
                                    }

                                    if (value > dataObj[name + "High"]) {
                                        dataObj[name + "High"] = value;
                                    }

                                    if (isNaN(dataObj[name + "AbsHigh"])) {
                                        dataObj[name + "AbsHigh"] = value;
                                    }

                                    if (Math.abs(value) > dataObj[name + "AbsHigh"]) {
                                        dataObj[name + "AbsHigh"] = value;
                                    }

                                    dataObj[name + "Close"] = value;
                                    var decCountSum = AmCharts.getDecimals(dataObj[name + "Sum"]);
                                    var decCountValue = AmCharts.getDecimals(value);
                                    if (isNaN(dataObj[name + "Sum"])) {
                                        dataObj[name + "Sum"] = 0;
                                    }
                                    dataObj[name + "Sum"] += value;
                                    dataObj[name + "Sum"] = AmCharts.roundTo(dataObj[name + "Sum"], Math.max(decCountSum, decCountValue));
                                    dataObj[name + "Count"]++;
                                    dataObj[name + "Average"] = dataObj[name + "Sum"] / dataObj[name + "Count"];
                                }
                            }
                        }
                    }
                }
            }

            dataSet.agregatedDataProviders = dataProviders;

            if (AmCharts.ifArray(dataSet.stockEvents)) {
                if (_this.processTimeout > 0) {
                    setTimeout(function() {
                        _this.parseEvents.call(_this, dataSet, _this.panels, _this.stockEventsSettings, _this.firstDayOfWeek, _this, _this.dataDateFormat);
                    }, _this.processTimeout);
                } else {
                    _this.parseEvents(dataSet, _this.panels, _this.stockEventsSettings, _this.firstDayOfWeek, _this, _this.dataDateFormat);
                }
            } else {
                dataSet.dataParsed = true;
                _this.onDataUpdated();
            }
        },


        parseEvents: function(dataSet, panels, stockEventsSettings, firstDayOfWeek, stockChart, dataDateFormat) {
            var _this = this;
            var events = dataSet.stockEvents;
            var dataProviders = dataSet.agregatedDataProviders;
            var k = panels.length;
            var j;
            var g;
            var h;
            var graph;
            var graphs;
            var panel;
            var customBulletFieldName;
            var customBulletConfigFieldName;
            var UNDEFINED;
            var e;
            var event;
            // set field names at first
            // every panel
            for (j = 0; j < k; j++) {
                panel = panels[j];
                graphs = panel.graphs;
                h = graphs.length;
                var eventGraph;

                // every graph
                for (g = 0; g < h; g++) {
                    graph = graphs[g];
                    graph.customBulletField = "amCustomBullet" + graph.id + "_" + panel.id;
                    graph.bulletConfigField = "amCustomBulletConfig" + graph.id + "_" + panel.id;
                    graph.chart = panel;
                }

                // find graphs of events
                for (e = 0; e < events.length; e++) {
                    event = events[e];
                    eventGraph = event.graph;

                    if (AmCharts.isString(eventGraph)) {
                        eventGraph = AmCharts.getObjById(graphs, eventGraph);
                        if (eventGraph) {
                            event.graph = eventGraph;
                        }
                    }
                    if (eventGraph) {
                        event.panel = eventGraph.chart;
                    }
                }
            }

            // every agregated data provider
            var l;
            for (l in dataProviders) {

                if (dataProviders.hasOwnProperty(l)) {
                    var dataProvider = dataProviders[l];

                    var period = l;
                    var periodObj = AmCharts.extractPeriod(period);
                    var m = dataProvider.length;

                    // every event
                    for (e = 0; e < events.length; e++) {
                        event = events[e];

                        var isDate = event.date instanceof Date;
                        if (dataDateFormat && !isDate) {
                            event.date = AmCharts.stringToDate(event.date, dataDateFormat);
                        }

                        var eventTime = event.date.getTime();

                        var dataItem = _this.getEventDataItem(eventTime, dataProvider, dataSet, 0, m, periodObj);

                        if (dataItem) {
                            graph = event.graph;
                            panel = event.panel;

                            customBulletFieldName = "amCustomBullet" + graph.id + "_" + panel.id;
                            customBulletConfigFieldName = "amCustomBulletConfig" + graph.id + "_" + panel.id;

                            if (graph) {
                                var bulletConfig;
                                if (dataItem[customBulletConfigFieldName]) {
                                    bulletConfig = dataItem[customBulletConfigFieldName];
                                } else {
                                    bulletConfig = {};
                                    bulletConfig.eventDispatcher = stockChart;
                                    bulletConfig.eventObjects = [];
                                    bulletConfig.letters = [];
                                    bulletConfig.descriptions = [];
                                    bulletConfig.shapes = [];
                                    bulletConfig.backgroundColors = [];
                                    bulletConfig.backgroundAlphas = [];
                                    bulletConfig.borderColors = [];
                                    bulletConfig.borderAlphas = [];
                                    bulletConfig.colors = [];
                                    bulletConfig.rollOverColors = [];
                                    bulletConfig.showOnAxis = [];
                                    bulletConfig.values = [];
                                    bulletConfig.showAts = [];
                                    bulletConfig.fontSizes = [];
                                    bulletConfig.showBullets = [];
                                    dataItem[customBulletFieldName] = AmCharts.StackedBullet;
                                    dataItem[customBulletConfigFieldName] = bulletConfig;
                                }

                                bulletConfig.eventObjects.push(event);
                                bulletConfig.letters.push(event.text);
                                bulletConfig.descriptions.push(event.description);

                                if (event.type) {
                                    bulletConfig.shapes.push(event.type);
                                } else {
                                    bulletConfig.shapes.push(stockEventsSettings.type);
                                }


                                if (event.backgroundColor !== UNDEFINED) {
                                    bulletConfig.backgroundColors.push(event.backgroundColor);
                                } else {
                                    bulletConfig.backgroundColors.push(stockEventsSettings.backgroundColor);
                                }


                                if (!isNaN(event.backgroundAlpha)) {
                                    bulletConfig.backgroundAlphas.push(event.backgroundAlpha);
                                } else {
                                    bulletConfig.backgroundAlphas.push(stockEventsSettings.backgroundAlpha);
                                }

                                if (!isNaN(event.borderAlpha)) {
                                    bulletConfig.borderAlphas.push(event.borderAlpha);
                                } else {
                                    bulletConfig.borderAlphas.push(stockEventsSettings.borderAlpha);
                                }

                                if (event.borderColor !== UNDEFINED) {
                                    bulletConfig.borderColors.push(event.borderColor);
                                } else {
                                    bulletConfig.borderColors.push(stockEventsSettings.borderColor);
                                }

                                if (event.rollOverColor !== UNDEFINED) {
                                    bulletConfig.rollOverColors.push(event.rollOverColor);
                                } else {
                                    bulletConfig.rollOverColors.push(stockEventsSettings.rollOverColor);
                                }

                                if (event.showAt !== UNDEFINED) {
                                    bulletConfig.showAts.push(event.showAt);
                                } else {
                                    bulletConfig.showAts.push(stockEventsSettings.showAt);
                                }

                                if (event.fontSize !== UNDEFINED) {
                                    bulletConfig.fontSizes.push(event.fontSize);
                                }

                                bulletConfig.colors.push(event.color);

                                bulletConfig.values.push(event.value);
                                bulletConfig.showOnAxis.push(event.showOnAxis);
                                bulletConfig.showBullets.push(event.showBullet);
                                bulletConfig.date = new Date(event.date);
                            }
                        }
                    }
                }
            }

            dataSet.dataParsed = true;
            _this.onDataUpdated();
        },

        getEventDataItem: function(eventTime, dataProvider, dataSet, start, end, periodObj) {

            var _this = this;
            var cleanPeriod = periodObj.period;
            var cleanPeriodCount = periodObj.count;

            var middle = Math.floor(start + (end - start) / 2);

            var dataItem = dataProvider[middle];

            var date = dataItem[dataSet.categoryField];

            var dataDateFormat = _this.dataDateFormat;

            var isDate = date instanceof Date;

            if (dataDateFormat && !isDate) {
                date = AmCharts.stringToDate(date, dataDateFormat);
            }

            var startTime = date.getTime();
            var endTime;

            if (cleanPeriod == "YYYY") {
                startTime = AmCharts.resetDateToMin(new Date(date), cleanPeriod, cleanPeriodCount, _this.firstDayOfWeek).getTime();
            }

            if (cleanPeriod == "fff") {
                endTime = date.getTime() + 1;
            } else {
                endTime = AmCharts.resetDateToMin(AmCharts.changeDate(new Date(date), periodObj.period, periodObj.count), cleanPeriod, cleanPeriodCount, _this.firstDayOfWeek).getTime();
            }

            if (eventTime >= startTime && eventTime < endTime) {
                return dataItem;
            }

            if (end - start <= 1) {
                return;
            }

            if (eventTime < startTime) {
                return _this.getEventDataItem(eventTime, dataProvider, dataSet, start, middle, periodObj);
            } else {
                return _this.getEventDataItem(eventTime, dataProvider, dataSet, middle, end, periodObj);
            }
        },


        createLayout: function() {
            var _this = this;
            var div = _this.div;
            var psPosition;
            var dsPosition;
            var classNamePrefix = _this.classNamePrefix;

            var container = document.createElement("div");
            container.style.position = "relative";
            _this.containerDiv = container;
            container.className = classNamePrefix + "-stock-div";
            div.appendChild(container);

            var periodSelector = _this.periodSelector;
            if (periodSelector) {
                psPosition = periodSelector.position;
            }

            var dataSetSelector = _this.dataSetSelector;
            if (dataSetSelector) {
                dsPosition = dataSetSelector.position;
            }

            if (psPosition == "left" || dsPosition == "left") {
                var leftContainer = document.createElement("div");
                leftContainer.className = classNamePrefix + "-left-div";
                leftContainer.style.cssFloat = "left";
                leftContainer.style.styleFloat = "left";
                leftContainer.style.width = "0px";
                leftContainer.style.position = "absolute";
                container.appendChild(leftContainer);
                _this.leftContainer = leftContainer;
            }
            if (psPosition == "right" || dsPosition == "right") {
                var rightContainer = document.createElement("div");
                rightContainer.className = classNamePrefix + "-right-div";
                rightContainer.style.cssFloat = "right";
                rightContainer.style.styleFloat = "right";
                rightContainer.style.width = "0px";
                container.appendChild(rightContainer);
                _this.rightContainer = rightContainer;
            }

            var centerContainer = document.createElement("div");
            centerContainer.className = classNamePrefix + "-center-div";
            container.appendChild(centerContainer);
            _this.centerContainer = centerContainer;

            var panelsContainer = document.createElement("div");
            panelsContainer.className = classNamePrefix + "-panels-div";
            centerContainer.appendChild(panelsContainer);
            _this.panelsContainer = panelsContainer;
        },



        addPanels: function() {
            var _this = this;
            _this.measurePanels(true);
            var panels = _this.panels;

            for (var i = 0; i < panels.length; i++) {
                var panel = panels[i];
                panel = AmCharts.processObject(panel, AmCharts.StockPanel, _this.theme, true);
                panels[i] = panel;

                _this.addStockPanel(panel, i);
            }
            _this.panelsAdded = true;
        },

        measurePanels: function(skipEvent) {

            var _this = this;

            _this.measure();

            var chartScrollbarSettings = _this.chartScrollbarSettings;

            var panelsHeight = _this.divRealHeight;
            var panelsWidth = _this.divRealWidth;

            if (_this.div) {
                var panelSpacing = _this.panelsSettings.panelSpacing;

                if (chartScrollbarSettings.enabled) {
                    panelsHeight -= chartScrollbarSettings.height;
                }

                var divHeight;
                var periodSelector = _this.periodSelector;
                if (periodSelector) {
                    if (!periodSelector.vertical) {
                        divHeight = periodSelector.offsetHeight;
                        panelsHeight -= divHeight + panelSpacing;
                    }
                }

                var dataSetSelector = _this.dataSetSelector;
                if (dataSetSelector) {
                    if (!dataSetSelector.vertical) {
                        divHeight = dataSetSelector.offsetHeight;
                        panelsHeight -= divHeight + panelSpacing;
                    }
                }

                if (!skipEvent) {
                    if (panelsHeight != _this.prevPH || _this.prevPW != panelsWidth) {
                        var type = "resized";
                        _this.fire({
                            type: type,
                            chart: _this
                        });
                    }
                }

                if (_this.prevPW != panelsWidth) {
                    _this.prevPW = panelsWidth;
                }

                if (panelsHeight != _this.prevPH) {
                    var panels = _this.panels;
                    if (panelsHeight > 0) {
                        _this.panelsContainer.style.height = panelsHeight + "px";
                    }

                    var totalPercents = 0;
                    var i;
                    var panel;
                    for (i = 0; i < panels.length; i++) {
                        panel = panels[i];
                        if (panel) {
                            var percentHeight = panel.percentHeight;

                            if (isNaN(percentHeight)) {
                                percentHeight = 100 / panels.length;
                                panel.percentHeight = percentHeight;
                            }
                            totalPercents += percentHeight;
                        }
                    }

                    _this.panelsHeight = Math.max(panelsHeight - panelSpacing * (panels.length - 1), 0);

                    for (i = 0; i < panels.length; i++) {
                        panel = panels[i];
                        if (panel) {
                            panel.percentHeight = panel.percentHeight / totalPercents * 100;
                            if (panel.panelBox) {
                                panel.panelBox.style.height = Math.round((panel.percentHeight * _this.panelsHeight / 100)) + "px";
                            }
                        }
                    }
                    _this.prevPH = panelsHeight;
                }
            }
        },


        addStockPanel: function(panel, index) {
            var _this = this;
            var panelsSettings = _this.panelsSettings;

            var panelBox = document.createElement("div");

            if (index > 0) {
                if (!_this.panels[index - 1].showCategoryAxis) {
                    panelBox.style.marginTop = panelsSettings.panelSpacing + "px";
                }
            }
            panel.hideBalloonReal();
            panel.panelBox = panelBox;
            panel.stockChart = this;

            if (!panel.id) {
                panel.id = "stockPanel" + index;
            }
            panelBox.className = "amChartsPanel " + _this.classNamePrefix + "-stock-panel-div " + _this.classNamePrefix + "-stock-panel-div-" + panel.id;

            panel.pathToImages = _this.pathToImages;
            panel.path = _this.path;

            panelBox.style.height = Math.round((panel.percentHeight * _this.panelsHeight / 100)) + "px";
            panelBox.style.width = "100%";

            _this.panelsContainer.appendChild(panelBox);

            if (panelsSettings.backgroundAlpha > 0) {
                panelBox.style.backgroundColor = panelsSettings.backgroundColor;
            }

            var legend = panel.stockLegend;
            if (legend) {
                legend = AmCharts.processObject(legend, AmCharts.StockLegend, _this.theme);
                legend.container = undefined;
                legend.title = panel.title;
                legend.marginLeft = panelsSettings.marginLeft;
                legend.marginRight = panelsSettings.marginRight;
                legend.verticalGap = 3;
                legend.position = "top";
                AmCharts.copyProperties(_this.legendSettings, legend);
                panel.addLegend(legend, legend.divId);
            }

            panel.zoomOutText = "";

            //panel.removeChartCursor();
            this.addCursor(panel);
        },

        enableCursors: function(value) {
            var chartCursors = this.chartCursors;
            var i;
            for (i = 0; i < chartCursors.length; i++) {
                var chartCursor = chartCursors[i];
                chartCursor.enabled = value;
            }
        },


        updatePanels: function() {
            var _this = this;
            var panels = _this.panels;
            var i;
            for (i = 0; i < panels.length; i++) {
                var panel = panels[i];
                _this.updatePanel(panel);
            }

            if (_this.mainDataSet) {
                _this.updateGraphs();
            }

            _this.currentPeriod = undefined;
        },


        updatePanel: function(panel) {
            var _this = this;
            panel.seriesIdField = "amCategoryIdField";
            panel.dataProvider = [];
            panel.chartData = [];
            panel.graphs = [];

            var categoryAxis = panel.categoryAxis;
            var categoryAxesSettings = _this.categoryAxesSettings;

            AmCharts.copyProperties(_this.panelsSettings, panel);
            AmCharts.copyProperties(categoryAxesSettings, categoryAxis);
            //panel.processTimeout = 0;
            categoryAxis.parseDates = true;
            panel.addClassNames = _this.addClassNames;
            panel.classNamePrefix = _this.classNamePrefix;

            panel.zoomOutOnDataUpdate = false;
            panel.mouseWheelScrollEnabled = _this.mouseWheelScrollEnabled;
            panel.dataDateFormat = _this.dataDateFormat;
            panel.language = _this.language;

            if (panel.showCategoryAxis) {
                if (categoryAxis.position == "top") {
                    panel.marginTop = categoryAxesSettings.axisHeight;
                } else {
                    panel.marginBottom = categoryAxesSettings.axisHeight;
                }
            } else {
                panel.categoryAxis.labelsEnabled = false;

                if (panel.chartCursor) {
                    panel.chartCursor.categoryBalloonEnabled = false;
                }
            }

            var j;
            var valueAxes = panel.valueAxes;
            var k = valueAxes.length;
            var valueAxis;

            if (k === 0) {
                valueAxis = new AmCharts.ValueAxis(_this.theme);
                panel.addValueAxis(valueAxis);
            }

            var balloon = new AmCharts.AmBalloon(_this.theme);
            AmCharts.copyProperties(_this.balloon, balloon);
            panel.balloon = balloon;

            valueAxes = panel.valueAxes;
            k = valueAxes.length;

            for (j = 0; j < k; j++) {
                valueAxis = valueAxes[j];
                AmCharts.copyProperties(_this.valueAxesSettings, valueAxis);
            }
            panel.listenersAdded = false;
            panel.write(panel.panelBox);
        },

        zoom: function(startDate, endDate) {
            this.zoomChart(startDate, endDate);
        },

        zoomOut: function() {
            var _this = this;
            _this.zoomChart(_this.firstDate, _this.lastDate);
        },


        updatePanelsWithNewData: function() {
            var _this = this;
            var mainDataSet = _this.mainDataSet;
            var scrollbarChart = _this.scrollbarChart;
            _this.updateGraphs();
            if (mainDataSet) {
                var panels = _this.panels;
                _this.currentPeriod = undefined;
                var i;
                for (i = 0; i < panels.length; i++) {
                    var panel = panels[i];
                    panel.categoryField = mainDataSet.categoryField;

                    if (mainDataSet.dataProvider.length === 0) {
                        panel.dataProvider = [];
                    }

                    panel.scrollbarChart = scrollbarChart;
                }


                if (scrollbarChart) {
                    var categoryAxesSettings = _this.categoryAxesSettings;
                    var minPeriod = categoryAxesSettings.minPeriod;

                    scrollbarChart.categoryField = mainDataSet.categoryField;

                    var oldSBDP = scrollbarChart.dataProvider;

                    if (mainDataSet.dataProvider.length > 0) {
                        var usePeriod = _this.chartScrollbarSettings.usePeriod;
                        if (usePeriod) {
                            scrollbarChart.dataProvider = mainDataSet.agregatedDataProviders[usePeriod];
                        } else {
                            scrollbarChart.dataProvider = mainDataSet.agregatedDataProviders[minPeriod];
                        }
                    } else {
                        scrollbarChart.dataProvider = [];
                    }

                    var sbCategoryAxis = scrollbarChart.categoryAxis;
                    sbCategoryAxis.minPeriod = minPeriod;
                    sbCategoryAxis.firstDayOfWeek = _this.firstDayOfWeek;
                    sbCategoryAxis.equalSpacing = categoryAxesSettings.equalSpacing;
                    sbCategoryAxis.axisAlpha = 0;
                    sbCategoryAxis.markPeriodChange = categoryAxesSettings.markPeriodChange;
                    scrollbarChart.bbsetr = true;
                    if (oldSBDP != scrollbarChart.dataProvider) {
                        scrollbarChart.validateData();
                    }

                    var panelsSettings = _this.panelsSettings;
                    scrollbarChart.maxSelectedTime = panelsSettings.maxSelectedTime;
                    scrollbarChart.minSelectedTime = panelsSettings.minSelectedTime;
                }

                if (mainDataSet.dataProvider.length > 0) {
                    _this.fixGlue();
                    _this.zoomChart(_this.startDate, _this.endDate);
                }
            }
            _this.panelDataInvalidated = false;
            mainDataSet = null;
        },


        addChartScrollbar: function() {
            var _this = this;
            var chartScrollbarSettings = _this.chartScrollbarSettings;

            var scrollbarChart = _this.scrollbarChart;
            if (scrollbarChart) {
                scrollbarChart.clear();
                scrollbarChart.destroy();
            }

            if (chartScrollbarSettings.enabled) {
                var panelsSettings = _this.panelsSettings;
                var categoryAxesSettings = _this.categoryAxesSettings;

                scrollbarChart = new AmCharts.AmSerialChart(_this.theme);
                scrollbarChart.svgIcons = panelsSettings.svgIcons;
                scrollbarChart.language = _this.language;
                scrollbarChart.pathToImages = _this.pathToImages;
                scrollbarChart.autoMargins = false;
                _this.scrollbarChart = scrollbarChart;
                scrollbarChart.id = "scrollbarChart";
                scrollbarChart.scrollbarOnly = true;
                scrollbarChart.zoomOutText = "";
                if (panelsSettings.fontFamily) {
                    scrollbarChart.fontFamily = panelsSettings.fontFamily;
                }
                if (!isNaN(panelsSettings.fontSize)) {
                    scrollbarChart.fontSize = panelsSettings.fontSize;
                }
                //scrollbarChart.panEventsEnabled = _this.panelsSettings.panEventsEnabled;

                scrollbarChart.marginLeft = panelsSettings.marginLeft;
                scrollbarChart.marginRight = panelsSettings.marginRight;
                scrollbarChart.marginTop = 0;
                scrollbarChart.marginBottom = 0;

                var dateFormats = categoryAxesSettings.dateFormats;
                var categoryAxis = scrollbarChart.categoryAxis;
                categoryAxis.boldPeriodBeginning = categoryAxesSettings.boldPeriodBeginning;

                if (dateFormats) {
                    categoryAxis.dateFormats = categoryAxesSettings.dateFormats;
                }

                categoryAxis.labelsEnabled = false;
                categoryAxis.parseDates = true;

                var scrollbarGraph = chartScrollbarSettings.graph;

                if (AmCharts.isString(scrollbarGraph)) {
                    var panels = _this.panels;

                    for (var i = 0; i < panels.length; i++) {
                        var panel = panels[i];
                        var graphById = AmCharts.getObjById(panel.stockGraphs, chartScrollbarSettings.graph);

                        if (graphById) {
                            scrollbarGraph = graphById;
                        }
                    }
                    chartScrollbarSettings.graph = scrollbarGraph;
                }

                var graph;
                if (scrollbarGraph) {
                    graph = new AmCharts.AmGraph(_this.theme);
                    graph.valueField = scrollbarGraph.valueField;
                    graph.periodValue = scrollbarGraph.periodValue;
                    graph.type = scrollbarGraph.type;
                    graph.connect = scrollbarGraph.connect;
                    graph.minDistance = chartScrollbarSettings.minDistance;
                    scrollbarChart.addGraph(graph);
                }


                var chartScrollbar = new AmCharts.ChartScrollbar(_this.theme);
                scrollbarChart.addChartScrollbar(chartScrollbar);
                AmCharts.copyProperties(chartScrollbarSettings, chartScrollbar);
                chartScrollbar.scrollbarHeight = chartScrollbarSettings.height;
                chartScrollbar.graph = graph;

                _this.listenTo(chartScrollbar, "zoomed", _this.handleScrollbarZoom);

                var sbBox = document.createElement("div");
                sbBox.className = _this.classNamePrefix + "-scrollbar-chart-div";
                sbBox.style.height = chartScrollbarSettings.height + "px";

                var periodSelectorContainer = _this.periodSelectorContainer;

                var periodSelector = _this.periodSelector;
                var centerContainer = _this.centerContainer;

                if (chartScrollbarSettings.position == "bottom") {
                    if (periodSelector) {
                        if (periodSelector.position == "bottom") {
                            centerContainer.insertBefore(sbBox, periodSelectorContainer);
                        } else {
                            centerContainer.appendChild(sbBox);
                        }
                    } else {
                        centerContainer.appendChild(sbBox);
                    }
                } else {
                    if (periodSelector) {
                        if (periodSelector.position == "top") {
                            centerContainer.insertBefore(sbBox, periodSelectorContainer.nextSibling);
                        } else {
                            centerContainer.insertBefore(sbBox, centerContainer.firstChild);
                        }
                    } else {
                        centerContainer.insertBefore(sbBox, centerContainer.firstChild);
                    }

                }

                scrollbarChart.write(sbBox);
            }
        },


        handleScrollbarZoom: function(event) {
            var _this = this;

            if (!_this.skipScrollbarEvent) {
                var startDate = event.startDate;
                var endDate = event.endDate;

                var stockEvent = {};
                stockEvent.startDate = startDate;
                stockEvent.endDate = endDate;

                _this.updateScrollbar = false;
                _this.handleZoom(stockEvent);
            } else {
                _this.skipScrollbarEvent = false;
            }
        },

        addPeriodSelector: function() {
            var _this = this;
            var periodSelector = _this.periodSelector;

            if (periodSelector) {
                var minPeriod = _this.categoryAxesSettings.minPeriod;

                periodSelector.minDuration = AmCharts.getPeriodDuration(minPeriod);
                periodSelector.minPeriod = minPeriod;
                periodSelector.chart = this;
                var dataSetSelector = _this.dataSetSelector;
                var dataSetSelectorPosition;
                var dataSetContainer = _this.dssContainer;
                if (dataSetSelector) {
                    dataSetSelectorPosition = dataSetSelector.position;
                }
                var px = "px";
                var panelSpacing = _this.panelsSettings.panelSpacing;
                var periodSelectorContainer = document.createElement("div");
                _this.periodSelectorContainer = periodSelectorContainer;

                var periodSelectorPosition = periodSelector.position;
                var leftContainer = _this.leftContainer;
                var rightContainer = _this.rightContainer;
                var centerContainer = _this.centerContainer;
                var panelsContainer = _this.panelsContainer;
                var sideWidth = (periodSelector.width + panelSpacing * 2) + px;

                switch (periodSelectorPosition) {
                    case "left":
                        leftContainer.style.width = (periodSelector.width) + px;
                        leftContainer.appendChild(periodSelectorContainer);
                        centerContainer.style.paddingLeft = sideWidth;
                        break;
                    case "right":
                        centerContainer.style.marginRight = sideWidth;
                        rightContainer.appendChild(periodSelectorContainer);
                        rightContainer.style.width = periodSelector.width + px;
                        break;
                    case "top":
                        panelsContainer.style.clear = "both";
                        centerContainer.insertBefore(periodSelectorContainer, panelsContainer);
                        periodSelectorContainer.style.paddingBottom = panelSpacing + "px";
                        periodSelectorContainer.style.overflow = "hidden";
                        break;

                    case "bottom":
                        periodSelectorContainer.style.marginTop = panelSpacing + "px";

                        if (dataSetSelectorPosition == "bottom") {
                            centerContainer.insertBefore(periodSelectorContainer, dataSetContainer);
                        } else {
                            centerContainer.appendChild(periodSelectorContainer);
                        }
                        break;
                }

                _this.listenTo(periodSelector, "changed", _this.handlePeriodSelectorZoom);
                periodSelector.write(periodSelectorContainer);
            }
        },


        addDataSetSelector: function() {
            var _this = this;
            var dataSetSelector = _this.dataSetSelector;
            if (dataSetSelector) {

                dataSetSelector.chart = this;
                dataSetSelector.dataProvider = _this.dataSets;

                var dataSetSelectorPosition = dataSetSelector.position;

                var px = "px";
                var panelSpacing = _this.panelsSettings.panelSpacing;
                var dataSetSelectorContainer = document.createElement("div");
                _this.dssContainer = dataSetSelectorContainer;

                var leftContainer = _this.leftContainer;
                var rightContainer = _this.rightContainer;
                var centerContainer = _this.centerContainer;
                var panelsContainer = _this.panelsContainer;
                var sideWidth = (dataSetSelector.width + panelSpacing * 2) + px;

                switch (dataSetSelectorPosition) {
                    case "left":
                        leftContainer.style.width = dataSetSelector.width + px;
                        leftContainer.appendChild(dataSetSelectorContainer);
                        centerContainer.style.paddingLeft = sideWidth;
                        break;
                    case "right":
                        centerContainer.style.marginRight = sideWidth;
                        rightContainer.appendChild(dataSetSelectorContainer);
                        rightContainer.style.width = dataSetSelector.width + px;
                        break;
                    case "top":
                        panelsContainer.style.clear = "both";
                        centerContainer.insertBefore(dataSetSelectorContainer, panelsContainer);
                        dataSetSelectorContainer.style.overflow = "hidden";
                        break;
                    case "bottom":
                        centerContainer.appendChild(dataSetSelectorContainer);
                        break;
                }
                dataSetSelector.write(dataSetSelectorContainer);
            }
        },

        handlePeriodSelectorZoom: function(event) {
            var _this = this;

            var scrollbarChart = _this.scrollbarChart;
            if (scrollbarChart) {
                scrollbarChart.updateScrollbar = true;
            }
            if (event.predefinedPeriod) {
                _this.predefinedStart = event.startDate;
                _this.predefinedEnd = event.endDate;
            } else {
                _this.predefinedStart = null;
                _this.predefinedEnd = null;
            }
            _this.zoomOutValueAxes();
            _this.zoomChart(event.startDate, event.endDate);
        },

        zoomOutValueAxes: function() {
            var _this = this;
            var panels = _this.panels;
            if (_this.panelsSettings.zoomOutAxes) {
                for (var i = 0; i < panels.length; i++) {
                    var serialChart = panels[i];
                    var valueAxes = serialChart.valueAxes;
                    if (valueAxes) {
                        for (var v = 0; v < valueAxes.length; v++) {
                            var valueAxis = valueAxes[v];
                            valueAxis.minZoom = NaN;
                            valueAxis.maxZoom = NaN;
                        }
                    }
                }
            }
        },

        addCursor: function(panel) {
            var _this = this;

            var chartCursorSettings = _this.chartCursorSettings;

            if (chartCursorSettings.enabled) {
                var chartCursor = new AmCharts.ChartCursor(_this.theme);
                AmCharts.copyProperties(chartCursorSettings, chartCursor);
                var categoryBalloonFunction = chartCursorSettings.categoryBalloonFunction;
                if (panel.chartCursor) {
                    AmCharts.copyProperties(panel.chartCursor, chartCursor);
                    if (panel.chartCursor.categoryBalloonFunction) {
                        categoryBalloonFunction = panel.chartCursor.categoryBalloonFunction;
                    }
                }

                chartCursor.categoryBalloonFunction = categoryBalloonFunction;

                panel.removeChartCursor();
                panel.addChartCursor(chartCursor);

                if (chartCursorSettings.cursorPosition == "mouse") {
                    _this.listenTo(chartCursor, "moved", _this.handleCursorChange);
                } else {
                    _this.listenTo(chartCursor, "changed", _this.handleCursorChange);
                }

                _this.listenTo(chartCursor, "onHideCursor", _this.handleCursorChange);
                _this.listenTo(chartCursor, "zoomStarted", _this.handleCursorChange);
                _this.listenTo(chartCursor, "zoomed", _this.handleCursorZoom);

                _this.chartCursors.push(chartCursor);
            }
        },

        handleCursorChange: function(event) {
            var _this = this;
            var cursor = event.target;

            var chartCursors = _this.chartCursors;
            var i;

            for (i = 0; i < chartCursors.length; i++) {
                var chartCursor = chartCursors[i];
                if (chartCursor != cursor) {
                    chartCursor.syncWithCursor(cursor, _this.chartCursorSettings.onePanelOnly);
                }
            }
        },


        handleCursorZoom: function(event) {
            var _this = this;

            var scrollbarChart = _this.scrollbarChart;
            if (scrollbarChart) {
                scrollbarChart.updateScrollbar = true;
            }

            var stockEvent = {};
            var startDate;
            var endDate;

            if (_this.categoryAxesSettings.equalSpacing) {
                var categoryField = _this.mainDataSet.categoryField;
                var currentDataProvider = _this.mainDataSet.agregatedDataProviders[_this.currentPeriod];
                startDate = new Date(currentDataProvider[event.start][categoryField]);
                endDate = new Date(currentDataProvider[event.end][categoryField]);
            } else {
                startDate = new Date(event.start);
                endDate = new Date(event.end);
            }

            stockEvent.startDate = startDate;
            stockEvent.endDate = endDate;
            _this.handleZoom(stockEvent);
            _this.handleCursorChange(event);
        },

        handleZoom: function(event) {
            var startDate = event.startDate;
            var endDate = event.endDate;
            this.zoomChart(startDate, endDate);
        },


        zoomChart: function(startDate, endDate) {
            var _this = this;
            if (!startDate) {
                startDate = _this.firstDate;
            }
            var originalStartDate = AmCharts.newDate(startDate);

            var firstDate = _this.firstDate;
            var lastDate = _this.lastDate;
            var currentPeriod = _this.currentPeriod;
            var categoryAxesSettings = _this.categoryAxesSettings;
            var minPeriod = categoryAxesSettings.minPeriod;
            var panelsSettings = _this.panelsSettings;
            var periodSelector = _this.periodSelector;
            var panels = _this.panels;
            var comparedGraphs = _this.comparedGraphs;
            var scrollbarChart = _this.scrollbarChart;
            var firstDayOfWeek = _this.firstDayOfWeek;

            if (firstDate && lastDate) {
                if (!startDate) {
                    startDate = firstDate;
                }

                if (!endDate) {
                    endDate = lastDate;
                }

                if (currentPeriod) {
                    var currentPObj = AmCharts.extractPeriod(currentPeriod);

                    if (startDate.getTime() == endDate.getTime() && currentPObj != minPeriod) {
                        endDate = AmCharts.changeDate(endDate, currentPObj.period, currentPObj.count);
                        endDate.setTime(endDate.getTime() - 1);
                    }
                }

                if (startDate.getTime() < firstDate.getTime()) {
                    startDate = firstDate;
                }

                if (startDate.getTime() > lastDate.getTime()) {
                    startDate = lastDate;
                }

                if (endDate.getTime() < firstDate.getTime()) {
                    endDate = firstDate;
                }

                if (endDate.getTime() > lastDate.getTime()) {
                    endDate = lastDate;
                }

                var minPeriodIndex = AmCharts.getItemIndex(minPeriod, categoryAxesSettings.groupToPeriods);

                var previousPeriod = currentPeriod;

                currentPeriod = _this.choosePeriod(minPeriodIndex, startDate, endDate);
                _this.currentPeriod = currentPeriod;

                var currentPeriodObj = AmCharts.extractPeriod(currentPeriod);
                var currentPeriodDuration = AmCharts.getPeriodDuration(currentPeriodObj.period, currentPeriodObj.count);

                if (endDate.getTime() - startDate.getTime() < 1) {
                    startDate = new Date(endDate.getTime() - 1);
                }

                // fix panel start date
                var panelStartDate = AmCharts.newDate(startDate); // was new Date in 3.17.0

                // 3.4.9 back extending, and made this optional
                if (_this.extendToFullPeriod) {
                    if (panelStartDate.getTime() - firstDate.getTime() < currentPeriodDuration * 0.1) {
                        panelStartDate = AmCharts.resetDateToMin(startDate, currentPeriodObj.period, currentPeriodObj.count, firstDayOfWeek);
                    }
                    if (lastDate.getTime() - endDate.getTime() < currentPeriodDuration * 0.1) {
                        endDate = AmCharts.resetDateToMin(lastDate, currentPeriodObj.period, currentPeriodObj.count, firstDayOfWeek);
                        endDate = AmCharts.changeDate(endDate, currentPeriodObj.period, currentPeriodObj.count, true);
                    }
                }

                var i;
                var serialChart;
                for (i = 0; i < panels.length; i++) {
                    serialChart = panels[i];
                    if (serialChart.chartCursor) {
                        if (serialChart.chartCursor.panning) {
                            panelStartDate = originalStartDate;
                        }
                    }
                }

                for (i = 0; i < panels.length; i++) {
                    serialChart = panels[i];
                    var skipZoom = false;
                    if (currentPeriod != previousPeriod) {
                        var j;
                        for (j = 0; j < comparedGraphs.length; j++) {
                            var comparedGraph = comparedGraphs[j].graph;
                            var dataSet = comparedGraph.dataSet;
                            comparedGraph.dataProvider = dataSet.agregatedDataProviders[currentPeriod];
                        }

                        var categoryAxis = serialChart.categoryAxis;
                        categoryAxis.firstDayOfWeek = firstDayOfWeek;
                        categoryAxis.minPeriod = currentPeriod;
                        serialChart.dataProvider = _this.mainDataSet.agregatedDataProviders[currentPeriod];

                        var chartCursor = serialChart.chartCursor;
                        if (chartCursor) {
                            chartCursor.categoryBalloonDateFormat = _this.chartCursorSettings.categoryBalloonDateFormat(currentPeriodObj.period);
                            if (!serialChart.showCategoryAxis) {
                                chartCursor.categoryBalloonEnabled = false;
                            }
                        }

                        serialChart.startTime = panelStartDate.getTime();
                        serialChart.endTime = endDate.getTime();
                        serialChart.start = NaN;
                        serialChart.validateData(true);
                        if (!categoryAxesSettings.equalSpacing) {
                            skipZoom = true;
                        }
                    }

                    if (serialChart.chartCursor) {
                        if (serialChart.chartCursor.panning) {
                            skipZoom = true;
                        }
                    }
                    if (!skipZoom) {
                        serialChart.startTime = undefined;
                        serialChart.endTime = undefined;
                        serialChart.zoomToDates(panelStartDate, endDate);
                    }

                    if (panelsSettings.startDuration > 0 && _this.animationPlayed && !skipZoom) {
                        serialChart.startDuration = 0;
                        serialChart.animateAgain();
                    } else if (panelsSettings.startDuration > 0 && !skipZoom) {
                        serialChart.animateAgain();
                    }
                }
                _this.animationPlayed = true;

                var scrollbarsEndDate = AmCharts.newDate(endDate);
                //var scrollbarsEndDate = AmCharts.changeDate(new Date(endDate), cleanPeriod, cleanPeriodCount);
                if (scrollbarChart && _this.updateScrollbar) {
                    scrollbarChart.zoomToDates(startDate, scrollbarsEndDate);
                    _this.skipScrollbarEvent = true;
                    setTimeout(function() {
                        _this.resetSkip.call(_this);
                    }, 100);
                }
                _this.updateScrollbar = true;

                _this.startDate = startDate;
                _this.endDate = endDate;

                if (periodSelector) {
                    periodSelector.zoom(startDate, endDate);
                }

                if (!_this.skipEvents) {
                    if (startDate.getTime() != _this.previousStartDate.getTime() || endDate.getTime() != _this.previousEndDate.getTime()) {
                        var zoomedEvent = {
                            type: "zoomed"
                        };
                        zoomedEvent.startDate = startDate;
                        zoomedEvent.endDate = endDate;
                        zoomedEvent.chart = _this;
                        zoomedEvent.period = currentPeriod;

                        _this.fire(zoomedEvent);

                        _this.previousStartDate = AmCharts.newDate(startDate);
                        _this.previousEndDate = AmCharts.newDate(endDate);
                    }
                }
            }

            if (_this.eventsHidden) {
                _this.showHideEvents(false);
            }

            _this.dispDUpd();
        },

        dispDUpd: function() {
            var _this = this;
            if (!_this.skipEvents) {
                var type;
                if (!_this.chartCreated) {
                    type = "init";
                    _this.fire({
                        type: type,
                        chart: _this
                    });
                }

                if (!_this.chartRendered) {
                    type = "rendered";
                    _this.fire({
                        type: type,
                        chart: _this
                    });
                    _this.chartRendered = true;
                }

                type = "drawn";
                _this.fire({
                    type: type,
                    chart: _this
                });
            }

            _this.chartCreated = true;
            _this.animationPlayed = true;
        },

        resetSkip: function() {
            this.skipScrollbarEvent = false;
        },

        updateGraphs: function() {
            var _this = this;

            _this.getSelections();

            if (_this.dataSets.length > 0) {
                var panels = _this.panels;
                _this.comparedGraphs = [];
                var i;
                for (i = 0; i < panels.length; i++) {
                    var panel = panels[i];

                    var valueAxes = panel.valueAxes;
                    var h;
                    for (h = 0; h < valueAxes.length; h++) {

                        var valueAxis = valueAxes[h];

                        if (valueAxis.prevLog) {
                            valueAxis.logarithmic = valueAxis.prevLog;
                        }
                        if (panel.recalculateToPercents == "always") {
                            valueAxis.recalculateToPercents = true;
                        } else {
                            valueAxis.recalculateToPercents = false;
                        }
                    }


                    var mainDataSet = _this.mainDataSet;
                    var comparedDataSets = _this.comparedDataSets;
                    // graphs
                    var stockGraphs = panel.stockGraphs;

                    panel.graphs = [];
                    var j;
                    var f;
                    var fm;

                    for (j = 0; j < stockGraphs.length; j++) {
                        var stockGraph = stockGraphs[j];

                        stockGraph = AmCharts.processObject(stockGraph, AmCharts.StockGraph, _this.theme);
                        stockGraphs[j] = stockGraph;

                        if (!stockGraph.title || stockGraph.resetTitleOnDataSetChange) {
                            stockGraph.title = mainDataSet.title;
                            stockGraph.resetTitleOnDataSetChange = true;
                        }

                        if (stockGraph.useDataSetColors) {
                            stockGraph.lineColor = mainDataSet.color;
                            stockGraph.fillColors = undefined;
                            stockGraph.bulletColor = undefined;
                        }

                        // check if field is available
                        var hasField = false;
                        var fieldMappings = mainDataSet.fieldMappings;

                        for (f = 0; f < fieldMappings.length; f++) {
                            fm = fieldMappings[f];
                            var vField = stockGraph.valueField;
                            if (vField) {
                                if (fm.toField == vField) {
                                    hasField = true;
                                }
                            }
                            var oField = stockGraph.openField;
                            if (oField) {
                                if (fm.toField == oField) {
                                    hasField = true;
                                }
                            }
                            var cField = stockGraph.closeField;
                            if (cField) {
                                if (fm.toField == cField) {
                                    hasField = true;
                                }
                            }
                            var lField = stockGraph.lowField;
                            if (lField) {
                                if (fm.toField == lField) {
                                    hasField = true;
                                }
                            }
                        }

                        panel.graphs.push(stockGraph);
                        panel.processGraphs();

                        if (!hasField) {
                            stockGraph.hideFromLegend = true;
                        } else {
                            stockGraph.hideFromLegend = false;
                        }

                        var setComparingText = false;

                        if (panel.recalculateToPercents == "always") {
                            setComparingText = true;
                        }

                        var stockLegend = panel.stockLegend;

                        var valueTextComparing;
                        var valueTextRegular;
                        var periodValueTextComparing;
                        var periodValueTextRegular;

                        if (stockLegend) {
                            stockLegend = AmCharts.processObject(stockLegend, AmCharts.StockLegend, _this.theme);
                            panel.stockLegend = stockLegend;

                            valueTextComparing = stockLegend.valueTextComparing;
                            valueTextRegular = stockLegend.valueTextRegular;
                            periodValueTextComparing = stockLegend.periodValueTextComparing;
                            periodValueTextRegular = stockLegend.periodValueTextRegular;
                        }

                        if (stockGraph.comparable) {
                            var d = comparedDataSets.length;

                            if (stockGraph.valueAxis) {

                                if (d > 0) {
                                    if (stockGraph.valueAxis.logarithmic && panel.recalculateToPercents != "never") {
                                        stockGraph.valueAxis.logarithmic = false;
                                        stockGraph.valueAxis.prevLog = true;
                                    }
                                }

                                if (d > 0 && panel.recalculateToPercents == "whenComparing") {
                                    stockGraph.valueAxis.recalculateToPercents = true;
                                }
                                if (stockLegend) {
                                    if (stockGraph.valueAxis) {
                                        if (stockGraph.valueAxis.recalculateToPercents === true) {
                                            setComparingText = true;
                                        }
                                    }
                                }
                                var l;

                                for (l = 0; l < d; l++) {
                                    var dataSet = comparedDataSets[l];

                                    var compareGraph = stockGraph.comparedGraphs[dataSet.id];

                                    if (!compareGraph) {
                                        compareGraph = new AmCharts.AmGraph(_this.theme);
                                        compareGraph.id = "comparedGraph_" + stockGraph.id + "_" + dataSet.id;
                                    }

                                    if (stockGraph.compareGraphType) {
                                        compareGraph.type = stockGraph.compareGraphType;
                                    }                                    

                                    if (stockGraph.compareGraph) {
                                        AmCharts.copyProperties(stockGraph.compareGraph, compareGraph);
                                    }

                                    compareGraph.periodValue = stockGraph.periodValue;
                                    compareGraph.recalculateValue = stockGraph.recalculateValue;
                                    compareGraph.dataSet = dataSet;
                                    compareGraph.behindColumns = stockGraph.behindColumns;
                                    stockGraph.comparedGraphs[dataSet.id] = compareGraph;

                                    compareGraph.seriesIdField = "amCategoryIdField";

                                    compareGraph.connect = stockGraph.connect;
                                    compareGraph.clustered = stockGraph.clustered;
                                    compareGraph.showBalloon = stockGraph.showBalloon;

                                    _this.passFields(stockGraph, compareGraph);

                                    var compareField = stockGraph.compareField;

                                    if (!compareField) {
                                        compareField = stockGraph.valueField;
                                    }

                                    compareGraph.customBulletsHidden = !stockGraph.showEventsOnComparedGraphs;

                                    // check if this data set has such field mapped
                                    hasField = false;
                                    fieldMappings = dataSet.fieldMappings;

                                    for (f = 0; f < fieldMappings.length; f++) {
                                        fm = fieldMappings[f];
                                        if (fm.toField == compareField) {
                                            hasField = true;
                                        }
                                    }

                                    if (hasField) {
                                        compareGraph.valueField = compareField;
                                        if (!dataSet.title) {
                                            compareGraph.title = stockGraph.title;
                                        } else {
                                            compareGraph.title = dataSet.title;
                                        }
                                        compareGraph.lineColor = dataSet.color;

                                        if (stockGraph.compareGraphLineColor) {
                                            compareGraph.lineColor = stockGraph.compareGraphLineColor;
                                        }

                                        var compareGraphLineThickness = stockGraph.compareGraphLineThickness;
                                        if (!isNaN(compareGraphLineThickness)) {
                                            compareGraph.lineThickness = compareGraphLineThickness;
                                        }

                                        var compareGraphDashLength = stockGraph.compareGraphDashLength;
                                        if (!isNaN(compareGraphDashLength)) {
                                            compareGraph.dashLength = compareGraphDashLength;
                                        }

                                        var compareGraphLineAlpha = stockGraph.compareGraphLineAlpha;
                                        if (!isNaN(compareGraphLineAlpha)) {
                                            compareGraph.lineAlpha = compareGraphLineAlpha;
                                        }

                                        var compareGraphCornerRadiusTop = stockGraph.compareGraphCornerRadiusTop;
                                        if (!isNaN(compareGraphCornerRadiusTop)) {
                                            compareGraph.cornerRadiusTop = compareGraphCornerRadiusTop;
                                        }

                                        var compareGraphCornerRadiusBottom = stockGraph.compareGraphCornerRadiusBottom;
                                        if (!isNaN(compareGraphCornerRadiusBottom)) {
                                            compareGraph.cornerRadiusBottom = compareGraphCornerRadiusBottom;
                                        }

                                        var compareGraphBalloonColor = stockGraph.compareGraphBalloonColor;
                                        if (!isNaN(compareGraphBalloonColor)) {
                                            compareGraph.balloonColor = compareGraphBalloonColor;
                                        }

                                        var compareGraphBulletColor = stockGraph.compareGraphBulletColor;
                                        if (!isNaN(compareGraphBulletColor)) {
                                            compareGraph.bulletColor = compareGraphBulletColor;
                                        }

                                        var compareGraphFillColors = stockGraph.compareGraphFillColors;
                                        if (compareGraphFillColors) {
                                            compareGraph.fillColors = compareGraphFillColors;
                                        }

                                        var compareGraphNegativeFillColors = stockGraph.compareGraphNegativeFillColors;
                                        if (compareGraphNegativeFillColors) {
                                            compareGraph.negativeFillColors = compareGraphNegativeFillColors;
                                        }

                                        var compareGraphFillAlphas = stockGraph.compareGraphFillAlphas;
                                        if (compareGraphFillAlphas) {
                                            compareGraph.fillAlphas = compareGraphFillAlphas;
                                        }

                                        var compareGraphNegativeFillAlphas = stockGraph.compareGraphNegativeFillAlphas;
                                        if (compareGraphNegativeFillAlphas) {
                                            compareGraph.negativeFillAlphas = compareGraphNegativeFillAlphas;
                                        }

                                        var compareGraphBullet = stockGraph.compareGraphBullet;
                                        if (compareGraphBullet) {
                                            compareGraph.bullet = compareGraphBullet;
                                        }

                                        var compareGraphNumberFormatter = stockGraph.compareGraphNumberFormatter;
                                        if (compareGraphNumberFormatter) {
                                            compareGraph.numberFormatter = compareGraphNumberFormatter;
                                        }

                                        var compareGraphPrecision = stockGraph.compareGraphPrecision;
                                        if (!isNaN(compareGraphPrecision)) {
                                            compareGraph.precision = compareGraphPrecision;
                                        }

                                        var compareGraphBalloonText = stockGraph.compareGraphBalloonText;
                                        if (compareGraphBalloonText) {
                                            compareGraph.balloonText = compareGraphBalloonText;
                                        }

                                        var compareGraphBulletSize = stockGraph.compareGraphBulletSize;
                                        if (!isNaN(compareGraphBulletSize)) {
                                            compareGraph.bulletSize = compareGraphBulletSize;
                                        }

                                        var compareGraphBulletAlpha = stockGraph.compareGraphBulletAlpha;
                                        if (!isNaN(compareGraphBulletAlpha)) {
                                            compareGraph.bulletAlpha = compareGraphBulletAlpha;
                                        }

                                        var compareGraphBulletBorderAlpha = stockGraph.compareGraphBulletBorderAlpha;
                                        if (!isNaN(compareGraphBulletBorderAlpha)) {
                                            compareGraph.bulletBorderAlpha = compareGraphBulletBorderAlpha;
                                        }

                                        var compareGraphBulletBorderColor = stockGraph.compareGraphBulletBorderColor;
                                        if (compareGraphBulletBorderColor) {
                                            compareGraph.bulletBorderColor = compareGraphBulletBorderColor;
                                        }

                                        var compareGraphBulletBorderThickness = stockGraph.compareGraphBulletBorderThickness;
                                        if (!isNaN(compareGraphBulletBorderThickness)) {
                                            compareGraph.bulletBorderThickness = compareGraphBulletBorderThickness;
                                        }

                                        compareGraph.visibleInLegend = stockGraph.compareGraphVisibleInLegend;
                                        compareGraph.balloonFunction = stockGraph.compareGraphBalloonFunction;
                                        compareGraph.hideBulletsCount = stockGraph.hideBulletsCount;
                                        compareGraph.valueAxis = stockGraph.valueAxis;

                                        if (stockLegend) {
                                            if (setComparingText && valueTextComparing) {
                                                compareGraph.legendValueText = valueTextComparing;
                                                compareGraph.legendPeriodValueText = periodValueTextComparing;
                                            } else {
                                                if (valueTextRegular) {
                                                    compareGraph.legendValueText = valueTextRegular;
                                                }
                                                //if (periodValueTextRegular) {
                                                compareGraph.legendPeriodValueText = periodValueTextRegular;
                                                //}
                                            }
                                        }

                                        if (panel.showComparedOnTop) {
                                            panel.graphs.push(compareGraph);
                                        } else {
                                            panel.graphs.unshift(compareGraph);
                                        }
                                        _this.comparedGraphs.push({
                                            graph: compareGraph,
                                            dataSet: dataSet
                                        });
                                    }
                                }
                            }
                        }

                        if (stockLegend) {
                            if (setComparingText && valueTextComparing) {
                                stockGraph.legendValueText = valueTextComparing;
                                stockGraph.legendPeriodValueText = periodValueTextComparing;
                            } else {
                                if (valueTextRegular) {
                                    stockGraph.legendValueText = valueTextRegular;
                                }
                                //if (!stockGraph.legendPeriodValueText) {
                                stockGraph.legendPeriodValueText = periodValueTextRegular;
                                //}
                            }
                        }
                    }
                }
            }
        },

        passFields: function(stockGraph, compareGraph) {
            var fields = ["lineColor", "color", "alpha", "fillColors", "description", "bullet", "customBullet", "bulletSize", "bulletConfig", "url", "labelColor", "dashLength", "pattern", "gap", "className"];

            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                compareGraph[field + "Field"] = stockGraph[field + "Field"];
            }
        },


        choosePeriod: function(index, startDate, endDate) {
            var _this = this;
            var categoryAxesSettings = _this.categoryAxesSettings;
            var groupToPeriods = categoryAxesSettings.groupToPeriods;
            var period = groupToPeriods[index];
            var nextPeriod = groupToPeriods[index + 1];

            var periodObj = AmCharts.extractPeriod(period);
            var cleanPeriod = periodObj.period;
            var periodCount = periodObj.count;

            var periodDuration = AmCharts.getPeriodDuration(cleanPeriod, periodCount);

            var startTime = startDate.getTime();
            var endTime = endDate.getTime();
            var maxSeries = categoryAxesSettings.maxSeries;

            if (categoryAxesSettings.alwaysGroup && period == categoryAxesSettings.minPeriod) {
                if (groupToPeriods.length > 1) {
                    period = groupToPeriods[1];
                } else {
                    period = groupToPeriods[0];
                }
            }

            // if next period is available and there are more values in current period then it is allowed to display
            if ((endTime - startTime) / periodDuration > maxSeries && maxSeries > 0 && nextPeriod) {
                return _this.choosePeriod(index + 1, startDate, endDate);
            } else {
                return period;
            }
        },


        getSelections: function() {
            var _this = this;
            var comparedDataSets = [];
            var dataSets = _this.dataSets;
            var i;
            for (i = 0; i < dataSets.length; i++) {
                var dataSet = dataSets[i];

                if (dataSet.compared) {
                    comparedDataSets.push(dataSet);
                }
            }

            _this.comparedDataSets = comparedDataSets;

            var panels = _this.panels;
            var j;
            for (j = 0; j < panels.length; j++) {
                var panel = panels[j];

                if (panel.hideDrawingIcons) {
                    if (panel.recalculateToPercents != "never" && comparedDataSets.length > 0) {
                        panel.hideDrawingIcons(true);
                    } else {
                        if (panel.drawingIconsEnabled) {
                            panel.hideDrawingIcons(false);
                        }
                    }
                }
            }
        },


        addPanel: function(panel) {
            this.panels.push(panel);
            this.prevPH = undefined;
            AmCharts.removeChart(panel);
            AmCharts.addChart(panel);
        },

        addPanelAt: function(panel, index) {
            this.panels.splice(index, 0, panel);
            this.prevPH = undefined;
            AmCharts.removeChart(panel);
            AmCharts.addChart(panel);
        },

        removePanel: function(panel) {
            var _this = this;
            var panels = _this.panels;
            _this.prevPH = undefined;
            var i;
            for (i = panels.length - 1; i >= 0; i--) {
                if (panels[i] == panel) {
                    var event = {
                        type: "panelRemoved",
                        panel: panel,
                        chart: _this
                    };
                    _this.fire(event);
                    panels.splice(i, 1);
                    panel.destroy();
                    panel.clear();
                }
            }
        },

        validateData: function(noReset) {
            var _this = this;

            if (_this.validateDataTO) {
                clearTimeout(_this.validateDataTO);
            }
            _this.validateDataTO = setTimeout(
                function() {
                    _this.validateDataReal.call(_this, noReset);
                }, 100);
        },

        validateDataReal: function(noReset) {
            var _this = this;

            if (!noReset) {
                _this.resetDataParsed();
            }
            _this.updateDataSets();
            _this.mainDataSet.compared = false;
            _this.updateData();

            var dataSetSelector = _this.dataSetSelector;
            if (dataSetSelector) {
                dataSetSelector.write(dataSetSelector.div);
            }
        },

        resetDataParsed: function() {
            var _this = this;

            var dataSets = _this.dataSets;
            var i;
            for (i = 0; i < dataSets.length; i++) {
                var dataSet = dataSets[i];
                dataSet.dataParsed = false;
            }
        },

        validateNow: function(validateData, skipEvents) {
            var _this = this;
            _this.skipDefault = true;
            _this.chartRendered = false;
            _this.prevPH = undefined;
            _this.skipEvents = skipEvents;
            _this.clear(true);
            if (_this.initTO) {
                clearTimeout(_this.initTO);
            }
            if (validateData) {
                _this.resetDataParsed();
            }

            _this.write(_this.div);
        },

        hideStockEvents: function() {
            this.showHideEvents(false);
            this.eventsHidden = true;
        },

        showStockEvents: function() {
            this.showHideEvents(true);
            this.eventsHidden = false;
        },


        showHideEvents: function(value) {
            var _this = this;
            var panels = _this.panels;
            var i;

            for (i = 0; i < panels.length; i++) {
                var panel = panels[i];

                var stockGraphs = panel.graphs;
                var j;
                for (j = 0; j < stockGraphs.length; j++) {
                    var graph = stockGraphs[j];
                    if (value === true) {
                        graph.showCustomBullets(true);
                    } else {
                        graph.hideCustomBullets(true);
                    }
                }
            }
        },

        invalidateSize: function() {
            var _this = this;
            clearTimeout(_this.validateTO);
            var validateTO = setTimeout(function() {
                _this.validateNow();
            }, 5);
            _this.validateTO = validateTO;
        },

        measure: function() {
            var _this = this;
            var div = _this.div;
            if (div) {
                var divRealWidth = div.offsetWidth;
                var divRealHeight = div.offsetHeight;

                if (div.clientHeight) {
                    divRealWidth = div.clientWidth;
                    divRealHeight = div.clientHeight;
                }

                _this.divRealWidth = divRealWidth;
                _this.divRealHeight = divRealHeight;
            }
        },

        handleResize: function() {
            var _this = this;
            var initTO = setTimeout(function() {
                _this.validateSizeReal();
            }, 150);
            _this.initTO = initTO;
        },


        validateSizeReal: function() {
            var _this = this;

            _this.previousWidth = _this.divRealWidth;
            _this.previousHeight = _this.divRealHeight;

            _this.measure();

            if (_this.divRealWidth != _this.previousWidth || _this.divRealHeight != _this.previousHeight) {

                if (_this.divRealWidth > 0 && _this.divRealHeight > 0) {

                    var type = "resized";
                    _this.fire({
                        type: type,
                        chart: _this
                    });
                }

                if (_this.divRealHeight != _this.previousHeight) {
                    _this.validateNow();
                }
            }
        },


        clear: function(keepChart) {
            var _this = this;
            var panels = _this.panels;
            var i;
            if (panels) {
                for (i = 0; i < panels.length; i++) {
                    var panel = panels[i];
                    if (!keepChart) {
                        panel.cleanChart();
                        panel.destroy();
                    }
                    panel.clear(keepChart);
                }
            }

            var scrollbarChart = _this.scrollbarChart;
            if (_this.scrollbarChart) {
                scrollbarChart.clear();
            }

            var div = _this.div;
            if (div) {
                div.innerHTML = "";
            }
            if (!keepChart) {
                this.div = null;
                AmCharts.deleteObject(this);
            }
        }


    });

    AmCharts.StockEvent = AmCharts.Class({
        construct: function() {}
    });
})();
(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.AmGanttChart = AmCharts.Class({

        inherits: AmCharts.AmSerialChart,

        construct: function(theme) {
            var _this = this;
            _this.type = "gantt";
            AmCharts.AmGanttChart.base.construct.call(_this, theme);
            _this.cname = "AmGanttChart";
            _this.period = "ss";
        },

        initChart: function() {
            var _this = this;
            if (_this.dataChanged) {
                _this.processGanttData();
            }
            AmCharts.AmGanttChart.base.initChart.call(_this);
        },


        parseData: function() {
            var _this = this;
            AmCharts.AmSerialChart.base.parseData.call(_this); // not a mistake!
            _this.parseSerialData(_this.ganttDataProvider);
        },

        processGanttData: function() {
            var _this = this;
            var i;

            _this.graphs = [];
            var dataProvider = _this.dataProvider;
            _this.ganttDataProvider = [];
            var categoryField = _this.categoryField;
            var startField = _this.startField;
            var endField = _this.endField;
            var durationField = _this.durationField;

            var startDateField = _this.startDateField;
            var endDateField = _this.endDateField;
            var colorField = _this.colorField;
            //var period = _this.period;

            var periodObj = AmCharts.extractPeriod(_this.period);
            var period = periodObj.period;
            var periodCount = periodObj.count;

            var chartStartDate = AmCharts.getDate(_this.startDate, _this.dataDateFormat, "fff");

            var categoryAxis = _this.categoryAxis;
            categoryAxis.gridPosition = "start";

            var valueAxis = _this.valueAxis;
            _this.valueAxes = [valueAxis];

            var parseDates;
            if (valueAxis.type == "date") {
                parseDates = true;
            }

            if (valueAxis.minimumDate) {
                valueAxis.minimumDate = AmCharts.getDate(valueAxis.minimumDate, dataDateFormat, period);
            }
            if (valueAxis.maximumDate) {
                valueAxis.maximumDate = AmCharts.getDate(valueAxis.maximumDate, dataDateFormat, period);
            }

            if (!isNaN(valueAxis.minimum)) {
                valueAxis.minimumDate = AmCharts.changeDate(new Date(chartStartDate), period, valueAxis.minimum, true, true);
            }

            if (!isNaN(valueAxis.maximum)) {
                valueAxis.maximumDate = AmCharts.changeDate(new Date(chartStartDate), period, valueAxis.maximum, true, true);
            }

            var dataDateFormat = _this.dataDateFormat;
            if (dataProvider) {
                for (i = 0; i < dataProvider.length; i++) {
                    var rawDataItem = dataProvider[i];
                    var category = rawDataItem[categoryField];
                    var dataItem = {};

                    dataItem[categoryField] = category;
                    var segments = rawDataItem[_this.segmentsField];
                    var previousEnd;
                    _this.ganttDataProvider.push(dataItem);

                    var color = rawDataItem[colorField];

                    if (!_this.colors[i]) {
                        _this.colors[i] = AmCharts.randomColor();
                    }

                    if (segments) {
                        for (var s = 0; s < segments.length; s++) {
                            var segement = segments[s];

                            var start = segement[startField];
                            var end = segement[endField];
                            var duration = segement[durationField];

                            if (isNaN(start)) {
                                start = previousEnd;
                            }

                            if (!isNaN(duration)) {
                                end = start + duration;
                            }


                            var graphStartField = "start_" + i + "_" + s;
                            var graphEndField = "end_" + i + "_" + s;
                            dataItem[graphStartField] = start;
                            dataItem[graphEndField] = end;

                            var fields = ["lineColor", "color", "alpha", "fillColors", "description", "bullet", "customBullet", "bulletSize", "bulletConfig", "url", "labelColor", "dashLength", "pattern", "gap", "className"];

                            var fieldName;
                            var fieldValue;
                            for (var f in fields) {
                                fieldName = fields[f] + "Field";
                                fieldValue = _this.graph[fieldName];

                                if (fieldValue) {
                                    if (segement[fieldValue] !== undefined) {
                                        dataItem[fieldValue + "_" + i + "_" + s] = segement[fieldValue];
                                    }
                                }
                            }

                            previousEnd = end;

                            if (parseDates) {
                                var startDate = AmCharts.getDate(segement[startDateField], dataDateFormat, period);
                                var endDate = AmCharts.getDate(segement[endDateField], dataDateFormat, period);

                                if (chartStartDate) {
                                    if (!isNaN(start)) {
                                        startDate = AmCharts.changeDate(new Date(chartStartDate), period, start * periodCount, true, true);
                                    }
                                    if (!isNaN(end)) {
                                        endDate = AmCharts.changeDate(new Date(chartStartDate), period, end * periodCount, true, true);
                                    }
                                }

                                dataItem[graphStartField] = startDate.getTime();
                                dataItem[graphEndField] = endDate.getTime();
                            }
                            //copy all other properties? risky.
                            var customData = {};
                            AmCharts.copyProperties(segement, customData);

                            var graph = {};
                            AmCharts.copyProperties(_this.graph, graph, true);

                            // fields are different
                            for (f in fields) {

                                fieldName = fields[f] + "Field";
                                if (_this.graph[fieldName]) {
                                    graph[fieldName] = fields[f] + "_" + i + "_" + s;
                                }
                            }
                            graph.customData = customData;
                            graph.segmentData = segement;

                            graph.labelFunction = _this.graph.labelFunction;
                            graph.balloonFunction = _this.graph.balloonFunction;
                            graph.customBullet = _this.graph.customBullet;

                            graph.type = "column";
                            graph.openField = graphStartField;
                            graph.valueField = graphEndField;
                            graph.clustered = false;

                            if (segement[colorField]) {
                                color = segement[colorField];
                            }

                            graph.columnWidth = segement[_this.columnWidthField];

                            if (color === undefined) {
                                color = _this.colors[i];
                            }

                            var brightnessStep = _this.brightnessStep;

                            if (brightnessStep) {
                                color = AmCharts.adjustLuminosity(color, s * brightnessStep / 100);
                            }

                            if (_this.graph.lineColor === undefined) {
                                graph.lineColor = color;
                            }

                            if (_this.graph.fillColors === undefined) {
                                graph.fillColors = color;
                            }

                            _this.graphs.push(graph);
                        }
                    }
                }
            }
        }

    });
})();
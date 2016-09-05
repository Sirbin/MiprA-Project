(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.AmRadarChart = AmCharts.Class({

        inherits: AmCharts.AmCoordinateChart,

        construct: function(theme) {
            var _this = this;
            _this.type = "radar";
            AmCharts.AmRadarChart.base.construct.call(_this, theme);
            _this.cname = "AmRadarChart";

            _this.marginLeft = 0;
            _this.marginTop = 0;
            _this.marginBottom = 0;
            _this.marginRight = 0;
            _this.radius = "35%";

            AmCharts.applyTheme(_this, theme, _this.cname);
        },

        initChart: function() {
            var _this = this;
            AmCharts.AmRadarChart.base.initChart.call(_this);
            if (_this.dataChanged) {
                _this.parseData();
            } else {
                _this.onDataUpdated();
            }
        },

        onDataUpdated: function() {
            this.drawChart();
        },

        updateGraphs: function() {
            var _this = this;
            var graphs = _this.graphs;
            var i;
            for (i = 0; i < graphs.length; i++) {
                var graph = graphs[i];
                graph.index = i;
                graph.width = _this.realRadius;
                graph.height = _this.realRadius;
                graph.x = _this.marginLeftReal;
                graph.y = _this.marginTopReal;
                graph.data = _this.chartData;
            }
        },

        parseData: function() {
            var _this = this;
            AmCharts.AmRadarChart.base.parseData.call(_this);
            _this.parseSerialData(_this.dataProvider);
        },

        updateValueAxes: function() {
            var _this = this;
            var valueAxes = _this.valueAxes;
            var i;
            for (i = 0; i < valueAxes.length; i++) {
                var valueAxis = valueAxes[i];
                valueAxis.axisRenderer = AmCharts.RadAxis;
                valueAxis.guideFillRenderer = AmCharts.RadarFill;
                valueAxis.axisItemRenderer = AmCharts.RadItem;
                valueAxis.autoGridCount = false;
                valueAxis.rMultiplier = 1;

                valueAxis.x = _this.marginLeftReal;
                valueAxis.y = _this.marginTopReal;
                valueAxis.width = _this.realRadius;
                valueAxis.height = _this.realRadius;
                valueAxis.marginsChanged = true;

                valueAxis.titleDY = valueAxis.y;
            }
        },


        drawChart: function() {
            var _this = this;
            AmCharts.AmRadarChart.base.drawChart.call(_this);
            var realWidth = _this.updateWidth();
            var realHeight = _this.updateHeight();

            var marginTop = _this.marginTop + _this.getTitleHeight();
            var marginLeft = _this.marginLeft;
            var marginBottom = _this.marginBottom;
            var marginRight = _this.marginRight;
            var allowedHeight = realHeight - marginTop - marginBottom;

            _this.marginLeftReal = marginLeft + (realWidth - marginLeft - marginRight) / 2;
            _this.marginTopReal = marginTop + allowedHeight / 2;

            var radH = realHeight - marginTop - marginBottom;
            var radW = realWidth - marginLeft - marginRight;

            _this.realRadius = AmCharts.toCoordinate(_this.radius, Math.min(radW, radH), allowedHeight);

            _this.updateValueAxes();
            _this.updateGraphs();

            var chartData = _this.chartData;

            if (AmCharts.ifArray(chartData)) {
                if (_this.realWidth > 0 && _this.realHeight > 0) {
                    var last = chartData.length - 1;
                    var valueAxes = _this.valueAxes;
                    var i;
                    for (i = 0; i < valueAxes.length; i++) {
                        var valueAxis = valueAxes[i];
                        valueAxis.zoom(0, last);
                    }

                    var graphs = _this.graphs;
                    for (i = 0; i < graphs.length; i++) {
                        var graph = graphs[i];
                        graph.zoom(0, last);
                    }

                    var legend = _this.legend;
                    if (legend) {
                        legend.invalidateSize();
                    }
                }
            } else {
                _this.cleanChart();
            }
            _this.dispDUpd();

            _this.gridSet.toBack();
            _this.axesSet.toBack();
            _this.set.toBack();
        },


        formatString: function(text, dItem, noFixBrakes) {
            var _this = this;
            var graph = dItem.graph;

            if (text.indexOf("[[category]]") != -1) {
                var category = dItem.serialDataItem.category;
                text = text.replace(/\[\[category\]\]/g, String(category));
            }

            var numberFormatter = graph.numberFormatter;
            if (!numberFormatter) {
                numberFormatter = _this.nf;
            }

            var keys = ["value"];
            text = AmCharts.formatValue(text, dItem.values, keys, numberFormatter, "", _this.usePrefixes, _this.prefixesOfSmallNumbers, _this.prefixesOfBigNumbers);

            if (text.indexOf("[[") != -1) {
                text = AmCharts.formatDataContextValue(text, dItem.dataContext);
            }

            text = AmCharts.AmRadarChart.base.formatString.call(_this, text, dItem, noFixBrakes);

            return text;
        },

        cleanChart: function() {
            var _this = this;
            AmCharts.callMethod("destroy", [_this.valueAxes, _this.graphs]);
        }

    });
})();
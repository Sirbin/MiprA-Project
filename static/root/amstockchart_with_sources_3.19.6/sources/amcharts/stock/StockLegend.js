(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.StockLegend = AmCharts.Class({

        inherits: AmCharts.AmLegend,

        construct: function(theme) {
            var _this = this;
            AmCharts.StockLegend.base.construct.call(_this, theme);
            _this.cname = "StockLegend";
            _this.valueTextComparing = "[[percents.value]]%";
            _this.valueTextRegular = "[[value]]";

            //_this.periodValueTextComparing = "[[percents.value.close]]%";
            //_this.periodValueTextRegular = "[[value.close]]";

            AmCharts.applyTheme(_this, theme, _this.cname);
        },

        drawLegend: function() {
            var _this = this;
            AmCharts.StockLegend.base.drawLegend.call(_this);

            var chart = _this.chart;

            if (chart.allowTurningOff) {
                var iconSize = 19;
                var container = _this.container;
                var xButton = container.image(chart.pathToImages + "xIcon" + chart.extension, chart.realWidth - iconSize, 3, iconSize, iconSize);
                var xButtonHover = container.image(chart.pathToImages + "xIconH" + chart.extension, chart.realWidth - iconSize, 3, iconSize, iconSize);
                xButtonHover.hide();
                _this.xButtonHover = xButtonHover;

                xButton.mouseup(function() {
                    _this.handleXClick();
                }).mouseover(function() {
                    _this.handleXOver();
                });

                xButtonHover.mouseup(function() {
                    _this.handleXClick();
                }).mouseout(function() {
                    _this.handleXOut();
                });
            }
        },


        handleXOver: function() {
            this.xButtonHover.show();
        },

        handleXOut: function() {
            this.xButtonHover.hide();
        },

        handleXClick: function() {
            var chart = this.chart;
            var stockChart = chart.stockChart;

            stockChart.removePanel(chart);
            stockChart.validateNow();
        }


    });
})();
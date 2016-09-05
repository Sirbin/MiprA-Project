(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.StockGraph = AmCharts.Class({

        inherits: AmCharts.AmGraph,

        construct: function(theme) {
            var _this = this;
            AmCharts.StockGraph.base.construct.call(_this, theme);
            _this.cname = "StockGraph";

            _this.useDataSetColors = true;
            _this.periodValue = "Close";
            _this.compareGraphType = "line";
            _this.compareGraphVisibleInLegend = true;
            _this.resetTitleOnDataSetChange = false;
            _this.comparable = false;
            _this.comparedGraphs = {};
            _this.showEventsOnComparedGraphs = false;
            //_this.parentGraph;
            //_this.recalculateValue = "Close";

            AmCharts.applyTheme(_this, theme, _this.cname);
        }
    });
})();
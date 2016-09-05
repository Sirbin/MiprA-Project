(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.CategoryAxesSettings = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "CategoryAxesSettings";
            _this.minPeriod = "DD";
            _this.equalSpacing = false;
            _this.axisHeight = 28;
            _this.axisAlpha = 0;
            _this.tickLength = 0;
            _this.gridCount = 10;
            _this.maxSeries = 150;
            _this.groupToPeriods = ["ss", "10ss", "30ss", "mm", "10mm", "30mm", "hh", "DD", "WW", "MM", "YYYY"];
            _this.autoGridCount = true;
            _this.markPeriodChange = true;

            AmCharts.applyTheme(_this, theme, _this.cname);
        }
    });
})();
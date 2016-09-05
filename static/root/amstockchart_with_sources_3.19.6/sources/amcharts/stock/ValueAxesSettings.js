(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.ValueAxesSettings = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "ValueAxesSettings";
            _this.tickLength = 0;
            _this.inside = true;
            _this.autoGridCount = true;
            _this.showFirstLabel = true;
            _this.showLastLabel = false;
            _this.axisAlpha = 0;

            AmCharts.applyTheme(_this, theme, _this.cname);
        }
    });
})();
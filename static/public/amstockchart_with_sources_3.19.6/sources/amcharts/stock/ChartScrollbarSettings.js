(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.ChartScrollbarSettings = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "ChartScrollbarSettings";
            _this.height = 40;
            _this.enabled = true;
            _this.color = "#FFFFFF";
            _this.autoGridCount = true;
            _this.updateOnReleaseOnly = true;
            _this.hideResizeGrips = false;
            _this.position = "bottom";
            _this.minDistance = 1;
            //_this.usePeriod;

            AmCharts.applyTheme(_this, theme, _this.cname);
        }
    });
})();
(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.LegendSettings = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "LegendSettings";
            _this.marginTop = 0;
            _this.marginBottom = 0;
            _this.usePositiveNegativeOnPercentsOnly = true;
            _this.positiveValueColor = "#00CC00";
            _this.negativeValueColor = "#CC0000";
            _this.textClickEnabled = false;
            _this.equalWidths = false;
            _this.autoMargins = false;

            AmCharts.applyTheme(_this, theme, _this.cname);
        }
    });
})();
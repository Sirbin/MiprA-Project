(function() {
    "use strict";
    var AmCharts = window.AmCharts;

    AmCharts.GaugeArrow = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "GaugeArrow";
            _this.color = "#000000";
            _this.alpha = 1;
            _this.nailAlpha = 1;
            _this.nailRadius = 8;
            _this.startWidth = 8;
            _this.endWidth = 0;
            _this.borderAlpha = 1;
            _this.radius = "90%";
            _this.innerRadius = 0;
            _this.nailBorderAlpha = 0;
            _this.nailBorderThickness = 1;
            _this.frame = 0;

            AmCharts.applyTheme(_this, theme, "GaugeArrow");
        },

        setValue: function(value) {
            var _this = this;
            var chart = _this.chart;
            if (!chart) {
                _this.value = value;
                _this.previousValue = value;
            } else {
                if (chart.setValue) {
                    chart.setValue(this, value);
                } else {
                    _this.value = value;
                    _this.previousValue = value;
                }
            }
        }

    });

    AmCharts.GaugeBand = AmCharts.Class({
        construct: function() {
            var _this = this;
            _this.cname = "GaugeBand";
        }

    });
})();
(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.PanelsSettings = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "PanelsSettings";
            _this.marginLeft = 0;
            _this.marginRight = 0;
            _this.marginTop = 0;
            _this.marginBottom = 0;
            _this.backgroundColor = "#FFFFFF";
            _this.backgroundAlpha = 0;
            _this.panelSpacing = 8;
            _this.panEventsEnabled = true; // changed since v 3.4.4
            _this.creditsPosition = "top-right";
            _this.zoomOutAxes = true;
            _this.svgIcons = true;

            AmCharts.applyTheme(_this, theme, _this.cname);
        }
    });
})();
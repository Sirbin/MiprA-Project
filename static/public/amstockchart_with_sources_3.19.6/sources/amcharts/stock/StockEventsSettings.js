(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.StockEventsSettings = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "StockEventsSettings";
            _this.type = "sign";
            _this.backgroundAlpha = 1;
            _this.backgroundColor = "#DADADA";
            _this.borderAlpha = 1;
            _this.borderColor = "#888888";
            _this.rollOverColor = "#CC0000";
            _this.balloonColor = "#CC0000";
            //_this.urlTarget = "_blank";

            AmCharts.applyTheme(_this, theme, _this.cname);
        }
    });
})();
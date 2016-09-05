(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.ChartCursorSettings = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "ChartCursorSettings";
            _this.enabled = true;
            _this.valueBalloonsEnabled = false;
            _this.bulletsEnabled = false;
            _this.graphBulletSize = 1;
            _this.onePanelOnly = false;
            _this.categoryBalloonDateFormats = [{
                period: "YYYY",
                format: "YYYY"
            }, {
                period: "MM",
                format: "MMM, YYYY"
            }, {
                period: "WW",
                format: "MMM DD, YYYY"
            }, {
                period: "DD",
                format: "MMM DD, YYYY"
            }, {
                period: "hh",
                format: "JJ:NN"
            }, {
                period: "mm",
                format: "JJ:NN"
            }, {
                period: "ss",
                format: "JJ:NN:SS"
            }, {
                period: "fff",
                format: "JJ:NN:SS"
            }];

            AmCharts.applyTheme(_this, theme, _this.cname);
        },

        categoryBalloonDateFormat: function(period) {
            var categoryBalloonDateFormats = this.categoryBalloonDateFormats;
            var format;
            var i;
            for (i = 0; i < categoryBalloonDateFormats.length; i++) {
                if (categoryBalloonDateFormats[i].period == period) {
                    format = categoryBalloonDateFormats[i].format;
                }
            }
            return format;
        }
    });
})();
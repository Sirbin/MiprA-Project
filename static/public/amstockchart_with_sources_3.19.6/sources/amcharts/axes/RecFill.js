(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.RecFill = AmCharts.Class({

        construct: function(axis, guideCoord, guideToCoord, guide) {
            var _this = this;
            var dx = axis.dx;
            var dy = axis.dy;
            var orientation = axis.orientation;
            var shift = 0;

            if (guideToCoord < guideCoord) {
                var temp = guideCoord;
                guideCoord = guideToCoord;
                guideToCoord = temp;
            }

            var fillAlpha = guide.fillAlpha;
            if (isNaN(fillAlpha)) {
                fillAlpha = 0;
            }
            var container = axis.chart.container;
            var fillColor = guide.fillColor;


            if (orientation == "V") {
                guideCoord = AmCharts.fitToBounds(guideCoord, 0, axis.height);
                guideToCoord = AmCharts.fitToBounds(guideToCoord, 0, axis.height);
            } else {
                guideCoord = AmCharts.fitToBounds(guideCoord, 0, axis.width);
                guideToCoord = AmCharts.fitToBounds(guideToCoord, 0, axis.width);
            }

            var fillWidth = guideToCoord - guideCoord;

            if (isNaN(fillWidth)) {
                fillWidth = 4;
                shift = 2;
                fillAlpha = 0;
            }

            if (fillWidth < 0) {
                if (typeof(fillColor) == "object") {
                    fillColor = fillColor.join(",").split(",").reverse();
                }
            }

            var fill;

            if (orientation == "V") {
                fill = AmCharts.rect(container, axis.width, fillWidth, fillColor, fillAlpha);
                fill.translate(dx, guideCoord - shift + dy);
            } else {
                fill = AmCharts.rect(container, fillWidth, axis.height, fillColor, fillAlpha);
                fill.translate(guideCoord - shift + dx, dy);
            }

            AmCharts.setCN(axis.chart, fill, "guide-fill");
            if (guide.id) {
                AmCharts.setCN(axis.chart, fill, "guide-fill-" + guide.id);
            }

            _this.set = container.set([fill]);
        },

        graphics: function() {
            return this.set;
        },

        getLabel: function() {

        }
    });
})();
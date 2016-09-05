(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.RadarFill = AmCharts.Class({

        construct: function(axis, guideCoord, guideToCoord, guide) {

            guideCoord = guideCoord - axis.axisWidth;
            guideToCoord = guideToCoord - axis.axisWidth;

            var guideToCoordReal = Math.max(guideCoord, guideToCoord);
            var guideCoordReal = Math.min(guideCoord, guideToCoord);

            guideToCoord = guideToCoordReal;
            guideCoord = guideCoordReal;

            var _this = this;
            var chart = axis.chart;
            var container = chart.container;
            var fillAlpha = guide.fillAlpha;
            var fillColor = guide.fillColor;

            var radius = Math.abs(guideToCoord);
            var innerRadius = Math.abs(guideCoord);

            var radiusReal = Math.max(radius, innerRadius);
            var innerRadiusReal = Math.min(radius, innerRadius);

            radius = radiusReal;
            innerRadius = innerRadiusReal;

            var angle = guide.angle + 90;
            var toAngle = guide.toAngle + 90;
            if (isNaN(angle)) {
                angle = 0;
            }
            if (isNaN(toAngle)) {
                toAngle = 360;
            }

            _this.set = container.set();

            if (fillColor === undefined) {
                fillColor = "#000000";
            }

            if (isNaN(fillAlpha)) {
                fillAlpha = 0;
            }

            var fill;
            if (axis.gridType == "polygons") {
                var xx = [];
                var yy = [];

                var count = axis.data.length;

                var i;
                for (i = 0; i < count; i++) {
                    angle = 180 - 360 / count * i;
                    xx.push(radius * Math.sin((angle) / (180) * Math.PI));
                    yy.push(radius * Math.cos((angle) / (180) * Math.PI));
                }
                xx.push(xx[0]);
                yy.push(yy[0]);

                for (i = count; i >= 0; i--) {
                    angle = 180 - 360 / count * i;
                    xx.push(innerRadius * Math.sin((angle) / (180) * Math.PI));
                    yy.push(innerRadius * Math.cos((angle) / (180) * Math.PI));
                }

                fill = AmCharts.polygon(container, xx, yy, fillColor, fillAlpha);
            } else {
                fill = AmCharts.wedge(container, 0, 0, angle, (toAngle - angle), radius, radius, innerRadius, 0, {
                    "fill": fillColor,
                    "fill-opacity": fillAlpha,
                    "stroke": "#000",
                    "stroke-opacity": 0,
                    "stroke-width": 1
                });
            }

            AmCharts.setCN(chart, fill, "guide-fill");
            if (guide.id) {
                AmCharts.setCN(chart, fill, "guide-fill-" + guide.id);
            }

            _this.set.push(fill);

            _this.fill = fill;
        },

        graphics: function() {
            return this.set;
        },

        getLabel: function() {

        }
    });
})();
(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.Bezier = AmCharts.Class({
        construct: function(container, x, y, color, alpha, thickness, fillColor, fillAlpha, dashLength, endStr, gradientRotation) {
            var _this = this;
            var fillColors;
            var gradient;
            if (typeof(fillColor) == "object") {
                if (fillColor.length > 1) {
                    gradient = true;
                    fillColors = fillColor;
                    fillColor = fillColor[0];
                }
            }
            if (typeof(fillAlpha) == "object") {
                fillAlpha = fillAlpha[0];
            }
            if (fillAlpha === 0) {
                fillColor = "none";
            }
            var attr = {
                "fill": fillColor,
                "fill-opacity": fillAlpha,
                "stroke-width": thickness
            };

            if (dashLength !== undefined && dashLength > 0) {
                attr["stroke-dasharray"] = dashLength;
            }

            if (!isNaN(alpha)) {
                attr["stroke-opacity"] = alpha;
            }

            if (color) {
                attr.stroke = color;
            }

            var lineStr = "M" + Math.round(x[0]) + "," + Math.round(y[0]);
            var points = [];

            var i;
            for (i = 0; i < x.length; i++) {
                points.push({
                    x: Number(x[i]),
                    y: Number(y[i])
                });
            }

            if (points.length > 1) {
                var interpolatedPoints = _this.interpolate(points);
                lineStr += _this.drawBeziers(interpolatedPoints);
            }

            if (endStr) {
                lineStr += endStr;
            } else {
                if (!AmCharts.VML) {
                    // end string is to create area
                    // this is the fix to solve straight line in chrome problem
                    lineStr += "M0,0 L0,0";
                }
            }

            _this.path = container.path(lineStr).attr(attr);
            _this.node = _this.path.node;

            if (gradient) {
                _this.path.gradient("linearGradient", fillColors, gradientRotation);
            }            
        },


        interpolate: function(points) {
            var interpolatedPoints = [];
            interpolatedPoints.push({
                x: points[0].x,
                y: points[0].y
            });

            var slope_x = points[1].x - points[0].x;
            var slope_y = points[1].y - points[0].y;

            var dal_x = AmCharts.bezierX;
            var dal_y = AmCharts.bezierY;

            interpolatedPoints.push({
                x: points[0].x + slope_x / dal_x,
                y: points[0].y + slope_y / dal_y
            });
            var i;

            for (i = 1; i < points.length - 1; i++) {


                var point1 = points[i - 1];
                var point2 = points[i];
                var point3 = points[i + 1];

                if (isNaN(point3.x)) {
                    point3 = point2;
                }

                if (isNaN(point2.x)) {
                    point2 = point1;
                }

                if (isNaN(point1.x)) {
                    point1 = point2;
                }

                slope_x = point3.x - point2.x;
                slope_y = point3.y - point1.y;

                var slope_x0 = point2.x - point1.x;

                if (slope_x0 > slope_x) {
                    slope_x0 = slope_x;
                }

                interpolatedPoints.push({
                    x: point2.x - slope_x0 / dal_x,
                    y: point2.y - slope_y / dal_y
                });
                interpolatedPoints.push({
                    x: point2.x,
                    y: point2.y
                });
                interpolatedPoints.push({
                    x: point2.x + slope_x0 / dal_x,
                    y: point2.y + slope_y / dal_y
                });
            }

            slope_y = points[points.length - 1].y - points[points.length - 2].y;
            slope_x = points[points.length - 1].x - points[points.length - 2].x;

            interpolatedPoints.push({
                x: points[points.length - 1].x - slope_x / dal_x,
                y: points[points.length - 1].y - slope_y / dal_y
            });
            interpolatedPoints.push({
                x: points[points.length - 1].x,
                y: points[points.length - 1].y
            });

            return interpolatedPoints;
        },

        drawBeziers: function(interpolatedPoints) {
            var str = "";
            var j;
            for (j = 0; j < (interpolatedPoints.length - 1) / 3; j++) {
                str += this.drawBezierMidpoint(interpolatedPoints[3 * j], interpolatedPoints[3 * j + 1], interpolatedPoints[3 * j + 2], interpolatedPoints[3 * j + 3]);
            }
            return str;
        },


        drawBezierMidpoint: function(P0, P1, P2, P3) {
            var round = Math.round;
            // calculates the useful base points
            var PA = this.getPointOnSegment(P0, P1, 3 / 4);
            var PB = this.getPointOnSegment(P3, P2, 3 / 4);

            // get 1/16 of the [P3, P0] segment
            var dx = (P3.x - P0.x) / 16;
            var dy = (P3.y - P0.y) / 16;

            // calculates control point 1
            var Pc_1 = this.getPointOnSegment(P0, P1, 3 / 8);

            // calculates control point 2
            var Pc_2 = this.getPointOnSegment(PA, PB, 3 / 8);
            Pc_2.x -= dx;
            Pc_2.y -= dy;

            // calculates control point 3
            var Pc_3 = this.getPointOnSegment(PB, PA, 3 / 8);
            Pc_3.x += dx;
            Pc_3.y += dy;

            // calculates control point 4
            var Pc_4 = this.getPointOnSegment(P3, P2, 3 / 8);

            // calculates the 3 anchor points
            var Pa_1 = this.getMiddle(Pc_1, Pc_2);
            var Pa_2 = this.getMiddle(PA, PB);
            var Pa_3 = this.getMiddle(Pc_3, Pc_4);

            // draw the four quadratic subsegments
            var comma = ",";

            var str = " Q" + round(Pc_1.x) + comma + round(Pc_1.y) + comma + round(Pa_1.x) + comma + round(Pa_1.y);
            str += " Q" + round(Pc_2.x) + comma + round(Pc_2.y) + comma + round(Pa_2.x) + comma + round(Pa_2.y);
            str += " Q" + round(Pc_3.x) + comma + round(Pc_3.y) + comma + round(Pa_3.x) + comma + round(Pa_3.y);
            str += " Q" + round(Pc_4.x) + comma + round(Pc_4.y) + comma + round(P3.x) + comma + round(P3.y);

            return str;
        },


        getMiddle: function(P0, P1) {
            var point = {
                x: (P0.x + P1.x) / 2,
                y: (P0.y + P1.y) / 2
            };
            return point;
        },

        getPointOnSegment: function(P0, P1, ratio) {
            var point = {
                x: P0.x + (P1.x - P0.x) * ratio,
                y: P0.y + (P1.y - P0.y) * ratio
            };
            return point;
        }

    });

})();
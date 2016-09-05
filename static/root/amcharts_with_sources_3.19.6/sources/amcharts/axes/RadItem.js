(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.RadItem = AmCharts.Class({

        construct: function(axis, coord, value, below, textWidth, valueShift, guide, bold) {
            var _this = this;
            var UNDEFINED;
            var chart = axis.chart;

            if (value === UNDEFINED) {
                value = "";
            }

            var fontFamily = axis.chart.fontFamily;
            var textSize = axis.fontSize;

            if (textSize === UNDEFINED) {
                textSize = axis.chart.fontSize;
            }

            var color = axis.color;
            if (color === UNDEFINED) {
                color = axis.chart.color;
            }

            var container = axis.chart.container;
            var set = container.set();
            _this.set = set;

            var axisColor = axis.axisColor;
            var axisAlpha = axis.axisAlpha;
            var tickLength = axis.tickLength;
            var gridAlpha = axis.gridAlpha;
            var gridThickness = axis.gridThickness;
            var gridColor = axis.gridColor;
            var dashLength = axis.dashLength;
            var fillColor = axis.fillColor;
            var fillAlpha = axis.fillAlpha;
            var labelsEnabled = axis.labelsEnabled;
            var counter = axis.counter;
            var labelInside = axis.inside;
            var gridType = axis.gridType;
            var i;
            var count;
            var angle;
            var labelOffset = axis.labelOffset;
            var className;


            coord -= axis.height;
            var tick;
            var grid;

            if (guide) {
                labelsEnabled = true;

                if (guide.id !== undefined) {
                    className = chart.classNamePrefix + "-guide-" + guide.id;
                }

                if (!isNaN(guide.tickLength)) {
                    tickLength = guide.tickLength;
                }

                if (guide.lineColor != UNDEFINED) {
                    gridColor = guide.lineColor;
                }

                if (!isNaN(guide.lineAlpha)) {
                    gridAlpha = guide.lineAlpha;
                }

                if (!isNaN(guide.dashLength)) {
                    dashLength = guide.dashLength;
                }

                if (!isNaN(guide.lineThickness)) {
                    gridThickness = guide.lineThickness;
                }
                if (guide.inside === true) {
                    labelInside = true;
                }
                if (guide.boldLabel !== undefined) {
                    bold = guide.boldLabel;
                }
            } else {
                if (!value) {
                    gridAlpha = gridAlpha / 3;
                    tickLength = tickLength / 2;
                }
            }

            var align = "end";
            var dir = -1;
            if (labelInside) {
                align = "start";
                dir = 1;
            }

            var valueTF;
            if (labelsEnabled) {
                valueTF = AmCharts.text(container, value, color, fontFamily, textSize, align, bold);
                valueTF.translate((tickLength + 3 + labelOffset) * dir, coord);
                set.push(valueTF);

                AmCharts.setCN(chart, valueTF, axis.bcn + "label");
                if (guide) {
                    AmCharts.setCN(chart, valueTF, "guide");
                }
                AmCharts.setCN(chart, valueTF, className, true);

                _this.label = valueTF;

                tick = AmCharts.line(container, [0, tickLength * dir], [coord, coord], axisColor, axisAlpha, gridThickness);
                set.push(tick);

                AmCharts.setCN(chart, tick, axis.bcn + "tick");
                if (guide) {
                    AmCharts.setCN(chart, tick, "guide");
                }
                AmCharts.setCN(chart, tick, className, true);
            }

            var radius = Math.abs(coord);

            // grid
            var xx = [];
            var yy = [];
            if (gridAlpha > 0) {
                if (gridType == "polygons") {

                    count = axis.data.length;

                    for (i = 0; i < count; i++) {
                        angle = 180 - 360 / count * i;
                        xx.push(radius * Math.sin((angle) / (180) * Math.PI));
                        yy.push(radius * Math.cos((angle) / (180) * Math.PI));
                    }
                    xx.push(xx[0]);
                    yy.push(yy[0]);

                    grid = AmCharts.line(container, xx, yy, gridColor, gridAlpha, gridThickness, dashLength);
                } else {
                    grid = AmCharts.circle(container, radius, "#FFFFFF", 0, gridThickness, gridColor, gridAlpha);
                }
                set.push(grid);

                AmCharts.setCN(chart, grid, axis.bcn + "grid");
                AmCharts.setCN(chart, grid, className, true);
                if (guide) {
                    AmCharts.setCN(chart, grid, "guide");
                }
            }

            if (counter == 1 && fillAlpha > 0 && !guide && value !== "") {
                var prevCoord = axis.previousCoord;
                var fill;

                if (gridType == "polygons") {
                    for (i = count; i >= 0; i--) {
                        angle = 180 - 360 / count * i;
                        xx.push(prevCoord * Math.sin((angle) / (180) * Math.PI));
                        yy.push(prevCoord * Math.cos((angle) / (180) * Math.PI));
                    }
                    fill = AmCharts.polygon(container, xx, yy, fillColor, fillAlpha);
                } else {
                    fill = AmCharts.wedge(container, 0, 0, 0, 360, radius, radius, prevCoord, 0, {
                        "fill": fillColor,
                        "fill-opacity": fillAlpha,
                        "stroke": "#000",
                        "stroke-opacity": 0,
                        "stroke-width": 1
                    });
                }
                set.push(fill);

                AmCharts.setCN(chart, fill, axis.bcn + "fill");
                AmCharts.setCN(chart, fill, className, true);
            }


            if (axis.visible === false) {
                if (tick) {
                    tick.hide();
                }
                if (valueTF) {
                    valueTF.hide();
                }
            }

            if (value !== "") {
                if (counter === 0) {
                    axis.counter = 1;
                } else {
                    axis.counter = 0;
                }
                axis.previousCoord = radius;
            }
        },

        graphics: function() {
            return this.set;
        },

        getLabel: function() {
            return this.label;
        }
    });
})();
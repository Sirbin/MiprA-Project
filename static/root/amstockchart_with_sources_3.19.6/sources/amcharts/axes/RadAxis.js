(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.RadAxis = AmCharts.Class({

        construct: function(axis) {
            var _this = this;            
            var chart = axis.chart;

            var t = axis.axisThickness;
            var c = axis.axisColor;
            var a = axis.axisAlpha;
            var UNDEFINED;

            _this.set = chart.container.set();
            _this.set.translate(axis.x, axis.y);
            chart.axesSet.push(_this.set);

            var axisTitleOffset = axis.axisTitleOffset;
            var radarCategoriesEnabled = axis.radarCategoriesEnabled;

            var fontFamily = axis.chart.fontFamily;
            var textSize = axis.fontSize;

            if (textSize === UNDEFINED) {
                textSize = axis.chart.fontSize;
            }

            var color = axis.color;
            if (color === UNDEFINED) {
                color = axis.chart.color;
            }

            if (chart) {
                _this.axisWidth = axis.height;
                var dataProvider = chart.chartData;
                var count = dataProvider.length;
                var i;
                var dist = _this.axisWidth;

                if (axis.pointPosition == "middle" && axis.gridType != "circles") {
                    axis.rMultiplier = Math.cos(180 / count * Math.PI / 180);
                    dist = dist * axis.rMultiplier;
                }

                for (i = 0; i < count; i+= axis.axisFrequency) {
                    var angle = 180 - 360 / count * i;
                    var labelAngle = angle;

                    if (axis.pointPosition == "middle") {
                        labelAngle -= 180 / count;
                    }

                    var xx = _this.axisWidth * Math.sin((angle) / (180) * Math.PI);
                    var yy = _this.axisWidth * Math.cos((angle) / (180) * Math.PI);
                    if (a > 0) {
                        var line = AmCharts.line(chart.container, [0, xx], [0, yy], c, a, t);
                        _this.set.push(line);

                        AmCharts.setCN(chart, line, axis.bcn + "line");
                    }

                    // label
                    if (radarCategoriesEnabled) {
                        var align = "start";
                        var labelX = (dist + axisTitleOffset) * Math.sin((labelAngle) / (180) * Math.PI);
                        var labelY = (dist + axisTitleOffset) * Math.cos((labelAngle) / (180) * Math.PI);

                        if (labelAngle == 180 || labelAngle === 0) {
                            align = "middle";
                            labelX = labelX - 5;
                        }
                        if (labelAngle < 0) {
                            align = "end";
                            labelX = labelX - 10;
                        }

                        if (labelAngle == 180) {
                            labelY -= 5;
                        }

                        if (labelAngle === 0) {
                            labelY += 5;
                        }

                        var titleTF = AmCharts.text(chart.container, dataProvider[i].category, color, fontFamily, textSize, align);
                        titleTF.translate(labelX + 5, labelY);
                        _this.set.push(titleTF);

                        AmCharts.setCN(chart, titleTF, axis.bcn + "title");
                    }
                }
            }
        }
    });
})();
(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.TrendLine = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "TrendLine";
            _this.createEvents("click");
            _this.isProtected = false;
            _this.dashLength = 0;
            _this.lineColor = "#00CC00";
            _this.lineAlpha = 1;
            _this.lineThickness = 1;
            //_this.finalImage;
            //_this.initialImage;
            AmCharts.applyTheme(_this, theme, _this.cname);
        },

        draw: function() {
            var _this = this;
            _this.destroy();
            var chart = _this.chart;
            var container = chart.container;

            var x1;
            var x2;
            var y1;
            var y2;

            var categoryAxis = _this.categoryAxis;
            var initialDate = _this.initialDate;
            var initialCategory = _this.initialCategory;
            var finalDate = _this.finalDate;
            var finalCategory = _this.finalCategory;
            var valueAxis = _this.valueAxis;
            var valueAxisX = _this.valueAxisX;
            var initialXValue = _this.initialXValue;
            var finalXValue = _this.finalXValue;
            var initialValue = _this.initialValue;
            var finalValue = _this.finalValue;

            var recalculateToPercents = valueAxis.recalculateToPercents;
            var dataDateFormat = chart.dataDateFormat;

            if (categoryAxis) {
                if (initialDate) {
                    initialDate = AmCharts.getDate(initialDate, dataDateFormat, "fff");
                    _this.initialDate = initialDate;
                    x1 = categoryAxis.dateToCoordinate(initialDate);
                }
                if (initialCategory) {
                    x1 = categoryAxis.categoryToCoordinate(initialCategory);
                }
                if (finalDate) {
                    finalDate = AmCharts.getDate(finalDate, dataDateFormat, "fff");
                    _this.finalDate = finalDate;
                    x2 = categoryAxis.dateToCoordinate(finalDate);
                }
                if (finalCategory) {
                    x2 = categoryAxis.categoryToCoordinate(finalCategory);
                }
            }

            if (valueAxisX) {
                if (!recalculateToPercents) {
                    if (!isNaN(initialXValue)) {
                        x1 = valueAxisX.getCoordinate(initialXValue);
                    }
                    if (!isNaN(finalXValue)) {
                        x2 = valueAxisX.getCoordinate(finalXValue);
                    }
                }
            }

            if (valueAxis) {
                if (!recalculateToPercents) {
                    if (!isNaN(initialValue)) {
                        y1 = valueAxis.getCoordinate(initialValue);
                    }
                    if (!isNaN(finalValue)) {
                        y2 = valueAxis.getCoordinate(finalValue);
                    }
                }
            }

            if (!isNaN(x1) && !isNaN(x2) && !isNaN(y1) && !isNaN(y1)) {
                var rotate = chart.rotate;
                var xa;
                var ya;

                if (rotate) {
                    xa = [y1, y2];
                    ya = [x1, x2];
                } else {
                    xa = [x1, x2];
                    ya = [y1, y2];
                }

                var lineColor = _this.lineColor;
                var line = AmCharts.line(container, xa, ya, lineColor, _this.lineAlpha, _this.lineThickness, _this.dashLength);

                var xArray = xa;
                var yArray = ya;

                var a = (xa[1] - xa[0]);
                var b = (ya[1] - ya[0]);
                if (a === 0) {
                    a = 0.01;
                }

                if (b === 0) {
                    b = 0.01;
                }

                var signX = a / Math.abs(a);
                var signY = b / Math.abs(b);

                var sign = (a * b) / Math.abs(a * b);

                var c = sign * Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

                var delta = 5;

                var angle1 = Math.asin(a / c);
                var angle2 = 90 * Math.PI / 180 - angle1;

                var dy = Math.abs(Math.cos(angle2) * delta);
                var dx = Math.abs(Math.sin(angle2) * delta);


                xArray.push(xa[1] - signX * dx, xa[0] - signX * dx);
                yArray.push(ya[1] + signY * dy, ya[0] + signY * dy);

                var hoverLine = AmCharts.polygon(container, xArray, yArray, lineColor, 0.005, 0);

                var set = container.set([hoverLine, line]);
                set.translate(chart.marginLeftReal, chart.marginTopReal);
                chart.trendLinesSet.push(set);

                AmCharts.setCN(chart, line, "trend-line");
                AmCharts.setCN(chart, line, "trend-line-" + _this.id);

                _this.line = line;
                _this.set = set;

                var initialImage = _this.initialImage;
                if (initialImage) {
                    initialImage = AmCharts.processObject(initialImage, AmCharts.Image, _this.theme);
                    initialImage.chart = chart;
                    initialImage.draw();
                    initialImage.translate(xArray[0] + initialImage.offsetX, yArray[0] + initialImage.offsetY);
                    set.push(initialImage.set);
                }

                var finalImage = _this.finalImage;
                if (finalImage) {
                    finalImage = AmCharts.processObject(finalImage, AmCharts.Image, _this.theme);
                    finalImage.chart = chart;
                    finalImage.draw();
                    finalImage.translate(xArray[1] + finalImage.offsetX, yArray[1] + finalImage.offsetY);
                    set.push(finalImage.set);
                }

                hoverLine.mouseup(function() {
                    _this.handleLineClick();
                }).mouseover(function() {
                    _this.handleLineOver();
                }).mouseout(function() {
                    _this.handleLineOut();
                });

                if (hoverLine.touchend) {
                    hoverLine.touchend(function() {
                        _this.handleLineClick();
                    });
                }

                set.clipRect(0, 0, chart.plotAreaWidth, chart.plotAreaHeight);
            }
        },

        handleLineClick: function() {
            var _this = this;
            var event = {
                type: "click",
                trendLine: this,
                chart: _this.chart
            };
            _this.fire(event);
        },

        handleLineOver: function() {
            var _this = this;
            var rollOverColor = _this.rollOverColor;

            if (rollOverColor !== undefined) {
                _this.line.attr({
                    stroke: rollOverColor
                });
            }
            if (_this.balloonText) {
                clearTimeout(_this.chart.hoverInt);
                var bbox = _this.line.getBBox();
                var x = _this.x + bbox.x + bbox.width / 2;
                var y = _this.y + bbox.y + bbox.height / 2;
                _this.chart.showBalloon(_this.balloonText, _this.lineColor, true, x, y);
            }
        },

        handleLineOut: function() {
            var _this = this;
            _this.line.attr({
                stroke: _this.lineColor
            });
            if (_this.balloonText) {
                _this.chart.hideBalloon();
            }
        },

        destroy: function() {
            AmCharts.remove(this.set);
        }
    });
})();
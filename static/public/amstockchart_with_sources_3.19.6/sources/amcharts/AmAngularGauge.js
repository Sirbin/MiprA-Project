(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.AmAngularGauge = AmCharts.Class({

        inherits: AmCharts.AmChart,

        construct: function(theme) {
            var _this = this;
            _this.cname = "AmAngularGauge";
            AmCharts.AmAngularGauge.base.construct.call(_this, theme);

            _this.theme = theme;
            _this.type = "gauge";
            _this.marginLeft = 10;
            _this.marginTop = 10;
            _this.marginBottom = 10;
            _this.marginRight = 10;
            _this.minRadius = 10;

            _this.faceColor = "#FAFAFA";
            _this.faceAlpha = 0;
            _this.faceBorderWidth = 1;
            _this.faceBorderColor = "#555555";
            _this.faceBorderAlpha = 0;
            //_this.facePattern;

            _this.arrows = [];
            _this.axes = [];
            _this.startDuration = 1;
            _this.startEffect = "easeOutSine";
            _this.adjustSize = true;
            _this.extraWidth = 0;
            _this.extraHeight = 0;

            // _this.gaugeX;
            // _this.gaugeY;
            AmCharts.applyTheme(_this, theme, _this.cname);
        },

        addAxis: function(axis) {
            this.axes.push(axis);
        },

        formatString: function(text, dItem) {
            var _this = this;
            text = AmCharts.formatValue(text, dItem, ["value"], _this.nf, "", _this.usePrefixes, _this.prefixesOfSmallNumbers, _this.prefixesOfBigNumbers);
            return text;
        },

        initChart: function() {

            var _this = this;
            AmCharts.AmAngularGauge.base.initChart.call(_this);

            var axis;
            if (_this.axes.length === 0) {
                axis = new AmCharts.GaugeAxis(_this.theme);
                _this.addAxis(axis);
            }

            var i;

            for (i = 0; i < _this.axes.length; i++) {
                axis = _this.axes[i];
                axis = AmCharts.processObject(axis, AmCharts.GaugeAxis, _this.theme);
                if (!axis.id) {
                    axis.id = "axisAuto" + i + "_" + new Date().getTime();
                }
                axis.chart = _this;
                _this.axes[i] = axis;
            }


            var arrow;
            var arrows = _this.arrows;

            for (i = 0; i < arrows.length; i++) {
                arrow = arrows[i];

                arrow = AmCharts.processObject(arrow, AmCharts.GaugeArrow, _this.theme);
                if (!arrow.id) {
                    arrow.id = "arrowAuto" + i + "_" + new Date().getTime();
                }
                arrow.chart = _this;
                arrows[i] = arrow;

                var arrowAxis = arrow.axis;
                if (AmCharts.isString(arrowAxis)) {
                    arrow.axis = AmCharts.getObjById(_this.axes, arrowAxis);
                }

                if (!arrow.axis) {
                    arrow.axis = _this.axes[0];
                }
                if (isNaN(arrow.value)) {
                    arrow.setValue(arrow.axis.startValue);
                }
                if (isNaN(arrow.previousValue)) {
                    arrow.previousValue = arrow.axis.startValue;
                }
            }
            _this.setLegendData(arrows);
            _this.drawChart();
            _this.totalFrames = _this.startDuration * AmCharts.updateRate;
        },


        drawChart: function() {
            var _this = this;
            AmCharts.AmAngularGauge.base.drawChart.call(_this);

            var container = _this.container;
            var realWidth = _this.updateWidth();
            _this.realWidth = realWidth;

            var realHeight = _this.updateHeight();
            _this.realHeight = realHeight;

            var toCoordinate = AmCharts.toCoordinate;
            var marginLeft = toCoordinate(_this.marginLeft, realWidth);
            var marginRight = toCoordinate(_this.marginRight, realWidth);
            var marginTop = toCoordinate(_this.marginTop, realHeight) + _this.getTitleHeight();
            var marginBottom = toCoordinate(_this.marginBottom, realHeight);

            var radius = toCoordinate(_this.radius, realWidth, realHeight);
            var pureWidth = realWidth - marginLeft - marginRight;
            var pureHeight = realHeight - marginTop - marginBottom + _this.extraHeight;

            if (!radius) {
                radius = Math.min(pureWidth, pureHeight) / 2;
            }

            if (radius < _this.minRadius) {
                radius = _this.minRadius;
            }
            _this.radiusReal = radius;

            _this.centerX = (realWidth - marginLeft - marginRight) / 2 + marginLeft;
            _this.centerY = (realHeight - marginTop - marginBottom) / 2 + marginTop + _this.extraHeight / 2;

            if (!isNaN(_this.gaugeX)) {
                _this.centerX = _this.gaugeX;
            }

            if (!isNaN(_this.gaugeY)) {
                _this.centerY = _this.gaugeY;
            }

            var circleAlpha = _this.faceAlpha;
            var circleBorderAlpha = _this.faceBorderAlpha;
            var background;

            if (circleAlpha > 0 || circleBorderAlpha > 0) {
                background = AmCharts.circle(container, radius, _this.faceColor, circleAlpha, _this.faceBorderWidth, _this.faceBorderColor, circleBorderAlpha, false);
                background.translate(_this.centerX, _this.centerY);
                background.toBack();

                var facePattern = _this.facePattern;

                if (facePattern) {
                    background.pattern(facePattern, NaN, _this.path);
                }
            }

            var maxWidth = 0;
            var maxHeight = 0;
            var i;
            for (i = 0; i < _this.axes.length; i++) {
                var axis = _this.axes[i];
                var axisRadius = axis.radius;
                axis.radiusReal = AmCharts.toCoordinate(axisRadius, _this.radiusReal);
                axis.draw();

                var dp = 1;

                if (String(axisRadius).indexOf("%") !== -1) {
                    dp = 1 + (100 - Number(axisRadius.substr(0, axisRadius.length - 1))) / 100;
                }

                if (axis.width * dp > maxWidth) {
                    maxWidth = axis.width * dp;
                }

                if (axis.height * dp > maxHeight) {
                    maxHeight = axis.height * dp;
                }
            }

            var legend = _this.legend;

            if (legend) {
                legend.invalidateSize();
            }

            if (_this.adjustSize && !_this.sizeAdjusted) {
                if (background) {
                    var bgBox = background.getBBox();
                    if (bgBox.width > maxWidth) {
                        maxWidth = bgBox.width;
                    }
                    if (bgBox.height > maxHeight) {
                        maxHeight = bgBox.height;
                    }
                }

                var emptySpace = 0;
                if (pureHeight > maxHeight || pureWidth > maxWidth) {
                    emptySpace = Math.min(pureHeight - maxHeight, pureWidth - maxWidth);
                }
                if (emptySpace > 0) {
                    //_this.extraWidth = pureWidth - maxWidth;
                    _this.extraHeight = pureHeight - maxHeight;
                    _this.sizeAdjusted = true;
                    _this.validateNow();
                }
            }

            var n = _this.arrows.length;
            var arrow;

            for (i = 0; i < n; i++) {
                arrow = _this.arrows[i];
                arrow.drawnAngle = NaN;
            }

            _this.dispDUpd();
        },

        validateSize: function() {
            var _this = this;
            _this.extraWidth = 0;
            _this.extraHeight = 0;
            _this.sizeAdjusted = false;
            _this.chartCreated = false;
            AmCharts.AmAngularGauge.base.validateSize.call(_this);
        },

        addArrow: function(arrow) {
            var _this = this;
            _this.arrows.push(arrow);
        },

        removeArrow: function(arrow) {
            var _this = this;

            AmCharts.removeFromArray(_this.arrows, arrow);
            _this.validateNow();
        },


        removeAxis: function(axis) {
            var _this = this;

            AmCharts.removeFromArray(_this.axes, axis);
            _this.validateNow();
        },


        drawArrow: function(arrow, angle) {
            // ARROW
            var _this = this;
            var bcn = "gauge-arrow";
            if (arrow.set) {
                arrow.set.remove();
            }
            var container = _this.container;
            arrow.set = container.set();
            AmCharts.setCN(_this, arrow.set, bcn);
            AmCharts.setCN(_this, arrow.set, bcn + "-" + arrow.id);

            if (!arrow.hidden) {
                var axis = arrow.axis;
                var radius = axis.radiusReal;

                var centerX = axis.centerXReal;
                var centerY = axis.centerYReal;
                var arrowStartWidth = arrow.startWidth;
                var arrowEndWidth = arrow.endWidth;
                var arrowInnerRadius = AmCharts.toCoordinate(arrow.innerRadius, axis.radiusReal);
                var arrowRadius = AmCharts.toCoordinate(arrow.radius, axis.radiusReal);

                if (!axis.inside) {
                    arrowRadius -= 15;
                }



                var nailColor = arrow.nailColor;
                if (!nailColor) {
                    nailColor = arrow.color;
                }

                var borderColor = arrow.nailColor;
                if (!borderColor) {
                    borderColor = arrow.color;
                }

                if (arrow.nailRadius > 0) {
                    var arrowNail = AmCharts.circle(container, arrow.nailRadius, nailColor, arrow.nailAlpha, arrow.nailBorderThickness, nailColor, arrow.nailBorderAlpha);
                    AmCharts.setCN(_this, arrowNail, bcn + "-nail");

                    arrow.set.push(arrowNail);
                    arrowNail.translate(centerX, centerY);
                }

                if (isNaN(arrowRadius)) {
                    arrowRadius = radius - axis.tickLength;
                }

                var sin = Math.sin((angle) / (180) * Math.PI);
                var cos = Math.cos((angle) / (180) * Math.PI);

                var sin2 = Math.sin((angle + 90) / (180) * Math.PI);
                var cos2 = Math.cos((angle + 90) / (180) * Math.PI);

                var ax = [centerX - arrowStartWidth / 2 * sin2 + arrowInnerRadius * sin, centerX + arrowRadius * sin - arrowEndWidth / 2 * sin2, centerX + arrowRadius * sin + arrowEndWidth / 2 * sin2, centerX + arrowStartWidth / 2 * sin2 + arrowInnerRadius * sin];
                var ay = [centerY + arrowStartWidth / 2 * cos2 - arrowInnerRadius * cos, centerY - arrowRadius * cos + arrowEndWidth / 2 * cos2, centerY - arrowRadius * cos - arrowEndWidth / 2 * cos2, centerY - arrowStartWidth / 2 * cos2 - arrowInnerRadius * cos];
                var arrowGraphics = AmCharts.polygon(container, ax, ay, arrow.color, arrow.alpha, 1, borderColor, arrow.borderAlpha, undefined, true);

                AmCharts.setCN(_this, arrowGraphics, bcn);

                arrow.set.push(arrowGraphics);

                _this.graphsSet.push(arrow.set);
            }
        },

        setValue: function(arrow, value) {
            var _this = this;
            if (arrow.axis) {
                if (arrow.axis.value2angle) {
                    arrow.frame = 0;
                    arrow.previousValue = arrow.value;
                }
            }
            arrow.value = value;

            var legend = _this.legend;
            if (legend) {
                legend.updateValues();
            }
        },

        handleLegendEvent: function(event) {
            var _this = this;
            var type = event.type;
            var dItem = event.dataItem;

            if (!_this.legend.data) {
                if (dItem) {
                    switch (type) {
                        case "hideItem":
                            _this.hideArrow(dItem);
                            break;
                        case "showItem":
                            _this.showArrow(dItem);
                            break;
                    }
                }
            }
        },

        hideArrow: function(arrow) {
            arrow.set.hide();
            arrow.hidden = true;
        },

        showArrow: function(arrow) {
            arrow.set.show();
            arrow.hidden = false;
        },

        updateAnimations: function() {
            var _this = this;
            AmCharts.AmAngularGauge.base.updateAnimations.call(_this);
            var n = _this.arrows.length;
            var arrow;
            for (var i = 0; i < n; i++) {
                arrow = _this.arrows[i];
                if (arrow.axis) {
                    if (arrow.axis.value2angle) {
                        var value;
                        if (arrow.frame >= _this.totalFrames) {
                            value = arrow.value;
                        } else {
                            arrow.frame++;

                            if (arrow.clockWiseOnly) {
                                if (arrow.value < arrow.previousValue) {
                                    var axis = arrow.axis;
                                    arrow.previousValue = arrow.previousValue - (axis.endValue - axis.startValue);
                                }
                            }
                            var effect = AmCharts.getEffect(_this.startEffect);
                            value = AmCharts[effect](0, arrow.frame, arrow.previousValue, arrow.value - arrow.previousValue, _this.totalFrames);

                            if (isNaN(value)) {
                                value = arrow.value;
                            }
                        }

                        var angle = arrow.axis.value2angle(value);
                        if (arrow.drawnAngle != angle) {
                            _this.drawArrow(arrow, angle);
                            arrow.drawnAngle = angle;
                        }
                    }
                }
            }

        }
    });
})();
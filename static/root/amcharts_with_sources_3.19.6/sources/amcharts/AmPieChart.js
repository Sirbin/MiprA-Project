(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.AmPieChart = AmCharts.Class({

        inherits: AmCharts.AmSlicedChart,

        construct: function(theme) {
            var _this = this;
            _this.type = "pie";
            AmCharts.AmPieChart.base.construct.call(_this, theme);

            _this.cname = "AmPieChart";
            _this.pieBrightnessStep = 30;
            _this.minRadius = 10;
            _this.depth3D = 0;
            _this.startAngle = 90;
            _this.innerRadius = 0;
            _this.angle = 0;
            _this.startRadius = "500%";
            _this.pullOutRadius = "20%";
            _this.labelRadius = 20;
            _this.labelText = "[[title]]: [[percents]]%";
            _this.balloonText = "[[title]]: [[percents]]% ([[value]])\n[[description]]";
            _this.previousScale = 1;
            _this.adjustPrecision = false;
            _this.gradientType = "radial";
            AmCharts.applyTheme(_this, theme, _this.cname);
        },

        drawChart: function() {

            var _this = this;

            AmCharts.AmPieChart.base.drawChart.call(_this);
            var chartData = _this.chartData;

            if (AmCharts.ifArray(chartData)) {
                if (_this.realWidth > 0 && _this.realHeight > 0) {
                    if (AmCharts.VML) {
                        _this.startAlpha = 1;
                    }

                    var startDuration = _this.startDuration;
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

                    var pieX;
                    var pieY;
                    var radius;
                    var labelRadius = AmCharts.toNumber(_this.labelRadius);
                    var labelWidth = _this.measureMaxLabel();

                    if (labelWidth > _this.maxLabelWidth) {
                        labelWidth = _this.maxLabelWidth;
                    }

                    var pullOutRadiusReal;

                    if (!_this.labelText || !_this.labelsEnabled) {
                        labelWidth = 0;
                        labelRadius = 0;
                    }

                    if (_this.pieX === undefined) {
                        pieX = (realWidth - marginLeft - marginRight) / 2 + marginLeft;
                    } else {
                        pieX = toCoordinate(_this.pieX, _this.realWidth);
                    }

                    if (_this.pieY === undefined) {
                        pieY = (realHeight - marginTop - marginBottom) / 2 + marginTop;
                    } else {
                        pieY = toCoordinate(_this.pieY, realHeight);
                    }

                    radius = toCoordinate(_this.radius, realWidth, realHeight);

                    // if radius is not defined, calculate from margins
                    if (!radius) {
                        var pureWidth;

                        if (labelRadius >= 0) {
                            pureWidth = realWidth - marginLeft - marginRight - labelWidth * 2;
                        } else {
                            pureWidth = realWidth - marginLeft - marginRight;
                        }

                        var pureHeight = realHeight - marginTop - marginBottom;
                        radius = Math.min(pureWidth, pureHeight);

                        if (pureHeight < pureWidth) {
                            radius = radius / (1 - _this.angle / 90);

                            if (radius > pureWidth) {
                                radius = pureWidth;
                            }
                        }

                        pullOutRadiusReal = AmCharts.toCoordinate(_this.pullOutRadius, radius);

                        if (labelRadius >= 0) {
                            radius -= (labelRadius + pullOutRadiusReal) * 1.8;
                        } else {
                            radius -= pullOutRadiusReal * 1.8;
                        }
                        radius = radius / 2;
                    }

                    if (radius < _this.minRadius) {
                        radius = _this.minRadius;
                    }

                    pullOutRadiusReal = toCoordinate(_this.pullOutRadius, radius);
                    var startRadius = AmCharts.toCoordinate(_this.startRadius, radius);
                    var innerRadius = toCoordinate(_this.innerRadius, radius);

                    if (innerRadius >= radius) {
                        innerRadius = radius - 1;
                    }

                    var startAngle = AmCharts.fitToBounds(_this.startAngle, 0, 360);

                    // in case the pie has 3D depth, start angle can only be equal to 90 or 270
                    if (_this.depth3D > 0) {
                        if (startAngle >= 270) {
                            startAngle = 270;

                        } else {
                            startAngle = 90;
                        }
                    }

                    startAngle -= 90;

                    if (startAngle > 360) {
                        startAngle -= 360;
                    }

                    var yRadius = radius - radius * _this.angle / 90;
                    var i;
                    var sum = 0;
                    var dItem;
                    for (i = 0; i < chartData.length; i++) {
                        dItem = chartData[i];
                        if (dItem.hidden !== true) {
                            sum += AmCharts.roundTo(dItem.percents, _this.pf.precision);
                        }
                    }

                    sum = AmCharts.roundTo(sum, _this.pf.precision);

                    _this.tempPrec = NaN;
                    if (_this.adjustPrecision) {
                        if (sum != 100) {
                            _this.tempPrec = _this.pf.precision + 1;
                        }
                    }
                    var flipAfter;
                    for (i = 0; i < chartData.length; i++) {
                        dItem = chartData[i];

                        if (dItem.hidden !== true) {
                            if (!_this.showZeroSlices && dItem.percents === 0) {
                                // void
                            } else {
                                // SLICE
                                var arc = dItem.percents * 360 / 100;
                                var ix = Math.sin((startAngle + arc / 2) / 180 * Math.PI);
                                var iy = -Math.cos((startAngle + arc / 2) / 180 * Math.PI) * (yRadius / radius);

                                var outlineColor = _this.outlineColor;
                                if (!outlineColor) {
                                    outlineColor = dItem.color;
                                }

                                var alpha = _this.alpha;
                                if (!isNaN(dItem.alpha)) {
                                    alpha = dItem.alpha;
                                }

                                var wattr = {
                                    "fill": dItem.color,
                                    "stroke": outlineColor,
                                    "stroke-width": _this.outlineThickness,
                                    "stroke-opacity": _this.outlineAlpha,
                                    "fill-opacity": alpha
                                };

                                if (dItem.url) {
                                    wattr.cursor = "pointer";
                                }

                                var xx = pieX;
                                var yy = pieY;

                                var wedge = AmCharts.wedge(container, xx, yy, startAngle, arc, radius, yRadius, innerRadius, _this.depth3D, wattr, _this.gradientRatio, dItem.pattern, _this.path, _this.gradientType);
                                AmCharts.setCN(_this, wedge, "pie-item");
                                AmCharts.setCN(_this, wedge.wedge, "pie-slice");
                                AmCharts.setCN(_this, wedge, dItem.className, true);
                                _this.addEventListeners(wedge, dItem);

                                dItem.startAngle = startAngle;

                                chartData[i].wedge = wedge;
                                if (startDuration > 0) {
                                    if (!_this.chartCreated) {
                                        wedge.setAttr("opacity", _this.startAlpha);
                                    }
                                }

                                // x and y vectors
                                dItem.ix = ix;
                                dItem.iy = iy;
                                dItem.wedge = wedge;
                                dItem.index = i;
                                dItem.label = null;
                                var labelSet = container.set();

                                // LABEL ////////////////////////////////////////////////////////
                                if (_this.labelsEnabled && _this.labelText && dItem.percents >= _this.hideLabelsPercent) {
                                    var labelAngle = startAngle + arc / 2;
                                    if (labelAngle < 0) {
                                        labelAngle += 360;
                                    }

                                    if (labelAngle > 360) {
                                        labelAngle -= 360;
                                    }

                                    var labelRadiusReal = labelRadius;
                                    if (!isNaN(dItem.labelRadius)) {
                                        labelRadiusReal = dItem.labelRadius;

                                        if (labelRadiusReal < 0) {
                                            dItem.skipTick = true;
                                        }
                                    }

                                    var tx = pieX + ix * (radius + labelRadiusReal);
                                    var ty = pieY + iy * (radius + labelRadiusReal);

                                    var align;
                                    var tickL = 0;

                                    if (isNaN(flipAfter)) {
                                        if (labelAngle > 350 && chartData.length - i > 1) {
                                            flipAfter = i - 1 + Math.floor((chartData.length - i) / 2);
                                        }
                                    }

                                    if (labelRadiusReal >= 0) {
                                        var labelQuarter;
                                        //q0
                                        if (labelAngle <= 90 && labelAngle >= 0) {
                                            labelQuarter = 0;
                                            align = "start";
                                            tickL = 8;
                                        }
                                        //q1
                                        else if (labelAngle >= 90 && labelAngle < 180) {
                                            labelQuarter = 1;
                                            align = "start";
                                            tickL = 8;
                                        }
                                        //q2
                                        else if (labelAngle >= 180 && labelAngle < 270) {
                                            labelQuarter = 2;
                                            align = "end";
                                            tickL = -8;
                                        }
                                        //q3
                                        else if ((labelAngle >= 270 && labelAngle <= 354)) {
                                            labelQuarter = 3;
                                            align = "end";
                                            tickL = -8;
                                        }
                                        //q0 again
                                        else if ((labelAngle >= 354)) {
                                            if (i > flipAfter) {
                                                labelQuarter = 0;
                                                align = "start";
                                                tickL = 8;
                                            } else {
                                                labelQuarter = 3;
                                                align = "end";
                                                tickL = -8;
                                            }
                                        }

                                        dItem.labelQuarter = labelQuarter;
                                    } else {
                                        align = "middle";
                                    }

                                    var text = _this.formatString(_this.labelText, dItem);

                                    var labelFunction = _this.labelFunction;
                                    if (labelFunction) {
                                        text = labelFunction(dItem, text);
                                    }

                                    var labelColor = dItem.labelColor;
                                    if (!labelColor) {
                                        labelColor = _this.color;
                                    }


                                    if (text !== "") {
                                        var txt = AmCharts.wrappedText(container, text, labelColor, _this.fontFamily, _this.fontSize, align, false, _this.maxLabelWidth);
                                        AmCharts.setCN(_this, txt, "pie-label");
                                        AmCharts.setCN(_this, txt, dItem.className, true);
                                        txt.translate(tx + tickL * 1.5, ty);
                                        txt.node.style.pointerEvents = "none";
                                        dItem.ty = ty;
                                        dItem.textX = tx + tickL * 1.5;


                                        // var tbox = txt.getBBox();
                                        // var hitRect = AmCharts.rect(container, tbox.width + 5, tbox.height + 5, "#ccFFFF", 0.5);
                                        // hitRect.translate(tx + tickL * 1.5 + tbox.x, ty + tbox.y);
                                        // dItem.hitRect = hitRect;
                                        labelSet.push(txt);
                                        // labelSet.push(hitRect);

                                        _this.axesSet.push(labelSet);
                                        dItem.labelSet = labelSet;

                                        dItem.label = txt;
                                    }
                                    dItem.tx = tx;
                                    dItem.tx2 = tx + tickL;

                                    dItem.tx0 = pieX + ix * radius;
                                    dItem.ty0 = pieY + iy * radius;
                                }
                                var rad = innerRadius + (radius - innerRadius) / 2;
                                if (dItem.pulled) {
                                    rad += _this.pullOutRadiusReal;
                                }

                                dItem.balloonX = ix * rad + pieX;
                                dItem.balloonY = iy * rad + pieY;

                                dItem.startX = Math.round(ix * startRadius);
                                dItem.startY = Math.round(iy * startRadius);
                                dItem.pullX = Math.round(ix * pullOutRadiusReal);
                                dItem.pullY = Math.round(iy * pullOutRadiusReal);
                                _this.graphsSet.push(wedge);

                                if (dItem.alpha === 0 || (startDuration > 0 && !_this.chartCreated)) {
                                    wedge.hide();

                                    if (labelSet) {
                                        labelSet.hide();
                                    }
                                }

                                // get start angle of next slice
                                startAngle += dItem.percents * 360 / 100;
                                if (startAngle > 360) {
                                    startAngle -= 360;
                                }
                            }
                        }
                    }

                    if (labelRadius > 0) {
                        _this.arrangeLabels();
                    }

                    _this.pieXReal = pieX;
                    _this.pieYReal = pieY;
                    _this.radiusReal = radius;
                    _this.innerRadiusReal = innerRadius;

                    if (labelRadius > 0) {
                        _this.drawTicks();
                    }

                    _this.initialStart();

                    _this.setDepths();
                }

                var legend = _this.legend;

                if (legend) {
                    legend.invalidateSize();
                }
            } else {
                _this.cleanChart();
            }
            _this.dispDUpd();
        },


        setDepths: function() {
            var chartData = this.chartData;
            var i;

            for (i = 0; i < chartData.length; i++) {
                var dItem = chartData[i];
                var wedge = dItem.wedge;
                var startAngle = dItem.startAngle;
                // find quarter
                //q0 || q1
                if ((startAngle >= 0 && startAngle < 180)) {
                    wedge.toFront();
                }
                //q2 || q3
                else if ((startAngle >= 180)) {
                    wedge.toBack();
                }
            }
        },


        arrangeLabels: function() {
            var _this = this;
            var chartData = _this.chartData;
            var count = chartData.length;
            var dItem;

            // q0
            var i;
            for (i = count - 1; i >= 0; i--) {
                dItem = chartData[i];
                if (dItem.labelQuarter === 0 && !dItem.hidden) {
                    _this.checkOverlapping(i, dItem, 0, true, 0);
                }
            }
            // q1
            for (i = 0; i < count; i++) {
                dItem = chartData[i];
                if (dItem.labelQuarter == 1 && !dItem.hidden) {
                    _this.checkOverlapping(i, dItem, 1, false, 0);
                }
            }
            // q2
            for (i = count - 1; i >= 0; i--) {
                dItem = chartData[i];
                if (dItem.labelQuarter == 2 && !dItem.hidden) {
                    _this.checkOverlapping(i, dItem, 2, true, 0);
                }
            }
            // q3
            for (i = 0; i < count; i++) {
                dItem = chartData[i];

                if (dItem.labelQuarter == 3 && !dItem.hidden) {
                    _this.checkOverlapping(i, dItem, 3, false, 0);
                }
            }
        },

        checkOverlapping: function(index, dItem, quarter, backwards, count) {
            var _this = this;
            var overlapping;
            var i;
            var chartData = _this.chartData;
            var length = chartData.length;
            var label = dItem.label;

            if (label) {
                if (backwards === true) {
                    for (i = index + 1; i < length; i++) {
                        if (chartData[i].labelQuarter == quarter) {
                            overlapping = _this.checkOverlappingReal(dItem, chartData[i], quarter);
                            if (overlapping) {
                                i = length;
                            }
                        }
                    }
                } else {
                    for (i = index - 1; i >= 0; i--) {
                        if (chartData[i].labelQuarter == quarter) {
                            overlapping = _this.checkOverlappingReal(dItem, chartData[i], quarter);
                            if (overlapping) {
                                i = 0;
                            }
                        }
                    }
                }

                if (overlapping === true && count < 100 && isNaN(dItem.labelRadius)) {
                    var newY = dItem.ty + (dItem.iy * 3);
                    dItem.ty = newY;
                    label.translate(dItem.textX, newY);
                    //          if (dItem.hitRect) {
                    //              var bbox = label.getBBox();
                    //              dItem.hitRect.translate(dItem.tx2, newY + bbox.y);
                    //          }
                    _this.checkOverlapping(index, dItem, quarter, backwards, count + 1);
                }
            }
        },

        checkOverlappingReal: function(dItem1, dItem2, quarter) {
            var overlapping = false;
            var label1 = dItem1.label;
            var label2 = dItem2.label;

            if (dItem1.labelQuarter == quarter && !dItem1.hidden && !dItem2.hidden && label2) {
                var bb1 = label1.getBBox();

                var bbox1 = {};
                bbox1.width = bb1.width;
                bbox1.height = bb1.height;
                bbox1.y = dItem1.ty;
                bbox1.x = dItem1.tx;


                var bb2 = label2.getBBox();
                var bbox2 = {};
                bbox2.width = bb2.width;
                bbox2.height = bb2.height;
                bbox2.y = dItem2.ty;
                bbox2.x = dItem2.tx;

                if (AmCharts.hitTest(bbox1, bbox2)) {
                    overlapping = true;
                }
            }
            return overlapping;
        }

    });
})();
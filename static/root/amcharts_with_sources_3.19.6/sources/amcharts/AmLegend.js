(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.AmLegend = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.enabled = true;
            _this.cname = "AmLegend";
            _this.createEvents("rollOverMarker", "rollOverItem", "rollOutMarker", "rollOutItem", "showItem", "hideItem", "clickMarker", "rollOverItem", "rollOutItem", "clickLabel");
            _this.position = "bottom";
            _this.color = "#000000";
            _this.borderColor = "#000000";
            _this.borderAlpha = 0;
            _this.markerLabelGap = 5;
            _this.verticalGap = 10;
            _this.align = "left";
            _this.horizontalGap = 0;
            _this.spacing = 10;
            _this.markerDisabledColor = "#AAB3B3";
            _this.markerType = "square";
            _this.markerSize = 16;
            _this.markerBorderAlpha = 1;
            _this.markerBorderThickness = 1;
            _this.marginTop = 0;
            _this.marginBottom = 0;
            _this.marginRight = 20;
            _this.marginLeft = 20;
            _this.autoMargins = true;
            _this.valueWidth = 50;
            _this.switchable = true;
            _this.switchType = "x";
            _this.switchColor = "#FFFFFF";
            _this.rollOverColor = "#CC0000";
            _this.reversedOrder = false;
            _this.labelText = "[[title]]";
            _this.valueText = "[[value]]";
            _this.useMarkerColorForLabels = false;
            _this.rollOverGraphAlpha = 1;
            _this.textClickEnabled = false;
            _this.equalWidths = true;
            _this.backgroundColor = "#FFFFFF";
            _this.backgroundAlpha = 0;
            _this.useGraphSettings = false;
            _this.showEntries = true;
            //_this.gradientRotation;
            AmCharts.applyTheme(_this, theme, _this.cname);
        },

        setData: function(data) {
            var _this = this;
            _this.legendData = data;
            _this.invalidateSize();
        },

        invalidateSize: function() {
            var _this = this;
            _this.destroy();
            _this.entries = [];
            _this.valueLabels = [];

            var data = _this.legendData;
            if (_this.enabled) {
                if (AmCharts.ifArray(data) || AmCharts.ifArray(_this.data)) {
                    _this.drawLegend();
                }
            }
        },

        drawLegend: function() {
            var _this = this;

            var chart = _this.chart;
            var position = _this.position;
            var width = _this.width;

            var realWidth = chart.divRealWidth;
            var realHeight = chart.divRealHeight;

            var div = _this.div;
            var data = _this.legendData;

            if (_this.data) {
                data = _this.data;
            }

            if (isNaN(_this.fontSize)) {
                _this.fontSize = chart.fontSize;
            }
            _this.maxColumnsReal = _this.maxColumns;
            if (position == "right" || position == "left") {
                _this.maxColumnsReal = 1;

                if (_this.autoMargins) {
                    _this.marginRight = 10;
                    _this.marginLeft = 10;
                }
            } else {
                if (_this.autoMargins) {
                    _this.marginRight = chart.marginRight;
                    _this.marginLeft = chart.marginLeft;
                    var autoMarginOffset = chart.autoMarginOffset;
                    if (position == "bottom") {
                        _this.marginBottom = autoMarginOffset;
                        _this.marginTop = 0;
                    } else {
                        _this.marginTop = autoMarginOffset;
                        _this.marginBottom = 0;
                    }
                }
            }

            var divWidth;

            if (width !== undefined) {
                divWidth = AmCharts.toCoordinate(width, realWidth);
            } else {
                if (position != "right" && position != "left") {
                    divWidth = chart.realWidth;
                } else {
                    if (_this.ieW > 0) {
                        divWidth = _this.ieW;
                    } else {
                        divWidth = chart.realWidth;
                    }
                }
            }

            if (position == "outside") {
                divWidth = div.offsetWidth;
                realHeight = div.offsetHeight;

                if (div.clientHeight) {
                    divWidth = div.clientWidth;
                    realHeight = div.clientHeight;
                }
            } else {
                if (!isNaN(divWidth)) {
                    div.style.width = divWidth + "px";
                }
                div.className = "amChartsLegend " + chart.classNamePrefix + "-legend-div";
            }

            _this.divWidth = divWidth;

            //            if (divWidth > 0 && realHeight > 0) {
            var container = _this.container;
            if (container) {
                container.container.innerHTML = "";
                div.appendChild(container.container);
                container.width = divWidth;
                container.height = realHeight;
                container.setSize(divWidth, realHeight);

                container.addDefs(chart);
            } else {
                container = new AmCharts.AmDraw(div, divWidth, realHeight, chart);
            }
            _this.container = container;

            _this.lx = 0;
            _this.ly = 8;

            var markerSize = _this.markerSize;

            if (markerSize > _this.fontSize) {
                _this.ly = markerSize / 2 - 1;
            }


            if (markerSize > 0) {
                _this.lx += markerSize + _this.markerLabelGap;
            }

            _this.titleWidth = 0;
            var title = this.title;
            if (title) {
                var label = AmCharts.text(_this.container, title, _this.color, chart.fontFamily, _this.fontSize, "start", true);
                AmCharts.setCN(chart, label, "legend-title");
                label.translate(_this.marginLeft, _this.marginTop + _this.verticalGap + _this.ly + 1);
                var titleBBox = label.getBBox();
                _this.titleWidth = titleBBox.width + 15;
                _this.titleHeight = titleBBox.height + 6;
            }

            _this.maxLabelWidth = 0;

            _this.index = 0;

            if (_this.showEntries) {
                var i;
                for (i = 0; i < data.length; i++) {
                    _this.createEntry(data[i]);
                }

                _this.index = 0;

                for (i = 0; i < data.length; i++) {
                    _this.createValue(data[i]);
                }
            }
            _this.arrangeEntries();
            _this.updateValues();
            //            }
        },

        arrangeEntries: function() {
            var _this = this;
            var position = _this.position;
            var marginLeft = _this.marginLeft + _this.titleWidth;
            var marginRight = _this.marginRight;
            var marginTop = _this.marginTop;
            var marginBottom = _this.marginBottom;
            var horizontalGap = _this.horizontalGap;
            var div = _this.div;
            var divWidth = _this.divWidth;
            var maxColumns = _this.maxColumnsReal;
            var verticalGap = _this.verticalGap;
            var spacing = _this.spacing;
            var w = divWidth - marginRight - marginLeft;
            var maxWidth = 0;
            var maxHeight = 0;

            var container = _this.container;

            if (_this.set) {
                _this.set.remove();
            }

            var set = container.set();
            _this.set = set;

            var entriesSet = container.set();
            set.push(entriesSet);

            var entries = _this.entries;
            var bbox;
            var i;
            for (i = 0; i < entries.length; i++) {
                bbox = entries[i].getBBox();
                var ew = bbox.width;
                if (ew > maxWidth) {
                    maxWidth = ew;
                }
                var eh = bbox.height;

                if (eh > maxHeight) {
                    maxHeight = eh;
                }
            }

            var PX = "px";
            var row = 0;
            var column = 0;
            var nextX = horizontalGap;
            var y = 0;
            var maxRowHeight = 0;

            for (i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (_this.reversedOrder) {
                    entry = entries[entries.length - i - 1];
                }

                bbox = entry.getBBox();

                var x;
                if (!_this.equalWidths) {
                    x = nextX;
                    nextX = nextX + bbox.width + horizontalGap + spacing;
                } else {
                    x = column * (maxWidth + spacing + _this.markerLabelGap);
                }

                if (bbox.height > maxRowHeight) {
                    maxRowHeight = bbox.height;
                }

                if (x + bbox.width > w && i > 0 && column !== 0) {
                    row++;
                    column = 0;
                    x = 0;
                    nextX = x + bbox.width + horizontalGap + spacing;
                    y = y + maxRowHeight + verticalGap;
                    maxRowHeight = 0;
                }

                entry.translate(x, y);
                column++;

                if (!isNaN(maxColumns)) {
                    if (column >= maxColumns) {
                        column = 0;
                        row++;
                        y = y + maxRowHeight + verticalGap;
                        nextX = horizontalGap;
                        maxRowHeight = 0;
                    }
                }
                entriesSet.push(entry);
            }

            bbox = entriesSet.getBBox();

            var hh = bbox.height + 2 * verticalGap - 1;
            var ww;

            if (position == "left" || position == "right") {
                ww = bbox.width + 2 * horizontalGap;
                divWidth = ww + marginLeft + marginRight;
                div.style.width = divWidth + PX;
                _this.ieW = divWidth;
            } else {
                ww = divWidth - marginLeft - marginRight - 1;
            }

            var bg = AmCharts.polygon(_this.container, [0, ww, ww, 0], [0, 0, hh, hh], _this.backgroundColor, _this.backgroundAlpha, 1, _this.borderColor, _this.borderAlpha);
            AmCharts.setCN(_this.chart, bg, "legend-bg");
            set.push(bg);

            set.translate(marginLeft, marginTop);

            bg.toBack();
            var ex = horizontalGap;
            if (position == "top" || position == "bottom" || position == "absolute" || position == "outside") {
                if (_this.align == "center") {
                    ex = horizontalGap + (ww - bbox.width) / 2;
                } else if (_this.align == "right") {
                    ex = horizontalGap + ww - bbox.width;
                }
            }

            entriesSet.translate(ex, verticalGap + 1);

            if (this.titleHeight > hh) {
                hh = this.titleHeight;
            }

            var divHeight = hh + marginTop + marginBottom + 1;

            if (divHeight < 0) {
                divHeight = 0;
            }

            if (divHeight > _this.chart.divRealHeight) {
                div.style.top = 0 + PX;
            }

            div.style.height = Math.round(divHeight) + PX;
            container.setSize(_this.divWidth, divHeight);
        },

        createEntry: function(dItem) {
            if (dItem.visibleInLegend !== false && !dItem.hideFromLegend) {
                var _this = this;
                var chart = _this.chart;
                var markerType = dItem.markerType;
                dItem.legendEntryWidth = _this.markerSize;
                if (!markerType) {
                    markerType = _this.markerType;
                }

                var color = dItem.color;
                var alpha = dItem.alpha;

                if (dItem.legendKeyColor) {
                    color = dItem.legendKeyColor();
                }

                if (dItem.legendKeyAlpha) {
                    alpha = dItem.legendKeyAlpha();
                }
                var UNDEFINED;
                var bulletBorderColor;
                if (dItem.hidden === true) {
                    color = _this.markerDisabledColor;
                    bulletBorderColor = color;
                }
                var pattern = dItem.pattern;
                var marker;
                var customMarker = dItem.customMarker;
                if (!customMarker) {
                    customMarker = _this.customMarker;
                }
                var container = _this.container;
                var markerSize = _this.markerSize;
                var dx = 0;
                var dy = 0;
                var markerX = markerSize / 2;
                if (_this.useGraphSettings) {

                    var graphType = dItem.type;
                    _this.switchType = undefined;
                    if (graphType == "line" || graphType == "step" || graphType == "smoothedLine" || graphType == "ohlc") {

                        marker = container.set();

                        if (!dItem.hidden) {
                            color = dItem.lineColorR;
                            bulletBorderColor = dItem.bulletBorderColorR;
                        }

                        var line = AmCharts.line(container, [0, markerSize * 2], [markerSize / 2, markerSize / 2], color, dItem.lineAlpha, dItem.lineThickness, dItem.dashLength);
                        AmCharts.setCN(chart, line, "graph-stroke");
                        marker.push(line);

                        if (dItem.bullet) {
                            if (!dItem.hidden) {
                                color = dItem.bulletColorR;
                            }
                            var bullet = AmCharts.bullet(container, dItem.bullet, dItem.bulletSize, color, dItem.bulletAlpha, dItem.bulletBorderThickness, bulletBorderColor, dItem.bulletBorderAlpha);
                            if (bullet) {
                                AmCharts.setCN(chart, bullet, "graph-bullet");
                                bullet.translate(markerSize + 1, markerSize / 2);
                                marker.push(bullet);
                            }
                        }
                        markerX = 0;
                        dx = markerSize;
                        dy = markerSize / 3;
                    } else {
                        var gradRotation;
                        if (dItem.getGradRotation) {
                            gradRotation = dItem.getGradRotation();
                            if (gradRotation === 0) {
                                gradRotation = 180;
                            }
                        }

                        var fillColors = dItem.fillColorsR;
                        if (dItem.hidden === true) {
                            fillColors = color;
                        }

                        marker = _this.createMarker("rectangle", fillColors, dItem.fillAlphas, dItem.lineThickness, color, dItem.lineAlpha, gradRotation, pattern, dItem.dashLength);
                        if (marker) {
                            markerX = markerSize;
                            marker.translate(markerX, markerSize / 2);
                        }
                        dx = markerSize;
                    }

                    AmCharts.setCN(chart, marker, "graph-" + graphType);
                    AmCharts.setCN(chart, marker, "graph-" + dItem.id);

                } else if (customMarker) {
                    marker = container.image(customMarker, 0, 0, markerSize, markerSize);
                } else {

                    var gradientRotation;
                    if (!isNaN(_this.gradientRotation)) {
                        gradientRotation = 180 + _this.gradientRotation;
                    }

                    marker = _this.createMarker(markerType, color, alpha, UNDEFINED, UNDEFINED, UNDEFINED, gradientRotation, pattern);
                    if (marker) {
                        marker.translate(markerSize / 2, markerSize / 2);
                    }

                }

                AmCharts.setCN(chart, marker, "legend-marker");

                _this.addListeners(marker, dItem);
                var entrySet = container.set([marker]);

                if (_this.switchable && dItem.switchable) {
                    entrySet.setAttr("cursor", "pointer");
                }

                if (dItem.id !== undefined) {
                    AmCharts.setCN(chart, entrySet, "legend-item-" + dItem.id);
                }
                AmCharts.setCN(chart, entrySet, dItem.className, true);

                // switch
                var switchType = _this.switchType;
                var mswitch;
                if (switchType && switchType != "none" && markerSize > 0) {
                    if (switchType == "x") {
                        mswitch = _this.createX();
                        mswitch.translate(markerSize / 2, markerSize / 2);
                    } else {
                        mswitch = _this.createV();
                    }

                    mswitch.dItem = dItem;

                    if (dItem.hidden !== true) {
                        if (switchType == "x") {
                            mswitch.hide();
                        } else {
                            mswitch.show();
                        }
                    } else {
                        if (switchType != "x") {
                            mswitch.hide();
                        }
                    }

                    if (!_this.switchable) {
                        mswitch.hide();
                    }
                    _this.addListeners(mswitch, dItem);
                    dItem.legendSwitch = mswitch;
                    entrySet.push(mswitch);

                    AmCharts.setCN(chart, mswitch, "legend-switch");
                }
                // end of switch
                var tcolor = _this.color;

                if (dItem.showBalloon && _this.textClickEnabled && _this.selectedColor !== undefined) {
                    tcolor = _this.selectedColor;
                }

                if (_this.useMarkerColorForLabels) {
                    tcolor = color;
                }
                if (dItem.hidden === true) {
                    tcolor = _this.markerDisabledColor;
                }

                var txt = AmCharts.massReplace(_this.labelText, {
                    "[[title]]": dItem.title
                });
                var fontSize = _this.fontSize;

                if (marker) {
                    if (markerSize <= fontSize) {
                        var newY = markerSize / 2 + _this.ly - fontSize / 2 + (fontSize + 2 - markerSize) / 2 - dy;
                        marker.translate(markerX, newY);
                        if (mswitch) {
                            mswitch.translate(mswitch.x, newY);
                        }
                    }
                    dItem.legendEntryWidth = marker.getBBox().width;
                }

                var label;
                if (txt) {
                    txt = AmCharts.fixBrakes(txt);
                    dItem.legendTextReal = txt;
                    var labelWidth = _this.labelWidth;

                    if (isNaN(labelWidth)) {
                        label = AmCharts.text(_this.container, txt, tcolor, chart.fontFamily, fontSize, "start");
                    } else {
                        label = AmCharts.wrappedText(_this.container, txt, tcolor, chart.fontFamily, fontSize, "start", false, labelWidth, 0);
                    }
                    AmCharts.setCN(chart, label, "legend-label");

                    label.translate(_this.lx + dx, _this.ly);
                    entrySet.push(label);

                    var bbox = label.getBBox();
                    var lWidth = bbox.width;

                    if (_this.maxLabelWidth < lWidth) {
                        _this.maxLabelWidth = lWidth;
                    }
                }

                _this.entries[_this.index] = entrySet;
                dItem.legendEntry = _this.entries[_this.index];
                dItem.legendLabel = label;
                _this.index++;
            }
        },

        addListeners: function(obj, dItem) {
            var _this = this;
            if (obj) {
                obj.mouseover(function(ev) {
                    _this.rollOverMarker(dItem, ev);
                }).mouseout(function(ev) {
                    _this.rollOutMarker(dItem, ev);
                }).click(function(ev) {
                    _this.clickMarker(dItem, ev);
                });
            }
        },


        rollOverMarker: function(dItem, ev) {
            var _this = this;
            if (_this.switchable) {
                _this.dispatch("rollOverMarker", dItem, ev);
            }
            _this.dispatch("rollOverItem", dItem, ev);
        },

        rollOutMarker: function(dItem, ev) {
            var _this = this;
            if (_this.switchable) {
                _this.dispatch("rollOutMarker", dItem, ev);
            }
            _this.dispatch("rollOutItem", dItem, ev);
        },

        clickMarker: function(dItem, ev) {
            var _this = this;
            if (_this.switchable) {
                if (dItem.hidden === true) {
                    _this.dispatch("showItem", dItem, ev);
                } else {
                    _this.dispatch("hideItem", dItem, ev);
                }
            }
            _this.dispatch("clickMarker", dItem, ev);
        },


        rollOverLabel: function(dItem, ev) {
            var _this = this;
            if (!dItem.hidden) {
                if (_this.textClickEnabled) {
                    if (dItem.legendLabel) {
                        dItem.legendLabel.attr({
                            fill: _this.rollOverColor
                        });
                    }
                }
                _this.dispatch("rollOverItem", dItem, ev);
            }
        },

        rollOutLabel: function(dItem, ev) {
            var _this = this;
            if (!dItem.hidden) {
                if (_this.textClickEnabled) {
                    if (dItem.legendLabel) {
                        var color = _this.color;
                        if (_this.selectedColor !== undefined && dItem.showBalloon) {
                            color = _this.selectedColor;
                        }
                        if (_this.useMarkerColorForLabels) {
                            color = dItem.lineColor;
                            if (color === undefined) {
                                color = dItem.color;
                            }
                        }

                        dItem.legendLabel.attr({
                            fill: color
                        });
                    }
                }
                _this.dispatch("rollOutItem", dItem, ev);
            }
        },

        clickLabel: function(dItem, ev) {
            var _this = this;

            if (_this.textClickEnabled) {
                if (!dItem.hidden) {
                    _this.dispatch("clickLabel", dItem, ev);
                }
            } else if (_this.switchable) {
                if (dItem.hidden === true) {
                    _this.dispatch("showItem", dItem, ev);
                } else {
                    _this.dispatch("hideItem", dItem, ev);
                }
            }
        },

        dispatch: function(name, dItem, ev) {
            var _this = this;
            var evt = {
                type: name,
                dataItem: dItem,
                target: _this,
                event: ev,
                chart: _this.chart
            };
            if (_this.chart) {
                _this.chart.handleLegendEvent(evt);
            }
            _this.fire(evt);
        },

        createValue: function(dItem) {
            var _this = this;
            var fontSize = _this.fontSize;
            var LEFT = "left";
            var chart = _this.chart;
            if (dItem.visibleInLegend !== false && !dItem.hideFromLegend) {
                var labelWidth = _this.maxLabelWidth;

                if (_this.forceWidth) {
                    labelWidth = _this.labelWidth;
                }

                if (!_this.equalWidths) {
                    _this.valueAlign = LEFT;
                }

                if (_this.valueAlign == LEFT) {
                    labelWidth = dItem.legendEntry.getBBox().width;
                }

                var hitW = labelWidth;
                if (_this.valueText && _this.valueWidth > 0) {
                    var tcolor = _this.color;
                    if (_this.useMarkerColorForValues) {
                        tcolor = dItem.color;
                        if (dItem.legendKeyColor) {
                            tcolor = dItem.legendKeyColor();
                        }
                    }

                    if (dItem.hidden === true) {
                        tcolor = _this.markerDisabledColor;
                    }

                    var txt = _this.valueText;
                    var x = labelWidth + _this.lx + _this.markerLabelGap + _this.valueWidth;

                    var anchor = "end";
                    if (_this.valueAlign == LEFT) {
                        x -= _this.valueWidth;
                        anchor = "start";
                    }

                    var vlabel = AmCharts.text(_this.container, txt, tcolor, _this.chart.fontFamily, fontSize, anchor);
                    AmCharts.setCN(chart, vlabel, "legend-value");
                    vlabel.translate(x, _this.ly);
                    _this.entries[_this.index].push(vlabel);

                    hitW += _this.valueWidth + _this.markerLabelGap * 2;

                    vlabel.dItem = dItem;
                    _this.valueLabels.push(vlabel);
                }

                _this.index++;
                var hitH = _this.markerSize;
                if (hitH < fontSize + 7) {
                    hitH = fontSize + 7;
                    if (AmCharts.VML) {
                        hitH += 3;
                    }
                }
                var hitRect = _this.container.rect(dItem.legendEntryWidth, 0, hitW, hitH, 0, 0).attr({
                    "stroke": "none",
                    "fill": "#fff",
                    "fill-opacity": 0.005
                });

                hitRect.dItem = dItem;

                _this.entries[_this.index - 1].push(hitRect);
                hitRect.mouseover(function(ev) {
                    _this.rollOverLabel(dItem, ev);
                }).mouseout(function(ev) {
                    _this.rollOutLabel(dItem, ev);
                }).click(function(ev) {
                    _this.clickLabel(dItem, ev);
                });
            }
        },

        createV: function() {
            var _this = this;
            var size = _this.markerSize;
            return AmCharts.polygon(_this.container, [size / 5, size / 2, size - size / 5, size / 2], [size / 3, size - size / 5, size / 5, size / 1.7], _this.switchColor);
        },

        createX: function() {
            var _this = this;
            var size = (_this.markerSize - 4) / 2;

            var attr = {
                stroke: _this.switchColor,
                "stroke-width": 3
            };
            var container = _this.container;
            var line1 = AmCharts.line(container, [-size, size], [-size, size]).attr(attr);
            var line2 = AmCharts.line(container, [-size, size], [size, -size]).attr(attr);
            return _this.container.set([line1, line2]);
        },

        createMarker: function(type, color, alpha, thickness, lineColor, lineAlpha, gradientRotation, pattern, dashLength) {
            var _this = this;
            var size = _this.markerSize;
            var c = _this.container;
            var marker;

            if (!lineColor) {
                lineColor = _this.markerBorderColor;
            }
            if (!lineColor) {
                lineColor = color;
            }
            if (isNaN(thickness)) {
                thickness = _this.markerBorderThickness;
            }

            if (isNaN(lineAlpha)) {
                lineAlpha = _this.markerBorderAlpha;
            }

            marker = AmCharts.bullet(c, type, size, color, alpha, thickness, lineColor, lineAlpha, size, gradientRotation, pattern, _this.chart.path, dashLength);

            return marker;
        },


        validateNow: function() {
            this.invalidateSize();
        },

        updateValues: function() {

            var _this = this;
            var valueLabels = _this.valueLabels;
            var chart = _this.chart;

            var i;

            var data = _this.data;
            if (valueLabels) {
                for (i = 0; i < valueLabels.length; i++) {
                    var label = valueLabels[i];
                    var dataItem = label.dItem;
                    var formattedText = " ";
                    // all except slices

                    if (!data) {
                        var currentDataItem;
                        if (dataItem.type !== undefined) {
                            currentDataItem = dataItem.currentDataItem;

                            var periodValueText = _this.periodValueText;
                            if (dataItem.legendPeriodValueText) {
                                periodValueText = dataItem.legendPeriodValueText;
                            }

                            // one value
                            if (currentDataItem) {
                                formattedText = _this.valueText;

                                if (dataItem.legendValueText) {
                                    formattedText = dataItem.legendValueText;
                                }

                                formattedText = chart.formatString(formattedText, currentDataItem);
                            }
                            // period values
                            else if (periodValueText) {
                                if (chart.formatPeriodString) {
                                    periodValueText = AmCharts.massReplace(periodValueText, {
                                        "[[title]]": dataItem.title
                                    });
                                    formattedText = chart.formatPeriodString(periodValueText, dataItem);
                                }
                            }
                        }
                        // slices
                        else {
                            formattedText = chart.formatString(_this.valueText, dataItem);
                        }

                        var valueFunction = _this.valueFunction;
                        if (valueFunction) {
                            var attr = dataItem;
                            if (currentDataItem) {
                                attr = currentDataItem;
                            }

                            formattedText = valueFunction(attr, formattedText);
                        }
                        label.text(formattedText);
                    } else {
                        if (dataItem.value) {
                            label.text(dataItem.value);
                        } else {
                            label.text("");
                        }
                    }

                }
            }
        },

        renderFix: function() {
            if (!AmCharts.VML && this.enabled) {
                var container = this.container;
                if (container) {
                    container.renderFix();
                }
            }
        },

        destroy: function() {
            var _this = this;
            _this.div.innerHTML = "";
            AmCharts.remove(_this.set);
        }
    });
})();
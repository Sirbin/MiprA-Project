(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.RecItem = AmCharts.Class({

        construct: function(axis, coord, value, below, textWidth, valueShift, guide, bold, tickShift, minor, labelColor, className) {
            var _this = this;

            coord = Math.round(coord);
            var UNDEFINED;
            var chart = axis.chart;

            _this.value = value;

            if (value == UNDEFINED) {
                value = "";
            }

            if (!tickShift) {
                tickShift = 0;
            }

            if (below == UNDEFINED) {
                below = true;
            }
            var fontFamily = chart.fontFamily;
            var textSize = axis.fontSize;

            if (textSize == UNDEFINED) {
                textSize = chart.fontSize;
            }

            var color = axis.color;
            if (color == UNDEFINED) {
                color = chart.color;
            }
            if (labelColor !== UNDEFINED) {
                color = labelColor;
            }

            var container = axis.chart.container;
            var set = container.set();
            _this.set = set;

            var vCompensation = 3;
            var hCompensation = 4;
            var axisThickness = axis.axisThickness;
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
            var labelRotation = axis.labelRotationR;
            var counter = axis.counter;
            var labelInside = axis.inside;
            var labelOffset = axis.labelOffset;
            var dx = axis.dx;
            var dy = axis.dy;

            var orientation = axis.orientation;
            var position = axis.position;
            var previousCoord = axis.previousCoord;

            var vh = axis.height;
            var vw = axis.width;
            var offset = axis.offset;

            var tick;
            var grid;
            var MIDDLE = "middle";
            var START = "start";
            var BOTTOM = "bottom";


            if (guide) {
                if (guide.id !== undefined) {
                    className = chart.classNamePrefix + "-guide-" + guide.id;
                }

                labelsEnabled = true;

                if (!isNaN(guide.tickLength)) {
                    tickLength = guide.tickLength;
                }

                if (guide.lineColor != UNDEFINED) {
                    gridColor = guide.lineColor;
                }

                if (guide.color != UNDEFINED) {
                    color = guide.color;
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

                    if (offset > 0) {
                        offset = 0;
                    }
                }

                if (!isNaN(guide.labelRotation)) {
                    labelRotation = guide.labelRotation;
                }
                if (!isNaN(guide.fontSize)) {
                    textSize = guide.fontSize;
                }

                if (guide.position) {
                    position = guide.position;
                }
                if (guide.boldLabel !== undefined) {
                    bold = guide.boldLabel;
                }
                if (!isNaN(guide.labelOffset)) {
                    labelOffset = guide.labelOffset;
                }
            } else {
                if (value === "") {
                    tickLength = 0;
                }
            }

            if (minor && !isNaN(axis.minorTickLength)) {
                tickLength = axis.minorTickLength;
            }

            var align = START;
            if (textWidth > 0) {
                align = MIDDLE;
            }

            if (axis.centerLabels) {
                align = MIDDLE;
            }

            var angle = labelRotation * Math.PI / 180;
            var fillWidth;
            var fill;
            var fillHeight;
            var lx = 0;
            var ly = 0;
            var tx = 0;
            var ty = 0;
            var labelTextWidth = 0;
            var labelTextHeight = 0;
            var fillCoord;

            if (orientation == "V") {
                labelRotation = 0;
            }

            var valueTF;
            if (labelsEnabled && value !== "") {
                if (axis.autoWrap && labelRotation === 0) {
                    valueTF = AmCharts.wrappedText(container, value, color, fontFamily, textSize, align, bold, Math.abs(textWidth), 0);
                } else {
                    valueTF = AmCharts.text(container, value, color, fontFamily, textSize, align, bold);
                }

                var bbox = valueTF.getBBox();
                labelTextWidth = bbox.width;
                labelTextHeight = bbox.height;
            }

            // horizontal AXIS
            if (orientation == "H") {
                if (coord >= 0 && coord <= vw + 1) {
                    if (tickLength > 0 && axisAlpha > 0 && coord + tickShift <= vw + 1) {
                        tick = AmCharts.line(container, [coord + tickShift, coord + tickShift], [0, tickLength], axisColor, axisAlpha, gridThickness);
                        set.push(tick);
                    }
                    if (gridAlpha > 0) {
                        grid = AmCharts.line(container, [coord, coord + dx, coord + dx], [vh, vh + dy, dy], gridColor, gridAlpha, gridThickness, dashLength);
                        set.push(grid);
                    }
                }
                ly = 0;
                lx = coord;

                if (guide && labelRotation == 90 && labelInside) {
                    lx -= textSize;
                }

                if (below === false) {
                    align = START;

                    if (position == BOTTOM) {
                        if (labelInside) {
                            ly += tickLength;
                        } else {
                            ly -= tickLength;
                        }
                    } else {
                        if (labelInside) {
                            ly -= tickLength;
                        } else {
                            ly += tickLength;
                        }
                    }

                    lx += 3;

                    if (textWidth > 0) {
                        lx += textWidth / 2 - 3;
                        align = MIDDLE;
                    }

                    if (labelRotation > 0) {
                        align = MIDDLE;
                    }
                } else {
                    align = MIDDLE;
                }


                if (counter == 1 && fillAlpha > 0 && !guide && !minor && previousCoord < vw) {
                    fillCoord = AmCharts.fitToBounds(coord, 0, vw);
                    previousCoord = AmCharts.fitToBounds(previousCoord, 0, vw);
                    fillWidth = fillCoord - previousCoord;
                    if (fillWidth > 0) {
                        fill = AmCharts.rect(container, fillWidth, axis.height, fillColor, fillAlpha);
                        fill.translate((fillCoord - fillWidth + dx), dy);
                        set.push(fill);
                    }
                }

                // ADJUST POSITIONS
                // BOTTOM
                if (position == BOTTOM) {
                    ly += vh + textSize / 2 + offset;

                    //INSIDE
                    if (labelInside) {
                        if (labelRotation > 0) {
                            ly = vh - (labelTextWidth / 2) * Math.sin(angle) - tickLength - vCompensation;
                            lx += (labelTextWidth / 2) * Math.cos(angle) - hCompensation + 2;
                        } else if (labelRotation < 0) {
                            ly = vh + labelTextWidth * Math.sin(angle) - tickLength - vCompensation + 2;
                            lx += -labelTextWidth * Math.cos(angle) - labelTextHeight * Math.sin(angle) - hCompensation;
                        } else {
                            ly -= tickLength + textSize + vCompensation + vCompensation;
                        }
                        ly -= labelOffset;
                    }
                    //OUTSIDE
                    else {
                        if (labelRotation > 0) {
                            ly = vh + (labelTextWidth / 2) * Math.sin(angle) + tickLength + vCompensation;
                            lx -= (labelTextWidth / 2) * Math.cos(angle);
                        } else if (labelRotation < 0) {
                            ly = vh + tickLength + vCompensation - (labelTextWidth / 2) * Math.sin(angle) + 2;
                            lx += (labelTextWidth / 2) * Math.cos(angle);
                        } else {
                            ly += tickLength + axisThickness + vCompensation + 3;
                        }
                        ly += labelOffset;
                    }
                }
                // TOP
                else {
                    ly += dy + textSize / 2 - offset;
                    lx += dx;
                    //INSIDE
                    if (labelInside) {
                        if (labelRotation > 0) {
                            ly = (labelTextWidth / 2) * Math.sin(angle) + tickLength + vCompensation;
                            lx -= (labelTextWidth / 2) * Math.cos(angle);
                        } else {
                            ly += tickLength + vCompensation;
                        }
                        ly += labelOffset;
                    }
                    //OUTSIDE
                    else {
                        if (labelRotation > 0) {
                            ly = -(labelTextWidth / 2) * Math.sin(angle) - tickLength - 2 * vCompensation;
                            lx += (labelTextWidth / 2) * Math.cos(angle);
                        } else {
                            ly -= tickLength + textSize + vCompensation + axisThickness + 3;
                        }
                        ly -= labelOffset;
                    }
                }

                if (position == BOTTOM) {
                    //INSIDE
                    if (labelInside) {
                        ty = vh - tickLength - 1;
                    }
                    //OUTSIDE
                    else {
                        ty = vh + axisThickness - 1;
                    }
                    ty += offset;
                }
                // TOP
                else {
                    tx = dx;
                    //INSIDE
                    if (labelInside) {
                        ty = dy;
                    }
                    //OUTSIDE
                    else {
                        ty = dy - tickLength - axisThickness + 1;
                    }
                    ty -= offset;
                }

                if (valueShift) {
                    lx += valueShift;
                }

                var llx = lx;

                if (labelRotation > 0) {
                    llx += labelTextWidth / 2 * Math.cos(angle);
                }

                if (valueTF) {
                    var dlx = 0;
                    if (labelInside) {
                        dlx = labelTextWidth / 2 * Math.cos(angle);
                    }

                    if (llx + dlx > vw + 2 || llx < 0) {
                        valueTF.remove();
                        valueTF = null;
                    }
                }
            }
            // VERTICAL AXIS
            else {
                if (coord >= 0 && coord <= vh + 1) {
                    // ticks
                    if (tickLength > 0 && axisAlpha > 0 && coord + tickShift <= vh + 1) {
                        tick = AmCharts.line(container, [0, tickLength + 1], [coord + tickShift, coord + tickShift], axisColor, axisAlpha, gridThickness);
                        set.push(tick);
                    }
                    // grid
                    if (gridAlpha > 0) {
                        grid = AmCharts.line(container, [0, dx, vw + dx], [coord, coord + dy, coord + dy], gridColor, gridAlpha, gridThickness, dashLength);
                        set.push(grid);
                    }
                }

                // text field
                align = "end";

                if ((labelInside === true && position == "left") || (labelInside === false && position == "right")) {
                    align = START;
                }
                ly = coord - labelTextHeight / 2 + 2;

                if (counter == 1 && fillAlpha > 0 && !guide && !minor) {
                    fillCoord = AmCharts.fitToBounds(coord, 0, vh);
                    previousCoord = AmCharts.fitToBounds(previousCoord, 0, vh);
                    fillHeight = fillCoord - previousCoord;
                    fill = AmCharts.polygon(container, [0, axis.width, axis.width, 0], [0, 0, fillHeight, fillHeight], fillColor, fillAlpha);
                    fill.translate(dx, (fillCoord - fillHeight + dy));
                    set.push(fill);
                }
                // ADJUST POSITIONS
                // RIGHT
                ly += textSize / 2;
                if (position == "right") {
                    lx += dx + vw + offset;
                    ly += dy;

                    // INSIDE
                    if (labelInside) {
                        lx -= tickLength + hCompensation;
                        if (!valueShift) {
                            ly -= textSize / 2 + 3;
                        }
                        lx -= labelOffset;
                    }
                    //OUTSIDE
                    else {
                        lx += tickLength + hCompensation + axisThickness;
                        ly -= 2;
                        lx += labelOffset;
                    }
                }
                // LEFT
                else {
                    // INSIDE
                    if (labelInside) {
                        lx += tickLength + hCompensation - offset;
                        if (!valueShift) {
                            ly -= textSize / 2 + 3;
                        }
                        if (guide) {
                            lx += dx;
                            ly += dy;
                        }
                        lx += labelOffset;
                    }
                    // OUTSIDE
                    else {
                        lx += -tickLength - axisThickness - hCompensation - 2 - offset;
                        ly -= 2;
                        lx -= labelOffset;
                    }
                }

                if (tick) {
                    if (position == "right") {
                        tx += dx + offset + vw - 1;
                        ty += dy;
                        // INSIDE
                        if (labelInside) {
                            tx -= axisThickness;
                        }
                        //OUTSIDE
                        else {
                            tx += axisThickness;
                        }
                    }
                    // LEFT
                    else {
                        tx -= offset;
                        // INSIDE
                        if (labelInside) {
                            // void
                        }
                        // OUTSIDE
                        else {
                            tx -= tickLength + axisThickness;
                        }
                    }
                }

                if (valueShift) {
                    ly += valueShift;
                }

                var topY = -3;

                if (position == "right") {
                    topY += dy;
                }
                if (valueTF) {
                    if (ly > vh + 1 || ly < topY) {
                        valueTF.remove();
                        valueTF = null;
                    }
                }
            }

            if (tick) {
                tick.translate(tx, ty);
                AmCharts.setCN(chart, tick, axis.bcn + "tick");
                AmCharts.setCN(chart, tick, className, true);

                if (guide) {
                    AmCharts.setCN(chart, tick, "guide");
                }
            }

            if (axis.visible === false) {
                if (tick) {
                    tick.remove();
                    tick = null;
                }
                if (valueTF) {
                    valueTF.remove();
                    valueTF = null;
                }
            }

            if (valueTF) {
                valueTF.attr({
                    "text-anchor": align
                });
                valueTF.translate(lx, ly, NaN, true);

                if (labelRotation !== 0) {
                    valueTF.rotate(-labelRotation, axis.chart.backgroundColor);
                }
                axis.allLabels.push(valueTF);

                //if (value != " ") { // caused memory leak 3.12.0
                _this.label = valueTF;
                //}

                AmCharts.setCN(chart, valueTF, axis.bcn + "label");
                AmCharts.setCN(chart, valueTF, className, true);
                if (guide) {
                    AmCharts.setCN(chart, valueTF, "guide");
                }
            }

            if (grid) {
                AmCharts.setCN(chart, grid, axis.bcn + "grid");
                AmCharts.setCN(chart, grid, className, true);
                if (guide) {
                    AmCharts.setCN(chart, grid, "guide");
                }
            }

            if (fill) {
                AmCharts.setCN(chart, fill, axis.bcn + "fill");
                AmCharts.setCN(chart, fill, className, true);
            }

            if (!minor) {
                if (counter === 0) {
                    axis.counter = 1;
                } else {
                    axis.counter = 0;
                }
                axis.previousCoord = coord;
            } else {
                if (grid) {
                    AmCharts.setCN(chart, grid, axis.bcn + "grid-minor");
                }
            }

            // remove empty
            if (_this.set.node.childNodes.length === 0) {
                _this.set.remove();
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
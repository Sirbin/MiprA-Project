(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.AmGraph = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "AmGraph";
            _this.createEvents("rollOverGraphItem", "rollOutGraphItem", "clickGraphItem", "doubleClickGraphItem", "rightClickGraphItem", "clickGraph", "rollOverGraph", "rollOutGraph");
            _this.type = "line";
            _this.stackable = true;
            _this.columnCount = 1;
            _this.columnIndex = 0;
            _this.showBalloon = true;
            _this.centerCustomBullets = true;
            _this.maxBulletSize = 50;
            _this.minBulletSize = 4;
            _this.balloonText = "[[value]]";
            _this.animationPlayed = false;
            _this.scrollbar = false;
            _this.hidden = false;
            //_this.columnWidth;
            _this.pointPosition = "middle";
            _this.depthCount = 1;
            _this.includeInMinMax = true;
            _this.negativeBase = 0;
            _this.visibleInLegend = true;
            _this.showAllValueLabels = false;
            _this.showBalloonAt = "close";
            _this.showBulletsAt = "close";
            _this.lineThickness = 1;
            _this.dashLength = 0;
            _this.connect = true;
            _this.lineAlpha = 1;
            _this.bullet = "none";
            _this.bulletBorderThickness = 2;
            _this.bulletBorderAlpha = 0;
            _this.bulletAlpha = 1;
            _this.bulletSize = 8;
            _this.bulletOffset = 0;
            _this.hideBulletsCount = 0;
            //_this.labelPosition = "top";
            _this.cornerRadiusTop = 0;
            _this.cursorBulletAlpha = 1;
            _this.gradientOrientation = "vertical";
            _this.dx = 0;
            _this.dy = 0;
            _this.periodValue = "";
            _this.clustered = true;
            _this.periodSpan = 1;
            //_this.balloonPosition = 0;
            //_this.useLineColorForBulletBorder = false;
            //_this.showHandOnHover;
            //_this.useNegativeColorIfDown
            //_this.proCandelstics
            //_this.topRadius = 1;
            _this.x = 0;
            _this.y = 0;
            _this.switchable = true;
            _this.minDistance = 1;
            _this.tcc = 1;
            //_this.legendPeriodValueText;

            // NEW
            _this.labelRotation = 0;
            _this.labelAnchor = "auto";
            _this.labelOffset = 3;

            _this.bcn = "graph-";

            _this.dateFormat = "MMM DD, YYYY";
            _this.noRounding = true;

            AmCharts.applyTheme(_this, theme, _this.cname);

        },

        init: function() {
            var _this = this;
            _this.createBalloon();
        },

        draw: function() {

            var _this = this;
            var chart = _this.chart;
            chart.isRolledOverBullet = false;

            var chartType = chart.type;
            if (chart.drawGraphs) {
                // handling backwards compatibility with numberformatter
                if (!isNaN(_this.precision)) {
                    if (!_this.numberFormatter) {
                        _this.numberFormatter = {
                            precision: _this.precision,
                            decimalSeparator: chart.decimalSeparator,
                            thousandsSeparator: chart.thousandsSeparator
                        };
                    } else {
                        _this.numberFormatter.precision = _this.precision;
                    }
                }

                var container = chart.container;
                _this.container = container;

                _this.destroy();

                var set = container.set();
                _this.set = set;
                set.translate(_this.x, _this.y);

                var bulletSet = container.set();
                _this.bulletSet = bulletSet;
                bulletSet.translate(_this.x, _this.y);

                if (_this.behindColumns) {
                    chart.graphsBehindSet.push(set);
                    chart.bulletBehindSet.push(bulletSet);
                } else {
                    chart.graphsSet.push(set);
                    chart.bulletSet.push(bulletSet);
                }

                var bulletAxis = _this.bulletAxis;
                if (AmCharts.isString(bulletAxis)) {
                    _this.bulletAxis = chart.getValueAxisById(bulletAxis);
                }

                var columnsSet = container.set();
                AmCharts.remove(_this.columnsSet);
                _this.columnsSet = columnsSet;

                AmCharts.setCN(chart, set, "graph-" + _this.type);
                AmCharts.setCN(chart, set, "graph-" + _this.id);

                AmCharts.setCN(chart, bulletSet, "graph-" + _this.type);
                AmCharts.setCN(chart, bulletSet, "graph-" + _this.id);

                _this.columnsArray = [];
                _this.ownColumns = [];
                _this.allBullets = [];
                _this.animationArray = [];

                var labelPosition = _this.labelPosition;
                if (!labelPosition) {
                    var stackType = _this.valueAxis.stackType;
                    labelPosition = "top";
                    if (_this.type == "column") {

                        if (chart.rotate) {
                            labelPosition = "right";
                        }

                        if (stackType == "100%" || stackType == "regular") {
                            labelPosition = "middle";
                        }
                    }
                    _this.labelPosition = labelPosition;
                }

                if (AmCharts.ifArray(_this.data)) {
                    var create = false;

                    if (chartType == "xy") {
                        if (_this.xAxis.axisCreated && _this.yAxis.axisCreated) {
                            create = true;
                        }
                    } else {
                        if (_this.valueAxis.axisCreated) {
                            create = true;
                        }
                    }
                    if (!_this.hidden && create) {
                        _this.createGraph();
                    }
                }

                set.push(columnsSet);
            }
        },


        createGraph: function() {
            var _this = this;
            var chart = _this.chart;
            var UNDEFINED;

            _this.startAlpha = chart.startAlpha;

            _this.seqAn = chart.sequencedAnimation;
            _this.baseCoord = _this.valueAxis.baseCoord;

            if (_this.fillAlphas === UNDEFINED) {
                _this.fillAlphas = 0;
            }

            _this.bulletColorR = _this.bulletColor;
            if (_this.bulletColorR === UNDEFINED) {
                _this.bulletColorR = _this.lineColorR;
                _this.bulletColorNegative = _this.negativeLineColor;
            }

            if (_this.bulletAlpha === UNDEFINED) {
                _this.bulletAlpha = _this.lineAlpha;
            }
            if (type == "step" || AmCharts.VML) {
                _this.noRounding = false;
            }

            /*
        if (!_this.bulletBorderColor) {
            _this.bulletBorderAlpha = 0;
        }
       */

            var type = chart.type;
            if (type == "gantt") {
                type = "serial";
            }

            clearTimeout(_this.playedTO);
            if (!isNaN(_this.valueAxis.min) && !isNaN(_this.valueAxis.max)) {
                switch (type) {
                    case "serial":
                        if (_this.categoryAxis) {
                            _this.createSerialGraph();

                            if (_this.type == "candlestick") {
                                var valueAxis = _this.valueAxis;
                                if (valueAxis.minMaxMultiplier < 1) {
                                    _this.positiveClip(_this.set);
                                }
                            }
                        }
                        break;
                    case "radar":
                        _this.createRadarGraph();
                        break;
                    case "xy":
                        _this.createXYGraph();
                        //_this.positiveClip(_this.set);  // this cause export probs, but graph is masked anyway.
                        break;
                }

                _this.playedTO = setTimeout(function() {
                    _this.setAnimationPlayed.call(_this);
                }, _this.chart.startDuration * 500);
            }
        },

        setAnimationPlayed: function() {
            this.animationPlayed = true;
        },

        createXYGraph: function() {
            var _this = this;
            var xx = [];
            var yy = [];

            var xAxis = _this.xAxis;
            var yAxis = _this.yAxis;

            _this.pmh = yAxis.height;
            _this.pmw = xAxis.width;
            _this.pmx = 0;
            _this.pmy = 0;
            var i;

            for (i = _this.start; i <= _this.end; i++) {
                var serialDataItem = _this.data[i];
                var graphDataItem = serialDataItem.axes[xAxis.id].graphs[_this.id];

                var values = graphDataItem.values;
                var xValue = values.x;
                var yValue = values.y;

                var xxx = xAxis.getCoordinate(xValue, _this.noRounding);
                var yyy = yAxis.getCoordinate(yValue, _this.noRounding);

                if (!isNaN(xValue) && !isNaN(yValue)) {
                    xx.push(xxx);
                    yy.push(yyy);

                    graphDataItem.x = xxx;
                    graphDataItem.y = yyy;

                    var bullet = _this.createBullet(graphDataItem, xxx, yyy, i);

                    // LABELS ////////////////////////////////////////////////////////
                    var labelText = _this.labelText;
                    if (labelText) {
                        var lText = _this.createLabel(graphDataItem, labelText);

                        var bulletSize = 0;
                        if (bullet) {
                            bulletSize = bullet.size;
                        }

                        _this.positionLabel(graphDataItem, xxx, yyy, lText, bulletSize);
                    }
                }
            }
            _this.drawLineGraph(xx, yy);
            _this.launchAnimation();
        },


        createRadarGraph: function() {
            var _this = this;
            var stackType = _this.valueAxis.stackType;
            var xx = [];
            var yy = [];
            var sxx = [];
            var syy = [];
            var firstX;
            var firstY;

            var firstSX;
            var firstSY;
            var i;

            for (i = _this.start; i <= _this.end; i++) {
                var serialDataItem = _this.data[i];
                var graphDataItem = serialDataItem.axes[_this.valueAxis.id].graphs[_this.id];

                var close;
                var open;

                if (stackType == "none" || stackType == "3d") {
                    close = graphDataItem.values.value;
                } else {
                    close = graphDataItem.values.close;
                    open = graphDataItem.values.open;
                }

                if (isNaN(close)) {
                    if (!_this.connect) {
                        _this.drawLineGraph(xx, yy, sxx, syy);
                        xx = [];
                        yy = [];
                        sxx = [];
                        syy = [];
                    }
                } else {
                    var coord = _this.valueAxis.getCoordinate(close, _this.noRounding) - _this.height;
                    coord *= _this.valueAxis.rMultiplier;

                    var angle = -360 / (_this.end - _this.start + 1) * i;

                    if (_this.valueAxis.pointPosition == "middle") {
                        angle -= 180 / (_this.end - _this.start + 1);
                    }

                    var xxx = (coord * Math.sin((angle) / (180) * Math.PI));
                    var yyy = (coord * Math.cos((angle) / (180) * Math.PI));

                    xx.push(xxx);
                    yy.push(yyy);

                    if (!isNaN(open)) {
                        var openCoord = _this.valueAxis.getCoordinate(open, _this.noRounding) - _this.height;
                        openCoord *= _this.valueAxis.rMultiplier;

                        var sxxx = (openCoord * Math.sin((angle) / (180) * Math.PI));
                        var syyy = (openCoord * Math.cos((angle) / (180) * Math.PI));

                        sxx.push(sxxx);
                        syy.push(syyy);

                        if (isNaN(firstSX)) {
                            firstSX = sxxx;
                        }
                        if (isNaN(firstSY)) {
                            firstSY = syyy;
                        }
                    }

                    var bullet = _this.createBullet(graphDataItem, xxx, yyy, i);

                    graphDataItem.x = xxx;
                    graphDataItem.y = yyy;

                    // LABELS ////////////////////////////////////////////////////////
                    var labelText = _this.labelText;
                    if (labelText) {
                        var lText = _this.createLabel(graphDataItem, labelText);

                        var bulletSize = 0;
                        if (bullet) {
                            bulletSize = bullet.size;
                        }

                        lText = _this.positionLabel(graphDataItem, xxx, yyy, lText, bulletSize);
                    }
                    if (isNaN(firstX)) {
                        firstX = xxx;
                    }
                    if (isNaN(firstY)) {
                        firstY = yyy;
                    }
                }
            }
            xx.push(firstX);
            yy.push(firstY);

            if (!isNaN(firstSX)) {
                sxx.push(firstSX);
                syy.push(firstSY);
            }

            _this.drawLineGraph(xx, yy, sxx, syy);
            _this.launchAnimation();
        },

        positionLabel: function(graphDataItem, x, y, lText, bulletSize) {
            var _this = this;
            if (lText) {

                var chart = _this.chart;
                var valueAxis = _this.valueAxis;

                var lA = "middle";
                var lC = false;
                var lP = _this.labelPosition;

                var lBB = lText.getBBox();

                var isRotated = _this.chart.rotate;
                var isNegative = graphDataItem.isNegative;

                // Grab from chart
                var fontSize = _this.fontSize;
                if (fontSize === undefined) {
                    fontSize = _this.chart.fontSize;
                }

                // Ultimate middle; canceling weird topper textbox offset
                y -= (lBB.height / 4) / 2;

                if (graphDataItem.labelIsNegative !== undefined) {
                    isNegative = graphDataItem.labelIsNegative;
                }

                // Position switch
                switch (lP) {
                    case "right":
                        lP = isRotated ? (isNegative ? "left" : "right") : "right";
                        break;
                    case "top":
                        lP = isRotated ? "top" : (isNegative ? "bottom" : "top");
                        break;
                    case "bottom":
                        lP = isRotated ? "bottom" : (isNegative ? "top" : "bottom");
                        break;
                    case "left":
                        lP = isRotated ? (isNegative ? "right" : "left") : "left";
                        break;
                }

                var columnGraphics = graphDataItem.columnGraphics;
                var cgx = 0;
                var cgy = 0;

                if (columnGraphics) {
                    cgx = columnGraphics.x;
                    cgy = columnGraphics.y;
                }

                var labelOffset = _this.labelOffset;


                switch (lP) {
                    case "right":
                        lA = "start";
                        x += bulletSize / 2 + labelOffset;
                        break;
                    case "top":
                        if (valueAxis.reversed) {
                            y += bulletSize / 2 + lBB.height / 2 + labelOffset;
                        } else {
                            y -= bulletSize / 2 + lBB.height / 2 + labelOffset;
                        }
                        break;

                    case "bottom":
                        if (valueAxis.reversed) {
                            y -= bulletSize / 2 + lBB.height / 2 + labelOffset;
                        } else {
                            y += bulletSize / 2 + lBB.height / 2 + labelOffset;
                        }
                        break;
                    case "left":
                        lA = "end";
                        x -= bulletSize / 2 + labelOffset;
                        break;
                    case "inside":
                        if (_this.type == "column") {
                            lC = true;
                            if (isRotated) {
                                if (isNegative) {
                                    lA = "end";
                                    x = cgx - 3 - labelOffset;
                                } else {
                                    lA = "start";
                                    x = cgx + 3 + labelOffset;
                                }
                            } else {
                                if (isNegative) {
                                    y = cgy + 7 + labelOffset;
                                } else {
                                    y = cgy - 10 - labelOffset;
                                }
                            }
                        }
                        break;
                    case "middle":
                        if (_this.type == "column") {
                            lC = true;
                            if (isRotated) {
                                x -= (x - cgx) / 2 + labelOffset - 3;
                            } else {
                                y -= (y - cgy) / 2 + labelOffset - 3;
                            }
                        }
                        break;
                }

                //var lA;
                if (_this.labelAnchor != "auto") {
                    lA = _this.labelAnchor;
                }

                // Early adoption to update boundary box
                lText.attr({
                    "text-anchor": lA
                });
                if (_this.labelRotation) {
                    lText.rotate(_this.labelRotation);
                }
                lText.translate(x, y);


                // Check boundaries
                if (!_this.showAllValueLabels) {
                    if (columnGraphics && lC) {
                        lBB = lText.getBBox();
                        if (lBB.height > graphDataItem.columnHeight || lBB.width > graphDataItem.columnWidth) {
                            lText.remove();
                            lText = null;
                        }
                    }
                }

                if (lText && chart.type != "radar") {
                    if (x < 0 || x > _this.width || y < 0 || y > _this.height) {
                        lText.remove();
                        lText = null;
                    }
                }

                // remove if out of bounds
                if (lText) {
                    if (chart.type == "serial" || chart.type == "gantt") {
                        if (isRotated) {
                            if (y < 0 || y > _this.height) {
                                lText.remove();
                                lText = null;
                            }
                        } else {
                            if (x < 0 || x > _this.width) {
                                lText.remove();
                                lText = null;
                            }
                        }
                    }
                }
                if (lText) {
                    _this.allBullets.push(lText);
                }
                return lText;
            }
        },

        getGradRotation: function() {
            var _this = this;
            var gradientRotation = 270;
            if (_this.gradientOrientation == "horizontal") {
                gradientRotation = 0;
            }
            _this.gradientRotation = gradientRotation;
            return gradientRotation;
        },

        createSerialGraph: function() {

            var _this = this;
            var UNDEFINED;
            _this.lineColorSwitched = UNDEFINED;
            _this.fillColorsSwitched = UNDEFINED;
            _this.dashLengthSwitched = UNDEFINED;
            var chart = _this.chart;
            var id = _this.id;
            var index = _this.index;
            var data = _this.data;
            var container = _this.chart.container;
            var valueAxis = _this.valueAxis;
            var type = _this.type;
            var columnWidth = _this.columnWidthReal;
            var showBulletsAt = _this.showBulletsAt;

            if (!isNaN(_this.columnWidth)) {
                columnWidth = _this.columnWidth;
            }

            if (isNaN(columnWidth)) {
                columnWidth = 0.8; // this is mainly for scrollbar
            }
            var useNegativeColorIfDown = _this.useNegativeColorIfDown;
            var width = _this.width;
            var height = _this.height;

            var y = _this.y;
            var rotate = _this.rotate;
            var columnCount = _this.columnCount;
            var crt = AmCharts.toCoordinate(_this.cornerRadiusTop, columnWidth / 2);
            var connect = _this.connect;
            var xx = [];
            var yy = [];
            var previousxClose;
            var previousyClose;
            var previousxOpen;
            var previousyOpen;
            var totalGarphs = _this.chart.graphs.length;
            var depth;
            var dx = _this.dx / _this.tcc;
            var dy = _this.dy / _this.tcc;

            var stackType = valueAxis.stackType;
            var start = _this.start;
            var end = _this.end;
            var scrollbar = _this.scrollbar;

            var columnBCN = "graph-column-";
            if (scrollbar) {
                columnBCN = "scrollbar-graph-column-";
            }

            var categoryAxis = _this.categoryAxis;
            var baseCoord = _this.baseCoord;
            var negativeBase = _this.negativeBase;
            var columnIndex = _this.columnIndex;
            var lineThickness = _this.lineThickness;
            var lineAlpha = _this.lineAlpha;
            var lineColor = _this.lineColorR;
            var dashLength = _this.dashLength;
            var set = _this.set;
            var previousClose; // = -Infinity;

            // backward compatibility with old flash version
            /*
        if (labelPosition == "above") {
            labelPosition = "top";
        }
        if (labelPosition == "below") {
            labelPosition = "bottom";
        }*/

            var gradientRotation = _this.getGradRotation();

            var columnSpacing = _this.chart.columnSpacing;
            var cellWidth = categoryAxis.cellWidth;

            var maxSpacing = (cellWidth * columnWidth - columnCount) / columnCount;
            if (columnSpacing > maxSpacing) {
                columnSpacing = maxSpacing;
            }

            var serialDataItem;
            var graphDataItem;
            var value;

            // dimensions and position of positive mask
            var pmh = height;
            var pmw = width;
            var pmx = 0;
            var pmy = 0;
            // dimensions and position of negative mask
            var nmh;
            var nmw;
            var nmx;
            var nmy;

            var fillColors = _this.fillColorsR;
            var negativeFillColors = _this.negativeFillColors;
            var negativeLineColor = _this.negativeLineColor;
            var fillAlphas = _this.fillAlphas;
            var negativeFillAlphas = _this.negativeFillAlphas;

            // arrays of fillAlphas are not supported, but might be received, take first value only.
            if (typeof(fillAlphas) == "object") {
                fillAlphas = fillAlphas[0];
            }
            if (typeof(negativeFillAlphas) == "object") {
                negativeFillAlphas = negativeFillAlphas[0];
            }
            var noRounding = _this.noRounding;

            if (type == "step") {
                noRounding = false;
            }

            // get coordinate of minimum axis value
            var minCoord = valueAxis.getCoordinate(valueAxis.min);

            if (valueAxis.logarithmic) {
                minCoord = valueAxis.getCoordinate(valueAxis.minReal);
            }
            _this.minCoord = minCoord;

            // bullet could be set previously if only one data point was available
            if (_this.resetBullet) {
                _this.bullet = "none";
            }
            // if it"s line/smoothedLine/step graph, mask (clip rectangle will be applied on a line. Calculate mask dimensions here.
            if (!scrollbar && (type == "line" || type == "smoothedLine" || type == "step")) {
                // if it"s line/smoothedLine and there is one data point only, set bullet to round if not set any
                if (data.length == 1 && type != "step" && _this.bullet == "none") {
                    _this.bullet = "round";
                    _this.resetBullet = true;
                }
                // only need to do adjustments if negative colors are set
                if ((negativeFillColors || negativeLineColor != UNDEFINED) && !useNegativeColorIfDown) {
                    var zeroValue = negativeBase;
                    if (zeroValue > valueAxis.max) {
                        zeroValue = valueAxis.max;
                    }

                    if (zeroValue < valueAxis.min) {
                        zeroValue = valueAxis.min;
                    }

                    if (valueAxis.logarithmic) {
                        zeroValue = valueAxis.minReal;
                    }

                    var zeroCoord = valueAxis.getCoordinate(zeroValue);

                    var maxCoord = valueAxis.getCoordinate(valueAxis.max);

                    if (rotate) {
                        pmh = height;
                        pmw = Math.abs(maxCoord - zeroCoord);
                        nmh = height;
                        nmw = Math.abs(minCoord - zeroCoord);

                        pmy = 0;
                        nmy = 0;

                        if (valueAxis.reversed) {
                            pmx = 0;
                            nmx = zeroCoord;
                        } else {
                            pmx = zeroCoord;
                            nmx = 0;
                        }
                    } else {
                        pmw = width;
                        pmh = Math.abs(maxCoord - zeroCoord);
                        nmw = width;
                        nmh = Math.abs(minCoord - zeroCoord);

                        pmx = 0;
                        nmx = 0;

                        if (valueAxis.reversed) {
                            nmy = y;
                            pmy = zeroCoord;
                        } else {
                            nmy = zeroCoord;
                        }
                    }
                }
            }
            var round = Math.round;

            _this.pmx = round(pmx);
            _this.pmy = round(pmy);
            _this.pmh = round(pmh);
            _this.pmw = round(pmw);

            _this.nmx = round(nmx);
            _this.nmy = round(nmy);
            _this.nmh = round(nmh);
            _this.nmw = round(nmw);

            if (!AmCharts.isModern) {
                _this.nmx = 0;
                _this.nmy = 0;
                _this.nmh = _this.height;
            }

            // 3.10.2
            /*
            problem fix - if clustered is set to false, but we have another two clustered columns,
            the false column did not took full width
        */
            if (!_this.clustered) {
                columnCount = 1;
            }
            // end of fix

            // get column width
            if (type == "column") {
                columnWidth = (cellWidth * columnWidth - (columnSpacing * (columnCount - 1))) / columnCount;
            } else {
                columnWidth = cellWidth * columnWidth;
            }
            // set one pixel if actual width is less
            if (columnWidth < 1) {
                columnWidth = 1;
            }
            var fixedColumnWidth = _this.fixedColumnWidth;
            if (!isNaN(fixedColumnWidth)) {
                columnWidth = fixedColumnWidth;
            }
            // find first not missing value
            var i;
            if (type == "line" || type == "step" || type == "smoothedLine") {
                if (start > 0) {
                    for (i = start - 1; i > -1; i--) {
                        serialDataItem = data[i];
                        graphDataItem = serialDataItem.axes[valueAxis.id].graphs[id];
                        value = graphDataItem.values.value;

                        if (!isNaN(value)) {
                            start = i;
                            break;
                        }
                    }
                    // if lineColorField or other simmilar are set, we need to check if there are any set before
                    if (_this.lineColorField) {
                        for (i = start; i > -1; i--) {

                            serialDataItem = data[i];
                            graphDataItem = serialDataItem.axes[valueAxis.id].graphs[id];

                            if (graphDataItem.lineColor) {
                                _this.lineColorSwitched = graphDataItem.lineColor;
                                _this.bulletColorSwitched = _this.lineColorSwitched;
                                break;
                            }
                        }
                    }

                    if (_this.fillColorsField) {
                        for (i = start; i > -1; i--) {

                            serialDataItem = data[i];
                            graphDataItem = serialDataItem.axes[valueAxis.id].graphs[id];

                            if (graphDataItem.fillColors) {
                                _this.fillColorsSwitched = graphDataItem.fillColors;
                                break;
                            }
                        }
                    }

                    if (_this.dashLengthField) {
                        for (i = start; i > -1; i--) {

                            serialDataItem = data[i];
                            graphDataItem = serialDataItem.axes[valueAxis.id].graphs[id];

                            if (!isNaN(graphDataItem.dashLength)) {
                                _this.dashLengthSwitched = graphDataItem.dashLength;
                                break;
                            }
                        }
                    }

                }
                if (end < data.length - 1) {
                    for (i = end + 1; i < data.length; i++) {
                        serialDataItem = data[i];
                        graphDataItem = serialDataItem.axes[valueAxis.id].graphs[id];
                        value = graphDataItem.values.value;

                        if (!isNaN(value)) {
                            end = i;
                            break;
                        }
                    }
                }
            }
            // add one more
            if (end < data.length - 1) {
                end++;
            }

            var sxx = [];
            var syy = [];

            var stackableLine = false;
            if (type == "line" || type == "step" || type == "smoothedLine") {
                if (_this.stackable && stackType == "regular" || stackType == "100%" || _this.fillToGraph) {
                    stackableLine = true;
                }
            }

            var noStepRisers = _this.noStepRisers;

            var previousLX = -1000;
            var previousLY = -1000;
            var minDistance = _this.minDistance;


            var nowIsPositive = true;
            var changeColor = false;
            var prevColumnX = 0;
            var prevColumnY = 0;

            ///////////////////////////////////////////////////////////////////////////
            // now go through all data items and get coordinates or draw actual objects
            for (i = start; i <= end; i++) {
                serialDataItem = data[i];
                graphDataItem = serialDataItem.axes[valueAxis.id].graphs[id];
                graphDataItem.index = i;

                var nextDataItem;
                var nextClose = NaN;
                if (useNegativeColorIfDown && _this.openField == UNDEFINED) {
                    for (var n = i + 1; n < data.length; n++) {
                        if (data[n]) {
                            var nextSerialDataItem = data[i + 1];
                            nextDataItem = nextSerialDataItem.axes[valueAxis.id].graphs[id];

                            if (nextDataItem) {
                                if (nextDataItem.values) {
                                    nextClose = nextDataItem.values.value;

                                    if (!isNaN(nextClose)) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                var cx;
                var cy;
                var cw;
                var ch;
                var xxx = NaN;
                var xClose = NaN;
                var yClose = NaN;
                var xOpen = NaN;
                var yOpen = NaN;
                var xLow = NaN;
                var yLow = NaN;
                var xHigh = NaN;
                var yHigh = NaN;

                var labelX = NaN;
                var labelY = NaN;
                var bulletX = NaN;
                var bulletY = NaN;

                var close = NaN;
                var high = NaN;
                var low = NaN;
                var open = NaN;
                var cuboid = UNDEFINED;

                var fillColorsReal = fillColors;
                var fillAlphasReal = fillAlphas;
                var lineColorReal = lineColor;
                var borderColor;
                var cset;
                var proCandlesticks = _this.proCandlesticks;
                var topRadius = _this.topRadius;

                var rh = height - 1;
                var rw = width - 1;

                var pattern = _this.pattern;
                if (graphDataItem.pattern != UNDEFINED) {
                    pattern = graphDataItem.pattern;
                }

                if (!isNaN(graphDataItem.alpha)) {
                    fillAlphasReal = graphDataItem.alpha;
                }

                if (!isNaN(graphDataItem.dashLength)) {
                    dashLength = graphDataItem.dashLength;
                }

                var values = graphDataItem.values;
                if (valueAxis.recalculateToPercents) {
                    values = graphDataItem.percents;
                }

                if (values) {
                    if (!_this.stackable || stackType == "none" || stackType == "3d") {
                        close = values.value;
                    } else {
                        close = values.close;
                    }

                    // in case candlestick
                    if (type == "candlestick" || type == "ohlc") {
                        close = values.close;
                        low = values.low;
                        yLow = valueAxis.getCoordinate(low);

                        high = values.high;
                        yHigh = valueAxis.getCoordinate(high);
                    }

                    open = values.open;
                    yClose = valueAxis.getCoordinate(close, noRounding);

                    if (!isNaN(open)) {
                        yOpen = valueAxis.getCoordinate(open, noRounding);

                        if (useNegativeColorIfDown && stackType != "regular" && stackType != "100%") {
                            nextClose = open;
                            yOpen = NaN;
                            open = NaN;
                        }
                    }

                    if (useNegativeColorIfDown) {
                        if (_this.openField == UNDEFINED) {
                            if (nextDataItem) {
                                if (nextClose < close) {
                                    nextDataItem.isNegative = true;
                                } else {
                                    nextDataItem.isNegative = false;
                                }
                                if (isNaN(nextClose)) {
                                    graphDataItem.isNegative = !nowIsPositive;
                                }
                            }
                        } else {
                            if (nextClose > close) {
                                graphDataItem.isNegative = true;
                            } else {
                                graphDataItem.isNegative = false;
                            }
                        }
                    }

                    // do not store y if this is scrollbar
                    if (!scrollbar) {
                        switch (_this.showBalloonAt) {
                            case "close":
                                graphDataItem.y = yClose;
                                break;
                            case "open":
                                graphDataItem.y = yOpen;
                                break;
                            case "high":
                                graphDataItem.y = yHigh;
                                break;
                            case "low":
                                graphDataItem.y = yLow;
                                break;
                        }
                    }

                    // x coordinate
                    xxx = serialDataItem.x[categoryAxis.id];

                    var periodSpan = _this.periodSpan - 1;

                    if (type == "step") {
                        if (!isNaN(serialDataItem.cellWidth)) {
                            cellWidth = serialDataItem.cellWidth;
                        }
                    }

                    var stepLineDelta1 = Math.floor(cellWidth / 2) + Math.floor(periodSpan * cellWidth / 2);
                    var stepLineDelta2 = stepLineDelta1;

                    var stepShift = 0;
                    if (_this.stepDirection == "left") {
                        stepShift = (cellWidth * 2 + periodSpan * cellWidth) / 2;
                        xxx -= stepShift;
                    }

                    if (_this.stepDirection == "center") {
                        stepShift = cellWidth / 2;
                        xxx -= stepShift;
                    }

                    if (_this.pointPosition == "start") {
                        xxx -= cellWidth / 2 + Math.floor(periodSpan * cellWidth / 2);
                        stepLineDelta1 = 0;
                        stepLineDelta2 = Math.floor(cellWidth) + Math.floor(periodSpan * cellWidth);
                    }

                    if (_this.pointPosition == "end") {
                        xxx += cellWidth / 2 + Math.floor(periodSpan * cellWidth / 2);
                        stepLineDelta1 = Math.floor(cellWidth) + Math.floor(periodSpan * cellWidth);
                        stepLineDelta2 = 0;
                    }

                    if (noStepRisers) {
                        var stepWidth = _this.columnWidth;

                        if (!isNaN(stepWidth)) {
                            stepLineDelta1 = stepWidth * stepLineDelta1;
                            stepLineDelta2 = stepWidth * stepLineDelta2;
                        }
                    }

                    if (!scrollbar) {
                        graphDataItem.x = xxx;
                    }

                    // fix to avoid wrong behavior when lines are too long
                    // theorethically this is not 100% correct approach, but visually there is no any diference.
                    var maxmax = 100000;

                    if (xxx < -maxmax) {
                        xxx = -maxmax;
                    }

                    if (xxx > width + maxmax) {
                        xxx = width + maxmax;
                    }

                    if (rotate) {
                        xClose = yClose;
                        xOpen = yOpen;
                        yClose = xxx;
                        yOpen = xxx;

                        if (isNaN(open) && !_this.fillToGraph) {
                            xOpen = baseCoord;
                        }

                        xLow = yLow;
                        xHigh = yHigh;
                    } else {
                        xClose = xxx;
                        xOpen = xxx;

                        if (isNaN(open) && !_this.fillToGraph) {
                            yOpen = baseCoord;
                        }
                    }

                    if ((!proCandlesticks && close < open) || (proCandlesticks && close < previousClose)) {
                        graphDataItem.isNegative = true;

                        if (negativeFillColors) {
                            fillColorsReal = negativeFillColors;
                        }

                        if (negativeFillAlphas) {
                            fillAlphasReal = negativeFillAlphas;
                        }

                        if (negativeLineColor != UNDEFINED) {
                            lineColorReal = negativeLineColor;
                        }
                    }

                    changeColor = false;

                    if (!isNaN(close)) {
                        if (useNegativeColorIfDown) {
                            if (close > nextClose) {
                                if (nowIsPositive) {
                                    changeColor = true;
                                }
                                nowIsPositive = false;
                            } else {
                                if (!nowIsPositive) {
                                    changeColor = true;
                                }
                                nowIsPositive = true;
                            }
                        } else {
                            if (close < negativeBase) {
                                graphDataItem.isNegative = true;
                            } else {
                                graphDataItem.isNegative = false;
                            }
                        }
                        previousClose = close;
                    }

                    var ignoreCustomColor = false;

                    if (scrollbar) {
                        var chartScrollbar = chart.chartScrollbar;
                        if (chartScrollbar.ignoreCustomColors) {
                            ignoreCustomColor = true;
                        }
                    }

                    if (!ignoreCustomColor) {
                        if (graphDataItem.color != UNDEFINED) {
                            fillColorsReal = graphDataItem.color;
                        }

                        if (graphDataItem.fillColors) {
                            fillColorsReal = graphDataItem.fillColors;
                        }
                    }

                    switch (type) {
                        // LINE
                        case "line":
                            if (!isNaN(close)) {
                                if (Math.abs(xClose - previousLX) >= minDistance || Math.abs(yClose - previousLY) >= minDistance) {
                                    xx.push(xClose);
                                    yy.push(yClose);

                                    previousLX = xClose;
                                    previousLY = yClose;
                                }

                                labelX = xClose;
                                labelY = yClose;
                                bulletX = xClose;
                                bulletY = yClose;

                                if (stackableLine) {
                                    if (!isNaN(yOpen) && !isNaN(xOpen)) {
                                        sxx.push(xOpen);
                                        syy.push(yOpen);
                                    }
                                }


                                if (changeColor || (graphDataItem.lineColor != UNDEFINED && graphDataItem.lineColor != _this.lineColorSwitched) || (graphDataItem.fillColors != UNDEFINED && graphDataItem.fillColors != _this.fillColorsSwitched) || !isNaN(graphDataItem.dashLength)) {
                                    _this.drawLineGraph(xx, yy, sxx, syy);
                                    xx = [xClose];
                                    yy = [yClose];

                                    sxx = [];
                                    syy = [];

                                    if (stackableLine) {
                                        if (!isNaN(yOpen) && !isNaN(xOpen)) {
                                            sxx.push(xOpen);
                                            syy.push(yOpen);
                                        }
                                    }

                                    if (useNegativeColorIfDown) {
                                        if (nowIsPositive) {
                                            _this.lineColorSwitched = lineColor;
                                            _this.fillColorsSwitched = fillColors;
                                        } else {
                                            _this.lineColorSwitched = negativeLineColor;
                                            _this.fillColorsSwitched = negativeFillColors;
                                        }
                                    } else {
                                        _this.lineColorSwitched = graphDataItem.lineColor;
                                        _this.fillColorsSwitched = graphDataItem.fillColors;
                                    }
                                    _this.dashLengthSwitched = graphDataItem.dashLength;
                                }

                                if (graphDataItem.gap) {
                                    _this.drawLineGraph(xx, yy, sxx, syy);
                                    xx = [];
                                    yy = [];

                                    sxx = [];
                                    syy = [];
                                }

                            } else if (!connect) {
                                _this.drawLineGraph(xx, yy, sxx, syy);
                                xx = [];
                                yy = [];

                                sxx = [];
                                syy = [];
                            }
                            break;

                        case "smoothedLine":
                            if (!isNaN(close)) {

                                if (Math.abs(xClose - previousLX) >= minDistance || Math.abs(yClose - previousLY) >= minDistance) {
                                    xx.push(xClose);
                                    yy.push(yClose);

                                    previousLX = xClose;
                                    previousLY = yClose;
                                }

                                labelX = xClose;
                                labelY = yClose;
                                bulletX = xClose;
                                bulletY = yClose;

                                if (stackableLine) {
                                    if (!isNaN(yOpen) && !isNaN(xOpen)) {
                                        sxx.push(xOpen);
                                        syy.push(yOpen);
                                    }
                                }
                                if (graphDataItem.lineColor != UNDEFINED || graphDataItem.fillColors != UNDEFINED || !isNaN(graphDataItem.dashLength)) {
                                    _this.drawSmoothedGraph(xx, yy, sxx, syy);
                                    xx = [xClose];
                                    yy = [yClose];

                                    sxx = [];
                                    syy = [];

                                    if (stackableLine) {
                                        if (!isNaN(yOpen) && !isNaN(xOpen)) {
                                            sxx.push(xOpen);
                                            syy.push(yOpen);
                                        }
                                    }

                                    _this.lineColorSwitched = graphDataItem.lineColor;
                                    _this.fillColorsSwitched = graphDataItem.fillColors;
                                    _this.dashLengthSwitched = graphDataItem.dashLength;
                                }
                                if (graphDataItem.gap) {
                                    _this.drawSmoothedGraph(xx, yy, sxx, syy);
                                    xx = [];
                                    yy = [];

                                    sxx = [];
                                    syy = [];
                                }

                            } else if (!connect) {
                                _this.drawSmoothedGraph(xx, yy, sxx, syy);
                                xx = [];
                                yy = [];

                                sxx = [];
                                syy = [];
                            }
                            break;

                            // STEP
                        case "step":
                            if (!isNaN(close)) {

                                if (rotate) {
                                    if (!isNaN(previousxClose)) {
                                        xx.push(previousxClose);
                                        yy.push(yClose - stepLineDelta1);
                                    }
                                    yy.push(yClose - stepLineDelta1);
                                    xx.push(xClose);
                                    yy.push(yClose + stepLineDelta2);
                                    xx.push(xClose);

                                    if (stackableLine) {
                                        if (!isNaN(yOpen) && !isNaN(xOpen)) {
                                            if (!isNaN(previousxOpen)) {
                                                sxx.push(previousxOpen);
                                                syy.push(yOpen - stepLineDelta1);
                                            }
                                            sxx.push(xOpen);
                                            syy.push(yOpen - stepLineDelta1);
                                            sxx.push(xOpen);
                                            syy.push(yOpen + stepLineDelta2);
                                        }
                                    }
                                } else {
                                    if (!isNaN(previousyClose)) {
                                        //yy.push(previousyClose); 3.14.5 not 100% sure. fixes dashed line problem.
                                        //xx.push(previousxClose);

                                        yy.push(previousyClose);
                                        xx.push(xClose - stepLineDelta1);
                                    }
                                    xx.push(xClose - stepLineDelta1);
                                    yy.push(yClose);
                                    xx.push(xClose + stepLineDelta2);
                                    yy.push(yClose);

                                    if (stackableLine) {
                                        if (!isNaN(yOpen) && !isNaN(xOpen)) {
                                            if (!isNaN(previousyOpen)) {
                                                sxx.push(xOpen - stepLineDelta1);
                                                syy.push(previousyOpen);
                                            }

                                            sxx.push(xOpen - stepLineDelta1);
                                            syy.push(yOpen);
                                            sxx.push(xOpen + stepLineDelta2);
                                            syy.push(yOpen);
                                        }
                                    }
                                }
                                previousxClose = xClose;
                                previousyClose = yClose;
                                previousxOpen = xOpen;
                                previousyOpen = yOpen;
                                labelX = xClose;
                                labelY = yClose;
                                bulletX = xClose;
                                bulletY = yClose;

                                if (changeColor || graphDataItem.lineColor != UNDEFINED || graphDataItem.fillColors != UNDEFINED || !isNaN(graphDataItem.dashLength)) {
                                    var lastX = xx[xx.length - 2];
                                    var lastY = yy[yy.length - 2];

                                    xx.pop();
                                    yy.pop();

                                    _this.drawLineGraph(xx, yy, sxx, syy);

                                    xx = [lastX];
                                    yy = [lastY];

                                    if (rotate) {
                                        yy.push(yClose + stepLineDelta2);
                                        xx.push(xClose);
                                    } else {
                                        xx.push(xClose + stepLineDelta2); // 3.14.5 fixed problem with last data point's step
                                        yy.push(yClose); // 3.14.5
                                    }

                                    sxx = [];
                                    syy = [];

                                    _this.lineColorSwitched = graphDataItem.lineColor;
                                    _this.fillColorsSwitched = graphDataItem.fillColors;
                                    _this.dashLengthSwitched = graphDataItem.dashLength;

                                    if (useNegativeColorIfDown) {
                                        if (nowIsPositive) {
                                            _this.lineColorSwitched = lineColor;
                                            _this.fillColorsSwitched = fillColors;
                                        } else {
                                            _this.lineColorSwitched = negativeLineColor;
                                            _this.fillColorsSwitched = negativeFillColors;
                                        }
                                    }

                                }

                                if (noStepRisers || graphDataItem.gap) {
                                    previousyClose = NaN;
                                    previousxClose = NaN;
                                    _this.drawLineGraph(xx, yy, sxx, syy);
                                    xx = [];
                                    yy = [];

                                    sxx = [];
                                    syy = [];
                                }

                            } else if (!connect) {
                                if (_this.periodSpan <= 1 || (_this.periodSpan > 1 && xClose - previousxClose > stepLineDelta1 + stepLineDelta2)) {
                                    previousyClose = NaN;
                                    previousxClose = NaN;
                                }
                                _this.drawLineGraph(xx, yy, sxx, syy);
                                xx = [];
                                yy = [];

                                sxx = [];
                                syy = [];
                            }
                            break;


                            // COLUMN
                        case "column":
                            borderColor = lineColorReal;
                            if (graphDataItem.lineColor != UNDEFINED) {
                                borderColor = graphDataItem.lineColor;
                            }
                            if (!isNaN(close)) {
                                if (useNegativeColorIfDown) {

                                } else {
                                    if (close < negativeBase) {
                                        graphDataItem.isNegative = true;
                                    } else {
                                        graphDataItem.isNegative = false;
                                    }
                                }

                                if (graphDataItem.isNegative) {
                                    if (negativeFillColors) {
                                        fillColorsReal = negativeFillColors;
                                    }

                                    if (negativeLineColor != UNDEFINED) {
                                        borderColor = negativeLineColor;
                                    }
                                }

                                var min = valueAxis.min;
                                var max = valueAxis.max;

                                var realOpen = open;
                                if (isNaN(realOpen)) {
                                    realOpen = negativeBase;
                                }

                                if ((close < min && realOpen < min) || (close > max && realOpen > max)) {
                                    // void
                                } else {
                                    var cIndex;
                                    if (rotate) {
                                        if (stackType == "3d") {
                                            cy = yClose - (columnCount / 2 - _this.depthCount + 1) * (columnWidth + columnSpacing) + columnSpacing / 2 + dy * columnIndex;
                                            cx = xOpen + dx * columnIndex;
                                            cIndex = columnIndex;
                                        } else {
                                            cy = Math.floor(yClose - (columnCount / 2 - columnIndex) * (columnWidth + columnSpacing) + columnSpacing / 2);
                                            cx = xOpen;
                                            cIndex = 0;
                                        }

                                        cw = columnWidth;

                                        labelX = xClose;
                                        labelY = cy + columnWidth / 2;

                                        /*
                                        if (!isNaN(xOpen)) {
                                            if (xOpen > xClose && !graphDataItem.isNegative) {
                                                labelX = xOpen;
                                            }
                                        }*/

                                        bulletX = xClose;
                                        bulletY = cy + columnWidth / 2;

                                        if (cy + cw > height + cIndex * dy) {
                                            cw = height - cy + cIndex * dy;
                                        }

                                        if (cy < cIndex * dy) {
                                            cw += cy;
                                            cy = cIndex * dy;
                                        }

                                        ch = xClose - xOpen;

                                        var cxr = cx;
                                        cx = AmCharts.fitToBounds(cx, 0, width);

                                        ch = ch + (cxr - cx);
                                        ch = AmCharts.fitToBounds(ch, -cx, width - cx + dx * columnIndex);

                                        if (ch < 0) {
                                            graphDataItem.labelIsNegative = true;
                                        } else {
                                            graphDataItem.labelIsNegative = false;
                                        }

                                        if (ch === 0) {
                                            if (1 / close === 1 / -0) {
                                                graphDataItem.labelIsNegative = true;
                                            }
                                        }

                                        if (!isNaN(serialDataItem.percentWidthValue)) {
                                            cw = _this.height * serialDataItem.percentWidthValue / 100;
                                            cy = xxx - cw / 2;
                                            prevColumnY += cw;
                                            labelY = cy + cw / 2;
                                        }

                                        cw = AmCharts.roundTo(cw, 2);
                                        ch = AmCharts.roundTo(ch, 2);

                                        if (cy < height && cw > 0) {
                                            cuboid = new AmCharts.Cuboid(container, ch, cw, dx - chart.d3x, dy - chart.d3y, fillColorsReal, fillAlphasReal, lineThickness, borderColor, lineAlpha, gradientRotation, crt, rotate, dashLength, pattern, topRadius, columnBCN);
                                            graphDataItem.columnWidth = Math.abs(ch);
                                            graphDataItem.columnHeight = Math.abs(cw);
                                        }
                                    } else {
                                        if (stackType == "3d") {
                                            cx = xClose - (columnCount / 2 - _this.depthCount + 1) * (columnWidth + columnSpacing) + columnSpacing / 2 + dx * columnIndex;
                                            cy = yOpen + dy * columnIndex;
                                            cIndex = columnIndex;
                                        } else {
                                            cx = xClose - (columnCount / 2 - columnIndex) * (columnWidth + columnSpacing) + columnSpacing / 2;
                                            cy = yOpen;
                                            cIndex = 0;
                                        }
                                        cw = columnWidth;

                                        labelX = cx + columnWidth / 2;
                                        labelY = yClose;

                                        /*
                                        if (!isNaN(yOpen)) {
                                            if (yOpen < yClose && (!graphDataItem.isNegative && !valueAxis.reversed)) {
                                                labelY = yOpen;
                                            }
                                        }*/

                                        bulletX = cx + columnWidth / 2;
                                        bulletY = yClose;

                                        if (cx + cw > width + cIndex * dx) {
                                            cw = width - cx + cIndex * dx;
                                        }

                                        if (cx < cIndex * dx) {
                                            cw += cx - cIndex * dx;
                                            cx = cIndex * dx;
                                        }

                                        ch = yClose - yOpen;

                                        if (ch > 0) {
                                            graphDataItem.labelIsNegative = true;
                                        } else {
                                            graphDataItem.labelIsNegative = false;
                                        }

                                        if (ch === 0) {
                                            if (close === -0) {
                                                graphDataItem.labelIsNegative = true;
                                            }
                                        }

                                        var cyr = cy;
                                        cy = AmCharts.fitToBounds(cy, _this.dy, height);
                                        ch = ch + (cyr - cy);
                                        ch = AmCharts.fitToBounds(ch, -cy + dy * columnIndex, height - cy);

                                        if (!isNaN(serialDataItem.percentWidthValue)) {
                                            cw = _this.width * serialDataItem.percentWidthValue / 100;
                                            cx = xxx - cw / 2;
                                            prevColumnX += cw;
                                            labelX = cx + cw / 2;
                                        }
                                        cw = AmCharts.roundTo(cw, 2);
                                        ch = AmCharts.roundTo(ch, 2);

                                        if (cx < width + columnIndex * dx && cw > 0) {
                                            if (_this.showOnAxis) {
                                                cy -= dy / 2;
                                            }
                                            cuboid = new AmCharts.Cuboid(container, cw, ch, dx - chart.d3x, dy - chart.d3y, fillColorsReal, fillAlphasReal, lineThickness, borderColor, _this.lineAlpha, gradientRotation, crt, rotate, dashLength, pattern, topRadius, columnBCN);
                                            graphDataItem.columnHeight = Math.abs(ch);
                                            graphDataItem.columnWidth = Math.abs(cw);
                                        }
                                    }
                                }

                                if (cuboid) {
                                    cset = cuboid.set;

                                    //cuboid.setCN(chart, _this.bcn, _this.id, graphDataItem.className);
                                    AmCharts.setCN(chart, cuboid.set, "graph-" + _this.type);
                                    AmCharts.setCN(chart, cuboid.set, "graph-" + _this.id);


                                    if (graphDataItem.className) {
                                        AmCharts.setCN(chart, cuboid.set, graphDataItem.className, true);
                                    }

                                    graphDataItem.columnGraphics = cset;

                                    cx = AmCharts.roundTo(cx, 2);
                                    cy = AmCharts.roundTo(cy, 2);

                                    cset.translate(cx, cy);

                                    if (graphDataItem.url || _this.showHandOnHover) {
                                        cset.setAttr("cursor", "pointer");
                                    }

                                    // in case columns array is passed (it is not passed only for the scrollers chart, as it can"t be 3d
                                    // all columns are placed into array with predicted depth, then sorted by depth in Serial Chart and
                                    // added to columnsContainer which was created in AmSerialChart class
                                    if (!scrollbar) {
                                        if (stackType == "none") {
                                            if (rotate) {
                                                depth = (_this.end + 1 - i) * totalGarphs - index;
                                            } else {
                                                depth = totalGarphs * i + index;
                                            }
                                        }

                                        if (stackType == "3d") {
                                            if (rotate) {
                                                //depth = (totalGarphs - index) * (_this.end + 1 - i);
                                                depth = (_this.end + 1 - i) * totalGarphs - index - _this.depthCount * 1000;
                                                labelX += dx * _this.columnIndex;
                                                bulletX += dx * _this.columnIndex;

                                                graphDataItem.y += dx * _this.columnIndex;

                                            } else {
                                                depth = (totalGarphs - index) * (i + 1) + _this.depthCount * 1000;
                                                labelY += dy * _this.columnIndex;
                                                bulletY += dy * _this.columnIndex;

                                                graphDataItem.y += dy * _this.columnIndex;
                                            }

                                        }
                                        if (stackType == "regular" || stackType == "100%") {
                                            if (rotate) {
                                                if (values.value > 0) {
                                                    depth = (_this.end + 1 - i) * totalGarphs + index;
                                                } else {
                                                    depth = (_this.end + 1 - i) * totalGarphs - index;
                                                }
                                            } else {
                                                if (values.value > 0) {
                                                    depth = (totalGarphs * i) + index;
                                                } else {
                                                    depth = totalGarphs * i - index;
                                                }
                                            }
                                        }

                                        _this.columnsArray.push({
                                            column: cuboid,
                                            depth: depth
                                        });


                                        if (rotate) {
                                            graphDataItem.x = cy + cw / 2;
                                        } else {
                                            graphDataItem.x = cx + cw / 2;
                                        }
                                        _this.ownColumns.push(cuboid);
                                        _this.animateColumns(cuboid, i, xClose, xOpen, yClose, yOpen);
                                        _this.addListeners(cset, graphDataItem);
                                    }
                                    _this.columnsSet.push(cset);
                                    //graphDataItem.columnSprite = cset;
                                }
                            }
                            break;
                            // CANDLESTICK
                        case "candlestick":
                            if (!isNaN(open) && !isNaN(close)) {

                                var highLine;
                                var lowLine;

                                borderColor = lineColorReal;
                                if (graphDataItem.lineColor != UNDEFINED) {
                                    borderColor = graphDataItem.lineColor;
                                }

                                labelX = xClose;
                                labelY = yClose;
                                bulletY = yClose;
                                bulletX = xClose;

                                if (rotate) {
                                    if (showBulletsAt == "open") {
                                        bulletX = xOpen;
                                    }
                                    if (showBulletsAt == "high") {
                                        bulletX = xHigh;
                                    }
                                    if (showBulletsAt == "low") {
                                        bulletX = xLow;
                                    }

                                    xClose = AmCharts.fitToBounds(xClose, 0, rw);
                                    xOpen = AmCharts.fitToBounds(xOpen, 0, rw);
                                    xLow = AmCharts.fitToBounds(xLow, 0, rw);
                                    xHigh = AmCharts.fitToBounds(xHigh, 0, rw);

                                    if (xClose === 0 && xOpen === 0 && xLow === 0 && xHigh === 0) {
                                        continue;
                                    }

                                    if (xClose == rw && xOpen == rw && xLow == rw && xHigh == rw) {
                                        continue;
                                    }

                                    cy = yClose - columnWidth / 2;
                                    cx = xOpen;

                                    cw = columnWidth;
                                    if (cy + cw > height) {
                                        cw = height - cy;
                                    }

                                    if (cy < 0) {
                                        cw += cy;
                                        cy = 0;
                                    }

                                    if (cy < height && cw > 0) {
                                        var xArrayHigh;
                                        var xArrayLow;

                                        if (close > open) {
                                            xArrayHigh = [xClose, xHigh];
                                            xArrayLow = [xOpen, xLow];
                                        } else {
                                            xArrayHigh = [xOpen, xHigh];
                                            xArrayLow = [xClose, xLow];
                                        }
                                        if (!isNaN(xHigh) && !isNaN(xLow)) {
                                            if (yClose < height && yClose > 0) {
                                                highLine = AmCharts.line(container, xArrayHigh, [yClose, yClose], borderColor, lineAlpha, lineThickness);
                                                lowLine = AmCharts.line(container, xArrayLow, [yClose, yClose], borderColor, lineAlpha, lineThickness);
                                            }
                                        }
                                        ch = xClose - xOpen;

                                        cuboid = new AmCharts.Cuboid(container, ch, cw, dx, dy, fillColorsReal, fillAlphas, lineThickness, borderColor, lineAlpha, gradientRotation, crt, rotate, dashLength, pattern, topRadius, columnBCN);
                                    }
                                } else {
                                    if (showBulletsAt == "open") {
                                        bulletY = yOpen;
                                    }
                                    if (showBulletsAt == "high") {
                                        bulletY = yHigh;
                                    }
                                    if (showBulletsAt == "low") {
                                        bulletY = yLow;
                                    }

                                    yClose = AmCharts.fitToBounds(yClose, 0, rh);
                                    yOpen = AmCharts.fitToBounds(yOpen, 0, rh);
                                    yLow = AmCharts.fitToBounds(yLow, 0, rh);
                                    yHigh = AmCharts.fitToBounds(yHigh, 0, rh);

                                    if (yClose === 0 && yOpen === 0 && yLow === 0 && yHigh === 0) {
                                        continue;
                                    }

                                    if (yClose == rh && yOpen == rh && yLow == rh && yHigh == rh) {
                                        continue;
                                    }

                                    cx = xClose - columnWidth / 2;
                                    cy = yOpen + lineThickness / 2;

                                    cw = columnWidth;
                                    if (cx + cw > width) {
                                        cw = width - cx;
                                    }

                                    if (cx < 0) {
                                        cw += cx;
                                        cx = 0;
                                    }

                                    ch = yClose - yOpen;

                                    if (cx < width && cw > 0) {

                                        if (proCandlesticks) {
                                            if (close >= open) {
                                                fillAlphasReal = 0;
                                            }
                                        }

                                        cuboid = new AmCharts.Cuboid(container, cw, ch, dx, dy, fillColorsReal, fillAlphasReal, lineThickness, borderColor, lineAlpha, gradientRotation, crt, rotate, dashLength, pattern, topRadius, columnBCN);
                                        var yArrayHigh;
                                        var yArrayLow;


                                        if (close > open) {
                                            yArrayHigh = [yClose, yHigh];
                                            yArrayLow = [yOpen, yLow];
                                        } else {
                                            yArrayHigh = [yOpen, yHigh];
                                            yArrayLow = [yClose, yLow];
                                        }
                                        if (!isNaN(yHigh) && !isNaN(yLow)) {
                                            if (xClose < width && xClose > 0) {
                                                highLine = AmCharts.line(container, [xClose, xClose], yArrayHigh, borderColor, lineAlpha, lineThickness);
                                                lowLine = AmCharts.line(container, [xClose, xClose], yArrayLow, borderColor, lineAlpha, lineThickness);

                                                AmCharts.setCN(chart, highLine, _this.bcn + "line-high");
                                                if (graphDataItem.className) {
                                                    AmCharts.setCN(chart, highLine, graphDataItem.className, true);
                                                }

                                                AmCharts.setCN(chart, lowLine, _this.bcn + "line-low");
                                                if (graphDataItem.className) {
                                                    AmCharts.setCN(chart, lowLine, graphDataItem.className, true);
                                                }
                                            }
                                        }
                                    }
                                }
                                if (cuboid) {
                                    cset = cuboid.set;
                                    graphDataItem.columnGraphics = cset;
                                    set.push(cset);
                                    cset.translate(cx, cy - lineThickness / 2);

                                    if (graphDataItem.url || _this.showHandOnHover) {
                                        cset.setAttr("cursor", "pointer");
                                    }

                                    if (highLine) {
                                        set.push(highLine);
                                        set.push(lowLine);
                                    }

                                    if (!scrollbar) {
                                        if (rotate) {
                                            graphDataItem.x = cy + cw / 2;
                                        } else {
                                            graphDataItem.x = cx + cw / 2;
                                        }

                                        _this.animateColumns(cuboid, i, xClose, xOpen, yClose, yOpen);

                                        _this.addListeners(cset, graphDataItem);
                                    }
                                }
                            }
                            break;

                            // OHLC ////////////////////////
                        case "ohlc":
                            if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
                                var itemSet = container.set();
                                set.push(itemSet);
                                if (close < open) {
                                    graphDataItem.isNegative = true;

                                    if (negativeLineColor != UNDEFINED) {
                                        lineColorReal = negativeLineColor;
                                    }
                                }

                                var verticalLine;
                                var openLine;
                                var closeLine;
                                if (rotate) {
                                    bulletY = yClose;
                                    bulletX = xClose;
                                    if (showBulletsAt == "open") {
                                        bulletX = xOpen;
                                    }
                                    if (showBulletsAt == "high") {
                                        bulletX = xHigh;
                                    }
                                    if (showBulletsAt == "low") {
                                        bulletX = xLow;
                                    }

                                    xLow = AmCharts.fitToBounds(xLow, 0, rw);
                                    xHigh = AmCharts.fitToBounds(xHigh, 0, rw);

                                    if (xClose === 0 && xOpen === 0 && xLow === 0 && xHigh === 0) {
                                        continue;
                                    }

                                    if (xClose == rw && xOpen == rw && xLow == rw && xHigh == rw) {
                                        continue;
                                    }

                                    var y1 = yClose - columnWidth / 2;
                                    y1 = AmCharts.fitToBounds(y1, 0, height);
                                    var y2 = AmCharts.fitToBounds(yClose, 0, height);
                                    var y3 = yClose + columnWidth / 2;
                                    y3 = AmCharts.fitToBounds(y3, 0, height);
                                    if (xOpen >= 0 && xOpen <= rw) {
                                        openLine = AmCharts.line(container, [xOpen, xOpen], [y1, y2], lineColorReal, lineAlpha, lineThickness, dashLength);
                                    }
                                    if (yClose > 0 && yClose < height) {
                                        verticalLine = AmCharts.line(container, [xLow, xHigh], [yClose, yClose], lineColorReal, lineAlpha, lineThickness, dashLength);
                                    }
                                    if (xClose >= 0 && xClose <= rw) {
                                        closeLine = AmCharts.line(container, [xClose, xClose], [y2, y3], lineColorReal, lineAlpha, lineThickness, dashLength);
                                    }

                                } else {
                                    bulletY = yClose;
                                    if (showBulletsAt == "open") {
                                        bulletY = yOpen;
                                    }
                                    if (showBulletsAt == "high") {
                                        bulletY = yHigh;
                                    }
                                    if (showBulletsAt == "low") {
                                        bulletY = yLow;
                                    }
                                    bulletX = xClose;

                                    yLow = AmCharts.fitToBounds(yLow, 0, rh);
                                    yHigh = AmCharts.fitToBounds(yHigh, 0, rh);

                                    var x1 = xClose - columnWidth / 2;
                                    x1 = AmCharts.fitToBounds(x1, 0, width);
                                    var x2 = AmCharts.fitToBounds(xClose, 0, width);
                                    var x3 = xClose + columnWidth / 2;
                                    x3 = AmCharts.fitToBounds(x3, 0, width);
                                    if (yOpen >= 0 && yOpen <= rh) {
                                        openLine = AmCharts.line(container, [x1, x2], [yOpen, yOpen], lineColorReal, lineAlpha, lineThickness, dashLength);
                                    }
                                    if (xClose > 0 && xClose < width) {
                                        verticalLine = AmCharts.line(container, [xClose, xClose], [yLow, yHigh], lineColorReal, lineAlpha, lineThickness, dashLength);
                                    }
                                    if (yClose >= 0 && yClose <= rh) {
                                        closeLine = AmCharts.line(container, [x2, x3], [yClose, yClose], lineColorReal, lineAlpha, lineThickness, dashLength);
                                    }

                                }

                                set.push(openLine);
                                set.push(verticalLine);
                                set.push(closeLine);

                                AmCharts.setCN(chart, openLine, _this.bcn + "stroke-open");
                                AmCharts.setCN(chart, closeLine, _this.bcn + "stroke-close");
                                AmCharts.setCN(chart, verticalLine, _this.bcn + "stroke");
                                if (graphDataItem.className) {
                                    AmCharts.setCN(chart, itemSet, graphDataItem.className, true);
                                }

                                labelX = xClose;
                                labelY = yClose;
                            }
                            break;
                    }

                    // BULLETS AND LABELS
                    if (!scrollbar && !isNaN(close)) {
                        var hideBulletsCount = _this.hideBulletsCount;
                        if (_this.end - _this.start <= hideBulletsCount || hideBulletsCount === 0) {

                            var bullet = _this.createBullet(graphDataItem, bulletX, bulletY, i);

                            // LABELS ////////////////////////////////////////////////////////
                            var labelText = _this.labelText;

                            if (labelText && !isNaN(labelX) && !isNaN(labelX)) {
                                var lText = _this.createLabel(graphDataItem, labelText);
                                var bulletSize = 0;
                                if (bullet) {
                                    bulletSize = bullet.size;
                                }
                                _this.positionLabel(graphDataItem, labelX, labelY, lText, bulletSize);
                            }

                            // TOTALS
                            if (stackType == "regular" || stackType == "100%") {
                                var totalText = valueAxis.totalText;
                                if (totalText) {
                                    var tText = _this.createLabel(graphDataItem, totalText, valueAxis.totalTextColor);
                                    AmCharts.setCN(chart, tText, _this.bcn + "label-total");
                                    _this.allBullets.push(tText);

                                    if (tText) {
                                        var tbox = tText.getBBox();
                                        var tWidth = tbox.width;
                                        var tHeight = tbox.height;
                                        var tx;
                                        var ty;
                                        var totalTextOffset = valueAxis.totalTextOffset;

                                        var previousTotal = valueAxis.totals[i];
                                        if (previousTotal) {
                                            previousTotal.remove();
                                        }

                                        var lDelta = 0;
                                        if (type != "column") {
                                            lDelta = _this.bulletSize;
                                        }

                                        if (rotate) {
                                            ty = labelY;
                                            if (close < 0) {
                                                tx = xClose - tWidth / 2 - 2 - lDelta - totalTextOffset;
                                            } else {
                                                tx = xClose + tWidth / 2 + 3 + lDelta + totalTextOffset;
                                            }
                                        } else {
                                            tx = labelX;
                                            if (close < 0) {
                                                ty = yClose + tHeight / 2 + lDelta + totalTextOffset;
                                            } else {
                                                ty = yClose - tHeight / 2 - 3 - lDelta - totalTextOffset;
                                            }
                                        }
                                        tText.translate(tx, ty);
                                        valueAxis.totals[i] = tText;

                                        if (rotate) {
                                            if (ty < 0 || ty > height) {
                                                tText.remove();
                                            }
                                        } else {
                                            if (tx < 0 || tx > width) {
                                                tText.remove();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }


            if (type == "line" || type == "step" || type == "smoothedLine") {
                if (type == "smoothedLine") {
                    _this.drawSmoothedGraph(xx, yy, sxx, syy);
                } else {
                    _this.drawLineGraph(xx, yy, sxx, syy);
                }
                if (!scrollbar) {
                    _this.launchAnimation();
                }
            }

            if (_this.bulletsHidden) {
                _this.hideBullets();
            }
            if (_this.customBulletsHidden) {
                _this.hideCustomBullets();
            }
        },

        animateColumns: function(cuboid, i) {
            var _this = this;

            var duration = _this.chart.startDuration;

            if (duration > 0 && !_this.animationPlayed) {
                if (_this.seqAn) {
                    cuboid.set.hide();
                    _this.animationArray.push(cuboid);
                    var timeout = setTimeout(function() {
                        _this.animate.call(_this);
                    }, duration / (_this.end - _this.start + 1) * (i - _this.start) * 1000);
                    _this.timeOuts.push(timeout);
                } else {
                    _this.animate(cuboid);
                }
                _this.chart.animatable.push(cuboid);
            }
        },

        createLabel: function(graphDataItem, labelText, textColor) {
            var _this = this;
            var chart = _this.chart;
            var numberFormatter = _this.numberFormatter;
            if (!numberFormatter) {
                numberFormatter = chart.nf;
            }

            var color = graphDataItem.labelColor;
            if (!color) {
                color = _this.color;
            }
            if (!color) {
                color = chart.color;
            }
            if (textColor) {
                color = textColor;
            }

            var fontSize = _this.fontSize;
            if (fontSize === undefined) {
                fontSize = chart.fontSize;
                _this.fontSize = fontSize;
            }

            var labelFunction = _this.labelFunction;

            var text = chart.formatString(labelText, graphDataItem);
            text = AmCharts.cleanFromEmpty(text);

            if (labelFunction) {
                text = labelFunction(graphDataItem, text);
            }
            if (text !== undefined && text !== "") {
                var lText = AmCharts.text(_this.container, text, color, chart.fontFamily, fontSize);
                lText.node.style.pointerEvents = "none";
                AmCharts.setCN(chart, lText, _this.bcn + "label");

                _this.bulletSet.push(lText);
                return lText;
            }
        },

        positiveClip: function(obj) {
            var _this = this;
            obj.clipRect(_this.pmx, _this.pmy, _this.pmw, _this.pmh);
        },

        negativeClip: function(obj) {
            var _this = this;
            obj.clipRect(_this.nmx, _this.nmy, _this.nmw, _this.nmh);
        },

        drawLineGraph: function(xx, yy, sxx, syy) {
            var _this = this;
            if (xx.length > 1) {
                var noRounding = _this.noRounding;
                var set = _this.set;
                var chart = _this.chart;
                var container = _this.container;

                var positiveSet = container.set();
                var negativeSet = container.set();

                set.push(negativeSet);
                set.push(positiveSet);


                var lineAlpha = _this.lineAlpha;
                var lineThickness = _this.lineThickness;

                var fillAlphas = _this.fillAlphas;
                var lineColor = _this.lineColorR;


                var negativeLineAlpha = _this.negativeLineAlpha;
                if (isNaN(negativeLineAlpha)) {
                    negativeLineAlpha = lineAlpha;
                }

                var lineColorSwitched = _this.lineColorSwitched;
                if (lineColorSwitched) {
                    lineColor = lineColorSwitched;
                }

                var fillColors = _this.fillColorsR;

                var fillColorsSwitched = _this.fillColorsSwitched;
                if (fillColorsSwitched) {
                    fillColors = fillColorsSwitched;
                }

                var dashLength = _this.dashLength;
                var dashLengthSwitched = _this.dashLengthSwitched;
                if (dashLengthSwitched) {
                    dashLength = dashLengthSwitched;
                }

                var negativeLineColor = _this.negativeLineColor;
                var negativeFillColors = _this.negativeFillColors;
                var negativeFillAlphas = _this.negativeFillAlphas;

                var baseCoord = _this.baseCoord;

                if (_this.negativeBase !== 0) {
                    baseCoord = _this.valueAxis.getCoordinate(_this.negativeBase, noRounding);
                    if (baseCoord > _this.height) {
                        baseCoord = _this.height;
                    }
                    if (baseCoord < 0) {
                        baseCoord = 0;
                    }
                }

                // draw lines
                var line = AmCharts.line(container, xx, yy, lineColor, lineAlpha, lineThickness, dashLength, false, true, noRounding);
                AmCharts.setCN(chart, line, _this.bcn + "stroke");

                positiveSet.push(line);

                positiveSet.click(function(ev) {
                    _this.handleGraphEvent(ev, "clickGraph");
                }).mouseover(function(ev) {
                    _this.handleGraphEvent(ev, "rollOverGraph");
                }).mouseout(function(ev) {
                    _this.handleGraphEvent(ev, "rollOutGraph");
                }).touchmove(function(ev) {
                    _this.chart.handleMouseMove(ev);
                }).touchend(function(ev) {
                    _this.chart.handleTouchEnd(ev);
                });


                if (negativeLineColor !== undefined && !_this.useNegativeColorIfDown) {
                    var negativeLine = AmCharts.line(container, xx, yy, negativeLineColor, negativeLineAlpha, lineThickness, dashLength, false, true, noRounding);
                    AmCharts.setCN(chart, negativeLine, _this.bcn + "stroke");
                    AmCharts.setCN(chart, negativeLine, _this.bcn + "stroke-negative");
                    negativeSet.push(negativeLine);
                }

                if (fillAlphas > 0 || negativeFillAlphas > 0) {
                    var xxx = xx.join(";").split(";");
                    var yyy = yy.join(";").split(";");

                    var type = chart.type;
                    if (type == "serial" || type == "radar") {
                        if (sxx.length > 0) {
                            sxx.reverse();
                            syy.reverse();

                            xxx = xx.concat(sxx);
                            yyy = yy.concat(syy);
                        } else {
                            if (type == "radar") {
                                yyy.push(0);
                                xxx.push(0);
                            } else {
                                if (_this.rotate) {
                                    yyy.push(yyy[yyy.length - 1]);
                                    xxx.push(baseCoord);
                                    yyy.push(yyy[0]);
                                    xxx.push(baseCoord);
                                    yyy.push(yyy[0]);
                                    xxx.push(xxx[0]);
                                } else {
                                    xxx.push(xxx[xxx.length - 1]);
                                    yyy.push(baseCoord);
                                    xxx.push(xxx[0]);
                                    yyy.push(baseCoord);
                                    xxx.push(xx[0]);
                                    yyy.push(yyy[0]);
                                }
                            }
                        }
                    } else if (type == "xy") {
                        var fillToAxis = _this.fillToAxis;
                        if (fillToAxis) {
                            if (AmCharts.isString(fillToAxis)) {
                                fillToAxis = chart.getValueAxisById(fillToAxis);
                            }


                            if (fillToAxis.orientation == "H") {
                                if (fillToAxis.position == "top") {
                                    baseCoord = 0;
                                } else {
                                    baseCoord = fillToAxis.height;
                                }
                                xxx.push(xxx[xxx.length - 1]);
                                yyy.push(baseCoord);
                                xxx.push(xxx[0]);
                                yyy.push(baseCoord);
                                xxx.push(xx[0]);
                                yyy.push(yyy[0]);
                            } else {
                                if (fillToAxis.position == "left") {
                                    baseCoord = 0;
                                } else {
                                    baseCoord = fillToAxis.width;
                                }
                                yyy.push(yyy[yyy.length - 1]);
                                xxx.push(baseCoord);
                                yyy.push(yyy[0]);
                                xxx.push(baseCoord);
                                yyy.push(yyy[0]);
                                xxx.push(xxx[0]);
                            }
                        }
                    }
                    var gradientRotation = _this.gradientRotation;

                    if (fillAlphas > 0) {
                        var fill = AmCharts.polygon(container, xxx, yyy, fillColors, fillAlphas, 1, "#000", 0, gradientRotation, noRounding);
                        fill.pattern(_this.pattern, NaN, chart.path);

                        AmCharts.setCN(chart, fill, _this.bcn + "fill");

                        positiveSet.push(fill);
                    }

                    if (negativeFillColors || negativeLineColor !== undefined) {
                        if (isNaN(negativeFillAlphas)) {
                            negativeFillAlphas = fillAlphas;
                        }
                        if (!negativeFillColors) {
                            negativeFillColors = negativeLineColor;
                        }

                        var negativeFill = AmCharts.polygon(container, xxx, yyy, negativeFillColors, negativeFillAlphas, 1, "#000", 0, gradientRotation, noRounding);

                        AmCharts.setCN(chart, negativeFill, _this.bcn + "fill");
                        AmCharts.setCN(chart, negativeFill, _this.bcn + "fill-negative");

                        negativeFill.pattern(_this.pattern, NaN, chart.path);


                        negativeSet.push(negativeFill);

                        negativeSet.click(function(ev) {
                            _this.handleGraphEvent(ev, "clickGraph");
                        }).mouseover(function(ev) {
                            _this.handleGraphEvent(ev, "rollOverGraph");
                        }).mouseout(function(ev) {
                            _this.handleGraphEvent(ev, "rollOutGraph");
                        }).touchmove(function(ev) {
                            _this.chart.handleMouseMove(ev);
                        }).touchend(function(ev) {
                            _this.chart.handleTouchEnd(ev);
                        });
                    }
                }
                _this.applyMask(negativeSet, positiveSet);
            }
        },

        applyMask: function(negativeSet, positiveSet) {
            var _this = this;
            var length = negativeSet.length();
            if (_this.chart.type == "serial" && !_this.scrollbar) {
                _this.positiveClip(positiveSet);
                if (length > 0) {
                    _this.negativeClip(negativeSet);
                }
            }
        },


        drawSmoothedGraph: function(xx, yy, sxx, syy) {
            var _this = this;
            if (xx.length > 1) {
                var set = _this.set;
                var chart = _this.chart;
                var container = _this.container;

                var positiveSet = container.set();
                var negativeSet = container.set();

                set.push(negativeSet);
                set.push(positiveSet);

                var lineAlpha = _this.lineAlpha;
                var lineThickness = _this.lineThickness;
                var dashLength = _this.dashLength;
                var fillAlphas = _this.fillAlphas;
                var lineColor = _this.lineColorR;
                var fillColors = _this.fillColorsR;
                var negativeLineColor = _this.negativeLineColor;
                var negativeFillColors = _this.negativeFillColors;
                var negativeFillAlphas = _this.negativeFillAlphas;
                var baseCoord = _this.baseCoord;

                var lineColorSwitched = _this.lineColorSwitched;
                if (lineColorSwitched) {
                    lineColor = lineColorSwitched;
                }

                var fillColorsSwitched = _this.fillColorsSwitched;
                if (fillColorsSwitched) {
                    fillColors = fillColorsSwitched;
                }

                var negativeLineAlpha = _this.negativeLineAlpha;
                if (isNaN(negativeLineAlpha)) {
                    negativeLineAlpha = lineAlpha;
                }

                // draw lines
                var gradientRotation = _this.getGradRotation();

                var line = new AmCharts.Bezier(container, xx, yy, lineColor, lineAlpha, lineThickness, fillColors, 0, dashLength, undefined, gradientRotation);
                AmCharts.setCN(chart, line, _this.bcn + "stroke");
                positiveSet.push(line.path);

                if (negativeLineColor !== undefined) {
                    var negativeLine = new AmCharts.Bezier(container, xx, yy, negativeLineColor, negativeLineAlpha, lineThickness, fillColors, 0, dashLength, undefined, gradientRotation);
                    AmCharts.setCN(chart, negativeLine, _this.bcn + "stroke");
                    AmCharts.setCN(chart, negativeLine, _this.bcn + "stroke-negative");
                    negativeSet.push(negativeLine.path);
                }

                if (fillAlphas > 0) {
                    var xxx = xx.join(";").split(";");
                    var yyy = yy.join(";").split(";");

                    var endStr = "";
                    var comma = ",";

                    if (sxx.length > 0) {
                        sxx.push("M");
                        syy.push("M");
                        sxx.reverse();
                        syy.reverse();

                        xxx = xx.concat(sxx);
                        yyy = yy.concat(syy);
                    } else {

                        if (_this.rotate) {
                            endStr += " L" + baseCoord + comma + yy[yy.length - 1];
                            endStr += " L" + baseCoord + comma + yy[0];
                            endStr += " L" + xx[0] + comma + yy[0];
                        } else {
                            endStr += " L" + xx[xx.length - 1] + comma + baseCoord;
                            endStr += " L" + xx[0] + comma + baseCoord;
                            endStr += " L" + xx[0] + comma + yy[0];
                        }
                    }
                    var fill = new AmCharts.Bezier(container, xxx, yyy, NaN, 0, 0, fillColors, fillAlphas, dashLength, endStr, gradientRotation);
                    AmCharts.setCN(chart, fill, _this.bcn + "fill");
                    fill.path.pattern(_this.pattern, NaN, chart.path);
                    positiveSet.push(fill.path);

                    if (negativeFillColors || negativeLineColor !== undefined) {
                        if (!negativeFillAlphas) {
                            negativeFillAlphas = fillAlphas;
                        }
                        if (!negativeFillColors) {
                            negativeFillColors = negativeLineColor;
                        }

                        var negativeFill = new AmCharts.Bezier(container, xx, yy, NaN, 0, 0, negativeFillColors, negativeFillAlphas, dashLength, endStr, gradientRotation);
                        negativeFill.path.pattern(_this.pattern, NaN, chart.path);
                        AmCharts.setCN(chart, negativeFill, _this.bcn + "fill");
                        AmCharts.setCN(chart, negativeFill, _this.bcn + "fill-negative");
                        negativeSet.push(negativeFill.path);
                    }
                }
                _this.applyMask(negativeSet, positiveSet);
            }
        },


        launchAnimation: function() {
            var _this = this;
            var duration = _this.chart.startDuration;

            if (duration > 0 && !_this.animationPlayed) {

                var set = _this.set;
                var bulletSet = _this.bulletSet;

                if (!AmCharts.VML) {
                    set.attr({
                        "opacity": _this.startAlpha
                    });
                    bulletSet.attr({
                        "opacity": _this.startAlpha
                    });
                }

                set.hide();
                bulletSet.hide();

                if (_this.seqAn) {
                    var t = setTimeout(function() {
                        _this.animateGraphs.call(_this);
                    }, _this.index * duration * 1000);
                    _this.timeOuts.push(t);
                } else {
                    _this.animateGraphs();
                }
            }
        },

        animateGraphs: function() {
            var _this = this;
            var chart = _this.chart;
            var set = _this.set;
            var bulletSet = _this.bulletSet;
            var x = _this.x;
            var y = _this.y;

            set.show();
            bulletSet.show();

            var duration = chart.startDuration;
            var effect = chart.startEffect;

            if (set) {
                if (_this.rotate) {
                    set.translate(-1000, y);
                    bulletSet.translate(-1000, y);
                } else {
                    set.translate(x, -1000);
                    bulletSet.translate(x, -1000);
                }
                set.animate({
                    opacity: 1,
                    translate: x + "," + y
                }, duration, effect);
                bulletSet.animate({
                    opacity: 1,
                    translate: x + "," + y
                }, duration, effect);

                chart.animatable.push(set);
            }
        },

        animate: function(cuboid) {
            var _this = this;
            var chart = _this.chart;

            var animationArray = _this.animationArray;
            if (!cuboid && animationArray.length > 0) {
                cuboid = animationArray[0];
                animationArray.shift();
            }

            var effect = AmCharts[AmCharts.getEffect(chart.startEffect)];
            var duration = chart.startDuration;

            if (cuboid) {
                if (this.rotate) {
                    cuboid.animateWidth(duration, effect);
                } else {
                    cuboid.animateHeight(duration, effect);
                }
                var obj = cuboid.set;
                obj.show();
            }
        },

        legendKeyColor: function() {
            var _this = this;
            var color = _this.legendColor;
            var lineAlpha = _this.lineAlpha;

            if (color === undefined) {
                color = _this.lineColorR;

                if (lineAlpha === 0) {
                    var colorArray = _this.fillColorsR;
                    if (colorArray) {
                        if (typeof(colorArray) == "object") {
                            color = colorArray[0];
                        } else {
                            color = colorArray;
                        }
                    }
                }
            }
            return color;
        },

        legendKeyAlpha: function() {
            var _this = this;
            var alpha = _this.legendAlpha;
            if (alpha === undefined) {
                alpha = _this.lineAlpha;

                if (_this.fillAlphas > alpha) {
                    alpha = _this.fillAlphas;
                }

                if (alpha === 0) {
                    alpha = _this.bulletAlpha;
                }
                if (alpha === 0) {
                    alpha = 1;
                }
            }
            return alpha;
        },


        createBullet: function(graphDataItem, bulletX, bulletY) {
            var _this = this;
            if (!isNaN(bulletX) && !isNaN(bulletY)) {

                if (_this.bullet == "none" && !_this.customBullet && !graphDataItem.bullet && !graphDataItem.customBullet) {
                    return;
                }

                var chart = _this.chart;
                var container = _this.container;
                var bulletOffset = _this.bulletOffset;
                var bulletSize = _this.bulletSize;
                if (!isNaN(graphDataItem.bulletSize)) {
                    bulletSize = graphDataItem.bulletSize;
                }

                var value = graphDataItem.values.value;
                var maxValue = _this.maxValue;
                var minValue = _this.minValue;
                var maxBulletSize = _this.maxBulletSize;
                var minBulletSize = _this.minBulletSize;
                if (!isNaN(maxValue)) {
                    if (!isNaN(value)) {
                        //bulletSize = value / _this.maxValue * _this.maxBulletSize;
                        bulletSize = (value - minValue) / (maxValue - minValue) * (maxBulletSize - minBulletSize) + minBulletSize;
                    }
                    if (minValue == maxValue) {
                        bulletSize = maxBulletSize;
                    }
                }

                var originalSize = bulletSize;
                if (_this.bulletAxis) {
                    var error = graphDataItem.values.error;

                    if (!isNaN(error)) {
                        value = error;
                    }
                    bulletSize = _this.bulletAxis.stepWidth * value;
                }

                if (bulletSize < _this.minBulletSize) {
                    bulletSize = _this.minBulletSize;
                }

                if (_this.rotate) {
                    if (graphDataItem.isNegative) {
                        bulletX -= bulletOffset;
                    } else {
                        bulletX += bulletOffset;
                    }

                } else {
                    if (graphDataItem.isNegative) {
                        bulletY += bulletOffset;
                    } else {
                        bulletY -= bulletOffset;
                    }

                }

                var bulletColor = _this.bulletColorR;

                if (graphDataItem.lineColor) {
                    _this.bulletColorSwitched = graphDataItem.lineColor;
                }

                if (_this.bulletColorSwitched) {
                    bulletColor = _this.bulletColorSwitched;
                }

                if (graphDataItem.isNegative && _this.bulletColorNegative !== undefined) {
                    bulletColor = _this.bulletColorNegative;
                }

                if (graphDataItem.color !== undefined) {
                    bulletColor = graphDataItem.color;
                }

                var pattern;
                if (chart.type == "xy") {
                    if (_this.valueField) {
                        pattern = _this.pattern;
                        if (graphDataItem.pattern) {
                            pattern = graphDataItem.pattern;
                        }
                    }
                }

                var bulletType = _this.bullet;
                if (graphDataItem.bullet) {
                    bulletType = graphDataItem.bullet;
                }

                var bbt = _this.bulletBorderThickness;
                var bbc = _this.bulletBorderColorR;
                var bba = _this.bulletBorderAlpha;
                var bc = bulletColor;
                var ba = _this.bulletAlpha;

                if (!bbc) {
                    bbc = bc;
                }
                if (_this.useLineColorForBulletBorder) {
                    bbc = _this.lineColorR;
                    if (_this.lineColorSwitched) {
                        bbc = _this.lineColorSwitched;
                    }
                }

                var customAlpha = graphDataItem.alpha;
                if (!isNaN(customAlpha)) {
                    ba = customAlpha;
                }

                var extremeLeft = -0.5;

                var bullet = AmCharts.bullet(container, bulletType, bulletSize, bc, ba, bbt, bbc, bba, originalSize, 0, pattern, chart.path);

                var customBullet = _this.customBullet;

                if (graphDataItem.customBullet) {
                    customBullet = graphDataItem.customBullet;
                }

                if (customBullet) {
                    if (bullet) {
                        bullet.remove();
                    }

                    if (typeof(customBullet) == "function") {
                        var CustomBullet = customBullet;
                        var customBulletClass = new CustomBullet();

                        customBulletClass.chart = chart;

                        if (graphDataItem.bulletConfig) {
                            customBulletClass.availableSpace = bulletY;
                            customBulletClass.graph = _this;
                            customBulletClass.graphDataItem = graphDataItem;
                            customBulletClass.bulletY = bulletY;
                            graphDataItem.bulletConfig.minCoord = _this.minCoord - bulletY;
                            customBulletClass.bulletConfig = graphDataItem.bulletConfig;
                        }
                        customBulletClass.write(container);
                        if (bullet && customBulletClass.showBullet) {
                            customBulletClass.set.push(bullet);
                        }
                        graphDataItem.customBulletGraphics = customBulletClass.cset;
                        bullet = customBulletClass.set;
                    } else {
                        bullet = container.set();
                        var bulletImage = container.image(customBullet, 0, 0, bulletSize, bulletSize);
                        bullet.push(bulletImage);

                        if (_this.centerCustomBullets) {
                            bulletImage.translate(-bulletSize / 2, -bulletSize / 2);
                        }
                    }
                }

                if (bullet) {
                    if (graphDataItem.url || _this.showHandOnHover) {
                        bullet.setAttr("cursor", "pointer");
                    }

                    if (chart.type == "serial" || chart.type == "gantt") {
                        if (bulletX < extremeLeft || bulletX > _this.width || bulletY < -bulletSize / 2 || bulletY > _this.height) {
                            bullet.remove();
                            bullet = null;
                        }
                    }
                    if (bullet) {
                        _this.bulletSet.push(bullet);
                        bullet.translate(bulletX, bulletY);
                        _this.addListeners(bullet, graphDataItem);
                        _this.allBullets.push(bullet);
                    }
                    graphDataItem.bx = bulletX;
                    graphDataItem.by = bulletY;

                    AmCharts.setCN(chart, bullet, _this.bcn + "bullet");
                    if (graphDataItem.className) {
                        AmCharts.setCN(chart, bullet, graphDataItem.className, true);
                    }
                }

                if (bullet) {
                    bullet.size = bulletSize || 0;

                    var bulletHitAreaSize = _this.bulletHitAreaSize;
                    if(_this.bulletHitAreaSize){
                        var hitBullet = AmCharts.circle(container, bulletHitAreaSize, "#FFFFFF", 0.001, 0);
                        hitBullet.translate(bulletX, bulletY);
                        graphDataItem.hitBullet = hitBullet;
                        _this.bulletSet.push(hitBullet);
                        _this.addListeners(hitBullet, graphDataItem);
                    }

                    graphDataItem.bulletGraphics = bullet;
                } else {
                    bullet = {
                        size: 0
                    };
                }

                bullet.graphDataItem = graphDataItem;

                return bullet;
            }
        },

        showBullets: function() {
            var _this = this;
            var allBullets = _this.allBullets;
            var i;
            _this.bulletsHidden = false;
            for (i = 0; i < allBullets.length; i++) {
                allBullets[i].show();
            }
        },

        hideBullets: function() {
            var _this = this;
            var allBullets = _this.allBullets;
            var i;
            _this.bulletsHidden = true;
            for (i = 0; i < allBullets.length; i++) {
                allBullets[i].hide();
            }
        },

        showCustomBullets: function() {
            var _this = this;
            var allBullets = _this.allBullets;
            var i;
            _this.customBulletsHidden = false;
            for (i = 0; i < allBullets.length; i++) {
                var graphDataItem = allBullets[i].graphDataItem;
                if (graphDataItem.customBulletGraphics) {
                    graphDataItem.customBulletGraphics.show();
                }
            }
        },

        hideCustomBullets: function() {
            var _this = this;
            var allBullets = _this.allBullets;
            var i;
            _this.customBulletsHidden = true;
            for (i = 0; i < allBullets.length; i++) {
                var graphDataItem = allBullets[i].graphDataItem;
                if (graphDataItem.customBulletGraphics) {
                    graphDataItem.customBulletGraphics.hide();
                }
            }
        },


        addListeners: function(obj, dItem) {
            var _this = this;
            obj.mouseover(function(ev) {
                _this.handleRollOver(dItem, ev);
            }).mouseout(function(ev) {
                _this.handleRollOut(dItem, ev);
            }).touchend(function(ev) {
                _this.handleRollOver(dItem, ev);
                if (_this.chart.panEventsEnabled) {
                    _this.handleClick(dItem, ev);
                }
            }).touchstart(function(ev) {
                _this.handleRollOver(dItem, ev);
            }).click(function(ev) {
                _this.handleClick(dItem, ev);
            }).dblclick(function(ev) {
                _this.handleDoubleClick(dItem, ev);
            }).contextmenu(function(ev) {
                _this.handleRightClick(dItem, ev);
            });
        },

        handleRollOver: function(dItem, ev) {
            var _this = this;

            _this.handleGraphEvent(ev, "rollOverGraph");
            if (dItem) {                
                var chart = _this.chart;
                chart.isRolledOverBullet = true;
                var type = "rollOverGraphItem";
                var event = {
                    type: type,
                    item: dItem,
                    index: dItem.index,
                    graph: _this,
                    target: _this,
                    chart: _this.chart,
                    event: ev
                };
                _this.fire(event);
                chart.fire(event);
                clearTimeout(chart.hoverInt);

                var chartCursor = chart.chartCursor;
                if (chartCursor) {
                    if (chartCursor.valueBalloonsEnabled) {
                        return;
                    }
                }
                _this.showGraphBalloon(dItem, "V", true);
            }
        },


        handleRollOut: function(dItem, ev) {
            var _this = this;

            if (dItem) {                
                var type = "rollOutGraphItem";
                var chart = _this.chart;
                var event = {
                    type: type,
                    item: dItem,
                    index: dItem.index,
                    graph: this,
                    target: _this,
                    chart: _this.chart,
                    event: ev
                };
                _this.fire(event);
                chart.fire(event);
                chart.isRolledOverBullet = false;
            }

            _this.handleGraphEvent(ev, "rollOutGraph");
            var chart = _this.chart;
            var chartCursor = chart.chartCursor;
            if (chartCursor) {
                if (chartCursor.valueBalloonsEnabled) {
                    return;
                }
            }
            _this.hideBalloon();
        },

        handleClick: function(dItem, ev) {
            var _this = this;

            if(!_this.chart.checkTouchMoved() && _this.chart.checkTouchDuration()){

                if (dItem) {
                    var type = "clickGraphItem";
                    var event = {
                        type: type,
                        item: dItem,
                        index: dItem.index,
                        graph: _this,
                        target: _this,
                        chart: _this.chart,
                        event: ev
                    };
                    _this.fire(event);
                    _this.chart.fire(event);

                    AmCharts.getURL(dItem.url, _this.urlTarget);
                }

                _this.handleGraphEvent(ev, "clickGraph");
            }
        },

        handleGraphEvent: function(ev, type) {
            var _this = this;

            var event = {
                type: type,
                graph: _this,
                target: _this,
                chart: _this.chart,
                event: ev
            };
            _this.fire(event);
            _this.chart.fire(event);
        },

        handleRightClick: function(dItem, ev) {
            var _this = this;

            if (dItem) {
                var type = "rightClickGraphItem";
                var event = {
                    type: type,
                    item: dItem,
                    index: dItem.index,
                    graph: _this,
                    target: _this,
                    chart: _this.chart,
                    event: ev
                };
                _this.fire(event);
                _this.chart.fire(event);
            }
        },


        handleDoubleClick: function(dItem, ev) {
            var _this = this;

            if (dItem) {
                var type = "doubleClickGraphItem";
                var event = {
                    type: type,
                    item: dItem,
                    index: dItem.index,
                    graph: _this,
                    target: _this,
                    chart: _this.chart,
                    event: ev
                };
                _this.fire(event);
                _this.chart.fire(event);
            }
        },

        zoom: function(start, end) {
            var _this = this;
            _this.start = start;
            _this.end = end;
            _this.draw();
        },

        changeOpacity: function(a) {
            var _this = this;
            var set = _this.set;
            var OPACITY = "opacity";
            if (set) {
                set.setAttr(OPACITY, a);
            }
            var ownColumns = _this.ownColumns;
            if (ownColumns) {
                var i;
                for (i = 0; i < ownColumns.length; i++) {
                    var cset = ownColumns[i].set;
                    if (cset) {
                        cset.setAttr(OPACITY, a);
                    }
                }
            }
            var bulletSet = _this.bulletSet;
            if (bulletSet) {
                bulletSet.setAttr(OPACITY, a);
            }
        },

        destroy: function() {
            var _this = this;
            AmCharts.remove(_this.set);
            AmCharts.remove(_this.bulletSet);

            var timeOuts = _this.timeOuts;
            if (timeOuts) {
                var i;
                for (i = 0; i < timeOuts.length; i++) {
                    clearTimeout(timeOuts[i]);
                }
            }
            _this.timeOuts = [];
        },

        createBalloon: function() {
            var _this = this;
            var chart = _this.chart;

            if (!_this.balloon) {
                _this.balloon = {};
            } else {
                if (_this.balloon.destroy) {
                    _this.balloon.destroy();
                }
            }
            var balloon = _this.balloon;
            AmCharts.extend(balloon, chart.balloon, true);
            balloon.chart = chart;
            balloon.mainSet = chart.plotBalloonsSet;
            balloon.className = _this.id;
        },

        /// BALLOON
        hideBalloon: function() {
            var _this = this;
            var chart = _this.chart;

            if (!chart.chartCursor) {
                chart.hideBalloon();
            } else if (!chart.chartCursor.valueBalloonsEnabled) {
                chart.hideBalloon();
            }

            clearTimeout(_this.hoverInt);
            _this.hoverInt = setTimeout(function() {
                _this.hideBalloonReal.call(_this);
            }, chart.hideBalloonTime);
        },

        hideBalloonReal: function() {
            var _this = this;
            if (_this.balloon) {
                _this.balloon.hide();
            }

            _this.fixBulletSize();
        },

        fixBulletSize: function() {
            var _this = this;
            if (AmCharts.isModern) {
                var resizedItem = _this.resizedDItem;

                if (resizedItem) {
                    var bulletGraphics = resizedItem.bulletGraphics;
                    if (bulletGraphics) {
                        if (!bulletGraphics.doNotScale) { // restricts stock events from scaling and disappearing
                            bulletGraphics.translate(resizedItem.bx, resizedItem.by, 1);
                            bulletGraphics.setAttr("fill-opacity", _this.bulletAlpha);
                            bulletGraphics.setAttr("stroke-opacity", _this.bulletBorderAlpha);
                        }
                    }
                }
                _this.resizedDItem = null;
            }
        },

        // can not use showBalloon method, as it was always a property
        showGraphBalloon: function(dItem, pointerOrientation, follow, bulletSize, bulletAlpha) {
            var _this = this;
            var chart = _this.chart;
            var balloon = _this.balloon;

            var dx = 0;
            var dy = 0;
            var chartCursor = chart.chartCursor;
            var setBounds = true;
            if (chartCursor) {
                if (!chartCursor.valueBalloonsEnabled) {
                    balloon = chart.balloon;
                    dx = _this.x;
                    dy = _this.y;
                    setBounds = false;
                }
            } else {
                balloon = chart.balloon;
                dx = _this.x;
                dy = _this.y;
                setBounds = false;
            }


            clearTimeout(_this.hoverInt);

            if (chart.chartCursor) {
                _this.currentDataItem = dItem;

                if(chart.type == "serial" && chart.isRolledOverBullet && chart.chartCursor.valueBalloonsEnabled){
                    _this.hideBalloonReal();
                    return;
                }
            }

            _this.resizeBullet(dItem, bulletSize, bulletAlpha);

            if (balloon) {
                if (balloon.enabled && _this.showBalloon && !_this.hidden) {
                    var text = chart.formatString(_this.balloonText, dItem, true);

                    var balloonFunction = _this.balloonFunction;
                    if (balloonFunction) {
                        text = balloonFunction(dItem, dItem.graph);
                    }

                    if (text) {
                        text = AmCharts.cleanFromEmpty(text);
                    }

                    if (text && text !== "") {
                        var color = chart.getBalloonColor(_this, dItem);
                        //_this.balloon.showBullet = false;
                        if (!balloon.drop) {
                            balloon.pointerOrientation = pointerOrientation;
                        }

                        var bx = dItem.x;
                        var by = dItem.y;
                        if (chart.rotate) {
                            bx = dItem.y;
                            by = dItem.x;
                        }

                        bx += dx;
                        by += dy;

                        if (isNaN(bx) || isNaN(by)) {
                            _this.hideBalloonReal();
                            return;
                        }

                        var width = _this.width;
                        var height = _this.height;
                        if (setBounds) {
                            balloon.setBounds(dx, dy, width + dx, height + dy);
                        }

                        balloon.changeColor(color);
                        balloon.setPosition(bx, by);

                        balloon.fixPrevious();

                        if (balloon.fixedPosition) {
                            follow = false;
                        }

                        if (!follow) {
                            if (chart.type != "radar") {
                                if (bx < dx || bx > width + dx || by < dy || by > height + dy) {
                                    balloon.showBalloon(text);
                                    balloon.hide(0);
                                    return;
                                }
                            }
                        }

                        balloon.followCursor(follow);

                        balloon.showBalloon(text);
                    } else {
                        _this.hideBalloonReal();
                        _this.resizeBullet(dItem, bulletSize, bulletAlpha);
                    }
                    return;
                }
            }
            _this.hideBalloonReal();
        },

        resizeBullet: function(dItem, bulletSize, bulletAlpha) {
            var _this = this;
            // resize graphs bullet
            _this.fixBulletSize();
            if (dItem) {
                if (AmCharts.isModern) {
                    if ((bulletSize != 1 || !isNaN(bulletAlpha))) {
                        var bulletGraphics = dItem.bulletGraphics;
                        if (bulletGraphics) {
                            if (!bulletGraphics.doNotScale) { // restricts stock events from scaling and disappearing
                                bulletGraphics.translate(dItem.bx, dItem.by, bulletSize);

                                if (!isNaN(bulletAlpha)) {
                                    bulletGraphics.setAttr("fill-opacity", bulletAlpha);
                                    bulletGraphics.setAttr("stroke-opacity", bulletAlpha);
                                }

                                _this.resizedDItem = dItem;
                            }
                        }
                    }
                }
            }
        }



    });

})();
(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.ChartCursor = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "ChartCursor";
            _this.createEvents("changed", "zoomed", "onHideCursor", "onShowCursor", "draw", "selected", "moved", "panning", "zoomStarted");
            _this.enabled = true;
            _this.cursorAlpha = 1;
            _this.selectionAlpha = 0.2;
            _this.cursorColor = "#CC0000";
            _this.categoryBalloonAlpha = 1;
            _this.color = "#FFFFFF";
            _this.type = "cursor";
            _this.zoomed = false;
            _this.zoomable = true;
            _this.pan = false;
            _this.categoryBalloonDateFormat = "MMM DD, YYYY";
            _this.categoryBalloonText = "[[category]]";
            _this.valueBalloonsEnabled = true;
            _this.categoryBalloonEnabled = true;
            _this.rolledOver = false;
            _this.cursorPosition = "middle";
            _this.skipZoomDispatch = false;
            _this.bulletsEnabled = false;
            _this.bulletSize = 8;
            _this.oneBalloonOnly = false;
            _this.selectWithoutZooming = false;
            _this.graphBulletSize = 1.7;
            _this.animationDuration = 0.3;
            _this.zooming = false;
            _this.adjustment = 0;
            _this.avoidBalloonOverlapping = true;
            _this.leaveCursor = false;
            _this.leaveAfterTouch = true;
            _this.valueZoomable = false;
            //_this.graphBulletAlpha = 1;
            _this.balloonPointerOrientation = "horizontal";
            //_this.fullWidth;
            //_this.valueLine;
            //_this.valueLineBalloonEnabled;
            //_this.valueLineAlpha;

            // new properties
            _this.vLineEnabled = true;
            _this.hLineEnabled = true;

            _this.hZoomEnabled = false;
            _this.vZoomEnabled = false;

            AmCharts.applyTheme(_this, theme, _this.cname);
        },

        draw: function() {
            var _this = this;
            _this.destroy();
            var chart = _this.chart;
            chart.panRequired = true;
            var container = chart.container;
            _this.rotate = chart.rotate;
            _this.container = container;

            _this.prevLineWidth = NaN;
            _this.prevLineHeight = NaN;

            var set = container.set();
            set.translate(_this.x, _this.y);
            _this.set = set;

            chart.cursorSet.push(set);

            _this.createElements();

            if (AmCharts.isString(_this.limitToGraph)) {
                _this.limitToGraph = AmCharts.getObjById(chart.graphs, _this.limitToGraph);
                _this.fullWidth = false;
                _this.cursorPosition = "middle";
            }

            _this.pointer = _this.balloonPointerOrientation.substr(0, 1).toUpperCase();
            _this.isHidden = false;
            _this.hideLines();

            // backward compatibility only, doesn't do anything
            if (!_this.valueLineAxis) {
                _this.valueLineAxis = chart.valueAxes[0];
            }
        },

        createElements: function() {
            var _this = this;
            var chart = _this.chart;
            var dx = chart.dx;
            var dy = chart.dy;
            var width = _this.width;
            var height = _this.height;

            var vLineAlpha;
            var hLineAlpha;

            var cursorAlpha = _this.cursorAlpha;
            var valueLineAlpha = _this.valueLineAlpha;

            if (_this.rotate) {
                vLineAlpha = valueLineAlpha;
                hLineAlpha = cursorAlpha;
            } else {
                hLineAlpha = valueLineAlpha;
                vLineAlpha = cursorAlpha;
            }

            if (chart.type == "xy") {
                hLineAlpha = cursorAlpha;
                if(valueLineAlpha !== undefined){
                    hLineAlpha = valueLineAlpha;
                }
                
                vLineAlpha = cursorAlpha;
            }

            _this.vvLine = AmCharts.line(_this.container, [dx, 0, 0], [dy, 0, height], _this.cursorColor, vLineAlpha, 1);
            AmCharts.setCN(chart, _this.vvLine, "cursor-line");
            AmCharts.setCN(chart, _this.vvLine, "cursor-line-vertical");

            _this.hhLine = AmCharts.line(_this.container, [0, width, width + dx], [0, 0, dy], _this.cursorColor, hLineAlpha, 1);
            AmCharts.setCN(chart, _this.hhLine, "cursor-line");
            AmCharts.setCN(chart, _this.hhLine, "cursor-line-horizontal");

            // backward compatibility
            if (_this.rotate) {
                _this.vLine = _this.vvLine;
            } else {
                _this.vLine = _this.hhLine;
            }

            _this.set.push(_this.vvLine);
            _this.set.push(_this.hhLine);

            _this.set.node.style.pointerEvents = "none";

            // full cell-width cursor lines should be clipped.
            _this.fullLines = _this.container.set();
            //_this.set.push(_this.fullLines);

            var cursorLineSet = chart.cursorLineSet;
            cursorLineSet.push(_this.fullLines);
            cursorLineSet.translate(_this.x, _this.y);
            cursorLineSet.clipRect(0, 0, width, height);

            _this.set.clipRect(0, 0, width, height);
        },

        update: function() {
            var _this = this;
            var chart = _this.chart;

            var mouseX = chart.mouseX - _this.x;
            var mouseY = chart.mouseY - _this.y;

            _this.mouseX = mouseX;
            _this.mouseY = mouseY;

            _this.mouse2X = chart.mouse2X - _this.x;
            _this.mouse2Y = chart.mouse2Y - _this.y;

            var show;
            if (chart.chartData) {
                if (chart.chartData.length > 0) {
                    if (_this.mouseIsOver()) {
                        _this.hideGraphBalloons = false;
                        show = true;
                        _this.rolledOver = true;
                        _this.updateDrawing();
                        if (_this.vvLine) {
                            if (isNaN(_this.fx)) {
                                if (!chart.rotate && _this.limitToGraph) {
                                    // void
                                } else {
                                    _this.vvLine.translate(mouseX, 0);
                                }
                            }
                        }
                        if (_this.hhLine) {
                            if (isNaN(_this.fy)) {
                                if (chart.rotate && _this.limitToGraph) {
                                    // void
                                } else {
                                    _this.hhLine.translate(0, mouseY);
                                }
                            }
                        }

                        if (isNaN(_this.mouse2X)) {
                            _this.dispatchMovedEvent(mouseX, mouseY);
                        } else {
                            show = false;
                        }

                    } else {
                        if (!_this.forceShow) {
                            _this.hideCursor();
                        }
                    }

                    if (_this.zooming) {

                        if (!isNaN(_this.mouse2X)) {
                            if (!isNaN(_this.mouse2X0)) {
                                _this.dispatchPanEvent();
                            }
                            return;
                        }

                        if (_this.pan) {
                            _this.dispatchPanEvent();
                            return;
                        } else if (_this.hZoomEnabled || _this.vZoomEnabled) {
                            if (_this.zooming) {
                                _this.updateSelection();
                            }
                        }
                    }

                    if (show) {
                        _this.showCursor();
                    }
                }
            }
        },

        updateDrawing: function() {
            var _this = this;
            if (_this.drawing) {
                _this.chart.setMouseCursor("crosshair");
            }
            if (_this.drawingNow) {
                AmCharts.remove(_this.drawingLine);
                _this.drawingLine = AmCharts.line(_this.container, [_this.drawStartX, _this.mouseX], [_this.drawStartY, _this.mouseY], _this.cursorColor, 1, 1);
            }
        },

        fixWidth: function(width) {
            var _this = this;
            if (_this.fullWidth) {
                if (_this.prevLineWidth != width) {
                    var vvLine = _this.vvLine;
                    var x = 0;
                    if (vvLine) {
                        vvLine.remove();
                        x = vvLine.x;
                    }

                    vvLine = _this.container.set();
                    vvLine.translate(x, 0);
                    var rect = AmCharts.rect(_this.container, width, _this.height, _this.cursorColor, _this.cursorAlpha, 0);
                    AmCharts.setCN(_this.chart, rect, "cursor-fill");
                    rect.translate(-width / 2, 0);

                    vvLine.push(rect);
                    _this.vvLine = vvLine;
                    _this.fullLines.push(vvLine);

                    _this.prevLineWidth = width;
                }
            }
        },

        fixHeight: function(height) {
            var _this = this;
            if (_this.fullWidth) {
                if (_this.prevLineHeight != height) {

                    var hhLine = _this.hhLine;
                    var y = 0;
                    if (hhLine) {
                        hhLine.remove();
                        y = hhLine.y;
                    }

                    hhLine = _this.container.set();
                    hhLine.translate(0, y);
                    var rect = AmCharts.rect(_this.container, _this.width, height, _this.cursorColor, _this.cursorAlpha);
                    rect.translate(0, -height / 2);
                    hhLine.push(rect);
                    _this.fullLines.push(hhLine);
                    _this.hhLine = hhLine;
                    _this.prevLineHeight = height;
                }
            }
        },

        fixVLine: function(x, y) {
            var _this = this;
            if (!isNaN(x)) {

                if (!isNaN(_this.prevLineX)) {
                    if (_this.prevLineX != x) {
                        _this.vvLine.translate(_this.prevLineX, _this.prevLineY);
                    }
                } else {
                    var yy = 0;
                    var xx = _this.mouseX;

                    if (_this.limitToGraph) {
                        var categoryAxis = _this.chart.categoryAxis;
                        if (categoryAxis) {
                            if (!this.chart.rotate) {
                                if (categoryAxis.position == "bottom") {
                                    yy = _this.height;
                                } else {
                                    yy = -_this.height;
                                }
                            }
                            xx = x;
                        }
                    }

                    _this.vvLine.translate(xx, yy);
                }

                _this.fx = x;

                if (_this.prevLineX != x) {
                    var animationDuration = _this.animationDuration;
                    // while selection, we do not animate to match line with selection
                    if (_this.zooming) {
                        animationDuration = 0;
                    }
                    _this.vvLine.stop();

                    _this.vvLine.animate({
                        "translate": x + "," + y
                    }, animationDuration, "easeOutSine");
                    _this.prevLineX = x;
                    _this.prevLineY = y;
                }
            }
        },

        fixHLine: function(y, x) {
            var _this = this;
            if (!isNaN(y)) {
                if (!isNaN(_this.prevLineY)) {
                    if (_this.prevLineY != y) {
                        _this.hhLine.translate(_this.prevLineX, _this.prevLineY);
                    }
                } else {
                    var xx = 0;
                    var yy = _this.mouseY;
                    if (_this.limitToGraph) {
                        var categoryAxis = _this.chart.categoryAxis;
                        if (categoryAxis) {
                            if (this.chart.rotate) {
                                if (categoryAxis.position == "right") {
                                    xx = _this.width;
                                } else {
                                    xx = -_this.width;
                                }
                            }
                            yy = y;
                        }
                    }

                    _this.hhLine.translate(xx, yy);
                }
                _this.fy = y;

                if (_this.prevLineY != y) {
                    var animationDuration = _this.animationDuration;
                    // while selection, we do not animate to match line with selection
                    if (_this.zooming) {
                        animationDuration = 0;
                    }
                    _this.hhLine.stop();
                    _this.hhLine.animate({
                        "translate": x + "," + y
                    }, animationDuration, "easeOutSine");
                    _this.prevLineY = y;
                    _this.prevLineX = x;
                }
            }
        },

        hideCursor: function(skipEvent) {
            var _this = this;
            _this.forceShow = false;

            if (_this.chart.wasTouched && _this.leaveAfterTouch) {
                return;
            }

            if (!_this.isHidden && !_this.leaveCursor) {
                _this.hideLines();
                _this.isHidden = true;
                _this.fx = NaN;
                _this.fy = NaN;
                _this.mouseX0 = NaN;
                _this.mouseY0 = NaN;
                _this.prevLineX = NaN;
                _this.prevLineY = NaN;
                _this.index = NaN;

                if (!skipEvent) {
                    _this.fire({
                        target: _this,
                        chart: _this.chart,
                        type: "onHideCursor"
                    });
                } else {
                    _this.chart.handleCursorHide();
                }

                _this.chart.setMouseCursor("auto");

            }
        },

        hideLines: function() {
            var _this = this;
            if (_this.vvLine) {
                _this.vvLine.hide();
            }
            if (_this.hhLine) {
                _this.hhLine.hide();
            }
            if (_this.fullLines) {
                _this.fullLines.hide();
            }
            _this.isHidden = true;
            _this.chart.handleCursorHide();
        },

        showCursor: function(skipEvent) {
            var _this = this;

            if (_this.drawing || !_this.enabled) {
                return;
            }

            if (_this.vLineEnabled) {
                if (_this.vvLine) {
                    _this.vvLine.show();
                }
            }
            if (_this.hLineEnabled) {
                if (_this.hhLine) {
                    _this.hhLine.show();
                }
            }
            _this.isHidden = false;

            _this.updateFullLine();

            if (!skipEvent) {
                _this.fire({
                    target: _this,
                    chart: _this.chart,
                    type: "onShowCursor"
                });
            }

            if (_this.pan) {
                _this.chart.setMouseCursor("move");
            }
        },

        updateFullLine: function() {
            var _this = this;
            if (_this.zooming) {
                if (_this.fullWidth) {
                    if (_this.selection) {
                        if (_this.rotate) {
                            if (_this.selection.height > 0) {
                                _this.hhLine.hide();
                            }
                        } else {
                            if (_this.selection.width > 0) {
                                _this.vvLine.hide();
                            }
                        }
                    }
                }
            }
        },

        updateSelection: function() {

            var _this = this;
            if (!_this.pan && _this.enabled) {
                var x = _this.mouseX;
                var y = _this.mouseY;

                if (!isNaN(_this.fx)) {
                    x = _this.fx;
                }
                if (!isNaN(_this.fy)) {
                    y = _this.fy;
                }

                _this.clearSelection();

                var x0 = _this.mouseX0;
                var y0 = _this.mouseY0;

                var width = _this.width;
                var height = _this.height;

                x = AmCharts.fitToBounds(x, 0, width);
                y = AmCharts.fitToBounds(y, 0, height);

                var temp;

                if (x < x0) {
                    temp = x;
                    x = x0;
                    x0 = temp;
                }

                if (y < y0) {
                    temp = y;
                    y = y0;
                    y0 = temp;
                }

                if (_this.hZoomEnabled) {
                    width = x - x0;
                } else {
                    x0 = 0;
                }

                if (_this.vZoomEnabled) {
                    height = y - y0;
                } else {
                    y0 = 0;
                }

                if (isNaN(_this.mouse2X)) {
                    if (Math.abs(width) > 0 && Math.abs(height) > 0) {
                        var chart = _this.chart;
                        var selection = AmCharts.rect(_this.container, width, height, _this.cursorColor, _this.selectionAlpha);
                        AmCharts.setCN(chart, selection, "cursor-selection");
                        // store values for event
                        selection.width = width;
                        selection.height = height;

                        selection.translate(x0, y0);
                        _this.set.push(selection);
                        _this.selection = selection;
                    }
                }

                _this.updateFullLine();
            }
        },

        mouseIsOver: function() {
            var _this = this;
            var mouseX = _this.mouseX;
            var mouseY = _this.mouseY;

            if (_this.justReleased) {
                _this.justReleased = false;
                return true;
            }

            if (_this.mouseIsDown) {
                return true;
            }

            if (!_this.chart.mouseIsOver) {
                _this.handleMouseOut();
                return false;
            }

            if (mouseX > 0 && mouseX < _this.width && mouseY > 0 && mouseY < _this.height) {
                return true;
            } else {
                _this.handleMouseOut();
            }
        },

        fixPosition: function() {
            var _this = this;
            _this.prevX = NaN;
            _this.prevY = NaN;
        },

        handleMouseDown: function() {
            var _this = this;
            _this.update();
            if (_this.mouseIsOver()) {
                _this.mouseIsDown = true;
                _this.mouseX0 = _this.mouseX;
                _this.mouseY0 = _this.mouseY;

                _this.mouse2X0 = _this.mouse2X;
                _this.mouse2Y0 = _this.mouse2Y;

                if (_this.drawing) {
                    _this.drawStartY = _this.mouseY;
                    _this.drawStartX = _this.mouseX;
                    _this.drawingNow = true;
                    return;
                }

                _this.dispatchMovedEvent(_this.mouseX, _this.mouseY);

                if (!_this.pan && isNaN(_this.mouse2X0)) {
                    if (!isNaN(_this.fx)) {
                        _this.mouseX0 = _this.fx;
                    }
                    if (!isNaN(_this.fy)) {
                        _this.mouseY0 = _this.fy;
                    }
                }

                if (_this.hZoomEnabled || _this.vZoomEnabled) {
                    _this.zooming = true;

                    var e = {
                        chart: _this.chart,
                        target: _this,
                        type: "zoomStarted"
                    };
                    e.x = _this.mouseX / _this.width;
                    e.y = _this.mouseY / _this.height;

                    e.index = _this.index; // this will have value only with serial chart

                    _this.index0 = _this.index;
                    _this.timestamp0 = _this.timestamp;

                    _this.fire(e);
                }
            }
        },

        registerInitialMouse: function() {

        },

        handleReleaseOutside: function() {
            var _this = this;

            _this.mouseIsDown = false;

            if (_this.drawingNow) {
                _this.drawingNow = false;
                AmCharts.remove(_this.drawingLine);
                var drawStartX = _this.drawStartX;
                var drawStartY = _this.drawStartY;
                var mouseX = _this.mouseX;
                var mouseY = _this.mouseY;
                var chart = _this.chart;

                if (Math.abs(drawStartX - mouseX) > 2 || Math.abs(drawStartY - mouseY) > 2) {
                    var drawEvent = {
                        type: "draw",
                        target: _this,
                        chart: chart,
                        initialX: drawStartX,
                        initialY: drawStartY,
                        finalX: mouseX,
                        finalY: mouseY
                    };
                    _this.fire(drawEvent);
                }
            }


            if (_this.zooming) {
                _this.zooming = false;
                if (_this.selectWithoutZooming) {
                    _this.dispatchZoomEvent("selected");
                } else if (_this.hZoomEnabled || _this.vZoomEnabled) {
                    _this.dispatchZoomEvent("zoomed");
                }

                if (_this.rolledOver) {
                    _this.dispatchMovedEvent(_this.mouseX, _this.mouseY);
                }
            }


            _this.mouseX0 = NaN;
            _this.mouseY0 = NaN;
            _this.mouse2X0 = NaN;
            _this.mouse2Y0 = NaN;
        },

        dispatchZoomEvent: function(type) {
            var _this = this;
            if (!_this.pan) {
                var selection = _this.selection;
                if (selection) {

                    if (Math.abs(selection.width) > 3 && Math.abs(selection.height) > 3) {

                        var startIndex = Math.min(_this.index, _this.index0);
                        var endIndex = Math.max(_this.index, _this.index0);

                        var start = startIndex;
                        var end = endIndex;

                        var chart = _this.chart;
                        var chartData = chart.chartData;
                        var categoryAxis = chart.categoryAxis;
                        if (categoryAxis) {
                            if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                                if (chartData[startIndex]) {
                                    start = chartData[startIndex].time;
                                } else {
                                    start = Math.min(_this.timestamp0, _this.timestamp);
                                }
                                if (chartData[endIndex]) {
                                    end = chart.getEndTime(chartData[endIndex].time);
                                } else {
                                    end = Math.max(_this.timestamp0, _this.timestamp);
                                }
                            }
                        }

                        var e = {
                            type: type,
                            chart: _this.chart,
                            target: _this,
                            end: end,
                            start: start,
                            startIndex: startIndex,
                            endIndex: endIndex,
                            // not actually used, for backwards compatibility only
                            selectionHeight: selection.height,
                            selectionWidth: selection.width,
                            selectionY: selection.y,
                            selectionX: selection.x
                        };
                        var fire;

                        if (_this.hZoomEnabled) {
                            if (Math.abs(_this.mouseX0 - _this.mouseX) > 4) {
                                e.startX = _this.mouseX0 / _this.width;
                                e.endX = _this.mouseX / _this.width;
                                fire = true;
                            }
                        }
                        if (_this.vZoomEnabled) {
                            if (Math.abs(_this.mouseY0 - _this.mouseY) > 4) {
                                e.startY = 1 - _this.mouseY0 / _this.height;
                                e.endY = 1 - _this.mouseY / _this.height;
                                fire = true;
                            }
                        }

                        if (fire) {
                            _this.prevX = NaN;
                            _this.prevY = NaN;
                            _this.fire(e);
                            if (type != "selected") {
                                _this.clearSelection();
                            }
                        }
                        _this.hideCursor();
                    }
                }
            }
        },

        dispatchMovedEvent: function(x, y, type, skipEvent) {
            var _this = this;
            x = Math.round(x);
            y = Math.round(y);

            if (!_this.isHidden) {
                if (x != _this.prevX || y != _this.prevY || type == "changed") {

                    if (!type) {
                        type = "moved";
                    }

                    var fx = _this.fx;
                    var fy = _this.fy;
                    if (isNaN(fx)) {
                        fx = x;
                    }
                    if (isNaN(fy)) {
                        fy = y;
                    }
                    var panning = false;

                    if (_this.zooming && _this.pan) {
                        panning = true;
                    }

                    var e = {
                        hidden: _this.isHidden,
                        type: type,
                        chart: _this.chart,
                        target: _this,
                        x: x,
                        y: y,
                        finalX: fx,
                        finalY: fy,
                        zooming: _this.zooming,
                        panning: panning,
                        mostCloseGraph: _this.mostCloseGraph,
                        index: _this.index,
                        skip: skipEvent,
                        hideBalloons: _this.hideGraphBalloons
                    };

                    if (_this.rotate) {
                        e.position = y;
                        e.finalPosition = fy;
                    } else {
                        e.position = x;
                        e.finalPosition = fx;
                    }

                    _this.prevX = x;
                    _this.prevY = y;
                    if (!skipEvent) {
                        _this.fire(e);
                        if (type == "changed") {
                            _this.chart.fire(e);
                        }
                    } else {
                        // not oop style, but we still need this to triger balloons
                        _this.chart.handleCursorMove(e);
                    }
                }
            }
        },
        dispatchPanEvent: function() {
            var _this = this;

            if (_this.mouseIsDown) {

                var deltaX = AmCharts.roundTo((_this.mouseX - _this.mouseX0) / _this.width, 3);
                var deltaY = AmCharts.roundTo((_this.mouseY - _this.mouseY0) / _this.height, 3);

                var delta2X = AmCharts.roundTo((_this.mouse2X - _this.mouse2X0) / _this.width, 3);
                var delta2Y = AmCharts.roundTo((_this.mouse2Y - _this.mouse2Y0) / _this.height, 2);

                var dispatch = false;
                if (Math.abs(deltaX) !== 0 && Math.abs(deltaY) !== 0) {
                    dispatch = true;
                }
                if (_this.prevDeltaX == deltaX || _this.prevDeltaY == deltaY) {
                    dispatch = false;
                }

                if (!isNaN(delta2X) && !isNaN(delta2Y)) {
                    if (Math.abs(delta2X) !== 0 && Math.abs(delta2Y) !== 0) {
                        dispatch = true;
                    }
                    if (_this.prevDelta2X == delta2X || _this.prevDelta2Y == delta2Y) {
                        dispatch = false;
                    }
                }

                if (dispatch) {
                    _this.hideLines();
                    var e = {
                        type: "panning",
                        chart: _this.chart,
                        target: _this,
                        deltaX: deltaX,
                        deltaY: deltaY,
                        delta2X: delta2X,
                        delta2Y: delta2Y,
                        index: _this.index
                    };

                    _this.fire(e);

                    _this.prevDeltaX = deltaX;
                    _this.prevDeltaY = deltaY;
                    _this.prevDelta2X = delta2X;
                    _this.prevDelta2Y = delta2Y;
                }
            }
        },

        clearSelection: function() {
            var _this = this;
            var selection = _this.selection;
            if (selection) {
                selection.width = 0;
                selection.height = 0;
                selection.remove();
            }
        },

        destroy: function() {
            var _this = this;
            _this.clear();

            AmCharts.remove(_this.selection);
            _this.selection = null;

            clearTimeout(_this.syncTO);

            AmCharts.remove(_this.set);
        },

        clear: function() {

        },

        setTimestamp: function(time) {
            this.timestamp = time;
        },

        setIndex: function(index, skipEvent) {
            var _this = this;
            if (index != _this.index) {
                _this.index = index;
                if (!skipEvent && !_this.isHidden) {
                    _this.dispatchMovedEvent(_this.mouseX, _this.mouseY, "changed");
                }
            }
        },

        handleMouseOut: function() {
            var _this = this;
            if (_this.enabled && _this.rolledOver) {
                if (!_this.leaveCursor) {
                    _this.setIndex(undefined);
                }
                _this.forceShow = false;
                _this.hideCursor();
                _this.rolledOver = false;
            }
        },

        showCursorAt: function(category) {
            var _this = this;
            var chart = _this.chart;
            var categoryAxis = chart.categoryAxis;
            if (categoryAxis) {
                _this.setPosition(categoryAxis.categoryToCoordinate(category));
            }
        },

        setPosition: function(coordinate) {
            var _this = this;
            var chart = _this.chart;
            var categoryAxis = chart.categoryAxis;

            if (categoryAxis) {
                var yCoordinate;
                var xCoordinate;
                var category = categoryAxis.coordinateToValue(coordinate);

                categoryAxis.showBalloonAt(category);

                _this.forceShow = true;
                if (categoryAxis.stickBalloonToCategory) {
                    if (chart.rotate) {
                        _this.fixHLine(coordinate, 0);
                    } else {
                        _this.fixVLine(coordinate, 0);
                    }
                } else {
                    _this.showCursor();
                    if (chart.rotate) {
                        _this.hhLine.translate(0, coordinate);
                    } else {
                        _this.vvLine.translate(coordinate, 0);
                    }
                }

                if (chart.rotate) {
                    yCoordinate = coordinate;
                    _this.dispatchMovedEvent(xCoordinate, yCoordinate);
                } else {
                    xCoordinate = coordinate;
                    _this.dispatchMovedEvent(xCoordinate, yCoordinate);
                }

                if (chart.rotate) {
                    if (_this.vvLine) {
                        _this.vvLine.hide();
                    }
                    if (_this.hhLine) {
                        _this.hhLine.show();
                    }
                } else {
                    if (_this.hhLine) {
                        _this.hhLine.hide();
                    }
                    if (_this.vvLine) {
                        _this.vvLine.show();
                    }
                }
                _this.updateFullLine();
                _this.isHidden = false;

                _this.dispatchMovedEvent(xCoordinate, yCoordinate, "moved", true);
            }
        },

        enableDrawing: function(value) {
            var _this = this;
            _this.enabled = !value;
            _this.hideCursor();
            _this.drawing = value;
        },


        syncWithCursor: function(cursor, hideBalloon) {
            var _this = this;
            clearTimeout(_this.syncTO);
            if (cursor) {
                if (cursor.isHidden) {
                    _this.hideCursor(true);
                    return;
                }

                _this.syncWithCursorReal(cursor, hideBalloon);
            }
        },

        isZooming: function(zooming) {
            this.zooming = zooming;
        },


        syncWithCursorReal: function(cursor, hideBalloon) {
            var _this = this;
            var vvLine = cursor.vvLine;
            var hhLine = cursor.hhLine;
            _this.index = cursor.index;

            _this.forceShow = true;
            if (_this.zooming && _this.pan) {
                // void
            } else {
                _this.showCursor(true);
            }

            _this.hideGraphBalloons = hideBalloon;

            _this.justReleased = cursor.justReleased;
            _this.zooming = cursor.zooming;
            _this.index0 = cursor.index0;
            _this.mouseX0 = cursor.mouseX0;
            _this.mouseY0 = cursor.mouseY0;
            _this.mouse2X0 = cursor.mouse2X0;
            _this.mouse2Y0 = cursor.mouse2Y0;
            _this.timestamp0 = cursor.timestamp0;
            _this.prevDeltaX = cursor.prevDeltaX;
            _this.prevDeltaY = cursor.prevDeltaY;
            _this.prevDelta2X = cursor.prevDelta2X;
            _this.prevDelta2Y = cursor.prevDelta2Y;
            _this.fx = cursor.fx;
            _this.fy = cursor.fy;

            _this.index = cursor.index;
            if (cursor.zooming) {
                _this.updateSelection();
            }

            var x = cursor.mouseX;
            var y = cursor.mouseY;

            if (_this.rotate) {
                x = NaN;
                if (_this.vvLine) {
                    _this.vvLine.hide();
                }
                if (_this.hhLine && hhLine) {
                    if (!isNaN(cursor.fy)) {
                        _this.fixHLine(cursor.fy, 0);
                    } else {
                        _this.hhLine.translate(0, cursor.mouseY);
                    }
                }
            } else {
                y = NaN;
                if (_this.hhLine) {
                    _this.hhLine.hide();
                }
                if (_this.vvLine && vvLine) {
                    if (!isNaN(cursor.fx)) {
                        _this.fixVLine(cursor.fx, 0);
                    } else {
                        _this.vvLine.translate(cursor.mouseX, 0);
                    }
                }
            }

            _this.dispatchMovedEvent(x, y, "moved", true);
        }



    });
})();
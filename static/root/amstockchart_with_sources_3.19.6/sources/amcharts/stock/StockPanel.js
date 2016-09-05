(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.StockPanel = AmCharts.Class({

        inherits: AmCharts.AmSerialChart,

        construct: function(theme) {
            var _this = this;
            AmCharts.StockPanel.base.construct.call(_this, theme);
            _this.cname = "StockPanel";
            _this.theme = theme;
            _this.showComparedOnTop = true;

            _this.showCategoryAxis = true;
            _this.recalculateToPercents = "whenComparing";

            _this.panelHeaderPaddingTop = 0;
            _this.panelHeaderPaddingRight = 0;
            _this.panelHeaderPaddingLeft = 0;
            _this.panelHeaderPaddingBottom = 0;

            _this.trendLineAlpha = 1;
            _this.trendLineColor = "#00CC00";
            _this.trendLineColorHover = "#CC0000";
            _this.trendLineThickness = 2;
            _this.trendLineDashLength = 0;

            _this.stockGraphs = [];
            _this.drawingIconsEnabled = false;
            _this.iconSize = 38;
            _this.drawingEnabled = false;
            _this.erasingEnabled = false;

            _this.eraseAll = false;
            _this.allowTurningOff = false;
            _this.autoMargins = false;

            AmCharts.applyTheme(_this, theme, _this.cname);
        },

        initChart: function(noReset) {
            var _this = this;
            AmCharts.StockPanel.base.initChart.call(_this, noReset);

            if (_this.drawingIconsEnabled) {
                _this.createDrawIcons();
            }

            var chartCursor = _this.chartCursor;
            if (chartCursor) {
                _this.listenTo(chartCursor, "draw", _this.handleDraw);
            }
        },

        addStockGraph: function(value) {
            this.stockGraphs.push(value);
            return value;
        },

        // disables default zoom behavior
        //3.11.2
        handleCursorZoom: function(event) {
            event.start = NaN;
            event.end = NaN;
            AmCharts.StockPanel.base.handleCursorZoom.call(this, event);
        },

        removeStockGraph: function(stockGraph) {
            var stockGraphs = this.stockGraphs;
            var i;
            for (i = stockGraphs.length - 1; i >= 0; i--) {
                if (stockGraphs[i] == stockGraph) {
                    stockGraphs.splice(i, 1);
                }
            }
        },

        createDrawIcons: function() {
            var _this = this;
            var iconSize = _this.iconSize;
            var container = _this.container;
            var pathToImages = _this.pathToImages;

            var position = _this.realWidth - 2 * iconSize - 1 - _this.marginRight;

            var pencilHit = AmCharts.rect(container, iconSize, iconSize, "#000", 0.005);
            var eraserHit = AmCharts.rect(container, iconSize, iconSize, "#000", 0.005);
            eraserHit.translate(iconSize + 1, 0);

            var pencilButton = container.image(pathToImages + "pencilIcon" + _this.extension, 0, 0, iconSize, iconSize);
            AmCharts.setCN(_this, pencilButton, "pencil");

            _this.pencilButton = pencilButton;

            eraserHit.setAttr("cursor", "pointer");
            pencilHit.setAttr("cursor", "pointer");

            pencilHit.mouseup(function() {
                _this.handlePencilClick();
            });

            var pencilButtonPushed = container.image(pathToImages + "pencilIconH" + _this.extension, 0, 0, iconSize, iconSize);
            AmCharts.setCN(_this, pencilButtonPushed, "pencil-pushed");
            _this.pencilButtonPushed = pencilButtonPushed;
            if (!_this.drawingEnabled) {
                pencilButtonPushed.hide();
            }

            var eraserButton = container.image(pathToImages + "eraserIcon" + _this.extension, iconSize + 1, 0, iconSize, iconSize);
            AmCharts.setCN(_this, eraserButton, "eraser");
            _this.eraserButton = eraserButton;

            eraserHit.mouseup(function() {
                _this.handleEraserClick();
            });

            if (pencilHit.touchend) {
                pencilHit.touchend(function() {
                    _this.handlePencilClick();
                });
                eraserHit.touchend(function() {
                    _this.handleEraserClick();
                });
            }

            var eraserButtonPushed = container.image(pathToImages + "eraserIconH" + _this.extension, iconSize + 1, 0, iconSize, iconSize);
            AmCharts.setCN(_this, eraserButtonPushed, "eraser-pushed");
            _this.eraserButtonPushed = eraserButtonPushed;
            if (!_this.erasingEnabled) {
                eraserButtonPushed.hide();
            }

            var drawingSet = container.set([pencilButton, pencilButtonPushed, eraserButton, eraserButtonPushed, pencilHit, eraserHit]);
            AmCharts.setCN(_this, drawingSet, "drawing-tools");
            drawingSet.translate(position, 1);

            if (this.hideIcons) {
                drawingSet.hide();
            }
        },

        handlePencilClick: function() {
            var _this = this;
            var enabled = !_this.drawingEnabled;

            _this.disableDrawing(!enabled);

            _this.erasingEnabled = false;

            var eraserButtonPushed = _this.eraserButtonPushed;
            if (eraserButtonPushed) {
                eraserButtonPushed.hide();
            }

            var pencilButtonPushed = _this.pencilButtonPushed;

            if (enabled) {
                if (pencilButtonPushed) {
                    pencilButtonPushed.show();
                }
            } else {
                if (pencilButtonPushed) {
                    pencilButtonPushed.hide();
                }
                _this.setMouseCursor("auto");
            }
        },

        disableDrawing: function(value) {
            var _this = this;
            _this.drawingEnabled = !value;

            var chartCursor = _this.chartCursor;
            if (_this.stockChart) {
                _this.stockChart.enableCursors(value);

                if (chartCursor) {
                    chartCursor.enableDrawing(!value);
                }
            }
        },

        handleEraserClick: function() {
            var _this = this;

            _this.disableDrawing(true);

            var pencilButtonPushed = _this.pencilButtonPushed;
            if (pencilButtonPushed) {
                pencilButtonPushed.hide();
            }
            var eraserButtonPushed = _this.eraserButtonPushed;

            if (!_this.eraseAll) {
                var enabled = !_this.erasingEnabled;
                _this.erasingEnabled = enabled;

                if (enabled) {
                    if (eraserButtonPushed) {
                        eraserButtonPushed.show();
                    }
                    _this.setTrendColorHover(_this.trendLineColorHover);
                    _this.setMouseCursor("auto");
                } else {
                    if (eraserButtonPushed) {
                        eraserButtonPushed.hide();
                    }
                    _this.setTrendColorHover();
                }
            } else {
                var trendLines = _this.trendLines;
                var i;
                for (i = trendLines.length - 1; i >= 0; i--) {
                    var trendLine = trendLines[i];

                    if (!trendLine.isProtected) {
                        _this.removeTrendLine(trendLine);
                    }
                }
                _this.validateNow();
            }
        },

        setTrendColorHover: function(color) {
            var _this = this;
            var trendLines = this.trendLines;
            var i;
            for (i = trendLines.length - 1; i >= 0; i--) {
                var trendLine = trendLines[i];

                if (!trendLine.isProtected) {
                    trendLine.rollOverColor = color;
                }
                _this.listenTo(trendLine, "click", _this.handleTrendClick);
            }
        },


        handleDraw: function(event) {

            var _this = this;

            var drawOnAxis = _this.drawOnAxis;

            if (AmCharts.isString(drawOnAxis)) {
                drawOnAxis = _this.getValueAxisById(drawOnAxis);
            }

            if (!drawOnAxis) {
                drawOnAxis = _this.valueAxes[0];
            }

            _this.drawOnAxis = drawOnAxis;

            var categoryAxis = _this.categoryAxis;

            var x1 = event.initialX;
            var x2 = event.finalX;
            var y1 = event.initialY;
            var y2 = event.finalY;

            var trendLine = new AmCharts.TrendLine(_this.theme);

            trendLine.initialDate = categoryAxis.coordinateToDate(x1);
            trendLine.finalDate = categoryAxis.coordinateToDate(x2);
            trendLine.initialValue = drawOnAxis.coordinateToValue(y1);
            trendLine.finalValue = drawOnAxis.coordinateToValue(y2);

            trendLine.lineAlpha = _this.trendLineAlpha;
            trendLine.lineColor = _this.trendLineColor;
            trendLine.lineThickness = _this.trendLineThickness;
            trendLine.dashLength = _this.trendLineDashLength;
            trendLine.valueAxis = drawOnAxis;
            trendLine.categoryAxis = categoryAxis;

            _this.addTrendLine(trendLine);
            _this.listenTo(trendLine, "click", _this.handleTrendClick);
            _this.validateNow();
        },

        hideDrawingIcons: function(value) {
            var _this = this;
            _this.hideIcons = value;

            if (value) {
                _this.disableDrawing(value);
            }
        },


        handleTrendClick: function(event) {
            var _this = this;

            if (_this.erasingEnabled) {
                var trendLine = event.trendLine;

                if (!_this.eraseAll && !trendLine.isProtected) {
                    _this.removeTrendLine(trendLine);
                }
                _this.validateNow();
            }
        },

        handleWheelReal: function(delta, shift) {
            var _this = this;
            var scrollbarChart = _this.scrollbarChart;

            if (!_this.wheelBusy && scrollbarChart) {

                var startSign = 1;
                var endSign = 1;

                if (shift) {
                    startSign = -1;
                }

                var chartScrollbar = scrollbarChart.chartScrollbar;

                var categoryAxis = _this.categoryAxis;
                var minDuration = categoryAxis.minDuration();
                var startTime;
                var endTime;
                if (delta < 0) {
                    startTime = _this.startTime + startSign * minDuration;
                    endTime = _this.endTime + endSign * minDuration;
                } else {
                    startTime = _this.startTime - startSign * minDuration;
                    endTime = _this.endTime - endSign * minDuration;
                }

                if (startTime < _this.firstTime) {
                    startTime = _this.firstTime;
                }
                if (endTime > _this.lastTime) {
                    endTime = _this.lastTime;
                }

                if (startTime < endTime) {
                    chartScrollbar.timeZoom(startTime, endTime, true);
                }
            }
        }

    });
})();
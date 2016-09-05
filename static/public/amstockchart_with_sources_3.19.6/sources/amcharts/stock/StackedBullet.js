(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.StackedBullet = AmCharts.Class({

        construct: function() {
            var _this = this;
            //_this.fontSize = 11;
            _this.stackDown = false;
            _this.mastHeight = 8;
            _this.shapes = [];
            _this.backgroundColors = [];
            _this.backgroundAlphas = [];
            _this.borderAlphas = [];
            _this.borderColors = [];
            _this.colors = [];
            _this.rollOverColors = [];
            _this.showOnAxiss = [];
            _this.values = [];
            _this.showAts = [];
            _this.textColor = "#000000";
            _this.nextY = 0;
            _this.size = 16;
        },


        parseConfig: function() {
            var _this = this;
            var value = _this.bulletConfig;
            _this.eventObjects = value.eventObjects;
            _this.letters = value.letters;
            _this.shapes = value.shapes;
            _this.backgroundColors = value.backgroundColors;
            _this.backgroundAlphas = value.backgroundAlphas;
            _this.borderColors = value.borderColors;
            _this.borderAlphas = value.borderAlphas;
            _this.colors = value.colors;
            _this.rollOverColors = value.rollOverColors;
            _this.date = value.date;
            _this.showOnAxiss = value.showOnAxis;
            _this.axisCoordinate = value.minCoord;
            _this.showAts = value.showAts;
            _this.values = value.values;
            _this.fontSizes = value.fontSizes;
            _this.showBullets = value.showBullets;
        },

        write: function(container) {
            var _this = this;
            _this.parseConfig();
            _this.container = container;
            _this.bullets = [];
            _this.fontSize = _this.chart.fontSize;
            if (_this.graph) {
                var fs = _this.graph.fontSize;
                if (fs) {
                    _this.fontSize = fs;
                }
            }

            var bulletHeight = _this.mastHeight + 2 * (_this.fontSize / 2 + 2);
            var n = _this.letters.length;

            if (bulletHeight * n > _this.availableSpace) {
                _this.stackDown = true;
            }
            _this.set = container.set();
            _this.cset = container.set();
            _this.set.push(_this.cset);
            _this.set.doNotScale = true;

            var count = 0;
            var i;
            for (i = 0; i < n; i++) {
                _this.shape = _this.shapes[i];
                _this.backgroundColor = _this.backgroundColors[i];
                _this.backgroundAlpha = _this.backgroundAlphas[i];
                _this.borderAlpha = _this.borderAlphas[i];
                _this.borderColor = _this.borderColors[i];
                _this.rollOverColor = _this.rollOverColors[i];
                _this.showOnAxis = _this.showOnAxiss[i];
                _this.showBullet = _this.showBullets[i];
                _this.color = _this.colors[i];
                _this.value = _this.values[i];
                _this.showAt = _this.showAts[i];
                var fontSize = _this.fontSizes[i];
                if (!isNaN(fontSize)) {
                    _this.fontSize = fontSize;
                }
                this.addLetter(_this.letters[i], count, i);
                if (!_this.showOnAxis) {
                    count++;
                }
            }
        },

        addLetter: function(letter, count, index) {
            var _this = this;
            var container = this.container;
            var bullet = container.set();

            var dir = -1;

            var stackTemp = _this.stackDown;
            var valueAxis = _this.graph.valueAxis;
            if (_this.showOnAxis) {
                if (valueAxis.reversed) {
                    _this.stackDown = true;
                } else {
                    _this.stackDown = false;
                }
            }

            if (_this.stackDown) {
                dir = 1;
            }

            var delta = 0;
            var labelDelta = 0;
            var labelX = 0;
            var labelY = 0;
            var bulletY;
            var fontSize = _this.fontSize;

            var mastHeight = _this.mastHeight;
            var type = _this.shape;

            if (_this.showOnAxis) {
                count = 0;
            }

            var color = _this.textColor;
            if (_this.color !== undefined) {
                color = _this.color;
            }
            if (letter === undefined) {
                letter = "";
            }

            letter = AmCharts.fixBrakes(letter);
            var label = AmCharts.text(container, letter, color, _this.chart.fontFamily, _this.fontSize);
            label.node.style.pointerEvents = "none";
            var bbox = label.getBBox();
            var labelWidth = bbox.width;
            _this.labelWidth = labelWidth;

            var labelHeight = bbox.height;
            _this.labelHeight = labelHeight;

            var bulletGraphics;
            var bulletHeight = 0;


            switch (type) {
                case "sign":
                    bulletGraphics = _this.drawSign(bullet);
                    delta = 2;
                    labelDelta = mastHeight + 4 + fontSize / 2;
                    bulletHeight = mastHeight + fontSize + 4;
                    if (dir == 1) {
                        labelDelta -= 4;
                    }
                    break;
                case "flag":
                    bulletGraphics = _this.drawFlag(bullet);
                    delta = 2;
                    labelX = labelWidth / 2 + 3;
                    labelDelta = mastHeight + 4 + fontSize / 2;
                    bulletHeight = mastHeight + fontSize + 4;
                    if (dir == 1) {
                        labelDelta -= 4;
                    }
                    break;
                case "pin":
                    bulletGraphics = _this.drawPin(bullet);
                    labelDelta = 6 + fontSize / 2;
                    bulletHeight = fontSize + 8;
                    break;
                case "triangleUp":
                    bulletGraphics = _this.drawTriangleUp(bullet);
                    labelDelta = -fontSize - 1;
                    bulletHeight = fontSize + 4;
                    dir = -1;
                    count = 0;
                    break;
                case "triangleDown":
                    bulletGraphics = _this.drawTriangleDown(bullet);
                    labelDelta = fontSize + 1;
                    bulletHeight = fontSize + 4;
                    dir = -1;
                    count = 0;
                    break;
                case "triangleLeft":
                    bulletGraphics = _this.drawTriangleLeft(bullet);
                    labelX = fontSize;
                    bulletHeight = fontSize + 4;
                    dir = -1;
                    count = 0;
                    break;
                case "triangleRight":
                    bulletGraphics = _this.drawTriangleRight(bullet);
                    labelX = -fontSize;
                    dir = -1;
                    count = 0;
                    bulletHeight = fontSize + 4;
                    break;
                case "arrowUp":
                    bulletGraphics = _this.drawArrowUp(bullet);
                    if (dir == -1) {
                        count++;
                    }
                    label.hide();
                    break;
                case "arrowDown":
                    bulletGraphics = _this.drawArrowDown(bullet);
                    if (dir == 1) {
                        count++;
                    }
                    label.hide();
                    bulletHeight = fontSize + 4;
                    break;
                case "text":
                    dir = -1;
                    bulletGraphics = _this.drawTextBackground(bullet, label);
                    labelDelta = _this.labelHeight + 3;
                    bulletHeight = fontSize + 10;
                    break;
                case "round":
                    bulletGraphics = _this.drawCircle(bullet);
                    break;
            }

            _this.bullets[index] = bulletGraphics;

            if (_this.showOnAxis) {
                if (isNaN(_this.nextAxisY)) {
                    bulletY = _this.axisCoordinate;
                } else {
                    bulletY = _this.nextY;
                }

                labelY = labelDelta * dir;
                _this.nextAxisY = bulletY + dir * bulletHeight;
            } else if (_this.value) {

                var value = _this.value;

                if (valueAxis.recalculateToPercents) {
                    value = value / valueAxis.recBaseValue * 100 - 100;
                }

                bulletY = valueAxis.getCoordinate(value) - _this.bulletY;
                labelY = labelDelta * dir;
            } else if (_this.showAt) {
                var values = _this.graphDataItem.values;

                if (valueAxis.recalculateToPercents) {
                    values = _this.graphDataItem.percents;
                }

                if (values) {
                    var showOnValue = values[_this.showAt];
                    bulletY = valueAxis.getCoordinate(showOnValue) - _this.bulletY;
                    labelY = labelDelta * dir;
                }
            } else {
                bulletY = _this.nextY;
                labelY = labelDelta * dir;
            }


            label.translate(labelX, labelY);
            bullet.push(label);
            bullet.translate(0, bulletY);

            _this.addEventListeners(bullet, index);

            _this.nextY = bulletY + dir * bulletHeight;

            _this.stackDown = stackTemp;
        },

        addEventListeners: function(bullet, index) {
            var _this = this;

            bullet.click(function() {
                _this.handleClick(index);
            }).mouseover(function() {
                _this.handleMouseOver(index);
            }).touchend(function() {
                _this.handleMouseOver(index, true);
                _this.handleClick(index);
            }).mouseout(function() {
                _this.handleMouseOut(index);
            });
        },

        drawPin: function(set) {
            var _this = this;
            var dir = -1;
            if (_this.stackDown) {
                dir = 1;
            }

            var borderSize = _this.fontSize + 4;

            var xx = [0, borderSize / 2, borderSize / 2, -borderSize / 2, -borderSize / 2, 0];
            var yy = [0, dir * borderSize / 4, dir * (borderSize + borderSize / 4), dir * (borderSize + borderSize / 4), dir * borderSize / 4, 0];

            return _this.drawRealPolygon(set, xx, yy);
        },


        drawSign: function(set) {
            var _this = this;
            var dir = -1;
            if (_this.stackDown) {
                dir = 1;
            }

            var delta = _this.mastHeight * dir;
            var radius = _this.fontSize / 2 + 2;
            var mast = AmCharts.line(_this.container, [0, 0], [0, delta], _this.borderColor, _this.borderAlpha, 1);
            var circle = AmCharts.circle(_this.container, radius, _this.backgroundColor, _this.backgroundAlpha, 1, _this.borderColor, _this.borderAlpha);
            circle.translate(0, delta + radius * dir);
            set.push(mast);
            set.push(circle);
            _this.cset.push(set);
            return circle;
        },


        drawFlag: function(set) {
            var _this = this;
            var dir = -1;
            if (_this.stackDown) {
                dir = 1;
            }
            var rectPos;
            var h = _this.fontSize + 4;
            var w = _this.labelWidth + 6;

            var mastHeight = _this.mastHeight;

            if (dir == 1) {
                rectPos = dir * mastHeight;
            } else {
                rectPos = dir * mastHeight - h;
            }

            var mast = AmCharts.line(_this.container, [0, 0], [0, rectPos], _this.borderColor, _this.borderAlpha, 1);
            var rect = AmCharts.polygon(_this.container, [0, w, w, 0], [0, 0, h, h], _this.backgroundColor, _this.backgroundAlpha, 1, _this.borderColor, _this.borderAlpha);
            rect.translate(0, rectPos);
            set.push(mast);
            set.push(rect);
            _this.cset.push(set);
            return rect;
        },

        drawTriangleUp: function(set) {
            var _this = this;
            var triangleSize = _this.fontSize + 7;

            var xx = [0, triangleSize / 2, -triangleSize / 2, 0];
            var yy = [0, triangleSize, triangleSize, 0];

            return _this.drawRealPolygon(set, xx, yy);
        },

        drawArrowUp: function(set) {
            var _this = this;
            var s = _this.size;
            var ss = s / 2;
            var sss = s / 4;

            var xx = [0, ss, sss, sss, -sss, -sss, -ss, 0];
            var yy = [0, ss, ss, s, s, ss, ss, 0];
            return _this.drawRealPolygon(set, xx, yy);
        },

        drawArrowDown: function(set) {
            var _this = this;
            var s = _this.size;
            var ss = s / 2;
            var sss = s / 4;

            var xx = [0, ss, sss, sss, -sss, -sss, -ss, 0];
            var yy = [0, -ss, -ss, -s, -s, -ss, -ss, 0];

            return _this.drawRealPolygon(set, xx, yy);
        },

        drawTriangleDown: function(set) {
            var _this = this;
            var triangleSize = _this.fontSize + 7;

            var xx = [0, triangleSize / 2, -triangleSize / 2, 0];
            var yy = [0, -triangleSize, -triangleSize, 0];

            return _this.drawRealPolygon(set, xx, yy);
        },

        drawTriangleLeft: function(set) {
            var _this = this;
            var triangleSize = _this.fontSize + 7;

            var xx = [0, triangleSize, triangleSize, 0];
            var yy = [0, -triangleSize / 2, triangleSize / 2, 0];

            return _this.drawRealPolygon(set, xx, yy);
        },


        drawTriangleRight: function(set) {
            var _this = this;
            var triangleSize = _this.fontSize + 7;

            var xx = [0, -triangleSize, -triangleSize, 0];
            var yy = [0, -triangleSize / 2, triangleSize / 2, 0];

            return _this.drawRealPolygon(set, xx, yy);
        },


        drawRealPolygon: function(set, xx, yy) {
            var _this = this;

            var shape = AmCharts.polygon(_this.container, xx, yy, _this.backgroundColor, _this.backgroundAlpha, 1, _this.borderColor, _this.borderAlpha);
            set.push(shape);
            _this.cset.push(set);
            return shape;
        },

        drawCircle: function(set) {
            var _this = this;

            var shape = AmCharts.circle(_this.container, _this.fontSize / 2, _this.backgroundColor, _this.backgroundAlpha, 1, _this.borderColor, _this.borderAlpha);
            set.push(shape);
            _this.cset.push(set);
            return shape;
        },


        drawTextBackground: function(set, label) {
            var _this = this;
            var l = label.getBBox();
            var x1 = -l.width / 2 - 5;
            var x2 = l.width / 2 + 5;
            var xm = 0;
            var y1 = -5;
            var y2 = -l.height - 12;

            var xx;
            var yy;

            xx = [x1, xm - 5, xm, xm + 5, x2, x2, x1, x1];
            yy = [y1, y1, y1 + 5, y1, y1, y2, y2, y1];
            return _this.drawRealPolygon(set, xx, yy);
        },



        handleMouseOver: function(index, doNotChangeColor) {
            var _this = this;
            if (!doNotChangeColor) {
                _this.bullets[index].attr({
                    fill: _this.rollOverColors[index]
                });
            }
            var eventObject = _this.eventObjects[index];
            var e = {
                type: "rollOverStockEvent",
                eventObject: eventObject,
                graph: _this.graph,
                date: _this.date
            };
            var stockChart = _this.bulletConfig.eventDispatcher;
            e.chart = stockChart;
            stockChart.fire(e);

            if (eventObject.url) {
                _this.bullets[index].setAttr("cursor", "pointer");
            }

            var chart = _this.chart;
            chart.showBalloon(AmCharts.fixNewLines(eventObject.description), stockChart.stockEventsSettings.balloonColor, true);

            var graphs = chart.graphs;
            for (var i = 0; i < graphs.length; i++) {
                graphs[i].hideBalloon();
            }
        },

        handleClick: function(index) {
            var _this = this;
            var stockEvent = _this.eventObjects[index];
            var e = {
                type: "clickStockEvent",
                eventObject: stockEvent,
                graph: _this.graph,
                date: _this.date
            };
            var stockChart = _this.bulletConfig.eventDispatcher;

            e.chart = stockChart;
            stockChart.fire(e);

            var urlTarget = stockEvent.urlTarget;
            if (!urlTarget) {
                urlTarget = stockChart.stockEventsSettings.urlTarget;
            }

            AmCharts.getURL(stockEvent.url, urlTarget);
        },

        handleMouseOut: function(index) {
            var _this = this;
            _this.bullets[index].attr({
                fill: _this.backgroundColors[index]
            });

            var e = {
                type: "rollOutStockEvent",
                eventObject: _this.eventObjects[index],
                graph: _this.graph,
                date: _this.date
            };
            var stockChart = _this.bulletConfig.eventDispatcher;
            e.chart = stockChart;
            _this.chart.hideBalloonReal();
            stockChart.fire(e);
        }
    });
})();
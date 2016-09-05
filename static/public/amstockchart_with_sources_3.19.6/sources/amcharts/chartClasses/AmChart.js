(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.AmChart = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.tapToActivate = true;
            _this.svgIcons = true;
            _this.theme = theme;
            _this.classNamePrefix = "amcharts";
            _this.addClassNames = false;
            _this.version = "3.19.6";
            AmCharts.addChart(_this);
            _this.createEvents("buildStarted", "dataUpdated", "init", "rendered", "drawn", "failed", "resized", "animationFinished");
            _this.width = "100%";
            _this.height = "100%";
            _this.dataChanged = true;
            _this.chartCreated = false;
            _this.previousHeight = 0;
            _this.previousWidth = 0;
            _this.backgroundColor = "#FFFFFF";
            _this.backgroundAlpha = 0;
            _this.borderAlpha = 0;
            _this.borderColor = "#000000";
            _this.color = "#000000";
            _this.fontFamily = "Verdana";
            _this.fontSize = 11;
            _this.usePrefixes = false;
            _this.autoResize = true;
            _this.autoDisplay = false;
            //_this.path = "amcharts/";
            _this.addCodeCredits = true;
            _this.touchClickDuration = 0;
            _this.touchStartTime = 0;

            _this.precision = -1;
            _this.percentPrecision = 2;
            _this.decimalSeparator = ".";
            _this.thousandsSeparator = ",";

            _this.labels = [];
            _this.allLabels = [];
            _this.titles = [];
            _this.autoMarginOffset = 0;
            _this.marginLeft = 0;
            _this.marginRight = 0;
            _this.timeOuts = [];
            _this.creditsPosition = "top-left";

            var chartDiv = document.createElement("div");
            var chartStyle = chartDiv.style;
            chartStyle.overflow = "hidden";
            chartStyle.position = "relative";
            chartStyle.textAlign = "left";
            _this.chartDiv = chartDiv;

            var legendDiv = document.createElement("div");
            var legendStyle = legendDiv.style;
            legendStyle.overflow = "hidden";
            legendStyle.position = "relative";
            legendStyle.textAlign = "left";
            _this.legendDiv = legendDiv;

            _this.titleHeight = 0;
            _this.hideBalloonTime = 150;

            _this.handDrawScatter = 2;
            _this.handDrawThickness = 1;


            _this.prefixesOfBigNumbers = [{
                number: 1e+3,
                prefix: "k"
            }, {
                number: 1e+6,
                prefix: "M"
            }, {
                number: 1e+9,
                prefix: "G"
            }, {
                number: 1e+12,
                prefix: "T"
            }, {
                number: 1e+15,
                prefix: "P"
            }, {
                number: 1e+18,
                prefix: "E"
            }, {
                number: 1e+21,
                prefix: "Z"
            }, {
                number: 1e+24,
                prefix: "Y"
            }];
            _this.prefixesOfSmallNumbers = [{
                number: 1e-24,
                prefix: "y"
            }, {
                number: 1e-21,
                prefix: "z"
            }, {
                number: 1e-18,
                prefix: "a"
            }, {
                number: 1e-15,
                prefix: "f"
            }, {
                number: 1e-12,
                prefix: "p"
            }, {
                number: 1e-9,
                prefix: "n"
            }, {
                number: 1e-6,
                prefix: "μ"
            }, {
                number: 1e-3,
                prefix: "m"
            }];
            _this.panEventsEnabled = true; // changed since 3.4.4


            _this.product = "amcharts";

            _this.animations = [];

            _this.balloon = new AmCharts.AmBalloon(_this.theme);
            _this.balloon.chart = this;

            _this.processTimeout = 0;
            _this.processCount = 1000;

            _this.animatable = [];

            AmCharts.applyTheme(_this, theme, "AmChart");
        },

        drawChart: function() {
            var _this = this;

            if (_this.realWidth > 0 && _this.realHeight > 0) {

                _this.drawBackground();

                _this.redrawLabels();

                _this.drawTitles();

                _this.brr();

                _this.renderFix();

                if (_this.chartDiv) {
                    _this.boundingRect = _this.chartDiv.getBoundingClientRect();
                }
            }
        },

        drawBackground: function() {
            var _this = this;
            AmCharts.remove(_this.background);
            var container = _this.container;
            var backgroundColor = _this.backgroundColor;
            var backgroundAlpha = _this.backgroundAlpha;
            var set = _this.set;

            if (!AmCharts.isModern && backgroundAlpha === 0) {
                backgroundAlpha = 0.001;
            }

            var realWidth = _this.updateWidth();
            _this.realWidth = realWidth;

            var realHeight = _this.updateHeight();
            _this.realHeight = realHeight;

            var background = AmCharts.polygon(container, [0, realWidth - 1, realWidth - 1, 0], [0, 0, realHeight - 1, realHeight - 1], backgroundColor, backgroundAlpha, 1, _this.borderColor, _this.borderAlpha);
            AmCharts.setCN(_this, background, "bg");
            _this.background = background;
            set.push(background);

            var backgroundImage = _this.backgroundImage;
            if (backgroundImage) {
                var bgImg = container.image(backgroundImage, 0, 0, realWidth, realHeight);
                AmCharts.setCN(_this, backgroundImage, "bg-image");
                _this.bgImg = bgImg;
                set.push(bgImg);
            }
        },

        drawTitles: function(remove) {
            var _this = this;
            var titles = _this.titles;
            _this.titleHeight = 0;

            if (AmCharts.ifArray(titles)) {
                var nextY = 20;
                var i;
                for (i = 0; i < titles.length; i++) {
                    var title = titles[i];
                    title = AmCharts.processObject(title, AmCharts.Title, _this.theme);

                    if (title.enabled !== false) {
                        var color = title.color;
                        if (color === undefined) {
                            color = _this.color;
                        }
                        var size = title.size;

                        if (isNaN(size)) {
                            size = _this.fontSize + 2;
                        }

                        var alpha = title.alpha;
                        if (isNaN(alpha)) {
                            alpha = 1;
                        }

                        var marginLeft = _this.marginLeft;
                        var bold = true;
                        if (title.bold !== undefined) {
                            bold = title.bold;
                        }

                        var dw = 35;
                        var titleLabel = AmCharts.wrappedText(_this.container, title.text, color, _this.fontFamily, size, "middle", bold, _this.realWidth - dw);
                        titleLabel.translate(marginLeft + (_this.realWidth - _this.marginRight - marginLeft) / 2, nextY);
                        titleLabel.node.style.pointerEvents = "none";
                        title.sprite = titleLabel;

                        AmCharts.setCN(_this, titleLabel, "title");
                        if (title.id) {
                            AmCharts.setCN(_this, titleLabel, "title-" + title.id);
                        }

                        titleLabel.attr({
                            opacity: title.alpha
                        });

                        nextY += titleLabel.getBBox().height + 5;
                        if (remove) {
                            titleLabel.remove();
                        } else {
                            _this.freeLabelsSet.push(titleLabel);
                        }
                    }
                }
                _this.titleHeight = nextY - 10;
            }
        },

        write: function(divId) {

            var _this = this;

            if (_this.listeners) {
                for (var i = 0; i < _this.listeners.length; i++) {
                    var ev = _this.listeners[i];
                    _this.addListener(ev.event, ev.method);
                }
            }

            var event = {
                type: "buildStarted",
                chart: _this
            };
            _this.fire(event);
            if (_this.afterWriteTO) {
                clearTimeout(_this.afterWriteTO);
            }

            if (_this.processTimeout > 0) {
                _this.afterWriteTO = setTimeout(function() {
                    _this.afterWrite.call(_this, divId);
                }, _this.processTimeout);
            } else {
                _this.afterWrite(divId);
            }
        },


        afterWrite: function(divId) {
            var _this = this;
            var div;
            if (typeof(divId) != "object") {
                div = document.getElementById(divId);
            } else {
                div = divId;
            }
            if (div) {
                //div.innerHTML = "";
                // fixed ammap prob
                while (div.firstChild) {
                    div.removeChild(div.firstChild);
                }

                _this.div = div;
                div.style.overflow = "hidden";
                div.style.textAlign = "left";

                var chartDiv = _this.chartDiv;
                var legendDiv = _this.legendDiv;
                var legend = _this.legend;
                var legendStyle = legendDiv.style;

                var chartStyle = chartDiv.style;
                _this.measure();

                _this.previousHeight = _this.divRealHeight;
                _this.previousWidth = _this.divRealWidth;

                var UNDEFINED;
                var ABSOLUTE = "absolute";
                var RELATIVE = "relative";
                var PX = "px";
                var containerStyle;

                var container = document.createElement("div");
                containerStyle = container.style;
                containerStyle.position = RELATIVE;
                _this.containerDiv = container;
                container.className = _this.classNamePrefix + "-main-div";
                chartDiv.className = _this.classNamePrefix + "-chart-div";

                div.appendChild(container);

                var exportConfig = _this.exportConfig;

                if (exportConfig && AmCharts.AmExport) {
                    var amExport = _this.AmExport;
                    if (!amExport) {
                        _this.AmExport = new AmCharts.AmExport(this, exportConfig);
                    }
                }

                if (_this.amExport && AmCharts.AmExport) {
                    _this.AmExport = AmCharts.extend(_this.amExport, new AmCharts.AmExport(this), true);
                }

                if (_this.AmExport) {
                    if (_this.AmExport.init) {
                        _this.AmExport.init();
                    }
                }


                if (legend) {

                    legend = _this.addLegend(legend, legend.divId);

                    if (legend.enabled) {

                        legendStyle.left = null;
                        legendStyle.top = null;
                        legendStyle.right = null;
                        chartStyle.left = null;
                        chartStyle.right = null;
                        chartStyle.top = null;
                        legendStyle.position = RELATIVE;
                        chartStyle.position = RELATIVE;

                        switch (legend.position) {
                            case "bottom":
                                container.appendChild(chartDiv);
                                container.appendChild(legendDiv);
                                break;
                            case "top":
                                container.appendChild(legendDiv);
                                container.appendChild(chartDiv);
                                break;
                            case ABSOLUTE:
                                containerStyle.width = div.style.width;
                                containerStyle.height = div.style.height;

                                legendStyle.position = ABSOLUTE;
                                chartStyle.position = ABSOLUTE;
                                if (legend.left !== UNDEFINED) {
                                    legendStyle.left = legend.left + PX;
                                }
                                if (legend.right !== UNDEFINED) {
                                    legendStyle.right = legend.right + PX;
                                }
                                if (legend.top !== UNDEFINED) {
                                    legendStyle.top = legend.top + PX;
                                }
                                if (legend.bottom !== UNDEFINED) {
                                    legendStyle.bottom = legend.bottom + PX;
                                }
                                legend.marginLeft = 0;
                                legend.marginRight = 0;

                                container.appendChild(chartDiv);
                                container.appendChild(legendDiv);
                                break;
                            case "right":
                                containerStyle.width = div.style.width;
                                containerStyle.height = div.style.height;

                                legendStyle.position = RELATIVE;
                                chartStyle.position = ABSOLUTE;
                                container.appendChild(chartDiv);
                                container.appendChild(legendDiv);
                                break;
                            case "left":
                                containerStyle.width = div.style.width;
                                containerStyle.height = div.style.height;
                                legendStyle.position = ABSOLUTE;
                                chartStyle.position = RELATIVE;
                                container.appendChild(chartDiv);
                                container.appendChild(legendDiv);
                                break;
                            case "outside":
                                container.appendChild(chartDiv);
                                break;
                        }
                    } else {
                        container.appendChild(chartDiv);
                    }
                    _this.prevLegendPosition = legend.position;
                } else {
                    container.appendChild(chartDiv);
                }

                if (!_this.listenersAdded) {
                    _this.addListeners();
                    _this.listenersAdded = true;
                }

                _this.initChart();
            }
        },

        createLabelsSet: function() {
            var _this = this;
            AmCharts.remove(_this.labelsSet);
            _this.labelsSet = _this.container.set();
            _this.freeLabelsSet.push(_this.labelsSet);
        },


        initChart: function() {

            var _this = this;

            _this.balloon = AmCharts.processObject(_this.balloon, AmCharts.AmBalloon, _this.theme);

            if (window.AmCharts_path) {
                _this.path = window.AmCharts_path;
            }

            if (_this.path === undefined) {
                _this.path = AmCharts.getPath();
            }

            if (_this.path === undefined) {
                _this.path = "amcharts/";
            }

            _this.path = AmCharts.normalizeUrl(_this.path);

            if (_this.pathToImages === undefined) {
                _this.pathToImages = _this.path + "images/";
            }

            if (!_this.initHC) {
                AmCharts.callInitHandler(this);
                _this.initHC = true;
            }
            AmCharts.applyLang(_this.language, _this);

            // this is to handle backwards compatibility when numberFormatter and percentFromatter were objects
            var numberFormatter = _this.numberFormatter;
            if (numberFormatter) {
                if (!isNaN(numberFormatter.precision)) {
                    _this.precision = numberFormatter.precision;
                }

                if (numberFormatter.thousandsSeparator !== undefined) {
                    _this.thousandsSeparator = numberFormatter.thousandsSeparator;
                }

                if (numberFormatter.decimalSeparator !== undefined) {
                    _this.decimalSeparator = numberFormatter.decimalSeparator;
                }
            }

            var percentFormatter = _this.percentFormatter;
            if (percentFormatter) {
                if (!isNaN(percentFormatter.precision)) {
                    _this.percentPrecision = percentFormatter.precision;
                }
            }

            _this.nf = {
                precision: _this.precision,
                thousandsSeparator: _this.thousandsSeparator,
                decimalSeparator: _this.decimalSeparator
            };
            _this.pf = {
                precision: _this.percentPrecision,
                thousandsSeparator: _this.thousandsSeparator,
                decimalSeparator: _this.decimalSeparator
            };

            //_this.previousHeight = _this.divRealHeight;
            //_this.previousWidth = _this.divRealWidth;

            _this.destroy();

            var container = _this.container;
            if (container) {
                container.container.innerHTML = "";
                container.width = _this.realWidth;
                container.height = _this.realHeight;
                container.addDefs(_this);
                _this.chartDiv.appendChild(container.container);
            } else {
                container = new AmCharts.AmDraw(_this.chartDiv, _this.realWidth, _this.realHeight, _this);
            }
            _this.container = container;

            _this.extension = ".png";
            if (_this.svgIcons && AmCharts.SVG) {
                _this.extension = ".svg";
            }

            _this.checkDisplay();

            container.chart = _this;

            if (AmCharts.VML || AmCharts.SVG) {

                container.handDrawn = _this.handDrawn;
                container.handDrawScatter = _this.handDrawScatter;
                container.handDrawThickness = _this.handDrawThickness;


                AmCharts.remove(_this.set);
                _this.set = container.set();
                //_this.set.setAttr("id", "mainSet");

                AmCharts.remove(_this.gridSet);
                _this.gridSet = container.set();
                //_this.gridSet.setAttr("id", "grid");

                AmCharts.remove(_this.cursorLineSet);
                _this.cursorLineSet = container.set();


                AmCharts.remove(_this.graphsBehindSet);
                _this.graphsBehindSet = container.set();

                AmCharts.remove(_this.bulletBehindSet);
                _this.bulletBehindSet = container.set();

                AmCharts.remove(_this.columnSet);
                _this.columnSet = container.set();
                //_this.columnSet.setAttr("id", "columns");


                AmCharts.remove(_this.graphsSet);
                _this.graphsSet = container.set();

                AmCharts.remove(_this.trendLinesSet);
                _this.trendLinesSet = container.set();
                //_this.trendLinesSet.setAttr("id", "trendlines");

                AmCharts.remove(_this.axesSet);
                _this.axesSet = container.set();
                //_this.axesSet.setAttr("id", "axes");


                AmCharts.remove(_this.cursorSet);
                _this.cursorSet = container.set();
                //_this.cursorSet.setAttr("id", "cursor");


                AmCharts.remove(_this.scrollbarsSet);
                _this.scrollbarsSet = container.set();
                //_this.scrollbarsSet.setAttr("id", "scrollbars");

                AmCharts.remove(_this.bulletSet);
                _this.bulletSet = container.set();
                //_this.bulletSet.setAttr("id", "bullets");


                AmCharts.remove(_this.freeLabelsSet);
                _this.freeLabelsSet = container.set();
                //_this.freeLabelsSet.setAttr("id", "free labels");

                AmCharts.remove(_this.axesLabelsSet);
                _this.axesLabelsSet = container.set();
                //_this.axesLabelsSet.setAttr("id", "axes labels");


                AmCharts.remove(_this.balloonsSet);
                _this.balloonsSet = container.set();


                AmCharts.remove(_this.plotBalloonsSet);
                _this.plotBalloonsSet = container.set();

                AmCharts.remove(_this.zoomButtonSet);
                _this.zoomButtonSet = container.set();

                AmCharts.remove(_this.zbSet);
                _this.zbSet = null;

                AmCharts.remove(_this.linkSet);
                _this.linkSet = container.set();
            } else {
                var etype = "failed";
                _this.fire({
                    type: etype,
                    chart: _this
                });

                return;
            }
        },

        premeasure: function() {
            var _this = this;
            var div = _this.div;

            if (div) {
                try {
                    _this.boundingRect = _this.chartDiv.getBoundingClientRect();
                } catch (err) {

                }

                var mw = div.offsetWidth;
                var mh = div.offsetHeight;

                if (div.clientHeight) {
                    mw = div.clientWidth;
                    mh = div.clientHeight;
                }

                if (mw != _this.mw || mh != _this.mh) {
                    _this.mw = mw;
                    _this.mh = mh;
                    _this.measure();
                }
            }
        },

        measure: function() {
            var _this = this;

            var div = _this.div;

            if (div) {
                var chartDiv = _this.chartDiv;
                var divRealWidth = div.offsetWidth;
                var divRealHeight = div.offsetHeight;
                var container = _this.container;
                var PX = "px";

                if (div.clientHeight) {
                    divRealWidth = div.clientWidth;
                    divRealHeight = div.clientHeight;
                }

                var paddingLeft = AmCharts.removePx(AmCharts.getStyle(div, "padding-left"));
                var paddingRight = AmCharts.removePx(AmCharts.getStyle(div, "padding-right"));
                var paddingTop = AmCharts.removePx(AmCharts.getStyle(div, "padding-top"));
                var paddingBottom = AmCharts.removePx(AmCharts.getStyle(div, "padding-bottom"));

                if (!isNaN(paddingLeft)) {
                    divRealWidth -= paddingLeft;
                }
                if (!isNaN(paddingRight)) {
                    divRealWidth -= paddingRight;
                }
                if (!isNaN(paddingTop)) {
                    divRealHeight -= paddingTop;
                }
                if (!isNaN(paddingBottom)) {
                    divRealHeight -= paddingBottom;
                }

                var divStyle = div.style;
                var w = divStyle.width;
                var h = divStyle.height;

                if (w.indexOf(PX) != -1) {
                    divRealWidth = AmCharts.removePx(w);
                }
                if (h.indexOf(PX) != -1) {
                    divRealHeight = AmCharts.removePx(h);
                }

                divRealHeight = Math.round(divRealHeight);
                divRealWidth = Math.round(divRealWidth);

                var realWidth = Math.round(AmCharts.toCoordinate(_this.width, divRealWidth));
                var realHeight = Math.round(AmCharts.toCoordinate(_this.height, divRealHeight));


                if ((divRealWidth != _this.previousWidth || divRealHeight != _this.previousHeight) && realWidth > 0 && realHeight > 0) {
                    chartDiv.style.width = realWidth + PX;
                    chartDiv.style.height = realHeight + PX;
                    chartDiv.style.padding = 0;

                    if (container) {
                        container.setSize(realWidth, realHeight);
                    }
                    _this.balloon = AmCharts.processObject(_this.balloon, AmCharts.AmBalloon, _this.theme);
                }
                if (_this.balloon.setBounds) {
                    _this.balloon.setBounds(2, 2, realWidth - 2, realHeight);
                }
                _this.balloon.chart = this;
                _this.realWidth = realWidth;
                _this.realHeight = realHeight;
                _this.divRealWidth = divRealWidth;
                _this.divRealHeight = divRealHeight;
            }

        },

        checkDisplay: function() {
            var _this = this;
            if (_this.autoDisplay) {
                if (_this.container) {
                    var tester = AmCharts.rect(_this.container, 10, 10);
                    var bbox = tester.getBBox();

                    if (bbox.width === 0 && bbox.height === 0) {
                        _this.realWidth = 0;
                        _this.realHeight = 0;
                        _this.divRealWidth = 0;
                        _this.divRealHeight = 0;
                        _this.previousHeight = NaN;
                        _this.previousWidth = NaN;
                    }
                    tester.remove();
                }
            }
        },

        destroy: function() {
            var _this = this;
            _this.chartDiv.innerHTML = "";
            _this.clearTimeOuts();

            if (_this.legend) {
                _this.legend.destroy();
            }
        },

        clearTimeOuts: function() {
            var _this = this;
            var timeOuts = _this.timeOuts;
            if (timeOuts) {
                var i;
                for (i = 0; i < timeOuts.length; i++) {
                    clearTimeout(timeOuts[i]);
                }
            }
            _this.timeOuts = [];
        },

        clear: function(keepChart) {
            var _this = this;
            AmCharts.callMethod("clear", [_this.chartScrollbar, _this.scrollbarV, _this.scrollbarH, _this.chartCursor]);
            _this.chartScrollbar = null;
            _this.scrollbarV = null;
            _this.scrollbarH = null;
            _this.chartCursor = null;
            _this.clearTimeOuts();

            if (_this.container) {
                _this.container.remove(_this.chartDiv);
                _this.container.remove(_this.legendDiv);
            }
            if (!keepChart) {
                AmCharts.removeChart(this);
            }
            var div = _this.div;
            if (div) {
                while (div.firstChild) {
                    div.removeChild(div.firstChild);
                }
            }

            if (_this.legend) {
                _this.legend.destroy();
            }
        },

        setMouseCursor: function(cursor) {
            if (cursor == "auto" && AmCharts.isNN) {
                cursor = "default";
            }
            this.chartDiv.style.cursor = cursor;
            this.legendDiv.style.cursor = cursor;
        },


        redrawLabels: function() {
            var _this = this;
            _this.labels = [];
            var allLabels = _this.allLabels;

            _this.createLabelsSet();

            var i;
            for (i = 0; i < allLabels.length; i++) {
                _this.drawLabel(allLabels[i]);
            }
        },

        drawLabel: function(label) {
            var _this = this;

            if (_this.container && label.enabled !== false) {

                label = AmCharts.processObject(label, AmCharts.Label, _this.theme);

                var x = label.x;
                var y = label.y;
                var text = label.text;
                var align = label.align;
                var size = label.size;
                var color = label.color;
                var rotation = label.rotation;
                var alpha = label.alpha;
                var bold = label.bold;
                var UNDEFINED;

                var nx = AmCharts.toCoordinate(x, _this.realWidth);
                var ny = AmCharts.toCoordinate(y, _this.realHeight);

                if (!nx) {
                    nx = 0;
                }

                if (!ny) {
                    ny = 0;
                }

                if (color === UNDEFINED) {
                    color = _this.color;
                }
                if (isNaN(size)) {
                    size = _this.fontSize;
                }
                if (!align) {
                    align = "start";
                }
                if (align == "left") {
                    align = "start";
                }
                if (align == "right") {
                    align = "end";
                }
                if (align == "center") {
                    align = "middle";
                    if (!rotation) {
                        nx = _this.realWidth / 2 - nx;
                    } else {
                        ny = _this.realHeight - ny + ny / 2;
                    }
                }
                if (alpha === UNDEFINED) {
                    alpha = 1;
                }
                if (rotation === UNDEFINED) {
                    rotation = 0;
                }

                ny += size / 2;

                var labelObj = AmCharts.text(_this.container, text, color, _this.fontFamily, size, align, bold, alpha);
                labelObj.translate(nx, ny);

                AmCharts.setCN(_this, labelObj, "label");
                if (label.id) {
                    AmCharts.setCN(_this, labelObj, "label-" + label.id);
                }

                if (rotation !== 0) {
                    labelObj.rotate(rotation);
                }

                if (label.url) {
                    labelObj.setAttr("cursor", "pointer");
                    labelObj.click(function() {
                        AmCharts.getURL(label.url, _this.urlTarget);
                    });
                } else {
                    labelObj.node.style.pointerEvents = "none";
                }

                _this.labelsSet.push(labelObj);
                _this.labels.push(labelObj);
            }
        },

        addLabel: function(x, y, text, align, size, color, rotation, alpha, bold, url) {
            var _this = this;
            var label = {
                x: x,
                y: y,
                text: text,
                align: align,
                size: size,
                color: color,
                alpha: alpha,
                rotation: rotation,
                bold: bold,
                url: url,
                enabled: true
            };

            if (_this.container) {
                _this.drawLabel(label);
            }
            _this.allLabels.push(label);
        },

        clearLabels: function() {
            var _this = this;
            var labels = _this.labels;
            var i;
            for (i = labels.length - 1; i >= 0; i--) {
                labels[i].remove();
            }
            _this.labels = [];
            _this.allLabels = [];
        },

        updateHeight: function() {
            var _this = this;
            var height = _this.divRealHeight;

            var legend = _this.legend;
            if (legend) {
                var legendHeight = _this.legendDiv.offsetHeight;

                var lPosition = legend.position;
                if (lPosition == "top" || lPosition == "bottom") {
                    height -= legendHeight;
                    if (height < 0 || isNaN(height)) {
                        height = 0;
                    }
                    _this.chartDiv.style.height = height + "px";
                }
            }
            return height;
        },


        updateWidth: function() {
            var _this = this;
            var width = _this.divRealWidth;
            var height = _this.divRealHeight;
            var legend = _this.legend;
            if (legend) {
                var legendDiv = _this.legendDiv;
                var legendWidth = legendDiv.offsetWidth;

                if (!isNaN(legend.width)) {
                    legendWidth = legend.width;
                }
                if (legend.ieW) {
                    legendWidth = legend.ieW;
                }

                var legendHeight = legendDiv.offsetHeight;
                var legendStyle = legendDiv.style;

                var chartDiv = _this.chartDiv;
                var chartStyle = chartDiv.style;

                var lPosition = legend.position;
                var px = "px";

                if (lPosition == "right" || lPosition == "left") {
                    width -= legendWidth;
                    if (width < 0 || isNaN(width)) {
                        width = 0;
                    }

                    chartStyle.width = width + px;
                    _this.balloon.setBounds(2, 2, width - 2, _this.realHeight);

                    if (lPosition == "left") {
                        chartStyle.left = legendWidth + px;
                        legendStyle.left = 0 + px;
                    } else {
                        chartStyle.left = 0 + px;
                        legendStyle.left = width + px;
                    }

                    if (height > legendHeight) {
                        legendStyle.top = (height - legendHeight) / 2 + px;
                    }
                }
            }
            return width;
        },


        getTitleHeight: function() {
            var _this = this;
            _this.drawTitles(true);
            return _this.titleHeight;
        },

        addTitle: function(text, size, color, alpha, bold) {
            var _this = this;

            if (isNaN(size)) {
                size = _this.fontSize + 2;
            }

            var tObj = {
                text: text,
                size: size,
                color: color,
                alpha: alpha,
                bold: bold,
                enabled: true
            };
            _this.titles.push(tObj);
            return tObj;
        },


        handleWheel: function(event) {

            var _this = this;

            var delta = 0;
            if (!event) {
                event = window.event;
            }
            if (event.wheelDelta) {
                delta = event.wheelDelta / 120;
            } else if (event.detail) {
                delta = -event.detail / 3;
            }
            if (delta) {
                _this.handleWheelReal(delta, event.shiftKey);
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
        },

        handleWheelReal: function() {
            // void
        },


        handleDocTouchStart: function() {
            var _this = this;
            _this.hideBalloonReal();
            _this.handleMouseMove();
            _this.tmx = _this.mouseX;
            _this.tmy = _this.mouseY;
            _this.touchStartTime = new Date().getTime();
        },

        handleDocTouchEnd: function() {
            var _this = this;            

            if (_this.tmx > -0.5 && _this.tmx < _this.divRealWidth + 1 && _this.tmy > 0 && _this.tmy < _this.divRealHeight) {
                _this.handleMouseMove();
                if (Math.abs(_this.mouseX - _this.tmx) < 4 && Math.abs(_this.mouseY - _this.tmy) < 4) {
                    _this.tapped = true;
                    if(_this.panRequired && _this.panEventsEnabled && _this.chartDiv){
                        _this.chartDiv.style.msTouchAction = "none";
                        _this.chartDiv.style.touchAction = "none";
                    }
                }
                else{
                    if(!_this.mouseIsOver){
                        _this.resetTouchStyle();                    
                    }
                }
            } else {
                _this.tapped = false;
                _this.resetTouchStyle();                
            }

        },

        resetTouchStyle:function(){
            var _this = this;
            if (_this.panEventsEnabled && _this.chartDiv) {
                _this.chartDiv.style.msTouchAction = "auto";
                _this.chartDiv.style.touchAction = "auto";
            }
        },

        checkTouchDuration:function(){
            var _this = this;
            var now = new Date().getTime();
            if(now - _this.touchStartTime > _this.touchClickDuration){
                return true;
            }
        },

        checkTouchMoved:function(){
            var _this = this;
            if (Math.abs(_this.mouseX - _this.tmx) > 4 || Math.abs(_this.mouseY - _this.tmy) > 4) {
                return true;
            }
        },

        addListeners: function() {
            var _this = this;
            var chartDiv = _this.chartDiv;

            if (document.addEventListener) {
                if ("ontouchstart" in document.documentElement) {
                    chartDiv.addEventListener("touchstart", function(event) {
                        _this.handleTouchStart.call(_this, event);
                    }, true);

                    chartDiv.addEventListener("touchmove", function(event) {
                        _this.handleMouseMove.call(_this, event);
                    }, true);

                    chartDiv.addEventListener("touchend", function(event) {
                        _this.handleTouchEnd.call(_this, event);
                    }, true);
                    document.addEventListener("touchstart", function(event) {
                        _this.handleDocTouchStart.call(_this, event);
                    });
                    document.addEventListener("touchend", function(event) {
                        _this.handleDocTouchEnd.call(_this, event);
                    });
                }

                chartDiv.addEventListener("mousedown", function(event) {
                    _this.mouseIsOver = true;
                    _this.handleMouseMove.call(_this, event);
                    _this.handleMouseDown.call(_this, event);
                    _this.handleDocTouchStart.call(_this, event);
                }, true);

                chartDiv.addEventListener("mouseover", function(event) {
                    _this.handleMouseOver.call(_this, event);
                }, true);

                chartDiv.addEventListener("mouseout", function(event) {
                    _this.handleMouseOut.call(_this, event);
                }, true);
                chartDiv.addEventListener("mouseup", function(event) {
                    _this.handleDocTouchEnd.call(_this, event);
                }, true);                
            } else {
                chartDiv.attachEvent("onmousedown", function(event) {
                    _this.handleMouseDown.call(_this, event);
                });

                chartDiv.attachEvent("onmouseover", function(event) {
                    _this.handleMouseOver.call(_this, event);
                });

                chartDiv.attachEvent("onmouseout", function(event) {
                    _this.handleMouseOut.call(_this, event);
                });
            }
        },

        dispDUpd: function() {
            var _this = this;
            if (!_this.skipEvents) {
                var type;
                if (_this.dispatchDataUpdated) {
                    _this.dispatchDataUpdated = false;
                    type = "dataUpdated";
                    _this.fire({
                        type: type,
                        chart: _this
                    });
                }
                if (!_this.chartCreated) {
                    _this.chartCreated = true;
                    type = "init";
                    _this.fire({
                        type: type,
                        chart: _this
                    });
                }

                if (!_this.chartRendered) {
                    type = "rendered";
                    _this.fire({
                        type: type,
                        chart: _this
                    });
                    _this.chartRendered = true;
                }
                type = "drawn";
                _this.fire({
                    type: type,
                    chart: _this
                });
            }
            _this.skipEvents = false;
        },



        validateSize: function() {
            var _this = this;
            _this.premeasure();

            _this.checkDisplay();

            if (_this.divRealWidth != _this.previousWidth || _this.divRealHeight != _this.previousHeight) {
                var legend = _this.legend;

                if (_this.realWidth > 0 && _this.realHeight > 0) {
                    _this.sizeChanged = true;
                    if (legend) {
                        if (_this.legendInitTO) {
                            clearTimeout(_this.legendInitTO);
                        }
                        var legendInitTO = setTimeout(function() {
                            legend.invalidateSize();
                        }, 10);
                        _this.timeOuts.push(legendInitTO);
                        _this.legendInitTO = legendInitTO;
                    }

                    //if (_this.type != "xy") {
                    _this.marginsUpdated = false;
                    //} else {
                    //    _this.marginsUpdated = true;
                    //} // this exception is removed in v 3.18.7, because otherwise axis do not measure space for labels in angular.

                    clearTimeout(_this.initTO);
                    var initTO = setTimeout(function() {
                        _this.initChart();
                    }, 10);
                    _this.timeOuts.push(initTO);
                    _this.initTO = initTO;
                }

                _this.renderFix();
                if (legend) {
                    if (legend.renderFix) {
                        legend.renderFix();
                    }
                }

                clearTimeout(_this.resizedTO);

                _this.resizedTO = setTimeout(function() {
                    var type = "resized";
                    _this.fire({
                        type: type,
                        chart: _this
                    });
                }, 10);


                _this.previousHeight = _this.divRealHeight;
                _this.previousWidth = _this.divRealWidth;
            }

        },

        invalidateSize: function() {
            var _this = this;
            _this.previousWidth = NaN;
            _this.previousHeight = NaN;
            _this.invalidateSizeReal();
        },

        invalidateSizeReal: function() {
            var _this = this;
            _this.marginsUpdated = false;
            clearTimeout(_this.validateTO);
            var validateTO = setTimeout(function() {
                _this.validateSize();
            }, 5);
            _this.timeOuts.push(validateTO);
            _this.validateTO = validateTO;
        },

        validateData: function(noReset) {
            var _this = this;
            if (_this.chartCreated) {
                _this.dataChanged = true;
                //if (_this.type != "xy") {
                _this.marginsUpdated = false;
                //} else {
                //_this.marginsUpdated = true; 3.14.5
                //}
                _this.initChart(noReset);
            }
        },

        validateNow: function(validateData, skipEvents) {
            var _this = this;

            if (_this.initTO) {
                clearTimeout(_this.initTO);
            }

            if (validateData) {
                _this.dataChanged = true;
                _this.marginsUpdated = false;
            }
            _this.skipEvents = skipEvents;
            //_this.listenersAdded = false;
            _this.chartRendered = false;
            var legend = _this.legend;
            if (legend) {
                if (legend.position != _this.prevLegendPosition) {
                    _this.mw = 0;
                    _this.previousWidth = 0;
                    if (legend.invalidateSize) {
                        legend.invalidateSize();
                        _this.validateSize();
                    }
                }
            }
            _this.write(_this.div);
        },

        showItem: function(dItem) {
            var _this = this;
            dItem.hidden = false;
            _this.initChart();
        },

        hideItem: function(dItem) {
            var _this = this;
            dItem.hidden = true;
            _this.initChart();
        },

        hideBalloon: function() {
            var _this = this;
            clearTimeout(_this.hoverInt);
            clearTimeout(_this.balloonTO);
            _this.hoverInt = setTimeout(function() {
                _this.hideBalloonReal.call(_this);
            }, _this.hideBalloonTime);
        },

        cleanChart: function() {
            // do not delete
        },

        hideBalloonReal: function() {
            var balloon = this.balloon;
            if (balloon) {
                if (balloon.hide) {
                    balloon.hide();
                }
            }
        },

        showBalloon: function(text, color, follow, x, y) {
            var _this = this;
            clearTimeout(_this.balloonTO);
            clearTimeout(_this.hoverInt);

            _this.balloonTO = setTimeout(function() {
                _this.showBalloonReal.call(_this, text, color, follow, x, y);
            }, 1);
        },

        showBalloonReal: function(text, color, follow, x, y) {
            var _this = this;
            _this.handleMouseMove();

            var balloon = _this.balloon;
            if (balloon.enabled) {

                balloon.followCursor(false);
                balloon.changeColor(color);

                if (!follow || balloon.fixedPosition) {
                    balloon.setPosition(x, y);
                    if (isNaN(x) || isNaN(y)) {
                        balloon.followCursor(true);
                    } else {
                        balloon.followCursor(false);
                    }
                } else {
                    balloon.followCursor(true);
                }
                if (text) {
                    balloon.showBalloon(text);
                }
            }
        },



        handleMouseOver: function() {
            var _this = this;
            if (_this.outTO) {
                clearTimeout(_this.outTO);
            }
            AmCharts.resetMouseOver();
            this.mouseIsOver = true;
        },

        handleMouseOut: function() {
            var _this = this;
            AmCharts.resetMouseOver();
            if (_this.outTO) {
                clearTimeout(_this.outTO);
            }
            _this.outTO = setTimeout(function() {
                _this.handleMouseOutReal();
            }, 10);
        },

        handleMouseOutReal: function() {
            this.mouseIsOver = false;
        },

        handleMouseMove: function(e) {
            var _this = this;

            if (!e) {
                e = window.event;
            }

            _this.mouse2X = NaN;
            _this.mouse2Y = NaN;

            var mouseX, mouseY, mouse2X, mouse2Y;

            if (e) {
                if (e.touches) {

                    var touch2 = e.touches.item(1);
                    if (touch2 && _this.panEventsEnabled && _this.boundingRect) {
                        mouse2X = touch2.clientX - _this.boundingRect.left;
                        mouse2Y = touch2.clientY - _this.boundingRect.top;
                    }

                    e = e.touches.item(0);

                    if (!e) {
                        return;
                    }
                } else {
                    _this.wasTouched = false;
                }

                if (_this.boundingRect) {
                    if (e.clientX) {
                        mouseX = e.clientX - _this.boundingRect.left;
                        mouseY = e.clientY - _this.boundingRect.top;
                    }
                }

                if (!isNaN(mouse2X)) {
                    _this.mouseX = Math.min(mouseX, mouse2X);
                    _this.mouse2X = Math.max(mouseX, mouse2X);
                } else {
                    _this.mouseX = mouseX;
                }
                if (!isNaN(mouse2Y)) {
                    _this.mouseY = Math.min(mouseY, mouse2Y);
                    _this.mouse2Y = Math.max(mouseY, mouse2Y);
                } else {
                    _this.mouseY = mouseY;
                }
            }
        },

        handleTouchStart: function(e) {
            var _this = this;
            _this.hideBalloonReal();
            if (e) {
                if ((e.touches && _this.tapToActivate && !_this.tapped) || !_this.panRequired) {
                    return;
                }
            }

            _this.handleMouseMove(e);
            _this.handleMouseDown(e);
        },

        handleTouchEnd: function(e) {
            var _this = this;
            _this.wasTouched = true;
            _this.handleMouseMove(e);
            AmCharts.resetMouseOver();
            this.handleReleaseOutside(e);
        },


        handleReleaseOutside: function() {
            var _this = this;
            _this.handleDocTouchEnd.call(_this);  
        },

        handleMouseDown: function(e) {
            var _this = this;
            AmCharts.resetMouseOver();
            _this.mouseIsOver = true;

            if (e) {
                if (e.preventDefault) {
                    if (_this.panEventsEnabled) {
                        e.preventDefault();
                    } else {
                        if (!e.touches) {
                            e.preventDefault();
                        }
                    }
                }
            }
        },



        addLegend: function(legend, divId) {

            var _this = this;
            legend = AmCharts.processObject(legend, AmCharts.AmLegend, _this.theme);
            legend.divId = divId;
            legend.ieW = 0;

            var div;
            if (typeof(divId) != "object" && divId) {
                div = document.getElementById(divId);
            } else {
                div = divId;
            }

            _this.legend = legend;
            legend.chart = _this;
            if (div) {
                legend.div = div;
                legend.position = "outside";
                legend.autoMargins = false;
            } else {
                legend.div = _this.legendDiv;
            }

            return legend;
        },

        removeLegend: function() {
            var _this = this;
            _this.legend = undefined;
            _this.previousWidth = 0;
            _this.legendDiv.innerHTML = "";
        },

        handleResize: function() {
            var _this = this;

            if (AmCharts.isPercents(_this.width) || AmCharts.isPercents(_this.height)) {
                _this.invalidateSizeReal();
            }
            _this.renderFix();
        },

        renderFix: function() {
            if (!AmCharts.VML) {
                var container = this.container;
                if (container) {
                    container.renderFix();
                }
            }
        },

        getSVG: function() {
            if (AmCharts.hasSVG) {
                return this.container;
            }
        },

        animate: function(obj, attribute, from, to, time, effect, suffix) {
            var _this = this;

            if (obj["an_" + attribute]) {
                AmCharts.removeFromArray(_this.animations, obj["an_" + attribute]);
            }

            var animation = {
                obj: obj,
                frame: 0,
                attribute: attribute,
                from: from,
                to: to,
                time: time,
                effect: effect,
                suffix: suffix
            };
            obj["an_" + attribute] = animation;
            _this.animations.push(animation);

            return animation;
        },

        setLegendData: function(data) {
            var _this = this;
            var legend = _this.legend;
            if (legend) {
                legend.setData(data);
            }
        },

        stopAnim: function(animation) {
            var _this = this;
            AmCharts.removeFromArray(_this.animations, animation);
        },

        updateAnimations: function() {
            var _this = this;
            var i;

            if (_this.container) {
                _this.container.update();
            }

            if (_this.animations) {
                for (i = _this.animations.length - 1; i >= 0; i--) {
                    var animation = _this.animations[i];
                    var totalCount = AmCharts.updateRate * animation.time;
                    var frame = animation.frame + 1;
                    var obj = animation.obj;
                    var attribute = animation.attribute;

                    if (frame <= totalCount) {
                        var value;
                        animation.frame++;

                        var from = Number(animation.from);
                        var to = Number(animation.to);

                        var change = to - from;

                        value = AmCharts[animation.effect](0, frame, from, change, totalCount);

                        if (change === 0) {
                            _this.animations.splice(i, 1);
                            obj.node.style[attribute] = Number(animation.to) + animation.suffix;
                        } else {
                            obj.node.style[attribute] = value + animation.suffix;
                        }
                    } else {
                        obj.node.style[attribute] = Number(animation.to) + animation.suffix;
                        obj.animationFinished = true;
                        _this.animations.splice(i, 1);
                    }
                }
            }
        },

        update: function() {
            var _this = this;
            _this.updateAnimations();

            var animatable = _this.animatable;
            if (animatable.length > 0) {
                var finished = true;
                for (var i = animatable.length - 1; i >= 0; i--) {
                    var obj = animatable[i];
                    if (obj) {
                        if (obj.animationFinished) {
                            animatable.splice(i, 1);
                        } else {
                            finished = false;
                        }
                    }
                }

                if (finished) {
                    _this.fire({
                        type: "animationFinished",
                        chart: _this
                    });
                    _this.animatable = [];
                }
            }
        },

        inIframe: function() {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        },

        brr: function() {
/*
            var _this = this;
            if(!_this.hideCredits){
                var url = "amcharts.com";

                var host = window.location.hostname;
                var har = host.split(".");
                var mh;
                if (har.length >= 2) {
                    mh = har[har.length - 2] + "." + har[har.length - 1];
                }

                if (_this.amLink) {
                    var parent = _this.amLink.parentNode;
                    if (parent) {
                        parent.removeChild(_this.amLink);
                    }
                }
                var creditsPosition = _this.creditsPosition;
                var PX = "px";

                if (mh != url || _this.inIframe() === true) {

                    url = "http://www." + url;

                    var x0 = 0;
                    var y0 = 0;
                    var w = _this.realWidth;
                    var h = _this.realHeight;
                    var type = _this.type;
                    if (type == "serial" || type == "xy" || type == "gantt") {
                        x0 = _this.marginLeftReal;
                        y0 = _this.marginTopReal;
                        w = x0 + _this.plotAreaWidth;
                        h = y0 + _this.plotAreaHeight;
                    }

                    var link = url + "/javascript-charts/";
                    var title = "JavaScript charts";
                    var txt = "JS chart by amCharts";
                    if (_this.product == "ammap") {
                        link = url + "/javascript-maps/";
                        title = "Interactive JavaScript maps";
                        txt = "JS map by amCharts";
                    }

                    var a = document.createElement("a");
                    var aLabel = document.createTextNode(txt);
                    a.setAttribute("href", link);
                    a.setAttribute("title", title);
                    if(_this.urlTarget){
                        a.setAttribute("target", _this.urlTarget);
                    }
                    a.appendChild(aLabel);
                    _this.chartDiv.appendChild(a);

                    _this.amLink = a;

                    var astyle = a.style;
                    astyle.position = "absolute";
                    astyle.textDecoration = "none";
                    astyle.color = _this.color;
                    astyle.fontFamily = _this.fontFamily;
                    astyle.fontSize = "11px";
                    astyle.opacity = 0.7;
                    astyle.display = "block";

                    var linkWidth = a.offsetWidth;
                    var linkHeight = a.offsetHeight;

                    var left = 5 + x0;
                    var top = y0 + 5;

                    if (creditsPosition == "bottom-left") {
                        left = 5 + x0;
                        top = h - linkHeight - 3;
                    }

                    if (creditsPosition == "bottom-right") {
                        left = w - linkWidth - 5;
                        top = h - linkHeight - 3;
                    }

                    if (creditsPosition == "top-right") {
                        left = w - linkWidth - 5;
                        top = y0 + 5;
                    }

                    astyle.left = left + PX;
                    astyle.top = top + PX;
                }
            }
           */ 
        }

    });

    // declaring only
    AmCharts.Slice = AmCharts.Class({
        construct: function() {}
    });
    AmCharts.SerialDataItem = AmCharts.Class({
        construct: function() {}
    });
    AmCharts.GraphDataItem = AmCharts.Class({
        construct: function() {}
    });
    AmCharts.Guide = AmCharts.Class({
        construct: function(theme) {
            var _this = this;
            _this.cname = "Guide";
            AmCharts.applyTheme(_this, theme, _this.cname);
        }
    });

    AmCharts.Title = AmCharts.Class({
        construct: function(theme) {
            var _this = this;
            _this.cname = "Title";
            AmCharts.applyTheme(_this, theme, _this.cname);
        }
    });

    AmCharts.Label = AmCharts.Class({
        construct: function(theme) {
            var _this = this;
            _this.cname = "Label";
            AmCharts.applyTheme(_this, theme, _this.cname);
        }
    });
})();
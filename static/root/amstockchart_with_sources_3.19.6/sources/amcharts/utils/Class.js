/**
 * Create a AmCharts namespace for our library.
 * @type object
 */
(function() {
    "use strict";

    var AmCharts;
    if (!window.AmCharts) {
        AmCharts = {};
        window.AmCharts = AmCharts;
        AmCharts.themes = {};
        AmCharts.maps = {};
        AmCharts.inheriting = {};
        AmCharts.charts = [];
        AmCharts.onReadyArray = [];
        AmCharts.useUTC = false;
        AmCharts.updateRate = 60;
        AmCharts.uid = 0;
        AmCharts.lang = {};
        AmCharts.translations = {};
        AmCharts.mapTranslations = {};
        AmCharts.windows = {};
        AmCharts.initHandlers = [];
    } else {
        AmCharts = window.AmCharts;
    }


    AmCharts.Class = function(init) {
        var cstr = function() {
            if (arguments[0] === AmCharts.inheriting) {
                return;
            }
            this.events = {};
            this.construct.apply(this, arguments);
        };


        if (init.inherits) {
            cstr.prototype = new init.inherits(AmCharts.inheriting);
            cstr.base = init.inherits.prototype;
            delete init.inherits;
        } else {
            cstr.prototype.createEvents = function() {
                for (var i = 0; i < arguments.length; i++) {
                    this.events[arguments[i]] = [];
                }
            };

            cstr.prototype.listenTo = function(obj, event, handler) {

                this.removeListener(obj, event, handler);

                obj.events[event].push({
                    handler: handler,
                    scope: this
                });
            };

            cstr.prototype.addListener = function(event, handler, obj) {

                this.removeListener(this, event, handler);
                if (event) {
                    if (this.events[event]) {
                        this.events[event].push({
                            handler: handler,
                            scope: obj
                        });
                    }
                }
            };

            cstr.prototype.removeListener = function(obj, event, handler) {
                if (obj) {
                    if (obj.events) {
                        var ev = obj.events[event];
                        if (ev) {
                            for (var i = ev.length - 1; i >= 0; i--) {
                                if (ev[i].handler === handler) {
                                    ev.splice(i, 1);
                                }
                            }
                        }
                    }
                }
            };

            cstr.prototype.fire = function(event) {
                var type = event.type;
                var handlers = this.events[type];
                for (var i = 0; i < handlers.length; i++) {
                    var h = handlers[i];
                    h.handler.call(h.scope, event);
                }
            };
        }

        for (var p in init) {
            cstr.prototype[p] = init[p];
        }

        return cstr;

    };


    AmCharts.addChart = function(chart) {

        if (window.requestAnimationFrame) {
            if (!AmCharts.animationRequested) {
                AmCharts.animationRequested = true;
                window.requestAnimationFrame(AmCharts.update);
            }
        } else {
            if (!AmCharts.updateInt) {
                AmCharts.updateInt = setInterval(function() {
                    AmCharts.update();
                }, Math.round(1000 / AmCharts.updateRate));
            }
        }

        AmCharts.charts.push(chart);
    };

    AmCharts.removeChart = function(chart) {
        var charts = AmCharts.charts;
        for (var i = charts.length - 1; i >= 0; i--) {
            if (charts[i] == chart) {
                charts.splice(i, 1);
            }
        }
        if (charts.length === 0) {
            if (AmCharts.updateInt) {
                clearInterval(AmCharts.updateInt);
                AmCharts.updateInt = NaN;
            }
        }
    };


    AmCharts.isModern = true;
    AmCharts.getIEVersion = function() {
        var rv = 0;
        var ua;
        var re;
        if (navigator.appName == "Microsoft Internet Explorer") {
            ua = navigator.userAgent;
            re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
            if (re.exec(ua) !== null)
                rv = parseFloat(RegExp.$1);
        }
        return rv;
    };

    AmCharts.applyLang = function(language, chart) {

        var translations = AmCharts.translations;

        chart.dayNames = AmCharts.extend({}, AmCharts.dayNames);
        chart.shortDayNames = AmCharts.extend({}, AmCharts.shortDayNames);
        chart.monthNames = AmCharts.extend({}, AmCharts.monthNames);
        chart.shortMonthNames = AmCharts.extend({}, AmCharts.shortMonthNames);

        chart.amString = "am";
        chart.pmString = "pm";

        if (translations) {
            var lang = translations[language];

            if (lang) {
                AmCharts.lang = lang;
                if (lang.monthNames) {
                    chart.dayNames = AmCharts.extend({}, lang.dayNames);
                    chart.shortDayNames = AmCharts.extend({}, lang.shortDayNames);
                    chart.monthNames = AmCharts.extend({}, lang.monthNames);
                    chart.shortMonthNames = AmCharts.extend({}, lang.shortMonthNames);
                }
                if (lang.am) {
                    chart.amString = lang.am;
                }
                if (lang.pm) {
                    chart.pmString = lang.pm;
                }
            }
        }
    };


    AmCharts.IEversion = AmCharts.getIEVersion();
    if (AmCharts.IEversion < 9 && AmCharts.IEversion > 0) {
        AmCharts.isModern = false;
        AmCharts.isIE = true;
    }

    AmCharts.dx = 0;
    AmCharts.dy = 0;

    // check browser
    if (document.addEventListener || window.opera) {
        AmCharts.isNN = true;
        AmCharts.isIE = false;
        AmCharts.dx = 0.5;
        AmCharts.dy = 0.5;
    }

    if (document.attachEvent) {
        AmCharts.isNN = false;
        AmCharts.isIE = true;
        if (!AmCharts.isModern) {
            AmCharts.dx = 0;
            AmCharts.dy = 0;
        }
    }

    if (window.chrome) {
        AmCharts.chrome = true;
    }

    AmCharts.handleMouseUp = function(e) {
        var charts = AmCharts.charts;

        for (var i = 0; i < charts.length; i++) {
            var chart = charts[i];

            if (chart) {
                if (chart.handleReleaseOutside) {
                    chart.handleReleaseOutside(e);
                }
            }
        }
    };

    AmCharts.handleMouseMove = function(e) {
        var charts = AmCharts.charts;
        for (var i = 0; i < charts.length; i++) {
            var chart = charts[i];

            if (chart) {
                if (chart.handleMouseMove) {
                    chart.handleMouseMove(e);
                }
            }
        }
    };

    AmCharts.handleWheel = function(e) {
        var charts = AmCharts.charts;
        for (var i = 0; i < charts.length; i++) {
            var chart = charts[i];
            if (chart) {
                if (chart.mouseIsOver) {
                    if (chart.mouseWheelScrollEnabled || chart.mouseWheelZoomEnabled) {
                        if (chart.handleWheel) {
                            chart.handleWheel(e);
                        }
                    } else {
                        if (e.stopPropagation) {
                            e.stopPropagation();
                        }
                    }
                    break;
                }
            }
        }
    };

    AmCharts.resetMouseOver = function() {
        var charts = AmCharts.charts;
        for (var i = 0; i < charts.length; i++) {
            var chart = charts[i];

            if (chart) {
                chart.mouseIsOver = false;
            }
        }
    };


    AmCharts.ready = function(value) {
        AmCharts.onReadyArray.push(value);
    };

    AmCharts.handleLoad = function() {
        AmCharts.isReady = true;
        var onReadyArray = AmCharts.onReadyArray;
        for (var i = 0; i < onReadyArray.length; i++) {
            var fnc = onReadyArray[i];
            if (isNaN(AmCharts.processDelay)) {
                fnc();
            } else {
                setTimeout(fnc, AmCharts.processDelay * i);
            }
        }
    };

    AmCharts.addInitHandler = function(method, types) {
        AmCharts.initHandlers.push({
            method: method,
            types: types
        });
    };

    AmCharts.callInitHandler = function(chart) {
        var initHandlers = AmCharts.initHandlers;
        if (AmCharts.initHandlers) {
            for (var i = 0; i < initHandlers.length; i++) {
                var handler = initHandlers[i];
                if (handler.types) {

                    if (AmCharts.isInArray(handler.types, chart.type)) {
                        handler.method(chart);
                    }
                } else {
                    handler.method(chart);
                }
            }
        }
    };


    AmCharts.getUniqueId = function() {
        AmCharts.uid++;
        return "AmChartsEl-" + AmCharts.uid;
    };

    // add events for NN/FF/etc
    if (AmCharts.isNN) {
        document.addEventListener("mousemove", AmCharts.handleMouseMove);
        document.addEventListener("mouseup", AmCharts.handleMouseUp, true);
        window.addEventListener("load", AmCharts.handleLoad, true);
        window.addEventListener("DOMMouseScroll", AmCharts.handleWheel, true);
        document.addEventListener("mousewheel", AmCharts.handleWheel, true);
    }

    if (AmCharts.isIE) {
        document.attachEvent("onmousemove", AmCharts.handleMouseMove);
        document.attachEvent("onmouseup", AmCharts.handleMouseUp);
        window.attachEvent("onload", AmCharts.handleLoad);
        document.attachEvent("onmousewheel", AmCharts.handleWheel);
    }



    AmCharts.clear = function() {

        var charts = AmCharts.charts;
        if (charts) {
            for (var i = charts.length - 1; i >= 0; i--) {
                charts[i].clear();
            }
        }

        if (AmCharts.updateInt) {
            clearInterval(AmCharts.updateInt);
        }

        AmCharts.charts = [];

        if (AmCharts.isNN) {
            document.removeEventListener("mousemove", AmCharts.handleMouseMove, true);
            //window.removeEventListener("resize", AmCharts.handleResize, true);
            document.removeEventListener("mouseup", AmCharts.handleMouseUp, true);
            window.removeEventListener("load", AmCharts.handleLoad, true);
            window.removeEventListener("DOMMouseScroll", AmCharts.handleWheel, true);
            document.removeEventListener("mousewheel", AmCharts.handleWheel, true);
        }

        if (AmCharts.isIE) {
            document.detachEvent("onmousemove", AmCharts.handleMouseMove);
            //window.detachEvent("onresize", AmCharts.handleResize);
            document.detachEvent("onmouseup", AmCharts.handleMouseUp);
            window.detachEvent("onload", AmCharts.handleLoad);
        }
    };


    AmCharts.makeChart = function(div, config, amDelay) {
        var type = config.type;
        var theme = config.theme;

        if (AmCharts.isString(theme)) {
            theme = AmCharts.themes[theme];
            config.theme = theme;
        }

        var chart;
        switch (type) {
            case "serial":
                chart = new AmCharts.AmSerialChart(theme);
                break;
            case "xy":
                chart = new AmCharts.AmXYChart(theme);
                break;
            case "pie":
                chart = new AmCharts.AmPieChart(theme);
                break;
            case "radar":
                chart = new AmCharts.AmRadarChart(theme);
                break;
            case "gauge":
                chart = new AmCharts.AmAngularGauge(theme);
                break;
            case "funnel":
                chart = new AmCharts.AmFunnelChart(theme);
                break;
            case "map":
                chart = new AmCharts.AmMap(theme);
                break;
            case "stock":
                chart = new AmCharts.AmStockChart(theme);
                break;
            case "gantt":
                chart = new AmCharts.AmGanttChart(theme);
                break;
        }

        AmCharts.extend(chart, config);

        if (AmCharts.isReady) {
            if (isNaN(amDelay)) {
                chart.write(div);
            } else {
                setTimeout(function() {
                    AmCharts.realWrite(chart, div);
                }, amDelay);
            }
        } else {
            AmCharts.ready(function() {
                if (isNaN(amDelay)) {
                    chart.write(div);
                } else {
                    setTimeout(function() {
                        AmCharts.realWrite(chart, div);
                    }, amDelay);
                }
            });
        }
        return chart;
    };

    AmCharts.realWrite = function(chart, div) {
        chart.write(div);
    };


    AmCharts.updateCount = 0;
    AmCharts.validateAt = Math.round(AmCharts.updateRate / 10);

    AmCharts.update = function() {
        var charts = AmCharts.charts;
        AmCharts.updateCount++;
        var update = false;
        if (AmCharts.updateCount == AmCharts.validateAt) {
            update = true;
            AmCharts.updateCount = 0;
        }

        if (charts) {
            for (var i = charts.length - 1; i >= 0; i--) {
                if (charts[i].update) {
                    charts[i].update();
                }
                if (update) {
                    if (charts[i].autoResize) {
                        if (charts[i].validateSize) {
                            charts[i].validateSize();
                        }
                    } else {
                        if (charts[i].premeasure) {
                            charts[i].premeasure();
                        }
                    }
                }
            }
        }
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(AmCharts.update);
        }
    };

    AmCharts.bezierX = 3;
    AmCharts.bezierY = 6;

    if (document.readyState == "complete") {
        AmCharts.handleLoad();
    }
})();
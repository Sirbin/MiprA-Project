(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.Cuboid = AmCharts.Class({
        construct: function(container, width, height, dx, dy, colors, alpha, bwidth, bcolor, balpha, gradientRotation, cornerRadius, rotate, dashLength, pattern, topRadius, bcn) {
            var _this = this;
            _this.set = container.set();
            _this.container = container;
            _this.h = Math.round(height);
            _this.w = Math.round(width);
            _this.dx = dx;
            _this.dy = dy;
            _this.colors = colors;
            _this.alpha = alpha;
            _this.bwidth = bwidth;
            _this.bcolor = bcolor;
            _this.balpha = balpha;
            _this.dashLength = dashLength;
            _this.topRadius = topRadius;
            _this.pattern = pattern;
            _this.rotate = rotate;
            _this.bcn = bcn;
            if (rotate) {
                if (width < 0 && gradientRotation === 0) {
                    gradientRotation = 180;
                }
            } else {
                if (height < 0) {
                    if (gradientRotation == 270) {
                        gradientRotation = 90;
                    }
                }
            }
            _this.gradientRotation = gradientRotation;

            if (dx === 0 && dy === 0) {
                _this.cornerRadius = cornerRadius;
            }
            _this.draw();
        },

        draw: function() {
            var _this = this;
            var set = _this.set;
            set.clear();

            var container = _this.container;
            var chart = container.chart;

            var w = _this.w;
            var h = _this.h;
            var dx = _this.dx;
            var dy = _this.dy;
            var colors = _this.colors;
            var alpha = _this.alpha;
            var bwidth = _this.bwidth;
            var bcolor = _this.bcolor;
            var balpha = _this.balpha;
            var gradientRotation = _this.gradientRotation;
            var cornerRadius = _this.cornerRadius;
            var dashLength = _this.dashLength;
            var pattern = _this.pattern;
            var topRadius = _this.topRadius;
            var bcn = _this.bcn;

            // bot
            var firstColor = colors;
            var lastColor = colors;

            if (typeof(colors) == "object") {
                firstColor = colors[0];
                lastColor = colors[colors.length - 1];
            }

            var bottom;
            var back;
            var backBorders;
            var lside;
            var rside;
            var rsideBorders;
            var top;
            var topBorders;
            var bottomBorders;

            // if dx or dx > 0, draw other sides
            var tempAlpha = alpha;
            if (pattern) {
                alpha = 0;
            }

            var brX;
            var brY;
            var trX;
            var trY;
            var rotate = _this.rotate;

            if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
                // cylinder
                if (!isNaN(topRadius)) {

                    var bx;
                    var by;
                    var tx;
                    var ty;
                    if (rotate) {
                        by = h / 2;
                        bx = dx / 2;
                        ty = h / 2;
                        tx = w + dx / 2;
                        brY = Math.abs(h / 2);
                        brX = Math.abs(dx / 2);
                    } else {
                        bx = w / 2;
                        by = dy / 2;
                        tx = w / 2;
                        ty = h + dy / 2 + 1;
                        brX = Math.abs(w / 2);
                        brY = Math.abs(dy / 2);
                    }

                    trX = brX * topRadius;
                    trY = brY * topRadius;

                    // draw bottom and top elipses
                    if (brX > 0.1 && brX > 0.1) {
                        bottom = AmCharts.circle(container, brX, firstColor, alpha, bwidth, bcolor, balpha, false, brY);
                        bottom.translate(bx, by);
                    }
                    if (trX > 0.1 && trX > 0.1) {
                        top = AmCharts.circle(container, trX, AmCharts.adjustLuminosity(firstColor, 0.5), alpha, bwidth, bcolor, balpha, false, trY);
                        top.translate(tx, ty);
                    }
                }
                // cuboid
                else {
                    var bc = lastColor;
                    var ccc = AmCharts.adjustLuminosity(firstColor, -0.2);
                    var tc = firstColor;

                    ccc = AmCharts.adjustLuminosity(tc, -0.2);
                    bottom = AmCharts.polygon(container, [0, dx, w + dx, w, 0], [0, dy, dy, 0, 0], ccc, alpha, 1, bcolor, 0, gradientRotation);

                    if (balpha > 0) {
                        bottomBorders = AmCharts.line(container, [0, dx, w + dx], [0, dy, dy], bcolor, balpha, bwidth, dashLength);
                    }

                    // back
                    back = AmCharts.polygon(container, [0, 0, w, w, 0], [0, h, h, 0, 0], ccc, alpha, 1, bcolor, 0, gradientRotation);
                    back.translate(dx, dy);

                    // back borders
                    if (balpha > 0) {
                        backBorders = AmCharts.line(container, [dx, dx], [dy, dy + h], bcolor, balpha, bwidth, dashLength);
                    }

                    // left side
                    lside = AmCharts.polygon(container, [0, 0, dx, dx, 0], [0, h, h + dy, dy, 0], ccc, alpha, 1, bcolor, 0, gradientRotation);

                    // right side
                    rside = AmCharts.polygon(container, [w, w, w + dx, w + dx, w], [0, h, h + dy, dy, 0], ccc, alpha, 1, bcolor, 0, gradientRotation);

                    // right side borders
                    if (balpha > 0) {
                        rsideBorders = AmCharts.line(container, [w, w + dx, w + dx, w], [0, dy, h + dy, h], bcolor, balpha, bwidth, dashLength);
                    }
                    //}
                    ccc = AmCharts.adjustLuminosity(bc, 0.2);
                    top = AmCharts.polygon(container, [0, dx, w + dx, w, 0], [h, h + dy, h + dy, h, h], ccc, alpha, 1, bcolor, 0, gradientRotation);

                    // bot borders
                    if (balpha > 0) {
                        topBorders = AmCharts.line(container, [0, dx, w + dx], [h, h + dy, h + dy], bcolor, balpha, bwidth, dashLength);
                    }
                }
            }

            alpha = tempAlpha;

            if (Math.abs(h) < 1) {
                h = 0;
            }

            if (Math.abs(w) < 1) {
                w = 0;
            }

            var front;
            // cylinder
            if (!isNaN(topRadius) && (Math.abs(dx) > 0 || Math.abs(dy) > 0)) {
                colors = [firstColor];
                var attr = {
                    "fill": colors,
                    "stroke": bcolor,
                    "stroke-width": bwidth,
                    "stroke-opacity": balpha,
                    "fill-opacity": alpha
                };

                var comma = ",";

                var path;
                var tCenter;
                var gradAngle;
                var al;

                if (rotate) {
                    tCenter = (h / 2 - h / 2 * topRadius);
                    path = "M" + 0 + comma + 0 + " L" + w + comma + tCenter;
                    al = " B";
                    if (w > 0) {
                        al = " A";
                    }
                    if (AmCharts.VML) {
                        path += al + Math.round(w - trX) + comma + Math.round(h / 2 - trY) + comma + Math.round(w + trX) + comma + Math.round(h / 2 + trY) + comma + w + comma + 0 + comma + w + comma + h;
                        path += " L" + 0 + comma + h;
                        path += al + Math.round(-brX) + comma + Math.round(h / 2 - brY) + comma + Math.round(brX) + comma + Math.round(h / 2 + brY) + comma + 0 + comma + h + comma + 0 + comma + 0;
                    } else {
                        path += "A" + trX + comma + trY + comma + 0 + comma + 0 + comma + 0 + comma + w + comma + (h - h / 2 * (1 - topRadius)) + "L" + 0 + comma + h;
                        path += "A" + brX + comma + brY + comma + 0 + comma + 0 + comma + 1 + comma + 0 + comma + 0;
                    }
                    gradAngle = 90;
                } else {
                    tCenter = (w / 2 - w / 2 * topRadius);
                    path = "M" + 0 + comma + 0 + " L" + tCenter + comma + h;
                    if (AmCharts.VML) {

                        path = "M" + 0 + comma + 0 + " L" + tCenter + comma + h;
                        al = " B";
                        if (h < 0) {
                            al = " A";
                        }
                        path += al + Math.round(w / 2 - trX) + comma + Math.round(h - trY) + comma + Math.round(w / 2 + trX) + comma + Math.round(h + trY) + comma + 0 + comma + h + comma + w + comma + h;
                        path += " L" + w + comma + 0;
                        path += al + Math.round(w / 2 + brX) + comma + Math.round(brY) + comma + Math.round(w / 2 - brX) + comma + Math.round(-brY) + comma + w + comma + 0 + comma + 0 + comma + 0;
                    } else {
                        path += "A" + trX + comma + trY + comma + 0 + comma + 0 + comma + 0 + comma + (w - w / 2 * (1 - topRadius)) + comma + h + "L" + w + comma + 0;
                        path += "A" + brX + comma + brY + comma + 0 + comma + 0 + comma + 1 + comma + 0 + comma + 0;
                    }
                    gradAngle = 180;
                }


                front = container.path(path).attr(attr);
                front.gradient("linearGradient", [firstColor, AmCharts.adjustLuminosity(firstColor, -0.3), AmCharts.adjustLuminosity(firstColor, -0.3), firstColor], gradAngle);
                if (rotate) {
                    front.translate(dx / 2, 0);
                } else {
                    front.translate(0, dy / 2);
                }
            } else {
                if (h === 0) {
                    front = AmCharts.line(container, [0, w], [0, 0], bcolor, balpha, bwidth, dashLength);
                } else if (w === 0) {
                    front = AmCharts.line(container, [0, 0], [0, h], bcolor, balpha, bwidth, dashLength);
                } else {
                    if (cornerRadius > 0) {
                        front = AmCharts.rect(container, w, h, colors, alpha, bwidth, bcolor, balpha, cornerRadius, gradientRotation, dashLength);
                    } else {
                        front = AmCharts.polygon(container, [0, 0, w, w, 0], [0, h, h, 0, 0], colors, alpha, bwidth, bcolor, balpha, gradientRotation, false, dashLength);
                    }
                }
            }

            var elements;
            if (!isNaN(topRadius)) {
                if (rotate) {
                    if (w > 0) {
                        elements = [bottom, front, top];
                    } else {
                        elements = [top, front, bottom];
                    }
                } else {
                    if (h < 0) {
                        elements = [bottom, front, top];
                    } else {
                        elements = [top, front, bottom];
                    }
                }

            } else {
                if (h < 0) {
                    elements = [bottom, bottomBorders, back, backBorders, lside, rside, rsideBorders, top, topBorders, front];
                } else {
                    elements = [top, topBorders, back, backBorders, lside, rside, bottom, bottomBorders, rsideBorders, front];
                }
            }

            AmCharts.setCN(chart, front, bcn + "front");
            AmCharts.setCN(chart, back, bcn + "back");
            AmCharts.setCN(chart, top, bcn + "top");
            AmCharts.setCN(chart, bottom, bcn + "bottom");
            AmCharts.setCN(chart, lside, bcn + "left");
            AmCharts.setCN(chart, rside, bcn + "right");


            var i;
            for (i = 0; i < elements.length; i++) {
                var el = elements[i];
                if (el) {
                    set.push(el);
                    AmCharts.setCN(chart, el, bcn + "element");
                }
            }

            if (pattern) {
                front.pattern(pattern, NaN, chart.path);
            }
        },


        width: function(v) {
            if (isNaN(v)) {
                v = 0;
            }
            var _this = this;
            _this.w = Math.round(v);
            _this.draw();
        },

        height: function(v) {
            if (isNaN(v)) {
                v = 0;
            }
            var _this = this;
            _this.h = Math.round(v);
            _this.draw();
        },

        animateHeight: function(duration, easingFunction) {
            var _this = this;
            _this.animationFinished = false;
            _this.easing = easingFunction;
            _this.totalFrames = duration * AmCharts.updateRate;
            _this.rh = _this.h;
            _this.frame = 0;
            _this.height(1);
            setTimeout(function() {
                _this.updateHeight.call(_this);
            }, 1000 / AmCharts.updateRate);
        },

        updateHeight: function() {
            var _this = this;
            _this.frame++;
            var totalFrames = _this.totalFrames;

            if (_this.frame <= totalFrames) {
                var value = _this.easing(0, _this.frame, 1, _this.rh - 1, totalFrames);
                _this.height(value);
                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(function() {
                        _this.updateHeight.call(_this);
                    });
                } else {
                    setTimeout(function() {
                        _this.updateHeight.call(_this);
                    }, 1000 / AmCharts.updateRate);
                }
            } else {
                _this.height(_this.rh);
                _this.animationFinished = true;
            }
        },

        animateWidth: function(duration, easingFunction) {
            var _this = this;
            _this.animationFinished = false;
            _this.easing = easingFunction;
            _this.totalFrames = duration * AmCharts.updateRate;
            _this.rw = _this.w;
            _this.frame = 0;
            _this.width(1);

            setTimeout(function() {
                _this.updateWidth.call(_this);
            }, 1000 / AmCharts.updateRate);
        },

        updateWidth: function() {
            var _this = this;
            _this.frame++;
            var totalFrames = _this.totalFrames;

            if (_this.frame <= totalFrames) {
                var value = _this.easing(0, _this.frame, 1, _this.rw - 1, totalFrames);
                _this.width(value);

                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(function() {
                        _this.updateWidth.call(_this);
                    });
                } else {
                    setTimeout(function() {
                        _this.updateWidth.call(_this);
                    }, 1000 / AmCharts.updateRate);
                }
            } else {
                _this.width(_this.rw);
                _this.animationFinished = true;
            }
        }

    });

})();
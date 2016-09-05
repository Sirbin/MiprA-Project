(function() {
    "use strict";
    var AmCharts = window.AmCharts;



    AmCharts.circle = function(container, r, color, alpha, bwidth, bcolor, balpha, bubble, ry) {
        var UNDEFINED;
        if (r <= 0) {
            r = 0.001;
        }
        if (bwidth == UNDEFINED || bwidth === 0) {
            bwidth = 0.01;
        }
        if (bcolor === UNDEFINED) {
            bcolor = "#000000";
        }
        if (balpha === UNDEFINED) {
            balpha = 0;
        }

        var attr = {
            "fill": color,
            "stroke": bcolor,
            "fill-opacity": alpha,
            "stroke-width": bwidth,
            "stroke-opacity": balpha
        };

        var circle;
        if (isNaN(ry)) {
            circle = container.circle(0, 0, r).attr(attr);
        } else {
            circle = container.ellipse(0, 0, r, ry).attr(attr);
        }

        if (bubble) {
            circle.gradient("radialGradient", [color, AmCharts.adjustLuminosity(color, -0.6)]);
        }

        return circle;
    };

    AmCharts.text = function(container, text, color, fontFamily, fontSize, anchor, bold, alpha) {
        if (!anchor) {
            anchor = "middle";
        }
        if (anchor == "right") {
            anchor = "end";
        }
        if (anchor == "left") {
            anchor = "start";
        }
        if (isNaN(alpha)) {
            alpha = 1;
        }

        if (text !== undefined) {
            text = String(text);
            if (AmCharts.isIE) {
                if (!AmCharts.isModern) {
                    text = text.replace("&amp;", "&");
                    text = text.replace("&", "&amp;");
                }
            }
        }

        var attr = {
            "fill": color,
            "font-family": fontFamily,
            "font-size": fontSize + "px",
            "opacity": alpha
        };

        if (bold === true) {
            attr["font-weight"] = "bold";
        }

        // last as size depends on previous
        attr["text-anchor"] = anchor;

        var txt = container.text(text, attr);

        return txt;
    };



    AmCharts.polygon = function(container, x, y, colors, alpha, bwidth, bcolor, balpha, gradientRotation, noRound, dashLength) {
        if (isNaN(bwidth)) {
            bwidth = 0.01;
        }

        if (isNaN(balpha)) {
            balpha = alpha;
        }
        var color = colors;
        var gradient = false;

        if (typeof(color) == "object") {
            if (color.length > 1) {
                gradient = true;
                color = color[0];
            }
        }

        if (bcolor === undefined) {
            bcolor = color;
        }
        var attr = {
            "fill": color,
            "stroke": bcolor,
            "fill-opacity": alpha,
            "stroke-width": bwidth,
            "stroke-opacity": balpha
        };

        if (dashLength !== undefined && dashLength > 0) {
            attr["stroke-dasharray"] = dashLength;
        }

        var dx = AmCharts.dx;
        var dy = AmCharts.dy;

        if (container.handDrawn) {
            var xy = AmCharts.makeHD(x, y, container.handDrawScatter);
            x = xy[0];
            y = xy[1];
        }

        var round = Math.round;
        if (noRound) {
            x[i] = AmCharts.roundTo(x[i], 5);
            y[i] = AmCharts.roundTo(y[i], 5);
            round = Number;
        }


        var str = "M" + (round(x[0]) + dx) + "," + (round(y[0]) + dy);

        for (var i = 1; i < x.length; i++) {
            if (noRound) {
                x[i] = AmCharts.roundTo(x[i], 5);
                y[i] = AmCharts.roundTo(y[i], 5);
            }

            str += " L" + (round(x[i]) + dx) + "," + (round(y[i]) + dy);
        }
        str += " Z";
        var p = container.path(str).attr(attr);

        if (gradient) {
            p.gradient("linearGradient", colors, gradientRotation);
        }

        return p;
    };


    AmCharts.rect = function(container, w, h, colors, alpha, bwidth, bcolor, balpha, cradius, gradientRotation, dashLength) {
        var UNDEFINED;
        if (isNaN(w) || isNaN(h)) {
            return container.set();
        }

        if (isNaN(bwidth)) {
            bwidth = 0;
        }
        if (cradius === UNDEFINED) {
            cradius = 0;
        }
        if (gradientRotation === UNDEFINED) {
            gradientRotation = 270;
        }
        if (isNaN(alpha)) {
            alpha = 0;
        }
        var color = colors;
        var gradient = false;
        if (typeof(color) == "object") {
            color = color[0];
            gradient = true;
        }
        if (bcolor === UNDEFINED) {
            bcolor = color;
        }
        if (balpha === UNDEFINED) {
            balpha = alpha;
        }

        w = Math.round(w);
        h = Math.round(h);

        var x = 0;
        var y = 0;

        if (w < 0) {
            w = Math.abs(w);
            x = -w;
        }

        if (h < 0) {
            h = Math.abs(h);
            y = -h;
        }

        x += AmCharts.dx;
        y += AmCharts.dy;

        var attr = {
            "fill": color,
            "stroke": bcolor,
            "fill-opacity": alpha,
            "stroke-opacity": balpha
        };

        if (dashLength !== undefined && dashLength > 0) {
            attr["stroke-dasharray"] = dashLength;
        }


        var r = container.rect(x, y, w, h, cradius, bwidth).attr(attr);

        if (gradient) {
            r.gradient("linearGradient", colors, gradientRotation);
        }

        return r;
    };


    AmCharts.bullet = function(container, bulletType, bulletSize, bc, ba, bbt, bbc, bba, originalSize, gradientRotation, pattern, path, dashLength) {
        var bullet;

        if (bulletType == "circle") {
            bulletType = "round";
        }

        switch (bulletType) {
            case "round":
                bullet = AmCharts.circle(container, bulletSize / 2, bc, ba, bbt, bbc, bba);
                break;
            case "square":
                bullet = AmCharts.polygon(container, [-bulletSize / 2, bulletSize / 2, bulletSize / 2, -bulletSize / 2], [bulletSize / 2, bulletSize / 2, -bulletSize / 2, -bulletSize / 2], bc, ba, bbt, bbc, bba, gradientRotation - 180, undefined, dashLength);
                break;
            case "rectangle":
                bullet = AmCharts.polygon(container, [-bulletSize, bulletSize, bulletSize, -bulletSize], [bulletSize / 2, bulletSize / 2, -bulletSize / 2, -bulletSize / 2], bc, ba, bbt, bbc, bba, gradientRotation - 180, undefined, dashLength);
                break;
            case "diamond":
                bullet = AmCharts.polygon(container, [-bulletSize / 2, 0, bulletSize / 2, 0], [0, -bulletSize / 2, 0, bulletSize / 2], bc, ba, bbt, bbc, bba);
                break;
            case "triangleUp":
                bullet = AmCharts.triangle(container, bulletSize, 0, bc, ba, bbt, bbc, bba);
                break;
            case "triangleDown":
                bullet = AmCharts.triangle(container, bulletSize, 180, bc, ba, bbt, bbc, bba);
                break;
            case "triangleLeft":
                bullet = AmCharts.triangle(container, bulletSize, 270, bc, ba, bbt, bbc, bba);
                break;
            case "triangleRight":
                bullet = AmCharts.triangle(container, bulletSize, 90, bc, ba, bbt, bbc, bba);
                break;
            case "bubble":
                bullet = AmCharts.circle(container, bulletSize / 2, bc, ba, bbt, bbc, bba, true);
                break;
            case "line":
                bullet = AmCharts.line(container, [-bulletSize / 2, bulletSize / 2], [0, 0], bc, ba, bbt, bbc, bba);
                break;
            case "yError":
                bullet = container.set();
                bullet.push(AmCharts.line(container, [0, 0], [-bulletSize / 2, bulletSize / 2], bc, ba, bbt));
                bullet.push(AmCharts.line(container, [-originalSize, originalSize], [-bulletSize / 2, -bulletSize / 2], bc, ba, bbt));
                bullet.push(AmCharts.line(container, [-originalSize, originalSize], [bulletSize / 2, bulletSize / 2], bc, ba, bbt));
                break;

            case "xError":
                bullet = container.set();
                bullet.push(AmCharts.line(container, [-bulletSize / 2, bulletSize / 2], [0, 0], bc, ba, bbt));
                bullet.push(AmCharts.line(container, [-bulletSize / 2, -bulletSize / 2], [-originalSize, originalSize], bc, ba, bbt));
                bullet.push(AmCharts.line(container, [bulletSize / 2, bulletSize / 2], [-originalSize, originalSize], bc, ba, bbt));
                break;
        }
        if (bullet) {
            bullet.pattern(pattern, NaN, path);
        }
        return bullet;
    };


    AmCharts.triangle = function(container, w, rotation, color, alpha, bwidth, bcolor, balpha) {
        var UNDEFINED;

        if (bwidth === UNDEFINED || bwidth === 0) {
            bwidth = 1;
        }
        if (bcolor === UNDEFINED) {
            bcolor = "#000";
        }
        if (balpha === UNDEFINED) {
            balpha = 0;
        }

        var attr = {
            "fill": color,
            "stroke": bcolor,
            "fill-opacity": alpha,
            "stroke-width": bwidth,
            "stroke-opacity": balpha
        };

        var half = w / 2;
        var path;
        var comma = ",";
        var l = " L";
        var m = " M";
        var z = " Z";

        if (rotation === 0) {
            path = m + (-half) + comma + half + l + 0 + comma + (-half) + l + half + comma + half + z;
        }
        if (rotation == 180) {
            path = m + (-half) + comma + (-half) + l + 0 + comma + half + l + half + comma + (-half) + z;
        }
        if (rotation == 90) {
            path = m + (-half) + comma + (-half) + l + half + comma + 0 + l + (-half) + comma + half + z;
        }
        if (rotation == 270) {
            path = m + (-half) + comma + 0 + l + half + comma + half + l + half + comma + (-half) + z;
        }

        var triangle = container.path(path).attr(attr);

        return triangle;
    };


    AmCharts.line = function(container, x, y, color, alpha, thickness, dashLength, smoothed, doFix, noRound, noHand) {

        var none = "none";

        if (container.handDrawn && !noHand) {
            return AmCharts.handDrawnLine(container, x, y, color, alpha, thickness, dashLength, smoothed, doFix, noRound, noHand);
        } else {
            var attr = {
                "fill": none,
                "stroke-width": thickness
            };

            if (dashLength !== undefined && dashLength > 0) {
                attr["stroke-dasharray"] = dashLength;
            }

            if (!isNaN(alpha)) {
                attr["stroke-opacity"] = alpha;
            }

            if (color) {
                attr.stroke = color;
            }

            var letter = "L";

            var round = Math.round;

            if (noRound) {
                round = Number;
                x[0] = AmCharts.roundTo(x[0], 5);
                y[0] = AmCharts.roundTo(y[0], 5);
            }

            var dx = AmCharts.dx;
            var dy = AmCharts.dy;
            var str = "M" + (round(x[0]) + dx) + "," + (round(y[0]) + dy);
            var i;
            for (i = 1; i < x.length; i++) {
                x[i] = AmCharts.roundTo(x[i], 5);
                y[i] = AmCharts.roundTo(y[i], 5);
                str += " " + letter + "" + (round(x[i]) + dx) + "," + (round(y[i]) + dy);
            }


            if (AmCharts.VML) {
                return container.path(str, undefined, true).attr(attr);
            } else {
                if (doFix) {
                    str += " M0,0 L0,0";
                }
                return container.path(str).attr(attr);
            }
        }
    };

    AmCharts.makeHD = function(x, y, scatter) {

        var stepSize = 50;

        var xa = [];
        var ya = [];

        for (var i = 1; i < x.length; i++) {

            var x0 = Number(x[i - 1]);
            var y0 = Number(y[i - 1]);
            var x1 = Number(x[i]);
            var y1 = Number(y[i]);

            var distance = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2));
            var steps = Math.round(distance / stepSize) + 1;

            var stepX = (x1 - x0) / steps;
            var stepY = (y1 - y0) / steps;

            for (var s = 0; s <= steps; s++) {

                var xx = x0 + s * stepX + Math.random() * scatter;
                var yy = y0 + s * stepY + Math.random() * scatter;

                xa.push(xx);
                ya.push(yy);
            }
        }

        return [xa, ya];
    };


    AmCharts.handDrawnLine = function(container, x, y, color, alpha, thickness, dashLength, smoothed, doFix, noRound) {
        var i;
        var set = container.set();

        for (i = 1; i < x.length; i++) {

            var x0 = x[i - 1];
            var y0 = y[i - 1];
            var x1 = x[i];
            var y1 = y[i];

            var xa = [x0, x1];
            var ya = [y0, y1];

            var newXY = AmCharts.makeHD(xa, ya, container.handDrawScatter);
            xa = newXY[0];
            ya = newXY[1];

            for (var j = 1; j < xa.length; j++) {
                set.push(AmCharts.line(container, [xa[j - 1], xa[j]], [ya[j - 1], ya[j]], color, alpha, thickness + Math.random() * container.handDrawThickness - container.handDrawThickness / 2, dashLength, smoothed, doFix, noRound, true));
            }
        }

        return set;
    };

    AmCharts.doNothing = function(value) {
        return value;
    };

    AmCharts.drop = function(container, radius, angle, color, alpha, bwidth, bcolor, balpha) {
        var A = " A";
        var cs = "1000,1000";
        var comma = ",";
        var lf = 1;
        var sf = 1;
        var degToRad = 1 / 180 * Math.PI;
        var startAngle = angle - 20;
        var arc = 40;
        var bx = Math.sin(startAngle * degToRad) * radius;
        var by = Math.cos(startAngle * degToRad) * radius;

        var cx = Math.sin((startAngle + arc) * degToRad) * radius;
        var cy = Math.cos((startAngle + arc) * degToRad) * radius;

        var hradius = radius * 0.8;
        var h = -radius / 3;
        var w = radius / 3;

        if (angle === 0) {
            h = -h;
            w = 0;
        }

        if (angle == 180) {
            w = 0;
        }

        if (angle == 90) {
            h = 0;
        }

        if (angle == 270) {
            h = 0;
            w = -w;
        }

        var mx = Math.sin((startAngle + arc / 2) * degToRad) * radius + w;
        var my = Math.cos((startAngle + arc / 2) * degToRad) * radius + h;

        var attributes = {
            "fill": color,
            "stroke": bcolor,
            "stroke-width": bwidth,
            "stroke-opacity": balpha,
            "fill-opacity": alpha
        };

        var parc = "M" + bx + comma + by + A + radius + comma + radius + comma + 0 + comma + lf + comma + sf + comma + cx + comma + cy;
        parc += A + hradius + comma + hradius + comma + 0 + comma + 0 + comma + 0 + comma + mx + comma + my;
        parc += A + hradius + comma + hradius + comma + 0 + comma + 0 + comma + 0 + comma + bx + comma + by;
        return container.path(parc, undefined, undefined, cs).attr(attributes);
    };

    AmCharts.wedge = function(container, x, y, startAngle, arc, radius, yRadius, innerRadius, h, attributes, gradientRatio, pattern, globalPath, gradientType) {
        var round = Math.round;

        radius = round(radius);
        yRadius = round(yRadius);

        innerRadius = round(innerRadius);
        var yInnerRadius = round((yRadius / radius) * innerRadius);

        var vml = AmCharts.VML;

        // FAILS IF BIGGER, and the smaller radius, the bigger corection
        var edge = 359.5 + radius / 100;
        if (edge > 359.94) {
            edge = 359.94;
        }

        if (arc >= edge) {
            arc = edge;
        }

        /* to understand what each letter means
     c-----------b
      \          /
       \        /
        \      /
         d----a
          \  /
           \/
           x
    */

        var degToRad = 1 / 180 * Math.PI;
        var ax = x + Math.sin(startAngle * degToRad) * innerRadius;
        var ay = y - Math.cos(startAngle * degToRad) * yInnerRadius;

        var bx = x + Math.sin(startAngle * degToRad) * radius;
        var by = y - Math.cos(startAngle * degToRad) * yRadius;

        var cx = x + Math.sin((startAngle + arc) * degToRad) * radius;
        var cy = y - Math.cos((startAngle + arc) * degToRad) * yRadius;

        var dx = x + Math.sin((startAngle + arc) * degToRad) * innerRadius;
        var dy = y - Math.cos((startAngle + arc) * degToRad) * yInnerRadius;

        var hsb = AmCharts.adjustLuminosity(attributes.fill, -0.2);

        var bparams = {
            "fill": hsb,
            "stroke-opacity": 0,
            "fill-opacity": attributes["fill-opacity"]
        };

        var lf = 0;
        var sf = 1;
        if (Math.abs(arc) > 180) {
            lf = 1;
        }

        var slice = container.set();
        var comma = ",";
        var L = " L";
        var A = " A";
        var Z = " Z";
        var M = " M";
        var B = " B";
        var UNDEFINED;
        var cs = "1000,1000";

        var wpath;
        var isSmall;
        var ten = 10;

        if (vml) {
            ax = round(ten * ax);
            bx = round(ten * bx);
            cx = round(ten * cx);
            dx = round(ten * dx);
            ay = round(ten * ay);
            by = round(ten * by);
            cy = round(ten * cy);
            dy = round(ten * dy);
            x = round(ten * x);
            h = round(ten * h);
            y = round(ten * y);
            radius = ten * radius;
            yRadius = ten * yRadius;
            innerRadius = ten * innerRadius;
            yInnerRadius = ten * yInnerRadius;

            if (Math.abs(arc) < 1 && Math.abs(cx - bx) <= 1 && Math.abs(cy - by) <= 1) {
                isSmall = true;
            }
        }
        var parc = "";
        var path;

        if (pattern) {
            bparams["fill-opacity"] = 0;
            bparams["stroke-opacity"] = attributes["stroke-opacity"] / 2;
            bparams.stroke = attributes.stroke;
        }

        if (h > 0) {
            path = M + ax + comma + (ay + h) + L + bx + comma + (by + h);
            if (vml) {
                if (!isSmall) {
                    path += A + (x - radius) + comma + (h + y - yRadius) + comma + (x + radius) + comma + (h + y + yRadius) + comma + (bx) + comma + (by + h) + comma + (cx) + comma + (cy + h);
                }

                path += L + dx + comma + (dy + h);

                if (innerRadius > 0) {
                    if (!isSmall) {
                        path += " B" + (x - innerRadius) + comma + (h + y - yInnerRadius) + comma + (x + innerRadius) + comma + (h + y + yInnerRadius) + comma + dx + comma + (h + dy) + comma + ax + comma + (h + ay);
                    }
                }
            } else {
                path += A + radius + comma + yRadius + comma + 0 + comma + lf + comma + sf + comma + cx + comma + (cy + h) + L + dx + comma + (dy + h);

                if (innerRadius > 0) {
                    path += A + innerRadius + comma + yInnerRadius + comma + 0 + comma + lf + comma + 0 + comma + ax + comma + (ay + h);
                }
            }

            path += Z;

            var hh = h;
            if (vml) {
                hh = hh / 10;
            }

            for (var s = 0; s < hh; s += 10) {
                var c = container.path(path, UNDEFINED, UNDEFINED, cs).attr(bparams);
                slice.push(c);
                c.translate(0, -s);
            }


            var b1 = container.path(M + ax + comma + ay + L + ax + comma + (ay + h) + L + bx + comma + (by + h) + L + bx + comma + by + L + ax + comma + ay + Z, UNDEFINED, UNDEFINED, cs).attr(bparams);
            var b2 = container.path(M + cx + comma + cy + L + cx + comma + (cy + h) + L + dx + comma + (dy + h) + L + dx + comma + dy + L + cx + comma + cy + Z, UNDEFINED, UNDEFINED, cs).attr(bparams);
            slice.push(b1);
            slice.push(b2);
        }

        if (vml) {
            if (!isSmall) {
                parc = A + round(x - radius) + comma + round(y - yRadius) + comma + round(x + radius) + comma + round(y + yRadius) + comma + round(bx) + comma + round(by) + comma + round(cx) + comma + round(cy);
            }
            wpath = M + round(ax) + comma + round(ay) + L + round(bx) + comma + round(by) + parc + L + round(dx) + comma + round(dy);
        } else {
            parc = A + radius + comma + yRadius + comma + 0 + comma + lf + comma + sf + comma + cx + comma + cy;
            wpath = M + ax + comma + ay + L + bx + comma + by + parc + L + dx + comma + dy;
        }


        if (innerRadius > 0) {
            if (vml) {
                if (!isSmall) {
                    wpath += B + (x - innerRadius) + comma + (y - yInnerRadius) + comma + (x + innerRadius) + comma + (y + yInnerRadius) + comma + dx + comma + dy + comma + ax + comma + ay;
                }
            } else {
                wpath += A + innerRadius + comma + yInnerRadius + comma + 0 + comma + lf + comma + 0 + comma + ax + comma + ay;
            }
        }


        if (container.handDrawn) {
            var hdLine = AmCharts.line(container, [ax, bx], [ay, by], attributes.stroke, attributes.thickness * Math.random() * container.handDrawThickness, attributes["stroke-opacity"]);
            slice.push(hdLine);
        }


        wpath += Z;

        var w = container.path(wpath, UNDEFINED, UNDEFINED, cs).attr(attributes);

        if (gradientRatio) {
            var gradient = [];
            var i;
            for (i = 0; i < gradientRatio.length; i++) {
                gradient.push(AmCharts.adjustLuminosity(attributes.fill, gradientRatio[i]));
            }

            if (gradientType == "radial" && !AmCharts.isModern) {
                gradient = [];
            }

            if (gradient.length > 0) {
                w.gradient(gradientType + "Gradient", gradient);
            }
        }

        if (AmCharts.isModern) {
            if (gradientType == "radial") {
                if (w.grad) {
                    w.grad.setAttribute("gradientUnits", "userSpaceOnUse");
                    w.grad.setAttribute("r", radius);
                    //var xx = x - container.width / 2;
                    //var yy = y - container.height / 2;
                    //w.grad.setAttribute("gradientTransform", "translate(" + xx + "," + yy + ")");

                    w.grad.setAttribute("cx", x);
                    w.grad.setAttribute("cy", y);
                }
            }
        }

        w.pattern(pattern, NaN, globalPath);
        slice.wedge = w;
        slice.push(w);
        return slice;
    };

    AmCharts.rgb2hex = function(rgb) {
        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        return (rgb && rgb.length === 4) ? "#" +
            ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : "";
    };

    // Thanks Craig Buckler for this method:
    // http://www.sitepoint.com/javascript-generate-lighter-darker-color/
    AmCharts.adjustLuminosity = function(hex, lum) {
        if (hex) {
            if (hex.indexOf("rgb") != -1) {
                hex = AmCharts.rgb2hex(hex);
            }
        }

        hex = String(hex).replace(/[^0-9a-f]/gi, "");
        if (hex.length < 6) {
            hex = String(hex[0]) + String(hex[0]) + String(hex[1]) + String(hex[1]) + String(hex[2]) + String(hex[2]);
        }

        lum = lum || 0;

        var rgb = "#";
        var c;
        var i;

        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }

        return rgb;
    };

})();
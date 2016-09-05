(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.VMLRenderer = AmCharts.Class({
        construct: function(amDraw, chart) {
            var _this = this;
            _this.chart = chart;
            _this.D = amDraw;
            _this.cNames = {
                circle: "oval",
                ellipse: "oval",
                rect: "roundrect",
                path: "shape"
            };
            _this.styleMap = {
                "x": "left",
                "y": "top",
                "width": "width",
                "height": "height",
                "font-family": "fontFamily",
                "font-size": "fontSize",
                "visibility": "visibility"
            };
        },

        create: function(obj, name) {
            var node;
            if (name == "group") {
                node = document.createElement("div");
                obj.type = "div";
            } else if (name == "text") {
                node = document.createElement("div");
                obj.type = "text";
            } else if (name == "image") {
                node = document.createElement("img");
                obj.type = "image";
            } else {
                obj.type = "shape";
                obj.shapeType = this.cNames[name];

                node = document.createElement("amvml:" + this.cNames[name]);
                var stroke = document.createElement("amvml:stroke");
                node.appendChild(stroke);
                obj.stroke = stroke;

                var fill = document.createElement("amvml:fill");
                node.appendChild(fill);
                obj.fill = fill;
                fill.className = "amvml";
                stroke.className = "amvml";
                node.className = "amvml";
            }

            node.style.position = "absolute";
            node.style.top = 0;
            node.style.left = 0;

            return node;
        },

        path: function(obj, p) {
            obj.node.setAttribute("src", p);
        },


        setAttr: function(obj, attr, value) {
            if (value !== undefined) {
                var mode8;
                if (document.documentMode === 8) {
                    mode8 = true;
                }

                var node = obj.node;

                var _this = this;
                var type = obj.type;
                var nodeStyle = node.style;


                // circle radius
                if (attr == "r") {
                    nodeStyle.width = value * 2;
                    nodeStyle.height = value * 2;
                }

                if (obj.shapeType == "oval") {
                    if (attr == "rx") {
                        nodeStyle.width = value * 2;
                    }

                    if (attr == "ry") {
                        nodeStyle.height = value * 2;
                    }
                }

                if (obj.shapeType == "roundrect") {
                    if (attr == "width" || attr == "height") {
                        value -= 1;
                    }
                }

                if (attr == "cursor") {
                    nodeStyle.cursor = value;
                }

                // circle x
                if (attr == "cx") {
                    nodeStyle.left = value - AmCharts.removePx(nodeStyle.width) / 2;
                }
                // circle y
                if (attr == "cy") {
                    nodeStyle.top = value - AmCharts.removePx(nodeStyle.height) / 2;
                }

                var styleName = _this.styleMap[attr];

                if (styleName == "width" || "styleName" == "height") {
                    if (value < 0) {
                        value = 0;
                    }
                }

                if (styleName !== undefined) {
                    nodeStyle[styleName] = value;
                }

                if (type == "text") {
                    if (attr == "text-anchor") {
                        var px = "px";
                        obj.anchor = value;

                        var textWidth = node.clientWidth;

                        if (value == "end") {
                            nodeStyle.marginLeft = -textWidth + px;
                        }
                        if (value == "middle") {
                            nodeStyle.marginLeft = -(textWidth / 2) + px;
                            nodeStyle.textAlign = "center";
                        }
                        if (value == "start") {
                            nodeStyle.marginLeft = 0 + px;
                        }
                    }
                    if (attr == "fill") {
                        nodeStyle.color = value;
                    }
                    if (attr == "font-weight") {
                        nodeStyle.fontWeight = value;
                    }
                }

                var children = obj.children;
                if (children) {
                    var i;
                    for (i = 0; i < children.length; i++) {
                        children[i].setAttr(attr, value);
                    }
                }

                // path
                if (type == "shape") {
                    if (attr == "cs") {
                        node.style.width = "100px";
                        node.style.height = "100px";
                        node.setAttribute("coordsize", value);
                    }

                    if (attr == "d") {
                        node.setAttribute("path", _this.svgPathToVml(value));
                    }

                    if (attr == "dd") {
                        node.setAttribute("path", value);
                    }

                    var stroke = obj.stroke;
                    var fill = obj.fill;

                    if (attr == "stroke") {
                        if (mode8) {
                            stroke.color = value;
                        } else {
                            stroke.setAttribute("color", value);
                        }
                    }

                    if (attr == "stroke-width") {
                        if (mode8) {
                            stroke.weight = value;
                        } else {
                            stroke.setAttribute("weight", value);
                        }
                    }

                    if (attr == "stroke-opacity") {
                        if (mode8) {
                            stroke.opacity = value;
                        } else {
                            stroke.setAttribute("opacity", value);
                        }
                    }
                    if (attr == "stroke-dasharray") {
                        var val = "solid";
                        if (value > 0 && value < 3) {
                            val = "dot";
                        }
                        if (value >= 3 && value <= 6) {
                            val = "dash";
                        }
                        if (value > 6) {
                            val = "longdash";
                        }
                        if (mode8) {
                            stroke.dashstyle = val;
                        } else {
                            stroke.setAttribute("dashstyle", val);
                        }
                    }
                    if (attr == "fill-opacity" || attr == "opacity") {
                        if (value === 0) {
                            if (mode8) {
                                fill.on = false;
                            } else {
                                fill.setAttribute("on", false);
                            }
                        } else {
                            if (mode8) {
                                fill.opacity = value;
                            } else {
                                fill.setAttribute("opacity", value);
                            }
                        }

                    }

                    if (attr == "fill") {
                        if (mode8) {
                            fill.color = value;
                        } else {
                            fill.setAttribute("color", value);
                        }
                    }

                    if (attr == "rx") {
                        if (mode8) {
                            node.arcSize = value + "%";
                        } else {
                            node.setAttribute("arcsize", value + "%");
                        }
                    }
                }
            }
        },

        attr: function(obj, attributes) {
            var _this = this;
            var a;
            for (a in attributes) {
                if (attributes.hasOwnProperty(a)) {
                    _this.setAttr(obj, a, attributes[a]);
                }
            }
        },

        text: function(text, attr, container) {
            var _this = this;

            var t = new AmCharts.AmDObject("text", _this.D);
            var node = t.node;
            node.style.whiteSpace = "pre";
            //var txt = document.createTextNode(text);

            node.innerHTML = text;
            _this.D.addToContainer(node, container);
            _this.attr(t, attr);

            return t;
        },

        getBBox: function(obj) {
            var node = obj.node;
            var box = this.getBox(node);
            return box;
        },

        getBox: function(node) {
            var x = node.offsetLeft;
            var y = node.offsetTop;

            var width = node.offsetWidth;
            var height = node.offsetHeight;

            var bbox;

            if (node.hasChildNodes()) {
                var xs;
                var ys;
                var i;
                for (i = 0; i < node.childNodes.length; i++) {
                    var childNode = node.childNodes[i];
                    bbox = this.getBox(childNode);
                    var xx = bbox.x;

                    if (!isNaN(xx)) {
                        if (isNaN(xs)) {
                            xs = xx;
                        } else if (xx < xs) {
                            xs = xx;
                        }
                    }

                    var yy = bbox.y;

                    if (!isNaN(yy)) {
                        if (isNaN(ys)) {
                            ys = yy;
                        } else if (yy < ys) {
                            ys = yy;
                        }
                    }


                    var ww = bbox.width + xx;

                    if (!isNaN(ww)) {
                        width = Math.max(width, ww);
                    }

                    var hh = bbox.height + yy;

                    if (!isNaN(hh)) {
                        height = Math.max(height, hh);
                    }
                }

                if (xs < 0) {
                    x += xs;
                }
                if (ys < 0) {
                    y += ys;
                }
            }

            return ({
                x: x,
                y: y,
                width: width,
                height: height
            });
        },

        setText: function(obj, str) {
            var node = obj.node;
            if (node) {
                node.innerHTML = str;
            }
            this.setAttr(obj, "text-anchor", obj.anchor);
        },

        addListener: function(obj, event, f) {
            obj.node["on" + event] = f;
        },

        move: function(obj, x, y) {
            var node = obj.node;
            var nodeStyle = node.style;

            if (obj.type == "text") {
                y -= AmCharts.removePx(nodeStyle.fontSize) / 2 - 1;
            }

            if (obj.shapeType == "oval") {
                x -= AmCharts.removePx(nodeStyle.width) / 2;
                y -= AmCharts.removePx(nodeStyle.height) / 2;
            }

            var bw = obj.bw;

            if (!isNaN(bw)) {
                x -= bw;
                y -= bw;
            }

            var px = "px";
            if (!isNaN(x) && !isNaN(y)) {
                node.style.left = x + px;
                node.style.top = y + px;
            }
        },

        svgPathToVml: function(path) {
            var pathArray = path.split(" ");
            path = "";
            var previousArray;
            var round = Math.round;
            var comma = ",";
            var i;
            for (i = 0; i < pathArray.length; i++) {
                var el = pathArray[i];
                var letter = el.substring(0, 1);
                var numbers = el.substring(1);
                var numbersArray = numbers.split(",");

                var rounded = round(numbersArray[0]) + comma + round(numbersArray[1]);

                if (letter == "M") {
                    path += " m " + rounded;
                }
                if (letter == "L") {
                    path += " l " + rounded;
                }
                if (letter == "Z") {
                    path += " x e";
                }
                if (letter == "Q") {
                    var length = previousArray.length;
                    var qp0x = previousArray[length - 2];
                    var qp0y = previousArray[length - 1];

                    var qp1x = numbersArray[0];
                    var qp1y = numbersArray[1];

                    var qp2x = numbersArray[2];
                    var qp2y = numbersArray[3];

                    var cp1x = round(qp0x / 3 + 2 / 3 * qp1x);
                    var cp1y = round(qp0y / 3 + 2 / 3 * qp1y);

                    var cp2x = round(2 / 3 * qp1x + qp2x / 3);
                    var cp2y = round(2 / 3 * qp1y + qp2y / 3);

                    path += " c " + cp1x + comma + cp1y + comma + cp2x + comma + cp2y + comma + qp2x + comma + qp2y;
                }

                if (letter == "A") {
                    path += " wa " + numbers;
                }

                if (letter == "B") {
                    path += " at " + numbers;
                }

                previousArray = numbersArray;
            }

            return path;
        },


        animate: function(obj, attribute, to, time, effect) {
            var _this = this;
            var node = obj.node;
            var chart = _this.chart;
            obj.animationFinished = false;

            if (attribute == "translate") {
                var toA = to.split(",");
                var toX = toA[0];
                var toY = toA[1];

                var fromX = node.offsetLeft;
                var fromY = node.offsetTop;

                chart.animate(obj, "left", fromX, toX, time, effect, "px");
                chart.animate(obj, "top", fromY, toY, time, effect, "px");
            }
        },



        clipRect: function(obj, x, y, w, h) {
            var node = obj.node;
            var PX = "px";
            if (x === 0 && y === 0) {
                node.style.width = w + PX;
                node.style.height = h + PX;
                node.style.overflow = "hidden";
            } else {
                node.style.clip = "rect(" + y + "px " + (x + w) + "px " + (y + h) + "px " + x + "px)";
            }
        },

        rotate: function(obj, deg, bgColor) {
            if (Number(deg) !== 0) {
                var node = obj.node;
                var style = node.style;

                if (!bgColor) {
                    bgColor = this.getBGColor(node.parentNode);
                }

                style.backgroundColor = bgColor;
                style.paddingLeft = 1;

                var rad = deg * Math.PI / 180;
                var costheta = Math.cos(rad);
                var sintheta = Math.sin(rad);

                var left = AmCharts.removePx(style.left);
                var top = AmCharts.removePx(style.top);
                var width = node.offsetWidth;
                var height = node.offsetHeight;

                var sign = deg / Math.abs(deg);

                style.left = left + width / 2 - width / 2 * Math.cos(rad) - sign * height / 2 * Math.sin(rad) + 3;
                style.top = top - sign * width / 2 * Math.sin(rad) + sign * height / 2 * Math.sin(rad);

                style.cssText = style.cssText + "; filter:progid:DXImageTransform.Microsoft.Matrix(M11='" + costheta + "', M12='" + -sintheta + "', M21='" + sintheta + "', M22='" + costheta + "', sizingmethod='auto expand');";
            }
        },


        getBGColor: function(node) {
            var style = node.style;
            var bgColor = "#FFFFFF";

            if (style) {
                var color = node.style.backgroundColor;
                if (color !== "") {
                    bgColor = color;
                } else if (node.parentNode) {
                    bgColor = this.getBGColor(node.parentNode);
                }
            }
            return bgColor;
        },

        set: function(arr) {
            var _this = this;
            var s = new AmCharts.AmDObject("group", _this.D);
            _this.D.container.appendChild(s.node);

            if (arr) {
                var i;
                for (i = 0; i < arr.length; i++) {
                    s.push(arr[i]);
                }
            }
            return s;
        },

        gradient: function(obj, type, colors, rotation) {
            var c = "";

            if (type == "radialGradient") {
                type = "gradientradial";
                colors.reverse();
            }

            if (type == "linearGradient") {
                type = "gradient";
            }
            var i;
            for (i = 0; i < colors.length; i++) {
                var offset = Math.round(i * 100 / (colors.length - 1));

                c += offset + "% " + colors[i];
                if (i < colors.length - 1) {
                    c += ",";
                }
            }

            var fill = obj.fill;

            if (rotation == 90) {
                rotation = 0;
            } else if (rotation == 270) {
                rotation = 180;
            } else if (rotation == 180) {
                rotation = 90;
            } else if (rotation === 0) {
                rotation = 270;
            }

            if (document.documentMode === 8) {
                fill.type = type;
                fill.angle = rotation;
            } else {
                fill.setAttribute("type", type);
                fill.setAttribute("angle", rotation);
            }
            if (c) {
                fill.colors.value = c;
            }
        },

        remove: function(obj) {
            var _this = this;

            if (obj.clipPath) {
                _this.D.remove(obj.clipPath);
            }
            _this.D.remove(obj.node);
        },

        disableSelection: function(target) {
            if (typeof target.onselectstart !== undefined) {
                target.onselectstart = function() {
                    return false;
                };
            }
            target.style.cursor = "default";
        },

        pattern: function(obj, pattern, scale, path) {
            var node = obj.node;

            var fill = obj.fill;
            var type = "tile";

            var color = "none";
            if (pattern.color) {
                color = pattern.color;
            }
            node.fillColor = color;

            var url = pattern.url;
            if (!AmCharts.isAbsolute(url)) {
                url = path + url;
            }

            if (document.documentMode === 8) {
                fill.type = type;
                fill.src = url;
            } else {
                fill.setAttribute("type", type);
                fill.setAttribute("src", url);
            }
        },

        update: function() {
            // void
        }
    });
})();
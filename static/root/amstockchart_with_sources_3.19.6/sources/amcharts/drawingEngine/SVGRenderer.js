(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.SVGRenderer = AmCharts.Class({
        construct: function(amDraw) {
            var _this = this;
            _this.D = amDraw;
            _this.animations = [];
        },

        create: function(obj, name) {
            return document.createElementNS(AmCharts.SVG_NS, name);
        },

        attr: function(obj, attributes) {
            var a;
            for (a in attributes) {
                if (attributes.hasOwnProperty(a)) {
                    this.setAttr(obj, a, attributes[a]);
                }
            }
        },

        setAttr: function(obj, attr, value) {
            if (value !== undefined) {
                obj.node.setAttribute(attr, value);
            }
        },

        animate: function(obj, attribute, to, time, effect) {

            var _this = this;
            obj.animationFinished = false;
            var node = obj.node;
            var from;

            if (obj["an_" + attribute]) {
                AmCharts.removeFromArray(_this.animations, obj["an_" + attribute]);
            }

            if (attribute == "translate") {

                from = node.getAttribute("transform");

                if (!from) {
                    from = "0,0";
                } else {
                    from = String(from).substring(10, from.length - 1);
                }

                from = from.split(", ").join(" ");
                from = from.split(" ").join(",");

                if (from === 0) {
                    from = "0,0";
                }
            } else {
                from = Number(node.getAttribute(attribute));
            }

            var animationObj = {
                obj: obj,
                frame: 0,
                attribute: attribute,
                from: from,
                to: to,
                time: time,
                effect: effect
            };

            _this.animations.push(animationObj);

            obj["an_" + attribute] = animationObj;
        },

        update: function() {
            var _this = this;
            var i;

            var animations = _this.animations;
            var count = animations.length - 1;
            for (i = count; i >= 0; i--) {
                var animation = animations[i];

                var totalCount = animation.time * AmCharts.updateRate;
                var frame = animation.frame + 1;
                var obj = animation.obj;
                var attribute = animation.attribute;

                var fromXY;
                var fromX;
                var fromY;
                var toXY;
                var toX;
                var toY;
                var to;

                if (frame <= totalCount) {
                    var value;
                    animation.frame++;

                    if (attribute == "translate") {
                        fromXY = animation.from.split(",");
                        fromX = Number(fromXY[0]);
                        fromY = Number(fromXY[1]);

                        if (isNaN(fromY)) {
                            fromY = 0;
                        }

                        toXY = animation.to.split(",");
                        toX = Number(toXY[0]);
                        toY = Number(toXY[1]);

                        var valueX;
                        if (toX - fromX === 0) {
                            valueX = toX;
                        } else {
                            valueX = Math.round(AmCharts[animation.effect](0, frame, fromX, toX - fromX, totalCount));
                        }

                        var valueY;
                        if (toY - fromY === 0) {
                            valueY = toY;
                        } else {
                            valueY = Math.round(AmCharts[animation.effect](0, frame, fromY, toY - fromY, totalCount));
                        }
                        attribute = "transform";
                        value = "translate(" + valueX + "," + valueY + ")";
                    } else {
                        var from = Number(animation.from);
                        to = Number(animation.to);
                        var change = to - from;

                        value = AmCharts[animation.effect](0, frame, from, change, totalCount);

                        if (isNaN(value)) {
                            value = to;
                        }

                        if (change === 0) {
                            _this.animations.splice(i, 1);
                        }
                    }

                    _this.setAttr(obj, attribute, value);
                } else {
                    if (attribute == "translate") {
                        toXY = animation.to.split(",");
                        toX = Number(toXY[0]);
                        toY = Number(toXY[1]);

                        obj.translate(toX, toY);
                    } else {
                        to = Number(animation.to);
                        _this.setAttr(obj, attribute, to);
                    }
                    obj.animationFinished = true;
                    _this.animations.splice(i, 1);
                }
            }
        },

        getBBox: function(obj) {
            var node = obj.node;
            var bbox = {
                width: 0,
                height: 0,
                x: 0,
                y: 0
            };
            if (node) {
                try {
                    return node.getBBox();
                } catch (err) {

                }
            }

            return bbox;
        },

        path: function(obj, p) {
            obj.node.setAttributeNS(AmCharts.SVG_XLINK, "xlink:href", p);
        },

        clipRect: function(obj, x, y, w, h) {
            var _this = this;
            var node = obj.node;

            var old = obj.clipPath;
            if (old) {
                _this.D.remove(old);
            }

            var parent = node.parentNode;
            if (parent) {
                var clipPath = document.createElementNS(AmCharts.SVG_NS, "clipPath");
                var uniqueId = AmCharts.getUniqueId();
                clipPath.setAttribute("id", uniqueId);

                _this.D.rect(x, y, w, h, 0, 0, clipPath);

                parent.appendChild(clipPath);
                var url = "#";
                if (AmCharts.baseHref && !AmCharts.isIE) {
                    url = _this.removeTarget(window.location.href) + url;
                }
                _this.setAttr(obj, "clip-path", "url(" + url + uniqueId + ")");
                _this.clipPathC++;

                // save reference in order not to get by id when removing
                obj.clipPath = clipPath;
            }
        },

        text: function(text, attr, container) {
            var _this = this;
            var t = new AmCharts.AmDObject("text", _this.D);

            var textArray = String(text).split("\n");
            var fontSize = AmCharts.removePx(attr["font-size"]);
            var i;
            for (i = 0; i < textArray.length; i++) {
                var tspan = _this.create(null, "tspan");
                tspan.appendChild(document.createTextNode(textArray[i]));
                tspan.setAttribute("y", (fontSize + 2) * i + Math.round(fontSize / 2));
                tspan.setAttribute("x", 0);
                //tspan.style.fontSize = fontSize + "px";
                t.node.appendChild(tspan);
            }
            t.node.setAttribute("y", Math.round(fontSize / 2));

            _this.attr(t, attr);
            _this.D.addToContainer(t.node, container);

            return t;
        },


        setText: function(obj, str) {
            var node = obj.node;
            if (node) {
                node.removeChild(node.firstChild);
                node.appendChild(document.createTextNode(str));
            }
        },

        move: function(obj, x, y, scale) {
            if (isNaN(x)) {
                x = 0;
            }

            if (isNaN(y)) {
                y = 0;
            }

            var val = "translate(" + x + "," + y + ")";
            if (scale) {
                val = val + " scale(" + scale + ")";
            }

            this.setAttr(obj, "transform", val);
        },


        rotate: function(obj, angle) {
            var node = obj.node;
            var transform = node.getAttribute("transform");
            var val = "rotate(" + angle + ")";
            if (transform) {
                val = transform + " " + val;
            }
            this.setAttr(obj, "transform", val);
        },

        set: function(arr) {
            var _this = this;
            var s = new AmCharts.AmDObject("g", _this.D);
            _this.D.container.appendChild(s.node);

            if (arr) {
                var i;
                for (i = 0; i < arr.length; i++) {
                    s.push(arr[i]);
                }
            }
            return s;
        },

        addListener: function(obj, event, f) {
            obj.node["on" + event] = f;
        },

        gradient: function(obj, type, colors, rotation) {
            var _this = this;
            var node = obj.node;

            var old = obj.grad;
            if (old) {
                _this.D.remove(old);
            }

            var gradient = document.createElementNS(AmCharts.SVG_NS, type);
            var uniqueId = AmCharts.getUniqueId();
            gradient.setAttribute("id", uniqueId);

            if (!isNaN(rotation)) {
                var x1 = 0;
                var x2 = 0;
                var y1 = 0;
                var y2 = 0;

                if (rotation == 90) {
                    y1 = 100;
                } else if (rotation == 270) {
                    y2 = 100;
                } else if (rotation == 180) {
                    x1 = 100;
                } else if (rotation === 0) {
                    x2 = 100;
                }

                var p = "%";

                gradient.setAttribute("x1", x1 + p);
                gradient.setAttribute("x2", x2 + p);
                gradient.setAttribute("y1", y1 + p);
                gradient.setAttribute("y2", y2 + p);
            }
            var i;
            for (i = 0; i < colors.length; i++) {
                var stop = document.createElementNS(AmCharts.SVG_NS, "stop");
                var offset = 100 * i / (colors.length - 1);
                if (i === 0) {
                    offset = 0;
                }
                stop.setAttribute("offset", offset + "%");
                stop.setAttribute("stop-color", colors[i]);
                gradient.appendChild(stop);
            }
            node.parentNode.appendChild(gradient);

            var url = "#";
            if (AmCharts.baseHref && !AmCharts.isIE) {
                url = _this.removeTarget(window.location.href) + url;
            }

            node.setAttribute("fill", "url(" + url + uniqueId + ")");

            obj.grad = gradient;
        },

        removeTarget: function(url) {
            var urlArr = url.split("#");
            return urlArr[0];
        },


        pattern: function(obj, pattern, scale, path) {
            var _this = this;
            var node = obj.node;

            if (isNaN(scale)) {
                scale = 1;
            }

            var old = obj.patternNode;
            if (old) {
                _this.D.remove(old);
            }

            var patternNode = document.createElementNS(AmCharts.SVG_NS, "pattern");
            var uniqueId = AmCharts.getUniqueId();
            var url = pattern;
            if (pattern.url) {
                url = pattern.url;
            }

            if (!AmCharts.isAbsolute(url) && url.indexOf("data:image") == -1) {
                url = path + url;
            }

            var width = Number(pattern.width);
            if (isNaN(width)) {
                width = 4;
            }

            var height = Number(pattern.height);
            if (isNaN(height)) {
                height = 4;
            }

            width = width / scale;
            height = height / scale;

            var x = pattern.x;
            if (isNaN(x)) {
                x = 0;
            }
            var randomX = -Math.random() * Number(pattern.randomX);
            if (!isNaN(randomX)) {
                x = randomX;
            }

            var y = pattern.y;
            if (isNaN(y)) {
                y = 0;
            }
            var randomY = -Math.random() * Number(pattern.randomY);
            if (!isNaN(randomY)) {
                y = randomY;
            }

            patternNode.setAttribute("id", uniqueId);
            patternNode.setAttribute("width", width);
            patternNode.setAttribute("height", height);
            patternNode.setAttribute("patternUnits", "userSpaceOnUse");
            patternNode.setAttribute("xlink:href", url);

            if (pattern.color) {
                var rect = document.createElementNS(AmCharts.SVG_NS, "rect");
                rect.setAttributeNS(null, "height", width);
                rect.setAttributeNS(null, "width", height);
                rect.setAttributeNS(null, "fill", pattern.color);
                patternNode.appendChild(rect);
            }

            var image = _this.D.image(url, 0, 0, width, height, patternNode);
            image.translate(x, y);


            url = "#";
            if (AmCharts.baseHref && !AmCharts.isIE) {
                url = _this.removeTarget(window.location.href) + url;
            }

            node.setAttribute("fill", "url(" + url + uniqueId + ")");

            obj.patternNode = patternNode;
            node.parentNode.appendChild(patternNode);
        },


        remove: function(obj) {
            var _this = this;

            if (obj.clipPath) {
                _this.D.remove(obj.clipPath);
            }

            if (obj.grad) {
                _this.D.remove(obj.grad);
            }

            if (obj.patternNode) {
                _this.D.remove(obj.patternNode);
            }

            _this.D.remove(obj.node);
        }

    });
})();
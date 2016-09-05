(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.AmDObject = AmCharts.Class({
        construct: function(name, amDraw) {
            var _this = this;
            _this.D = amDraw;
            _this.R = amDraw.R;
            var node = _this.R.create(this, name);
            _this.node = node;
            _this.x = 0;
            _this.y = 0;
            _this.scale = 1;
        },

        attr: function(attributes) {
            this.R.attr(this, attributes);
            return this;
        },

        getAttr: function(attr) {
            return this.node.getAttribute(attr);
        },

        setAttr: function(attr, value) {
            this.R.setAttr(this, attr, value);
            return this;
        },

        clipRect: function(x, y, w, h) {
            this.R.clipRect(this, x, y, w, h);
        },

        translate: function(x, y, scale, noRound) {
            var _this = this;

            if (!noRound) {
                x = Math.round(x);
                y = Math.round(y);
            }

            this.R.move(this, x, y, scale);
            _this.x = x;
            _this.y = y;

            _this.scale = scale;
            if (_this.angle) {
                _this.rotate(_this.angle);
            }
        },

        rotate: function(angle, bgColor) {
            this.R.rotate(this, angle, bgColor);
            this.angle = angle;
        },

        animate: function(attributes, time, effect) {
            var a;
            for (a in attributes) {
                if (attributes.hasOwnProperty(a)) {
                    var attribute = a;
                    var to = attributes[a];

                    effect = AmCharts.getEffect(effect);

                    this.R.animate(this, attribute, to, time, effect);
                }
            }
        },

        push: function(obj) {
            if (obj) {
                var node = this.node;

                node.appendChild(obj.node);

                var clipPath = obj.clipPath;
                if (clipPath) {
                    node.appendChild(clipPath);
                }

                var grad = obj.grad;
                if (grad) {
                    node.appendChild(grad);
                }
            }
        },

        text: function(str) {
            this.R.setText(this, str);
        },

        remove: function() {
            this.stop();
            this.R.remove(this);
        },

        clear: function() {
            var node = this.node;
            if (node.hasChildNodes()) {
                while (node.childNodes.length >= 1) {
                    node.removeChild(node.firstChild);
                }
            }
        },

        hide: function() {
            this.setAttr("visibility", "hidden");
        },

        show: function() {
            this.setAttr("visibility", "visible");
        },

        getBBox: function() {
            return this.R.getBBox(this);
        },

        toFront: function() {
            var node = this.node;

            if (node) {
                this.prevNextNode = node.nextSibling;
                var parent = node.parentNode;

                if (parent) {
                    parent.appendChild(node);
                }
            }

        },

        toPrevious: function() {
            var node = this.node;
            if (node) {
                if (this.prevNextNode) {
                    var parent = node.parentNode;

                    if (parent) {
                        parent.insertBefore(this.prevNextNode, null);
                    }
                }
            }
        },

        toBack: function() {
            var node = this.node;
            if (node) {
                this.prevNextNode = node.nextSibling;
                var parent = node.parentNode;
                if (parent) {
                    var firstChild = parent.firstChild;
                    if (firstChild) {
                        parent.insertBefore(node, firstChild);
                    }
                }
            }
        },

        mouseover: function(f) {
            this.R.addListener(this, "mouseover", f);
            return this;
        },

        mouseout: function(f) {
            this.R.addListener(this, "mouseout", f);
            return this;
        },

        click: function(f) {
            this.R.addListener(this, "click", f);
            return this;
        },

        dblclick: function(f) {
            this.R.addListener(this, "dblclick", f);
            return this;
        },

        mousedown: function(f) {
            this.R.addListener(this, "mousedown", f);
            return this;
        },

        mouseup: function(f) {
            this.R.addListener(this, "mouseup", f);
            return this;
        },

        touchmove: function(f) {
            this.R.addListener(this, "touchmove", f);
            return this;
        },

        touchstart: function(f) {
            this.R.addListener(this, "touchstart", f);
            return this;
        },

        touchend: function(f) {
            this.R.addListener(this, "touchend", f);
            return this;
        },

        contextmenu: function(f) {
            if (this.node.addEventListener) {
                this.node.addEventListener("contextmenu", f, true);
            } else {
                this.R.addListener(this, "contextmenu", f);
            }
            return this;
        },

        stop: function() {
            var _this = this;

            AmCharts.removeFromArray(_this.R.animations, _this.an_translate);
            AmCharts.removeFromArray(_this.R.animations, _this.an_y);
            AmCharts.removeFromArray(_this.R.animations, _this.an_x);
        },


        length: function() {
            return this.node.childNodes.length;
        },

        gradient: function(type, colors, rotation) {
            this.R.gradient(this, type, colors, rotation);
        },

        pattern: function(patternURL, scale, path) {
            if (patternURL) {
                this.R.pattern(this, patternURL, scale, path);
            }
        }

    });
})();
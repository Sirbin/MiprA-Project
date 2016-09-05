(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.Image = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "Image";
            _this.width = 20;
            _this.height = 20;
            _this.offsetX = 0;
            _this.offsetY = 0;
            _this.rotation = 0;
            _this.color = "#000000";
            _this.balloonColor = "#000000";

            _this.opacity = 1;

            AmCharts.applyTheme(_this, theme, _this.cname);
        },

        draw: function() {
            var _this = this;
            if (_this.set) {
                _this.set.remove();
            }

            var container = _this.chart.container;
            _this.set = container.set();

            var sprite;
            var scale;

            if (_this.url) {
                sprite = container.image(_this.url, 0, 0, _this.width, _this.height);
                scale = 1;
            } else if (_this.svgPath) {
                sprite = container.path(_this.svgPath);
                sprite.setAttr("fill", _this.color);
                sprite.setAttr("stroke", _this.outlineColor);

                var bbox = sprite.getBBox();
                var w = bbox.width;
                var h = bbox.height;

                scale = Math.min(_this.width / w, _this.height / h);
            }
            if (sprite) {
                sprite.setAttr("opacity", _this.opacity);
                _this.set.rotate(_this.rotation);
                sprite.translate(-_this.width / 2, -_this.height / 2, scale);

                if (_this.balloonText) {
                    sprite.mouseover(function() {
                        _this.chart.showBalloon(_this.balloonText, _this.balloonColor, true);
                    }).mouseout(function() {
                        _this.chart.hideBalloon();
                    }).touchend(function() {
                        _this.chart.hideBalloon();
                    }).touchstart(function() {
                        _this.chart.showBalloon(_this.balloonText, _this.balloonColor, true);
                    });
                }

                _this.set.push(sprite);
            }
        },

        translate: function(x, y) {
            var _this = this;
            if (_this.set) {
                _this.set.translate(x, y);
            }
        }
    });
})();
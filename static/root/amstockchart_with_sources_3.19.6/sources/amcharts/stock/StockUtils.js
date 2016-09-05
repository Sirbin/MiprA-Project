(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.getItemIndex = function(item, array) {
        var index = -1;
        var i;
        for (i = 0; i < array.length; i++) {
            if (item == array[i]) {
                index = i;
            }
        }
        return index;
    };


    AmCharts.addBr = function(div) {
        div.appendChild(document.createElement("br"));
    };

    AmCharts.applyStyles = function(style, obj) {

        if (obj && style) {
            for (var s in style) {
                var name = s;
                var value = obj[name];
                if (value !== undefined) {
                    try {
                        style[name] = value;
                    } catch (err) {

                    }
                }
            }
        }
    };

})();
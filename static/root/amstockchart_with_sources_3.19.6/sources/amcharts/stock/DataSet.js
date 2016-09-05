(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.DataSet = AmCharts.Class({

        construct: function() {
            var _this = this;
            _this.cname = "DataSet";
            _this.fieldMappings = [];
            _this.dataProvider = [];
            _this.agregatedDataProviders = [];
            _this.stockEvents = [];
            _this.compared = false;
            _this.showInSelect = true;
            _this.showInCompare = true;
        }
    });
})();
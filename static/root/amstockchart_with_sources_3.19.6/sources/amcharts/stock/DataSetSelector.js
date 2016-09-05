(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.DataSetSelector = AmCharts.Class({

        construct: function(theme) {
            var _this = this;
            _this.cname = "DataSetSelector";
            _this.theme = theme;

            _this.createEvents("dataSetSelected", "dataSetCompared", "dataSetUncompared");

            _this.position = "left";
            _this.selectText = "Select:";
            _this.comboBoxSelectText = "Select...";
            _this.compareText = "Compare to:";
            _this.width = 180;
            _this.dataProvider = [];
            _this.listHeight = 150;
            _this.listCheckBoxSize = 14;
            _this.rollOverBackgroundColor = "#b2e1ff";
            _this.selectedBackgroundColor = "#7fceff";

            AmCharts.applyTheme(_this, theme, _this.cname);
        },

        write: function(div) {
            var _this = this;
            var i;
            var theme = _this.theme;
            var chart = _this.chart;
            div.className = "amChartsDataSetSelector " + chart.classNamePrefix + "-data-set-selector-div";

            var tempW = _this.width;
            var tempP = _this.position;
            _this.width = undefined;
            _this.position = undefined;

            AmCharts.applyStyles(div.style, _this);
            _this.div = div;

            _this.width = tempW;
            _this.position = tempP;

            div.innerHTML = "";

            var position = _this.position;
            var vertical;

            if (position == "top" || position == "bottom") {
                vertical = false;
            } else {
                vertical = true;
            }
            _this.vertical = vertical;

            var widthPx;

            if (vertical) {
                widthPx = _this.width + "px";
            }

            var dataSets = _this.dataProvider;
            var dataSet;
            var option;

            if (_this.countDataSets("showInSelect") > 1) {
                var selectLabel = document.createTextNode(AmCharts.lang.selectText || _this.selectText);
                div.appendChild(selectLabel);

                if (vertical) {
                    AmCharts.addBr(div);
                }

                var selectCB = document.createElement("select");
                if (widthPx) {
                    selectCB.style.width = widthPx;
                }
                _this.selectCB = selectCB;
                if (theme) {
                    AmCharts.applyStyles(selectCB.style, theme.DataSetSelect);
                }

                selectCB.className = chart.classNamePrefix + "-data-set-select";
                div.appendChild(selectCB);

                if (AmCharts.isNN) {
                    selectCB.addEventListener("change", function(event) {
                        _this.handleDataSetChange.call(_this, event);
                    }, true);
                }

                if (AmCharts.isIE) {
                    selectCB.attachEvent("onchange", function(event) {
                        _this.handleDataSetChange.call(_this, event);
                    });
                }

                for (i = 0; i < dataSets.length; i++) {
                    dataSet = dataSets[i];
                    if (dataSet.showInSelect === true) {
                        option = document.createElement("option");
                        option.className = chart.classNamePrefix + "-data-set-select-option";
                        option.text = dataSet.title;
                        option.value = i;

                        if (dataSet == _this.chart.mainDataSet) {
                            option.selected = true;
                        }

                        try {
                            selectCB.add(option, null);
                        } catch (error1) {
                            selectCB.add(option);
                        }
                    }
                }
                _this.offsetHeight = selectCB.offsetHeight;
            }


            if (_this.countDataSets("showInCompare") > 0 && dataSets.length > 1) {
                if (vertical) {
                    AmCharts.addBr(div);
                    AmCharts.addBr(div);
                } else {
                    var space = document.createTextNode(" ");
                    div.appendChild(space);
                }

                var compareLabel = document.createTextNode(AmCharts.lang.compareText || _this.compareText);
                div.appendChild(compareLabel);

                var px = "px";
                var listCheckBoxSize = _this.listCheckBoxSize;

                if (vertical) {
                    AmCharts.addBr(div);

                    var compareDiv = document.createElement("div");
                    div.appendChild(compareDiv);
                    compareDiv.className = "amChartsCompareList " + chart.classNamePrefix + "-compare-div";

                    if (theme) {
                        AmCharts.applyStyles(compareDiv.style, theme.DataSetCompareList);
                    }
                    compareDiv.style.overflow = "auto";
                    compareDiv.style.overflowX = "hidden";
                    compareDiv.style.width = (_this.width - 2) + px;
                    compareDiv.style.maxHeight = _this.listHeight + px;

                    for (i = 0; i < dataSets.length; i++) {
                        dataSet = dataSets[i];
                        if (dataSet.showInCompare === true && dataSet != _this.chart.mainDataSet) {
                            var itemDiv = document.createElement("div");
                            itemDiv.style.padding = "4px";
                            itemDiv.style.position = "relative";
                            itemDiv.name = "amCBContainer";
                            itemDiv.className = chart.classNamePrefix + "-compare-item-div";
                            itemDiv.dataSet = dataSet;
                            itemDiv.style.height = (listCheckBoxSize) + "px";

                            if (dataSet.compared) {
                                itemDiv.style.backgroundColor = _this.selectedBackgroundColor;
                            }

                            compareDiv.appendChild(itemDiv);

                            var cb = document.createElement("div");
                            cb.style.width = listCheckBoxSize + px;
                            cb.style.height = listCheckBoxSize + px;
                            cb.style.position = "absolute";
                            cb.style.backgroundColor = dataSet.color;
                            itemDiv.appendChild(cb);

                            var txtDiv = document.createElement("div");
                            txtDiv.style.width = "100%";
                            txtDiv.style.position = "absolute";
                            txtDiv.style.left = (listCheckBoxSize + 10) + px;
                            itemDiv.appendChild(txtDiv);

                            var label = document.createTextNode(dataSet.title);
                            txtDiv.style.whiteSpace = "nowrap";
                            txtDiv.style.cursor = "default";
                            txtDiv.appendChild(label);

                            _this.addEventListeners(itemDiv);
                        }
                    }

                    AmCharts.addBr(div);
                    AmCharts.addBr(div);
                } else {
                    var compareCB = document.createElement("select");
                    _this.compareCB = compareCB;
                    if (widthPx) {
                        compareCB.style.width = widthPx;
                    }
                    div.appendChild(compareCB);

                    if (AmCharts.isNN) {
                        compareCB.addEventListener("change", function(event) {
                            _this.handleCBSelect.call(_this, event);
                        }, true);
                    }

                    if (AmCharts.isIE) {
                        compareCB.attachEvent("onchange", function(event) {
                            _this.handleCBSelect.call(_this, event);
                        });
                    }

                    option = document.createElement("option");
                    option.text = AmCharts.lang.comboBoxSelectText || _this.comboBoxSelectText;

                    try {
                        compareCB.add(option, null);
                    } catch (error2) {
                        compareCB.add(option);
                    }

                    for (i = 0; i < dataSets.length; i++) {
                        dataSet = dataSets[i];
                        if (dataSet.showInCompare === true && dataSet != _this.chart.mainDataSet) {
                            option = document.createElement("option");
                            option.text = dataSet.title;
                            option.value = i;

                            if (dataSet.compared) {
                                option.selected = true;
                            }

                            try {
                                compareCB.add(option, null);
                            } catch (error3) {
                                compareCB.add(option);
                            }
                        }
                    }

                    _this.offsetHeight = compareCB.offsetHeight;
                }
            }
        },

        addEventListeners: function(itemDiv) {
            var _this = this;
            if (AmCharts.isNN) {
                itemDiv.addEventListener("mouseover", function(event) {
                    _this.handleRollOver.call(_this, event);
                }, true);

                itemDiv.addEventListener("mouseout", function(event) {
                    _this.handleRollOut.call(_this, event);
                }, true);
                itemDiv.addEventListener("click", function(event) {
                    _this.handleClick.call(_this, event);
                }, true);
            }

            if (AmCharts.isIE) {
                itemDiv.attachEvent("onmouseout", function(event) {
                    _this.handleRollOut.call(_this, event);
                });
                itemDiv.attachEvent("onmouseover", function(event) {
                    _this.handleRollOver.call(_this, event);
                });
                itemDiv.attachEvent("onclick", function(event) {
                    _this.handleClick.call(_this, event);
                });
            }
        },


        handleDataSetChange: function() {
            var _this = this;
            var selectCB = _this.selectCB;
            var index = selectCB.selectedIndex;
            var dataSet = _this.dataProvider[selectCB.options[index].value];
            var chart = _this.chart;

            chart.mainDataSet = dataSet;
            if (chart.zoomOutOnDataSetChange) {
                chart.startDate = undefined;
                chart.endDate = undefined;
            }
            chart.validateData(true);

            var event = {
                type: "dataSetSelected",
                dataSet: dataSet,
                chart: _this.chart
            };
            _this.fire(event);
        },

        handleRollOver: function(event) {
            var div = this.getRealDiv(event);
            if (!div.dataSet.compared) {
                div.style.backgroundColor = this.rollOverBackgroundColor;
            }
        },

        handleRollOut: function(event) {
            var div = this.getRealDiv(event);
            if (!div.dataSet.compared) {
                if (div.style.removeProperty) {
                    div.style.removeProperty("background-color");
                }
                if (div.style.removeAttribute) {
                    div.style.removeAttribute("backgroundColor");
                }
            }
        },

        handleCBSelect: function(event) {
            var _this = this;
            var compareCB = _this.compareCB;

            var dataSets = _this.dataProvider;

            var i;
            var dataSet;
            for (i = 0; i < dataSets.length; i++) {
                dataSet = dataSets[i];
                if (dataSet.compared) {
                    event = {
                        type: "dataSetUncompared",
                        dataSet: dataSet
                    };
                }
                dataSet.compared = false;
            }

            var index = compareCB.selectedIndex;

            if (index > 0) {
                dataSet = _this.dataProvider[compareCB.options[index].value];
                if (!dataSet.compared) {
                    event = {
                        type: "dataSetCompared",
                        dataSet: dataSet
                    };
                }
                dataSet.compared = true;
            }

            var chart = _this.chart;
            chart.validateData(true);

            event.chart = chart;
            _this.fire(event);
        },

        handleClick: function(event) {
            var _this = this;
            var div = _this.getRealDiv(event);
            var dataSet = div.dataSet;

            if (dataSet.compared === true) {
                dataSet.compared = false;
                event = {
                    type: "dataSetUncompared",
                    dataSet: dataSet
                };
            } else {
                dataSet.compared = true;
                event = {
                    type: "dataSetCompared",
                    dataSet: dataSet
                };
            }

            var chart = _this.chart;
            chart.validateData(true);

            event.chart = chart;
            _this.fire(event);
        },

        getRealDiv: function(event) {
            if (!event) {
                event = window.event;
            }

            var div = (event.currentTarget) ? event.currentTarget : event.srcElement;

            if (div.parentNode.name == "amCBContainer") {
                div = div.parentNode;
            }
            return div;
        },

        countDataSets: function(prop) {
            var dataSets = this.dataProvider;
            var count = 0;
            var i;
            for (i = 0; i < dataSets.length; i++) {
                if (dataSets[i][prop] === true) {
                    count++;
                }
            }
            return count;
        }
    });
})();
(function() {
    "use strict";
    var AmCharts = window.AmCharts;
    AmCharts.formatMilliseconds = function(string, date) {
        if (string.indexOf("fff") != -1) {
            var milliseconds = date.getMilliseconds();
            var mString = String(milliseconds);
            if (milliseconds < 10) {
                mString = "00" + milliseconds;
            }
            if (milliseconds >= 10 && milliseconds < 100) {
                mString = "0" + milliseconds;
            }

            string = string.replace(/fff/g, mString);
        }

        return string;
    };

    AmCharts.extractPeriod = function(period) {
        var cleanPeriod = AmCharts.stripNumbers(period);
        var count = 1;
        if (cleanPeriod != period) {
            count = Number(period.slice(0, period.indexOf(cleanPeriod)));
        }
        return {
            period: cleanPeriod,
            count: count
        };
    };


    AmCharts.getDate = function(value, dateFormat, minPeriod) {
        var date;
        if (value instanceof Date) {
            date = AmCharts.newDate(value, minPeriod);
        } else if (dateFormat && isNaN(value)) {
            date = AmCharts.stringToDate(value, dateFormat);
        } else {
            date = new Date(value);
        }
        return date;
    };


    AmCharts.daysInMonth = function(date) {
        return new Date(date.getYear(), date.getMonth() + 1, 0).getDate();
    };


    AmCharts.newDate = function(rawDate, period) {
        var date;
        if (!period || period.indexOf("fff") != -1) {
            //            if (AmCharts.useUTC) {
            //                date = new Date(rawDate.getUTCFullYear(), rawDate.getUTCMonth(), rawDate.getUTCDate(), rawDate.getUTCHours(), rawDate.getUTCMinutes(), rawDate.getUTCSeconds(), rawDate.getUTCMilliseconds());
            //            } else {
            date = new Date(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate(), rawDate.getHours(), rawDate.getMinutes(), rawDate.getSeconds(), rawDate.getMilliseconds());
            //            }
        } else {
            date = new Date(rawDate);
        }
        return date;
    };



    // RESET DATE'S LOWER PERIODS TO MIN
    AmCharts.resetDateToMin = function(date, period, count, firstDateOfWeek) {
        if (firstDateOfWeek === undefined) {
            firstDateOfWeek = 1;
        }

        var year;
        var month;
        var day;
        var hours;
        var minutes;
        var seconds;
        var milliseconds;
        var week_day;

        if (AmCharts.useUTC) {
            year = date.getUTCFullYear();
            month = date.getUTCMonth();
            day = date.getUTCDate();
            hours = date.getUTCHours();
            minutes = date.getUTCMinutes();
            seconds = date.getUTCSeconds();
            milliseconds = date.getUTCMilliseconds();
            week_day = date.getUTCDay();
        } else {
            year = date.getFullYear();
            month = date.getMonth();
            day = date.getDate();
            hours = date.getHours();
            minutes = date.getMinutes();
            seconds = date.getSeconds();
            milliseconds = date.getMilliseconds();
            week_day = date.getDay();
        }

        switch (period) {
            case "YYYY":
                year = Math.floor(year / count) * count;
                month = 0;
                day = 1;
                hours = 0;
                minutes = 0;
                seconds = 0;
                milliseconds = 0;
                break;

            case "MM":
                month = Math.floor(month / count) * count;
                day = 1;
                hours = 0;
                minutes = 0;
                seconds = 0;
                milliseconds = 0;
                break;

            case "WW":
                if (week_day >= firstDateOfWeek) {
                    day = day - week_day + firstDateOfWeek;
                } else {
                    day = day - (7 + week_day) + firstDateOfWeek;
                }

                hours = 0;
                minutes = 0;
                seconds = 0;
                milliseconds = 0;
                break;

            case "DD":
                //day = Math.floor(day / count) * count;
                day = day;
                hours = 0;
                minutes = 0;
                seconds = 0;
                milliseconds = 0;
                break;

            case "hh":
                hours = Math.floor(hours / count) * count;
                minutes = 0;
                seconds = 0;
                milliseconds = 0;
                break;

            case "mm":
                minutes = Math.floor(minutes / count) * count;
                seconds = 0;
                milliseconds = 0;
                break;

            case "ss":
                seconds = Math.floor(seconds / count) * count;
                milliseconds = 0;
                break;

            case "fff":
                milliseconds = Math.floor(milliseconds / count) * count;
                break;
        }

        if (AmCharts.useUTC) {
            date = new Date();
            date.setUTCFullYear(year, month, day);
            date.setUTCHours(hours, minutes, seconds, milliseconds);

        } else {
            date = new Date(year, month, day, hours, minutes, seconds, milliseconds);
        }

        return date;
    };

    AmCharts.getPeriodDuration = function(period, count) {
        if (count === undefined) {
            count = 1;
        }
        var duration;
        switch (period) {
            case "YYYY":
                duration = 31622400000;
                break;
            case "MM":
                duration = 2678400000;
                break;
            case "WW":
                duration = 604800000;
                break;
            case "DD":
                duration = 86400000;
                break;
            case "hh":
                duration = 3600000;
                break;
            case "mm":
                duration = 60000;
                break;
            case "ss":
                duration = 1000;
                break;
            case "fff":
                duration = 1;
                break;
        }
        return duration * count;
    };


    AmCharts.intervals = {
        s: {
            nextInterval: "ss",
            contains: 1000
        },
        ss: {
            nextInterval: "mm",
            contains: 60,
            count: 0
        },
        mm: {
            nextInterval: "hh",
            contains: 60,
            count: 1
        },
        hh: {
            nextInterval: "DD",
            contains: 24,
            count: 2
        },
        DD: {
            nextInterval: "",
            contains: Infinity,
            count: 3
        }
    };

    AmCharts.getMaxInterval = function(duration, interval) {
        var intervals = AmCharts.intervals;
        if (duration >= intervals[interval].contains) {
            duration = Math.round(duration / intervals[interval].contains);
            interval = intervals[interval].nextInterval;

            return AmCharts.getMaxInterval(duration, interval);
        } else {
            if (interval == "ss") {
                return intervals[interval].nextInterval;
            } else {
                return interval;
            }
        }
    };


    AmCharts.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    AmCharts.shortDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    AmCharts.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    AmCharts.shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


    AmCharts.getWeekNumber = function(d) {
        d = new Date(d);
        d.setHours(0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        var yearStart = new Date(d.getFullYear(), 0, 1);
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    };


    AmCharts.stringToDate = function(str, format) {
        var values = {};

        var patterns = [{
                pattern: "YYYY",
                period: "year"
            }, {
                pattern: "YY",
                period: "year"
            }, {
                pattern: "MM",
                period: "month"
            }, {
                pattern: "M",
                period: "month"
            },

            {
                pattern: "DD",
                period: "date"
            }, {
                pattern: "D",
                period: "date"
            },

            {
                pattern: "JJ",
                period: "hours"
            }, {
                pattern: "J",
                period: "hours"
            }, {
                pattern: "HH",
                period: "hours"
            }, {
                pattern: "H",
                period: "hours"
            }, {
                pattern: "KK",
                period: "hours"
            }, {
                pattern: "K",
                period: "hours"
            }, {
                pattern: "LL",
                period: "hours"
            }, {
                pattern: "L",
                period: "hours"
            },

            {
                pattern: "NN",
                period: "minutes"
            }, {
                pattern: "N",
                period: "minutes"
            },

            {
                pattern: "SS",
                period: "seconds"
            }, {
                pattern: "S",
                period: "seconds"
            },

            {
                pattern: "QQQ",
                period: "milliseconds"
            }, {
                pattern: "QQ",
                period: "milliseconds"
            }, {
                pattern: "Q",
                period: "milliseconds"
            }
        ];

        var am = true;
        var amIndex = format.indexOf("AA");
        if (amIndex != -1) {
            str.substr(amIndex, 2);
            if (str.toLowerCase == "pm") {
                am = false;
            }
        }

        var realFormat = format;
        var pattern;
        var period;
        var i;
        for (i = 0; i < patterns.length; i++) {
            pattern = patterns[i].pattern;
            period = patterns[i].period;

            values[period] = 0;
            if (period == "date") {
                values[period] = 1;
            }
        }
        for (i = 0; i < patterns.length; i++) {
            pattern = patterns[i].pattern;
            period = patterns[i].period;

            if (format.indexOf(pattern) != -1) {
                var value = AmCharts.getFromDateString(pattern, str, realFormat);

                format = format.replace(pattern, "");

                if (pattern == "KK" || pattern == "K" || pattern == "LL" || pattern == "L") {
                    if (!am) {
                        value += 12;
                    }
                }
                values[period] = value;
            }
        }

        var date; // = new Date(values.year, values.month, values.date, values.hours, values.minutes, values.seconds, values.milliseconds);

        if (AmCharts.useUTC) {
            date = new Date();
            date.setUTCFullYear(values.year, values.month, values.date);
            date.setUTCHours(values.hours, values.minutes, values.seconds, values.milliseconds);
        } else {
            date = new Date(values.year, values.month, values.date, values.hours, values.minutes, values.seconds, values.milliseconds);
        }

        return date;
    };

    AmCharts.getFromDateString = function(what, date, format) {
        if (date !== undefined) {
            var i = format.indexOf(what);

            date = String(date);

            var valueStr = date.substr(i, what.length);

            if (valueStr.charAt(0) == "0") {
                valueStr = valueStr.substr(1, valueStr.length - 1);
            }

            var value = Number(valueStr);

            if (isNaN(value)) {
                value = 0;
            }

            if (what.indexOf("M") != -1) {
                value--;
            }

            return value;
        }
    };



    AmCharts.formatDate = function(d, f, chart) {

        if (!chart) {
            chart = AmCharts;
        }

        var year;
        var month;
        var date;
        var day;
        var hours;
        var minutes;
        var seconds;
        var milliseconds;
        var weekNo = AmCharts.getWeekNumber(d);

        if (AmCharts.useUTC) {
            year = d.getUTCFullYear();
            month = d.getUTCMonth();
            date = d.getUTCDate();
            day = d.getUTCDay();
            hours = d.getUTCHours();
            minutes = d.getUTCMinutes();
            seconds = d.getUTCSeconds();
            milliseconds = d.getUTCMilliseconds();
        } else {
            year = d.getFullYear();
            month = d.getMonth();
            date = d.getDate();
            day = d.getDay();
            hours = d.getHours();
            minutes = d.getMinutes();
            seconds = d.getSeconds();
            milliseconds = d.getMilliseconds();
        }


        var shortYear = String(year).substr(2, 2);



        var dayStr = "0" + day;

        // WEAK NUMBER
        f = f.replace(/W/g, weekNo);

        // HOURS
        var jhours = hours;
        if (jhours == 24) {
            jhours = 0;
        }
        var jjhours = jhours;
        if (jjhours < 10) {
            jjhours = "0" + jjhours;
        }

        f = f.replace(/JJ/g, jjhours);
        f = f.replace(/J/g, jhours);

        var hhours = hours;
        if (hhours === 0) {
            hhours = 24;
            if (f.indexOf("H") != -1) {
                date--;
                if (date === 0) {
                    var tempDate = new Date(d);
                    tempDate.setDate(tempDate.getDate() - 1);
                    month = tempDate.getMonth();
                    date = tempDate.getDate();
                    year = tempDate.getFullYear();
                }
            }
        }

        var monthStr = month + 1;

        if (month < 9) {
            monthStr = "0" + monthStr;
        }


        var dateStr = date;
        if (date < 10) {
            dateStr = "0" + date;
        }

        var hhhours = hhours;
        if (hhhours < 10) {
            hhhours = "0" + hhhours;
        }
        f = f.replace(/HH/g, hhhours);
        f = f.replace(/H/g, hhours);

        var khours = hours;
        if (khours > 11) {
            khours -= 12;
        }
        var kkhours = khours;
        if (kkhours < 10) {
            kkhours = "0" + kkhours;
        }
        f = f.replace(/KK/g, kkhours);
        f = f.replace(/K/g, khours);


        var lhours = hours;
        if (lhours === 0) {
            lhours = 12;
        }

        if (lhours > 12) {
            lhours -= 12;
        }
        var llhours = lhours;
        if (llhours < 10) {
            llhours = "0" + llhours;
        }
        f = f.replace(/LL/g, llhours);
        f = f.replace(/L/g, lhours);

        // MINUTES
        var nnminutes = minutes;
        if (nnminutes < 10) {
            nnminutes = "0" + nnminutes;
        }
        f = f.replace(/NN/g, nnminutes);
        f = f.replace(/N/g, minutes);

        var ssseconds = seconds;
        if (ssseconds < 10) {
            ssseconds = "0" + ssseconds;
        }
        f = f.replace(/SS/g, ssseconds);
        f = f.replace(/S/g, seconds);


        var qqqms = milliseconds;
        if (qqqms < 10) {
            qqqms = "00" + qqqms;
        }
        if (qqqms < 100) {
            qqqms = "0" + qqqms;
        }

        var qqms = milliseconds;
        if (qqms < 10) {
            qqms = "00" + qqms;
        }

        f = f.replace(/QQQ/g, qqqms);
        f = f.replace(/QQ/g, qqms);
        f = f.replace(/Q/g, milliseconds);

        if (hours < 12) {
            f = f.replace(/A/g, chart.amString);
        } else {
            f = f.replace(/A/g, chart.pmString);
        }


        f = f.replace(/YYYY/g, "@IIII@");
        f = f.replace(/YY/g, "@II@");

        f = f.replace(/MMMM/g, "@XXXX@");
        f = f.replace(/MMM/g, "@XXX@");
        f = f.replace(/MM/g, "@XX@");
        f = f.replace(/M/g, "@X@");

        f = f.replace(/DD/g, "@RR@");
        f = f.replace(/D/g, "@R@");

        f = f.replace(/EEEE/g, "@PPPP@");
        f = f.replace(/EEE/g, "@PPP@");
        f = f.replace(/EE/g, "@PP@");
        f = f.replace(/E/g, "@P@");

        f = f.replace(/@IIII@/g, year);
        f = f.replace(/@II@/g, shortYear);

        f = f.replace(/@XXXX@/g, chart.monthNames[month]);
        f = f.replace(/@XXX@/g, chart.shortMonthNames[month]);
        f = f.replace(/@XX@/g, monthStr);
        f = f.replace(/@X@/g, (month + 1));

        f = f.replace(/@RR@/g, dateStr);
        f = f.replace(/@R@/g, date);

        f = f.replace(/@PPPP@/g, chart.dayNames[day]);
        f = f.replace(/@PPP@/g, chart.shortDayNames[day]);
        f = f.replace(/@PP@/g, dayStr);
        f = f.replace(/@P@/g, day);

        return f;
    };


    AmCharts.changeDate = function(date, period, count, forward, full) {

        if (AmCharts.useUTC) {
            return AmCharts.changeUTCDate(date, period, count, forward, full);
        }

        var k = -1;

        if (forward === undefined) {
            forward = true;
        }

        if (full === undefined) {
            full = false;
        }

        if (forward === true) {
            k = 1;
        }

        switch (period) {
            case "YYYY":
                date.setFullYear(date.getFullYear() + count * k);
                if (!forward && !full) {
                    date.setDate(date.getDate() + 1);
                }
                break;

            case "MM":
                var previousMonth = date.getMonth();
                date.setMonth(date.getMonth() + count * k);
                if (date.getMonth() > previousMonth + count * k) {
                    date.setDate(date.getDate() - 1);
                }
                if (!forward && !full) {
                    date.setDate(date.getDate() + 1);
                }
                break;

            case "DD":
                date.setDate(date.getDate() + count * k);
                break;

            case "WW":
                date.setDate(date.getDate() + count * k * 7);
                break;

            case "hh":
                date.setHours(date.getHours() + count * k);
                break;

            case "mm":
                date.setMinutes(date.getMinutes() + count * k);
                break;

            case "ss":
                date.setSeconds(date.getSeconds() + count * k);
                break;

            case "fff":
                date.setMilliseconds(date.getMilliseconds() + count * k);
                break;
        }
        return date;
    };

    AmCharts.changeUTCDate = function(date, period, count, forward, full) {
        var k = -1;

        if (forward === undefined) {
            forward = true;
        }

        if (full === undefined) {
            full = false;
        }

        if (forward === true) {
            k = 1;
        }

        switch (period) {
            case "YYYY":
                date.setUTCFullYear(date.getUTCFullYear() + count * k);
                if (!forward && !full) {
                    date.setUTCDate(date.getUTCDate() + 1);
                }
                break;

            case "MM":
                var previousMonth = date.getUTCMonth();
                date.setUTCMonth(date.getUTCMonth() + count * k);
                if (date.getUTCMonth() > previousMonth + count * k) {
                    date.setUTCDate(date.getUTCDate() - 1);
                }
                if (!forward && !full) {
                    date.setUTCDate(date.getUTCDate() + 1);
                }
                break;

            case "DD":
                date.setUTCDate(date.getUTCDate() + count * k);
                break;

            case "WW":
                date.setUTCDate(date.getUTCDate() + count * k * 7);
                break;

            case "hh":
                date.setUTCHours(date.getUTCHours() + count * k);
                break;

            case "mm":
                date.setUTCMinutes(date.getUTCMinutes() + count * k);
                break;

            case "ss":
                date.setUTCSeconds(date.getUTCSeconds() + count * k);
                break;

            case "fff":
                date.setUTCMilliseconds(date.getUTCMilliseconds() + count * k);
                break;
        }
        return date;
    };

})();
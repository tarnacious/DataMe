
computeTimeRange = function(data) {
    var min = -1;
    var max = 0;
    for (var i = 0; i < data.length; i++) {
        var start = data[i].start;
        var end = data[i].end;
        if (min == -1) {
            min = start;
        } else if (start  < min) {
            min = start;
        } else if (end > max) {
            max = end;
        }
    }

    return {
        min: min,
        max: max
    };
};


computeCountRange = function(data) {
    var min = 0;
    var max = 0;
    for (var i = 0; i < data.length; i++) {
        var value = data[i]["tweet_count"];
        if (value < min) {
            min = value;
        } else if (value > max) {
            max = value;
        }
    }

    return {
        min: min,
        max: max
    };
};

computeX = function(item, width, timeRange) {
    var relTs = ((item.start + item.end) / 2.0) - timeRange.min;
    return relTs * (width / parseFloat(timeRange.max - timeRange.min));
};


tsToX = function(ts, width, timeRange) {
    var relTs = ts - timeRange.min;
    return relTs * (width / parseFloat(timeRange.max - timeRange.min));
};


computeCircleSize = function(count, minCount, maxCount, minSize, maxSize) {
    var requiredBuckets = maxCount - minCount;
    var availBuckets = maxSize - minSize;
    var size = parseInt(count / (requiredBuckets / parseFloat(availBuckets)), 10);
    return Math.max(minSize, size);
};


drawTimeline = function(width, data, timeRange, holder, color) {
    var height = 80;
    var r = Raphael(holder, width, height);
    var targets = r.set();
    var countRange = computeCountRange(data);
    var minCircleSize = 3;
    var maxCircleSize = 30;
    var circleMargin = 10;
    var requiredBuckets = countRange.max - countRange.min;
    var availBuckets = parseFloat(maxCircleSize - minCircleSize);

    for (var i = 0; i < data.length; i++) {
        var xPos = computeX(data[i], width, timeRange);
        var size = Math.max(minCircleSize, data[i].tweet_count / (requiredBuckets / availBuckets));
        var circle = r.circle(xPos, height / 2, size).attr({
            "fill": color,
            "fill-opacity": 0.7,
            "stroke": color,
            "stroke-width": 2
        });
        var count = r.text(xPos, height / 2, data[i].tweet_count).attr({"font": '10px Helvetica, Arial', stroke: "none", fill: "#fff"});
        targets.push(circle);
    }

    return r;
};

$(function () {
    var width = 950;
    var data = window.timelineSummary;
    var timeRange = computeTimeRange(data);

    r = drawTimeline(width, data, timeRange, "tw-holder", "#4099FF");

    var line;
    $("#slider").slider({
        slide: function (e, ui) {
            if (line) {
                line.remove();
            }

            var x = tsToX(ui.value, width, timeRange);
            line = r.path( "M" + x + ",0 L" + x + "," + x);
            line.attr ("opacity", 0.5);
        },
        change: function (e, ui) {
            if (line) {
                line.remove();
            }

            window.go_to_time(ui.value, window.timeline);
        },
        min: timeRange.min,
        max: timeRange.max,
        value: timeRange.min,
        step: 1
    });
});

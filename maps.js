var map;
var twitter_image = {
    url: '../images/twitter.png',
    // This marker is 20 pixels wide by 32 pixels tall.
    size: new google.maps.Size(50, 50),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    anchor: new google.maps.Point(0, 32)
};

var wikipedia_image = {
    url: 'images/wikipedia.png',
    // This marker is 20 pixels wide by 32 pixels tall.
    size: new google.maps.Size(50, 50),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    anchor: new google.maps.Point(0, 32)
};

var cosmin_image = {
    url: '../images/cosmin.png',
    // This marker is 20 pixels wide by 32 pixels tall.
    size: new google.maps.Size(50, 50),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    anchor: new google.maps.Point(0, 32)
};

function add_tweets(data) {
    data.forEach(function(point) {

        var latlng = new google.maps.LatLng(point.geoLocation.lat,
            point.geoLocation.lon);

        if (point.source == 'twitter') {
            var marker = new google.maps.Marker({
                icon: twitter_image,
                position: latlng,
                title:"Hello World!"
            });
            marker.setMap(map);
            var infowindow = new google.maps.InfoWindow({
                content: point.data.text
            });
            google.maps.event.addListener(marker, 'click', function() {
              infowindow.open(map,marker);
            });
        };
        if (point.source == 'wikipedia') {
            var marker = new google.maps.Marker({
                icon: wikipedia_image,
                position: latlng,
                title:"Hello World!"
            });
            marker.setMap(map);
            var infowindow = new google.maps.InfoWindow({
                content: '<img src="' + point.data.imageUrl + '" />'
            });
            google.maps.event.addListener(marker, 'click', function() {
              infowindow.open(map,marker);
            });
        };
    });
};

function add_lines(data) {
    var lineCoordinates = data.map(function(point) { 
        return new google.maps.LatLng(point.geoLocation.lat, point.geoLocation.lon);
    });

    var lineSymbol = {
        path: 'M 0,-1 0,1',
        strokeOpacity: 1,
        scale: 2
    };

    var line = new google.maps.Polyline({
        path: lineCoordinates,
        strokeOpacity: 0,
        icons: [{
            icon: lineSymbol,
        offset: '0',
        repeat: '20px'
        }],
        map: map
    });
};

function initialize() {
    var mapOptions = {
        zoom: 3,
        center: new google.maps.LatLng(48, 10),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map_canvas'),
            mapOptions);

    $.get('../timeline.json', function(data) {

        start = new google.maps.LatLng(data[0].geoLocation.lat, data[0].geoLocation.lon);
        var marker = new google.maps.Marker({
            icon: cosmin_image,
            position: start
        });
        marker.setMap(map);

        var lineCoordinates = data.map(function(point) { 
            return new google.maps.LatLng(point.geoLocation.lat, point.geoLocation.lon);
        });

        /*
        var bounds = new google.maps.LatLngBounds();
        lineCoordinates.forEach(function(point) {
            bounds.extend(point);
        });
        map.fitBounds(bounds);
        */

        $("#tweets").click(function() {
            add_tweets(data);
        });

        $("#track").click(function() {
            add_lines(data);
        });

        $("#action").click(function() {
            start = parseInt(data[0].timestamp, 10);
            (function animloop(time){
              window.requestAnimationFrame(animloop);
              start = start + 100;
              index = find_index(start, data);

              time_traveled = parseInt(data[index-1].timestamp, 10) - start;
              time_delta = parseInt(data[index-1].timestamp, 10) - parseInt(data[index].timestamp, 10);
              lat_delta = data[index-1].geoLocation.lat - data[index].geoLocation.lat;
              lon_delta = data[index-1].geoLocation.lon - data[index].geoLocation.lon;

              percent_traveled = (time_traveled / time_delta) 

              lat = data[index-1].geoLocation.lat + (lat_delta * percent_traveled) 
              lon = data[index-1].geoLocation.lon + (lon_delta * percent_traveled) 


              point = new google.maps.LatLng(lat, lon);
              $("#debug").html(index + ": " + start + "(" + percent_traveled + ")  " + point );
              marker.setPosition(point);
              map.setCenter(point);
            })();
        });

        $("#action2").click(function() {
            function animate_all(coordinates, complete) {
                if (coordinates.length == 1) {
                    complete();
                    return;
                };
                console.log(coordinates[0].lat() - coordinates[1].lat(), coordinates[0].lng() - coordinates[1].lng()); 
                if ((Math.abs(coordinates[0].lat() == coordinates[1].lat()) > 0.01)  && 
                    (Math.abs(coordinates[0].lng() == coordinates[1].lng()) > 0.01)) {
                    console.log("GOOD");
                    //var bounds = new google.maps.LatLngBounds(coordinates[0], coordinates[1]);
                    //map.fitBounds(bounds);
                    map.setCenter(coordinates[0]);
                    map.setZoom(12);
                } else {
                    map.setCenter(coordinates[0]);
                    map.setZoom(12);
                    console.log("SKIPPING");
                }

                animate(coordinates[0], coordinates[1], marker, function() {
                    animate_all(coordinates.slice(1), complete);
                });
            };
            animate_all(lineCoordinates, function() {
                alert("ALL DONE");
            })
        });
    });
}

function find_index(time, data) {
    var i;
    for(i = 0; i < data.length; i++) {
        if (parseInt(data[i].timestamp, 10) > time) {
            return i;
        }
    }
    return data.length-1;
}

function go_to_time(time, data) {
    index = find_index(time, data)
    return data[index];
}

animate = function(start, finish, marker, complete) {
    var steps = 80;
    var step_lat = (start.lat() - finish.lat()) / steps;
    var step_lng = (start.lng() - finish.lng()) / steps;
    var current = start;


    (function animloop(time){
      if (steps > 0) {  
          window.requestAnimationFrame(animloop);
      } else {
          complete();
          return;
      };
      steps -= 1;
      var lat = current.lat() - step_lat;
      var lng = current.lng() - step_lng;
      current = new google.maps.LatLng(lat, lng);
      marker.setPosition(current);
    })();
}

$(function() {
    google.maps.event.addDomListener(window, 'load', initialize);
})

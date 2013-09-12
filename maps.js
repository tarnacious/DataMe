var map;
function initialize() {
    var mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(-34.397, 150.644),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);

    $.get('timeline.json', function(data) {

        data.forEach(function(point) {
            $("#data").append($("<div />").html(point.source).click(function(){
                console.log("clicked", point);
            }));
        });

        var marker = new google.maps.Marker({
            title:"Hello World!"
        });

        marker.setMap(map);
        var twitter_image = {
            url: 'images/twitter.png',
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

        var lineSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 2
        };

        var lineCoordinates = data.map(function(point) { 
            return new google.maps.LatLng(point.geoLocation.lat, point.geoLocation.lon);
        });

        var bounds = new google.maps.LatLngBounds();
        lineCoordinates.forEach(function(point) {
            //bounds.extend(point);
        });
        //map.fitBounds(bounds);
    
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

        $("#action").click(function() {
            animate(lineCoordinates[0], lineCoordinates[1], marker, function() {
                alert("DONE");
            });
        });

        $("#action2").click(function() {
            function animate_all(coordinates, complete) {
                if (coordinates.length == 1) {
                    complete();
                    return;
                };

                var bounds = new google.maps.LatLngBounds(coordinates[0], coordinates[1]);
                map.fitBounds(bounds);

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

animate = function(start, finish, marker, complete) {
    var steps = 200;
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

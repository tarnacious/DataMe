var data = [{
    "timestamp": "2013-07-09T13:00:05Z",
    "geolocation": {
        "lat":-34.397,
        "long":150.644
    },
    "source": "twitter",
    "data": {
        "text": "swfsdfsd",
        "userimage": "http://swfsdfsd.jpg"
    }		
},
{
    "timestamp": "2013-07-09T13:05:05Z",
    "geolocation": {
        "lat":40.000,
        "long":-5
    },
    "source": "flickr",
    "data": {
        "imageUrl": "http://swfsdfsd.jpg",
        "userimage": "sdsd.jpg"
    }
},
{
    "timestamp": "2013-07-09T13:10:05Z",
    "geolocation": {
        "lat":51.000,
        "long":-6
    },
    "source": "wikipedia",
    "data": {
        "imageUrl": "http://swfsdfsd.jpg",
        "userimage": "sdsd.jpg"
    }
},
    ];

var map;
function initialize() {
    var mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(-34.397, 150.644),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
    console.log("Create map");

    data.forEach(function(point) {
        $("#data").append($("<div />").html(point.source));
    });

    var image = {
        url: 'images/twitter.png',
        // This marker is 20 pixels wide by 32 pixels tall.
        size: new google.maps.Size(50, 50),
        // The origin for this image is 0,0.
        origin: new google.maps.Point(0,0),
        // The anchor for this image is the base of the flagpole at 0,32.
        anchor: new google.maps.Point(0, 32)
    };

    data.forEach(function(point) {
        var latlng = new google.maps.LatLng(point.geolocation.lat,
            point.geolocation.long);
        var marker = new google.maps.Marker({
            icon: image,
            position: latlng,
            title:"Hello World!"
        });
        marker.setMap(map);
        console.log('adding marker' + latlng)
    });

    var lineSymbol = {
        path: 'M 0,-1 0,1',
        strokeOpacity: 1,
        scale: 2
    };

    var lineCoordinates = data.map(function(point) { 
        return new google.maps.LatLng(point.geolocation.lat, point.geolocation.long);
    });

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
}


$(function() {
    google.maps.event.addDomListener(window, 'load', initialize);
})

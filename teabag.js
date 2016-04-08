/**
 * Created by ranveer on 05/04/16.
 */

pricing_levels = ["Inexpensive", "Moderate", "Expensive"];

var now = new Date();
var hour = now.getHours();
var minutes = now.getMinutes();

var begin_flag = 0;

// Create the Google Map…
var map = new google.maps.Map(d3.select("#map").node(), {
    zoom: 18,
    center: new google.maps.LatLng(19.134249, 72.913608),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
        {
            stylers: [{
                saturation: -60
            }]
        },
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }
    ]
});

initialLocation = "mumbai";

// Try W3C Geolocation (Preferred)
if(navigator.geolocation) {
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(function(position) {
        initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        map.setCenter(initialLocation);
        var marker = new google.maps.Marker({
            // The below line is equivalent to writing:
            // position: new google.maps.LatLng(-34.397, 150.644)
            position: initialLocation,
            map: map
        });
        //console.log();
    }, function() {
        handleNoGeolocation(browserSupportFlag);
    });
}
// Browser doesn't support Geolocation
else {
    browserSupportFlag = false;
    handleNoGeolocation(browserSupportFlag);
}

function handleNoGeolocation(errorFlag) {
    if (errorFlag == true) {
        alert("Geolocation service failed.");
        initialLocation = newyork;
    } else {
        alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
        initialLocation = siberia;
    }
    map.setCenter(initialLocation);
}

function centre_map(){
    map.setCenter(initialLocation);
}

function assign_dots() {
    $("#hour").text(hour);
    if (hour > 12) {
        $("#hours").text(hour-12 + ":" + minutes + " PM");
    } else if (hour == 12) {
        $("#hours").text(hour + ":" + minutes + " PM");
    } else {
        $("#hours").text(hour + ":" + minutes + " AM");
    }

    $("#progress-bar-percentage").css("width", ((hour/24)*100).toString()+"%");

    if (hour < 5 || hour > 20) {
        $("#progress-bar-percentage").css("background", "#000000");
    } else if (hour < 11) {
        $("#progress-bar-percentage").css("background", "#87CEEB");
    } else if (hour < 16) {
        $("#progress-bar-percentage").css("background", "#ffd700");
    } else {
        $("#progress-bar-percentage").css("background", "#ff8c00");
    }

    console.log(hour);
    // Load the station data. When the data comes back, create an overlay.
    d3.json("stations.json", function (error, data) {

        var overlay = new google.maps.OverlayView();

        if (error) throw error;


        // Add the container when the overlay is added to the map.
        overlay.onAdd = function () {
            var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
                .attr("class", "stations");

            // Draw each marker as a separate SVG element.
            // We could use a single SVG, but what size would it have?
            overlay.draw = function () {
                var projection = this.getProjection(),
                    padding = 30;

                layer.selectAll("svg").remove();

                var marker = layer.selectAll("svg")
                    .data(d3.entries(data))
                    .each(transform) // update existing markers
                    .enter().append("svg")
                    .each(transform)
                    .attr("class", "marker");

                // Add a circle.
                marker.append("circle")
                    .attr("r", function(d){
                        return d.value[3][hour]*12;
                    })
                    .attr("cx", padding)
                    .attr("cy", padding)
                    .style("fill", function(d) {
                        return "rgba(0, 0, 0, " + (0.1 + (d.value[6]-1)*0.45).toString() + ")"
                    })
                    .on("click",toggleExpand);

                // Add a label.
                marker.append("text")
                    .attr("x", padding + 15)
                    .attr("y", padding)
                    .attr("dy", ".31em")
                    .text(function (d) {
                        if (d.value[3][hour])
                            return d.key;
                    })
                    .on("click",toggleExpand);

                function transform(d) {
                    d = new google.maps.LatLng(d.value[1], d.value[0]);
                    d = projection.fromLatLngToDivPixel(d);
                    return d3.select(this)
                        .style("left", (d.x - padding) + "px")
                        .style("top", (d.y - padding) + "px");
                }

                function toggleExpand(d) {
                    $("#information-title").text(d.value[2]);
                    $("#information-para").text(d.value[4]);
                    $("#information-must-try").html('<strong>Must Try: </strong>' + d.value[5]);
                    $("#information-pricing").html('<strong>Pricing: </strong>' + pricing_levels[d.value[6]-1] + ' ' +
                        '<svg height="40" width="40"><circle cx="18" cy="19" r="12" stroke="black" stroke-width="2" fill="rgba(0,0,0,' + (0.1 + (d.value[6]-1)*0.45).toString() + ')" /></svg>');
                    if (d.value[7][0] == 1) {
                        $("#information-image").html('<img src="' + d.value[7][1] + '" class="respim">')
                    } else {
                        $("#information-image").html('')
                    }
                    if (d.value[8][0] == 1) {
                        $("#information-website").html('<br><a href="' + d.value[8][1] + '">Visit Website for Menu</a>')
                    } else {
                        $("#information-website").html('')
                    }
                    if (!begin_flag) {
                        $("#information").toggle();
                        begin_flag = 1;
                    }
                }

            };
        };

        overlay.onRemove = function() {};

        // Bind our overlay to the map
        overlay.setMap(map);
    });
}
window.onload = assign_dots();

function progress_time() {
    hour = hour + 1;
    if (hour == 24) hour = 0;
    minutes = "00";
    d3.selectAll("svg").remove();
    assign_dots();
}

function regress_time() {
    hour = hour - 1;
    if (hour == -1) hour = 23;
    minutes = "00";
    d3.selectAll("svg").remove();
    assign_dots();
}
/**
 * Created by larryg on 4/27/17.
 */
"use strict";
$(document).ready(function () {

    // retrieving initial default values of san antonio
    var lat = $("#lat").val();
    var lng = $("#lng").val();
    var map;
    var marker;
    var address;
    var idVar;
    var infoContent = "Drag me to change locations";
    var infowindow = new google.maps.InfoWindow({
        content: infoContent
    });
    var day;
    var today;
    var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    function loadWeather() {
        $.get("http://api.openweathermap.org/data/2.5/forecast/daily", {
            APPID: "a824ef2e2591bd239228beab33789010",
            lat: lat,
            lon: lng,
            units: "imperial",
            cnt: "10"
        }).done(function (data) {
            data.list.forEach(function (el, i) {
                today = new Date().getDay();
                if(i === 0){
                    day = "Today";
                }else if (today + i < 7) {
                    day = daysOfWeek[today + i];
                } else {
                        day = daysOfWeek[today + i - 7];
                }
                var appendStr = '';
                var appendStrLeft = " ";
                var appendStrRight = ' ';
                var appendStrCenter = ' ';
                idVar = "#day" + i;   // to cycle between  weather divs
                var maxTemp = Math.round(data.list[i].temp.max);
                var minTemp = Math.round(data.list[i].temp.min);
                var iconUrl = "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png";
                appendStr +=("<h2>" + day + "</h2>");
                appendStr += ("<h3>" + maxTemp + "&deg/" + minTemp + "&deg</h3>");
                appendStr += ("<img src='" + iconUrl + "' alt='Icon'>");
                appendStr += ("<p><strong>" + data.list[i].weather[0].main + ":</strong> " + data.list[i].weather[0].description + "</p>");
                appendStr += ("<p><strong>Humidity: </strong>" + data.list[i].humidity + "</p>");
                appendStr += ("<p><strong>Wind: </strong>" + data.list[i].speed + "</p>");
                appendStr += ("<p><strong>Pressure: </strong>" + data.list[i].pressure + "</p>");

                $(idVar).html(appendStr);  //inserting new weather

                // reformated weather string for today box
                appendStrLeft += ("<h3>High: " + Math.round(data.list[0].temp.max) + "&deg</h3>");
                appendStrLeft += ("<h3>Low: " + Math.round(data.list[0].temp.min) + "&deg</h3>");
                appendStrRight += ("<h3><strong>" + data.list[0].weather[0].main + ":</strong> " + data.list[0].weather[0].description + "</h3>");
                appendStrRight += ("<img src='http://openweathermap.org/img/w/" + data.list[0].weather[0].icon + ".png' alt='Icon'>");
                appendStrCenter += ("<p><strong>Humidity: </strong>" + data.list[0].humidity + "</p>");
                appendStrCenter += ("<p><strong>Wind: </strong>" + data.list[0].speed + "</p>");
                appendStrCenter += ("<p><strong>Pressure: </strong>" + data.list[0].pressure + "</p>");

                $("#todayLeft").html(appendStrLeft);  //inserting new weather
                $('#todayCenter').html(appendStrCenter);
                $("#todayRight").html(appendStrRight);


                infoContent = "<h3>" + data.city.name + "</h3><img src='" + iconUrl + "' alt='Icon'>" + "<h3>" + Math.round(data.list[0].temp.max) + "/&deg" + Math.round(data.list[0].temp.min) + "&deg";
                infowindow.setContent(infoContent);
            });
            $("#currentCity").html(data.city.name);  //update current city


        });
    }


    //day selector buttons
    $("#today").click(function () {
        $(".weatherBoxDivs").removeClass("active three fiveTens");
        $(".todayBox").addClass("active");
    });

    $("#threeDay").click(function () {
        $(".weatherBoxDivs").removeClass("active three fiveTens");
        $(".threeDayBox").addClass("active three");
    });

    $("#fiveDay").click(function () {
        $(".weatherBoxDivs").removeClass("active three fiveTens");
        $(".fiveDayBox").addClass("active fiveTens");
    });

    $("#tenDay").click(function () {
        $(".weatherBoxDivs").removeClass("active three fiveTens");
        $(".tenDayBox").addClass("active fiveTens");
    });
    // update map button
    $("#locSubmit").click(function () {
        lat = $("#lat").val();   //updating position to value in input
        lng = $("#lng").val();
        console.log(lat);
        console.log(lng);
        loadWeather();// update map and weather
        initializeMap();
    });


    function focusMap() {
        map.setCenter(marker.position);//resets center of map.. NOO reload!
        // map.setZoom(9);      // zoom in on city
        infowindow.open(map, marker);
    }

    function focusMarker() {   //sets marker if location moved by other means
        marker.setPosition({
            lat: lat,
            lng: lng
        })
    }

    function updateInputs() {
        $("#lat").val(lat.toFixed(6));    // update input values to current location
        $("#lng").val(lng.toFixed(6));
    }

    // map and marker function
    function initializeMap() {
        var mapOptions = {
            center: {
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            },
            zoom: 5,
            disableDefaultUI: true,
            zoomControl: true
        };
        //create map
        map = new google.maps.Map(document.getElementById("map"), mapOptions);

        // create marker
        marker = new google.maps.Marker({
            position: {
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            },
            map: map,
            draggable: true
        });
        //call info window up
        infowindow.open(map, marker);
        // drag event
        google.maps.event.addListener(marker, 'dragend', function () {
            lat = marker.position.lat();    // getting current lat of marker
            lng = marker.position.lng();     // getting current lng of marker
            loadWeather();                     //updating weather and map
            updateInputs();
            focusMap();
        });

        //address search button  geocode function
        $("#searchBtn").click(function () {
            address = $("#search").val();  //get address from input
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({address: address}, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    lat = results[0].geometry.location.lat();  // update global lat and lng variables to results
                    lng = results[0].geometry.location.lng();
                    loadWeather();
                    updateInputs();
                    focusMarker();     //update map and marker to new location
                    focusMap();

                } else {
                    alert("Please enter a valid location");
                }
            });
        });

    }



initializeMap();  // initial map load
loadWeather(); // initial weather load


});
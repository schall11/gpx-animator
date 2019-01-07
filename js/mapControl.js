 $(function() {
     $('#colorPick').colorpicker({
         format: "hex",
         color: "#2863d1"
     }).on('colorpickerChange colorpickerCreate', function(e) {
         $("#colorPick").css("background-color", e.color.toRgbString());
     });
 });
 $(document).ready(function() {

     $('#myModal').modal('show');

 });
 $("#opSlider").slider();
 $("#opSlider").on("slide", function(slideEvt) {
     $("#opSliderVal").text(slideEvt.value * 100 + "%");
 });
 $("#weightSlider").slider();
 $("#weightSlider").on("slide", function(slideEvt) {
     $("#weightSliderVal").text(slideEvt.value);
 });


 var startDate = new Date();
 startDate.setUTCHours(0, 0, 0, 0);

 var map = L.map('map', {
     zoom: 8,
     fullscreenControl: true,
     center: [39.3210, -111.093]
 });

 // start of TimeDimension manual instantiation
 var timeDimension = new L.TimeDimension({
     period: "PT48H",
 });
 // helper to share the timeDimension object between all layers
 map.timeDimension = timeDimension;
 // otherwise you have to set the 'timeDimension' option on all layers.
 L.easyButton('ion-settings', function(btn, map) {
     $('#myModal').modal('show');
 }).addTo(map);
 L.easyButton('ion-calendar', function(btn, map) {
     $('#dateDisp').toggle();
 }).addTo(map);
 var player = new L.TimeDimension.Player({
     transitionTime: 25,
     loop: false,
     startOver: true
 }, timeDimension);

 var timeDimensionControlOptions = {
     player: player,
     displayDate: false,
     loopButton: true,
     timeDimension: timeDimension,
     position: 'bottomleft',
     autoPlay: true,
     minSpeed: 1,
     speedStep: 1,
     maxSpeed: 60,
     timeSliderDragUpdate: true
 };
 var customControl = L.Control.extend({

     options: {
         position: 'bottomleft'
     },

     onAdd: function(map) {
         var container = L.DomUtil.create('div');
         container.id = 'dateDisp'
         container.style.backgroundColor = 'white';
         container.style.position = 'relative';
         // container.style.width = '150px'
         container.style.margin = '10 auto';
         //container.style.backgroundImage = "url(http://t1.gstatic.com/images?q=tbn:ANd9GcR6FCUMW5bPn8C4PbKak2BJQQsmC-K9-mbYBeFZm1ZM2w2GRy40Ew)";
         // container.style.backgroundSize = "30px 30px";
         // container.style.width = '30px';
         // container.style.height = '30px';
         return container;
     }
 });

 var timeDimensionControl = new L.Control.TimeDimension(timeDimensionControlOptions);
 map.addControl(timeDimensionControl);
 map.addControl(new customControl());




 // var overlayMaps = {
 //     "Deer 1": gpxTimeLayer
 // };
 var baseLayers = getCommonBaseLayers(map); // see baselayers.js
 L.control.layers(baseLayers).addTo(map);

 var fileInput = document.getElementById("fileInput");

 // fileInput.addEventListener('change', function(event) {
 $("#acceptBtn").click(function() {
     var period = $("#timeStep").val();
     var tailPeriod = $("#tail").val();
     console.log(tailPeriod.length);
     if (tailPeriod.length < 1 ) {
         tailPeriod = null;
     } else {
         tailPeriod = "P" + tailPeriod;
     }
     map.timeDimension.options.period = "PT" + period;
     var file = fileInput.files[0];
     var fileExtention = file.name.substr(file.name.length - 3);
     console.log(fileExtention);
     fr = new FileReader();

     // fileInput.value = ''; // Clear the input.
     fr.onload = function() {
         console.log(fr.result);
         var icon = L.icon({
             iconUrl: 'img/dot.png',
             iconSize: [49, 66],
             iconAnchor: [5, 25]
         });
         var op = $("#opSlider").val();
         console.log("TAIL", tailPeriod);
         var customLayer = L.geoJson(null, {
             pointToLayer: function(feature, latLng) {
                 if (feature.properties.hasOwnProperty('last')) {
                     return new L.Marker(latLng);
                 }
                 return L.circleMarker(latLng);
                 // return L.circleMarker(latLng, {icon:icon});
             },
             style: {
                 color: $("#colorPick").val(),
                 weight: $("#weightSlider").val(),
                 opacity: op
             }
         });
         // console.log("CUSTLAYER", customLayer.options.);
         // Because we do not need to retrieve a CSV file through AJAX, we can directly use the omnivore.csv.parse synchronous function:
         // https://github.com/mapbox/leaflet-omnivore#api
         if (fileExtention === "gpx") {
             var layer = omnivore.gpx.parse(fr.result, null, customLayer); // Executed synchronously, so no need to use the .on('ready') listener.
         } else if (fileExtention === "csv") {
             var layer = omnivore.csv.parse(fr.result, null, customLayer); // Executed synchronously, so no need to use the .on('ready') listener.
         } else if (fileExtention === "kml") {
             var layer = omnivore.kml.parse(fr.result, null, customLayer);
         } else {
             alert("Please use GPX files only");
         }


         var gpxTimeLayer = L.timeDimension.layer.geoJson(layer, {
             updateTimeDimension: true,
             addlastPoint: true,
             waitForReady: true,
             duration: tailPeriod
         });
         console.log("DURATION",gpxTimeLayer._duration);
         gpxTimeLayer.addTo(map);
         map.fitBounds(layer.getBounds());
     };
     fr.readAsText(file);
     $('#myModal').modal('hide');

 });
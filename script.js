// This isn't necessary but it keeps the editor from thinking L and carto are typos
/* global L, carto, Mustache */


var map = L.map('map', {
  center: [20.728709, 13.979167],
  zoom: 2,
  minZoom: 2,
});

// Get the popup template from the HTML. We can do this here because the template will never change.
var popupTemplate = document.querySelector('.popup-template').innerHTML;

// Add base layer
L.tileLayer('https://api.mapbox.com/styles/v1/nicostettler/ck67e1izr0apx1ipbuyp7bvm0/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoibmljb3N0ZXR0bGVyIiwiYSI6ImNqc3lweWFmOTE1cDc0OW9iZGYzbHNyNGoifQ.BgZ8GQky4xAHBlL-Pi8MiQ', {
  maxZoom: 18,
}).addTo(map);

var client = new carto.Client({
  apiKey: 'default_public',
  username: 'vonwildsau'
});

var source = new carto.source.Dataset('country_of_birth');
var source = new carto.source.SQL("SELECT * FROM vonwildsau.country_of_birth");

var style = new carto.style.CartoCSS(`
#layer {
  marker-width: ramp([count], range(15, 40), jenks(6));
  marker-width: 15;
  marker-fill-opacity: 0.9;
  marker-allow-overlap: true;
  marker-line-width: 1;
  marker-line-color: #ffffff;
  marker-line-opacity: 1;
  marker-fill: #ffdd00;

  [type="Faculty"] {marker-fill: #242a8c;}
  [type="Part-time Faculty"] {marker-fill: #08782c;}
  [type="Visiting Scholar(s)"] {marker-fill: #ff9b05;}
  [type="Alumni"] {marker-fill: #b50231;}

#layer::labels {
  text-name: [count];
  text-face-name: 'DejaVu Sans Book';
  text-size: 10;
  text-fill: #FFFFFF;
  text-label-position-tolerance: 0;
  text-halo-radius: 0;
  text-halo-fill: rgba(111, 128, 141, 0);
  text-dy: 0;
  text-allow-overlap: true;
  text-placement: point;
  text-placement-type: dummy;
}
}
`);

var layer = new carto.layer.Layer(source, style, {
  featureClickColumns: ['origincountry', 'type', 'latitude', 'longitude', 'count']
});

layer.on('featureClicked', function (event) {
  // Render the template with all of the data. Mustache ignores ata
  // that isn't used in the template, so this is fine.
  var content =  Mustache.render(popupTemplate, event.data);
  
  // If you're not sure what data is available, log it out:
  console.log(event.data);
  
  var popup = L.popup();
  popup.setContent(content);
  
  // Place the popup and open it
  popup.setLatLng(event.latLng);
  popup.openOn(map);
});


 // Add the data to the map as a layer
client.addLayer(layer);
client.getLeafletLayer().addTo(map);

var alumniButton = document.querySelector('#alumniButton');
var facultyButton = document.querySelector('#facultyButton');
var ptFacultyButton = document.querySelector('#ptFacultyButton');
var scholarButton = document.querySelector('#scholarButton');
var allButton = document.querySelector('#allButton')

alumniButton.addEventListener('click', function (e) {
  source.setQuery("SELECT * FROM country_of_birth WHERE type='Alumni'");
});
facultyButton.addEventListener('click', function (e) {
  source.setQuery("SELECT * FROM country_of_birth WHERE type='Faculty'");
});
ptFacultyButton.addEventListener('click', function (e) {
  source.setQuery("SELECT * FROM country_of_birth WHERE type='Part-time Faculty'");
});
scholarButton.addEventListener('click', function (e) {
  source.setQuery("SELECT * FROM country_of_birth WHERE type='Visiting Scholar(s)'");
});
allButton.addEventListener('click', function (e) {
  source.setQuery("SELECT * FROM country_of_birth");
});


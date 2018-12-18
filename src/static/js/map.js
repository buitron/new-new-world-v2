var worldMap = L.tileLayer('https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg90?access_token={accessToken}', {
  id: 'mapbox.outdoors',
  accessToken: 'pk.eyJ1IjoiYnVpdHJvbiIsImEiOiJjamVscGdqMGMxbDM4MndtZWkyNzlya3k3In0.pKbQxM0ARbeBunYG4UBZ-Q',
  maxZoom: 16,
  minZoom: 2
});


var layers = {
  GREAT_LOC: new L.LayerGroup(),
  GOOD_LOC: new L.LayerGroup(),
  OK_LOC: new L.LayerGroup()
};

var map = L.map('wineMap', {
  center: [0,10],
  zoom: 2,
  layers: [
    layers.GREAT_LOC,
    layers.GOOD_LOC,
    layers.OK_LOC
  ],
  maxBounds: [L.latLng(85, -180), L.latLng(-85, 180)],
  scrollWheelZoom: false,
  zoomControl: false
});

L.control.zoom({ position: 'bottomleft' }).addTo(map);

worldMap.addTo(map);

var overlays = {
  "Best Rated Appellation Locations (over 89% rating)": layers.GREAT_LOC,
  "Greatly Rated Appellation Locations (85-89% rating)": layers.GOOD_LOC,
  "Moderately Rated Appellation Locations (<85% rating)": layers.OK_LOC
};

L.control.layers(null, overlays, {collapsed: false, position: 'topleft'}).addTo(map);

var info = L.control({
  position: "topright"
});

info.onAdd = function(){
  var div = L.DomUtil.create("div", "legend");
  return div
};

info.addTo(map);

var icons = {
  GREAT_LOC: L.ExtraMarkers.icon({
    icon: "ion-wineglass",
    iconColor: "white",
    markerColor: "yellow",
    shape: "circle",
    iconSize: [38, 46],
    iconAnchor: [14, 45],
    shadowSize: [35, 16],
    shadowAnchor: [5, 15]
  }),
  GOOD_LOC: L.ExtraMarkers.icon({
    icon: "ion-wineglass",
    iconColor: "white",
    markerColor: "blue-dark",
    shape: "circle",
    iconSize: [38, 46],
    iconAnchor: [14, 45],
    shadowSize: [35, 16],
    shadowAnchor: [5, 15]
  }),
  OK_LOC: L.ExtraMarkers.icon({
    icon: "ion-wineglass",
    iconColor: "white",
    markerColor: "red",
    shape: "circle",
    iconSize: [38, 46],
    iconAnchor: [14, 45],
    shadowSize: [35, 16],
    shadowAnchor: [5, 15]
  })
};

d3.json('static/data/sb_grape_2016.json').then(function(d) {
  d.forEach((element) => {
    try {
      var rated;
      if (element.rating < 85){
          rated = 'OK_LOC';
      } else if (element.rating < 90){
          rated = 'GOOD_LOC';
      } else {
          rated = 'GREAT_LOC';
      }

      var newMarker = L.marker([element.lat, element.lon], {
          icon: icons[rated],
          riseOnHover: true
      });
      newMarker.addTo(layers[rated]);
      newMarker.on('click', (selected) => {
          updateLegend(selected.latlng['lat'], selected.latlng['lng'], element.appell_region, element.appell_country, element.title, element.price, element.rating, element.pH, element.Carbon, element.Water_at_WiltingPoint);
      })
    }
    catch(err){
    }
  });
});

function updateLegend(lat, lon, region, country, wine, price, rating, ph, carbon, wwp){
  document.querySelector('.legend').innerHTML =
    "<strong>Geo-Coordinates:</strong> " + lat + ", " + lon + "<br>" +
    "<strong>Region, Country:</strong> " + region + ", " + country + "<br>" +
    "<strong>Wine Produced:</strong> " + wine + "<br>" +
    "<strong>Price:</strong> $" + price + "<br>" +
    "<strong>Wine Enthusiast Rating:</strong> " + rating + "<br></hr>" +
    "<strong>Soil pH Levels:</strong> " + ph + "<br>" +
    "<strong>Soil Carbon Levels:</strong> " + carbon + "<br>" +
    "<strong>Soil Water Wilting Point Content:</strong> " + wwp + "%";
}

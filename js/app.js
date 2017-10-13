var initialLocations= [
	{title: "Shahid Minar",location:{lat: 22.5629,lng: 88.3492},type: "monument"},
	{title: "Indian Museum",location:{lat: 22.5579,lng: 88.3511},type: "poi"},
	{title: "Eden Gardens",location:{lat: 22.5646,lng: 88.3433},type: "stadium"},
	{title: "Raj Bhavan",location:{lat: 22.5673,lng: 88.3473},type: "administrative"},
	{title: "Fort William,India",location:{lat: 22.5542,lng: 88.3359},type: "poi"}
];

var map;
var markers=[];

var initMap=function() {
	map = new google.maps.Map(document.getElementById('map'),{
				center: {lat: 22.5570,lng: 88.3510},
				zoom: 15,
				mapTypeControl: false
			});

	initialLocations.forEach(function(location,index){
		// Get the position from the location array.
		var position = location.location;
		var title = location.title;
	})

	var highlightedIcon=new google.maps.MarkerImage("MapMarker_Marker_Outside_Azure.png",
          new google.maps.Size(48,48));

	var bounds = new google.maps.LatLngBounds();

	markers.forEach(function(marker){
		marker.setMap(map);
		marker.addListener('click', function() {
			toggleBounce(this);
			populateInfoWindow(marker, largeInfowindow);

		});
	})

	var toggleBounce=function(marker){
		if(marker.getAnimation() !== null)
			{
				marker.setAnimation(null);
				marker.setIcon(null);
			}else{
				marker.setAnimation(google.maps.Animation.BOUNCE);
				marker.setIcon(highlightedIcon);
			}
	}

	var largeInfowindow = new google.maps.InfoWindow();


	function populateInfoWindow(marker, infowindow) {
		// Check to make sure the infowindow is not already opened on this marker.
		if (infowindow.marker != marker) {
			infowindow.marker = marker;
			infowindow.setContent('<div>' + marker.title + '</div>');
			infowindow.open(map, marker);
			// Make sure the marker property is cleared if the infowindow is closed.
			infowindow.addListener('closeclick', function() {
				infowindow.marker = null;
				marker.setAnimation(null);
				marker.setIcon(null);
			});
		}
	}

};

var Location=function(data) {
	this.title=ko.observable(data.title);
	this.location=ko.observable(data.location);
	this.type=ko.observable(data.type);
	this.marker = new google.maps.Marker({
			position: this.location(),
			title: this.title(),
			animation: google.maps.Animation.DROP,
		});
	markers.push(this.marker);
}

var ViewModel=function () {
	this.heading=ko.observable('Welcome to the neighbourhood');
	this.locationList=ko.observableArray([]);
	var self=this;
	initialLocations.forEach(function(locationItem){
		self.locationList.push(new Location(locationItem));
	})


	this.setMarker=function(clickedLocation){
		markers.forEach(function(marker){
			marker.setMap(null);
		})
		clickedLocation.marker.setMap(map);
	}
};

var start=function(){
	ko.applyBindings(new ViewModel());
	initMap();
}


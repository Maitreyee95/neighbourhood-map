

var initialLocations= [
	{title: "Shahid Minar",location:{lat: 22.5629,lng: 88.3492},type: "monument",placeid: '4c0218258ef2c9b66d9c16fc'},
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
				zoom: 14,
				mapTypeControl: false
			});

	setEverything();
};
var setEverything=function(){

	markers.forEach(function(marker){
		marker.setMap(map);
	});
	var highlightedIcon="MapMarker_Marker_Outside_Azure.png";

	// var bounds = new google.maps.LatLngBounds();

	markers.forEach(function(marker){
		// marker.setMap(map);
		marker.addListener('click', function() {
			toggleBounce(this);
			populateInfoWindow(marker, largeInfowindow);
		});
					// bounds.extend(marker.position);

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
	// map.fitBounds(bounds);
}
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
	this.locationTypes=ko.observableArray(['monument','poi','stadium','administrative']);
	this.chosenType=ko.observableArray([]);
	this.heading=ko.observable('Welcome to the neighbourhood');
	this.clickedFilter=ko.observable(false);
	this.locationList=ko.observableArray([]);
	var self=this;
	var locItem=ko.observable();
	initialLocations.forEach(function(location){
		locItem=new Location(location)
		self.locationList.push(locItem);
	})

	this.setMarker=function(clickedLocation){
		hideMarkers();
		clickedLocation.marker.setMap(map);
	};

	var hideMarkers=function(){
		markers.forEach(function(marker){
			marker.setMap(null);
		})
	};
	this.filterData=function(){
		hideMarkers();
		markers=[];
		// var filteredType=self.chosenType()[0];
		showFilteredList(self.chosenType()[0]);
	}

	self.filterclicked=function(){
		if (self.clickedFilter()===true){
			self.clickedFilter(false);
		}else{
			self.clickedFilter(true);
		}

	}

	this.filterSearchData=function(){
		hideMarkers();

		markers=[];
		var filteredType= document.getElementById('choice').value;
		showFilteredList(filteredType);
	}

	var showFilteredList=function(filteredType){
		var c=1;
		var loc=ko.observable();
		self.locationList.removeAll();
		markers=[];
		initialLocations.forEach(function(location,index){
			if (location.type===filteredType){
				loc=new Location(location);
				c=0;
				self.locationList.push(loc);
			}
		})
		if(c===1){
			alert("Sorry!No matching results found");
		}
		setEverything();
	};
	this.reset=function(){
		self.locationList.removeAll();
		hideMarkers();
		markers=[];
		initialLocations.forEach(function(location){
			self.locationList.push(new Location(location));
		})
		setEverything();
	};

};

function openNav() {
    document.getElementById("mySidenav").style.width = "50vw";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

var start=function(){
	ko.applyBindings(new ViewModel());
	initMap();
};


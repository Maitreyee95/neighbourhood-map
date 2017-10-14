// array of locations that would load by default on page load
var initialLocations= [
	{title: "Shaheed Minar",index:0,location:{lat: 22.5629,lng: 88.3492},type: "monument",id:'5292e1a511d20e4e1e12b9c1'},
	{title: "Indian Museum",index:1,location:{lat: 22.5579,lng: 88.3511},type: "poi",id:'4bf297077f2aef3b05c8392a'},
	{title: "Eden Garden",index:2,location:{lat: 22.5646,lng: 88.3433},type: "stadium",id:'4bc9c62b511f9521982faec7'},
	{title: "Raj Bhavan",index:3,location:{lat: 22.5673,lng: 88.3473},type: "administrative",id:'4d283491888af04d4b93c3af'},
	{title: "Fort William,India",index:4,location:{lat: 22.5542,lng: 88.3359},type: "poi",id:'4d1495d06c8b548133efd7cc'},
	{title: "Barbeque Nation",index:5,location:{lat: 22.5511,lng: 88.3539},type: "eatery",id:'5598d138498ea6e889b6f0ba'}
];

var map;
var markers=[];



//setting foursquare URL
var fsUrl = "https://api.foursquare.com/v2/venues/",
    fsClient_id = "client_id=VZSHPGBA1OXN4OX1BYMZS33X5OH4YANXYLBZL3HNAUNACJKF",
    fsClient_secret = "&client_secret=RSAKWHS1ZHT0BRQ4P5FVIFQ4CM12PCIBJN3ORLPIB3JKL01H",
    fsVersion = "&v=20171013";


//initialising map
var initMap=function() {
	map = new google.maps.Map(document.getElementById('map'),{
				center: {lat: 22.5570,lng: 88.3510},
				zoom: 14,
				mapTypeControl: false
			});
	markers.forEach(function(marker){
		marker.setMap(map);
	});
	setEverything();
};

//places the markers on page
var setEverything=function(){


	var highlightedIcon="MapMarker_Marker_Outside_Azure.png";

	var bounds = new google.maps.LatLngBounds();
	//markers bounce on clicking and shows the infowindow
	markers.forEach(function(marker,index){
		// marker.setMap(map);
		marker.addListener('click', function() {
			toggleBounce(this);
			populateInfoWindow(marker,index, largeInfowindow);
			});
		bounds.extend(marker.position);

	});

	//adding and removing bounce from markers
	var toggleBounce=function(marker){

		//resetting animation and icon of any previously clicked marker
		markers.forEach(function(marker){
			marker.setAnimation(null);
			marker.setIcon(null);
		});
		if(marker.getAnimation() !== null)
			{
				marker.setAnimation(null);
				marker.setIcon(null);
			}else{
				marker.setAnimation(google.maps.Animation.BOUNCE);
				marker.setIcon(highlightedIcon);
			}
	};

	var largeInfowindow = new google.maps.InfoWindow();

	//making infowindow for each marker
	function populateInfoWindow(marker,index, infowindow) {
		// Check to make sure the infowindow is not already opened on this marker.
		if (infowindow.marker != marker) {
			infowindow.marker = marker;
			infowindow.setContent('<div>' + marker.title + '</div>');
			infowindow.open(map, marker);
			infowindow.addListener('mouseover',function() {
				infowindow.marker = null;

			});
			// Make sure the marker property is cleared if the infowindow is closed.
			infowindow.addListener('closeclick', function() {
				infowindow.marker = null;
				marker.setAnimation(null);
				marker.setIcon(null);
			});
		}
	}
	map.fitBounds(bounds);
};

//creating a location functinal class using knockout
var Location=function(data) {
	this.title=ko.observable(data.title);
	this.location=ko.observable(data.location);
	this.type=ko.observable(data.type);
	this.id=ko.observable(data.id);
	this.index=ko.observable(data.index);
	// this.details=ko.observableArray(data.details);
	this.marker = new google.maps.Marker({
			position: this.location(),
			title: this.title(),
			animation: google.maps.Animation.DROP,
		});
};


//knockout viewmodel
var ViewModel=function () {
	this.locationTypes=ko.observableArray(['monument','poi','stadium','administrative','eatery']);
	this.chosenType=ko.observableArray([]);
	this.heading=ko.observable('Welcome to the neighbourhood');
	this.clickedFilter=ko.observable(false);
	this.locationList=ko.observableArray([]);
	this.name=ko.observable();
	this.address=ko.observableArray([]);
	this.rating=ko.observable();
	this.likes=ko.observable();
	var self=this;
	var locItem=ko.observable();
	initialLocations.forEach(function(location,index){
		locItem=new Location(location);
		self.locationList.push(locItem);
		markers.push(locItem.marker);
	});

	markers.forEach(function(marker,index){
		marker.addListener('click', function() {
			getFSDataOnMarkerClick(index);
		});
	});

	function getFSDataOnMarkerClick(index){
		var p= initialLocations[index].id;
		var locType= initialLocations[index].type;
		getFSData(p,locType);
	}
	//when a location is selected, foursquare data is displayed
	this.getFSDataOnLocationClick=function(clickedLocation){
		var p=clickedLocation.id();
		var i=clickedLocation.index();
		markers.forEach(function(marker){
			marker.setAnimation(null);
			marker.setIcon(null);
			// locationClicked='true';
		});
		markers[i].setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ markers[i].setAnimation(null); }, 750);
		console.log(i);
		var locType=clickedLocation.type();
		getFSData(p,locType);
	};

	function getFSData(p,locType){
		var venueID=p+"/?";
		var URL= fsUrl + venueID + fsClient_id+ fsClient_secret+fsVersion;

		//setting a timeout function in case foursquare API doesn't load
		var timeOut=setTimeout(function(){
			$("#details").text("Failed to get resources");
		},8000);

		//requesting foursquare  API
		$.ajax(URL,{
			dataType: "jsonp",
			success: function(data){

				var a=data.response.venue.likes.summary;
				var b = data.response.venue.rating;
				var c= data.response.venue.name;
				var d=data.response.venue.location.formattedAddress;
				//showing details of clicked location
				console.log(a,b,c,d);
				self.name(c);
				self.address(d);
				self.rating(b);
				self.likes(a);
				console.log(self.name());
				//clearing the timeout if request comes back successful
				clearTimeout(timeOut);
			}
		});
	}

	//filter data on selecting types from filter menu
	this.filterData=function(){
		showFilteredList(self.chosenType()[0]);
	};
	//showing and hiding menu on clicking 'Filter'
	self.filterclicked=function(){
		if (self.clickedFilter()===true){
			self.clickedFilter(false);
		}else{
			self.clickedFilter(true);
		}

	};
	//filter data on writing in search box
	this.filterSearchData=function(){
		var filteredType= document.getElementById('choice').value;
		showFilteredList(filteredType);
	};

	//showing the results of filtering

	var showFilteredList=function(filteredType){
		var c=1;
		$("#details").empty();
		var loc=ko.observable();
		self.locationList.removeAll();
		hideMarkers();
		initialLocations.forEach(function(location,index){
			if (location.type===filteredType){
				loc=new Location(location);
				c=0;
				self.locationList.push(loc);
				markers[index].setMap(map);
			}else{
				markers[index].setMap(null);
			}
		});
		if(c===1){
			alert("Sorry!No matching results found");
		}
	};

	//resetting map and details on clicking "See All"
	this.reset=function(){
		self.locationList.removeAll();
		initialLocations.forEach(function(location,index){
			self.locationList.push(new Location(location));
			markers[index].setMap(map);
		});
		document.getElementById('choice').value=null;
		self.chosenType([]);
		$('#details').empty();
	};
};

// function for opening the navigation bar on small screen
function openNav() {
    document.getElementById("mySidenav").style.width = "50vw";
}

//closing navigation bar on hitting "close" in small screen
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}


//function for hiding the markers
	var hideMarkers=function(){
		markers.forEach(function(marker){
			marker.setMap(null);
		});
	};


//start() runs when map loads
var start=function(){
	ko.applyBindings(new ViewModel());
	initMap();
};


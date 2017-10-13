// arraay of locations that would load by efault on page load
var initialLocations= [
	{title: "Shaheed Minar",index:1,location:{lat: 22.5629,lng: 88.3492},type: "monument",id:'5292e1a511d20e4e1e12b9c1'},
	{title: "Indian Museum",index:2,location:{lat: 22.5579,lng: 88.3511},type: "poi",id:'4bf297077f2aef3b05c8392a'},
	{title: "Eden Garden",index:3,location:{lat: 22.5646,lng: 88.3433},type: "stadium",id:'4bc9c62b511f9521982faec7'},
	{title: "Raj Bhavan",index:4,location:{lat: 22.5673,lng: 88.3473},type: "administrative",id:'4d283491888af04d4b93c3af'},
	{title: "Fort William,India",index:5,location:{lat: 22.5542,lng: 88.3359},type: "poi",id:'4d1495d06c8b548133efd7cc'},
	{title: "Barbeque Nation",index:6,location:{lat: 22.5511,lng: 88.3539},type: "eatery",id:'5598d138498ea6e889b6f0ba'}
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

	setEverything();
};

//places the markers on page
var setEverything=function(){

	markers.forEach(function(marker){
		marker.setMap(map);
	});
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

	})
	//adding and removing bounce from markers
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

	//making infowindow for each marker
	function populateInfoWindow(marker,index, infowindow) {
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
	map.fitBounds(bounds);
}

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
	markers.push(this.marker);
}


//knockout viewmodel
var ViewModel=function () {
	this.locationTypes=ko.observableArray(['monument','poi','stadium','administrative','eatery']);
	this.chosenType=ko.observableArray([]);
	this.heading=ko.observable('Welcome to the neighbourhood');
	this.clickedFilter=ko.observable(false);
	this.locationList=ko.observableArray([]);
	var self=this;
	var locItem=ko.observable();
	initialLocations.forEach(function(location,index){
		locItem=new Location(location)
		self.locationList.push(locItem);


	})
	//when a location is selected or filtered markers are shown on resulted places
	this.setMarker=function(clickedLocation){
		hideMarkers();
		$('#details').empty();
		var p=clickedLocation.id();
		var locType=clickedLocation.type();
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

				a=data.response.venue.likes.summary;
				b = data.response.venue.rating;
				c= data.response.venue.name;
				d=data.response.venue.location.formattedAddress;
				//showing details of clicked location
				$('#details').append('<div>'+c+'</div>Address:'+d+'<div>Rating:'+b+'</div><div>Likes:'+a+'</div><div>Type:'+locType+'</div>');
				//clearing the timeout if request comes back successful
				clearTimeout(timeOut);
			}
		})
		clickedLocation.marker.setMap(map);
	};
	//function for hiding the markers
	var hideMarkers=function(){
		markers.forEach(function(marker){
			marker.setMap(null);
		})
	};

	//filter data on selecting types from filter menu
	this.filterData=function(){
		hideMarkers();
		markers=[];
		showFilteredList(self.chosenType()[0]);
	}
	//showing and hiding menu on cklicking 'Filter'
	self.filterclicked=function(){
		if (self.clickedFilter()===true){
			self.clickedFilter(false);
		}else{
			self.clickedFilter(true);
		}

	}
	//filter data on writing in search box
	this.filterSearchData=function(){

		var call=false;

		var filteredType= document.getElementById('choice').value;
		this.locationTypes().forEach(function(type){
			if(filteredType===type){
				call=true;
				hideMarkers();
				markers=[];
				showFilteredList(filteredType);
			}
		})
		if (call===false){
			alert("Sorry!No result found. Check search keyword and try again!");
		}
	}

	//showing the results of filtering

	var showFilteredList=function(filteredType){
		var c=1;
		$("#details").empty();
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

	//resetting map and details on clicking "See All"
	this.reset=function(){
		self.locationList.removeAll();
		hideMarkers();
		markers=[];
		initialLocations.forEach(function(location){
			self.locationList.push(new Location(location));
		})
		$('#details').empty();
		setEverything();
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



//start() runs when map loads
var start=function(){
	ko.applyBindings(new ViewModel());
	initMap();
};


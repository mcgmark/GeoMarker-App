const titleInput = document.querySelector('input[id="title"');
const latitudeInput = document.querySelector('input[id="latitude"]');
const longitudeInput = document.querySelector('input[id="longitude"]');
const lookupButton = document.getElementById("lookupButton");
const currentButton = document.getElementById("currentButton");
const resetAddress = document.getElementById("resetAddress");

let map;
let infobox;
let searchManager;
let dataReturn = [];

const mapContainer = document.querySelector('#myMap');

//Initalize map for page load
function GetMap() {

    //Create new map object
    var map = new Microsoft.Maps.Map('#myMap');
   
    //Initalize map functions
    GetMarkerData(map, PopulateMarkers);
    AutoSuggest(map);
    ReverseGeoCode(map);
    CurrentLocation(map);
    DropMarker(map);

    //Initalize infobox
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
        visible: false
    });

    //Assign infobox to map
    infobox.setMap(map);

    resetAddress.addEventListener('click', function () {
        //reset coordinates input
        latitudeInput.value = "";
        longitudeInput.value = "";
        address.value = "";
        map.entities.pop();
        
    });
};

//Function to drop marker on map click
function DropMarker(map) {
    Microsoft.Maps.Events.addHandler(map, 'click', function (e) {
        var stringPathName = window.location.pathname;
        if (e.targetType == "map") {
            if (stringPathName == "/Markers/Create") {
                //Get map unit x,y
                var point = new Microsoft.Maps.Point(e.getX(), e.getY());
                //Convert map point to location
                var location = e.target.tryPixelToLocation(point);
                //Send marker info to marker function
                Marker(e.location, map);
                //Set input boxes to coordinates values
                latitudeInput.value = location.latitude;
                longitudeInput.value = location.longitude;
                //Make title input the focus
                titleInput.focus();
            };
        };
    });
};

//Function for currentLocation button
function CurrentLocation(map) {
    currentButton.addEventListener('click', function () {
        navigator.geolocation.getCurrentPosition(function (position) {
            var loc = new Microsoft.Maps.Location(position.coords.latitude,position.coords.longitude);
            //Add a pushpin at the user's location.
            Marker(loc, map);
            //Center the map on the user's location.
            map.setView({ center: loc, zoom: 15 });
            //Inject values into input boxes
            latitudeInput.value = position.coords.latitude;
            longitudeInput.value = position.coords.longitude;
        });
    });
};

//function for lookup button
function ReverseGeoCode(map) {
    lookupButton.addEventListener('click', function () {
        Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
            var searchManager = new Microsoft.Maps.Search.SearchManager(map);
            let latitudeValue = latitudeInput.value;
            let longitudeValue = longitudeInput.value;
            var reverseGeocodeRequestOptions = {
                location: new Microsoft.Maps.Location(latitudeValue, longitudeValue),
                callback: function (answer, userData) {
                    map.setView({ bounds: answer.bestView });
                    //Marker(reverseGeocodeRequestOptions.location, map);
                    document.getElementById("address").value = answer.address.formattedAddress;
                }
            };
            searchManager.reverseGeocode(reverseGeocodeRequestOptions);
        });
    });
};

//Function to automatically suggest addresses
function AutoSuggest(map) {
    Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
        var options = {
            maxResults: 4,
            map: map
        };
        var manager = new Microsoft.Maps.AutosuggestManager(options);
        manager.attachAutosuggest('#address', '#searchBoxContainer', selectedSuggestion);
    });

    function selectedSuggestion(suggestionResult) {
        map.entities.clear();
        map.setView({ bounds: suggestionResult.bestView });
        Marker(suggestionResult.location, map);
        latitudeInput.value = suggestionResult.location.latitude;
        longitudeInput.value = suggestionResult.location.longitude;
    };
};

//Function to drop new marker
function Marker(location, map) {
    var pushpin = new Microsoft.Maps.Pushpin(location);
    Microsoft.Maps.Events.addHandler(pushpin, 'click', function (e) {
        for (var i = map.entities.getLength() - 1; i >= 0; i--) {
            var pushpin = map.entities.get(i);
            if (pushpin == e.target) {
                map.entities.remove(pushpin);
            }
        };
    });
    map.entities.push(pushpin);
}

//Function to get marker JSON data
function GetMarkerData(map, callback) {
    let XHR = new XMLHttpRequest();
    XHR.open("GET", "/Markers/GetMarkerData");
    XHR.send();
    XHR.addEventListener("readystatechange", function () {
        if ((XHR.status == 200) && (XHR.readyState == 4)) {
            let parsedMarkerData = JSON.parse(XHR.responseText);
            callback(parsedMarkerData, map);  //When data is received PopulateMarkers
        };
    });
};

//Populate Map with Markers from model JSON data
function PopulateMarkers(parsedMarkerData, map) {
    for (let item in parsedMarkerData) {
        let location = new Microsoft.Maps.Location(`${parsedMarkerData[item].latitude}`, `${parsedMarkerData[item].longitude}`);
        var pushpin = new Microsoft.Maps.Pushpin(location);
        pushpin.metadata = {
            title: `${parsedMarkerData[item].title}`,
            description: `${parsedMarkerData[item].description}`
        };
        Microsoft.Maps.Events.addHandler(pushpin, 'click', ShowInfoBox);
        map.entities.push(pushpin);
    };
};



//Function to show marker infobox
function ShowInfoBox(e) {
    //Check to see if infobox has metadata to display.
    if (e.target.metadata) {
        //Set the infobox options with the metadata of the pushpin.
        infobox.setOptions({
            location: e.target.getLocation(),
            title: e.target.metadata.title,
            description: e.target.metadata.description,
            visible: true,
            maxHeight: 250,
            maxWidth: 300,
            actions: [{
                label: 'Handler1',
                eventHandler: function (e) {
                    alert('Handler1');
                }
            }, {
                label: 'Handler2',
                eventHandler: function (e) {
                    alert('Handler2');
                }
            }]
        });
    }
}

//Change map size according to window size
window.addEventListener('resize', () => {
    if (window.innerWidth >= 800) {
        mapContainer.style.height = '100vh';
    } else if (window.innerWidth <= 800) {
        mapContainer.style.height = '100vh';

    }
});

window.addEventListener('load', () => {
    if (window.innerWidth <= 800) {
        mapContainer.style.height = '50vh';
    };
});
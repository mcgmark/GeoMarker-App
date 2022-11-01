const titleInput = document.querySelector('input[id="title"');
const latitudeInput = document.querySelector('input[id="latitude"]');
const longitudeInput = document.querySelector('input[id="longitude"]');
const lookupButton = document.getElementById("lookupButton");
const currentButton = document.getElementById("currentButton");
const resetAddress = document.getElementById("resetAddress");
const markerList = document.querySelectorAll(".marker-card");
const mapContainer = document.querySelector('#myMap');

let map;
let infobox;
let searchManager;
let dataReturn = [];
let stringPathName;

//Initalize map for page load
function GetMap() {

    //Create new map object
    let map = new Microsoft.Maps.Map('#myMap');
   
    //Initalize infobox
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
        visible: false,
        width: 600,
        height: 300
    });

    //Assign infobox to map
    infobox.setMap(map);

    //Function to place markers on map
    GetMarkerData(map, PopulateMarkers);

    //Initalize map functions
    stringPathName = window.location.pathname;
    if (stringPathName == "/Markers/Create") {
        DropMarker(map);
        AutoSuggest(map);
        ReverseGeoCode(map);
        CurrentLocation(map);
        ResetButton(map);
    } else if (stringPathName.includes("Details") || stringPathName.includes("Edit") || stringPathName.includes("Delete") ) {
        let latitude = document.getElementById("latitude").innerText;
        let longitude = document.getElementById("longitude").innerText;
        map.setView({
            center: new Microsoft.Maps.Location(latitude, longitude),
            zoom: 17
        });
    };
};

//Function to drop marker on map click
function DropMarker(map) {
    Microsoft.Maps.Events.addHandler(map, 'click', function (e) {
        stringPathName = window.location.pathname;
        if (e.targetType == "map") {
            if (stringPathName == "/Markers/Create") {
                //Get map unit x,y
                let point = new Microsoft.Maps.Point(e.getX(), e.getY());
                //Convert map point to location
                let location = e.target.tryPixelToLocation(point);
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

//Function for reset button
function ResetButton(map) {
    resetAddress.addEventListener('click', function () {
        //reset coordinates input
        latitudeInput.value = "";
        longitudeInput.value = "";
        address.value = "";
        map.entities.pop();
    });
};

//Function for currentLocation button
function CurrentLocation(map) {
    currentButton.addEventListener('click', function () {
        navigator.geolocation.getCurrentPosition(function (position) {
            let loc = new Microsoft.Maps.Location(position.coords.latitude,position.coords.longitude);
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
            let searchManager = new Microsoft.Maps.Search.SearchManager(map);
            let latitudeValue = latitudeInput.value;
            let longitudeValue = longitudeInput.value;
            let reverseGeocodeRequestOptions = {
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
        let options = {
            maxResults: 4,
            map: map
        };
        let manager = new Microsoft.Maps.AutosuggestManager(options);
        manager.attachAutosuggest('#address', '#searchBoxContainer', selectedSuggestion);
    });

    function selectedSuggestion(suggestionResult) {
        //map.entities.clear();
        map.setView({ bounds: suggestionResult.bestView });
        Marker(suggestionResult.location, map);
        latitudeInput.value = suggestionResult.location.latitude;
        longitudeInput.value = suggestionResult.location.longitude;
    };
};

//Function to drop new marker
function Marker(location, map) {
    let pushpin = new Microsoft.Maps.Pushpin(location);
    pushpin.setOptions({ color: 'red' });
    Microsoft.Maps.Events.addHandler(pushpin, 'click', function (e) {
        for (let i = map.entities.getLength() - 1; i >= 0; i--) {
            let pushpin = map.entities.get(i);
            if (pushpin == e.target) {
                map.entities.remove(pushpin);
                ClearInput();
            }
        };
    });

    map.entities.push(pushpin);
}

function ClearInput() {
    latitudeInput.value = "";
    longitudeInput.value = "";
    address.value = "";
};

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
        let pushpin = new Microsoft.Maps.Pushpin(location);
        pushpin.metadata = {
            title: `${parsedMarkerData[item].title}`,
            description: `${parsedMarkerData[item].description}`
        };
        pushpin.setOptions({ color: 'blue' });

        //Event listener for Marker mouseover and mouseout
        Microsoft.Maps.Events.addHandler(pushpin, 'mouseover', function (e) {
            for (let i = map.entities.getLength() - 1; i >= 0; i--) {
                let pushpin = map.entities.get(i);
                if (pushpin == e.target) {
                    markerList[i].classList.add("shadow-blue");
                    markerList[i].scrollIntoView({block: 'nearest'});
                    pushpin.setOptions({ color: 'red' });
                }
            };
        });
        Microsoft.Maps.Events.addHandler(pushpin, 'mouseout', function (e) {
            for (let i = map.entities.getLength() - 1; i >= 0; i--) {
                let pushpin = map.entities.get(i);
                if (pushpin == e.target) {
                    markerList[i].classList.remove("shadow-blue");
                    pushpin.setOptions({ color: 'blue' });
                }
            };
        });

        //Event listeners for the Marker list items to focus on the right marker on the map
        for (let k = 0; k < markerList.length; k++) {
            markerList[k].addEventListener("mouseover", (event) => {
                markerList[k].classList.add("shadow-blue");
                let pushpinCurrent = map.entities.get(k);
                pushpinCurrent.setOptions({ color: 'red' });
                map.setView({
                    center: new Microsoft.Maps.Location(pushpinCurrent.geometry.y, pushpinCurrent.geometry.x),
                    zoom: 15
                });
          
               
            });
            markerList[k].addEventListener("mouseout", (event) => {
                markerList[k].classList.remove("shadow-blue");
                let pushpinCurrent = map.entities.get(k);
                pushpinCurrent.setOptions({ color: 'blue' });
            });
        };

        //Add the marker to the map entities for control
        map.entities.push(pushpin);
    };
};
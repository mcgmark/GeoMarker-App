// Bing Maps V8 SDK makes this possible. This code was written based on the documentation and examples from
// https://learn.microsoft.com/en-us/bingmaps/v8-web-control/
//


//Initalize variables
const titleInput = document.querySelector('input[id="title"');
const latitudeInput = document.querySelector('input[id="latitude"]');
const longitudeInput = document.querySelector('input[id="longitude"]');
const lookupButton = document.getElementById("lookupButton");
const currentButton = document.getElementById("currentButton");
const resetAddress = document.getElementById("resetAddress");
const markerList = document.querySelectorAll(".marker-card");
const mapContainer = document.querySelector('#myMap');
const markerLinks = document.querySelectorAll('#marker-link');

let map;
let infobox;
let searchManager;
let dataReturn = [];
let stringPathName;

//Initalize map for page load
function GetMap() {

    //Create new map object
    let map = new Microsoft.Maps.Map('#myMap', {
        center: new Microsoft.Maps.Location(37, -20),
        zoom: 3
    });

    //Initalize infobox
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
        visible: false,
    });
    infobox.setMap(map);

    //Function to get Marker Data JSON from Model and use it to populate map
    GetMarkerData(map);

    //Initalize map functions based on page
    stringPathName = window.location.pathname;
    if (stringPathName.includes("Details") || stringPathName.includes("Edit") || stringPathName.includes("Delete")) {
        let latitude = document.getElementById("latitude").innerText;
        let longitude = document.getElementById("longitude").innerText;
        map.setView({
            center: new Microsoft.Maps.Location(latitude, longitude),
            zoom: 17
        });
    };

    //Map Click Handler
    Microsoft.Maps.Events.addHandler(map, 'click', function (event) {
        stringPathName = window.location.pathname;
        if (event.targetType == "map") {
            if (stringPathName == "/Markers/Create") {
                CreateMarkerMapClick(event, map);
            };
        };
    });

    //Delete last marker button Listener
    resetAddress.addEventListener('click', function () {
        DeleteLastMarker(map);
    });

    //Current location button listener
    currentButton.addEventListener('click', function () {
        CurrentLocation(map);
    });

    //Reverse Geocode button
    lookupButton.addEventListener('click', function () {
        ReverseGeoCode(map);
    });

    //Function for address box auto suggest correct address

    Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
        let options = {
            maxResults: 4,
            map: map
        };
        let manager = new Microsoft.Maps.AutosuggestManager(options);
        manager.attachAutosuggest('#address', '#searchBoxContainer', selectedSuggestion);
    });

    function selectedSuggestion(suggestionResult) {
        map.setView({ bounds: suggestionResult.bestView });
        CreateMarker(suggestionResult.location, map);
        latitudeInput.value = suggestionResult.location.latitude;
        longitudeInput.value = suggestionResult.location.longitude;
    };
};


//Function to drop new marker
function CreateMarker(location, map) {
    let pushpin = new Microsoft.Maps.Pushpin(location);
    pushpin.setOptions({ color: 'red' });
    map.entities.push(pushpin);

    //Create page marker click handler
    Microsoft.Maps.Events.addHandler(pushpin, 'click', function (e) {
        for (let i = map.entities.getLength() - 1; i >= 0; i--) {
            let pushpin = map.entities.get(i);
            if (pushpin == e.target) {
                map.entities.remove(pushpin);
                ClearInput();
            };
        };
    });
};

//Function to drop marker on map click
function CreateMarkerMapClick(event, map) {
    //Send marker info to marker function
    CreateMarker(event.location, map);
    //Set input boxes to coordinates values
    latitudeInput.value = event.location.latitude;
    longitudeInput.value = event.location.longitude;
};

//Function for reset button
function DeleteLastMarker(map) {
    //reset coordinates and address input and remove last marker
    ClearInput();
    map.entities.pop();
};

//Function for currentLocation button
function CurrentLocation(map) {
    navigator.geolocation.getCurrentPosition(function (position) {
        let loc = new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude);
        //Add a pushpin at the user's location.
        CreateMarker(loc, map);
        //Center the map on the user's location.
        map.setView({ center: loc, zoom: 15 });
        //Inject values into input boxes
        latitudeInput.value = position.coords.latitude;
        longitudeInput.value = position.coords.longitude;
    });
};

//Function for Reverse Geocode button
function ReverseGeoCode(map) {
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
};

//Infobox function
function ShowInfoBox(e, map) {
    let closeButton = '<a href="javascript:CloseInfobox()" class="infobox-close">X</a>';
    if (e.target === undefined) {
        let location = new Microsoft.Maps.Location(e.geometry.y, e.geometry.x);
        infobox.setOptions({
            htmlContent: `<div class="vstack infobox shadow-sm bg-white rounded-3 p-2"><div class="text-blue fs-6 fw-bold mb-1">${e.metadata.title}</div><div class="mb-2">${e.metadata.description}</div><div><a class="text-decoration-none fs-6" href="/Markers/Details/${e.metadata.id}">View Marker</a></div></div>${closeButton}`,
            location: location,
            visible: true
        });
    } else if (e.target !== undefined) {
        let location = new Microsoft.Maps.Location(e.target.geometry.y, e.target.geometry.x);
        infobox.setOptions({
            htmlContent: `<div class="vstack infobox shadow-sm bg-white rounded-3 p-2"><div class="text-blue fs-6 fw-bold mb-1">${e.target.metadata.title}</div><div class="mb-2">${e.target.metadata.description}</div><div><a class="text-decoration-none fs-6" href="/Markers/Details/${e.target.metadata.id}">View Marker</a></div></div>${closeButton}`,
            location: location,
            visible: true
        });
    };
    infobox.setMap(map);
}

//Close infobox function
function CloseInfobox() {
    infobox.setOptions({ visible: false });
}

//Function to get marker data from Model as JSON
function GetMarkerData(map, callback) {
    let XHR = new XMLHttpRequest();
    let category = window.location.search;
    if (category[1] == undefined) {
        XHR.open("GET", `/Markers/GetMarkerData`);
    } else {
        XHR.open("GET", `/Markers/GetMarkerData${category}`);
    }
    XHR.send();
    XHR.addEventListener("readystatechange", function () {
        if ((XHR.status == 200) && (XHR.readyState == 4)) {
            let parsedMarkerData = JSON.parse(XHR.responseText);
            PopulateMarkers(parsedMarkerData, map);  //When data is received PopulateMarkers
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
            description: `${parsedMarkerData[item].description}`,
            id: `${parsedMarkerData[item].markerId}`
        };
        pushpin.setOptions({ color: '#0778ff' });

        //Add the marker to the map entities for control
        map.entities.push(pushpin);

        //Event listener for Marker mouseover and mouseout
        Microsoft.Maps.Events.addHandler(pushpin, 'mouseover', function (e) {
            for (let i = map.entities.getLength() - 1; i >= 0; i--) {
                let pushpin = map.entities.get(i);
                if (pushpin == e.target) {
                    if (markerList.length !== 0) {
                        markerList[i].classList.add("bg-lightorange");
                        markerList[i].scrollIntoView({ block: 'nearest' });
                    };
                    ShowInfoBox(e, map);
                    pushpin.setOptions({ color: '#ff0000' });
                };
            };
        });

        Microsoft.Maps.Events.addHandler(pushpin, 'click', function (e) {
            for (let i = map.entities.getLength() - 1; i >= 0; i--) {
                let pushpin = map.entities.get(i);
                if (pushpin == e.target) {
                    if (markerList.length !== 0) {
                        markerList[i].classList.add("bg-lightorange");
                        markerList[i].scrollIntoView({ block: 'nearest' });
                    };
                    ShowInfoBox(e, map, pushpin);
                };
            };
        });

        Microsoft.Maps.Events.addHandler(pushpin, 'mouseout', function (e) {
            for (let i = map.entities.getLength() - 1; i >= 0; i--) {
                let pushpin = map.entities.get(i);
                if (pushpin == e.target) {
                    if (markerList.length !== 0) {
                        markerList[i].classList.remove("bg-lightorange");
                    };
                    pushpin.setOptions({ color: '#0778ff' });
                    CloseInfobox();
                };
            };
        });

        //Event listeners for the Marker list items to focus on the right marker on the map
        for (let k = 0; k < markerList.length; k++) {
            markerList[k].addEventListener("mouseover", function () {
                markerList[k].classList.add("bg-lightorange");
                let pushpinCurrent = map.entities.get(k);
                pushpinCurrent.setOptions({ color: '#ff0000' });
                map.setView({
                    center: new Microsoft.Maps.Location(pushpinCurrent.geometry.y, pushpinCurrent.geometry.x),
                    zoom: 15
                });
                ShowInfoBox(map.entities.get(k), map);
            });

            markerList[k].addEventListener("mouseout", function () {
                markerList[k].classList.remove("bg-lightorange");
                let pushpinCurrent = map.entities.get(k);
                pushpinCurrent.setOptions({ color: '#0778ff' });
                CloseInfobox();
            });
        };
    };
};

//Clear text inputs
function ClearInput() {
    latitudeInput.value = "";
    longitudeInput.value = "";
    address.value = "";
};

window.addEventListener('resize', function () {
    const sidebar = document.querySelector(".sidebar");
    if (window.innerWidth > 575) {
        if (!sidebar.classList.contains('show')) {
            sidebar.classList.add('show');
        };
    };
});

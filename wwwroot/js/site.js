// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

const latitudeInput = document.querySelector('input[id="latitude"]');
const longitudeInput = document.querySelector('input[id="longitude"]');
const titleInput = document.querySelector('input[id="title"');
let map;
let searchManager;

function GetMap() {
    var map = new Microsoft.Maps.Map('#myMap');
    
    Microsoft.Maps.Events.addHandler(map, 'click', function (e) {
        console.log(e.location);
        var stringPathName = window.location.pathname
        console.log(stringPathName);
        if (e.targetType == "map") {

            if (stringPathName == "/Markers" || stringPathName == "/Markers/Create" ) { 
            //Get map unit x,y
            var point = new Microsoft.Maps.Point(e.getX(), e.getY());

            //Convert map point to location
            var location = e.target.tryPixelToLocation(point);

            var pushpin = new Microsoft.Maps.Pushpin(e.location);

            if (map.entities.getLength() > 0) {
                titleInput.focus();
                return;
            } else
            {
                map.entities.push(pushpin);

                latitudeInput.value = location.latitude;
                longitudeInput.value = location.longitude;

                titleInput.focus();

                Microsoft.Maps.Events.addHandler(pushpin, 'click', function () {
               
                    for (var i = map.entities.getLength() - 1; i >= 0; i--) {
                        var pushpin = map.entities.get(i);
                        if (pushpin instanceof Microsoft.Maps.Pushpin) {
                            map.entities.remove(pushpin);
                        }
                    }
                })
            }

            }
        }
    });
}
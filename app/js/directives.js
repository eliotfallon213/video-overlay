'use strict';

/* Directives */
angular.module('LimeApp.directives', []).
        directive('headtool', ['$location', '$rootScope', function($location, $rootScope) {
        var linker = function(scope, element, attr) {

            function setupCanvas(map, imageURL, width, height) {

                if (map && width>0 && height>0) {
                    element.html("");
                    map.paper = Raphael("mapHolder");

                    //Make image full size - so matches images sizes
                    map.profileImage = map.paper.image(imageURL, 0, 0, width, height);
                    //

                    map.mapCentre = {"xCoord": width / 2, "yCoord": height / 2};
                    scope.draggedAmount = {"xCoord": 0, "yCoord": 0};
                    map.profileImage.drag(
                            function(diffx, diffy) {
                                scope.draggedAmount.yCoord = diffy;
                                scope.draggedAmount.xCoord = diffx;
                                scope.$digest();
                            },
                            function() {
                            },
                            function(event) {
                                map.profileDisplacement.xCoord = map.profileDisplacement.xCoord + scope.draggedAmount.xCoord;
                                map.profileDisplacement.yCoord = map.profileDisplacement.yCoord + scope.draggedAmount.yCoord;
                            }
                    );

                    map.cropBox = map.paper.rect(map.mapCentre.xCoord - 70, map.mapCentre.yCoord - 103, 140, 205).attr({stroke: "#000", "stroke-width": 2, "stroke-linejoin": "round"});
                    map.topFace = map.paper.circle(map.mapCentre.xCoord, map.mapCentre.yCoord - 33, 70).attr({stroke: "#000", "stroke-width": 2, "stroke-linejoin": "round"});
                    map.bottomFace = map.paper.circle(map.mapCentre.xCoord, map.mapCentre.yCoord + 37, 65).attr({stroke: "#000", "stroke-width": 2, "stroke-linejoin": "round"});

                    map.paper.setSize(width, height);

                    // Make box offset to centre around black box.
                    map.paper.setViewBox(map.mapCentre.xCoord - 200, map.mapCentre.yCoord - 200, 400, 400, false);
                    //
                }
            }

            //REDRAW MAP IS TRIGGERED FOR EACH INSTANCE OF IT (3 times)
            scope.$watch('headObject.imageURL', function(newValue, oldValue) {
                if (typeof scope.headObject !== "undefined") {
                    setupCanvas(scope.headObject.map, newValue, scope.headObject.imageWidth, scope.headObject.imageHeight);
                }
            });

            $rootScope.$on('redrawCanvas', function(event, imageURL, currentHeadID) {
                var img = new Image();
                img.src = imageURL;
                if (typeof scope.headObject !== "undefined" && scope.headObject.headID == currentHeadID) {
                    setupCanvas(scope.headObject.map, imageURL, img.width, img.height);
                }
            });

            //WATCH NOW NEEDS TO WATCH CURRENT HEAD'S DETAILS RATHER THAN JUST ONE STRAIGHT ON THE SCOPE
            scope.$watch("draggedAmount", function(newValue, oldValue) {
                if (typeof scope.headObject !== "undefined") {
                    var draggedMap = scope.headObject.map;
                    if (typeof newValue === "undefined") {
                        newValue = 0;
                    }
                    if (typeof draggedMap.profileDisplacement === "undefined") {
                        draggedMap.profileDisplacement = {};
                        draggedMap.profileDisplacement.xCoord = draggedMap.profileDisplacement.yCoord = 0;
                    }
                    var panning = {};
                    panning.xCoord = draggedMap.profileDisplacement.xCoord + newValue.xCoord;
                    panning.yCoord = draggedMap.profileDisplacement.yCoord + newValue.yCoord;
                    performTransforms(panning, scope.headObject.rotationAmount, scope.headObject.zoomLevel);
                }
            }, true);


            scope.$watch("headObject.zoomLevel", function(newValue, oldValue) {
                if (typeof scope.headObject !== "undefined") {
                    if (typeof newValue === "undefined") {
                        newValue = 0.5;
                    }
                    performTransforms(scope.headObject.map.profileDisplacement, scope.headObject.rotationAmount, newValue);
                }
            }, true);

            scope.$watch("headObject.rotationAmount", function(newValue, oldValue) {
                if (typeof scope.headObject !== "undefined") {
                    if (typeof newValue === "undefined") {
                        newValue = 0.5;
                    }
                    performTransforms(scope.headObject.map.profileDisplacement, newValue, scope.headObject.zoomLevel);
                }
            }, true);

            function performTransforms(panning, rotation, zoom) {
                var transformedMap = scope.headObject.map;
                scope.headObject.actualZoom = zoom * 2;
                scope.headObject.rotationDegs = (rotation - 0.5) * 360;
                if (typeof transformedMap.profileImage !== "undefined") {
                    transformedMap.profileImage.transform("t" + panning.xCoord + ", " + panning.yCoord + "r" + scope.headObject.rotationDegs + "s" + scope.headObject.actualZoom);
                }
            }

        };
        return {
            restrict: 'A',
            replace: true,
            scope: {headObject: "=headtool"},
            template: '<div id="mapHolder"></div>',
            link: linker
        };
    }]).
        directive("inputSlider", ["$rootScope", function($rootScope) {
        var linker = function(scope, element, attr) {

            //creates HTML '<div class="slider-container"><div class="slider-below"></div><div class="slider-knob"></div></div>';
            var drag = false;
            var dragBG = false;
            var sliderContainer = document.createElement("div");
            sliderContainer.style.position = "absolute";
            sliderContainer.style.top = "0";
            sliderContainer.style.left = "0";
            sliderContainer.style.width = "100%";
            sliderContainer.style.height = "100%";
            sliderContainer.className = "slider-inner";

            var sliderBelow = document.createElement("div");
            sliderBelow.style.position = "absolute";
            sliderBelow.style.top = "0";
            sliderBelow.style.left = "0";
            sliderBelow.style.width = (attr.sliderInit * 100) + "%";
            sliderBelow.style.height = "100%";
            sliderBelow.className = "slider-inner-left";

            var sliderKnob = document.createElement("div");
            sliderKnob.style.position = "absolute";
            sliderKnob.style.top = "0";
            sliderKnob.style.left = (attr.sliderInit * 100) + "%";
            sliderKnob.style.width = "20px";
            sliderKnob.style.marginLeft = "-10px";
            sliderKnob.style.marginTop = "-3px";
            sliderKnob.style.height = "30px";
            sliderKnob.className = "slider-inner-button";

            sliderContainer.appendChild(sliderBelow);
            sliderContainer.appendChild(sliderKnob);

            element.css("position", "relative");
            element.append(sliderContainer);

            element.bind("mousedown", function(event) {
                var sliderPosition = event.clientX - sliderContainer.getBoundingClientRect().left;
                var outputSetting = sliderPosition / sliderContainer.clientWidth;
                //volume setting is this as percentage of width.
                setOutput(outputSetting);
                event.preventDefault();
                drag = true;
            });

            element.bind("mousemove", function(event) {
                var event = event || window.event;
                if (drag) {
                    var sliderPosition = event.clientX - sliderContainer.getBoundingClientRect().left;
                    var outputSetting = sliderPosition / sliderContainer.clientWidth;
                    //volume setting is this as percentage of width.
                    setOutput(outputSetting);
                    //broadcast volume change into controller
                }
            });

            element.bind("mouseup", function(event) {
                var event = event || window.event;
                if (drag) {
                    var sliderPosition = event.clientX - sliderContainer.getBoundingClientRect().left;
                    var outputSetting = sliderPosition / sliderContainer.clientWidth;
                    drag = false;
                    setOutput(outputSetting);
                }
            });

            document.onmouseup = function(event) {
                drag = false;
            };

            //
            sliderKnob.onmousedown = function(event) {
                drag = true;
            };

            sliderKnob.onmousemove = function(event) {
                var event = event || window.event;
                if (drag) {
                    var sliderPosition = event.clientX - sliderContainer.getBoundingClientRect().left;
                    var outputSetting = sliderPosition / sliderContainer.clientWidth;
                    //volume setting is this as percentage of width.
                    setOutput(outputSetting);
                    //broadcast volume change into controller
                }
            };

            sliderKnob.onmouseup = function(event) {
                var event = event || window.event;
                if (drag) {
                    var sliderPosition = event.clientX - sliderContainer.getBoundingClientRect().left;
                    var outputSetting = sliderPosition / sliderContainer.clientWidth;
                    drag = false;
                    setOutput(outputSetting);
                }
            };

            function setOutput(newSetting) {
                if (newSetting > 1)
                    newSetting = 1;
                if (newSetting < 0)
                    newSetting = 0;
                sliderKnob.style.left = (newSetting * 100) + "%";
                sliderBelow.style.width = (newSetting * 100) + "%";

                if (!$rootScope.$$phase) {
                    scope.$apply(function() {
                        scope.output = newSetting;
                    });
                } else {
                    scope.output = newSetting;
                }
            }
            ;

//        scope.$watch(scope.output, function(newValue, oldValue) {
//            console.log("externally changed");
//            if (typeof newValue !== "undefined")
//                setOutput(newValue);
//        }, true);

            $rootScope.$on('resetSliders', function() {
                setOutput(0.5);
            });

            setOutput(scope.output);

        };
        return {
            restrict: 'A',
            link: linker,
            scope: {output: "=sliderModel"}
        }
    }]).
        directive("showOnlyDiv", function() {
    var linker = function(scope, element, attr) {

        scope.$watch(attr.showOnlyDiv, function(newValue, oldValue) {

            angular.element(element).children().each(function() {
                if (angular.element(this).is(":visible")) {
                    angular.element(this).fadeOut(300, function() {
                        var count = 0;
                        angular.element(element).children().each(function() {
                            if (count == newValue) {
                                angular.element(this).fadeIn();
                            }
                            count++;
                        });
                    });
                }
            });

        });
    };
    return {
        restrict: 'A',
        link: linker
    }
}).
    directive("addThis", function() {
        var linker = function(scope, element, attr) {
        scope.$watch("videoDetails.share", function(newValue, oldValue) {
            if (typeof newValue !== 'undefined') {
                var svcs = {
                    facebook: {
                        name: 'Facebook',
                        image: "img/addThis/facebook.png"
                    },
                    twitter: {
                        name: 'Twitter',
                        image: "img/addThis/twitter.png"
                    },
                    email: {
                        name: 'E-mail',
                        image: "img/addThis/email.png"
                    },
                    compact: {
                        name: 'Add This',
                        image: "img/addThis/addthis_64.png"
                    }
                };

                var tbxHTML = "";

                for (var s in svcs) {
                    tbxHTML += '<a class="addthis_button_' + s + '" ><img src="' + svcs[s]["image"] + '" width="64" height="64" alt="Share to ' + svcs[s]["name"] + '" /></a>';
                }

                element.html(tbxHTML);
                addthis.toolbox("#toolbox", {}, {url: "http://www.limesplash.dev/app/viewVideo?videoId=" + scope.videoDetails.share, title: "Fear of missing out? #FOMO", templates: {twitter: '{{title}} at {{url}}'}});

            }
        });

    };
    return {
        restrict: 'A',
        link: linker
    }
}).
        directive("unUsed", function() {
    var linker = function(scope, element, attr) {




    };
    return {
        restrict: 'A',
        link: linker,
        templateURL: "/partials/headTool.html"
    }
});

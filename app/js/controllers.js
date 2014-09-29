'use strict';

/* Controllers */
function HomeCtrl($scope, Facebook) {
    $scope.user = Facebook.likedPage(FB, 546783362077418).then(function(data) {
        if (data) {
            $scope.includeTemp = "partials/sub-includes/liked.html"
        } else {
            $scope.includeTemp = "partials/sub-includes/preLike.html"
        }
    });

}

function VideoSelectionCtrl($scope, $location, VideoDetails, Facebook, Albums, Heads) {
    $scope.videoDetails = VideoDetails;
    $scope.albums = Albums;

    $scope.videoDetails.facebookID = "";

    $scope.user = Facebook.getUser(FB).then(function(data) {
        $scope.videoDetails.facebookID = data.id;
        $scope.albums.FBAlbums = Facebook.getAlbums(FB, data.id);
    });

    Heads.getVideos(
            function(data) {
                $scope.videos = data.stockVideos;
            },
            function() {
                console.log("Error retrieving stock videos")
            }
    );

    $scope.previewVideo = function(video) {
        $.colorbox({html: "<div id=\"player_preview\"></div>", width: "522px", height: "342px", open: true});
        projekktor(
                '#player_preview',
                {
                    controls: true,
                    autoplay: true,
                    volume: 0.5,
                    height: 480,
                    width: 640,
                    playlist: [
                        {
                            0: {src: "/JimBeamAPI/stockVideos/" + video.videoDir + "/unedited.mp4", type: 'video/mp4'},
                            1: {src: "/JimBeamAPI/createdVideos/" + video.videoDir + "/unedited.ogv", type: 'video/ogv'},
                            config: {
                                disablePause: true,
                                disallowSkip: true,
                                playerFlashMP4: "/app/js/projekktor/jarisplayer.swf"
                            }
                        }]
                });
    }

    $scope.selectVideo = function(selectedVideo) {
        $scope.videoDetails.vidSelection = selectedVideo.videoDir;
        console.log($scope.videoDetails.vidSelection);
        $scope.videoDetails.heads = new Array();
        for (var i = 0; i < selectedVideo.heads; i++) {
            $scope.videoDetails.heads.push({headID: i, imageURL: "", zoomLevel: 0.5, rotationAmount: 0.5, imageFile: "", map: {}});
        }
        $location.path('/headTool/0');
    };

}

function HeadToolCtrl($scope, $location, $routeParams, $rootScope, Heads, VideoDetails, Facebook, Albums) {

    $scope.videoDetails = VideoDetails;
    $scope.albums = Albums.FBAlbums;
    $scope.createdHeads = new Array();
    Heads.getHeads({FBID: $scope.videoDetails.facebookID},
    function(data) {
        $scope.preCreatedHeads = data.heads;
    },
            function() {
                console.log("Error retrieving pre made heads")
            }
    );

    $scope.currentHeadID = $routeParams.headID;
    $scope.head = $scope.videoDetails.heads[$scope.currentHeadID];
    if (typeof $scope.head === "undefined")
        $location.path('/videoSelection');
    $scope.selectAlbum = function(albumID) {
        $scope.selectedAlbum = albumID;
        $scope.photos = Facebook.getPhotos(FB, albumID);
    };

    if (typeof $scope.head !== "undefined" && $scope.head.imageURL != "") {
        $rootScope.$broadcast('redrawCanvas', $scope.head.imageURL, $scope.head.headID);
    }

    $scope.$watch("photos", function(newValue, oldValue) {
        if (typeof newValue !== "undefined") {
            console.log(newValue);
        }
    });

    $scope.selectPhoto = function(photo) {
        if (photo.images.length > 0) {
            for (var i = 0; i < photo.images.length; i++) {
                if (photo.images[i].height <= 700)
                    break;
            }
            $scope.head.imageHeight = photo.images[i].height;
            $scope.head.imageWidth = photo.images[i].width;
            $scope.head.imageURL = photo.images[i].source;
        } else {
            $scope.head.imageURL = photo.source;
        }

    };

    $scope.reset = function(headID) {
        $scope.head.zoomLevel = 0.5;
        $scope.head.rotationAmount = 0.5;
        $scope.head.map.profileDisplacement.xCoord = $scope.head.map.profileDisplacement.yCoord = 0;
        $rootScope.$broadcast('resetSliders');
    };

    $scope.goBack = function() {
        if ($scope.head.imageURL != "") {
            $scope.head.imageURL = "";
            return;
        }
        if ($scope.selectedAlbum) {
            $scope.selectedAlbum = false;
            return;
        }
        $location.path('/videoSelection');
    };

    $scope.readyToCreate = false;

    $scope.saveCurrentFace = function(headID) {
        $scope.createdHead = Heads.createHead(
                {"FBID": $scope.videoDetails.facebookID},
        {"imageURL": $scope.videoDetails.heads[headID].imageURL, "scale": $scope.videoDetails.heads[headID].zoomLevel * 2, "rotate": $scope.videoDetails.heads[headID].rotationDegs, "offsetX": $scope.videoDetails.heads[headID].map.profileDisplacement.xCoord, "offsetY": $scope.videoDetails.heads[headID].map.profileDisplacement.yCoord},
        function(headInfo) {
            $scope.videoDetails.heads[headID].imageFile = headInfo[0].imageFile;
            $scope.videoDetails.heads[headID].saved = true;
            $scope.createdHeads[headID] = headInfo[0].imageFile;
            if ($scope.createdHeads.length == $scope.videoDetails.heads.length)
                $scope.readyToCreate = true;
        },
                function(error) {
                    console.log(error);
                }
        );
    };

    $scope.selectPreFace = function(headID, preHeadID) {
        var pos;
        for (var i = 0; i < $scope.preCreatedHeads.length; i++) {
            if ($scope.preCreatedHeads[i].id == preHeadID) {
                $scope.videoDetails.heads[headID].imageFile = $scope.preCreatedHeads[i].imageFile;
                pos = i;
            }
        }
        $scope.videoDetails.heads[headID].saved = true;
        $scope.createdHeads[headID] = $scope.preCreatedHeads[pos].imageFile;
        if ($scope.createdHeads.length == $scope.videoDetails.heads.length)
            $scope.readyToCreate = true;
    };

    $scope.createVideo = function() {

        $scope.heads = Heads.createVideo(
            {"FBID": $scope.videoDetails.facebookID},
            {"selectedHeads": $scope.createdHeads, "selectedVideo": $scope.videoDetails.vidSelection},
            function(vidInfo) {
                console.log(vidInfo);
                $scope.videoDetails.videoCreated = vidInfo[0].videoDir;
                $scope.videoDetails.share = vidInfo[0].share;
            },
            function(error) {
                console.log(error);
            }
        );
    }

}

function UserDetailsCtrl($scope, $location, Heads, VideoDetails) {
    $scope.videoDetails = VideoDetails;
    $scope.loading = true;
    
    $scope.master = {};

    $scope.update = function(user) {
        $scope.master = angular.copy(user);
        $scope.videoDetails.userDetails = angular.copy(user);
        Heads.createUserDetails({"FBID": $scope.videoDetails.facebookID},
            {"user": $scope.videoDetails.userDetails},
            function(data) {
                $location.path('/viewVideo');
            },
            function() {
                console.log("Error sending user.")
            }
        );
        
    };

    $scope.reset = function() {
        $scope.user = angular.copy($scope.master);
    };

    $scope.isUnchanged = function(user) {
        return angular.equals(user, $scope.master);
    };

    $scope.reset();
    
    Heads.getUserDetails({FBID: $scope.videoDetails.facebookID},
        function(data) {
            $scope.prevUser = data.userExists;
            $scope.loading = false;
        },
        function() {
            console.log("Error retrieving whether user exists")
        }
    );
}

function ViewVideoCtrl($scope, VideoDetails, Heads) {
    $scope.videoDetails = VideoDetails;
    $scope.loading = true;

    //Add in facility to view other videos from here
    //MD5 scramble in URL??
    var $_GET = {};
    document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
    function decode(s) {
        return decodeURIComponent(s.split("+").join(" "));
    }

    $_GET[decode(arguments[1])] = decode(arguments[2]);
    });
    
    if(typeof($_GET) !== "undefined" && $_GET.hasOwnProperty("videoId")) {
        $scope.videoDetails.share = $_GET.videoId;
        console.log($_GET.videoId);
        //GET request to retrive $scope.videoDetails.videoCreated =
        Heads.getSharedVideo({"FBID": $_GET.videoId},
            function(data) {
                console.log(data);
                $scope.videoDetails.videoCreated = data.videoDir;
            },
            function() {
                console.log("Error getting shared video.")
            }
        );
    }
    //

    $scope.$watch("videoDetails.videoCreated", function(newValue, oldValue) {

        if (typeof newValue !== "undefined") {
            $scope.loading = false;
            projekktor(
                    '#player_a',
                    {
                        controls: true,
                        autoplay: true,
                        volume: 0.5,
                        height: 480,
                        width: 640,
                        playlist: [
                            {
                                0: {src: "/JimBeamAPI/createdVideos/" + newValue + '/out.mp4', type: 'video/mp4'},
                                1: {src: "/JimBeamAPI/createdVideos/" + newValue + '/out.ogv', type: 'video/ogv'},
                                config: {
                                    disablePause: true,
                                    disallowSkip: true,
                                    playerFlashMP4: "/app/js/projekktor/jarisplayer.swf"
                                }
                            }]
                    });
        }

    }, true);
}
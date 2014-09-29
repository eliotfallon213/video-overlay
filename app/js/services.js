'use strict';

/* Services */

angular.module('LimeApp.services', ['ngResource']).
        value('version', '0.1').
        factory('Heads', function($resource) {
    return $resource('/jim-beam/JimBeamAPI/:callID/:FBID', {}, {
        createHead: {method: 'POST', params: {callID: 'head'}, isArray: true},
        getHeads: {method: 'GET', params: {callID: 'head'}},
        createUserDetails: {method: 'POST', params: {callID: 'user'}},
        getUserDetails: {method: 'GET', params: {callID: 'user'}},
        createVideo: {method: 'POST', params: {callID: 'video'}, isArray: true},
        getVideos: {method: 'GET', params: {callID: 'video'}},
        getSharedVideo: {method: 'GET', params: {callID: 'share'}}
    });
}).
        factory('VideoDetails', function() {
    return {
        heads: []
    };
}).
        factory('Albums', function() {
    return {
        albums: {}
    };
}).
    service('Facebook', function($q, $rootScope) {
  
  // resolving or rejecting a promise from a third-party
  // API such as Facebook must be
  // performed within $apply so that watchers get
  // notified of the change
  var resolve = function(errval, retval, deferred) {
    $rootScope.$apply(function() {
      if (errval) {
        deferred.reject(errval);
      } else {
        retval.connected = true;
        deferred.resolve(retval);
      }
    });
  }
    
  return {
     likedPage: function(FB, pageID) {
      var deferred = $q.defer();
      FB.getLoginStatus(function(response) {
        if (response.status == 'connected') {
          FB.api('/me?fields=id,name,likes.target_id('+pageID+')', function(response) {
              if(response.hasOwnProperty("likes") && response.likes.data.length>0) {
                resolve(null, true, deferred);
              } else {
                 resolve(null, false, deferred); 
              }
          });
        } else if (response.status == 'not_authorized') {
          FB.login(function(response) {
            if (response.authResponse) {
              FB.api('/me', function(response) {
                if(response.hasOwnProperty("likes") && response.likes.data.length>0) {
                    resolve(null, true, deferred);
                } else {
                    resolve(null, false, deferred); 
                }
              });
            } else {
              resolve(response.error, null, deferred);
            }
          }, {perms: "user_photos"});
        } 
      });
      var promise = deferred.promise;
      promise.connected = false;
      return promise;
    },
    getUser: function(FB) {
      var deferred = $q.defer();
      FB.getLoginStatus(function(response) {
        if (response.status == 'connected') {
          FB.api('/me', function(response) {
            resolve(null, response, deferred);
          });
        } else if (response.status == 'not_authorized') {
          FB.login(function(response) {
            if (response.authResponse) {
              FB.api('/me', function(response) {
                resolve(null, response, deferred);
                
              });
            } else {
              resolve(response.error, null, deferred);
            }
          }, {perms: "user_photos"});
        } 
      });
      var promise = deferred.promise;
      promise.connected = false;
      return promise;
    },
    getAlbums: function(FB, FBID) {
      var deferred = $q.defer();
      FB.getLoginStatus(function(response) {
        if (response.status == 'connected') {
          FB.api('/'+FBID+"?fields=albums", function(response) {
            resolve(null, response, deferred);
          });
        } else if (response.status == 'not_authorized') {
          FB.login(function(response) {
            if (response.authResponse) {
              FB.api('/'+FBID+"?fields=albums", function(response) {
                resolve(null, response, deferred);
              });
            } else {
              resolve(response.error, null, deferred);
            }
          });
        } 
      });
      var promise = deferred.promise;
      promise.connected = false;
      return promise;
    },
    getPhotos: function(FB, AlbumID) {
      var deferred = $q.defer();
      FB.getLoginStatus(function(response) {
        if (response.status == 'connected') {
          FB.api('/'+AlbumID+"/photos", function(response) {
            resolve(null, response, deferred);
          });
        } else if (response.status == 'not_authorized') {
          FB.login(function(response) {
            if (response.authResponse) {
              FB.api('/'+AlbumID+"/photos", function(response) {
                resolve(null, response, deferred);
              });
            } else {
              resolve(response.error, null, deferred);
            }
          });
        } 
      });
      var promise = deferred.promise;
      promise.connected = false;
      return promise;
    }
  }; 
});

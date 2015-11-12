//small fuction to prevent overscoll in full screen view
//if need to have an element scoll add the class .scroll
/*$('body').on('touchmove', function (e) {
    if (!$('.scroll').has($(e.target)).length || !$('.scroll').children.has($(e.target)).length)
        e.preventDefault();
});*/

document.body.addEventListener('touchmove',function(event){
  event.preventDefault();
});

//moment.js initialization
moment.locale('en');

//angular.js module initialization

var app = angular.module('CalendarApp', ['ngRoute', 'ngTouch', 'ngCookies']);

//configuring routeProvider

app.config(['$routeProvider',function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'tmp/bootstrap.html',
    controller: 'SetCtrl'
  }).when('/main', {
    templateUrl: 'tmp/main.html',
    controller: 'MainCtrl'
  }).when('/inside', {
    templateUrl: 'tmp/inside.html',
    controller: 'InsideCtrl'
  }).when('/admin', {
    templateUrl: 'tmp/admin.html',
    controller: 'AdminCtrl'
  }).when('/book', {
    templateUrl: 'tmp/book.html',
    controller: 'BookCtrl'
  }).otherwise({
    redirectTo: '/'
  });
}]);

app.service('UpdateService',['$http', '$interval', '$rootScope', function($http, $interval, $rootScope) {
      var devicesData = {};
      var calendarsData = {};
      var eventsData = {};
      var currentDevice = {};

      //////logic to manage the quick book instant update of the main interface/////
      /////////////////////////////////////////////////////////////////////////////

      var newLocalEvent = null;

      this.getNewLocalEvent = function () {
        var ret = newLocalEvent;
        newLocalEvent = null;
        return ret;
      };

      this.setNewLocalEvent = function (obj) {
        newLocalEvent = obj;
      }

      ////////////////////////////////////////////////////////////////////////////

      this.devicesUpdate = function() { $interval(function() {
        console.log("devicesUpdate firing");
        $http.get('js/data.json', {
          cache: false,
          timeout: 3000
        }).success(function(data) {
          if (angular.toJson(devicesData) != angular.toJson(data)) {
            console.log("devices old data"+angular.toJson(devicesData));
            console.log("devices new data"+angular.toJson(data));
            devicesData = data;
            $rootScope.$emit('devices-change-event');
          }
        });
      }, 1000);};

      this.calendarsUpdate = function() {
        console.log("calendarsUpdate firing");
        $http.get('php/listCalendar.php').success(function(data) {
          if (angular.toJson(calendarsData) != angular.toJson(data)) {
            console.log("calendars old data"+angular.toJson(calendarsData));
            console.log("calendars new data"+angular.toJson(data));
            calendarsData = data;
            $rootScope.$emit('calendars-change-event');
          }
        });
      };

      this.eventsUpdate = function() { $interval(function() {
        console.log("eventsUpdate firing");
        $http.get('php/list.php').success(function(data) {
          if (angular.toJson(eventsData) != angular.toJson(data)) {
            console.log("events old data"+angular.toJson(eventsData));
            console.log("events new data"+angular.toJson(data));
            eventsData = data;
            $rootScope.$emit('events-change-event');
          }
        });
      }, 1000);};

      this.onDeviceChange = function(scope, callback) {
        var handler = $rootScope.$on('devices-change-event', callback);
        scope.$on('$destroy', handler);
      };

      this.onCalendarsChange = function(scope, callback) {
        var handler = $rootScope.$on('calendars-change-event', callback);
        scope.$on('$destroy', handler);
      };
      this.onEventsChange = function(scope, callback) {
        var handler = $rootScope.$on('events-change-event', callback);
        scope.$on('$destroy', handler);
      };

      this.getDevices = function() {
        return devicesData;
      };

      this.getCurrentDevice = function(cookie) {
        if (cookie != null) {
          currentDevice = devicesData.filter(function(some) {
              return some.deviceid == cookie ;
            });
            return currentDevice;
          } else {
            return null;
          }
        };

        this.getCalendars = function() {
          return calendarsData;
        };

        this.getEvents = function() {
          return eventsData;
        };

      }]);

      app.run(['UpdateService', function(UpdateService){
        UpdateService.devicesUpdate();
        UpdateService.eventsUpdate();
        UpdateService.calendarsUpdate();
      }]);

    app.controller('MainCtrl', ['$scope', '$cookies', '$location', 'UpdateService', '$interval', '$http', function mainctrl($scope, $cookies, $location, UpdateService, $interval, $http) {
      $scope.device = null;
      $scope.untilnext = 0;
      $scope.state = {};
      $scope.main = {};
      $scope.list = [];

      var fullState = {
        "color": "blue",
        "startButton": false,
        "stopButton": false,
        "quickBook": true
      };
      var freeState = {
        "color": "green",
        "startButton": true,
        "stopButton": true,
        "quickBook": false
      };
      var incomingState = {
        "color": "green",
        "startButton": true,
        "stopButton": true,
        "quickBook": true
      };
      var busyState = {
        "color": "red",
        "startButton": true,
        "stopButton": true,
        "quickBook": true
      };


      function update() {
        var events = UpdateService.getEvents();
        var tempList = [];
        var tempCurr = null;
        for (var i = 0; i < events.length; i++) {
          if (events[i].current) {
            tempCurr = events[i];
            var checkexp = new RegExp("\\[Confirmed\\]");
            if (checkexp.test(events[i].summary)) {
              $scope.state = busyState;
            } else {
              var boia = moment(events[i].start);
              boia = boia.add(20, 'm');
              var boiadeh = moment(events[i].start);
              boiadeh = boiadeh.add(30, 'm');
              var now = moment();
              if ((now >= boia) && (now <= boiadeh)) {

                $scope.state = fullState;

              } else if (now >= boiadeh) {
                //autoEndEvent();

                $scope.state = fullState;

              } else {

                $scope.state = fullState;

              }
            }
          } else {
            tempList.push(events[i]);
          }
        }
        var iniEvent = UpdateService.getNewLocalEvent();
        if (iniEvent!=null){
          $scope.main = iniEvent;
          }
        else {
          $scope.main = tempCurr;
        }
        $scope.list = tempList;
        if ($scope.main==null) {
            $scope.state = freeState;
          }
          console.log(angular.toJson($scope.state));
          console.log(angular.toJson($scope.main));
          console.log(angular.toJson($scope.list));
        };

        update();

      $interval(function(){
        if($scope.list[0]!=undefined){
          $scope.untilnext = moment().twix($scope.list[0].start).length("minutes");}
        else {
          $scope.untilnext=61;
        }
        if ($scope.state.color == "green"){
              if ($scope.untilnext < 15) {
                $scope.state=incomingState;
              }
        }
      }, 1000);

      // end event function

      $scope.endEvent = function() {
        $http.post('php/endevent.php', {
          'eventId': $scope.main.id
        }).success(function(data) {
          console.log('end event done!' + data);
        });
        if ($scope.untilnext > 15) {
          $scope.state = freeState;
        } else {
          $scope.state = incomingState;
        }
      };

      // start event function

      $scope.startEvent = function() {
        $http.post('php/startevent.php', {
          'eventId': $scope.main.id
        }).success(function(data) {
          console.log('confirm event done!' + data);
        });
        $scope.state = busyState;
      };

      $scope.book = function () {
        $location.path('/book');
      }

      //events handler
      UpdateService.onDeviceChange($scope, function() {
        var device = $cookies.get('rmDevice');
        $scope.device = UpdateService.getCurrentDevice(device);
        if ($scope.device == null) {
          $location.path('/');
        }
      });

      UpdateService.onEventsChange($scope, update);

    }]);

app.controller("SetCtrl", ['$scope', '$cookies', '$location', 'UpdateService', '$http', function setctrl($scope, $cookies, $location, UpdateService, $http) {

  $scope.device = "";
  $scope.calendars = [];
  $scope.selected = {};

  UpdateService.onDeviceChange($scope, function() {
    console.log("event onDeviceChange detected!");
    var device = $cookies.get('rmDevice');
    console.log(device);
    $scope.device = UpdateService.getCurrentDevice(device);
    console.log($scope.device);
    if ($scope.device == null) {
      $location.path('/');
    }
    else {
      $location.path("/main");
    }
  });

  UpdateService.onCalendarsChange($scope, function(){
    $scope.calendars=UpdateService.getCalendars();
    $scope.selected = $scope.calendars[0].id;
    console.log($scope.calendars);
  });

  $scope.startup = function(){
    var inp = {
                "deviceid": $scope.deviceid,
                "calendar": $scope.selected,
                "maindevice" : true
              };
    $http.post('php/setcookies.php', inp).success(function (data) {
      $location.path("/main");
    });
  };

}]);

app.controller("BookCtrl", ['$scope', '$http', '$location', 'UpdateService', function bookctrl($scope, $http, $location, UpdateService) {
  $scope.eventName = "";

  var events = UpdateService.getEvents();
  $scope.times = [];
  $scope.choose = undefined;
  for (var i = 0; i < events.length; i++) {
    console.log("about to firing createEvent");
    var range = moment(events[i].start).twix(events[i].end);
    if (!range.isCurrent()) {
      var until = moment().twix(events[i].start).length("minutes");
      if (until > 15) {
        $scope.times[0] = 15;
      }
      if (until > 30) {
        $scope.times[1] = 30;
      }
      if (until > 45) {
        $scope.times[2] = 45;
      }
      if (until > 60) {
        $scope.times[3] = 60;
      }
      return;
    }
  }
  if (events.length == 0) {
    $scope.times = [15, 30, 45, 60];
  }

  $scope.createEvent = function() {
    console.log("firing createEvent");
    var now = moment().toISOString();
    var end = moment(now).add($scope.choose, 'minutes').toISOString();
    var event = {
      'summary': $scope.summary + '[Confirmed]',
      'description': 'Quick event created from the room manager App',
      'start': {
        'dateTime': now,
        'timeZone': 'Europe/Amsterdam'
      },
      'end': {
        'dateTime': end,
        'timeZone': 'Europe/Amsterdam'
      }
    };
    $http.post('php/setevent.php', event).success(function() {
      console.log('boia deh');
      UpdateService.setNewLocalEvent(event);
      $location.path("/main");
    });
  };

  $scope.goback = function () {
    $location.path("/main");
  };

}]);

app.controller("AdminCtrl", ['$scope', '$cookies', '$location', 'UpdateService', function adminctrl($scope, $cookies, $location, UpdateService) {
  $scope.message = "working";
}]);

app.controller("InsideCtrl", ['$scope', '$cookies', '$location', 'UpdateService', function insidectrl($scope, $cookies, $location, UpdateService) {
  $scope.message = "working";
}]);

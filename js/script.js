//small fuction to prevent overscoll in full screen view
//if need to have an element scoll add the class .scroll
/*$('body').on('touchmove', function (e) {
    if (!$('.scroll').has($(e.target)).length || !$('.scroll').children.has($(e.target)).length)
        e.preventDefault();
});*/


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
  }).when('/side', {
    templateUrl: 'tmp/side.html',
    controller: 'SideCtrl'
  }).when('/admin', {
    templateUrl: 'tmp/admin.html',
    controller: 'AdminCtrl'
  }).otherwise({
    redirectTo: '/'
  });
}]);

app.service('UpdateService',['$http', '$interval', '$rootScope', function($http, $interval, $rootScope) {
      var devicesData = {};
      var calendarsData = {};
      var eventsData = {};
      var currentDevice = {};

      this.devicesUpdate = function() { $interval(function() {
        console.log("devicesUpdate firing");
        $http.get('js/data.json', {
          cache: false,
          timeout: 3000
        }).success(function(data) {
          if (JSON.stringify(devicesData) != JSON.stringify(data)) {
            console.log("devices old data"+JSON.stringify(devicesData));
            console.log("devices new data"+JSON.stringify(data));
            devicesData = data;
            $rootScope.$emit('devices-change-event');
          }
        });
      }, 1000);};

      this.calendarsUpdate = function() { $interval(function() {
        console.log("calendarsUpdate firing");
        $http.get('php/listCalendar.php').success(function(data) {
          if (JSON.stringify(calendarsData) != JSON.stringify(data)) {
            console.log("calendars old data"+JSON.stringify(calendarsData));
            console.log("calendars new data"+JSON.stringify(data));
            calendarsData = data;
            $rootScope.$emit('calendars-change-event');
          }
        });
      }, 30000);}; //every 30 minutes

      this.eventsUpdate = function() { $interval(function() {
        console.log("eventsUpdate firing");
        $http.get('php/list.php').success(function(data) {
          if (JSON.stringify(eventsData) != JSON.stringify(data)) {
            console.log("events old data"+JSON.stringify(eventsData));
            console.log("events new data"+JSON.stringify(data));
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

    app.controller('MainCtrl', ['$scope', '$cookies', '$location', 'UpdateService', function mainctrl($scope, $cookies, $location, UpdateService) {
      $scope.device = null;
      $scope.untilnext = 0;
      $scope.state = {};
      $scope.main = {};
      $scope.list = [];

      var fullState = {
        "color": "blue",
        "statButton": true,
        "stopButton": true,
        "quickBook": false
      };
      var freeState = {
        "color": "green",
        "statButton": false,
        "stopButton": false,
        "quickBook": true
      };
      var incomingState = {
        "color": "green",
        "statButton": false,
        "stopButton": false,
        "quickBook": false
      };
      var busyState = {
        "color": "red",
        "statButton": false,
        "stopButton": false,
        "quickBook": false
      };

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

      // start event function

      $scope.startEvent = function() {
        $http.post('php/startevent.php', {
          'eventId': $scope.main.id
        }).success(function(data) {
          console.log('confirm event done!' + data);
        });
        $scope.state = busyState;
      };

      //events handler
      UpdateService.onDeviceChange($scope, function() {
        var device = $cookies.get('rmDevice');
        $scope.device = UpdateService.getCurrentDevice(device);
        if ($scope.device == null) {
          $location.path('/');
        }
      });

      UpdateService.onCalendarsChange($scope, function() {}); //not sure if this is usefull, might scrap this and call the calendars request only in the set up page

      UpdateService.onEventsChange($scope, function() {
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
        $scope.main = tempCurr;
        $scope.list = tempList;
        if ($scope.main!=null) {
            $scope.state = freeState;
          }
        });
    }]);

app.controller("SetCtrl", ['$scope', '$cookies', '$location', 'UpdateService', function setctrl($scope, $cookies, $location, UpdateService) {

  $scope.device = null;
  $scope.calendars = null;

  UpdateService.onDeviceChange($scope, function() {
    console.log("event onDeviceChange detected!");
    var device = $cookies.get('rmDevice');
    console.log(device);
    $scope.device = UpdateService.getCurrentDevice(device);
    console.log($scope.device);
    $scope.calendars=UpdateService.getCalendars();
    console.log($scope.calendars);
    if ($scope.device == null) {
      $location.path('/');
    }
    else {
      $location.path("/main");
    }
  });


}]);

app.controller("SideCtrl", ['$scope', '$cookies', '$location', 'UpdateService', function sidectrl($scope, $cookies, $location, UpdateService) {
  $scope.message = "working";
}]);

app.controller("AdminCtrl", ['$scope', '$cookies', '$location', 'UpdateService', function adminctrl($scope, $cookies, $location, UpdateService) {
  $scope.message = "working";
}]);

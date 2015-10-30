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

app.config(function($routeProvider) {
  $routeProvider.
  when('/', {
    template: 'templates/bootstrap.html',
    controller: 'SetCtrl'
  }).
  when('/main', {
    template: 'templates/main.html',
    controller: 'MainCtrl'
  }).
  when('/side', {
    template: 'templates/side.html',
    controller: 'SideCtrl'
  }).
  otherwise({
    redirectTo: '/'
  });
});

app.service('UpdateService', function($http, $interval, $rootScope) {
      var devicesData = {};
      var calendarsData = {};
      var eventsData = {};
      var currentDevice = {};

      this.devicesUpdate = $interval(function() {
        $http.get('js/data.json', {
          cache: false,
          timeout: 3000
        }).success(function(data) {
          if (devicesData != data) {
            devicesData = data;
            $rootScope.$emit('devices-change-event');
          }
        });
      }, 1000);

      this.calendarsUpdate = $interval(function() {
        $http.get('php/listCalendar.php').success(function(data) {
          if (calendarsData != data) {
            calendarsData = data;
            $rootScope.$emit('calendars-change-event');
          }
        });
      }, 30000); //every 30 minutes

      this.eventsUpdate = $interval(function() {
        $http.get('php/list.php').success(function(data) {
          if (eventsData != data) {
            eventsData = data;
            $rootScope.$emit('events-change-event');
          }
        });
      }, 1000);

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
              return some.deviceid == cookie
            };
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

      });

    app.controller('MainCtrl', ['$scope', '$cookies', function mainctrl($scope, $cookies) {
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
        $scope.device = UpdateService.getCurrentDevice($scope.device);
        if ($scope.device == null) {
          //ngRoute redirect to initial log in page
        }
      });

      UpdateService.onCalendarsChange($scope, function() {}); //not sure if this is usefull, might scrap this and call the calendars request only in the set up page

      UpdateService.onEventsChange($scope, function() {
        var events = UpdateService.getEvents();
        var tempList;
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
        if (tempList.length > 0) {
          $scope.untilnext = moment().twix(tempList[0].start).length("minutes");
        } else {
          $scope.untilnext = 61;
        }
        if ($scope.untilnext > 15) {
          $scope.state = freeState;
        } else {
          $scope.state = incomingState;
        }
        $scope.list = tempList;
      });

      /*
        var update = function() {
          var tempEv = [];
          var tempcurr = '';
          var tempConf = 'noevent';
          var tempColor = '';
          var cache = $cacheFactory.get('$http');
          cache.remove('js/data.json');
          $http.get('js/data.json', {
            cache: false,
            timeout: 3000
          }).success(function(data) {
            $scope.device = $cookies.get('rmDevice');
            $scope.currDevice = data.filter(function(some) {
              return some.deviceid == $scope.device
            });
            console.log($scope.device);
            console.log(data);
            console.log($scope.currDevice);
          });

          if (!(typeof($scope.currDevice) == 'undefined')) {
            if (!(typeof($scope.currDevice[0]) == 'undefined')) {
              console.log('currDevice 0 valido');
              if ($scope.currDevice[0].auth) {
                $http.get('php/list.php').success(function(events) {
                  for (var i = 0; i < events.length; i++) {
                    var range = moment(events[i].start).twix(events[i].end);
                    if (range.isCurrent()) {
                      tempcurr = events[i];
                      var checkexp = new RegExp("\\[Confirmed\\]");
                      if (checkexp.test(events[i].summary)) {
                        tempConf = 'confirmed';
                        tempColor = 'red';
                      } else {
                        var boia = moment(events[i].start);
                        boia = boia.add(20, 'm');
                        var boiadeh = moment(events[i].start);
                        boiadeh = boiadeh.add(30, 'm');
                        var now = moment();
                        if ((now >= boia) && (now <= boiadeh)) {
                          tempConf = 'out';
                          tempColor = 'blue';
                        } else if (now >= boiadeh) {
                          //autoEndEvent();
                          tempConf = 'in';
                          tempColor = 'blue';
                        } else {
                          tempConf = 'in';
                          tempColor = 'blue';
                        }
                      }

                    } else {
                      tempEv.push(events[i]);

                    }
                  }
                  if (tempConf == 'noevent') {
                    tempColor = 'green';
                  }
                  if (tempEv.length > 0) {
                    $scope.untilnext = moment().twix(tempEv[0].start).length("minutes");
                  } else {
                    $scope.untilnext = 61;
                  }
                  console.log(tempEv);
                  if ($scope.go) {
                    $scope.color = tempColor;
                    $scope.eventslist = tempEv;
                    $scope.currEvent = tempcurr;
                    $scope.state = tempConf;
                  }
                });
              }

            }
          }
        };
      */

      //register in the scope the showquickbook fuction to show the dialog
      /*
        $scope.showQuickBook = function($event) {
          var parentEl = angular.element(document.body);
          $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            clickOutsideToClose: true,
            template: '<md-dialog aria-label="Quick book dialog">' +
              ' <md-dialog-content style="font-size:32px">' +
              '<form name="quickBookForm">' +
              '   <md-input-container>' +
              '     <label>Event Name</label>' +
              '     <input name="evSummary" type="text" ng-model="summary" required />' +
              '   </md-input-container>' +
              '<md-input-container class="scroll" >' +
              '<label>Duration</label>' +
              '<md-select ng-model="choose" class="scroll" required>' +
              '<md-option ng-repeat="time in times" value="{{time}}">{{time}} minutes</md-option>' +
              '</md-select>' +
              '</md-input-container>' +
              '</form>' +
              ' </md-dialog-content>' +
              ' <div class="md-actions">' +
              '   <md-button ng-click="createDialog()" class="md-primary" ng-disabled="quickBookForm.$invalid" style="font-size:24px;padding:10px;">' +
              '     Book' +
              '   </md-button>' +
              ' </div>' +
              '</md-dialog>',
            controller: QuickBookController
          });

          function QuickBookController($scope, $mdDialog) {
            $http.get('php/list.php').success(function(events) {
              $scope.times = [];
              $scope.choose = undefined;
              console.log(events);
              for (var i = 0; i < events.length; i++) {
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
            });
            $scope.createDialog = function() {
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
                $mdDialog.hide();
              });
            };

            $scope.closeDialog = function() {
              $mdDialog.hide();
            };
          }
        }

      */

    }]);

//small fuction to prevent overscoll in full screen view
//if need to have an element scoll add the class .scroll
/*$('body').on('touchmove', function (e) {
    if (!$('.scroll').has($(e.target)).length || !$('.scroll').children.has($(e.target)).length)
        e.preventDefault();
});*/


//moment.js initialization

moment.locale('en');

//angular.js module initialization

var app = angular.module('CalendarApp', ['ngMaterial', 'ngTouch', 'ngCookies']);

//configuring angular material UI colors themes

app.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('amber')
        .warnPalette('red');
});


/*
app.directive("ngMobileClick", [function () {
    return function (scope, elem, attrs) {
        elem.bind("touchstart click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            scope.$apply(attrs["ngMobileClick"]);
        });
    }
}])
*/

app.controller('MainCtrl', ['$scope', '$cookies', '$interval', '$http', '$mdDialog', '$cacheFactory', '$timeout', function mainctrl($scope, $cookies, $interval, $http, $mdDialog, $cacheFactory, $timeout) {
    $scope.device = $cookies.get('rmDevice');
    $scope.eventslist = [];
    $scope.go=true;
    var timer = undefined;

    function showDialog($event) {
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            template: '<md-dialog aria-label="Login dialog">' +
                '  <md-dialog-content style="font-size:32px">' +
                '    <md-input-container>' +
                ' <label>Admin password</label>' +
                '<input name="pwd" type="password" ng-model="pwd" />' +
                '</md-input-container>' +
                '  </md-dialog-content>' +
                '  <div class="md-actions">' +
                '    <md-button ng-click="authDialog()" class="md-primary">' +
                '      Go!' +
                '    </md-button>' +
                '  </div>' +
                '</md-dialog>',
            controller: DialogController
        });

        function DialogController($scope, $mdDialog) {
            $scope.pwd = '';
            $scope.authDialog = function () {
                console.log('verifing pwd!');
                $http.post('php/validate.php', {
                    'pwd': $scope.pwd
                }).success(function (data) {
                    if (data.res) {
                        console.log('confirm pwd!');
                        $mdDialog.hide();
                        //show set up dialog
                        showSetup();
                    } else {
                        console.log('wrong pwd!');
                    }
                });

            };
            $scope.closeDialog = function () {
                $mdDialog.hide();
            };
        }
    }

    function showSetup($event) {
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            template: '<md-dialog aria-label="Setup dialog">' +
                ' <md-dialog-content style="font-size:32px">' +
                '<form name="setupForm">' +
                '   <md-input-container>' +
                '     <label>Device Name</label>' +
                '     <input name="devId" type="text" ng-model="deviceid" required />' +
                '   </md-input-container>' +
                '<md-input-container class="scroll">' +
                '<label>Calendar</label>' +
                '<md-select ng-model="cal" class="scroll" required>' +
                '<md-option class="scroll" ng-repeat="calendar in calendars" value="{{calendar.id}}">{{calendar.summary}}</md-option>' +
                '</md-select>' +
                '</md-input-container>' +
                '</form>' +
                ' </md-dialog-content>' +
                ' <div class="md-actions">' +
                '   <md-button ng-click="setDialog()" ng-disabled="setupForm.$invalid" class="md-primary">' +
                '     Go!' +
                '   </md-button>' +
                ' </div>' +
                '</md-dialog>',
            controller: SetupController
        });

        function SetupController($scope, $mdDialog) {
            $http.post('php/listCalendar.php').success(function (data) {
                $scope.calendars = data;
            });

            $scope.setDialog = function () {
                var inp = {
                    "deviceid": $scope.deviceid,
                    "calendar": $scope.cal,
                    "maindevice" : true
                };
                $http.post('php/setcookies.php', inp).success(function (data) {
                    $mdDialog.hide();
                    update();
                });

            };
            $scope.closeDialog = function () {
                $mdDialog.hide();
            };
        }
    }

    $scope.$watch($scope.device, function () {
        if ($scope.device == undefined || $scope.device == null || $scope.device == '') {
            showDialog();
        }
    });

    var update = function () {
        var tempEv = [];
        var tempcurr = '';
        var tempConf = 'noevent';
        var tempColor = '';
        var cache = $cacheFactory.get('$http');
        cache.remove('js/data.json');
        $http.get('js/data.json', {
            cache: false,
            timeout: 3000
        }).success(function (data) {
            $scope.device = $cookies.get('rmDevice');
            $scope.currDevice = data.filter(function (some) {
                return some.deviceid == $scope.device
            });
            console.log($scope.device);
            console.log(data);
            console.log($scope.currDevice);
        });

        $http.post('php/listCalendar.php');
        if (!(typeof ($scope.currDevice) == 'undefined')) {
            if (!(typeof ($scope.currDevice[0]) == 'undefined')) {
                console.log('currDevice 0 valido');
                if ($scope.currDevice[0].auth) {
                    $http.get('php/list.php').success(function (events) {
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
                        }
                        else{
                            $scope.untilnext = 61;
                        }
                        console.log(tempEv);
                        if($scope.go){
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

    // end event function

    $scope.endEvent = function () {
        $http.post('php/endevent.php', {
            'eventId': $scope.currEvent.id
        }).success(function (data) {
            console.log('end event done!' + data);
        });
        $scope.go=false;
        $timeout(function () {$scope.go=true;
        }, 3000);
        $scope.state = 'noevent';
        $scope.color = 'green';
    };

    // start event function

    $scope.startEvent = function () {
        $http.post('php/startevent.php', {
            'eventId': $scope.currEvent.id
        }).success(function (data) {
            console.log('confirm event done!' + data);
        });
        $scope.go=false;
        $timeout(function () {$scope.go=true;
        }, 3000);
        $scope.state = 'confirmed';
        $scope.color = 'red';
    };

    //repeat the update fuction every 2 second to update the data drom google calendar and the json database

    timer = $interval(update, 1500);

    //register in the scope the showquickbook fuction to show the dialog

    $scope.showQuickBook = function ($event) {
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
            $http.get('php/list.php').success(function (events) {
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
            $scope.createDialog = function () {
                var now = moment().toISOString();
                var end = moment(now).add($scope.choose, 'minutes').toISOString();
                var event = {
                    'summary': $scope.summary+'[Confirmed]',
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
                $http.post('php/setevent.php', event).success(function() {console.log('boia deh'); $mdDialog.hide();});
            };

            $scope.closeDialog = function () {
                $mdDialog.hide();
            };
        }
    }



}]);

/////////////////////////////////////////////////////////////////////////////////////////////////
//declaration for the app of the internal iphone button
/////////////////////////////////////////////////////////////////////////////////////////////////

var btn = angular.module('BtnApp', ['ngMaterial', 'ngTouch', 'ngCookies']);

btn.directive("ngMobileClick", [function () {
    return function (scope, elem, attrs) {
        elem.bind("touchstart click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            scope.$apply(attrs["ngMobileClick"]);
        });
    }
}])

btn.controller('BtnCtrl', ['$scope', '$cookies', '$interval', '$http', '$mdDialog', '$cacheFactory', '$timeout', function btnctrl($scope, $cookies, $interval, $http, $mdDialog, $cacheFactory, $timeout) {
    $scope.device = $cookies.get('rmDevice');
    $scope.eventslist = [];
    var timer = undefined;

    function showDialog($event) {
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            template: '<md-dialog aria-label="Login dialog">' +
                '  <md-dialog-content style="font-size:32px">' +
                '    <md-input-container>' +
                ' <label>Admin password</label>' +
                '<input name="pwd" type="password" ng-model="pwd" />' +
                '</md-input-container>' +
                '  </md-dialog-content>' +
                '  <div class="md-actions">' +
                '    <md-button ng-click="authDialog()" class="md-primary">' +
                '      Go!' +
                '    </md-button>' +
                '  </div>' +
                '</md-dialog>',
            controller: DialogController
        });

        function DialogController($scope, $mdDialog) {
            $scope.pwd = '';
            $scope.authDialog = function () {
                console.log('verifing pwd!');
                $http.post('php/validate.php', {
                    'pwd': $scope.pwd
                }).success(function (data) {
                    if (data.res) {
                        console.log('confirm pwd!');
                        $mdDialog.hide();
                        //show set up dialog
                        showSetup();
                    } else {
                        console.log('wrong pwd!');
                    }
                });

            };
            $scope.closeDialog = function () {
                $mdDialog.hide();
            };
        }
    }

    function showSetup($event) {
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            template: '<md-dialog aria-label="Setup dialog">' +
                ' <md-dialog-content style="font-size:32px">' +
                '<form name="setupForm">' +
                '   <md-input-container>' +
                '     <label>Device Name</label>' +
                '     <input name="devId" type="text" ng-model="deviceid" required />' +
                '   </md-input-container>' +
                '<md-input-container class="scroll">' +
                '<label>Calendar</label>' +
                '<md-select ng-model="cal" class="scroll" required>' +
                '<md-option class="scroll" ng-repeat="calendar in calendars" value="{{calendar.id}}">{{calendar.summary}}</md-option>' +
                '</md-select>' +
                '</md-input-container>' +
                '</form>' +
                ' </md-dialog-content>' +
                ' <div class="md-actions">' +
                '   <md-button ng-click="setDialog()" ng-disabled="setupForm.$invalid" class="md-primary">' +
                '     Go!' +
                '   </md-button>' +
                ' </div>' +
                '</md-dialog>',
            controller: SetupController
        });

        function SetupController($scope, $mdDialog) {
            $http.post('php/listCalendar.php').success(function (data) {
                $scope.calendars = data;
            });

            $scope.setDialog = function () {
                var inp = {
                    "deviceid": $scope.deviceid,
                    "calendar": $scope.cal,
                    "maindevice" : false
                };
                $http.post('php/setcookies.php', inp).success(function (data) {
                    $mdDialog.hide();
                    update();
                });

            };
            $scope.closeDialog = function () {
                $mdDialog.hide();
            };
        }
    }

    $scope.$watch($scope.device, function () {
        if ($scope.device == undefined || $scope.device == null || $scope.device == '') {
            showDialog();
        }
    });

    var update = function () {
        var tempEv = [];
        var tempcurr = '';
        var tempConf = 'noevent';
        var tempColor = '';
        var cache = $cacheFactory.get('$http');
        cache.remove('js/data.json');
        $http.get('js/data.json', {
            cache: false,
            timeout: 3000
        }).success(function (data) {
            $scope.device = $cookies.get('rmDevice');
            $scope.currDevice = data.filter(function (some) {
                return some.deviceid == $scope.device
            });
            console.log($scope.device);
            console.log(data);
            console.log($scope.currDevice);
        });

        $http.post('php/listCalendar.php');
        if (!(typeof ($scope.currDevice) == 'undefined')) {
            if (!(typeof ($scope.currDevice[0]) == 'undefined')) {
                console.log('currDevice 0 valido');
                if ($scope.currDevice[0].auth) {
                    $http.get('php/list.php').success(function (events) {
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
                        }
                        else{
                            $scope.untilnext = 61;
                        }
                        console.log(tempEv);
                        $scope.color = tempColor;
                        $scope.eventslist = tempEv;
                        $scope.currEvent = tempcurr;
                        $scope.state = tempConf;
                    });
                }

            }
        }
    };

    $scope.endEvent = function () {
        $http.post('php/endevent.php', {
            'eventId': $scope.currEvent.id
        }).success(function (data) {
            console.log('end event done!' + data);
        });
        $scope.go=false;
        $timeout(function () {$scope.go=true;
        }, 3000);
        $scope.state = 'noevent';
        $scope.color = 'green';
    };

    // start event function

    $scope.startEvent = function () {
        $http.post('php/startevent.php', {
            'eventId': $scope.currEvent.id
        }).success(function (data) {
            console.log('confirm event done!' + data);
        });
        $scope.go=false;
        $timeout(function () {$scope.go=true;
        }, 3000);
        $scope.state = 'confirmed';
        $scope.color = 'red';
    };

    //repeat the update fuction every 2 second to update the data drom google calendar and the json database

    timer = $interval(update, 1500);

    //register in the scope the showquickbook fuction to show the dialog

    $scope.showQuickBook = function ($event) {
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
            $http.get('php/list.php').success(function (events) {
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
            $scope.createDialog = function () {
                var now = moment().toISOString();
                var end = moment(now).add($scope.choose, 'minutes').toISOString();
                var event = {
                    'summary': $scope.summary+'[Confirmed]',
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
                $http.post('php/setevent.php', event).success(function() {console.log('boia deh'); $mdDialog.hide();});
            };

            $scope.closeDialog = function () {
                $mdDialog.hide();
            };
        }
    }



}]);

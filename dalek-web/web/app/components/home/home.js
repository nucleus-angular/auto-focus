angular.module('app.home.home', [
  'app.core'
])
.config([
  '$stateProvider',
  function($stateProvider) {
    $stateProvider
    .state('app.home.home', {
      url: '',
      views: {
        '': {
          templateUrl: '/app/components/home/assets/templates/home.html',
          controller: 'HomeCtrl'
        }
      }
    })
    .state('app.home.home2', {
      url: '/2',
      views: {
        '': {
          templateUrl: '/app/components/home/assets/templates/home2.html',
          controller: 'HomeCtrl'
        }
      }
    });
  }
])
.controller('HomeCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
  $scope.isFocused = false;

  $scope.focus = function($event) {
    console.log('focus');
    $scope.isFocused = true;
  };

  $scope.blur = function($event) {
    console.log('blur')
    $scope.isFocused = false;
  };

  $scope.focusInput = function() {
    $rootScope.$broadcast('NagAutoFocus/trigger');
  };
}]);

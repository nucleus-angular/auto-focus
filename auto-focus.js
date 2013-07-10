angular.module('nag.autoFocus', [])
.directive('nagAutoFocus', [
  '$timeout',
  '$rootScope',
  function($timeout, $rootScope) {
    return {
      restrict: 'A',
      controller: [
        '$scope',
        function($scope) {
          $scope.$on('$destroy', function() {
            //if the scope is destroyed, we no longer need this broadcast to be registered
            $scope.unregisterBroadcast();
          });
        }
      ],
      priority: 0,
      compile: function(element, attributes, transclude) {
        return {
          post: function(scope, element, attributes) {
            $timeout(function(){$(element).focus()}, 0);

            //allows you to trigger the auto focus through javascript code without having to reply of DOM selection (like inside a controller)
            scope.unregisterBroadcast = scope.$on('trigger-auto-focus', function() {
                $(element).focus()
            });
          }
        };
      }
    }
  }
]);

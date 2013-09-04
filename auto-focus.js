/**
 * Auto focuses element
 *
 * @module nag.autoFocus
 * @ngdirective nagAutoFocus
 */
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
          /**
           * Unregisters the auto focus event
           *
           * @ngscope
           * @property unregisterAutoFocusEvent
           * @type function
           */
          $scope.unregisterAutoFocusEvent = null;

          $scope.$on('$destroy', function() {
            //if the scope is destroyed, we no longer need this broadcast to be registered
            if($scope.unregisterAutoFocusEvent) {
              $scope.$scope.unregisterAutoFocusEvent();
            }
          });
        }
      ],
      priority: 0,
      compile: function(element, attributes, transclude) {
        return {
          post: function(scope, element, attributes) {
            $timeout(function(){$(element).focus()}, 0);

            /**
             * Will auto focus the last element that has the nagAutoFocus directive on it
             *
             * @respondto NagAutoFocus/trigger
             * @eventlevel root
             */
            scope.unregisterAutoFocusEvent = $rootScope.$on('NagAutoFocus/trigger', function() {
                $(element).focus()
            });
          }
        };
      }
    }
  }
]);

/**
 * # Auto Focus
 *
 * The auto focus directive allows you to be able to specific an input element that should be auto focused.
 *
 * ```html
 * <input type="text" ng-bind="username" nag-auto-focus />
 * ```
 *
 * @module nag.autoFocus
 * @ngdirective nagAutoFocus
 *
 * @nghtmlattribute {string} nag-auto-focus Pass the string true to auto trigger the focus event when directive is rendered
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

          /**
           * Clean up on destruction of this $scope
           *
           * @respondto $destroy
           * @eventlevel scope
           */
          $scope.$on('$destroy', function() {
            //if the scope is destroyed, we no longer need this broadcast to be registered
            if($scope.unregisterAutoFocusEvent) {
              $scope.unregisterAutoFocusEvent();
            }
          });
        }
      ],
      priority: 0,
      compile: function(element, attributes, transclude) {
        return {
          post: function($scope, element, attributes) {
            if(attributes.nagAutoFocus === 'true') {
              $timeout(function(){
                element.focus()
              }, 0);
            }

            /**
             * Will auto focus the last element that has the nagAutoFocus directive on it
             *
             * @respondto NagAutoFocus/trigger
             * @eventlevel root
             */
            $scope.unregisterAutoFocusEvent = $rootScope.$on('NagAutoFocus/trigger', function() {
              $(element).focus()
            });
          }
        };
      }
    }
  }
]);

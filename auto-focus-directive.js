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
angular.module('nag.autoFocus')
.directive('nagAutoFocus', [
  '$timeout',
  '$rootScope',
  function($timeout, $rootScope) {
    return {
      restrict: 'A',
      controller: 'NagAutoFocusDCtrl',
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

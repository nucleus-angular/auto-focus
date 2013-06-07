angular.module('nag.autoFocus', [])
.directive('nagAutoFocus', [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      compile: function(element, attributes, transclude) {
        return {
          post: function(scope, element, attributes) {
            $timeout(function(){$(element).focus()}, 0);
          }
        };
      }
    }
  }
]);

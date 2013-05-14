angular.module('nag.autoFocus', [])
.directive('nagAutoFocus', [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      compile: function(element, attributes, transclude) {
        return {
          pre: function(scope, element, attributes) {},
          post: function(scope, element, attributes) {
            //$timeout is used in order to make sure this works with elements added dynamically (like with extend text)
            $timeout(function(){$(element).focus()}, 0);
          }
        }
        /*return function(scope, element, attributes) {
          $(element).focus();
        }*/
      }
    };
  }
]);

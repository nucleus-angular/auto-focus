angular.module('nag.autoFocus')
.controller('NagAutoFocusDCtrl', [
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
]);

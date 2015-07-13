/* adobe-creative-ng.js / v0.0.1 / (c) 2015 Massimiliano Sartoretto / MIT Licence */

'format amd';
/* global define */

(function () {
  'use strict';

  function adobeCreativeNg(angular, Aviary) {

    return angular.module('adobeCreativeNg', [])

      .directive('ngCreative', ['ngCreative', function (ngCreative) {

        return {
          restrict: 'E',
          template: '<input type="image"/>',
          replace: true,
          scope: {
            target: '@',
            onSave: '&',
            onSaveButtonClicked: '&'
          },
          link: function (scope, element, attrs) {

            element.bind('click', function () {
              return launchEditor(scope.target, srcById(scope.target));
            });

            // Callbacks obj
            var cbs = {
              onSaveButtonClicked: onSaveButtonClickedCb,
              onSave: onSaveCb,
              onError: onErrorCb,
              onClose: onCLoseCb
            };

            var featherEditor = new Aviary.Feather(
              angular.extend({}, ngCreative.configuration, cbs)
            );

            function launchEditor(id, src) {
              featherEditor.launch({
                image: id,
                url: src
              });
              return false;
            }

            function srcById(id) {
              return document.getElementById(id).src;
            }

            function onSaveButtonClickedCb(imageID) {
              // User onSaveButtonClicked callback
              (scope.onSaveButtonClicked || angular.noop)({id: imageID});
            }

            function onSaveCb(imageID, newURL) {
              var img = document.getElementById(imageID);
              img.src = newURL;

              // User onSave callback
              (scope.onSave || angular.noop)({
                id: imageID,
                newURL: newURL
              });

              if(scope.closeOnSave || ngCreative.configuration.closeOnSave){
                featherEditor.close();
              }
            }

            function onErrorCb(errorObj) {
              throw new Error(errorObj.message);
            }

            function onCLoseCb(isDirty) {}
          }
        };
      }])

      .provider('ngCreative', function(){
        var defaults = {
          apiKey: null,
          theme: 'dark',
          tools: 'all'
        };

        var requiredKeys = [
          'apiKey'
        ];

        var config;

        this.configure = function(params) {
          // Can only be configured once.
          if (config) {
            throw new Error('Already configured.');
          }

          // Check if is an `object`.
          if (!(params instanceof Object)) {
            throw new TypeError('Invalid argument: `config` must be an `Object`.');
          }

          // Extend default configuration.
          config = angular.extend({}, defaults, params);

          // Check if all required keys are set.
          angular.forEach(requiredKeys, function(key) {
            if (!config[key]) {
              throw new Error('Missing parameter:', key);
            }
          });

          return config;
        };

        this.$get = function() {
          if(!config) {
            throw new Error('ngCreativeProvider must be configured first.');
          }

          var getConfig = (function() {
            return config;
          })();

          return {
            configuration: getConfig
          };
        };
      });
  }

  if (typeof define === 'function' && define.amd) {
		define(['angular', 'Aviary'], adobeCreativeNg);
	} else if (typeof module !== 'undefined' && module && module.exports) {
		adobeCreativeNg(angular, require('Aviary'));
		module.exports = 'adobeCreativeNg';
	} else {
		adobeCreativeNg(angular, (typeof global !== 'undefined' ? global : window).Aviary);
	}
})();

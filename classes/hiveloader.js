// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  TopViewer.HiveLoader = (function() {
    function HiveLoader(manager) {
      this.manager = manager || THREE.DefaultLoadingManager;
    }

    HiveLoader.prototype.setCrossOrigin = function(value) {
      return this.crossOrigin = value;
    };

    HiveLoader.prototype.load = function(url, onLoad, onProgress, onError) {
      var worker;
      worker = new Worker('/uploads/apps/top_viewer/classes/hiveloader-worker.js');
      worker.onmessage = (function(_this) {
        return function(message) {
          var objects;
          switch (message.data.type) {
            case 'progress':
              if (onProgress) {
                return onProgress(message.data.loadPercentage);
              }
              break;
            case 'result':
              if (onProgress) {
                onProgress(100);
              }
              objects = message.data.objects;
              return onLoad(objects);
          }
        };
      })(this);
      return worker.postMessage({
        url: url,
        crossOrigin: this.crossOrigin,
        propertyNameMapping: this.propertyNameMapping
      });
    };

    return HiveLoader;

  })();

}).call(this);

//# sourceMappingURL=hiveloader.js.map
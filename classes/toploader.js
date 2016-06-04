// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  TopViewer.TopLoader = (function() {
    function TopLoader() {}

    TopLoader.prototype.load = function(url, onLoad, onProgress, onError) {
      var worker;
      worker = new Worker('/uploads/apps/top_viewer/classes/toploader-worker.js');
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
              objects = message.data.objects;
              return onLoad(objects);
          }
        };
      })(this);
      return worker.postMessage({
        url: url
      });
    };

    return TopLoader;

  })();

}).call(this);

//# sourceMappingURL=toploader.js.map
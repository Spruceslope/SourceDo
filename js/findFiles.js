var dir = require('node-dir');
var path = require('path');
var Q = require('q');

module.exports = (function () {
    var files = {},
        deferred = Q.defer();
    
    var inDir = function (dirPath, ext) {
        getAllFiles(dirPath, ext, getFilesByExtension);
        return deferred.promise;
    };
    
    var getFilesByExtension = function (paths, ext) {
        for (var a = 0; a < paths.files.length; a++) {
            if (ext === undefined || path.extname(paths.files[a]) === ext) {
                var dir = paths.files[a].substring(0, paths.files[a].lastIndexOf('\\'));
                if (!files[dir]) {
                    files[dir] = [];
                }
                files[dir].push(paths.files[a])
            }
        }
        deferred.resolve(files);
    };
    
    var getAllFiles = function (dirPath, ext, fn) {
        dir.paths(dirPath, function (err, paths) {
            /* TODO : 
            Add error handling */
            /* END */
            fn(paths, ext);
        });
    };

    return {
        inDir: inDir
    };
}());
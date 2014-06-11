/*jshint node: true */

var fs              = require('fs');
var path            = require('path');
var esprima         = require('esprima');
var recast          = require('recast');
var recast          = require('recast');
var destrucuring    = require('../lib/index');


var BASELINE = path.join(__dirname, 'tests/baseline');
var RESULTS  = path.join(__dirname, 'tests/results');

function transform(filename) {
    var recastOptions = {
        esprima: esprima,
        sourceFileName: filename,
        sourceMapName: filename + '.map'
    };
    
    var source = fs.readFileSync(path.join(BASELINE, filename));

    var ast = recast.parse(source, recastOptions);
    ast = destrucuring.transform(ast);
    var result = recast.print(ast, recastOptions);

    fs.writeFileSync(path.join(RESULTS, filename + '.js'), result.code, 'utf8');
}

fs.readdir(BASELINE, function (err, files) {
    files.filter(function (fileName) {
        return /.js$/.test(fileName);
    }).forEach(transform);
});
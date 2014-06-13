/*jshint node: true */

var fs              = require('fs');
var path            = require('path');
var esprima         = require('esprima');
var recast          = require('recast');
var destrucuring    = require('../lib/index');


var CASES   = path.join(__dirname, 'tests/cases');
var RESULTS = path.join(__dirname, 'tests/results');

var args = process.argv.slice(2);

function transform(filename) {
    var recastOptions = {
        esprima: esprima,
        sourceFileName: filename
    };
    
    var source = fs.readFileSync(path.join(CASES, filename));

    var ast = recast.parse(source, recastOptions);
    ast = destrucuring.transform(ast);
    var result = recast.print(ast, recastOptions);

    var resultFile = path.join(RESULTS, filename);
    if(args[0] === '--generate') {
        fs.writeFileSync(resultFile, result.code, 'utf8');
    } else {
        if (fs.readFileSync(resultFile, 'utf8') !== result.code) {
            console.error('error for test : ' + filename );
        }
    }
    
}

fs.readdir(CASES, function (err, files) {
    files.filter(function (fileName) {
        return /.js$/.test(fileName);
    }).forEach(transform);
});
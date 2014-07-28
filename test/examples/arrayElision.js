/*jshint esnext:true*/
/*global assert*/
function simpleVarDestructuringObjectPattern(z) {
    var [,x,,y] = z;
    return {
        x:x,
        y:y
    };
}
assert.deepEqual(simpleVarDestructuringObjectPattern([1,2,3,4,5]), {x: 2, y: 4},
             'ensure that array elision works');
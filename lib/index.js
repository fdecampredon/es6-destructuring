/* jshint node:true, undef:true, unused:true */

var recast = require('recast');
var types = recast.types;
var n = types.namedTypes;
var b = types.builders;
var stringType = types.builtInTypes.string;


function pushAll(arr, data) {
    arr.push.apply(arr, data);
}


function isPattern(node) {
  return (n.ObjectPattern.check(node) || n.ArrayPattern.check(node));
}

function visitNode(node) {
    if (n.VariableDeclaration.check(node)) {
        node.declarations = node.declarations.reduce(
            function (declarations, decl) {
                var id = decl.id;
                if(isPattern(id)) {
                    pushAll(declarations, renderDesructuration(decl.id, decl.init));   
                } else {
                    declarations.push(decl); 
                }
                return declarations;
            }, []
        );
    } else {
        return;
    }
}

var uid = 0;



function renderDesructuration(pattern, expr) {
    var id;
    var results = [];
    if (n.ObjectPattern.check(pattern) && pattern.properties.length === 1) {
        id = expr;
    } else if (n.ArrayPattern.check(pattern) && pattern.elements.length === 1) {
        id = expr;
    } else if (n.Identifier.check(expr) || stringType.check(expr)) {
        id = expr;
    } else {
        id = b.identifier('var$' + (uid++));
        results.push(b.variableDeclarator(id, expr)); 
    }
    
    if (n.ObjectPattern.check(pattern)) {
        pattern.properties.forEach(function(prop) {
            var value = b.memberExpression(id, prop.key, false);
            if (isPattern(prop.value)) {
                pushAll(results, renderDesructuration(prop.value, value));
            } else {
                results.push(b.variableDeclarator(b.identifier(prop.value.name), value));
            }
        });
    } else {
        pattern.elements.forEach(function(elem, idx) {
            // null means skip
            if (elem === null) {
                return;
            }
            
            if (!n.SpreadElement.check(elem)) {
                var value = b.memberExpression(id, b.literal(idx), true);
                if (isPattern(elem)) {
                    pushAll(results, renderDesructuration(elem, value));
                } else  {
                    results.push(b.variableDeclarator(b.identifier(elem.name), value));
                }  
            } else {
                results.push(b.variableDeclarator(
                    b.identifier(elem.argument.name),
                    b.callExpression(
                        b.memberExpression(id, b.identifier('slice'), false),
                        [b.literal(idx)]
                    )
                ));
//               utils.append(elem.argument.name + ' = ', state);
//                render([id, '.slice(' + idx + ')'], traverse, path, state);
//                utils.append(comma, state);
            }
        });
      }
    return results;
}

function transform(ast) {
  return types.traverse(ast, visitNode);
}


exports.transform = transform;

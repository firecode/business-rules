var BusinessRules = BusinessRules || {};

(function() {
  var standardOperators = {
    present: function(actual, target) {
      return !!actual;
    },
    blank: function(actual, target) {
      return !actual;
    },
    equalTo: function(actual, target) {
      return "" + actual === "" + target;
    },
    notEqualTo: function(actual, target) {
      return "" + actual !== "" + target;
    },
    greaterThan: function(actual, target) {
      return parseFloat(actual, 10) > parseFloat(target, 10);
    },
    greaterThanEqual: function(actual, target) {
      return parseFloat(actual, 10) >= parseFloat(target, 10);
    },
    lessThan: function(actual, target) {
      return parseFloat(actual, 10) < parseFloat(target, 10);
    },
    lessThanEqual: function(actual, target) {
      return parseFloat(actual, 10) <= parseFloat(target, 10);
    },
    includes: function(actual, target) {
      return ("" + actual).indexOf("" + target) > -1;
    },
    matchesRegex: function(actual, target) {
      var r = target.replace(/^\/|\/$/g, "");
      var regex = new RegExp(r);
      return regex.test("" + actual);
    }
  };

  var RuleEngine = BusinessRules.RuleEngine = function RuleEngine(rule) {
    this.rule = rule;
    this.operators = {};
    this.addOperators(standardOperators);
  }

  RuleEngine.prototype = {
    matches: function(obj) {
      return handleNode(this.rule.conditions, obj, this);
    },
    addOperators: function(newOperators) {
      $.extend(this.operators, newOperators);
    }
  };

  function handleNode(node, obj, engine) {
    if(node.all || node.any) {
      return handleConditionalNode(node, obj, engine);
    } else {
      return handleRuleNode(node, obj, engine);
    }
  }

  function handleConditionalNode(node, obj, engine) {
    var isAll = !!(node.all);
    var nodes = isAll ? node.all : node.any;
    for(var i=0; i < nodes.length; i++) {
      var result = handleNode(nodes[i], obj, engine);
      if(isAll && !result) { return false; }
      if(!isAll && !!result) { return true; }
    }
    return isAll;
  }

  function handleRuleNode(node, obj, engine) {
    var value = obj[node.field];
    if(value && value.call) {value = value()}
    return compareValues(value, node.operator, node.value, engine);
  }

  function compareValues(actual, operator, value, engine) {
    var operatorFunction = engine.operators[operator];
    return operatorFunction && operatorFunction(actual, value);
  }

})();
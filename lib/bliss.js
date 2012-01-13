var Bliss, Tokenizer, Writer, fs, path, tokenizer,
  __slice = Array.prototype.slice;

fs = require('fs');

path = require('path');

Writer = require('./writer');

Tokenizer = require('./tokenizer');

tokenizer = new Tokenizer();

module.exports = Bliss = (function() {
  var defaults;

  function Bliss(options) {
    this.options = options;
    this.options = defaults(this.options, {
      ext: '.js.html'
    });
  }

  defaults = function() {
    var k, object, objects, result, v, _i, _len;
    objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    result = {};
    for (_i = 0, _len = objects.length; _i < _len; _i++) {
      object = objects[_i];
      if (object != null) {
        for (k in object) {
          v = object[k];
          if (result[k] == null) result[k] = v;
        }
      }
    }
    return result;
  };

  Bliss.prototype.compile = function(source, options) {
    var context, func, self, tmpl, tmplParams, tmplSource, writer;
    self = this;
    options = defaults(options, this.options, {
      context: {}
    });
    context = options.context;
    context.render = function() {
      var args, dirname, exists, filename, filepath;
      filename = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      dirname = path.dirname(options.filename);
      filepath = path.resolve(dirname, filename);
      exists = path.existsSync(filepath);
      if (!exists) {
        filepath = filepath + options.ext;
        exists = path.existsSync(filepath);
      }
      if (exists) {
        return self.render.apply(self, [filepath].concat(__slice.call(args)));
      } else {
        throw 'ENOENT';
      }
    };
    writer = new Writer();
    writer.write(tokenizer.tokenize(source));
    tmplParams = writer.parameters;
    tmplSource = writer.source(context);
    func = Function.apply(null, __slice.call(tmplParams).concat([tmplSource]));
    tmpl = func.bind(context);
    tmpl.filename = options.filename;
    tmpl.toString = func.toString.bind(func);
    tmpl.toSource = function() {
      return source;
    };
    return tmpl;
  };

  Bliss.prototype.compileFile = function(filename, options) {
    var p, source, template;
    source = fs.readFileSync(filename, 'utf8');
    options = defaults(options, this.options, {
      filename: filename,
      ext: (p = filename.indexOf('.')) >= 0 ? filename.slice(p) : ''
    });
    return template = this.compile(source, options);
  };

  Bliss.prototype.render = function() {
    var args, filename, template;
    filename = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    template = this.compileFile(filename);
    return template.apply(null, args);
  };

  return Bliss;

})();

var Tokenizer, Writer, compile, compileFile, fs, path, render, tokenizer,
  __slice = Array.prototype.slice;

fs = require('fs');

path = require('path');

Writer = require('./writer');

Tokenizer = require('./tokenizer');

tokenizer = new Tokenizer();

compile = function(source, options) {
  var context, func, tmpl, tmplParams, tmplSource, writer, _ref;
  if (options == null) options = {};
  context = (_ref = options.context) != null ? _ref : options.context = {};
  context.render = function() {
    var args, dirname, exists, filename, filepath;
    filename = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    dirname = path.dirname(options.filename);
    filepath = path.resolve(dirname, filename);
    exists = path.existsSync(filepath);
    if (!exists) {
      filepath = filepath + '.js.html';
      exists = path.existsSync(filepath);
    }
    if (exists) {
      return render.apply(null, [filepath].concat(__slice.call(args)));
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
  tmpl.toString = func.toString.bind(func);
  tmpl.toSource = function() {
    return source;
  };
  tmpl.name = options.filename;
  return tmpl;
};

compileFile = function(filename, options) {
  var source, template;
  source = fs.readFileSync(filename, 'utf8');
  options = {
    filename: filename
  };
  return template = compile(source, options);
};

render = function() {
  var args, filename, template;
  filename = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  template = compileFile(filename);
  return template.apply(null, args);
};

module.exports = {
  compile: compile,
  compileFile: compileFile,
  render: render
};

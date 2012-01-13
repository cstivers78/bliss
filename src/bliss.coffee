fs = require 'fs'
path = require 'path'
Writer = require './writer'
Tokenizer = require './tokenizer'

tokenizer = new Tokenizer()

compile = (source,options) ->
  
  options ?= {}
  context = options.context ?= {}

  context.render = (filename,args...) ->
    dirname = path.dirname options.filename
    filepath = path.resolve dirname, filename
    
    exists = path.existsSync filepath
    if not exists
      filepath = filepath + '.js.html'
      exists = path.existsSync filepath
    if exists
      render filepath, args...
    else
      throw 'ENOENT'

  writer = new Writer()
  writer.write tokenizer.tokenize source
  
  tmplParams = writer.parameters
  tmplSource = writer.source(context)

  func = Function tmplParams..., tmplSource
  tmpl = func.bind(context)
  tmpl.toString = func.toString.bind(func)
  tmpl.toSource = () -> source
  tmpl.name = options.filename
  return tmpl


compileFile = (filename,options) ->
  source = fs.readFileSync filename, 'utf8'
  options = {
    filename: filename
  }
  template = compile source, options


render = (filename,args...) ->
  template = compileFile filename
  template args...


module.exports = {
  compile
  compileFile
  render
}
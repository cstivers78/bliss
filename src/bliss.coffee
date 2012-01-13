fs = require 'fs'
path = require 'path'
Writer = require './writer'
Tokenizer = require './tokenizer'

tokenizer = new Tokenizer()

module.exports = class Bliss

  constructor: (@options) ->
    @options = defaults @options, {
      ext: '.js.html'
    }

  defaults = (objects...) ->
    result = {}
    for object in objects
      if object?
        for k,v of object
          result[k] ?= v
    result
  
  compile: (source,options) ->
    self = @
    options = defaults options, @options, {
      context: {}
    }
    context = options.context

    context.render = (filename,args...) ->
      dirname = path.dirname options.filename
      filepath = path.resolve dirname, filename
      
      exists = path.existsSync filepath
      if not exists
        filepath = filepath + options.ext
        exists = path.existsSync filepath
      if exists
        self.render filepath, args...
      else
        throw 'ENOENT'

    writer = new Writer()
    writer.write tokenizer.tokenize source
    
    tmplParams = writer.parameters
    tmplSource = writer.source(context)

    func = Function tmplParams..., tmplSource
    tmpl = func.bind(context)
    tmpl.filename = options.filename
    tmpl.toString = func.toString.bind(func)
    tmpl.toSource = () -> source

    return tmpl


  compileFile: (filename,options) ->
    source = fs.readFileSync filename, 'utf8'
    options = defaults options, @options, {
      filename: filename,
      ext: if (p=filename.indexOf('.')) >= 0 then filename[p..] else ''
    }
    template = @compile source, options


  render: (filename,args...) ->
    template = @compileFile filename
    template args...

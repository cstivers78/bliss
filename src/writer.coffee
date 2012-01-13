module.exports = class Writer

  constructor: () ->
    @buffer = []
    @parameters = []

  code: (code) ->
    @buffer.push code

  text: (text) ->
    text = text.replace(/\n/g,'\\n')
    @buffer.push 'write("'
    @buffer.push text
    @buffer.push '");\n'
  
  write: (elements) ->
    for element in elements
      if element?
        if element.tag?
          @tag element
        else
          @text element

  tag: (tag) ->
    switch tag.name
      when 'Anchor'
        @tag tag.content
      when 'Content'
        @text tag.content
      when 'Block'
        @code '{'
        if tag.content? and Array.isArray tag.content 
          for c in tag.content
            if c?.tag?
              @tag c
            else if c?
              @text c
        @code '}'
      when 'Value'
        index = @values
        @code '__tmp='
        @value tag
        @code ';'
        @code 'if(__tmp !== undefined || __tmp !== null){'
        @code 'write(__tmp);'
        @code '}'
      when 'Parameters'
        @parameters = tag.parameters
      when 'Func' 
        @code 'function'
        @tag tag.args
        @code '{'
        @code 'var __out=[],write=__out.push.bind(__out),__tmp=0;'
        @tag tag.block
        @code 'return __out.join(\'\');'
        @code '}'
      else
        if tag.parts?
          @parts tag.parts()

  parts: (parts) ->
    for part in parts
      if part?
        if part.tag?
          @tag part
        else
          @code part

  value: (value) ->
    @code value.identifier
    if value.next?
      tag = value.next
      switch tag.name
        when 'Access'
          @group tag, '[', ']'
        when 'Invoke'
          @group tag, '(', ')'
        when 'Member'
          @code '.'
          @value tag.value

  group: (tag,open,close) ->
    @code open if open?
    if tag.content? and Array.isArray tag.content 
      for c in tag.content
        if c?.tag?
          @tag c
        else if c?
          @code c
    @code close if close?
  
  source: (context) ->

    context ?= {}

    ctx = []
    for k,v of context
      ctx.push ','
      ctx.push k
      ctx.push '=this.'
      ctx.push k


    
    [ 'var __out=[],write=__out.push.bind(__out),__tmp=0'
      ctx.join('')
      ';'
      @buffer.join('')
      'return __out.join(\'\');'
    ].join('')

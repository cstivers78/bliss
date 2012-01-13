var Writer;

module.exports = Writer = (function() {

  function Writer() {
    this.buffer = [];
    this.parameters = [];
  }

  Writer.prototype.code = function(code) {
    return this.buffer.push(code);
  };

  Writer.prototype.text = function(text) {
    text = text.replace(/\n/g, '\\n').replace(/"/g, '\\"').replace(/'/g, "\\'");
    this.buffer.push('write("');
    this.buffer.push(text);
    return this.buffer.push('");\n');
  };

  Writer.prototype.write = function(elements) {
    var element, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
      element = elements[_i];
      if (element != null) {
        if (element.tag != null) {
          _results.push(this.tag(element));
        } else {
          _results.push(this.text(element));
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Writer.prototype.tag = function(tag) {
    var c, index, _i, _len, _ref;
    switch (tag.name) {
      case 'Anchor':
        return this.tag(tag.content);
      case 'Content':
        return this.text(tag.content);
      case 'Block':
        this.code('{');
        if ((tag.content != null) && Array.isArray(tag.content)) {
          _ref = tag.content;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            c = _ref[_i];
            if ((c != null ? c.tag : void 0) != null) {
              this.tag(c);
            } else if (c != null) {
              this.text(c);
            }
          }
        }
        return this.code('}');
      case 'Value':
        index = this.values;
        this.code('__tmp=');
        this.value(tag);
        this.code(';');
        this.code('if(__tmp !== undefined || __tmp !== null){');
        this.code('write(__tmp);');
        return this.code('}');
      case 'Parameters':
        return this.parameters = tag.parameters;
      case 'Func':
        this.code('function');
        this.tag(tag.args);
        this.code('{');
        this.code('var __out=[],write=__out.push.bind(__out),__tmp=0;');
        this.tag(tag.block);
        this.code('return __out.join(\'\');');
        return this.code('}');
      default:
        if (tag.parts != null) return this.parts(tag.parts());
    }
  };

  Writer.prototype.parts = function(parts) {
    var part, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = parts.length; _i < _len; _i++) {
      part = parts[_i];
      if (part != null) {
        if (part.tag != null) {
          _results.push(this.tag(part));
        } else {
          _results.push(this.code(part));
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Writer.prototype.value = function(value) {
    var tag;
    this.code(value.identifier);
    if (value.next != null) {
      tag = value.next;
      switch (tag.name) {
        case 'Access':
          return this.group(tag, '[', ']');
        case 'Invoke':
          return this.group(tag, '(', ')');
        case 'Member':
          this.code('.');
          return this.value(tag.value);
      }
    }
  };

  Writer.prototype.group = function(tag, open, close) {
    var c, _i, _len, _ref;
    if (open != null) this.code(open);
    if ((tag.content != null) && Array.isArray(tag.content)) {
      _ref = tag.content;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if ((c != null ? c.tag : void 0) != null) {
          this.tag(c);
        } else if (c != null) {
          this.code(c);
        }
      }
    }
    if (close != null) return this.code(close);
  };

  Writer.prototype.source = function(context) {
    var ctx, k, v;
    if (context == null) context = {};
    ctx = [];
    for (k in context) {
      v = context[k];
      ctx.push(',');
      ctx.push(k);
      ctx.push('=this.');
      ctx.push(k);
    }
    return ['var __out=[],write=__out.push.bind(__out),__tmp=0', ctx.join(''), ';', this.buffer.join(''), 'return __out.join(\'\');'].join('');
  };

  return Writer;

})();

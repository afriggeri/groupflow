// Generated by CoffeeScript 1.3.1
(function() {
  var Container, Crossings, Data, Draggable, Edge, Group, Mark, Person, Queue, Session, Sessions, Set, Solver, Sync, arrowPath, cross,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Raphael.el.hasClass = function(cls) {
    var _ref;
    return ((_ref = this.node.getAttribute('class')) != null ? _ref : "").split(' ').indexOf(cls) !== -1;
  };

  Raphael.el.addClass = function(cls) {
    var currentClass, _ref;
    currentClass = ((_ref = this.node.getAttribute('class')) != null ? _ref : "").split(' ');
    if (currentClass.indexOf(cls) !== -1) {
      return;
    }
    currentClass.push(cls);
    this.node.setAttribute('class', currentClass.join(' '));
    return this;
  };

  Raphael.el.removeClass = function(cls) {
    var currentClass, position, _ref;
    currentClass = ((_ref = this.node.getAttribute('class')) != null ? _ref : "").split(' ');
    position = currentClass.indexOf(cls);
    if (position === -1) {
      return;
    }
    currentClass.splice(position, 1);
    this.node.setAttribute('class', currentClass.join(' '));
    return this;
  };

  Raphael.el.toggleClass = function(cls, bool) {
    var currentClass, _ref;
    currentClass = ((_ref = this.node.getAttribute('class')) != null ? _ref : "").split(' ');
    currentClass.indexOf(cls);
    if (bool != null) {
      if (bool) {
        this.addClass(cls);
      } else {
        this.removeClass(cls);
      }
    } else {
      if (this.hasClass(cls)) {
        this.removeClass(cls);
      } else {
        this.addClass(cls);
      }
    }
    return this;
  };

  arrowPath = function(x, y, width, height, tip, dir) {
    return "M\n  " + x + "\n  " + (y + height / 2) + "\nL\n  " + (x + width) + "\n  " + (y + height / 2) + "\nL\n  " + (x + width) + "\n  " + (y + height / 2 + dir * (height - tip)) + "\nL\n  " + (x + width / 2) + "\n  " + (y + height / 2 + dir * height) + "\nL\n  " + x + "\n  " + (y + height / 2 + dir * (height - tip)) + "\nZ";
  };

  Object.defineProperty(Object.prototype, 'mixin', {
    value: function(Mixin) {
      var key, value, _ref;
      for (key in Mixin) {
        value = Mixin[key];
        this[key] = value;
      }
      _ref = Mixin.prototype;
      for (key in _ref) {
        value = _ref[key];
        this.prototype[key] = value;
      }
      return this;
    },
    enumerable: false
  });

  Queue = [];

  Queue.run = function() {
    var fn;
    if ((fn = Queue.shift()) == null) {
      return setTimeout(Queue.run, 50);
    }
    return fn(function(next) {
      if (next != null) {
        Queue.push(next);
      }
      return setTimeout(Queue.run, 50);
    });
  };

  Queue.run();

  Set = (function() {

    Set.name = 'Set';

    function Set() {}

    Set.nextUid = 0;

    Set.prototype.add = function(item) {
      if (item.setId == null) {
        item.setId = Set.nextUid++;
      }
      return this[item.setId] = item;
    };

    Set.prototype.remove = function(item) {
      return delete this[item.setId];
    };

    Set.prototype.has = function(item) {
      return (item.setId != null) && (this[item.setId] != null);
    };

    return Set;

  })();

  Sync = (function() {

    Sync.name = 'Sync';

    function Sync() {}

    Sync.prototype.property = function() {
      var fn, name, names, _i, _j, _len, _results,
        _this = this;
      names = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), fn = arguments[_i++];
      _results = [];
      for (_j = 0, _len = names.length; _j < _len; _j++) {
        name = names[_j];
        _results.push((function(name) {
          if (_this.properties == null) {
            _this.properties = {};
          }
          return Object.defineProperty(_this, name, {
            set: function(value) {
              if (this.properties[name] === value) {
                return;
              }
              this.properties[name] = value;
              return fn.call(this, value);
            },
            get: function() {
              return this.properties[name];
            }
          });
        })(name));
      }
      return _results;
    };

    return Sync;

  })();

  Container = (function(_super) {

    __extends(Container, _super);

    Container.name = 'Container';

    function Container() {
      return Container.__super__.constructor.apply(this, arguments);
    }

    Container.prototype.push = function(item) {
      item.container = this;
      item.index = this.length;
      item.dirty = true;
      item.root = this.root;
      Container.__super__.push.call(this, item);
      Object.defineProperty(item, "previous", {
        get: function() {
          return this.container[this.index - 1];
        }
      });
      Object.defineProperty(item, "next", {
        get: function() {
          return this.container[this.index + 1];
        }
      });
      item.update();
      return item;
    };

    Container.prototype.pair = function() {
      var n1, n2;
      n1 = Math.floor(Math.random() * this.length);
      n2 = n1;
      while (n1 === n2) {
        n2 = Math.floor(Math.random() * this.length);
      }
      return [this[n1], this[n2]];
    };

    Container.prototype.swap = function(item1, item2) {
      var index1, index2;
      this.dirty = true;
      item1.dirty = true;
      item2.dirty = true;
      index1 = item1.index;
      index2 = item2.index;
      this[item1.index = index2] = item1;
      return this[item2.index = index1] = item2;
    };

    Container.prototype.move = function(item, position) {
      var delta, other, _results;
      this.dirty = true;
      delta = position > item.index ? 1 : -1;
      _results = [];
      while (item.index !== position) {
        other = this[item.index + delta];
        _results.push(this.swap(item, other));
      }
      return _results;
    };

    return Container;

  })(Array);

  Solver = (function() {

    Solver.name = 'Solver';

    Solver.diverge = 8;

    function Solver(crossings, dir) {
      this.crossings = crossings;
      this.dir = dir;
      this.active = false;
      this.subject = this.crossings.container;
    }

    Solver.prototype.toggle = function() {
      if (this.active) {
        return this.stop();
      } else {
        return this.start();
      }
    };

    Solver.prototype.stop = function() {
      this.active = false;
      this.subject.update();
      return this.subject.draw();
    };

    Solver.prototype.start = function() {
      var step,
        _this = this;
      this.active = true;
      this.subject.update();
      this.subject.draw();
      return Queue.push(step = function(next) {
        var cost, costs, el1, el2, i, minCost, pairs, startCost, _i, _j, _ref, _ref1, _ref2, _ref3;
        pairs = [];
        costs = [];
        startCost = minCost = _this.crossings[_this.dir];
        if (cost === 0) {
          _this.stop();
          return next();
        }
        _this.subject.root.updateCrossings = false;
        for (i = _i = 0, _ref = Solver.diverge; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          pairs.push((_ref1 = _this.subject.pair(), el1 = _ref1[0], el2 = _ref1[1], _ref1));
          _this.subject.swap(el1, el2);
          _this.subject.update();
          costs.push(cost = _this.crossings[_this.dir]);
          minCost = Math.min(cost, minCost);
        }
        for (i = _j = _ref2 = Solver.diverge; _ref2 <= 0 ? _j <= 0 : _j >= 0; i = _ref2 <= 0 ? ++_j : --_j) {
          if (costs[i] === minCost && minCost !== startCost) {
            break;
          }
          _ref3 = pairs[i], el1 = _ref3[0], el2 = _ref3[1];
          _this.subject.swap(el1, el2);
          _this.subject.update();
        }
        if (minCost === 0) {
          _this.stop();
          return next();
        }
        _this.subject.root.updateCrossings = true;
        _this.subject.root.draw();
        return next(_this.active ? step : void 0);
      });
    };

    return Solver;

  })();

  Crossings = (function() {

    Crossings.name = 'Crossings';

    Crossings.mixin(Sync);

    function Crossings(container, change) {
      this.container = container;
      this.property("up", function(value) {
        return change("up", value);
      });
      this.property("down", function(value) {
        return change("down", value);
      });
      this.properties.up = 0;
      this.properties.down = 0;
      this.solver = {
        up: new Solver(this, "up"),
        down: new Solver(this, "down")
      };
    }

    return Crossings;

  })();

  cross = function(f1, t1, f2, t2) {
    return ((f1 < f2) && (t1 > t2)) || ((f1 > f2) && (t1 < t2));
  };

  Edge = (function() {

    Edge.name = 'Edge';

    Edge.mixin(Sync);

    function Edge(from, to) {
      this.from = from;
      this.to = to;
      this.crossings = new Set;
      this.property("dirty", function(dirty) {
        if (dirty) {
          this.from.dirty = true;
          this.to.dirty = true;
          this.from.container.dirty = true;
          this.to.container.container.dirty = true;
          return this.from.container.container.dirty = true;
        }
      });
      this.update();
    }

    Edge.prototype.update = function() {
      var delta, edge, edgeFromGroup, edgeToGroup, group, mark, thisFromGroup, thisFromSession, thisToGroup, thisToSession, _i, _j, _k, _len, _len1, _len2;
      this.dirty = true;
      thisFromGroup = this.from.container;
      thisToGroup = this.to.container;
      thisFromSession = thisFromGroup.container;
      thisToSession = thisToGroup.container;
      this.from.root.updateCrossings = false;
      for (_i = 0, _len = thisFromSession.length; _i < _len; _i++) {
        group = thisFromSession[_i];
        for (_j = 0, _len1 = group.length; _j < _len1; _j++) {
          mark = group[_j];
          for (_k = 0, _len2 = mark.length; _k < _len2; _k++) {
            edge = mark[_k];
            if (!(edge !== this)) {
              continue;
            }
            edgeFromGroup = edge.from.container;
            edgeToGroup = edge.to.container;
            if (edgeFromGroup.container !== thisFromSession) {
              continue;
            }
            delta = 0;
            if (cross(this.from.x, this.to.x, edge.from.x, edge.to.x)) {
              if (!this.crossings.has(edge)) {
                this.crossings.add(edge);
                edge.crossings.add(this);
                delta = 1;
              }
            } else {
              if (this.crossings.has(edge)) {
                this.crossings.remove(edge);
                edge.crossings.remove(this);
                delta = -1;
              }
            }
            if (delta !== 0) {
              thisFromGroup.crossings.global.down += delta;
              thisToGroup.crossings.global.up += delta;
              if (thisFromGroup === edgeFromGroup) {
                thisFromGroup.crossings.local.down += delta;
              } else {
                edgeFromGroup.crossings.global.down += delta;
              }
              if (thisToGroup === edgeToGroup) {
                thisToGroup.crossings.local.up += delta;
              } else {
                edgeToGroup.crossings.global.up += delta;
              }
              thisFromSession.crossings.down += delta;
              thisToSession.crossings.up += delta;
            }
          }
        }
      }
      return this.from.root.updateCrossings = false;
    };

    Edge.prototype.path = function() {
      this.dirty = false;
      return "M\n  " + (this.from.x + Mark.width / 2) + " \n  " + (this.from.y + Mark.height) + "\nC\n  " + (this.from.x + Mark.width / 2) + " \n  " + ((this.from.y + Mark.height + this.to.y) / 2) + " \n  \n  " + (this.to.x + Mark.width / 2) + "\n  " + ((this.from.y + Mark.height + this.to.y) / 2) + " \n  \n  " + (this.to.x + Mark.width / 2) + "\n  " + this.to.y;
    };

    return Edge;

  })();

  Draggable = (function() {

    Draggable.name = 'Draggable';

    function Draggable() {}

    Draggable.prototype.dragStart = function() {
      return this.startX = this.x;
    };

    Draggable.prototype.dragMove = function(dx, dy) {
      var other;
      this.hasDragged = true;
      this.x = this.startX + dx;
      this.update(this.x);
      this.draw();
      this.root.updateCrossings = false;
      while ((other = this.previous) != null) {
        if (this.x + this.width / 2 < other.x + other.width / 2) {
          this.container.swap(this, other);
          other.update();
        } else {
          break;
        }
      }
      while ((other = this.next) != null) {
        if (this.x + this.width / 2 > other.x + other.width / 2) {
          this.container.swap(this, other);
          other.update();
        } else {
          break;
        }
      }
      this.root.updateCrossings = true;
      return this.root.draw();
    };

    Draggable.prototype.dragEnd = function() {
      delete this.startX;
      this.root.updateCrossings = true;
      this.update();
      this.draw();
      return this.root.draw();
    };

    return Draggable;

  })();

  Mark = (function(_super) {

    __extends(Mark, _super);

    Mark.name = 'Mark';

    Mark.mixin(Sync);

    Mark.mixin(Draggable);

    Mark.width = 5;

    Mark.height = 30;

    function Mark(person) {
      this.person = person;
      this.property("dirty", function(dirty) {
        if (dirty) {
          return this.person.dirty = true;
        }
      });
      this.property("x", "index", "active", function() {
        return this.dirty = true;
      });
      this.width = Mark.width;
      this.height = Mark.height;
      this.shape = paper.rect(0, 0, Mark.width, Mark.height / 2, Mark.width / 2).addClass('button mark').hide().drag(this.dragMove.bind(this), this.dragStart.bind(this), this.dragEnd.bind(this));
    }

    Mark.prototype.update = function(x) {
      var edge, _i, _len, _results;
      this.dirty = true;
      this.y = this.container.y + Group.padding;
      this.x = x != null ? x : this.container.x + Group.padding + this.index * Mark.width;
      _results = [];
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        edge = this[_i];
        _results.push(edge.update());
      }
      return _results;
    };

    Mark.prototype.path = function() {
      var edge;
      return ("M\n  " + (this.x + Mark.width / 2) + " \n  " + this.y + "\nL\n  " + (this.x + Mark.width / 2) + " \n  " + (this.y + Mark.height)) + ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          edge = this[_i];
          if (edge.from === this) {
            _results.push(edge.path());
          }
        }
        return _results;
      }).call(this)).join();
    };

    Mark.prototype.draw = function() {
      if (!this.dirty) {
        return;
      }
      this.person.draw();
      this.shape.attr({
        x: this.x,
        y: this.y + Mark.height / 4
      });
      if (this.active) {
        this.shape.toFront().show();
      } else {
        this.shape.hide();
      }
      return this.dirty = false;
    };

    return Mark;

  })(Array);

  Group = (function(_super) {

    __extends(Group, _super);

    Group.name = 'Group';

    Group.mixin(Sync);

    Group.mixin(Draggable);

    Group.padding = 10;

    Group.margin = 20;

    Group.height = Group.padding + Mark.height + Group.padding;

    Group.active = null;

    Group.select = function(group) {
      if ((Group.selected != null) && (group != null) && Group.selected !== group) {
        Group.select(null);
      }
      if (group != null) {
        Group.selected = group;
        Session.selected = group.container;
        group.selected = true;
        group.root.updateCrossings = true;
        Group.selected.draw();
        return $('#monitor').show();
      } else {
        if (Group.selected) {
          Group.selected.selected = false;
          Group.selected.draw();
        }
        Group.selected = null;
        return $('#monitor').hide();
      }
    };

    function Group() {
      this.click = __bind(this.click, this);

      var _this = this;
      this.property("x", "index", function() {
        return this.dirty = true;
      });
      this.property("dirty", function(dirty) {
        var mark, _i, _len, _results;
        if (dirty) {
          _results = [];
          for (_i = 0, _len = this.length; _i < _len; _i++) {
            mark = this[_i];
            _results.push(mark.dirty = true);
          }
          return _results;
        }
      });
      this.property("selected", function(selected) {
        var mark, _i, _len, _results;
        this.dirty = true;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          mark = this[_i];
          _results.push(mark.person.highlighted = selected);
        }
        return _results;
      });
      this.crossings = {
        local: new Crossings(this, (function(dir, crossings) {
          return _this.renderCrossings("local", dir);
        })),
        global: new Crossings(this, (function(dir, crossings) {
          return _this.renderCrossings("global", dir);
        }))
      };
      this.selected = false;
      this.height = Group.height;
      this.width = 2 * Group.padding;
      this.hasDragged = false;
      this.shape = paper.rect(0, 0, 0, Group.height, 4, 4).addClass('button group').click(this.click).drag(this.dragMove.bind(this), this.dragStart.bind(this), this.dragEnd.bind(this));
    }

    Group.prototype.click = function() {
      if (!this.hasDragged) {
        Group.select(Group.selected !== this ? this : void 0);
      }
      return this.hasDragged = false;
    };

    Group.prototype.push = function(mark) {
      this.width += Mark.width;
      return Group.__super__.push.call(this, mark);
    };

    Group.prototype.pair = function() {
      var e1, e2, i, m1, m2, _i, _j, _k, _len, _len1, _ref, _ref1;
      for (i = _i = 1, _ref = this.length; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        _ref1 = Group.__super__.pair.call(this), m1 = _ref1[0], m2 = _ref1[1];
        for (_j = 0, _len = m1.length; _j < _len; _j++) {
          e1 = m1[_j];
          for (_k = 0, _len1 = m2.length; _k < _len1; _k++) {
            e2 = m2[_k];
            if (e1.crossings.has(e2)) {
              return [m1, m2];
            }
          }
        }
      }
      return Group.__super__.pair.call(this);
    };

    Group.prototype.update = function(x) {
      var mark, _i, _len, _results,
        _this = this;
      this.dirty = true;
      this.y = this.container.y + Group.margin;
      this.x = x != null ? x : this.container.filter(function(g) {
        return g.index < _this.index;
      }).reduce((function(x, g) {
        return x + g.width + Group.margin;
      }), this.container.x);
      _results = [];
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        mark = this[_i];
        _results.push(mark.update());
      }
      return _results;
    };

    Group.prototype.renderCrossings = function(type, dir) {
      if (!(this === Group.selected && this.root.updateCrossings)) {
        return;
      }
      return $("#" + type + "-" + dir).text(this.crossings[type][dir]);
    };

    Group.prototype.displayCrossings = function() {
      this.renderCrossings("local", "up");
      this.renderCrossings("local", "down");
      this.renderCrossings("global", "up");
      return this.renderCrossings("global", "down");
    };

    Group.prototype.computing = function() {
      return this.crossings.local.solver.up.active || this.crossings.local.solver.down.active || this.crossings.global.solver.up.active || this.crossings.global.solver.down.active;
    };

    Group.prototype.draw = function() {
      var dir, mark, type, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      if (!this.dirty) {
        return;
      }
      this.shape.attr({
        x: this.x,
        y: this.y,
        width: this.width
      }).toggleClass('selected', this.selected).toggleClass('computing', this.computing());
      if (this.selected) {
        _ref = ['local', 'global'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          type = _ref[_i];
          _ref1 = ['up', 'down'];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            dir = _ref1[_j];
            $("#" + type + "-" + dir + "-toggle").toggleClass('computing', this.crossings[type].solver[dir].active);
          }
        }
      }
      if (this.selected) {
        this.displayCrossings();
      }
      for (_k = 0, _len2 = this.length; _k < _len2; _k++) {
        mark = this[_k];
        mark.draw();
      }
      return this.dirty = false;
    };

    return Group;

  })(Container);

  Session = (function(_super) {

    __extends(Session, _super);

    Session.name = 'Session';

    Session.mixin(Sync);

    Session.buttonWidth = 30;

    Session.buttonHeight = 25;

    Session.buttonTip = 10;

    Session.margin = 140;

    Session.separator = 50;

    Session.height = Group.height + Session.separator;

    function Session() {
      var _this = this;
      this.crossings = new Crossings(this, function(dir, crossings) {
        return _this.renderCrossings(dir);
      });
      this.height = Session.height;
      this.x = Session.margin;
      this.labels = {
        up: paper.text(1.5 * Group.margin + Session.buttonWidth, 0, "").hide().addClass('session-label'),
        down: paper.text(1.5 * Group.margin + Session.buttonWidth, 0, "").hide().addClass('session-label')
      };
      this.arrows = {
        up: paper.path("M0 0").addClass('button session turn').hide().click(function() {
          return _this.click('up');
        }),
        down: paper.path("M0 0").addClass('button session').hide().click(function() {
          return _this.click('down');
        })
      };
    }

    Session.prototype.click = function(dir) {
      if (((this.previous != null) && dir === 'up') || ((this.next != null) && dir === 'down')) {
        return this.crossings.solver[dir].toggle();
      }
    };

    Session.prototype.update = function() {
      var group, _i, _len, _results;
      this.dirty = true;
      this.y = this.previous != null ? this.previous.y + Session.height : 0;
      _results = [];
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        group = this[_i];
        _results.push(group.update());
      }
      return _results;
    };

    Session.prototype.computing = function() {
      return this.crossings.solver.up.active || this.crossings.solver.down.active;
    };

    Session.prototype.renderCrossings = function(dir) {
      if (!this.root.updateCrossings) {
        return;
      }
      return this.labels[dir].attr("text", this.crossings[dir]);
    };

    Session.prototype.draw = function(bubble) {
      var group, _i, _len;
      if (!this.dirty) {
        return;
      }
      if (this.previous != null) {
        this.labels.up.show().attr('y', this.y + Group.margin + Group.height / 2 - 16);
        this.renderCrossings("up");
        this.arrows.up.show().node.setAttribute("d", arrowPath(Group.margin, this.y + Group.margin + Group.height / 2 - 5 - Session.buttonHeight / 2, Session.buttonWidth, Session.buttonHeight, Session.buttonTip, -1));
        this.arrows.up.toggleClass('computing', this.crossings.solver.up.active);
      }
      if (this.next != null) {
        this.labels.down.show().attr('y', this.y + Group.margin + Group.height / 2 + 16);
        this.renderCrossings("down");
        this.arrows.down.toggleClass('computing', this.crossings.solver.down.active);
        this.arrows.down.show().node.setAttribute("d", arrowPath(Group.margin, this.y + Group.margin + Group.height / 2 + 5 - Session.buttonHeight / 2, Session.buttonWidth, Session.buttonHeight, Session.buttonTip, 1));
      }
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        group = this[_i];
        group.draw();
      }
      this.dirty = false;
      if (this.previous != null) {
        this.previous.draw();
      }
      if (this.next != null) {
        return this.next.draw();
      }
    };

    return Session;

  })(Container);

  Sessions = (function(_super) {

    __extends(Sessions, _super);

    Sessions.name = 'Sessions';

    function Sessions(root) {
      this.root = root;
    }

    Sessions.prototype.draw = function() {
      var session, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        session = this[_i];
        _results.push(session.draw());
      }
      return _results;
    };

    return Sessions;

  })(Container);

  Person = (function(_super) {

    __extends(Person, _super);

    Person.name = 'Person';

    Person.mixin(Sync);

    Person.selected = null;

    function Person(id) {
      this.id = id;
      this.out = __bind(this.out, this);

      this.over = __bind(this.over, this);

      this.above = [];
      this.current = [];
      this.property("dirty", function(dirty) {
        var mark, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          mark = this[_i];
          _results.push(mark.dirty = true);
        }
        return _results;
      });
      this.property("highlighted", function(highlighted) {
        this.dirty = true;
        return this.shape.toggleClass('highlighted', highlighted);
      });
      this.property("active", function(active) {
        var mark, _i, _len, _results;
        Person.selected = active ? this : null;
        this.dirty = true;
        this.shape.toggleClass('highlighted', active || this.highlighted);
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          mark = this[_i];
          _results.push(mark.active = active);
        }
        return _results;
      });
      this.shape = paper.path("M0 0").addClass('edge').mouseover(this.over).mouseout(this.out);
    }

    Person.prototype.over = function() {
      this.active = true;
      return this.draw();
    };

    Person.prototype.out = function() {
      this.active = false;
      return this.draw();
    };

    Person.prototype.push = function(mark) {
      mark.shape.mouseover(this.over).mouseout(this.out);
      return Person.__super__.push.call(this, mark);
    };

    Person.prototype.draw = function() {
      var mark, _i, _len, _results;
      if (!this.dirty) {
        return;
      }
      this.shape.node.setAttribute("d", ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          mark = this[_i];
          _results.push(mark.path());
        }
        return _results;
      }).call(this)).join());
      this.shape.toFront();
      this.dirty = false;
      _results = [];
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        mark = this[_i];
        mark.draw();
        _results.push(mark.shape.toFront());
      }
      return _results;
    };

    Person.prototype.move = function(dir) {
      var appearedIn, mark, other, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1;
      appearedIn = {};
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        mark = this[_i];
        if (mark.container.container.index in appearedIn) {
          return;
        }
        appearedIn[mark.container.container.index] = true;
      }
      for (_j = 0, _len1 = this.length; _j < _len1; _j++) {
        mark = this[_j];
        if (dir === "left") {
          mark.container.move(mark, 0);
        } else {
          mark.container.move(mark, mark.container.length - 1);
        }
        mark.update();
      }
      for (_k = 0, _len2 = this.length; _k < _len2; _k++) {
        mark = this[_k];
        _ref = mark.container;
        for (_l = 0, _len3 = _ref.length; _l < _len3; _l++) {
          other = _ref[_l];
          other.update();
        }
      }
      for (_m = 0, _len4 = this.length; _m < _len4; _m++) {
        mark = this[_m];
        _ref1 = mark.container;
        for (_n = 0, _len5 = _ref1.length; _n < _len5; _n++) {
          other = _ref1[_n];
          other.person.draw();
        }
      }
      return this.draw();
    };

    return Person;

  })(Array);

  Data = (function() {

    Data.name = 'Data';

    function Data(sessions) {
      var edge, gid, group, groups, id, mark, members, mid, parent, person, session, sid, _, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref, _ref1;
      this.sessions = new Sessions(this);
      this.persons = {};
      for (_i = 0, _len = sessions.length; _i < _len; _i++) {
        groups = sessions[_i];
        for (_j = 0, _len1 = groups.length; _j < _len1; _j++) {
          members = groups[_j];
          for (_k = 0, _len2 = members.length; _k < _len2; _k++) {
            id = members[_k];
            if (!this.persons[id]) {
              person = new Person(id);
              this.persons[id] = person;
              person.root = this;
            }
          }
        }
      }
      for (sid = _l = 0, _len3 = sessions.length; _l < _len3; sid = ++_l) {
        groups = sessions[sid];
        session = this.sessions.push(new Session);
        for (gid = _m = 0, _len4 = groups.length; _m < _len4; gid = ++_m) {
          members = groups[gid];
          group = session.push(new Group);
          for (mid = _n = 0, _len5 = members.length; _n < _len5; mid = ++_n) {
            id = members[mid];
            person = this.persons[id];
            mark = group.push(new Mark(person));
            person.push(mark);
            person.current.push(mark);
            _ref = person.above;
            for (_o = 0, _len6 = _ref.length; _o < _len6; _o++) {
              parent = _ref[_o];
              edge = new Edge(parent, mark);
              parent.push(edge);
              mark.push(edge);
            }
          }
        }
        _ref1 = this.persons;
        for (_ in _ref1) {
          person = _ref1[_];
          person.above = person.current;
          person.current = [];
        }
      }
      this.updateCrossings = true;
      this.draw();
    }

    Data.prototype.draw = function() {
      var person, _i, _len, _ref, _results;
      this.sessions.draw();
      _ref = this.persons;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        person = _ref[_i];
        _results.push(person.draw());
      }
      return _results;
    };

    Data.prototype["export"] = function() {
      var group, mark, outGroup, outSession, outSessions, session, _i, _j, _k, _len, _len1, _len2, _ref;
      outSessions = [];
      _ref = this.sessions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        session = _ref[_i];
        outSessions.push(outSession = []);
        for (_j = 0, _len1 = session.length; _j < _len1; _j++) {
          group = session[_j];
          outSession.push(outGroup = []);
          for (_k = 0, _len2 = group.length; _k < _len2; _k++) {
            mark = group[_k];
            outGroup.push(mark.person.id);
          }
        }
      }
      return JSON.stringify(outSessions);
    };

    return Data;

  })();

  jQuery(function() {
    var $save, data, dataStr, lastSaved, meta, move, save;
    data = (dataStr = window.localStorage.getItem("data")) != null ? JSON.parse(dataStr) : window.data;
    lastSaved = window.localStorage.getItem("save-date");
    if (lastSaved != null) {
      $('#save-date').text("last saved: " + lastSaved);
    }
    window.paper = Raphael(0, 0, 900, Session.height * data.length);
    save = function() {
      var now;
      if ($('#save').attr('disabled') === "disabled") {
        return;
      }
      $('#save').attr('disabled', true);
      window.localStorage.setItem('data', dataRoot["export"]());
      now = new Date;
      lastSaved = "" + (now.getDate()) + "/" + (1 + now.getMonth()) + "/" + (now.getFullYear()) + " @ " + (now.getHours()) + ":" + (now.getMinutes());
      window.localStorage.setItem('save-date', lastSaved);
      return setTimeout((function() {
        $('#save').attr('disabled', false);
        return $('#save-date').text("last saved: " + lastSaved);
      }), 1000);
    };
    $save = $('#save').click(save);
    $('#download').click(function() {
      return window.open('data:application/javascript,' + encodeURIComponent("/* \n  save as data.js and replace old version with this one \n*/\n\ndata = " + (dataRoot["export"]()) + ";"));
    });
    move = function(dir) {
      if (Person.selected == null) {
        return;
      }
      return Person.selected.move(dir);
    };
    $(document).keypress(function(e) {
      var bindings, key;
      key = String.fromCharCode(e.which);
      if (key === "w") {
        move('left');
        return false;
      }
      if (key === "x") {
        move("right");
        return false;
      }
      if (Group.selected == null) {
        return true;
      }
      bindings = {
        a: Session.selected.crossings.solver.up,
        q: Session.selected.crossings.solver.down,
        z: Group.selected.crossings.local.solver.up,
        s: Group.selected.crossings.local.solver.down,
        e: Group.selected.crossings.global.solver.up,
        d: Group.selected.crossings.global.solver.down
      };
      if (!(key in bindings)) {
        return true;
      }
      bindings[key].toggle();
      return false;
    });
    meta = false;
    $(document).keydown(function(e) {
      var closest, d, dir, distance, group, minimum, other, session, _i, _len, _ref, _ref1;
      if (meta === true && e.which === 83) {
        save();
        return false;
      }
      if (e.metaKey) {
        return meta = true;
      }
      meta = false;
      if (!((37 <= (_ref = e.which) && _ref <= 40) || e.which === 27)) {
        return true;
      }
      if (Group.selected == null) {
        Group.select(dataRoot.sessions[0][0]);
        return false;
      }
      if (e.which === 27) {
        Group.select(null);
        return false;
      }
      group = Group.selected;
      session = Session.selected;
      if (e.which === 37) {
        Group.select(group.previous != null ? group.previous : session[session.length - 1]);
        return false;
      }
      if (e.which === 39) {
        Group.select(group.next != null ? group.next : session[0]);
        return false;
      }
      dir = {
        38: "previous",
        40: "next"
      }[e.which];
      if (session[dir] != null) {
        distance = function(g1, g2) {
          return Math.abs(g1.x + g1.width / 2 - g2.x - g2.width / 2);
        };
        closest = session[dir][0];
        minimum = distance(group, closest);
        _ref1 = session[dir];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          other = _ref1[_i];
          if ((d = distance(group, other)) < minimum) {
            minimum = d;
            closest = other;
          }
        }
        Group.select(closest);
      }
      return false;
    });
    window.dataRoot = new Data(data);
    $('#loading').hide();
    return $save.attr('disabled', false);
  });

}).call(this);

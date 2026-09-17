!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [2274],
    {
      62505: function (t, e, i) {
        var s = i(26576),
          n = [];
        Component({
          data: { nodes: [] },
          properties: {
            containerStyle: String,
            content: {
              type: String,
              value: "",
              observer: function (t) {
                this.setContent(t);
              },
            },
            copyLink: { type: Boolean, value: !0 },
            domain: String,
            errorImg: String,
            lazyLoad: Boolean,
            loadingImg: String,
            pauseVideo: { type: Boolean, value: !0 },
            previewImg: { type: null, value: !0 },
            scrollTable: Boolean,
            selectable: null,
            setTitle: { type: Boolean, value: !0 },
            showImgMenu: { type: Boolean, value: !0 },
            tagStyle: Object,
            useAnchor: null,
          },
          created: function () {
            this.plugins = [];
            for (var t = n.length; t--; ) this.plugins.push(new n[t](this));
          },
          detached: function () {
            this._hook("onDetached");
          },
          methods: {
            in: function (t, e, i) {
              t &&
                e &&
                i &&
                (this._in = { page: t, selector: e, scrollTop: i });
            },
            navigateTo: function (t, e) {
              var i = this;
              return new Promise(function (s, n) {
                if (i.data.useAnchor) {
                  var a = wx
                    .createSelectorQuery()
                    .in(i._in ? i._in.page : i)
                    .select(
                      (i._in ? i._in.selector : "._root") +
                        (t ? "".concat(">>>", "#").concat(t) : "")
                    )
                    .boundingClientRect();
                  i._in
                    ? a
                        .select(i._in.selector)
                        .scrollOffset()
                        .select(i._in.selector)
                        .boundingClientRect()
                    : a.selectViewport().scrollOffset(),
                    a.exec(function (t) {
                      if (t[0]) {
                        var a =
                          t[1].scrollTop +
                          t[0].top -
                          (t[2] ? t[2].top : 0) +
                          (e || parseInt(i.data.useAnchor) || 0);
                        i._in
                          ? i._in.page.setData(
                              (function (t, e, i) {
                                return (
                                  e in t
                                    ? Object.defineProperty(t, e, {
                                        value: i,
                                        enumerable: !0,
                                        configurable: !0,
                                        writable: !0,
                                      })
                                    : (t[e] = i),
                                  t
                                );
                              })({}, i._in.scrollTop, a)
                            )
                          : wx.pageScrollTo({ scrollTop: a, duration: 300 }),
                          s();
                      } else n(Error("Label not found"));
                    });
                } else n(Error("Anchor is disabled"));
              });
            },
            getText: function (t) {
              var e = "";
              return (
                (function t(i) {
                  for (var s = 0; s < i.length; s++) {
                    var n = i[s];
                    if ("text" === n.type) e += n.text.replace(/&amp;/g, "&");
                    else if ("br" === n.name) e += "\n";
                    else {
                      var a =
                        "p" === n.name ||
                        "div" === n.name ||
                        "tr" === n.name ||
                        "li" === n.name ||
                        ("h" === n.name[0] &&
                          n.name[1] > "0" &&
                          n.name[1] < "7");
                      a && e && "\n" !== e[e.length - 1] && (e += "\n"),
                        n.children && t(n.children),
                        a && "\n" !== e[e.length - 1]
                          ? (e += "\n")
                          : ("td" !== n.name && "th" !== n.name) || (e += "\t");
                    }
                  }
                })(t || this.data.nodes),
                e
              );
            },
            getRect: function () {
              var t = this;
              return new Promise(function (e, i) {
                wx.createSelectorQuery()
                  .in(t)
                  .select("._root")
                  .boundingClientRect()
                  .exec(function (t) {
                    return t[0] ? e(t[0]) : i(Error("Root label not found"));
                  });
              });
            },
            pauseMedia: function () {
              for (var t = (this._videos || []).length; t--; )
                this._videos[t].pause();
            },
            setPlaybackRate: function (t) {
              this.playbackRate = t;
              for (var e = (this._videos || []).length; e--; )
                this._videos[e].playbackRate(t);
            },
            setContent: function (t, e) {
              var i = this;
              (this.imgList && e) || (this.imgList = []), (this._videos = []);
              var n = {},
                a = new s(this).parse(t);
              if (e)
                for (var r = this.data.nodes.length, o = a.length; o--; )
                  n["nodes[".concat(r + o, "]")] = a[o];
              else n.nodes = a;
              if (
                (this.setData(n, function () {
                  i._hook("onLoad"), i.triggerEvent("load");
                }),
                this.data.lazyLoad ||
                  this.imgList._unloadimgs < this.imgList.length / 2)
              ) {
                var l = 0,
                  h = function t(e) {
                    (e && e.height) || (e = {}),
                      e.height === l
                        ? i.triggerEvent("ready", e)
                        : ((l = e.height),
                          setTimeout(function () {
                            i.getRect().then(t).catch(t);
                          }, 350));
                  };
                this.getRect().then(h).catch(h);
              } else
                this.imgList._unloadimgs ||
                  this.getRect()
                    .then(function (t) {
                      i.triggerEvent("ready", t);
                    })
                    .catch(function () {
                      i.triggerEvent("ready", {});
                    });
            },
            _hook: function (t) {
              for (var e = n.length; e--; )
                this.plugins[e][t] && this.plugins[e][t]();
            },
            _add: function (t) {
              t.detail.root = this;
            },
          },
        });
      },
      26576: function (t) {
        function e(t, e) {
          var s;
          if ("undefined" == typeof Symbol || null == t[Symbol.iterator]) {
            if (
              Array.isArray(t) ||
              (s = i(t)) ||
              (e && t && "number" == typeof t.length)
            ) {
              s && (t = s);
              var n = 0,
                a = function () {};
              return {
                s: a,
                n: function () {
                  return n >= t.length
                    ? { done: !0 }
                    : { done: !1, value: t[n++] };
                },
                e: function (t) {
                  throw t;
                },
                f: a,
              };
            }
            throw new TypeError(
              "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
            );
          }
          var r,
            o = !0,
            l = !1;
          return {
            s: function () {
              s = t[Symbol.iterator]();
            },
            n: function () {
              var t = s.next();
              return (o = t.done), t;
            },
            e: function (t) {
              (l = !0), (r = t);
            },
            f: function () {
              try {
                o || null == s.return || s.return();
              } finally {
                if (l) throw r;
              }
            },
          };
        }
        function i(t, e) {
          if (t) {
            if ("string" == typeof t) return s(t, e);
            var i = Object.prototype.toString.call(t).slice(8, -1);
            return (
              "Object" === i && t.constructor && (i = t.constructor.name),
              "Map" === i || "Set" === i
                ? Array.from(t)
                : "Arguments" === i ||
                  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)
                ? s(t, e)
                : void 0
            );
          }
        }
        function s(t, e) {
          (null == e || e > t.length) && (e = t.length);
          for (var i = 0, s = new Array(e); i < e; i++) s[i] = t[i];
          return s;
        }
        function n(t) {
          for (
            var e = Object.create(null), i = t.split(","), s = i.length;
            s--;

          )
            e[i[s]] = !0;
          return e;
        }
        function a(t, e) {
          for (var i = t.indexOf("&"); -1 !== i; ) {
            var s = t.indexOf(";", i + 3),
              n = void 0;
            if (-1 === s) break;
            "#" === t[i + 1]
              ? ((n = parseInt(
                  ("x" === t[i + 2] ? "0" : "") + t.substring(i + 2, s)
                )),
                isNaN(n) ||
                  (t =
                    t.substr(0, i) + String.fromCharCode(n) + t.substr(s + 1)))
              : ((n = t.substring(i + 1, s)),
                (d.entities[n] || ("amp" === n && e)) &&
                  (t =
                    t.substr(0, i) + (d.entities[n] || "&") + t.substr(s + 1))),
              (i = t.indexOf("&", i + 1));
          }
          return t;
        }
        function r(t) {
          for (var e = t.length - 1, i = e; i >= -1; i--)
            (-1 === i ||
              t[i].c ||
              !t[i].name ||
              ("div" !== t[i].name &&
                "p" !== t[i].name &&
                "h" !== t[i].name[0]) ||
              (t[i].attrs.style || "").includes("inline")) &&
              (e - i >= 5 &&
                t.splice(i + 1, e - i, {
                  name: "div",
                  attrs: {},
                  children: t.slice(i + 1, e + 1),
                }),
              (e = i - 1));
        }
        function o(t) {
          (this.options = t.data || {}),
            (this.tagStyle = Object.assign(
              {},
              d.tagStyle,
              this.options.tagStyle
            )),
            (this.imgList = t.imgList || []),
            (this.imgList._unloadimgs = 0),
            (this.plugins = t.plugins || []),
            (this.attrs = Object.create(null)),
            (this.stack = []),
            (this.nodes = []),
            (this.pre =
              (this.options.containerStyle || "").includes("white-space") &&
              this.options.containerStyle.includes("pre")
                ? 2
                : 0);
        }
        function l(t) {
          this.handler = t;
        }
        var h,
          c,
          d = {
            trustTags: n(
              "a,abbr,ad,audio,b,blockquote,br,code,col,colgroup,dd,del,dl,dt,div,em,fieldset,h1,h2,h3,h4,h5,h6,hr,i,img,ins,label,legend,li,ol,p,q,ruby,rt,source,span,strong,sub,sup,table,tbody,td,tfoot,th,thead,tr,title,ul,video"
            ),
            blockTags: n(
              "address,article,aside,body,caption,center,cite,footer,header,html,nav,pre,section"
            ),
            ignoreTags: n(
              "area,base,canvas,embed,frame,head,iframe,input,link,map,meta,param,rp,script,source,style,textarea,title,track,wbr"
            ),
            voidTags: n(
              "area,base,br,col,circle,ellipse,embed,frame,hr,img,input,line,link,meta,param,path,polygon,rect,source,track,use,wbr"
            ),
            entities: {
              lt: "<",
              gt: ">",
              quot: '"',
              apos: "'",
              ensp: " ",
              emsp: " ",
              nbsp: " ",
              semi: ";",
              ndash: "–",
              mdash: "—",
              middot: "·",
              lsquo: "‘",
              rsquo: "’",
              ldquo: "“",
              rdquo: "”",
              bull: "•",
              hellip: "…",
              larr: "←",
              uarr: "↑",
              rarr: "→",
              darr: "↓",
            },
            tagStyle: {
              address: "font-style:italic",
              big: "display:inline;font-size:1.2em",
              caption: "display:table-caption;text-align:center",
              center: "text-align:center",
              cite: "font-style:italic",
              dd: "margin-left:40px",
              mark: "background-color:yellow",
              pre: "font-family:monospace;white-space:pre",
              s: "text-decoration:line-through",
              small: "display:inline;font-size:0.8em",
              strike: "text-decoration:line-through",
              u: "text-decoration:underline",
            },
            svgDict: {
              animatetransform: "animateTransform",
              lineargradient: "linearGradient",
              viewbox: "viewBox",
              attributename: "attributeName",
              repeatcount: "repeatCount",
              repeatdur: "repeatDur",
              foreignobject: "foreignObject",
            },
          },
          u = {};
        if (wx.canIUse("getWindowInfo"))
          (h = wx.getWindowInfo().windowWidth), (c = wx.getDeviceInfo().system);
        else {
          var p = wx.getSystemInfoSync();
          (h = p.windowWidth), (c = p.system);
        }
        var f = n(" ,\r,\n,\t,\f"),
          g = 0;
        (o.prototype.parse = function (t) {
          for (var e = this.plugins.length; e--; )
            this.plugins[e].onUpdate &&
              (t = this.plugins[e].onUpdate(t, d) || t);
          for (new l(this).parse(t); this.stack.length; ) this.popNode();
          return this.nodes.length > 50 && r(this.nodes), this.nodes;
        }),
          (o.prototype.expose = function () {
            for (var t = this.stack.length; t--; ) {
              var e = this.stack[t];
              if (
                e.c ||
                "a" === e.name ||
                "video" === e.name ||
                "audio" === e.name
              )
                return;
              e.c = 1;
            }
          }),
          (o.prototype.hook = function (t) {
            for (var e = this.plugins.length; e--; )
              if (
                this.plugins[e].onParse &&
                !1 === this.plugins[e].onParse(t, this)
              )
                return !1;
            return !0;
          }),
          (o.prototype.getUrl = function (t) {
            var e = this.options.domain;
            return (
              "/" === t[0]
                ? "/" === t[1]
                  ? (t = (e ? e.split("://")[0] : "http") + ":" + t)
                  : e && (t = e + t)
                : !e ||
                  t.includes("data:") ||
                  t.includes("://") ||
                  (t = e + "/" + t),
              t
            );
          }),
          (o.prototype.parseStyle = function (t) {
            var e = t.attrs,
              i = (this.tagStyle[t.name] || "")
                .split(";")
                .concat((e.style || "").split(";")),
              s = {},
              n = "";
            e.id &&
              !this.xml &&
              (this.options.useAnchor
                ? this.expose()
                : "img" !== t.name &&
                  "a" !== t.name &&
                  "video" !== t.name &&
                  "audio" !== t.name &&
                  (e.id = void 0)),
              e.width &&
                ((s.width =
                  parseFloat(e.width) + (e.width.includes("%") ? "%" : "px")),
                (e.width = void 0)),
              e.height &&
                ((s.height =
                  parseFloat(e.height) + (e.height.includes("%") ? "%" : "px")),
                (e.height = void 0));
            for (var a = 0, r = i.length; a < r; a++) {
              var o = i[a].split(":");
              if (!(o.length < 2)) {
                var l = o.shift().trim().toLowerCase(),
                  c = o.join(":").trim();
                if (
                  ("-" === c[0] && c.lastIndexOf("-") > 0) ||
                  c.includes("safe")
                )
                  n += ";".concat(l, ":").concat(c);
                else if (
                  !s[l] ||
                  c.includes("import") ||
                  !s[l].includes("import")
                ) {
                  if (c.includes("url")) {
                    var d = c.indexOf("(") + 1;
                    if (d) {
                      for (; '"' === c[d] || "'" === c[d] || f[c[d]]; ) d++;
                      c = c.substr(0, d) + this.getUrl(c.substr(d));
                    }
                  } else
                    c.includes("rpx") &&
                      (c = c.replace(/[0-9.]+\s*rpx/g, function (t) {
                        return (parseFloat(t) * h) / 750 + "px";
                      }));
                  s[l] = c;
                }
              }
            }
            return (t.attrs.style = n), s;
          }),
          (o.prototype.onTagName = function (t) {
            (this.tagName = this.xml ? t : t.toLowerCase()),
              "svg" === this.tagName &&
                ((this.xml = (this.xml || 0) + 1),
                (d.ignoreTags.style = void 0));
          }),
          (o.prototype.onAttrName = function (t) {
            "data-" === (t = this.xml ? t : t.toLowerCase()).substr(0, 5)
              ? "data-src" !== t || this.attrs.src
                ? "img" === this.tagName || "a" === this.tagName
                  ? (this.attrName = t)
                  : (this.attrName = void 0)
                : (this.attrName = "src")
              : ((this.attrName = t), (this.attrs[t] = "T"));
          }),
          (o.prototype.onAttrVal = function (t) {
            var e = this.attrName || "";
            "style" === e || "href" === e
              ? (this.attrs[e] = a(t, !0))
              : e.includes("src")
              ? (this.attrs[e] = this.getUrl(a(t, !0)))
              : e && (this.attrs[e] = t);
          }),
          (o.prototype.onOpenTag = function (t) {
            var e = Object.create(null);
            (e.name = this.tagName),
              (e.attrs = this.attrs),
              (this.attrs = Object.create(null));
            var i = e.attrs,
              s = this.stack[this.stack.length - 1],
              n = s ? s.children : this.nodes,
              a = this.xml ? t : d.voidTags[e.name];
            if (
              (u[e.name] &&
                (i.class = u[e.name] + (i.class ? " " + i.class : "")),
              "embed" === e.name)
            ) {
              var r = i.src || "";
              r.includes(".mp4") ||
              r.includes(".3gp") ||
              r.includes(".m3u8") ||
              (i.type || "").includes("video")
                ? (e.name = "video")
                : (r.includes(".mp3") ||
                    r.includes(".wav") ||
                    r.includes(".aac") ||
                    r.includes(".m4a") ||
                    (i.type || "").includes("audio")) &&
                  (e.name = "audio"),
                i.autostart && (i.autoplay = "T"),
                (i.controls = "T");
            }
            if (
              (("video" !== e.name && "audio" !== e.name) ||
                ("video" !== e.name || i.id || (i.id = "v" + g++),
                i.controls || i.autoplay || (i.controls = "T"),
                (e.src = []),
                i.src && (e.src.push(i.src), (i.src = void 0)),
                this.expose()),
              a)
            ) {
              if (!this.hook(e) || d.ignoreTags[e.name])
                return void ("base" !== e.name || this.options.domain
                  ? "source" === e.name &&
                    s &&
                    ("video" === s.name || "audio" === s.name) &&
                    i.src &&
                    s.src.push(i.src)
                  : (this.options.domain = i.href));
              var o = this.parseStyle(e);
              if ("img" === e.name) {
                if (
                  i.src &&
                  (i.src.includes("webp") && (e.webp = "T"),
                  i.src.includes("data:") &&
                    "all" !== this.options.previewImg &&
                    !i["original-src"] &&
                    (i.ignore = "T"),
                  !i.ignore || e.webp || i.src.includes("cloud://"))
                ) {
                  for (var l = this.stack.length; l--; ) {
                    var c = this.stack[l];
                    "table" !== c.name ||
                      e.webp ||
                      i.src.includes("cloud://") ||
                      (!o.display || o.display.includes("inline")
                        ? (e.t = "inline-block")
                        : (e.t = o.display),
                      (o.display = void 0));
                    var p = c.attrs.style || "";
                    if (
                      !p.includes("flex:") ||
                      p.includes("flex:0") ||
                      p.includes("flex: 0") ||
                      (o.width && !(parseInt(o.width) > 100))
                    )
                      if (p.includes("flex") && "100%" === o.width)
                        for (var f = l + 1; f < this.stack.length; f++) {
                          var m = this.stack[f].attrs.style || "";
                          if (
                            !m.includes(";width") &&
                            !m.includes(" width") &&
                            0 !== m.indexOf("width")
                          ) {
                            o.width = "";
                            break;
                          }
                        }
                      else
                        p.includes("inline-block") &&
                          (o.width && "%" === o.width[o.width.length - 1]
                            ? ((c.attrs.style += ";max-width:" + o.width),
                              (o.width = ""))
                            : (c.attrs.style += ";max-width:100%"));
                    else {
                      (o.width = "100% !important"), (o.height = "");
                      for (var v = l + 1; v < this.stack.length; v++)
                        this.stack[v].attrs.style = (
                          this.stack[v].attrs.style || ""
                        ).replace("inline-", "");
                    }
                    "a" === c.name ? (e.a = c.attrs) : (c.c = 1);
                  }
                  e.i = this.imgList.length;
                  var y = i["original-src"] || i.src;
                  if (this.imgList.includes(y)) {
                    var b = y.indexOf("://");
                    if (-1 !== b) {
                      b += 3;
                      for (
                        var x = y.substr(0, b);
                        b < y.length && "/" !== y[b];
                        b++
                      )
                        x += Math.random() > 0.5 ? y[b].toUpperCase() : y[b];
                      (x += y.substr(b)), (y = x);
                    }
                  }
                  this.imgList.push(y), e.t || (this.imgList._unloadimgs += 1);
                }
                "inline" === o.display && (o.display = ""),
                  i.ignore &&
                    ((o["max-width"] = o["max-width"] || "100%"),
                    (i.style += ";-webkit-touch-callout:none")),
                  parseInt(o.width) > h && (o.height = void 0),
                  isNaN(parseInt(o.width)) || (e.w = "T"),
                  !isNaN(parseInt(o.height)) &&
                    (!o.height.includes("%") ||
                      (s && (s.attrs.style || "").includes("height"))) &&
                    (e.h = "T"),
                  e.w &&
                    e.h &&
                    o["object-fit"] &&
                    ("contain" === o["object-fit"]
                      ? (e.m = "aspectFit")
                      : "cover" === o["object-fit"] && (e.m = "aspectFill"));
              } else if ("svg" === e.name)
                return n.push(e), this.stack.push(e), void this.popNode();
              for (var w in o)
                o[w] &&
                  (i.style += ";"
                    .concat(w, ":")
                    .concat(o[w].replace(" !important", "")));
              i.style = i.style.substr(1) || void 0;
            } else
              ("pre" === e.name ||
                ((i.style || "").includes("white-space") &&
                  i.style.includes("pre"))) &&
                2 !== this.pre &&
                (this.pre = e.pre = 1),
                (e.children = []),
                this.stack.push(e);
            n.push(e);
          }),
          (o.prototype.onCloseTag = function (t) {
            var e;
            for (
              t = this.xml ? t : t.toLowerCase(), e = this.stack.length;
              e-- && this.stack[e].name !== t;

            );
            if (-1 !== e) for (; this.stack.length > e; ) this.popNode();
            else if ("p" === t || "br" === t) {
              (this.stack.length
                ? this.stack[this.stack.length - 1].children
                : this.nodes
              ).push({
                name: t,
                attrs: { class: u[t], style: this.tagStyle[t] },
              });
            }
          }),
          (o.prototype.popNode = function () {
            var t = this.stack.pop(),
              i = t.attrs,
              s = t.children,
              n = this.stack[this.stack.length - 1],
              a = n ? n.children : this.nodes;
            if (!this.hook(t) || d.ignoreTags[t.name])
              return (
                "title" === t.name &&
                  s.length &&
                  "text" === s[0].type &&
                  this.options.setTitle &&
                  wx.setNavigationBarTitle({ title: s[0].text }),
                void a.pop()
              );
            if (t.pre && 2 !== this.pre) {
              this.pre = t.pre = void 0;
              for (var o = this.stack.length; o--; )
                this.stack[o].pre && (this.pre = 1);
            }
            if ("svg" === t.name) {
              if (this.xml > 1) return void this.xml--;
              var l = "",
                c = i.style;
              return (
                (i.style = ""),
                (i.xmlns = "http://www.w3.org/2000/svg"),
                (function t(i) {
                  if ("text" !== i.type) {
                    var s = d.svgDict[i.name] || i.name;
                    if ("foreignObject" === s) {
                      var n,
                        a = e(i.children || []);
                      try {
                        for (a.s(); !(n = a.n()).done; ) {
                          var r = n.value;
                          if (r.attrs && !r.attrs.xmlns) {
                            r.attrs.xmlns = "http://www.w3.org/1999/xhtml";
                            break;
                          }
                        }
                      } catch (t) {
                        a.e(t);
                      } finally {
                        a.f();
                      }
                    }
                    for (var o in ((l += "<" + s), i.attrs)) {
                      var h = i.attrs[o];
                      h &&
                        (l += " "
                          .concat(d.svgDict[o] || o, '="')
                          .concat(h.replace(/"/g, ""), '"'));
                    }
                    if (i.children) {
                      l += ">";
                      for (var c = 0; c < i.children.length; c++)
                        t(i.children[c]);
                      l += "</" + s + ">";
                    } else l += "/>";
                  } else l += i.text;
                })(t),
                (t.name = "img"),
                (t.attrs = {
                  src: "data:image/svg+xml;utf8," + l.replace(/#/g, "%23"),
                  style: c,
                  ignore: "T",
                }),
                (t.children = void 0),
                (this.xml = !1),
                void (d.ignoreTags.style = !0)
              );
            }
            var u = {};
            if (
              (i.align &&
                ("table" === t.name
                  ? "center" === i.align
                    ? (u["margin-inline-start"] = u["margin-inline-end"] =
                        "auto")
                    : (u.float = i.align)
                  : (u["text-align"] = i.align),
                (i.align = void 0)),
              i.dir && ((u.direction = i.dir), (i.dir = void 0)),
              "font" === t.name &&
                (i.color && ((u.color = i.color), (i.color = void 0)),
                i.face && ((u["font-family"] = i.face), (i.face = void 0)),
                i.size))
            ) {
              var p = parseInt(i.size);
              isNaN(p) ||
                (p < 1 ? (p = 1) : p > 7 && (p = 7),
                (u["font-size"] = [
                  "x-small",
                  "small",
                  "medium",
                  "large",
                  "x-large",
                  "xx-large",
                  "xxx-large",
                ][p - 1])),
                (i.size = void 0);
            }
            if (
              ((i.class || "").includes("align-center") &&
                (u["text-align"] = "center"),
              Object.assign(u, this.parseStyle(t)),
              "table" !== t.name &&
                parseInt(u.width) > h &&
                ((u["max-width"] = "100%"), (u["box-sizing"] = "border-box")),
              d.blockTags[t.name])
            )
              t.name = "div";
            else if (d.trustTags[t.name] || this.xml)
              if ("a" === t.name || "ad" === t.name) this.expose();
              else if ("video" === t.name || "audio" === t.name)
                (u.height || "").includes("auto") && (u.height = void 0),
                  (t.children = void 0);
              else if (("ul" !== t.name && "ol" !== t.name) || !t.c)
                if ("table" === t.name) {
                  var f = parseFloat(i.cellpadding),
                    g = parseFloat(i.cellspacing),
                    m = parseFloat(i.border),
                    v = u["border-color"],
                    y = u["border-style"];
                  if (
                    (t.c && (isNaN(f) && (f = 2), isNaN(g) && (g = 2)),
                    m &&
                      (i.style += ";border:"
                        .concat(m, "px ")
                        .concat(y || "solid", " ")
                        .concat(v || "gray")),
                    t.flag && t.c)
                  ) {
                    (t.flag = void 0),
                      (u.display = "grid"),
                      "collapse" === u["border-collapse"] &&
                        ((u["border-collapse"] = void 0), (g = 0)),
                      g
                        ? ((u["grid-gap"] = g + "px"), (u.padding = g + "px"))
                        : m && (i.style += ";border-left:0;border-top:0");
                    var b = [],
                      x = [],
                      w = [],
                      k = {};
                    !(function t(i) {
                      for (var s = 0; s < i.length; s++)
                        if ("tr" === i[s].name) x.push(i[s]);
                        else if ("colgroup" === i[s].name) {
                          var n,
                            a = 1,
                            r = e(i[s].children || []);
                          try {
                            for (r.s(); !(n = r.n()).done; ) {
                              var o = n.value;
                              if ("col" === o.name) {
                                var l = o.attrs.style || "",
                                  h = l.indexOf("width")
                                    ? l.indexOf(";width")
                                    : 0;
                                if (-1 !== h) {
                                  var c = l.indexOf(";", h + 6);
                                  -1 === c && (c = l.length),
                                    (b[a] = l.substring(h ? h + 7 : 6, c));
                                }
                                a += 1;
                              }
                            }
                          } catch (t) {
                            r.e(t);
                          } finally {
                            r.f();
                          }
                        } else t(i[s].children || []);
                    })(s);
                    for (var T = 1; T <= x.length; T++) {
                      for (
                        var N = 1, O = 0;
                        O < x[T - 1].children.length;
                        O++
                      ) {
                        var S = x[T - 1].children[O];
                        if ("td" === S.name || "th" === S.name) {
                          for (; k[T + "." + N]; ) N++;
                          S.c = 1;
                          var I = S.attrs.style || "",
                            _ = I.indexOf("width") ? I.indexOf(";width") : 0;
                          if (-1 !== _) {
                            var j = I.indexOf(";", _ + 6);
                            -1 === j && (j = I.length),
                              S.attrs.colspan ||
                                (b[N] = I.substring(_ ? _ + 7 : 6, j)),
                              (I = I.substr(0, _) + I.substr(j));
                          }
                          if (
                            -1 !==
                            (_ = (I +=
                              ";display:flex;flex-direction:column").indexOf(
                              "vertical-align"
                            ))
                          ) {
                            var C = I.substr(_ + 15, 10);
                            C.includes("middle")
                              ? (I += ";justify-content:center")
                              : C.includes("bottom") &&
                                (I += ";justify-content:flex-end");
                          } else I += ";justify-content:center";
                          if (-1 !== (_ = I.indexOf("text-align"))) {
                            var A = I.substr(_ + 11, 10);
                            A.includes("center")
                              ? (I += ";justify-content: center")
                              : A.includes("right") &&
                                (I += ";justify-content: right");
                          }
                          if (
                            ((I =
                              (m
                                ? ";border:"
                                    .concat(m, "px ")
                                    .concat(y || "solid", " ")
                                    .concat(v || "gray") +
                                  (g ? "" : ";border-right:0;border-bottom:0")
                                : "") +
                              (f ? ";padding:".concat(f, "px") : "") +
                              ";" +
                              I),
                            S.attrs.colspan &&
                              ((I += ";grid-column-start:"
                                .concat(N, ";grid-column-end:")
                                .concat(N + parseInt(S.attrs.colspan))),
                              S.attrs.rowspan ||
                                (I += ";grid-row-start:"
                                  .concat(T, ";grid-row-end:")
                                  .concat(T + 1)),
                              (N += parseInt(S.attrs.colspan) - 1)),
                            S.attrs.rowspan)
                          ) {
                            (I += ";grid-row-start:"
                              .concat(T, ";grid-row-end:")
                              .concat(T + parseInt(S.attrs.rowspan))),
                              S.attrs.colspan ||
                                (I += ";grid-column-start:"
                                  .concat(N, ";grid-column-end:")
                                  .concat(N + 1));
                            for (var L = 1; L < S.attrs.rowspan; L++)
                              for (var z = 0; z < (S.attrs.colspan || 1); z++)
                                k[T + L + "." + (N - z)] = 1;
                          }
                          I && (S.attrs.style = I), w.push(S), N++;
                        }
                      }
                      if (1 === T) {
                        for (var R = "", U = 1; U < N; U++)
                          R += (b[U] ? b[U] : "auto") + " ";
                        u["grid-template-columns"] = R;
                      }
                    }
                    t.children = w;
                  } else
                    t.c && (u.display = "table"),
                      isNaN(g) || (u["border-spacing"] = g + "px"),
                      (m || f || t.c) &&
                        (function e(i) {
                          for (var s = 0; s < i.length; s++) {
                            var n = i[s];
                            t.c && (n.c = 1),
                              "th" === n.name || "td" === n.name
                                ? (m &&
                                    (n.attrs.style = "border:"
                                      .concat(m, "px ")
                                      .concat(y || "solid", " ")
                                      .concat(v || "gray", ";")
                                      .concat(n.attrs.style || "")),
                                  f &&
                                    (n.attrs.style = "padding:"
                                      .concat(f, "px;")
                                      .concat(n.attrs.style || "")))
                                : n.children && e(n.children);
                          }
                        })(s);
                  if (
                    this.options.scrollTable &&
                    !(i.style || "").includes("inline")
                  ) {
                    var B = Object.assign({}, t);
                    (t.name = "div"),
                      (t.attrs = { style: "overflow-x:auto;padding:1px" }),
                      (t.children = [B]),
                      (i = B.attrs);
                  }
                } else if (
                  ("tbody" === t.name || "tr" === t.name) &&
                  t.flag &&
                  t.c
                )
                  (t.flag = void 0),
                    (function t(e) {
                      for (var i = 0; i < e.length; i++)
                        if ("td" === e[i].name)
                          for (
                            var s = 0,
                              n = ["color", "background", "background-color"];
                            s < n.length;
                            s++
                          ) {
                            var a = n[s];
                            u[a] &&
                              (e[i].attrs.style =
                                a +
                                ":" +
                                u[a] +
                                ";" +
                                (e[i].attrs.style || ""));
                          }
                        else t(e[i].children || []);
                    })(s);
                else if (
                  ("td" !== t.name && "th" !== t.name) ||
                  (!i.colspan && !i.rowspan)
                ) {
                  if ("ruby" === t.name) {
                    t.name = "span";
                    for (var D = 0; D < s.length - 1; D++)
                      "text" === s[D].type &&
                        "rt" === s[D + 1].name &&
                        ((s[D] = {
                          name: "span",
                          attrs: {
                            style: "display:inline-block;text-align:center",
                          },
                          children: [
                            {
                              name: "div",
                              attrs: {
                                style:
                                  "font-size:50%;" +
                                  (s[D + 1].attrs.style || ""),
                              },
                              children: s[D + 1].children,
                            },
                            s[D],
                          ],
                        }),
                        s.splice(D + 1, 1));
                  }
                } else
                  for (var E = this.stack.length; E--; )
                    ("table" !== this.stack[E].name &&
                      "tbody" !== this.stack[E].name &&
                      "tr" !== this.stack[E].name) ||
                      (this.stack[E].flag = 1);
              else {
                var F = {
                  a: "lower-alpha",
                  A: "upper-alpha",
                  i: "lower-roman",
                  I: "upper-roman",
                };
                F[i.type] &&
                  ((i.style += ";list-style-type:" + F[i.type]),
                  (i.type = void 0)),
                  (t.c = 1);
                for (var V = s.length; V--; )
                  "li" === s[V].name && (s[V].c = 1);
              }
            else t.name = "span";
            if ((u.display || "").includes("flex") && !t.c)
              for (var q = s.length; q--; ) {
                var P = s[q];
                P.f &&
                  ((P.attrs.style = (P.attrs.style || "") + P.f),
                  (P.f = void 0));
              }
            var M =
              n &&
              ((n.attrs.style || "").includes("flex") ||
                (n.attrs.style || "").includes("grid")) &&
              !t.c &&
              !(u.display || "").includes("inline");
            for (var W in (M && (t.f = ";max-width:100%"),
            s.length >= 50 &&
              t.c &&
              !(u.display || "").includes("flex") &&
              r(s),
            u))
              if (u[W]) {
                var J = ";"
                  .concat(W, ":")
                  .concat(u[W].replace(" !important", ""));
                M &&
                ((W.includes("flex") && "flex-direction" !== W) ||
                  "align-self" === W ||
                  W.includes("grid") ||
                  "-" === u[W][0] ||
                  (W.includes("width") && J.includes("%")))
                  ? ((t.f += J), "width" === W && (i.style += ";width:100%"))
                  : (i.style += J);
              }
            i.style = i.style.substr(1) || void 0;
          }),
          (o.prototype.onText = function (t) {
            if (!this.pre) {
              for (var e, i = "", s = 0, n = t.length; s < n; s++)
                f[t[s]]
                  ? (" " !== i[i.length - 1] && (i += " "),
                    "\n" !== t[s] || e || (e = !0))
                  : (i += t[s]);
              if (" " === i && e) return;
              t = i;
            }
            var r = Object.create(null);
            (r.type = "text"),
              (r.text = a(t)),
              this.hook(r) &&
                ("force" === this.options.selectable &&
                  c.includes("iOS") &&
                  !wx.canIUse("rich-text.user-select") &&
                  this.expose(),
                (this.stack.length
                  ? this.stack[this.stack.length - 1].children
                  : this.nodes
                ).push(r));
          }),
          (l.prototype.parse = function (t) {
            (this.content = t || ""),
              (this.i = 0),
              (this.start = 0),
              (this.state = this.text);
            for (var e = this.content.length; -1 !== this.i && this.i < e; )
              this.state();
          }),
          (l.prototype.checkClose = function (t) {
            var e = "/" === this.content[this.i];
            return (
              !!(
                ">" === this.content[this.i] ||
                (e && ">" === this.content[this.i + 1])
              ) &&
              (t && this.handler[t](this.content.substring(this.start, this.i)),
              (this.i += e ? 2 : 1),
              (this.start = this.i),
              this.handler.onOpenTag(e),
              "script" === this.handler.tagName
                ? ((this.i = this.content.indexOf("</", this.i)),
                  -1 !== this.i && ((this.i += 2), (this.start = this.i)),
                  (this.state = this.endTag))
                : (this.state = this.text),
              !0)
            );
          }),
          (l.prototype.text = function () {
            if (((this.i = this.content.indexOf("<", this.i)), -1 !== this.i)) {
              var t = this.content[this.i + 1];
              if ((t >= "a" && t <= "z") || (t >= "A" && t <= "Z"))
                this.start !== this.i &&
                  this.handler.onText(
                    this.content.substring(this.start, this.i)
                  ),
                  (this.start = ++this.i),
                  (this.state = this.tagName);
              else if ("/" === t || "!" === t || "?" === t) {
                this.start !== this.i &&
                  this.handler.onText(
                    this.content.substring(this.start, this.i)
                  );
                var e = this.content[this.i + 2];
                if (
                  "/" === t &&
                  ((e >= "a" && e <= "z") || (e >= "A" && e <= "Z"))
                )
                  return (
                    (this.i += 2),
                    (this.start = this.i),
                    void (this.state = this.endTag)
                  );
                var i = "--\x3e";
                ("!" === t &&
                  "-" === this.content[this.i + 2] &&
                  "-" === this.content[this.i + 3]) ||
                  (i = ">"),
                  (this.i = this.content.indexOf(i, this.i)),
                  -1 !== this.i &&
                    ((this.i += i.length), (this.start = this.i));
              } else this.i++;
            } else
              this.start < this.content.length &&
                this.handler.onText(
                  this.content.substring(this.start, this.content.length)
                );
          }),
          (l.prototype.tagName = function () {
            if (f[this.content[this.i]]) {
              for (
                this.handler.onTagName(
                  this.content.substring(this.start, this.i)
                );
                f[this.content[++this.i]];

              );
              this.i < this.content.length &&
                !this.checkClose() &&
                ((this.start = this.i), (this.state = this.attrName));
            } else this.checkClose("onTagName") || this.i++;
          }),
          (l.prototype.attrName = function () {
            var t = this.content[this.i];
            if (f[t] || "=" === t) {
              this.handler.onAttrName(
                this.content.substring(this.start, this.i)
              );
              for (var e = "=" === t, i = this.content.length; ++this.i < i; )
                if (((t = this.content[this.i]), !f[t])) {
                  if (this.checkClose()) return;
                  if (e)
                    return (
                      (this.start = this.i), void (this.state = this.attrVal)
                    );
                  if ("=" !== this.content[this.i])
                    return (
                      (this.start = this.i), void (this.state = this.attrName)
                    );
                  e = !0;
                }
            } else this.checkClose("onAttrName") || this.i++;
          }),
          (l.prototype.attrVal = function () {
            var t = this.content[this.i],
              e = this.content.length;
            if ('"' === t || "'" === t) {
              if (
                ((this.start = ++this.i),
                (this.i = this.content.indexOf(t, this.i)),
                -1 === this.i)
              )
                return;
              this.handler.onAttrVal(
                this.content.substring(this.start, this.i)
              );
            } else
              for (; this.i < e; this.i++) {
                if (f[this.content[this.i]]) {
                  this.handler.onAttrVal(
                    this.content.substring(this.start, this.i)
                  );
                  break;
                }
                if (this.checkClose("onAttrVal")) return;
              }
            for (; f[this.content[++this.i]]; );
            this.i < e &&
              !this.checkClose() &&
              ((this.start = this.i), (this.state = this.attrName));
          }),
          (l.prototype.endTag = function () {
            var t = this.content[this.i];
            if (f[t] || ">" === t || "/" === t) {
              if (
                (this.handler.onCloseTag(
                  this.content.substring(this.start, this.i)
                ),
                ">" !== t &&
                  ((this.i = this.content.indexOf(">", this.i)), -1 === this.i))
              )
                return;
              (this.start = ++this.i), (this.state = this.text);
            } else this.i++;
          }),
          (t.exports = o);
      },
    },
    function (t) {
      !(function (e) {
        t((t.s = e));
      })(62505);
    },
  ]);
})();

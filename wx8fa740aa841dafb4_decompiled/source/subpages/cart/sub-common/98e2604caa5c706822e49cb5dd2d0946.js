!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [3608],
    {
      19348: function (i, t, n) {
        n.d(t, {
          U: function () {
            return y;
          },
          l: function () {
            return p;
          },
        });
        var e = n(71002),
          o = n(96856),
          r = n(45666),
          u = function () {
            for (var i = arguments.length, t = new Array(i), n = 0; n < i; n++)
              t[n] = arguments[n];
            for (var e = 0, o = t; e < o.length; e++) {
              var r = o[e],
                u = String(null != r ? r : "").trim();
              if (u) return u;
            }
            return "";
          },
          a = function (i) {
            if (
              null != (null == i ? void 0 : i.activity_id) &&
              "" !== i.activity_id
            )
              return "id:".concat(i.activity_id);
            var t = u(
              null == i ? void 0 : i.activity_tag,
              null == i ? void 0 : i.activity_name,
              null == i ? void 0 : i.info,
              null == i ? void 0 : i.title,
              null == i ? void 0 : i.rule
            );
            return t ? "title:".concat(t) : "";
          },
          c = function (i) {
            var t = a(i);
            return t && null != i && i.type
              ? "".concat(i.type, ":").concat(t)
              : "";
          },
          l = function (i) {
            var t = (null == i ? void 0 : i.activity_rule) || i || {};
            return u(
              t.activity_desc,
              t.rule_desc,
              t.description,
              t.specific_desc,
              t.rule,
              null == i ? void 0 : i.rule,
              null == i ? void 0 : i.fill_discount_info
            );
          },
          v = function (i, t) {
            i.activityTime ||
              (i.activityTime = (function (i) {
                var t,
                  n,
                  e,
                  r = (null == i ? void 0 : i.activity_rule) || i || {},
                  u =
                    null !==
                      (t =
                        null !== (n = r.begin_time) && void 0 !== n
                          ? n
                          : r.start_time) && void 0 !== t
                      ? t
                      : r.activity_begin_time,
                  a =
                    null !== (e = r.end_time) && void 0 !== e
                      ? e
                      : r.activity_end_time;
                if (!u && !a) return "";
                var c = function (i) {
                    var t = Number(i);
                    if (!t) return "";
                    var n = t > 1e12 ? t : 1e3 * t;
                    return (0, o.mr)(n, "YYYY.M.DD HH:mm");
                  },
                  l = c(u),
                  v = c(a);
                return l && v ? "".concat(l, " 至 ").concat(v) : l || v;
              })(t)),
              i.activityRules || (i.activityRules = l(t));
          },
          d = function (i, t, n) {
            var e = Number(n);
            if (e && t) {
              var o = t.item_id,
                r = i.productMap.get(o);
              r
                ? (r.discountAmount += e)
                : i.productMap.set(o, {
                    itemId: o,
                    pic: t.pic,
                    num: Number(t.num) || 1,
                    discountAmount: e,
                  });
            }
          },
          s = function (i) {
            return Array.isArray(i)
              ? i.filter(Boolean)
              : i && "object" === (0, e.Z)(i)
              ? [i]
              : [];
          },
          f = function (i, t) {
            var n = u(
              null == i ? void 0 : i.promotion_tag,
              null == i ? void 0 : i.info,
              null == i ? void 0 : i.rule,
              null == i ? void 0 : i.activity_tag,
              null == i ? void 0 : i.activity_name
            );
            if (n) return n;
            if (
              "member_tag_targeted_promotion" ===
                (null == i ? void 0 : i.type) &&
              t.length
            ) {
              var e,
                o,
                a = u(
                  null === (e = t[0]) || void 0 === e
                    ? void 0
                    : e.promotion_tag,
                  null === (o = t[0]) || void 0 === o ? void 0 : o.activity_tag
                );
              if (a) return a;
            }
            return r._N[null == i ? void 0 : i.type] || "平台立减";
          },
          m = function (i, t) {
            var n, e;
            return (
              l(i) ||
              ("member_tag_targeted_promotion" ===
                (null == i ? void 0 : i.type) && t.length
                ? u(
                    null === (n = t[0]) || void 0 === n
                      ? void 0
                      : n.specific_desc,
                    null === (e = t[0]) || void 0 === e ? void 0 : e.rule_desc
                  )
                : "")
            );
          },
          g = function (i) {
            var t = [];
            return (
              i.forEach(function (i) {
                var n = [];
                i.regions.forEach(function (i) {
                  var t = Array.from(i.productMap.values());
                  t.length &&
                    n.push({
                      regionName: i.regionName,
                      activityTime: i.activityTime,
                      activityRules: i.activityRules,
                      products: t,
                    });
                }),
                  i.title &&
                    n.length &&
                    t.push({
                      title: i.title,
                      totalDiscount: i.totalDiscount,
                      regions: n,
                    });
              }),
              t
            );
          },
          _ = function () {
            var i = new Map();
            return {
              activityMap: i,
              ensureActivity: function (t, n) {
                return (
                  i.has(t) ||
                    i.set(t, {
                      title: n,
                      totalDiscount: 0,
                      regions: new Map(),
                    }),
                  i.get(t)
                );
              },
              ensureRegion: function (i, t) {
                return (
                  i.regions.has(t) ||
                    i.regions.set(t, {
                      regionName: t,
                      activityTime: "",
                      activityRules: "",
                      productMap: new Map(),
                    }),
                  i.regions.get(t)
                );
              },
            };
          };
        function p() {
          var i =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : {},
            t = i.shops,
            n = (i.totalSummary, _()),
            e = n.activityMap,
            o = n.ensureActivity,
            c = n.ensureRegion;
          (t || []).forEach(function (i) {
            var t,
              n = String(
                i.regionauth_name ||
                  (null === (t = i.items) ||
                  void 0 === t ||
                  null === (t = t[0]) ||
                  void 0 === t
                    ? void 0
                    : t.regionauth_name) ||
                  ""
              ).trim();
            n &&
              (i.items || []).forEach(function (i) {
                (i.discount_info || []).forEach(function (t) {
                  if ((0, r.vt)(null == t ? void 0 : t.type)) {
                    var e = Number(null == t ? void 0 : t.discount_fee);
                    if (e) {
                      var l = a(t),
                        s = u(
                          t.activity_tag,
                          t.activity_name,
                          t.info,
                          t.rule,
                          t.promotion_tag
                        );
                      if (l && s) {
                        var f = o(l, s);
                        f.totalDiscount += e;
                        var m = c(f, n);
                        v(m, t), d(m, i, e);
                      }
                    }
                  }
                });
              });
          });
          var l = g(e);
          return l.length ? { activities: l } : null;
        }
        function y() {
          var i =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : {},
            t = i.shops,
            n = (i.totalSummary, i.specificCrowdDiscount),
            e = s(n),
            o = _(),
            a = o.activityMap,
            l = o.ensureActivity,
            p = o.ensureRegion,
            y = [];
          (t || []).forEach(function (i) {
            var t,
              n = String(
                i.regionauth_name ||
                  (null === (t = i.items) ||
                  void 0 === t ||
                  null === (t = t[0]) ||
                  void 0 === t
                    ? void 0
                    : t.regionauth_name) ||
                  ""
              ).trim();
            if (n) {
              var o = !1;
              (i.items || []).forEach(function (i) {
                (i.discount_info || []).forEach(function (t) {
                  if ((0, r.uk)(null == t ? void 0 : t.type)) {
                    var u = Number(null == t ? void 0 : t.discount_fee);
                    if (u) {
                      var a = c(t),
                        s = f(t, e);
                      if (a) {
                        o = !0;
                        var g = l(a, s);
                        g.totalDiscount += u;
                        var _ = p(g, n);
                        v(_, t),
                          _.activityRules || (_.activityRules = m(t, e)),
                          d(_, i, u);
                      }
                    }
                  }
                });
              });
              var a = Number(i.platform_reduction) || 0;
              if (!o && a) {
                var s,
                  g,
                  _ = (i.items || [])[0];
                _ &&
                  y.push({
                    regionName: n,
                    activityRules: u(
                      null === (s = e[0]) || void 0 === s
                        ? void 0
                        : s.specific_desc,
                      null === (g = e[0]) || void 0 === g ? void 0 : g.rule_desc
                    ),
                    products: [
                      {
                        itemId: _.item_id,
                        pic: _.pic,
                        num: Number(_.num) || 1,
                        discountAmount: a,
                      },
                    ],
                  });
              }
            }
          });
          var h = g(a);
          if (!h.length && y.length) {
            var b,
              N,
              A = y.reduce(function (i, t) {
                return (
                  i +
                  t.products.reduce(function (i, t) {
                    return i + t.discountAmount;
                  }, 0)
                );
              }, 0);
            h = [
              {
                title: u(
                  null === (b = e[0]) || void 0 === b
                    ? void 0
                    : b.promotion_tag,
                  null === (N = e[0]) || void 0 === N ? void 0 : N.activity_tag,
                  "平台立减"
                ),
                totalDiscount: A,
                regions: y,
              },
            ];
          }
          return h.length ? { activities: h } : null;
        }
      },
    },
  ]);
})();

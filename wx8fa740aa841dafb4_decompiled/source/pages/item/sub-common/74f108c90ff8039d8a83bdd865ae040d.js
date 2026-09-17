!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [7191],
    {
      66341: function (n, t, i) {
        i.d(t, {
          Kb: function () {
            return r;
          },
          hK: function () {
            return a;
          },
          jJ: function () {
            return l;
          },
          vL: function () {
            return e;
          },
        });
        var r = "tags",
          u = [
            "重庆佛罗伦萨小镇",
            "成都佛罗伦萨小镇",
            "武汉佛罗伦萨小镇",
            "上海佛罗伦萨小镇",
            "广佛佛罗伦萨小镇",
            "京津佛罗伦萨小镇",
          ];
        function o(n) {
          var t = String(n || "").trim();
          return t
            ? u.includes(t)
              ? t
              : u.find(function (n) {
                  return n.startsWith(t);
                }) || null
            : null;
        }
        function l() {
          var n =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : {},
            t = n.regionauthId,
            i = n.regionauthName,
            r = null != t && "" !== String(t) && "0" !== String(t),
            u = "" !== String(i || "").trim();
          return r || u
            ? {
                regionauthId: r ? t : void 0,
                regionauthName: u ? String(i).trim() : void 0,
              }
            : null;
        }
        function e() {
          var n =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : [],
            t = arguments.length > 1 ? arguments[1] : void 0,
            i = [];
          if (
            ((n || []).forEach(function (n) {
              ((null == n ? void 0 : n.items) || []).forEach(function (t) {
                var r,
                  u,
                  o =
                    null !== (r = null == n ? void 0 : n.regionauth_id) &&
                    void 0 !== r
                      ? r
                      : null == t
                      ? void 0
                      : t.regionauth_id,
                  l =
                    null !== (u = null == n ? void 0 : n.regionauth_name) &&
                    void 0 !== u
                      ? u
                      : null == t
                      ? void 0
                      : t.regionauth_name;
                ((null != o && "" !== String(o)) || String(l || "").trim()) &&
                  i.push({ regionauthId: o, regionauthName: l });
              });
            }),
            !i.length)
          )
            return null;
          var r =
            null != t && "" !== String(t) && "0" !== String(t)
              ? String(t)
              : null;
          if (r) {
            var u = i.find(function (n) {
              return null != n.regionauthId && String(n.regionauthId) === r;
            });
            if (u) return l(u);
          }
          return l(i[0]);
        }
        function a() {
          var n =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : {},
            t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : {},
            i = Object.prototype.hasOwnProperty.call(n, "townTag"),
            r = i
              ? n.townTag
              : l({
                  regionauthId: null == t ? void 0 : t.regionauth_id,
                  regionauthName: null == t ? void 0 : t.regionauth_name,
                });
          if (!r) return { consultTownName: null, townTag: null };
          var u = String(r.regionauthName || "").trim() || null;
          return (
            u ||
              null == r.regionauthId ||
              null == (null == t ? void 0 : t.regionauth_id) ||
              String(r.regionauthId) !== String(t.regionauth_id) ||
              (u =
                String((null == t ? void 0 : t.regionauth_name) || "").trim() ||
                null),
            { consultTownName: o(u), townTag: r }
          );
        }
      },
    },
  ]);
})();

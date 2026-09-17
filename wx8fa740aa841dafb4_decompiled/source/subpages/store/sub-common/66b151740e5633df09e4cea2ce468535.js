!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [3080],
    {
      24342: function (n, r, o) {
        o.r(r),
          o.d(r, {
            GAME_BUTTON: function () {
              return a;
            },
            GAME_CONFIG: function () {
              return g;
            },
            GAME_FONTS: function () {
              return u;
            },
            GAME_PRIZE: function () {
              return e;
            },
          });
        var i = o(1413),
          t = o(71002),
          u = (o(96856), { text: "text", top: "top", fontSize: "fontSize" }),
          e = {
            background: "background",
            fonts: function (n) {
              var r = n.fonts;
              return r && "object" === (0, t.Z)(r) && !Array.isArray(r)
                ? [r]
                : r || [];
            },
            x: "x",
            y: "y",
          },
          a = {
            radius: "radius",
            background: "background",
            pointer: "pointer",
            shadow: "shadow",
            x: "x",
            y: "y",
            fonts: function (n) {
              var r = n.fonts;
              return r && "object" === (0, t.Z)(r) && !Array.isArray(r)
                ? [r]
                : r || [];
            },
          },
          g = {
            gameType: "gameType",
            backgroundImage: "backgroundImage",
            gameMarginTop: "gameMarginTop",
            backgroundColor: "backgroundColor",
            recordFormConfig: function (n) {
              var r = n.gameConfig;
              return null != r && r.recordFormConfig
                ? null == r
                  ? void 0
                  : r.recordFormConfig
                : {};
            },
            gameConfig: function (n) {
              var r = n.gameConfig;
              if (!r) return {};
              var o,
                t = (0, i.Z)({}, r);
              return (
                t.prizes &&
                  Array.isArray(t.prizes) &&
                  (t.prizes =
                    null === (o = t.prizes) || void 0 === o
                      ? void 0
                      : o.map(function (n) {
                          var r,
                            o,
                            t = (0, i.Z)(
                              (0, i.Z)({}, n),
                              {},
                              {
                                fonts: [
                                  null != n && n.fonts
                                    ? null == n
                                      ? void 0
                                      : n.fonts
                                    : {
                                        text: n.text || "",
                                        top:
                                          (null == n ? void 0 : n.fontTop) ||
                                          (null == n ? void 0 : n.top) ||
                                          0,
                                      },
                                ],
                                background: n.background || "",
                                range:
                                  1 *
                                  Number(n.prize_probability / 100).toFixed(2),
                              }
                            );
                          return (
                            (null == n || null === (r = n.imgs) || void 0 === r
                              ? void 0
                              : r.length) > 0 &&
                              (t.imgs = [
                                (0, i.Z)(
                                  (0, i.Z)(
                                    {},
                                    (null == n ||
                                    null === (o = n.imgs) ||
                                    void 0 === o
                                      ? void 0
                                      : o[0]) || {}
                                  ),
                                  {},
                                  { src: null == n ? void 0 : n.img }
                                ),
                              ]),
                            t
                          );
                        })),
                t
              );
            },
          };
      },
    },
  ]);
})();

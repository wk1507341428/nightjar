!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [2224],
    {
      82212: function (e, n, i) {
        var d = i(1413),
          c = (i(67294), i(71515)),
          t = i(78061),
          a = i(96856),
          s = i(85893);
        n.Z = function (e) {
          var n = e.categories,
            i = void 0 === n ? [] : n,
            o = e.selectedCategory,
            l = void 0 === o ? [] : o,
            r = e.onSelect,
            x = void 0 === r ? function () {} : r,
            p = e.expandedCategories,
            u = void 0 === p ? [] : p,
            f = e.onExpand,
            _ = void 0 === f ? function () {} : f,
            v = e.pIndex;
          return (0, s.jsx)(c.G7, {
            className: "expand-filter",
            children:
              null == i
                ? void 0
                : i.map(function (e, n) {
                    return (0, s.jsxs)(
                      c.G7,
                      {
                        className: (0, a.AK)("expand-filter__section", {
                          "expand-filter__section--expanded": u.includes(e.id),
                        }),
                        children: [
                          (0, s.jsxs)(c.G7, {
                            className: "expand-filter__header",
                            onClick: function () {
                              return (function (e) {
                                _(e);
                              })(
                                (0, d.Z)(
                                  (0, d.Z)({}, e),
                                  {},
                                  { index: n, pIndex: v }
                                )
                              );
                            },
                            children: [
                              (0, s.jsx)(c.xv, {
                                className: "expand-filter__title",
                                children: e.name,
                              }),
                              (0, s.jsx)(t.Ko, {
                                src: u.includes(e.id)
                                  ? "fv_expand_up.png"
                                  : "fv_expand_down.png",
                                className: "expand-filter__expand-icon",
                                mode: "aspectFill",
                              }),
                            ],
                          }),
                          u.includes(e.id) &&
                            (0, s.jsx)(c.G7, {
                              className: "expand-filter__content",
                              children: (0, s.jsx)(t.Yf, {
                                tags: e.children,
                                selectedTags: l,
                                onSelect: function (n) {
                                  return (function (e) {
                                    x(e);
                                  })(
                                    (0, d.Z)(
                                      (0, d.Z)({}, n),
                                      {},
                                      { attribute_id: e.id }
                                    )
                                  );
                                },
                                pIndex: "".concat(v, "-").concat(n + 1),
                              }),
                            }),
                        ],
                      },
                      e.id
                    );
                  }),
          });
        };
      },
    },
  ]);
})();

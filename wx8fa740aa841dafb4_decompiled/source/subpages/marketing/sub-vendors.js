!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [2500],
    {
      62188: function (s, e, i) {
        var o = i(29439),
          c = i(67294),
          t = i(71515),
          l = i(85893),
          a = function (s) {
            var e = s.tabs,
              i = void 0 === e ? [] : e,
              a = s.value,
              r = s.onChange,
              n = s.loading,
              d = void 0 !== n && n,
              m = (0, c.useState)(0),
              p = (0, o.Z)(m, 2),
              _ = p[0],
              g = p[1];
            (0, c.useEffect)(
              function () {
                g(void 0 !== a ? a : 0);
              },
              [a]
            );
            return (0, l.jsx)(t.G7, {
              className: "comp-fv-tabs",
              children: (0, l.jsx)(t.G7, {
                className: "comp-fv-tabs__wrapper",
                children:
                  null == i
                    ? void 0
                    : i.map(function (s, e) {
                        return (0, l.jsxs)(
                          t.G7,
                          {
                            className: "comp-fv-tabs__item ".concat(
                              _ === e ? "comp-fv-tabs__item--active" : ""
                            ),
                            onClick: function () {
                              return (function (s) {
                                d || (s !== _ && (g(s), r && r(s)));
                              })(e);
                            },
                            children: [
                              s.title,
                              _ === e &&
                                (0, l.jsx)(t.G7, {
                                  className: "comp-fv-tabs__item-line",
                                }),
                            ],
                          },
                          e
                        );
                      }),
              }),
            });
          };
        (a.options = { addGlobalClass: !0 }), (e.Z = a);
      },
      92653: function (s, e, i) {
        i.d(e, {
          Z: function () {
            return p;
          },
        });
        var o = i(1413),
          c = (i(67294), i(92954)),
          t = i.n(c),
          l = i(71515),
          a = i(96856),
          r = i(80129),
          n = i.n(r),
          d = i(78061),
          m = i(85893);
        function p(s) {
          var e = s.info;
          return (0, m.jsxs)(l.G7, {
            className: "sp-group-goods-item",
            onClick: function () {
              !(function (s) {
                var e = s.itemId,
                  i = s.distributorId,
                  c = { id: e };
                void 0 !== i &&
                  (c = (0, o.Z)((0, o.Z)({}, c), {}, { dtid: i }));
                var l = "/pages/item/espier-detail?".concat(n().stringify(c));
                t().navigateTo({ url: l });
              })(e);
            },
            children: [
              (0, m.jsxs)(l.G7, {
                className: "sp-group-goods-item__image",
                children: [
                  (0, m.jsx)(d.Ko, { src: e.pic, mode: "aspectFill" }),
                  e.store <= 0 &&
                    (0, m.jsx)(l.G7, {
                      className: "soldout-mask",
                      children: (0, m.jsx)(l.G7, {
                        className: "soldout-mask-text",
                        children: (0, m.jsx)(l.xv, { children: "已售罄" }),
                      }),
                    }),
                ],
              }),
              (0, m.jsxs)(l.G7, {
                className: "sp-group-goods-item__content",
                children: [
                  (0, m.jsxs)(l.G7, {
                    className: "sp-group-goods-item__hd",
                    children: [
                      (0, m.jsx)(l.xv, {
                        className: "sp-group-goods-item__tag",
                        children: e.promotionTag,
                      }),
                      (0, m.jsx)(l.xv, {
                        className: "sp-group-goods-item__title",
                        children: e.itemName,
                      }),
                    ],
                  }),
                  (0, m.jsxs)(l.G7, {
                    className: "sp-group-goods-item__bd",
                    children: [
                      (0, m.jsxs)(l.G7, {
                        className: "sp-group-goods-item__price",
                        children: [
                          (0, m.jsx)(l.xv, {
                            className: "sp-group-goods-item__price-text",
                            children: "拼团价",
                          }),
                          (0, m.jsx)(l.xv, {
                            className: "sp-group-goods-item__price-symbol",
                            children: "¥",
                          }),
                          (0, m.jsx)(l.xv, {
                            className: "sp-group-goods-item__price-value",
                            children: (0, a.Po)(e.activityPrice),
                          }),
                          (0, m.jsx)(l.xv, {
                            className: "sp-group-goods-item__price-original",
                            children: (0, a.Po)(e.marketPrice),
                          }),
                        ],
                      }),
                      (0, m.jsx)(l.G7, {
                        className: "sp-group-goods-item__btn",
                        children: "参与拼团",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        }
      },
      8359: function (s, e, i) {
        i.d(e, {
          Z: function () {
            return _;
          },
        });
        var o = i(1413),
          c = i(67294),
          t = i(92954),
          l = i.n(t),
          a = i(71515),
          r = i(96856),
          n = i(78061),
          d = i(80459),
          m = i(85893),
          p = (0, t.getCurrentInstance)();
        function _(s) {
          var e = s.info,
            i = s.status,
            t = s.onClick,
            _ = s.moduleName,
            g = s.modulePosition,
            x = s.flowPosition;
          return (
            (0, c.useEffect)(
              function () {
                e &&
                  l().nextTick(function () {
                    (0,
                    d.GoodsModuleExposure)(p.page, { wrap: "#sp-limited-goods-item-".concat(g, "-").concat(e.itemId), params: (0, o.Z)((0, o.Z)({}, e), {}, { moduleName_var: _, modulePosition_var: g, flowPosition_var: x }) });
                  });
              },
              [e]
            ),
            (0, m.jsx)(n.vC, {
              onChange: t,
              children: (0, m.jsxs)(a.G7, {
                className: "sp-limited-goods-item",
                id: "sp-limited-goods-item-".concat(g, "-").concat(e.itemId),
                children: [
                  (0, m.jsxs)(a.G7, {
                    className: "sp-limited-goods-item__image",
                    children: [
                      (0, m.jsx)(n.Ko, {
                        src: e.pic,
                        mode: "aspectFill",
                        placeholderColor: "#f2f3f5",
                      }),
                      e.store <= 0 &&
                        (0, m.jsx)(a.G7, {
                          className: "soldout-mask",
                          children: (0, m.jsx)(a.G7, {
                            className: "soldout-mask-text",
                            children: (0, m.jsx)(a.xv, { children: "已售罄" }),
                          }),
                        }),
                    ],
                  }),
                  (0, m.jsxs)(a.G7, {
                    className: "sp-limited-goods-item__content",
                    children: [
                      (0, m.jsxs)(a.G7, {
                        children: [
                          (0, m.jsx)(a.G7, {
                            className: "sp-limited-goods-item__title",
                            children: e.itemName,
                          }),
                          (0, m.jsx)(a.G7, {
                            className: "sp-limited-goods-item__price-box",
                            children: (0, m.jsxs)(a.G7, {
                              className: "sp-limited-goods-item__price",
                              children: [
                                (0, m.jsx)(a.xv, {
                                  className:
                                    "sp-limited-goods-item__price-text",
                                  children: "秒杀价",
                                }),
                                (0, m.jsx)(a.xv, {
                                  className:
                                    "sp-limited-goods-item__price-symbol",
                                  children: "¥",
                                }),
                                (0, m.jsx)(a.xv, {
                                  className:
                                    "sp-limited-goods-item__price-value",
                                  children: e.activityPrice,
                                }),
                                e.marketPrice
                                  ? (0, m.jsx)(a.xv, {
                                      className:
                                        "sp-limited-goods-item__price-original",
                                      children: e.marketPrice,
                                    })
                                  : null,
                              ],
                            }),
                          }),
                        ],
                      }),
                      (0, m.jsx)(a.G7, {
                        children: (0, m.jsx)(a.G7, {
                          className: (0, r.AK)({
                            "sp-limited-goods-item__bd": !0,
                            "limited-running": "ongoing" == i,
                            "limited-waiting": "ongoing" != i,
                          }),
                          children:
                            "ongoing" === i
                              ? (0, m.jsxs)(m.Fragment, {
                                  children: [
                                    (0, m.jsxs)(a.G7, {
                                      className:
                                        "sp-limited-goods-item__progress",
                                      children: [
                                        (0, m.jsx)(a.G7, {
                                          className:
                                            "sp-limited-goods-item__progress-bar",
                                          children: (0, m.jsx)(a.G7, {
                                            className:
                                              "sp-limited-goods-item__progress-inner",
                                            style: {
                                              width: "".concat(
                                                e.seckillPercent,
                                                "%"
                                              ),
                                            },
                                          }),
                                        }),
                                        (0, m.jsxs)(a.G7, {
                                          className:
                                            "sp-limited-goods-item__progress-text",
                                          children: [
                                            "已抢",
                                            e.seckillPercent,
                                            "%",
                                          ],
                                        }),
                                      ],
                                    }),
                                    (0, m.jsxs)(a.G7, {
                                      className: "lighting-subsid__box",
                                      children: [
                                        (0, m.jsx)(a.G7, {
                                          className: "lighting-subsid__img",
                                          children: (0, m.jsx)(n.Ko, {
                                            src: "".concat(
                                              "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                                              "/fv_lighting_subsidy.png"
                                            ),
                                            mode: "aspectFill",
                                          }),
                                        }),
                                        (0, m.jsxs)(a.G7, {
                                          className: "limited-price__box",
                                          children: [
                                            (0, m.jsx)(a.G7, {
                                              className: "limited-price__label",
                                              children: "已补贴",
                                            }),
                                            (0, m.jsxs)(a.G7, {
                                              className: "limited-price__value",
                                              children: [
                                                Math.floor(
                                                  Number(
                                                    e.price - e.activityPrice
                                                  )
                                                ),
                                                "元",
                                              ],
                                            }),
                                          ],
                                        }),
                                        (0, m.jsx)(a.G7, {
                                          className:
                                            "sp-limited-goods-item__btn",
                                          children: (0, m.jsx)(a.G7, {
                                            className:
                                              "sp-limited-goods-item__btn-text",
                                            children: "抢购",
                                          }),
                                        }),
                                      ],
                                    }),
                                  ],
                                })
                              : (0, m.jsx)(m.Fragment, {
                                  children: (0, m.jsxs)(a.G7, {
                                    className: "limited-price__box",
                                    children: [
                                      (0, m.jsx)(a.G7, {
                                        className: "lighting-await-subsid__img",
                                        children: (0, m.jsx)(n.Ko, {
                                          src: "".concat(
                                            "https://aiopro-imgcdn.fvo2o.com/aiopro_vshop",
                                            "/fv_lighting_await_subsidy.png"
                                          ),
                                          mode: "aspectFill",
                                          width: 40,
                                          height: 68,
                                        }),
                                      }),
                                      (0, m.jsx)(a.G7, {
                                        className: "limited-price__label",
                                        children: "补贴：",
                                      }),
                                      (0, m.jsx)(a.G7, {
                                        className: "limited-price__value",
                                        children: Math.floor(
                                          Number(e.price - e.activityPrice)
                                        ),
                                      }),
                                      (0, m.jsx)(a.G7, {
                                        className: "limited-price__label",
                                        children: "元",
                                      }),
                                    ],
                                  }),
                                }),
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            })
          );
        }
      },
    },
  ]);
})();

!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [7247],
    {
      96795: function (e, n, t) {
        var o = t(32180),
          i = t(74165),
          r = t(15861),
          a = t(29439),
          c = t(67294),
          s = t(92954),
          l = t.n(s),
          u = t(90057),
          d = t(1696),
          g = t(96856),
          m = t(80459),
          f = t(78061),
          p = t(93433),
          h = t(31707),
          v = t(71515),
          x = t(27741),
          y = t(21066),
          _ = t(21391),
          j = t(85893),
          N = { isShowFloat: !1, scrollIntoView: "category-0" };
        var w = function (e) {
          var n = (0, u.x)(N),
            t = (0, a.Z)(n, 2),
            o = t[0],
            i = t[1],
            r = o.isShowFloat,
            c = o.scrollIntoView,
            s = e.onClick,
            l = void 0 === s ? function () {} : s,
            d = e.list,
            g = void 0 === d ? [] : d,
            m = e.cusIndex,
            p = void 0 === m ? 0 : m,
            h = function (e) {
              e.stopPropagation(),
                i(function (e) {
                  e.isShowFloat = !r;
                });
            },
            x = function () {
              return null == g
                ? void 0
                : g.map(function (e, n) {
                    return (0, j.jsxs)(
                      v.G7,
                      {
                        className: "category-item ".concat(
                          n == p ? "active" : ""
                        ),
                        onClick: function () {
                          return (function (e) {
                            i(function (n) {
                              (n.isShowFloat = !1),
                                (n.scrollIntoView = "category-".concat(e));
                            }),
                              l(e);
                          })(n);
                        },
                        id: "category-".concat(n),
                        children: [
                          (0, j.jsx)(v.G7, {
                            className: "category-image",
                            children: (0, j.jsx)(f.Ko, {
                              src: e.img,
                              mode: "aspectFill",
                              width: 100,
                              height: 100,
                              circle: 100,
                              lazyLoad: !0,
                            }),
                          }),
                          (0, j.jsx)(v.G7, {
                            className: "category-name",
                            children: e.name,
                          }),
                        ],
                      },
                      n
                    );
                  });
            };
          return (0, j.jsxs)(v.G7, {
            className: "comp-first-category",
            children: [
              (0, j.jsx)(v.pf, {
                className: "comp-first-category-scrollX",
                scrollX: !0,
                scrollIntoView: c,
                children: (0, j.jsx)(v.G7, {
                  className: "comp-first-category-content",
                  children: x(),
                }),
              }),
              (0, j.jsxs)(v.G7, {
                onClick: h,
                className: "comp-first-category-filter",
                children: [
                  (0, j.jsx)(v.xv, { children: "全部" }),
                  (0, j.jsx)(v.xv, { className: "at-icon at-icon-list" }),
                ],
              }),
              (0, j.jsx)(v.G7, {
                className: "comp-first-category-float ".concat(
                  r ? "isshow" : ""
                ),
                onClick: h,
                children: (0, j.jsx)(v.G7, {
                  className: "sp-select-box",
                  children: (0, j.jsx)(v.pf, {
                    className: "category-full",
                    scrollY: !0,
                    children: (0, j.jsx)(v.G7, {
                      className: "category-full-container",
                      children: x(),
                    }),
                  }),
                }),
              }),
            ],
          });
        };
        var k = function (e) {
            var n = e.onClick,
              t = void 0 === n ? function () {} : n,
              o = e.list,
              i = void 0 === o ? [] : o,
              r = e.cusIndex,
              a = void 0 === r ? 0 : r;
            return (0, j.jsx)(v.G7, {
              className: "comp-second-category",
              children: (0, j.jsx)(v.pf, {
                className: "comp-second-category-scroll",
                scrollY: !0,
                children:
                  null == i
                    ? void 0
                    : i.map(function (e, n) {
                        return (0, j.jsx)(
                          v.G7,
                          {
                            className: "category-item ".concat(
                              n == a ? "active" : ""
                            ),
                            onClick: function () {
                              return t(n);
                            },
                            children: (0, j.jsx)(v.G7, {
                              className: "category-name",
                              children: e.name,
                            }),
                          },
                          n
                        );
                      }),
              }),
            });
          },
          b = {
            isShowFloat: !1,
            scrollIntoView: "category-0",
            selectValue: null,
          };
        var Z = function (e) {
            var n = e.onClick,
              t = void 0 === n ? function () {} : n,
              o = e.list,
              i = void 0 === o ? [] : o,
              r = e.cusIndex,
              s = void 0 === r ? 0 : r,
              l = (0, u.x)(b),
              d = (0, a.Z)(l, 2),
              g = d[0],
              m = d[1],
              p = g.isShowFloat,
              h = g.scrollIntoView,
              x = g.selectValue;
            (0, c.useEffect)(
              function () {
                m(function (e) {
                  (e.isShowFloat = !1), (e.selectValue = i[s].id);
                });
              },
              [s]
            );
            var y = function () {
              m(function (e) {
                e.isShowFloat = !p;
              });
            };
            return (0, j.jsxs)(v.G7, {
              className: "comp-third-category",
              children: [
                (0, j.jsx)(v.pf, {
                  className: "comp-third-category-scroll",
                  scrollX: !0,
                  scrollIntoView: h,
                  children: (0, j.jsx)(v.G7, {
                    className: "scroll-container",
                    children:
                      null == i
                        ? void 0
                        : i.map(function (e, n) {
                            return (0, j.jsx)(
                              v.G7,
                              {
                                className: "category-item ".concat(
                                  n == s ? "active" : ""
                                ),
                                onClick: function () {
                                  return (function (e) {
                                    var n,
                                      o =
                                        null === (n = i[e]) || void 0 === n
                                          ? void 0
                                          : n.id;
                                    m(function (e) {
                                      (e.isShowFloat = !1),
                                        (e.scrollIntoView = "category-".concat(
                                          o
                                        ));
                                    }),
                                      t(e);
                                  })(n);
                                },
                                id: "category-".concat(e.id),
                                children: (0, j.jsx)(v.G7, {
                                  className: "category-name",
                                  children: e.name,
                                }),
                              },
                              e.id
                            );
                          }),
                  }),
                }),
                (0, j.jsx)(v.G7, {
                  className: "comp-third-category-filter",
                  children:
                    i.length > 0 &&
                    (0, j.jsx)(v.G7, {
                      className: "iconfont icon-arrowDown ".concat(
                        p && "rotate"
                      ),
                      onClick: y,
                    }),
                }),
                (0, j.jsx)(v.G7, {
                  className: "comp-third-category-float ".concat(
                    p ? "isshow" : ""
                  ),
                  onClick: y,
                  children: (0, j.jsx)(v.G7, {
                    className: "sp-select-box",
                    children: (0, j.jsx)(f.NE, {
                      info: i,
                      value: [x],
                      onChange: function (e) {
                        var n = (0, a.Z)(e, 1)[0],
                          o = i.findIndex(function (e) {
                            return e.id == n;
                          });
                        m(function (e) {
                          (e.isShowFloat = !1),
                            (e.scrollIntoView = "category-".concat(n));
                        }),
                          t(o);
                      },
                    }),
                  }),
                }),
              ],
            });
          },
          G = t(1413),
          C = t(53553),
          I = (t(37042), t(80129)),
          S = t.n(I),
          L = t(96943);
        function T(e) {
          var n,
            t,
            o,
            a = (0, h.I0)(),
            c = (0, h.v9)(function (e) {
              return e.user;
            }).favs,
            s = void 0 === c ? [] : c,
            u = e.onClick,
            d = e.onStoreClick,
            m = void 0 === d ? function () {} : d,
            p = e.onAddToCart,
            x = void 0 === p ? function () {} : p,
            N = e.showFav,
            w = void 0 !== N && N,
            k = e.info,
            b = void 0 === k ? null : k,
            Z = e.renderFooter,
            I = void 0 === Z ? null : Z,
            T = e.showPromotion,
            F = void 0 === T || T,
            P = e.showPrice,
            O = void 0 === P || P,
            V = e.hideStore,
            E = void 0 !== V && V,
            z = (0, y.f0)({}),
            A = (z.isLogin, z.isNewUser),
            R =
              (z.login,
              z.getUserInfoAuth,
              (function () {
                var e = (0, r.Z)(
                  (0, i.Z)().mark(function e(n) {
                    var t, o;
                    return (0, i.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if ((n.stopPropagation(), _.Z.getAuthToken())) {
                              e.next = 4;
                              break;
                            }
                            return (0, g.CF)("请先登录"), e.abrupt("return");
                          case 4:
                            if (
                              ((t = b.itemId),
                              (o =
                                s.findIndex(function (e) {
                                  return e.item_id == t;
                                }) > -1))
                            ) {
                              e.next = 11;
                              break;
                            }
                            return (e.next = 9), a((0, C.L$)(t));
                          case 9:
                            e.next = 13;
                            break;
                          case 11:
                            return (e.next = 13), a((0, C.f4)(t));
                          case 13:
                            return (e.next = 15), a((0, C.Mx)());
                          case 15:
                            (0, g.CF)(o ? "已移出收藏" : "已加入收藏");
                          case 16:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (n) {
                  return e.apply(this, arguments);
                };
              })()),
            D = function () {
              var e = b.itemId,
                n = b.distributorId;
              if (u) u();
              else {
                var t = { id: e };
                n && (t = (0, G.Z)((0, G.Z)({}, t), {}, { dtid: n }));
                var o = "/pages/item/espier-detail?".concat(S().stringify(t));
                l().navigateTo({ url: o });
              }
            };
          if (!b) return null;
          var U =
              s.findIndex(function (e) {
                return e.item_id == b.itemId;
              }) > -1,
            K =
              !E &&
              g.Um &&
              b.distributor_info &&
              !Array.isArray(b.distributor_info);
          return (0, j.jsxs)(v.G7, {
            className: (0, g.AK)("comp-goods-item"),
            children: [
              (0, j.jsx)(v.G7, {
                className: "goods-item__hd",
                onClick: D.bind(this),
                children: (0, j.jsx)(v.G7, {
                  className: "image-wrap",
                  children: (0, j.jsx)(f.Ko, {
                    className: "main-image",
                    width: 160,
                    height: 160,
                    src: b.pic,
                    mode: "aspectFill",
                    circle: 16,
                  }),
                }),
              }),
              (0, j.jsxs)(v.G7, {
                className: "goods-item__bd",
                children: [
                  "1" === b.type &&
                    (0, j.jsxs)(v.G7, {
                      className: "national-info",
                      children: [
                        (0, j.jsx)(v.Ee, {
                          className: "nationalFlag",
                          src: b.origincountry_img_url,
                          mode: "aspectFill",
                          lazyLoad: !0,
                        }),
                        (0, j.jsx)(v.xv, {
                          className: "nationalTitle",
                          children: b.origincountry_name,
                        }),
                      ],
                    }),
                  (0, j.jsx)(v.G7, {
                    className: "goods-info",
                    onClick: D.bind(this),
                    children: (0, j.jsxs)(v.G7, {
                      className: "goods-title",
                      children: [
                        1 == b.isMedicine &&
                          1 ==
                            (null == b ||
                            null === (n = b.medicineData) ||
                            void 0 === n
                              ? void 0
                              : n.is_prescription) &&
                          (0, j.jsx)(v.xv, {
                            className: "prescription-drug",
                            children: "处方药",
                          }),
                        b.itemName,
                      ],
                    }),
                  }),
                  b.tagList &&
                    (null === (t = b.tagList) || void 0 === t
                      ? void 0
                      : t.map(function (e) {
                          return (0,
                          j.jsx)(v.xv, { className: "promotion-tag promotion-tag-direct", style: (0, g.Tu)({ color: e.font_color, borderColor: e.tag_color, backgroundColor: e.tag_color }), children: e.tag_name }, e.tag_id);
                        })),
                  "direct" == b.ky_item_type &&
                    (0, j.jsx)(v.xv, {
                      className: "promotion-tag-direct",
                      children: "直供品",
                    }),
                  (0, j.jsx)(v.G7, {
                    className: "promotions",
                    children:
                      F &&
                      b.promotion &&
                      b.promotion.length > 0 &&
                      (0, j.jsx)(v.G7, {
                        children:
                          null == b ||
                          null === (o = b.promotion) ||
                          void 0 === o
                            ? void 0
                            : o.map(function (e, n) {
                                return (0,
                                j.jsx)(v.xv, { className: "promotion-tag", children: L.yJ[e.tag_type] }, "promotion-tag__".concat(n));
                              }),
                      }),
                  }),
                  (b.is_point || (!b.is_point && O) || w) &&
                    (0, j.jsxs)(v.G7, {
                      className: "bd-block",
                      onClick: D.bind(this),
                      children: [
                        b.is_point &&
                          (0, j.jsx)(v.G7, {
                            className: "goods-price",
                            children: (0, j.jsx)(f.qz, { value: b.point }),
                          }),
                        !b.is_point &&
                          O &&
                          (0, j.jsx)(v.G7, {
                            className: "goods-price",
                            children: (0, j.jsxs)(v.G7, {
                              className: "gd-price",
                              children: [
                                (0, j.jsx)(f.qq, {
                                  value: b.activityPrice || b.price,
                                  size: 36,
                                }),
                                b.price - b.activityPrice > 0
                                  ? (0, j.jsx)(v.xv, {
                                      className: "unit-price",
                                      children: b.price,
                                    })
                                  : "",
                              ],
                            }),
                          }),
                        w &&
                          (0, j.jsx)(v.G7, {
                            className: "bd-block-rg",
                            children: (0, j.jsx)(v.xv, {
                              className: (0, g.AK)(
                                "iconfont",
                                U ? "icon-shoucanghover-01" : "icon-shoucang-01"
                              ),
                              onClick: R,
                            }),
                          }),
                        (0, j.jsx)(f.vC, {
                          newUser: A,
                          children: (0, j.jsx)(v.xv, {
                            className: "iconfont icon-gouwuche2",
                            onClick: function (e) {
                              e.stopPropagation(), x(b);
                            },
                          }),
                        }),
                      ],
                    }),
                  K &&
                    (0, j.jsxs)(v.G7, {
                      className: "goods__store",
                      onClick: function () {
                        return m(b);
                      },
                      children: [
                        b.distributor_info.name,
                        " ",
                        (0, j.jsxs)(v.xv, {
                          className: "goods__store-entry",
                          children: [
                            "进店",
                            (0, j.jsx)(v.xv, {
                              className: "iconfont icon-arrowRight",
                            }),
                          ],
                        }),
                      ],
                    }),
                ],
              }),
              (0, j.jsx)(v.G7, { className: "goods-item__ft", children: I }),
            ],
          });
        }
        T.options = { addGlobalClass: !0 };
        var F = T,
          P = c.memo(f.C3),
          O = {
            cusIndex: 1,
            keywords: "",
            allList: [],
            categoryFirstIndex: 0,
            categorySecondIndex: 0,
            categoryThirdIndex: 0,
            goodsSort: 0,
            seriesList: [],
            cat_id: void 0,
            cat_type: void 0,
            show: !1,
            secondList: [],
            thirdList: [],
            info: null,
            skuPanelOpen: !1,
            selectType: "picker",
            gNavbarHeight: 0,
            height: 0,
          };
        var V = function (e) {
            var n = (0, s.getCurrentInstance)(),
              t = (0, u.x)(O),
              o = (0, a.Z)(t, 2),
              m = o[0],
              N = o[1],
              b = m.keywords,
              G = m.cusIndex,
              C = m.allList,
              I = m.goodsSort,
              S = m.seriesList,
              L = m.categoryFirstIndex,
              T = m.categorySecondIndex,
              V = m.categoryThirdIndex,
              E = m.cat_id,
              z = m.cat_type,
              A = m.secondList,
              R = m.thirdList,
              D = m.info,
              U = m.skuPanelOpen,
              K = m.selectType,
              Y = m.gNavbarHeight,
              H = m.height,
              M = (0, c.useRef)(),
              W = (0, c.useRef)(),
              q = (0, c.useRef)();
            (0, h.I0)(),
              (0, c.useEffect)(function () {
                J();
              }, []),
              (0, c.useEffect)(
                function () {
                  E && (null == M || M.current.reset(), oe());
                },
                [E]
              ),
              (0, c.useEffect)(
                function () {
                  U ? W.current.pageLock() : W.current.pageUnLock();
                },
                [U]
              );
            var J = (function () {
                var e = (0, r.Z)(
                  (0, i.Z)().mark(function e() {
                    var n, t;
                    return (0, i.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (e.next = 2),
                              d.Z.category.get(
                                g.Um ? { is_main_category: 0 } : {}
                              )
                            );
                          case 2:
                            (n = e.sent),
                              (t = (0, g.D9)(n, {
                                name: "category_name",
                                img: "image_url",
                                id: "category_id",
                                type: !g.Um,
                                category_id: "category_id",
                                children: function (e) {
                                  var n = e.children;
                                  return (0, g.D9)(n, {
                                    name: "category_name",
                                    img: "image_url",
                                    id: "category_id",
                                    type: !g.Um,
                                    category_id: "category_id",
                                    children: function (e) {
                                      var n = e.children;
                                      return (0, g.D9)(n, {
                                        name: "category_name",
                                        img: "image_url",
                                        type: !g.Um,
                                        id: "category_id",
                                      });
                                    },
                                  });
                                },
                              })),
                              N(function (e) {
                                var n, o;
                                (e.seriesList = t),
                                  (e.hasSeries = !0),
                                  (e.cat_id =
                                    null === (n = t[0]) || void 0 === n
                                      ? void 0
                                      : n.id),
                                  (e.cat_type =
                                    null === (o = t[0]) || void 0 === o
                                      ? void 0
                                      : o.type);
                              });
                          case 5:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              X = (function () {
                var e = (0, r.Z)(
                  (0, i.Z)().mark(function e(t) {
                    var o, r, a, c, s, u, m, f, h, v;
                    return (0, i.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (r = t.pageIndex),
                              (a = t.pageSize),
                              (c =
                                (null == n ||
                                null === (o = n.router) ||
                                void 0 === o
                                  ? void 0
                                  : o.params) || {}),
                              (s = c.dis_id),
                              (u = {
                                page: r,
                                pageSize: a,
                                keywords: b,
                                approve_status: "onsale,only_show",
                                item_type: "normal",
                                is_point: "false",
                                distributor_id:
                                  (void 0 === s ? null : s) ||
                                  l().getStorageSync("distributor_id"),
                                goodsSort: I,
                                v_store: G,
                              }),
                              z ? (u.category_id = E) : (u.category = E),
                              (e.next = 6),
                              d.Z.item.search(u)
                            );
                          case 6:
                            return (
                              (m = e.sent),
                              (f = m.list),
                              (h = m.total_count),
                              (v = (0, g.D9)(f, x.Z.goods.ITEM_LIST_GOODS)),
                              N(function (e) {
                                e.allList =
                                  1 == r
                                    ? v
                                    : [].concat((0, p.Z)(C), (0, p.Z)(v));
                              }),
                              e.abrupt("return", { total: h })
                            );
                          case 12:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (n) {
                  return e.apply(this, arguments);
                };
              })(),
              B = function (e) {
                var n = "/pages/indexStore?id=".concat(
                  e.distributor_info.distributor_id
                );
                l().navigateTo({ url: n });
              },
              $ = (function () {
                var e = (0, r.Z)(
                  (0, i.Z)().mark(function e(n) {
                    return (0, i.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            n &&
                              l().navigateTo({
                                url: "/subpages/item/list?keywords=".concat(n),
                              });
                          case 1:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (n) {
                  return e.apply(this, arguments);
                };
              })(),
              Q = (0, y.Nr)(function (e) {
                L != e &&
                  N(function (n) {
                    var t, o;
                    (n.categoryFirstIndex = e),
                      (n.categorySecondIndex = 0),
                      (n.categoryThirdIndex = 0),
                      (n.allList = []),
                      (n.cat_id =
                        null === (t = S[e]) || void 0 === t ? void 0 : t.id),
                      (n.cat_type =
                        null === (o = S[e]) || void 0 === o ? void 0 : o.type);
                  });
              }, 200),
              ee = (0, y.Nr)(function (e) {
                T != e &&
                  N(function (n) {
                    var t, o, i, r;
                    (n.categorySecondIndex = e),
                      (n.categoryThirdIndex = 0),
                      (n.allList = []),
                      (n.cat_id =
                        0 == e
                          ? null === (t = S[L]) || void 0 === t
                            ? void 0
                            : t.id
                          : null === (o = A[e]) || void 0 === o
                          ? void 0
                          : o.id),
                      (n.cat_type =
                        0 == e
                          ? null === (i = S[L]) || void 0 === i
                            ? void 0
                            : i.type
                          : null === (r = A[e]) || void 0 === r
                          ? void 0
                          : r.type);
                  });
              }, 200),
              ne = (0, y.Nr)(function (e) {
                V != e &&
                  N(function (n) {
                    var t, o, i, r;
                    (n.categoryThirdIndex = e),
                      (n.allList = []),
                      (n.cat_id =
                        0 == e
                          ? null === (t = A[T]) || void 0 === t
                            ? void 0
                            : t.id
                          : null === (o = R[e]) || void 0 === o
                          ? void 0
                          : o.id),
                      (n.cat_type =
                        0 == e
                          ? null === (i = A[T]) || void 0 === i
                            ? void 0
                            : i.type
                          : null === (r = R[e]) || void 0 === r
                          ? void 0
                          : r.type);
                  });
              }, 200),
              te = (function () {
                var e = (0, r.Z)(
                  (0, i.Z)().mark(function e(n) {
                    var t, o, r, a;
                    return (0, i.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              if (
                                ((t = n.itemId),
                                (o = n.distributorId),
                                _.Z.getAuthToken())
                              ) {
                                e.next = 4;
                                break;
                              }
                              return (
                                null === (r = q.current) ||
                                  void 0 === r ||
                                  r.handleToLogin(),
                                e.abrupt("return")
                              );
                            case 4:
                              return (
                                l().showLoading(),
                                (e.prev = 5),
                                (e.next = 8),
                                d.Z.item.detail(t, {
                                  showError: !1,
                                  distributor_id: o,
                                })
                              );
                            case 8:
                              (a = e.sent),
                                l().hideLoading(),
                                N(function (e) {
                                  (e.info = (0, g.D9)(a, x.Z.goods.GOODS_INFO)),
                                    (e.skuPanelOpen = !0),
                                    (e.selectType = "addcart");
                                }),
                                (e.next = 17);
                              break;
                            case 13:
                              (e.prev = 13),
                                (e.t0 = e.catch(5)),
                                (0, g.CF)(e.t0.message),
                                l().hideLoading();
                            case 17:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[5, 13]]
                    );
                  })
                );
                return function (n) {
                  return e.apply(this, arguments);
                };
              })(),
              oe = (function () {
                var e = (0, r.Z)(
                  (0, i.Z)().mark(function e() {
                    var n, t, o, r;
                    return (0, i.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            (o = [{ name: "全部", img: "", id: "" }].concat(
                              (0, p.Z)(
                                (null === (n = S[L]) || void 0 === n
                                  ? void 0
                                  : n.children) || []
                              )
                            )),
                              (r =
                                (null === (t = o[T]) || void 0 === t
                                  ? void 0
                                  : t.children) || []),
                              N(function (e) {
                                (e.secondList = o),
                                  (e.thirdList =
                                    r.length > 0
                                      ? [
                                          { name: "全部", img: "", id: "" },
                                        ].concat((0, p.Z)(r))
                                      : []);
                              });
                          case 3:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })();
            return (0, j.jsxs)(f.nO, {
              scrollToTopBtn: !0,
              className: (0, g.AK)("page-category-index-old"),
              ref: W,
              onReady: function (e) {
                N(function (n) {
                  (n.gNavbarHeight = e.gNavbarH), (n.height = e.height);
                });
              },
              children: [
                (0, j.jsxs)(v.G7, {
                  className: "container-hd",
                  style: { top: "".concat(Y, "px") },
                  children: [
                    (0, j.jsx)(v.G7, {
                      className: "category-search",
                      children: (0, j.jsx)(f.p0, { onConfirm: $ }),
                    }),
                    (0, j.jsx)(w, { cusIndex: L, list: S, onClick: Q }),
                  ],
                }),
                (0, j.jsxs)(v.G7, {
                  className: "container-bd",
                  style: {
                    top: "calc(".concat(Y, "px + 266rpx)"),
                    height: "calc(".concat(H, " - 266rpx)"),
                  },
                  children: [
                    (0, j.jsx)(v.G7, {
                      className: "left-container",
                      children: (0, j.jsx)(k, {
                        cusIndex: T,
                        list: A,
                        onClick: ee,
                      }),
                    }),
                    (0, j.jsxs)(v.G7, {
                      className: "right-container",
                      style: (0, g.Tu)({ paddingTop: 0 == R.length && "0px" }),
                      children: [
                        R.length > 0 &&
                          (0, j.jsx)(v.G7, {
                            className: "right-container-fixed",
                            children: (0, j.jsx)(Z, {
                              cusIndex: V,
                              list: R,
                              onClick: ne,
                              typeIndex: G,
                            }),
                          }),
                        (0, j.jsx)(v.pf, {
                          className: "goods-list-container",
                          scrollY: !0,
                          children: (0, j.jsx)(f.B, {
                            className: "scroll-view-goods",
                            ref: M,
                            fetch: X,
                            auto: !1,
                            children:
                              null == C
                                ? void 0
                                : C.map(function (e, n) {
                                    return (0,
                                    j.jsx)(v.G7, { className: "goods-item-wrap", children: (0, j.jsx)(F, { onStoreClick: B, onAddToCart: te, hideStore: !0, info: e }) }, "goods-item-l__".concat(n));
                                  }),
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                (0, j.jsx)(P, {
                  open: U,
                  type: K,
                  info: D,
                  onClose: function () {
                    N(function (e) {
                      e.skuPanelOpen = !1;
                    });
                  },
                  onChange: function (e, n) {
                    N(function (t) {
                      (t.skuText = e), (t.curItem = n);
                    });
                  },
                }),
                (0, j.jsx)(f.vC, { ref: q }),
              ],
            });
          },
          E = t(45987),
          z = t(93967),
          A = t.n(z),
          R = t(5806),
          D = ["params"],
          U = {
            activeTab: null,
            categories: [],
            subCategories: null,
            filterWgts: [],
            loading: !1,
          };
        var K = c.memo(function () {
            var e = (0, u.x)(U),
              n = (0, a.Z)(e, 2),
              t = n[0],
              o = n[1],
              s = (0, h.v9)(function (e) {
                return e.regionauth;
              }).regionauthInfo,
              p = void 0 === s ? {} : s,
              x = t.activeTab,
              y = t.categories,
              _ = t.subCategories,
              N = t.filterWgts,
              w = t.loading;
            (0, c.useEffect)(
              function () {
                null != p &&
                  p.regionauth_id &&
                  (o(function (e) {
                    e.loading = !0;
                  }),
                  k());
              },
              [p]
            );
            var k = (function () {
                var e = (0, r.Z)(
                  (0, i.Z)().mark(function e() {
                    var n;
                    return (0, i.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (e.prev = 0), (e.next = 3), d.Z.category.get({})
                              );
                            case 3:
                              (n = e.sent),
                                o(function (e) {
                                  e.categories = n;
                                }),
                                b(n[0]),
                                (e.next = 11);
                              break;
                            case 8:
                              (e.prev = 8),
                                (e.t0 = e.catch(0)),
                                o(function (e) {
                                  e.loading = !1;
                                });
                            case 11:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[0, 8]]
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              b = (function () {
                var e = (0, r.Z)(
                  (0, i.Z)().mark(function e(n) {
                    var t, r, a, c;
                    return (0, i.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              if (
                                ((e.prev = 0),
                                null == n ||
                                  !n.customize_page_id ||
                                  0 ==
                                    (null == n ? void 0 : n.customize_page_id))
                              ) {
                                e.next = 11;
                                break;
                              }
                              return (
                                (t = {
                                  template_name: g.CI,
                                  version: "v1.0.1",
                                  page_name: "custom_".concat(
                                    n.customize_page_id
                                  ),
                                }),
                                (e.next = 5),
                                d.Z.category.getCategory(t)
                              );
                            case 5:
                              (r = e.sent),
                                (a = r.list),
                                (c =
                                  null == a
                                    ? void 0
                                    : a.map(function (e) {
                                        var n = e.params,
                                          t = (0, E.Z)(e, D);
                                        return (0, G.Z)((0, G.Z)({}, t), n);
                                      })),
                                o(function (e) {
                                  (e.filterWgts = c.filter(function (e) {
                                    return "page" !== e.name;
                                  })),
                                    (e.activeTab = n.category_id),
                                    (e.subCategories = []),
                                    (e.loading = !1);
                                }),
                                (e.next = 12);
                              break;
                            case 11:
                              o(function (e) {
                                (e.activeTab =
                                  null == n ? void 0 : n.category_id),
                                  (e.filterWgts = []),
                                  (e.subCategories =
                                    null == n ? void 0 : n.children),
                                  (e.loading = !1);
                              });
                            case 12:
                              e.next = 17;
                              break;
                            case 14:
                              (e.prev = 14),
                                (e.t0 = e.catch(0)),
                                o(function (e) {
                                  e.loading = !1;
                                });
                            case 17:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[0, 14]]
                    );
                  })
                );
                return function (n) {
                  return e.apply(this, arguments);
                };
              })(),
              Z = (function () {
                var e = (0, r.Z)(
                  (0, i.Z)().mark(function e(n, t) {
                    return (0, i.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            (0, m.setFlowClickGio)({
                              position: 1,
                              index: t,
                              moduleName_var: "左侧一级类目导航点击",
                              title: n.category_name,
                              regionauth_code:
                                (null == p ? void 0 : p.regionauth_code) || "-",
                            }),
                              b(n);
                          case 2:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (n, t) {
                  return e.apply(this, arguments);
                };
              })();
            return w
              ? (0, j.jsx)(f.m6, {})
              : (0, j.jsxs)(v.G7, {
                  className: "page-category category-flat-layout",
                  children: [
                    (0, j.jsx)(v.pf, {
                      scrollY: !0,
                      className: "category-flat-layout__main-category",
                      enhanced: !0,
                      bounces: !1,
                      showScrollbar: !1,
                      children:
                        null == y
                          ? void 0
                          : y.map(function (e, n) {
                              return (0, j.jsx)(
                                v.G7,
                                {
                                  className: A()(
                                    "category-flat-layout__category-item",
                                    {
                                      "category-flat-layout__category-item--active":
                                        x === e.category_id,
                                    }
                                  ),
                                  onClick: function () {
                                    return Z(e, n + 1);
                                  },
                                  children: (0, j.jsx)(v.xv, {
                                    className:
                                      "category-flat-layout__category-name",
                                    children: e.category_name,
                                  }),
                                },
                                e.category_id
                              );
                            }),
                    }),
                    (0, j.jsx)(v.pf, {
                      scrollY: !0,
                      className: "category-flat-layout__category-content",
                      enhanced: !0,
                      bounces: !1,
                      showScrollbar: !1,
                      children: (0, j.jsxs)(j.Fragment, {
                        children: [
                          null == _
                            ? void 0
                            : _.map(function (e, n) {
                                var t;
                                return (0, j.jsxs)(
                                  v.G7,
                                  {
                                    className: "category-flat-layout__content",
                                    children: [
                                      (0, j.jsxs)(v.G7, {
                                        className:
                                          "flex justify-between pt-48 pb-24 pl-32 pr-32",
                                        onClick: function () {
                                          l().navigateTo({
                                            url: "/subpages/item/list?category_id="
                                              .concat(
                                                e.category_id,
                                                "&cate_name="
                                              )
                                              .concat(
                                                e.category_name,
                                                "&hide_search=1"
                                              ),
                                          });
                                        },
                                        children: [
                                          (0, j.jsx)(v.G7, {
                                            className:
                                              "drak-text text-36 font-medium",
                                            children: e.category_name,
                                          }),
                                          (0, j.jsx)(f.Ko, {
                                            src: "fv_chevron_right.png",
                                            width: 40,
                                            height: 40,
                                          }),
                                        ],
                                      }),
                                      (0, j.jsx)(v.G7, {
                                        className: "category-item__list",
                                        children:
                                          null === (t = e.children) ||
                                          void 0 === t
                                            ? void 0
                                            : t.map(function (t, o) {
                                                return (0, j.jsxs)(
                                                  v.G7,
                                                  {
                                                    className: "category-item",
                                                    onClick: function () {
                                                      return (function (
                                                        e,
                                                        n,
                                                        t,
                                                        o
                                                      ) {
                                                        (0, m.setFlowClickGio)({
                                                          position: n,
                                                          index: t,
                                                          moduleName_var: o,
                                                          title:
                                                            e.category_name,
                                                          regionauth_code:
                                                            (null == p
                                                              ? void 0
                                                              : p.regionauth_code) ||
                                                            "-",
                                                        }),
                                                          l().navigateTo({
                                                            url: "/subpages/item/list?category_id="
                                                              .concat(
                                                                e.category_id,
                                                                "&cate_name="
                                                              )
                                                              .concat(
                                                                e.category_name,
                                                                "&hide_search=1"
                                                              ),
                                                          });
                                                      })(
                                                        t,
                                                        n + 1,
                                                        o + 1,
                                                        e.category_name
                                                      );
                                                    },
                                                    children: [
                                                      (0, j.jsx)(f.Ko, {
                                                        src: t.image_url,
                                                        width: 150,
                                                        height: 150,
                                                      }),
                                                      (0, j.jsx)(v.G7, {
                                                        className:
                                                          "drak-text text-24 font-normal text-center mt-12 category-item__list__text",
                                                        children:
                                                          t.category_name,
                                                      }),
                                                    ],
                                                  },
                                                  t.category_id
                                                );
                                              }),
                                      }),
                                    ],
                                  },
                                  e.category_id
                                );
                              }),
                          0 == (null == _ ? void 0 : _.length) &&
                            (0, j.jsx)(v.pf, {
                              scrollY: !0,
                              className:
                                "category-flat-layout__content wgt-wrap",
                              style: { height: "100%" },
                              children:
                                null == N
                                  ? void 0
                                  : N.map(function (e, n) {
                                      return (0,
                                      j.jsxs)(j.Fragment, { children: ["shop" == e.name && (0, j.jsx)(R.Mu, { info: e, id: n + 1 }), "classify" == e.name && (0, j.jsx)(R.g8, { info: e, id: n + 1 }), "imgHotzone" === e.name && (0, j.jsx)(R.dd, { info: e, id: n + 1 }), " ", "slider" === e.name && (0, j.jsx)(R.vY, { isHomeSearch: !0, info: e, id: n + 1 }), " ", "film" === e.name && (0, j.jsx)(R.fn, { info: e, id: n + 1 }), " "] });
                                    }),
                            }),
                        ],
                      }),
                    }),
                  ],
                });
          }),
          Y = { layout: 0 };
        var H = function (e) {
          var n = (0, u.x)(Y),
            t = (0, a.Z)(n, 2),
            o = t[0],
            p = t[1],
            h = (0, c.useRef)(null),
            v = (0, s.useRouter)();
          (0, c.useEffect)(function () {
            x(), y(), h.current.pageLock();
          }, []);
          var x = (function () {
              var e = (0, r.Z)(
                (0, i.Z)().mark(function e() {
                  var n, t, o, r, a, c, s, u, m, f;
                  return (0, i.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (t = null == v ? void 0 : v.params),
                            (o = t.idListStr),
                            (r = t.ruleId),
                            o &&
                              ((a = o.split(",")),
                              l().setStorageSync("task_shop_list", a),
                              l().setStorageSync("task_shop_rule_id", r)),
                            (e.next = 4),
                            d.Z.category.getCategory({
                              template_name: g.CI,
                              version: "v1.0.1",
                              page_name: "category",
                            })
                          );
                        case 4:
                          (c = e.sent),
                            (s = c.list),
                            (u =
                              (null == s || null === (n = s[0]) || void 0 === n
                                ? void 0
                                : n.params) || {}),
                            (m = u.addCar),
                            (f = u.classify),
                            p(function (e) {
                              e.layout = m && !f ? 2 : 1;
                            });
                        case 8:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              );
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            y = (function () {
              var e = (0, r.Z)(
                (0, i.Z)().mark(function e() {
                  var n, t, o, r;
                  return (0, i.Z)().wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (e.next = 2), g.N_.getRouteParams();
                        case 2:
                          (n = e.sent),
                            (t = n.previousPage),
                            (o = n.searchModule),
                            (r = n.keyword),
                            t &&
                              o &&
                              r &&
                              (0, m.setSearchResultGio)({
                                searchWord: r,
                                searchModule: o,
                                sourceEntrance: t,
                                resultNumber: 0,
                                ifSearchResult: "其他",
                              });
                        case 7:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              );
              return function () {
                return e.apply(this, arguments);
              };
            })();
          return (0, j.jsxs)(f.nO, {
            className: "page-category",
            renderNavigation: (0, j.jsx)(f.mW, {}),
            ref: h,
            showLive: !0,
            renderFooter: (0, j.jsx)(j.Fragment, {}),
            children: [
              1 === o.layout && (0, j.jsx)(V, {}),
              2 === o.layout && (0, j.jsx)(K, {}),
            ],
          });
        };
        Page(
          (0, o.createPageConfig)(
            H,
            "pages/category/index",
            { root: { cn: [] } },
            { navigationStyle: "custom" } || {}
          )
        );
      },
    },
    function (e) {
      e.O(0, [2107, 1216, 8592], function () {
        return (function (n) {
          return e((e.s = n));
        })(96795);
      }),
        e.O();
    },
  ]);
})();

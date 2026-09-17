!(function () {
  "use strict";
  require("./sub-common/899d73213da416588facf8e40fb36354.js"),
    require("./sub-common/7c9e96d4e67eed876cde3fb8eb9a7a6d.js"),
    require("./sub-common/9c36ef1738753403dbec58e763490484.js"),
    require("./sub-common/14338409af789766c313815505161df5.js"),
    require("./sub-common/de5bf73e54154c797a164e4122d0c0dc.js"),
    require("./sub-common/4167e5dedb0650e7db907e399b6a590f.js"),
    require("./sub-common/41fdb3fd793f3b42b690b58df803a6f4.js"),
    require("./sub-common/f586f63ff06ee16371885aba8635b8f1.js"),
    require("./sub-common/4bbea5a055fe8276004d2b0a53c911a4.js"),
    require("./sub-common/82f8cc24ac4107e308710e4de7eb4661.js"),
    require("./sub-common/6fb59393a70dea1ed8578b8f21bbaf07.js"),
    require("./sub-common/fd7eb236de4449263469ea99c14e228f.js"),
    require("./sub-common/31435c7bf5861bf987003454a80b776f.js"),
    require("./sub-common/209d88bfa71346c59d575002cc1dab65.js"),
    require("./sub-common/42cd5e48a3f84fca66dbc78b7568c54f.js"),
    require("./sub-common/7b9cb83d1423d521c6a502f67a775cd8.js"),
    require("./sub-common/9e06b0805cd226c23e1e3cab2329b411.js"),
    require("./sub-common/ca3b01c5698d177859143ce457deb158.js"),
    require("./sub-common/03af81d622adb2411fd11e6f0c1c2f5e.js"),
    require("./sub-common/847da300ae1911ce8862bccfb1d37ced.js"),
    require("./sub-common/9e8e829f282985b09050c317d8804b36.js"),
    require("./sub-common/8c6e156887d7890f00a2c77737716f3a.js"),
    require("./sub-common/88db826e1c9ed27d9611be95e496da7c.js"),
    require("./sub-common/c8103d06255907d1e165f9f0a647fb3e.js"),
    require("./sub-common/d73117510a6aa77ec2d8ef13b347a13c.js"),
    require("./sub-common/66c73cdbf64b40d1999588c9091697ca.js"),
    require("./sub-common/74ee74f95916bef6ef514b31ee03c4c8.js"),
    require("./sub-common/07685315e736f01f70accc1bedfed941.js"),
    require("./sub-common/345fe984afab6a5919df6f615acf2e48.js"),
    require("./sub-common/97e8f5e0d665eaccf444a406c1e347da.js"),
    require("./sub-common/ec8bdfe232eefc1b37fe14caf80f2bf9.js"),
    require("./sub-common/74f108c90ff8039d8a83bdd865ae040d.js"),
    require("./sub-common/46db6df93d0f1d11bc7b80b657b9f6cb.js"),
    require("./sub-common/98e2604caa5c706822e49cb5dd2d0946.js"),
    require("./sub-common/9c415bae2c268d176250e83c5938a54c.js"),
    require("./sub-common/5bbe0f1c2b6351a5dc943d31f12f8af9.js"),
    (wx.webpackJsonp = wx.webpackJsonp || []).push([
      [3519],
      {
        66574: function (e, i, n) {
          var t = n(32180),
            o = n(37762),
            s = n(1413),
            r = n(74165),
            a = n(15861),
            l = n(29439),
            c = n(67294),
            d = n(92954),
            u = n.n(d),
            p = n(71515),
            m = n(1696),
            _ = n(78061),
            f = n(21066),
            v = n(90057),
            h = n(31707),
            b = n(37042),
            x = n(53553),
            g = n(30349),
            y = n(27741),
            j = n(80459),
            k = n(96856),
            N = n(52744),
            w = n(66341),
            C = n(54789),
            G = n(39679),
            Z = n(4942),
            D = n(93967),
            T = n.n(D),
            M = n(85893),
            S = (0, c.forwardRef)(function (e, i) {
              var n = e.deliveryType,
                t = void 0 === n ? "express" : n,
                o = e.pickerInfo,
                l = void 0 === o ? {} : o,
                d = e.showDeliveryTabs,
                m = void 0 !== d && d,
                f = e.showZitiTab,
                v = void 0 !== f && f,
                b = e.zitiTabDisabled,
                x = void 0 !== b && b,
                g = e.addressDetailOnly,
                y = void 0 !== g && g,
                k = e.pickupFormOnly,
                N = void 0 !== k && k,
                w = e.deliveryHint,
                C = void 0 === w ? "" : w,
                G = e.deliveryHintStyle,
                D = void 0 === G ? "" : G,
                S = e.canViewPickupOnlyGoods,
                O = void 0 !== S && S,
                I = e.onViewPickupOnlyGoods,
                P = void 0 === I ? function () {} : I,
                q = e.onDeliveryChange,
                L = e.onPickerInfoChange,
                V = e.setAddressPickerVisible,
                R = void 0 === V ? function () {} : V,
                A = (0, h.v9)(function (e) {
                  return e.regionauth;
                }).regionauthInfo,
                z = (0, c.useRef)(null),
                F = (0, h.v9)(function (e) {
                  return e.user;
                }).address;
              (0, c.useImperativeHandle)(i, function () {
                return {
                  validateZitiInfo: (function () {
                    var e = (0, a.Z)(
                      (0, r.Z)().mark(function e() {
                        return (0, r.Z)().wrap(
                          function (e) {
                            for (;;)
                              switch ((e.prev = e.next)) {
                                case 0:
                                  if ("store" === t) {
                                    e.next = 2;
                                    break;
                                  }
                                  return e.abrupt("return", !0);
                                case 2:
                                  return (
                                    (e.prev = 2),
                                    (e.next = 5),
                                    z.current.onSubmitAsync()
                                  );
                                case 5:
                                  return e.abrupt("return", !0);
                                case 8:
                                  return (
                                    (e.prev = 8),
                                    (e.t0 = e.catch(2)),
                                    e.abrupt("return", !1)
                                  );
                                case 11:
                                case "end":
                                  return e.stop();
                              }
                          },
                          e,
                          null,
                          [[2, 8]]
                        );
                      })
                    );
                    return function () {
                      return e.apply(this, arguments);
                    };
                  })(),
                };
              });
              var E = function (e) {
                  ("store" === e && x) ||
                    ((0, j.setFlowClickGio)({
                      position: 1,
                      index: "express" === e ? 1 : 2,
                      moduleName_var: "切换收货方式",
                      title: "express" === e ? "邮寄到家" : "到店自提",
                      regionauth_code:
                        (null == A ? void 0 : A.regionauth_code) || "-",
                    }),
                    e !== t && q && q("express" === e ? "logistics" : "ziti"));
                },
                K = function (e, i) {
                  L && L((0, s.Z)((0, s.Z)({}, l), {}, (0, Z.Z)({}, e, i)));
                },
                J = m && v,
                H = !J && C,
                B = function (e) {
                  if (!C) return null;
                  var i = T()("sp-delivery__hint", e, {
                    "sp-delivery__hint--warning": "warning" === D,
                    "sp-delivery__hint--muted": "muted" === D,
                  });
                  return (0, M.jsx)(p.G7, {
                    className: i,
                    children: (0, M.jsxs)(p.xv, {
                      className: "sp-delivery__hint-text",
                      children: [
                        C,
                        O
                          ? (0, M.jsx)(p.xv, {
                              className: "sp-delivery__hint-link",
                              onClick: P,
                              children: "查看仅自提商品",
                            })
                          : null,
                      ],
                    }),
                  });
                };
              return (0, M.jsxs)(p.G7, {
                className: T()("sp-delivery", {
                  "sp-delivery--with-tabs": J,
                  "sp-delivery--mail-only": !J && !N,
                  "sp-delivery--ziti-only": N,
                }),
                children: [
                  J
                    ? (0, M.jsxs)(p.G7, {
                        className: "sp-delivery__tabs-card",
                        children: [
                          (0, M.jsxs)(p.G7, {
                            className: "sp-delivery__tabs",
                            children: [
                              (0, M.jsx)(p.G7, {
                                className: T()("sp-delivery__tab", {
                                  "sp-delivery__tab--active": "express" === t,
                                }),
                                onClick: function () {
                                  return E("express");
                                },
                                children: (0, M.jsx)(p.xv, {
                                  className: "sp-delivery__tab-text",
                                  children: "邮寄到家",
                                }),
                              }),
                              v
                                ? (0, M.jsx)(p.G7, {
                                    className: T()("sp-delivery__tab", {
                                      "sp-delivery__tab--active": "store" === t,
                                      "sp-delivery__tab--disabled": x,
                                    }),
                                    onClick: function () {
                                      return E("store");
                                    },
                                    children: (0, M.jsx)(p.xv, {
                                      className: "sp-delivery__tab-text",
                                      children: "到店自提",
                                    }),
                                  })
                                : null,
                            ],
                          }),
                          "muted" === D ? B("sp-delivery__hint--inline") : null,
                          "warning" === D
                            ? B("sp-delivery__hint--notice")
                            : null,
                        ],
                      })
                    : null,
                  H ? B("sp-delivery__hint--plain") : null,
                  "express" !== t || N
                    ? (0, M.jsx)(p.G7, {
                        className: T()("sp-delivery__pickup", {
                          "sp-delivery__pickup--compact": N,
                        }),
                        children: (0, M.jsx)(_.xx, {
                          showMessage: !1,
                          ref: z,
                          formData: l,
                          rules: {
                            name: [
                              { required: !0, message: "请输入提货人姓名" },
                            ],
                            phone: [
                              { required: !0, message: "请输入提货人手机号" },
                              {
                                pattern: /^1[3-9]\d{9}$/,
                                message: "请输入正确的手机号码",
                              },
                            ],
                          },
                          className: "sp-delivery__pickup-form-wrapper",
                          children: (0, M.jsxs)(p.G7, {
                            className: "sp-delivery__pickup-form",
                            children: [
                              (0, M.jsxs)(p.G7, {
                                className: "sp-delivery__pickup-item",
                                children: [
                                  (0, M.jsxs)(p.G7, {
                                    className: "sp-delivery__pickup-label",
                                    children: [
                                      (0, M.jsx)(p.xv, {
                                        className:
                                          "sp-delivery__pickup-required",
                                        children: "*",
                                      }),
                                      (0, M.jsx)(p.xv, { children: "提货人" }),
                                    ],
                                  }),
                                  (0, M.jsx)(_.K$, {
                                    prop: "name",
                                    hideError: !0,
                                    className: "sp-delivery__pickup-form-item",
                                    children: (0, M.jsx)(p.II, {
                                      className: "sp-delivery__pickup-input",
                                      placeholder: "请输入姓名",
                                      placeholderClass:
                                        "sp-delivery__pickup-placeholder",
                                      value: l.name || "",
                                      onInput: function (e) {
                                        return K("name", e.detail.value);
                                      },
                                    }),
                                  }),
                                ],
                              }),
                              (0, M.jsxs)(p.G7, {
                                className: "sp-delivery__pickup-item",
                                children: [
                                  (0, M.jsxs)(p.G7, {
                                    className: "sp-delivery__pickup-label",
                                    children: [
                                      (0, M.jsx)(p.xv, {
                                        className:
                                          "sp-delivery__pickup-required",
                                        children: "*",
                                      }),
                                      (0, M.jsx)(p.xv, { children: "手机号" }),
                                    ],
                                  }),
                                  (0, M.jsx)(_.K$, {
                                    prop: "phone",
                                    hideError: !0,
                                    className: "sp-delivery__pickup-form-item",
                                    children: (0, M.jsx)(p.II, {
                                      className: "sp-delivery__pickup-input",
                                      type: "number",
                                      maxlength: 11,
                                      placeholder: "请输入手机号",
                                      placeholderClass:
                                        "sp-delivery__pickup-placeholder",
                                      value: l.phone || "",
                                      onInput: function (e) {
                                        return K("phone", e.detail.value);
                                      },
                                    }),
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                      })
                    : (0, M.jsx)(p.G7, {
                        className: "sp-delivery__address",
                        onClick: function () {
                          return R(!0);
                        },
                        children: F
                          ? (0, M.jsxs)(p.G7, {
                              className: "sp-delivery__address-content",
                              children: [
                                (0, M.jsx)(p.G7, {
                                  className: "sp-delivery__address-icon",
                                  children: (0, M.jsx)(_.Ko, {
                                    src: "fv_shouhuodizhi.png",
                                    width: 40,
                                    height: 40,
                                  }),
                                }),
                                (0, M.jsxs)(p.G7, {
                                  className: "sp-delivery__address-info",
                                  children: [
                                    (0, M.jsx)(p.xv, {
                                      className: "sp-delivery__address-detail",
                                      children: F
                                        ? y
                                          ? F.adrdetail || ""
                                          : ""
                                              .concat(F.province || "")
                                              .concat(F.city || "")
                                              .concat(F.county || "")
                                              .concat(F.adrdetail || "")
                                        : "",
                                    }),
                                    (0, M.jsxs)(p.G7, {
                                      className: "sp-delivery__address-row",
                                      children: [
                                        (0, M.jsx)(p.xv, {
                                          className:
                                            "sp-delivery__address-name",
                                          children: F.username,
                                        }),
                                        (0, M.jsx)(p.xv, {
                                          className:
                                            "sp-delivery__address-phone",
                                          children: F.telephone,
                                        }),
                                        F.is_def
                                          ? (0, M.jsx)(p.xv, {
                                              className:
                                                "sp-delivery__address-tag",
                                              children: "默认",
                                            })
                                          : null,
                                      ],
                                    }),
                                  ],
                                }),
                                (0, M.jsx)(p.G7, {
                                  className: "sp-delivery__address-arrow",
                                  children: (0, M.jsx)(_.Ko, {
                                    src: "fv_chevron_right.png",
                                    width: 40,
                                    height: 40,
                                  }),
                                }),
                              ],
                            })
                          : (0, M.jsxs)(p.G7, {
                              className: "sp-delivery__address-empty",
                              children: [
                                (0, M.jsxs)(p.G7, {
                                  className: "sp-delivery__address-empty-text",
                                  children: [
                                    (0, M.jsx)(_.Ko, {
                                      src: "fv_shouhuodizhi.png",
                                      width: 40,
                                      height: 40,
                                    }),
                                    (0, M.jsx)(p.xv, {
                                      children: "请选择收货地址",
                                    }),
                                  ],
                                }),
                                (0, M.jsxs)(p.G7, {
                                  className: "btn-wrap-wechat-content",
                                  onClick: function (e) {
                                    e.stopPropagation(),
                                      u().navigateTo({
                                        url: "/subpages/member/edit-address?isWechatAddress=true",
                                      });
                                  },
                                  children: [
                                    (0, M.jsx)(_.Ko, {
                                      className: "btn-wrap-img",
                                      src: "fv_wechat.png",
                                      width: 32,
                                      height: 32,
                                    }),
                                    (0, M.jsx)(p.xv, {
                                      className: "btn-wrap-text",
                                      children: "一键获取微信地址",
                                    }),
                                  ],
                                }),
                                (0, M.jsx)(_.Ko, {
                                  src: "fv_chevron_right.png",
                                  width: 40,
                                  height: 40,
                                }),
                              ],
                            }),
                      }),
                ],
              });
            }),
            O = n(93433),
            I = n(59690),
            P = n(23493),
            q = n.n(P),
            L = n(48644),
            V = n(99155);
          function R(e) {
            return (
              "gift" === e.order_item_type ||
              "gift" === e.orderItemType ||
              !0 === e.is_gift ||
              "1" === e.is_gift ||
              !0 === e.isGift
            );
          }
          function A(e, i) {
            var n;
            return i ? 0 : null !== (n = (0, V.sY)(e)) && void 0 !== n ? n : 0;
          }
          var z = function (e) {
            var i = e.shops,
              n = void 0 === i ? [] : i,
              t = e.deliveryType,
              o = void 0 === t ? "express" : t,
              d = e.remarks,
              m = void 0 === d ? {} : d,
              v = e.onRemarkChange,
              h = e.hasAddress,
              b = void 0 !== h && h,
              x = e.onItemDiscountClick,
              g = void 0 === x ? function () {} : x,
              y = (e.couponList, (0, f.dd)()).showModal,
              j = (0, c.useState)({}),
              k = (0, l.Z)(j, 2),
              N = k[0],
              w = k[1],
              C =
                (function () {
                  var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : [];
                  return e.reduce(function (e, i) {
                    return (
                      e +
                      (Array.isArray(null == i ? void 0 : i.items)
                        ? i.items
                        : []
                      ).filter(function (e) {
                        return !R(e);
                      }).length
                    );
                  }, 0);
                })(n) > 1,
              G = q()(function (e, i) {
                var n = i.detail.value;
                v && v(e, n);
              }, 100),
              D = function (e, i) {
                w(function (n) {
                  return (0, s.Z)((0, s.Z)({}, n), {}, (0, Z.Z)({}, e, i));
                });
              },
              S = (function () {
                var e = (0, a.Z)(
                  (0, r.Z)().mark(function e(i) {
                    var n;
                    return (0, r.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (n = i.template_intro),
                              (e.next = 3),
                              y({
                                title: "运费规则",
                                content: (0, M.jsx)(p.pf, {
                                  scrollY: !0,
                                  className: "sp-goods-list__shipping-fee-rule",
                                  children: n || "暂无运费规则说明",
                                }),
                                showCancel: !1,
                                confirmText: "我知道了",
                                contentAlign: "center",
                              })
                            );
                          case 3:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (i) {
                  return e.apply(this, arguments);
                };
              })(),
              P = function (e) {
                return e.some(function (e) {
                  return "1" !== e.is_free_delivery;
                });
              },
              V = function () {
                var e =
                  arguments.length > 0 && void 0 !== arguments[0]
                    ? arguments[0]
                    : [];
                return (0, O.Z)(e).sort(function (e, i) {
                  var n =
                    "gift" === e.order_item_type ||
                    "gift" === e.orderItemType ||
                    !0 === e.is_gift ||
                    "1" === e.is_gift ||
                    !0 === e.isGift;
                  return n ===
                    ("gift" === i.order_item_type ||
                      "gift" === i.orderItemType ||
                      !0 === i.is_gift ||
                      "1" === i.is_gift ||
                      !0 === i.isGift)
                    ? 0
                    : n
                    ? 1
                    : -1;
                });
              };
            return (0, M.jsx)(p.G7, {
              className: "sp-goods-list",
              children:
                null == n
                  ? void 0
                  : n.map(function (e, i) {
                      var n,
                        t,
                        s,
                        r,
                        a,
                        l,
                        c = (0, L._)(
                          e.regionauth_name ||
                            (null === (n = e.items) ||
                            void 0 === n ||
                            null === (n = n[0]) ||
                            void 0 === n
                              ? void 0
                              : n.regionauth_name),
                          e.distributor_name
                        );
                      return (0, M.jsxs)(
                        p.G7,
                        {
                          className: "sp-goods-list__store-wrapper",
                          children: [
                            "store" === o &&
                              (0, M.jsx)(p.G7, {
                                className: "sp-goods-list__pickup-location",
                                children: (0, M.jsxs)(p.xv, {
                                  className: "sp-goods-list__pickup-title",
                                  children: [
                                    "自提点：",
                                    (null === (t = e.pickupLocation) ||
                                    void 0 === t
                                      ? void 0
                                      : t.province) +
                                      (null === (s = e.pickupLocation) ||
                                      void 0 === s
                                        ? void 0
                                        : s.city) +
                                      (null === (r = e.pickupLocation) ||
                                      void 0 === r
                                        ? void 0
                                        : r.area) +
                                      (null === (a = e.pickupLocation) ||
                                      void 0 === a
                                        ? void 0
                                        : a.address) || "",
                                  ],
                                }),
                              }),
                            (0, M.jsxs)(p.G7, {
                              className: "sp-goods-list__brand",
                              children: [
                                (0, M.jsx)(_.Ko, {
                                  className: "sp-goods-list__brand-icon",
                                  src: "fv_store.png",
                                  width: 32,
                                  height: 32,
                                }),
                                (0, M.jsxs)(p.xv, {
                                  className: "sp-goods-list__brand-name",
                                  children: [
                                    c.townPrefix
                                      ? (0, M.jsxs)(p.xv, {
                                          className:
                                            "sp-goods-list__brand-town",
                                          children: [c.townPrefix, " "],
                                        })
                                      : null,
                                    (0, M.jsx)(p.xv, { children: c.shopName }),
                                  ],
                                }),
                              ],
                            }),
                            (0, M.jsx)(p.G7, {
                              className: "sp-goods-list__item-wrap",
                              children:
                                e.items &&
                                (null === (l = V(e.items)) || void 0 === l
                                  ? void 0
                                  : l.map(function (i, n) {
                                      var t,
                                        o = R(i),
                                        s = (function (e, i) {
                                          var n;
                                          return i
                                            ? 0
                                            : void 0 !== e.promotion_price &&
                                              null !== e.promotion_price
                                            ? Number(e.promotion_price) || 0
                                            : Number(
                                                null !==
                                                  (n = e.activity_price) &&
                                                  void 0 !== n
                                                  ? n
                                                  : e.price
                                              ) || 0;
                                        })(i, o),
                                        r = A(i, o);
                                      return (0, M.jsxs)(
                                        p.G7,
                                        {
                                          className: "sp-goods-list__item",
                                          children: [
                                            (0, M.jsx)(p.G7, {
                                              className:
                                                "sp-goods-list__item-image",
                                              children: (0, M.jsx)(_.Ko, {
                                                className:
                                                  "sp-goods-list__item-img",
                                                src: i.pic,
                                                mode: "aspectFill",
                                                width: 164,
                                                height: 164,
                                              }),
                                            }),
                                            (0, M.jsxs)(p.G7, {
                                              className:
                                                "sp-goods-list__item-content",
                                              children: [
                                                (0, M.jsxs)(p.G7, {
                                                  className:
                                                    "sp-goods-list__item-info",
                                                  children: [
                                                    (0, M.jsx)(p.xv, {
                                                      className:
                                                        "sp-goods-list__item-title",
                                                      children:
                                                        i.item_name || "",
                                                    }),
                                                    (0, M.jsxs)(p.G7, {
                                                      className:
                                                        "at-row at-row__align--center sp-goods-list__item-specwrap",
                                                      children: [
                                                        (0, M.jsx)(p.G7, {
                                                          className:
                                                            "sp-goods-list__item-spec",
                                                          children:
                                                            i.item_spec_desc ||
                                                            "",
                                                        }),
                                                        (0, M.jsxs)(p.xv, {
                                                          className:
                                                            "sp-goods-list__item-num",
                                                          children: [
                                                            "×",
                                                            i.num || 1,
                                                          ],
                                                        }),
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                                (0, M.jsxs)(p.G7, {
                                                  className: T()(
                                                    "sp-goods-list__item-price-wrap",
                                                    {
                                                      "sp-goods-list__item-price-wrap--gift":
                                                        o,
                                                    }
                                                  ),
                                                  children: [
                                                    (0, M.jsxs)(p.G7, {
                                                      className:
                                                        "sp-goods-list__item-price-row",
                                                      children: [
                                                        (0, M.jsx)(p.G7, {
                                                          className:
                                                            "sp-goods-list__item-price",
                                                          children: (0, M.jsx)(
                                                            _.qq,
                                                            {
                                                              sizeSame: !0,
                                                              family:
                                                                "D-DIN-PRO-Medium",
                                                              weight: 500,
                                                              value: s,
                                                              size: 34,
                                                              unit: "cent",
                                                            }
                                                          ),
                                                        }),
                                                        o
                                                          ? (0, M.jsx)(p.xv, {
                                                              className:
                                                                "sp-goods-list__item-gift-tag",
                                                              children: "赠品",
                                                            })
                                                          : r > 0 && C
                                                          ? (0, M.jsxs)(p.G7, {
                                                              className:
                                                                "sp-goods-list__item-discount",
                                                              onClick:
                                                                function (n) {
                                                                  n.stopPropagation(),
                                                                    g(i, e);
                                                                },
                                                              children: [
                                                                (0, M.jsx)(
                                                                  p.xv,
                                                                  {
                                                                    className:
                                                                      "sp-goods-list__item-discount-label",
                                                                    children:
                                                                      "优惠",
                                                                  }
                                                                ),
                                                                (0, M.jsx)(
                                                                  _.qq,
                                                                  {
                                                                    sizeSame:
                                                                      !0,
                                                                    value: r,
                                                                    size: 22,
                                                                    unit: "cent",
                                                                    color:
                                                                      "#D4003B",
                                                                    family:
                                                                      "PingFang SC, PingFang SC",
                                                                  }
                                                                ),
                                                                (0, M.jsx)(
                                                                  I.Z,
                                                                  {
                                                                    value:
                                                                      "chevron-right",
                                                                    size: "12",
                                                                    color:
                                                                      "#D4003B",
                                                                  }
                                                                ),
                                                              ],
                                                            })
                                                          : null,
                                                      ],
                                                    }),
                                                    !o &&
                                                    null != i &&
                                                    null !==
                                                      (t = i.discount_info) &&
                                                    void 0 !== t &&
                                                    t.find(function (e) {
                                                      return "groups" == e.type;
                                                    })
                                                      ? (0, M.jsx)(p.G7, {
                                                          className:
                                                            "sp-goods-list__item-group-tag",
                                                          children: "拼团",
                                                        })
                                                      : null,
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        },
                                        n
                                      );
                                    })),
                            }),
                            "express" === o &&
                              (0, M.jsxs)(p.G7, {
                                className: "sp-goods-list__shipping",
                                children: [
                                  (0, M.jsxs)(p.G7, {
                                    className: "sp-goods-list__shipping-label",
                                    children: [
                                      (0, M.jsx)(p.xv, { children: "运费" }),
                                      P(e.items) &&
                                        (0, M.jsx)(p.G7, {
                                          className:
                                            "sp-goods-list__shipping-info-icon",
                                          onClick: function () {
                                            return S(e);
                                          },
                                          children: (0, M.jsx)(I.Z, {
                                            value: "help",
                                            size: "14",
                                            color: "#999",
                                          }),
                                        }),
                                    ],
                                  }),
                                  b
                                    ? (0, M.jsx)(p.G7, {
                                        className:
                                          "sp-goods-list__shipping-value",
                                        children:
                                          "cash" === e.freight_type
                                            ? (0, M.jsx)(_.qq, {
                                                value: e.freight_fee || 0,
                                                size: 28,
                                                unit: "cent",
                                              })
                                            : "free" === e.freight_type
                                            ? "包邮"
                                            : "到付",
                                      })
                                    : (0, M.jsx)(p.xv, {
                                        className:
                                          "sp-goods-list__shipping-value sp-goods-list__shipping-value--empty",
                                        children: "请先添加收货地址",
                                      }),
                                ],
                              }),
                            (0, M.jsxs)(p.G7, {
                              className: "sp-goods-list__remark",
                              children: [
                                (0, M.jsxs)(p.G7, {
                                  className: "sp-goods-list__remark-label",
                                  children: [
                                    "备注",
                                    (N[e.distributor_id] ||
                                      (m[e.distributor_id] &&
                                        m[e.distributor_id].length > 0)) &&
                                      (0, M.jsxs)(p.xv, {
                                        className:
                                          "sp-goods-list__remark-count",
                                        children: [
                                          "(",
                                          (m[e.distributor_id] || "").length,
                                          "/50)",
                                        ],
                                      }),
                                  ],
                                }),
                                (0, M.jsxs)(p.G7, {
                                  className: T()(
                                    "sp-goods-list__remark-content",
                                    {
                                      "sp-goods-list__remark-content--focused":
                                        N[e.distributor_id],
                                    }
                                  ),
                                  children: [
                                    (0, M.jsx)(p.gx, {
                                      className: T()(
                                        "sp-goods-list__remark-textarea",
                                        {
                                          "sp-goods-list__remark-textarea--focused":
                                            N[e.distributor_id],
                                        }
                                      ),
                                      value: m[e.distributor_id] || "",
                                      onInput: function (i) {
                                        return G(e.distributor_id, i);
                                      },
                                      maxlength: 50,
                                      showCount: !1,
                                      placeholder: "有任何要求请备注留言",
                                      placeholderStyle: "font-size: ".concat(
                                        u().pxTransform(28),
                                        ";"
                                      ),
                                      placeholderClass:
                                        "sp-goods-list__remark-placeholder",
                                      onFocus: function () {
                                        return D(e.distributor_id, !0);
                                      },
                                      onBlur: function () {
                                        return D(e.distributor_id, !1);
                                      },
                                      autoHeight: !0,
                                    }),
                                    !N[e.distributor_id] &&
                                      (0, M.jsx)(p.G7, {
                                        className:
                                          "sp-goods-list__remark-arrow",
                                        children: (0, M.jsx)(_.Ko, {
                                          src: "fv_chevron_right.png",
                                          width: 40,
                                          height: 40,
                                        }),
                                      }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        },
                        i
                      );
                    }),
            });
          };
          var F = function (e) {
              var i = e.goodsAmount,
                n = e.goodsDiscount,
                t = e.promotionDiscount,
                o = e.platformDiscount,
                s = e.expressFee,
                r = e.hasCoupon,
                a = void 0 === r || r,
                l = e.couponAmount,
                c = e.onCouponClick,
                d = void 0 === c ? function () {} : c,
                u = e.onGoodsDiscountClick,
                m = void 0 === u ? function () {} : u,
                f = e.onPromotionClick,
                v = void 0 === f ? function () {} : f,
                h = e.onPlatformDiscountClick,
                b = void 0 === h ? function () {} : h,
                x = e.totalAmount,
                g = e.deliveryType,
                y = void 0 === g ? "express" : g,
                j = e.freightType,
                k = function (e) {
                  return (e / 100).toFixed(2);
                },
                N = function (e) {
                  return (0, M.jsxs)(p.G7, {
                    className:
                      "sp-price-detail__label-box sp-price-detail__label-box--link",
                    children: [
                      (0, M.jsx)(p.xv, {
                        className: "sp-price-detail__label",
                        children: e,
                      }),
                      (0, M.jsx)(I.Z, {
                        value: "chevron-right",
                        size: "12",
                        color: "#000000",
                      }),
                    ],
                  });
                };
              return (0, M.jsxs)(p.G7, {
                className: "sp-price-detail",
                children: [
                  (0, M.jsx)(_.Kg, {
                    className:
                      "sp-price-detail__item sp-price-detail__item--original",
                    title: (0, M.jsx)(p.xv, {
                      className: "sp-price-detail__label",
                      children: "商品原价",
                    }),
                    value: (0, M.jsxs)(p.xv, {
                      className: "sp-price-detail__value",
                      children: ["¥", k(i)],
                    }),
                  }),
                  (0, M.jsx)(p.G7, {
                    className:
                      "sp-price-detail__item sp-price-detail__item--line",
                  }),
                  n > 0 &&
                    (0, M.jsx)(_.Kg, {
                      className:
                        "sp-price-detail__item sp-price-detail__item--link",
                      title: N("商品立减"),
                      value: (0, M.jsxs)(p.xv, {
                        className:
                          "sp-price-detail__value sp-price-detail__value--discount",
                        children: ["-¥", k(n)],
                      }),
                      onClick: m,
                    }),
                  t > 0 &&
                    (0, M.jsx)(_.Kg, {
                      className:
                        "sp-price-detail__item sp-price-detail__item--link",
                      title: N("促销"),
                      value: (0, M.jsxs)(p.xv, {
                        className:
                          "sp-price-detail__value sp-price-detail__value--discount",
                        children: ["-¥", k(t)],
                      }),
                      onClick: v,
                    }),
                  o > 0 &&
                    (0, M.jsx)(M.Fragment, {
                      children: (0, M.jsxs)(p.G7, {
                        className:
                          "sp-price-detail__item sp-price-detail__platform-fold-head",
                        onClick: b,
                        children: [
                          (0, M.jsx)(p.G7, {
                            className: "sp-price-detail__platform-title",
                            children: N("平台立减"),
                          }),
                          (0, M.jsxs)(p.xv, {
                            className:
                              "sp-price-detail__value sp-price-detail__value--discount",
                            children: ["-¥", k(o)],
                          }),
                        ],
                      }),
                    }),
                  (0, M.jsx)(_.Kg, {
                    className:
                      "sp-price-detail__item sp-price-detail__item--coupon",
                    title: N("优惠券"),
                    value:
                      l > 0
                        ? (0, M.jsxs)(p.xv, {
                            className:
                              "sp-price-detail__value sp-price-detail__value--discount",
                            children: ["-¥", k(l)],
                          })
                        : (0, M.jsx)(p.G7, {
                            className: "sp-price-detail__coupon-selector",
                            children: (0, M.jsx)(p.xv, {
                              className: "sp-price-detail__coupon-tip",
                              children: a
                                ? "您有优惠券待使用"
                                : "暂无可用优惠券",
                            }),
                          }),
                    onClick: d,
                  }),
                  "express" === y &&
                    (0, M.jsx)(_.Kg, {
                      className: "sp-price-detail__item",
                      title: (0, M.jsx)(p.xv, {
                        className: "sp-price-detail__label",
                        children: "运费",
                      }),
                      value: (0, M.jsx)(p.xv, {
                        className: "sp-price-detail__value",
                        children: j.includes("cash")
                          ? s > 0
                            ? "¥".concat(k(s))
                            : "¥0.00"
                          : j.includes("cod")
                          ? "到付"
                          : "包邮",
                      }),
                    }),
                  (0, M.jsx)(_.Kg, {
                    className: "sp-price-detail__total",
                    title: (0, M.jsx)(p.xv, {
                      className: "sp-price-detail__total-label",
                      children: "合计",
                    }),
                    value: (0, M.jsxs)(p.xv, {
                      className: "sp-price-detail__total-value",
                      children: ["¥", k(x)],
                    }),
                  }),
                ],
              });
            },
            E = n(45557);
          var K = function (e) {
              var i = e.totalAmount,
                n = void 0 === i ? 0 : i,
                t = e.discountAmount,
                o = void 0 === t ? 0 : t,
                s = e.totalCount,
                r = void 0 === s ? 1 : s,
                a = e.disabled,
                l = void 0 !== a && a,
                c = e.loading,
                d = void 0 !== c && c,
                u = e.onSubmit;
              return (0, M.jsxs)(p.G7, {
                className: "sp-order-submit",
                children: [
                  (0, M.jsxs)(p.G7, {
                    className: "sp-order-submit__info",
                    children: [
                      (0, M.jsxs)(p.G7, {
                        className: "sp-order-submit__count-price",
                        children: [
                          (0, M.jsxs)(p.xv, {
                            className: "sp-order-submit__count",
                            children: ["共", r, "件"],
                          }),
                          (0, M.jsxs)(p.G7, {
                            className: "sp-order-submit__price",
                            children: [
                              (0, M.jsx)(p.xv, {
                                className: "sp-order-submit__price-label",
                                children: "合计",
                              }),
                              (0, M.jsx)(_.qq, {
                                unitSize: 28,
                                unit: "cent",
                                size: 40,
                                value: n,
                                weight: 600,
                              }),
                            ],
                          }),
                        ],
                      }),
                      o > 0 &&
                        (0, M.jsxs)(p.G7, {
                          className: "sp-order-submit__discount",
                          children: [
                            (0, M.jsx)(p.xv, {
                              className: "sp-order-submit__discount-label",
                              children: "共优惠",
                            }),
                            (0, M.jsx)(_.qq, {
                              unit: "cent",
                              unitSize: 22,
                              color: "var(--color-primary)",
                              size: 22,
                              value: o,
                              family: "PingFang SC, PingFang SC",
                            }),
                          ],
                        }),
                    ],
                  }),
                  (0, M.jsx)(p.G7, {
                    className: "sp-order-submit__btn",
                    children: (0, M.jsx)(E.Z, {
                      type: "primary",
                      disabled: l,
                      loading: d,
                      onClick: u,
                      className: "sp-order-submit__button",
                      children: "提交订单",
                    }),
                  }),
                ],
              });
            },
            J = n(12485),
            H = n(19210);
          var B = function (e) {
              var i = e.visible,
                n = e.goods,
                t = void 0 === n ? [] : n,
                o = e.mode,
                s = void 0 === o ? "block" : o,
                r = e.onContinue,
                a = e.onBack,
                l = e.onClose;
              if (!i) return null;
              var c = "view" === s,
                d = "notice" === s,
                u = t.some(function (e) {
                  return "1" == e.delivery_method;
                }),
                m = c || u ? "以下商品仅支持自提" : "以下商品仅支持邮寄";
              return (0, M.jsxs)(p.G7, {
                className: "sp-delivery-modal",
                children: [
                  (0, M.jsx)(p.G7, {
                    className: "sp-delivery-modal__mask",
                    onClick: c || d ? l : void 0,
                  }),
                  (0, M.jsxs)(p.G7, {
                    className: "sp-delivery-modal__container",
                    children: [
                      (0, M.jsxs)(p.G7, {
                        className: "sp-delivery-modal__header",
                        children: [
                          (0, M.jsx)(J.Z, {
                            src: "fv_report_gmailerrorred.png",
                            className: "sp-delivery-modal__icon",
                            width: 48,
                            height: 48,
                          }),
                          (0, M.jsx)(p.xv, {
                            className: "sp-delivery-modal__title",
                            children: m,
                          }),
                        ],
                      }),
                      (0, M.jsx)(p.pf, {
                        className: "sp-delivery-modal__goods-scroll",
                        scrollY: !0,
                        children: (0, M.jsx)(p.G7, {
                          className: "sp-delivery-modal__goods-panel",
                          children:
                            null == t
                              ? void 0
                              : t.map(function (e, i) {
                                  return (0, M.jsx)(H.Z, { info: e }, i);
                                }),
                        }),
                      }),
                      (0, M.jsx)(p.G7, {
                        className: "sp-delivery-modal__footer",
                        children: d
                          ? (0, M.jsx)(p.G7, {
                              className:
                                "sp-delivery-modal__btn sp-delivery-modal__btn--known",
                              onClick: l,
                              children: "知道了",
                            })
                          : (0, M.jsxs)(M.Fragment, {
                              children: [
                                (0, M.jsx)(p.G7, {
                                  className:
                                    "sp-delivery-modal__btn sp-delivery-modal__btn--back",
                                  onClick: a,
                                  children: "返回购物车",
                                }),
                                (0, M.jsx)(p.G7, {
                                  className:
                                    "sp-delivery-modal__btn sp-delivery-modal__btn--continue",
                                  onClick: r,
                                  children: "继续邮寄下单",
                                }),
                              ],
                            }),
                      }),
                    ],
                  }),
                ],
              });
            },
            U = n(22894),
            Y = n(50567);
          function $(e) {
            var i = e.visible,
              n = void 0 !== i && i,
              t = e.availableCoupons,
              o = void 0 === t ? [] : t,
              d = e.unavailableCoupons,
              u = void 0 === d ? [] : d,
              m = e.selectedCoupon,
              v = void 0 === m ? [] : m,
              b = e.onSelect,
              x = void 0 === b ? function () {} : b,
              g = e.onClose,
              y = void 0 === g ? function () {} : g,
              j = e.onConfirm,
              k = void 0 === j ? function () {} : j,
              N =
                ((0, h.v9)(function (e) {
                  return e.regionauth;
                }).regionauthInfo,
                (0, c.useState)(v)),
              w = (0, l.Z)(N, 2),
              C = w[0],
              G = w[1],
              Z = (0, c.useState)(o),
              D = (0, l.Z)(Z, 2),
              T = (D[0], D[1], (0, c.useState)(u)),
              S = (0, l.Z)(T, 2);
            S[0],
              S[1],
              (0, c.useEffect)(
                function () {
                  n && G(v);
                },
                [v, o, u, n]
              );
            var O = (0, f.Nr)(
                (function () {
                  var e = (0, a.Z)(
                    (0, r.Z)().mark(function e(i, n) {
                      var t;
                      return (0, r.Z)().wrap(function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              (t = JSON.parse(JSON.stringify(C))),
                                i
                                  ? t.push(n)
                                  : (t = t.filter(function (e) {
                                      return e.code !== n.code;
                                    })),
                                x(t);
                            case 3:
                            case "end":
                              return e.stop();
                          }
                      }, e);
                    })
                  );
                  return function (i, n) {
                    return e.apply(this, arguments);
                  };
                })(),
                400
              ),
              I = (0, M.jsx)(p.G7, {
                className: "coupon-modal__footer",
                children: (0, M.jsx)(E.Z, {
                  type: "primary",
                  className: "coupon-modal__confirm-btn",
                  onClick: function () {
                    var e = C.filter(function (e) {
                      return 1 == e.isChecked;
                    });
                    k(e);
                  },
                  children: "确定",
                }),
              });
            return (0, M.jsx)(U.Z, {
              className: "coupon-modal",
              title: "选择优惠券",
              open: n,
              renderFooter: I,
              onClose: y,
              maxHeight: 648,
              children: (0, M.jsx)(p.G7, {
                className: "coupon-modal__content",
                children: (0, M.jsxs)(p.G7, {
                  className: "coupon-modal__checkbox-group",
                  children: [
                    o.length > 0 &&
                      (0, M.jsx)(p.G7, {
                        className: "coupon-modal__section",
                        children:
                          null == o
                            ? void 0
                            : o.map(function (e) {
                                return (0, M.jsx)(
                                  p.G7,
                                  {
                                    className: "coupon-modal__item",
                                    children: (0, M.jsx)(Y.Z, {
                                      isOption: !0,
                                      info: (0, s.Z)(
                                        (0, s.Z)({}, e),
                                        {},
                                        { description: e.description || "" }
                                      ),
                                      type: 2,
                                      children: (0, M.jsx)(_.bM, {
                                        checked:
                                          1 == e.isChecked && 1 != e.isDisabled,
                                        disabled: 1 == e.isDisabled,
                                        onChange: function (i) {
                                          return O(i, e);
                                        },
                                      }),
                                    }),
                                  },
                                  e.cardId
                                );
                              }),
                      }),
                    u.length > 0 &&
                      (0, M.jsxs)(p.G7, {
                        className: "coupon-modal__section",
                        children: [
                          (0, M.jsx)(p.G7, {
                            className: "coupon-modal__section-title",
                            children: "不可用优惠券",
                          }),
                          null == u
                            ? void 0
                            : u.map(function (e) {
                                return (0,
                                M.jsx)(p.G7, { className: "coupon-modal__item unavailable-content", children: (0, M.jsx)(Y.Z, { info: (0, s.Z)((0, s.Z)({}, e), {}, { description: e.description || "" }), type: 2, children: (0, M.jsx)(p.G7, { className: "coupon-modal__disabled-tag", children: "不可用" }) }) }, e.cardId);
                              }),
                        ],
                      }),
                    0 === o.length &&
                      (0, M.jsx)(p.G7, {
                        className: "coupon-modal__empty",
                        children: "暂无可用优惠券",
                      }),
                  ],
                }),
              }),
            });
          }
          $.options = { addGlobalClass: !0 };
          var Q = $,
            W = n(98178),
            X = n(14987),
            ee = n(71002),
            ie = n(34034),
            ne = n(19348),
            te = function () {
              var e =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : [];
              return JSON.parse(JSON.stringify(e));
            },
            oe = function (e) {
              return Array.isArray(e)
                ? e
                : e && "object" === (0, ee.Z)(e)
                ? [e]
                : [];
            },
            se = function () {
              var e,
                i,
                n =
                  arguments.length > 0 && void 0 !== arguments[0]
                    ? arguments[0]
                    : {},
                t =
                  n.regionauth_name ||
                  (null === (e = n.items) ||
                  void 0 === e ||
                  null === (e = e[0]) ||
                  void 0 === e
                    ? void 0
                    : e.regionauth_name);
              return (0, s.Z)(
                (0, s.Z)({}, n),
                {},
                {
                  displayShopName: (0, L.X)(t, n.distributor_name),
                  pickupLocation:
                    n.pickup_locations && n.pickup_locations.total_count > 0
                      ? null === (i = n.pickup_locations) || void 0 === i
                        ? void 0
                        : i.list[0]
                      : {},
                }
              );
            };
          function re(e) {
            var i =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : {};
            if (!e) return null;
            var n = e.shops,
              t = e.total_summary,
              o = void 0 === t ? {} : t,
              r = e.invoice_status,
              a = e.coupon_list,
              l = e.specific_crowd_discount,
              c = e.delivery_hints,
              d = (n || []).map(se),
              u = (0, C.OD)(d, c),
              p = (0, C.SV)(u, c, d, i.receipt_type),
              m = (0, k.D9)(
                (null == a ? void 0 : a.valid_coupon_list) || [],
                y.Z.coupon.COUPON
              ),
              _ = (0, k.D9)(
                (null == a ? void 0 : a.invalid_coupon_list) || [],
                y.Z.coupon.COUPON
              ),
              f = m.filter(function (e) {
                return 1 == e.isChecked;
              }),
              v = oe(l);
            return {
              receiptType: p,
              deliveryHints: c || null,
              detailInfo: d,
              totalInfo: {
                market_fee: o.market_fee,
                item_fee_new: o.item_fee,
                items_count: o.totalItemNum,
                total_fee: o.total_fee,
                promotion_discount: o.promotion_discount,
                coupon_discount: o.coupon_discount,
                platform_reduction: o.platform_reduction,
                discount_fee: o.discount_fee,
                checkout_total_discount: (0, V.st)(o),
                item_fee: o.item_fee,
                freight_fee: o.freight_fee,
                invoice_status: r,
                product_reduction: o.product_reduction,
                freight_type: d.map(function (e) {
                  return e.freight_type;
                }),
              },
              validCouponList: te(m),
              invalidCouponList: te(_),
              checkedCouponList: te(f),
              oldCoupon: {
                valid_coupon_list: te(m),
                invalid_coupon_list: te(_),
                checked_coupon_list: te(f),
              },
              paramsInfo: (0, s.Z)({}, i),
              specificCrowdDiscount: v,
              goodsReductionDetailModalData: (0, ie.Qm)({
                totalSummary: o,
                couponList: a,
                shops: d,
              }),
              promotionDetailModalData: (0, ne.l)({
                shops: d,
                totalSummary: o,
              }),
              platformReductionDetailModalData: (0, ne.U)({
                totalSummary: o,
                specificCrowdDiscount: v,
                shops: d,
              }),
            };
          }
          var ae = {
            detailInfo: [],
            btnIsDisabled: !1,
            addressList: [],
            receiptType: "logistics",
            defalutPaytype: k.NM ? "wxpayjs" : k.$L ? "wxpayh5" : "wxpay",
            payType: "wxpay",
            payChannel: "wxpay",
            paymentName: "",
            isPointitemGood: !1,
            shoppingGuideData: {},
            totalInfo: {
              market_fee: 0,
              item_fee_new: 0,
              items_count: 0,
              total_fee: "0.00",
              promotion_discount: 0,
              discount_fee: 0,
              checkout_total_discount: 0,
              item_fee: "",
              freight_fee: 0,
              member_discount: "",
              coupon_discount: "",
              point: "",
              point_fee: "",
              freight_type: "",
              invoice_status: !0,
            },
            distributorInfo: {},
            invoiceTitle: "",
            packInfo: {},
            disabledPayment: {},
            channel: "",
            paramsInfo: {},
            discountInfo: [],
            checkedCouponList: [],
            validCouponList: [],
            invalidCouponList: [],
            oldCoupon: {
              valid_coupon_list: [],
              invalid_coupon_list: [],
              checked_coupon_list: [],
            },
            remarks: {},
            isPointOpen: !1,
            point_use: 0,
            pointInfo: {},
            streetCommunityList: [],
            openStreet: !1,
            openBuilding: !1,
            multiValue: [],
            multiIndex: [0, 0],
            streetCommunityTxt: "请选择",
            street: null,
            community: null,
            buildingNumber: "",
            houseNumber: "",
            isPaymentOpend: !1,
            isPackageOpend: !1,
            isNeedPackage: !1,
            openCashier: !1,
            isPointOpenModal: !1,
            routerParams: {},
            deliveryTimeList: {},
            salespersonInfo: {},
            pointPayFirst: null,
            isFirstCalc: !0,
            loading: !0,
            deliveryModalVisible: !1,
            deliveryModalMode: "block",
            deliveryModalGoods: [],
            pickupOnlyGoods: [],
            pickerInfo: {},
            couponModalVisible: !1,
            priceDetailModalVisible: !1,
            priceDetailModalData: null,
            goodsReductionDetailModalVisible: !1,
            goodsReductionDetailModalData: null,
            promotionDetailModalVisible: !1,
            promotionDetailModalData: null,
            platformReductionDetailModalData: null,
            promotionDetailModalType: "promotion",
            promotionDetailModalTitle: "促销优惠",
            submitLoading: !1,
            hasDefaultSelect: null,
            tradeSettingReady: !1,
            pageLoadError: !1,
            specificCrowdDiscount: [],
            deliveryHints: null,
          };
          var le = function () {
            var e,
              i,
              n = (0, h.I0)(),
              t = (0, v.x)(ae),
              Z = (0, l.Z)(t, 2),
              D = Z[0],
              T = Z[1],
              O = (0, h.v9)(function (e) {
                return e.user;
              }).address,
              I = (0, f.TH)().updateAddress,
              P = (0, h.v9)(function (e) {
                return e.cart;
              }).coupon,
              q = (0, h.v9)(function (e) {
                return e.regionauth;
              }).regionauthInfo,
              L = void 0 === q ? {} : q,
              V = (0, f.f0)({
                autoLogin: !0,
                loginSuccess: function () {
                  I();
                },
              }).isLogin,
              R = (0, c.useMemo)(
                function () {
                  return O ? JSON.stringify(O) : "";
                },
                [O]
              ),
              A = (0, f.V7)().cashierPayment,
              E = (0, f.dd)(),
              J = E.showModal,
              H = E.closeModal,
              U = (0, c.useRef)({}),
              Y = D.hasDefaultSelect,
              $ = D.tradeSettingReady,
              ee = D.pageLoadError,
              ie = D.loading,
              ne = D.detailInfo,
              te = D.payType,
              oe = D.deliveryModalVisible,
              se = D.deliveryModalMode,
              le = D.deliveryModalGoods,
              ce = D.payChannel,
              de = D.submitLoading,
              ue = D.totalInfo,
              pe = D.receiptType,
              me = D.packInfo,
              _e = D.paramsInfo,
              fe = D.checkedCouponList,
              ve = D.validCouponList,
              he = D.oldCoupon,
              be = D.invalidCouponList,
              xe = D.remarks,
              ge = D.point_use,
              ye = D.isNeedPackage,
              je = D.routerParams,
              ke = D.pickerInfo,
              Ne = D.couponModalVisible,
              we = D.priceDetailModalVisible,
              Ce = D.priceDetailModalData,
              Ge = D.goodsReductionDetailModalVisible,
              Ze = D.goodsReductionDetailModalData,
              De = D.promotionDetailModalVisible,
              Te = D.promotionDetailModalData,
              Me = D.platformReductionDetailModalData,
              Se = D.promotionDetailModalType,
              Oe = D.promotionDetailModalTitle,
              Ie = D.addressPickerVisible,
              Pe = D.deliveryHints,
              qe = (0, c.useRef)(null),
              Le = (0, c.useRef)(null),
              Ve = (0, c.useRef)(0),
              Re = (0, c.useRef)("1"),
              Ae = (0, c.useRef)({
                payType: te,
                hasDefaultSelect: Y,
                receiptType: pe,
              }),
              ze = (0, d.getCurrentInstance)(),
              Fe =
                (null == ze || null === (e = ze.router) || void 0 === e
                  ? void 0
                  : e.params) || {},
              Ee = Fe.type,
              Ke = void 0 === Ee ? je.type : Ee,
              Je = Fe.cart_type,
              He = void 0 === Je ? je.cart_type : Je,
              Be = Fe.seckill_id,
              Ue = void 0 === Be ? je.seckill_id : Be,
              Ye = Fe.ticket,
              $e = void 0 === Ye ? je.ticket : Ye,
              Qe = Fe.bargain_id,
              We = void 0 === Qe ? je.bargain_id : Qe,
              Xe = Fe.team_id,
              ei = void 0 === Xe ? je.team_id : Xe,
              ii = Fe.group_id,
              ni = void 0 === ii ? je.group_id : ii,
              ti = Fe.noRegionauth,
              oi = void 0 === ti ? je.noRegionauth : ti,
              si = function (e) {
                var i;
                if (
                  (delete e.regionauth_id,
                  delete e.noRegionauth,
                  [1, !0, "1", "true"].includes(oi))
                )
                  return (e.noRegionauth = !0), e;
                var n =
                  null !== (i = je.regionauth_id) && void 0 !== i
                    ? i
                    : null == L
                    ? void 0
                    : L.regionauth_id;
                return (
                  null != n &&
                    "" !== n &&
                    "0" !== String(n) &&
                    (e.regionauth_id = n),
                  e
                );
              },
              ri = (0, c.useMemo)(
                function () {
                  return pe;
                },
                [pe]
              ),
              ai = (0, c.useMemo)(
                function () {
                  return null != ne && ne.length ? (0, C.OD)(ne, Pe) : null;
                },
                [ne, Pe]
              );
            (0, c.useEffect)(
              function () {
                if (V)
                  return (
                    li(),
                    function () {
                      n((0, b.ex)()), n((0, x.Qn)(null)), n((0, g._T)());
                    }
                  );
              },
              [V, n]
            ),
              (0, c.useEffect)(
                function () {
                  var e, i;
                  oe || Ne || we || Ge || De || Ie
                    ? null === (e = qe.current) || void 0 === e || e.pageLock()
                    : null === (i = qe.current) ||
                      void 0 === i ||
                      i.pageUnLock();
                },
                [oe, Ne, we, Ge, De, Ie]
              ),
              (0, c.useEffect)(
                function () {
                  if (te && null !== Y && $) {
                    var e = ri !== Ae.current.receiptType;
                    te !== Ae.current.payType ||
                    Y !== Ae.current.hasDefaultSelect ||
                    e
                      ? (mi(!0),
                        (Ae.current = {
                          payType: te,
                          hasDefaultSelect: Y,
                          receiptType: ri,
                        }))
                      : mi(!1);
                  }
                },
                [te, ge, R, P, ri, Y, $]
              );
            var li = (function () {
                var e = (0, a.Z)(
                  (0, r.Z)().mark(function e() {
                    var i;
                    return (0, r.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (e.prev = 0),
                                (e.next = 3),
                                m.Z.trade.tradeSetting()
                              );
                            case 3:
                              (i = e.sent),
                                T(function (e) {
                                  var n;
                                  (e.packInfo = i),
                                    (e.routerParams =
                                      (null == ze ||
                                      null === (n = ze.router) ||
                                      void 0 === n
                                        ? void 0
                                        : n.params) || {});
                                  var t = e.routerParams.receipt_type;
                                  ("ziti" !== t && "logistics" !== t) ||
                                    (e.receiptType = t),
                                    (e.tradeSettingReady = !0);
                                }),
                                (e.next = 11);
                              break;
                            case 7:
                              (e.prev = 7),
                                (e.t0 = e.catch(0)),
                                console.error("获取交易设置失败:", e.t0),
                                T(function (e) {
                                  e.tradeSettingReady = !0;
                                });
                            case 11:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[0, 7]]
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              ci = (0, c.useMemo)(
                function () {
                  return !(
                    !V ||
                    !$ ||
                    null === Y ||
                    ie ||
                    null == ne ||
                    !ne.length ||
                    !ai
                  );
                },
                [V, $, Y, ie, ne, ai]
              ),
              di = !ci && !ee,
              ui = function () {
                var e = "",
                  i = {};
                switch (Ke) {
                  case "group":
                    (e = "normal_groups"),
                      (i = Object.assign(i, { bargain_id: ni })),
                      ei && (i = Object.assign(i, { team_id: ei }));
                    break;
                  case "seckill":
                    (e = "normal_seckill"),
                      (i = Object.assign(i, {
                        seckill_id: Ue,
                        seckill_ticket: $e,
                      }));
                    break;
                  default:
                    (e = "normal"), (i = {});
                }
                return { value: e, activity: i };
              },
              pi = (function () {
                var e = (0, a.Z)(
                  (0, r.Z)().mark(function e() {
                    var i, n, t, o, a, l, c, d, u, p, m, _;
                    return (0, r.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (
                              ((i = ui() || {}),
                              (n = i.value),
                              (t = i.activity),
                              (o = (0, k.D9)(O, y.Z.checkout.RECEIVER_ADDRESS)),
                              "ziti" === ri &&
                                (o = {
                                  receiver_name: ke.name,
                                  receiver_mobile: ke.phone,
                                }),
                              (a = (0, s.Z)(
                                (0, s.Z)((0, s.Z)((0, s.Z)({}, _e), t), o),
                                {},
                                {
                                  receipt_type: ri,
                                  delivery_filter_mode: "auto",
                                  cart_type: He,
                                  order_type: We ? "bargain" : n,
                                  promotion: "normal",
                                  point_use: ge,
                                  auto_select_coupon: Re.current,
                                  pay_type: te,
                                  page_total_fee: ue.total_fee,
                                }
                              )),
                              "ziti" === ri &&
                                (delete a.receiver_state,
                                delete a.receiver_city,
                                delete a.receiver_district,
                                delete a.receiver_address,
                                delete a.receiver_zip,
                                (a.distributor_pickup_info =
                                  null == ne
                                    ? void 0
                                    : ne.map(function (e) {
                                        var i = e.pickupLocation;
                                        return {
                                          distributor_id: i.rel_distributor_id,
                                          pickup_location: i.id,
                                        };
                                      }))),
                              "merchant" != ri)
                            ) {
                              e.next = 11;
                              break;
                            }
                            return (
                              (e.next = 8),
                              deliverRef.current.geSelfDeliveryTime()
                            );
                          case 8:
                            (l = e.sent),
                              (c = l.selfDeliveryTime),
                              (a.self_delivery_time = c);
                          case 11:
                            return (
                              "point" === te &&
                                (delete a.invoice_type,
                                delete a.invoice_content,
                                delete a.point_use),
                              k.Um && delete a.isNostores,
                              (d = P),
                              (0, k.xb)(d)
                                ? delete a.use_coupon_codes
                                : ((u =
                                    null == d
                                      ? void 0
                                      : d.map(function (e) {
                                          return {
                                            code: e.code,
                                            card_source: e.cardSource,
                                          };
                                        })),
                                  (a.use_coupon_codes = JSON.stringify(u))),
                              (p = me.packName),
                              (m = me.packDes),
                              (a.pack = ye
                                ? { packName: p, packDes: m }
                                : void 0),
                              We && (a.bargain_id = We),
                              (a.remarks = xe),
                              (a.pay_channel = ce),
                              (e.next = 22),
                              (0, j.setOrderCreateGio)()
                            );
                          case 22:
                            return (
                              (_ = e.sent),
                              (a = (0, s.Z)((0, s.Z)({}, a), _)),
                              e.abrupt("return", si(a))
                            );
                          case 25:
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
              mi = (function () {
                var e = (0, a.Z)(
                  (0, r.Z)().mark(function e() {
                    var i,
                      t,
                      o,
                      s,
                      a,
                      l = arguments;
                    return (0, r.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (i = l.length > 0 && void 0 !== l[0] && l[0]),
                                (t = Ve.current + 1),
                                (Ve.current = t),
                                (e.prev = 3),
                                i &&
                                  T(function (e) {
                                    e.loading = !0;
                                  }),
                                (e.next = 7),
                                pi()
                              );
                            case 7:
                              if (((o = e.sent), t === Ve.current)) {
                                e.next = 10;
                                break;
                              }
                              return e.abrupt("return");
                            case 10:
                              return (e.next = 12), m.Z.cart.total(o);
                            case 12:
                              if (((s = e.sent), t === Ve.current)) {
                                e.next = 15;
                                break;
                              }
                              return e.abrupt("return");
                            case 15:
                              (U.current = s), _i(s, o), (e.next = 28);
                              break;
                            case 19:
                              if (
                                ((e.prev = 19),
                                (e.t0 = e.catch(3)),
                                t === Ve.current)
                              ) {
                                e.next = 23;
                                break;
                              }
                              return e.abrupt("return");
                            case 23:
                              console.error("计算订单失败:", e.t0),
                                n((0, g.UK)()),
                                (a =
                                  (null === e.t0 || void 0 === e.t0
                                    ? void 0
                                    : e.t0.message) ||
                                  (null === e.t0 || void 0 === e.t0
                                    ? void 0
                                    : e.t0.msg)) &&
                                  u().showToast({ title: a, icon: "none" }),
                                T(function (e) {
                                  var i;
                                  (e.loading = !1),
                                    (null !== (i = e.detailInfo) &&
                                      void 0 !== i &&
                                      i.length) ||
                                      (e.pageLoadError = !0);
                                });
                            case 28:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[3, 19]]
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              _i = function (e, i) {
                var n = re(e, i);
                n &&
                  T(function (e) {
                    Object.assign(e, n), (e.loading = !1);
                  });
              },
              fi = (function () {
                var e = (0, a.Z)(
                  (0, r.Z)().mark(function e(i) {
                    var t, o, s, a, l, c, d, u, p, _;
                    return (0, r.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (t = []),
                              ne.forEach(function (e) {
                                e.items.forEach(function (i) {
                                  var n;
                                  t.push({
                                    item_id: i.item_id,
                                    default_item_id: i.default_item_id,
                                    num: i.num,
                                    total_fee: i.orgi_total_fee,
                                    discount_info: i.discount_info,
                                    goods_id: i.goods_id,
                                    member_preference: i.member_preference,
                                    distributor_id: e.distributor_id,
                                    regionauth_id:
                                      e.regionauth_id ||
                                      (null === (n = e.items) ||
                                      void 0 === n ||
                                      null === (n = n[0]) ||
                                      void 0 === n
                                        ? void 0
                                        : n.regionauth_id),
                                  });
                                });
                              }),
                              (o =
                                null == i
                                  ? void 0
                                  : i.map(function (e) {
                                      return {
                                        code: e.code,
                                        card_source: e.cardSource,
                                      };
                                    })),
                              (e.next = 5),
                              m.Z.cart.getCouponList(
                                si({
                                  use_coupon_codes: JSON.stringify(o),
                                  order_items: JSON.stringify(t),
                                })
                              )
                            );
                          case 5:
                            (s = e.sent),
                              (a = []),
                              (l = []),
                              (c = (0, k.D9)(
                                (null == s ? void 0 : s.valid_coupon_list) ||
                                  [],
                                y.Z.coupon.COUPON
                              )),
                              (d = (0, k.D9)(
                                (null == s ? void 0 : s.invalid_coupon_list) ||
                                  [],
                                y.Z.coupon.COUPON
                              )),
                              (u = new Set()),
                              c.forEach(function (e) {
                                u.has(e.code) || (u.add(e.code), a.push(e));
                              }),
                              (p = new Set()),
                              d.forEach(function (e) {
                                p.has(e.code) || (p.add(e.code), l.push(e));
                              }),
                              (_ = a.filter(function (e) {
                                return 1 == e.isChecked;
                              })),
                              T(function (e) {
                                (e.validCouponList = a),
                                  (e.invalidCouponList = l),
                                  (e.checkedCouponList = _);
                              }),
                              (Re.current = "0"),
                              n((0, b.ex)(_));
                          case 18:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (i) {
                  return e.apply(this, arguments);
                };
              })(),
              vi = function (e) {
                T(function (i) {
                  i.hasDefaultSelect = !!e;
                });
              },
              hi = (function () {
                var e = (0, a.Z)(
                  (0, r.Z)().mark(function e() {
                    var i, n, t, o;
                    return (0, r.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              if (!de) {
                                e.next = 2;
                                break;
                              }
                              return e.abrupt("return");
                            case 2:
                              if (
                                "logistics" !== ri ||
                                (null != O && O.address_id)
                              ) {
                                e.next = 5;
                                break;
                              }
                              return (
                                u().showToast({
                                  title: "请选择收货地址",
                                  icon: "none",
                                }),
                                e.abrupt("return")
                              );
                            case 5:
                              if ("ziti" !== ri) {
                                e.next = 21;
                                break;
                              }
                              return (
                                (e.next = 8), Le.current.validateZitiInfo()
                              );
                            case 8:
                              if (((i = e.sent), null != ke && ke.name)) {
                                e.next = 12;
                                break;
                              }
                              return (
                                u().showToast({
                                  title: "请输入提货人姓名",
                                  icon: "none",
                                }),
                                e.abrupt("return")
                              );
                            case 12:
                              if (null != ke && ke.phone) {
                                e.next = 15;
                                break;
                              }
                              return (
                                u().showToast({
                                  title: "请输入提货人手机号",
                                  icon: "none",
                                }),
                                e.abrupt("return")
                              );
                            case 15:
                              if (!ke.phone || /^1[3-9]\d{9}$/.test(ke.phone)) {
                                e.next = 18;
                                break;
                              }
                              return (
                                u().showToast({
                                  title: "请输入正确的手机号",
                                  icon: "none",
                                }),
                                e.abrupt("return")
                              );
                            case 18:
                              if (i) {
                                e.next = 21;
                                break;
                              }
                              return (
                                u().showToast({
                                  title: "请选择自提信息",
                                  icon: "none",
                                }),
                                e.abrupt("return")
                              );
                            case 21:
                              if (
                                ((e.prev = 21),
                                T(function (e) {
                                  e.submitLoading = !0;
                                }),
                                !k.FO)
                              ) {
                                e.next = 42;
                                break;
                              }
                              return (
                                null,
                                (n =
                                  "group" == Ke
                                    ? {
                                        temp_name: "yykweishop",
                                        source_type: "group",
                                      }
                                    : {
                                        temp_name: "yykweishop",
                                        source_type:
                                          "logistics" === ri
                                            ? "logistics_order"
                                            : "ziti_order",
                                      }),
                                (e.next = 28),
                                m.Z.user.newWxaMsgTmpl(n)
                              );
                            case 28:
                              return (
                                (t = e.sent),
                                (o = t.template_id),
                                (e.prev = 30),
                                (e.next = 33),
                                u().requestSubscribeMessage({ tmplIds: o })
                              );
                            case 33:
                              xi(), (e.next = 40);
                              break;
                            case 36:
                              (e.prev = 36),
                                (e.t0 = e.catch(30)),
                                console.error(e.t0),
                                xi();
                            case 40:
                              e.next = 43;
                              break;
                            case 42:
                              xi();
                            case 43:
                              e.next = 49;
                              break;
                            case 45:
                              (e.prev = 45),
                                (e.t1 = e.catch(21)),
                                xi(),
                                console.error("提交订单失败", e.t1);
                            case 49:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [
                        [21, 45],
                        [30, 36],
                      ]
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              bi = (function () {
                var e = (0, a.Z)(
                  (0, r.Z)().mark(function e(i) {
                    var n,
                      t,
                      s,
                      l,
                      c,
                      d,
                      u,
                      p,
                      _,
                      f,
                      v,
                      h,
                      b = arguments;
                    return (0, r.Z)().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            (n = b.length > 1 && void 0 !== b[1] ? b[1] : {}),
                              (t = 0),
                              (s = 0),
                              (l = 0),
                              (c = 0),
                              (d = ""),
                              (u = Object.keys(i || {})),
                              (p =
                                (null == n ? void 0 : n.platform_order_no) ||
                                ""),
                              (_ = []),
                              (f = (0, r.Z)().mark(function e() {
                                var n, u, f, b, x, g;
                                return (0, r.Z)().wrap(
                                  function (e) {
                                    for (;;)
                                      switch ((e.prev = e.next)) {
                                        case 0:
                                          if (
                                            ((n = h[v]),
                                            (u = i[n][0]),
                                            (f = null == u ? void 0 : u.items),
                                            (s +=
                                              (null == u
                                                ? void 0
                                                : u.item_fee) || 0),
                                            (l +=
                                              (null == u
                                                ? void 0
                                                : u.discount_fee) || 0),
                                            (c +=
                                              (null == u
                                                ? void 0
                                                : u.total_fee) || 0),
                                            !d &&
                                              null != u &&
                                              u.order_no &&
                                              (d = u.order_no),
                                            null == f || !f.length)
                                          ) {
                                            e.next = 24;
                                            break;
                                          }
                                          (b = (0, o.Z)(f)),
                                            (e.prev = 9),
                                            (g = (0, r.Z)().mark(function e() {
                                              var i, n;
                                              return (0, r.Z)().wrap(function (
                                                e
                                              ) {
                                                for (;;)
                                                  switch ((e.prev = e.next)) {
                                                    case 0:
                                                      (i = x.value),
                                                        (t += Number(
                                                          (null == i
                                                            ? void 0
                                                            : i.num) || 0
                                                        )),
                                                        m.Z.track.adTrack({
                                                          action_type:
                                                            "COMPLETE_ORDER",
                                                          order_id: i.order_id,
                                                        }),
                                                        (n = new Promise(
                                                          (function () {
                                                            var e = (0, a.Z)(
                                                              (0, r.Z)().mark(
                                                                function e(n) {
                                                                  var t, o, s;
                                                                  return (0,
                                                                  r.Z)().wrap(
                                                                    function (
                                                                      e
                                                                    ) {
                                                                      for (;;)
                                                                        switch (
                                                                          (e.prev =
                                                                            e.next)
                                                                        ) {
                                                                          case 0:
                                                                            return (
                                                                              (e.next = 2),
                                                                              (0,
                                                                              j.setProductCreateOrderGio)(
                                                                                {
                                                                                  platformOrderNo:
                                                                                    p,
                                                                                  orderID:
                                                                                    (null ==
                                                                                    u
                                                                                      ? void 0
                                                                                      : u.order_no) ||
                                                                                    i.order_no,
                                                                                  orderSn:
                                                                                    (null ==
                                                                                    u
                                                                                      ? void 0
                                                                                      : u.order_id) ||
                                                                                    i.order_id,
                                                                                  orderItemSn:
                                                                                    i.id,
                                                                                  townName:
                                                                                    (null ==
                                                                                    u
                                                                                      ? void 0
                                                                                      : u.regionauth_code) ||
                                                                                    (null ==
                                                                                    i
                                                                                      ? void 0
                                                                                      : i.regionauth_code),
                                                                                  productNumber:
                                                                                    null ==
                                                                                    i
                                                                                      ? void 0
                                                                                      : i.num,
                                                                                  productAmount:
                                                                                    (null ==
                                                                                    i
                                                                                      ? void 0
                                                                                      : i.item_fee) /
                                                                                    100,
                                                                                  discountAmount:
                                                                                    (null ==
                                                                                    i
                                                                                      ? void 0
                                                                                      : i.discount_fee) /
                                                                                    100,
                                                                                  paidAmount:
                                                                                    (null ==
                                                                                    i
                                                                                      ? void 0
                                                                                      : i.total_fee) /
                                                                                    100,
                                                                                  productPrice:
                                                                                    (null ==
                                                                                    i
                                                                                      ? void 0
                                                                                      : i.price) /
                                                                                    100,
                                                                                  shopName:
                                                                                    null ==
                                                                                    i
                                                                                      ? void 0
                                                                                      : i.distributor_name,
                                                                                  shopCode:
                                                                                    null ==
                                                                                    i
                                                                                      ? void 0
                                                                                      : i.shop_code,
                                                                                  sku:
                                                                                    null ==
                                                                                    i
                                                                                      ? void 0
                                                                                      : i.item_bn,
                                                                                  spu:
                                                                                    null ==
                                                                                    i
                                                                                      ? void 0
                                                                                      : i.goods_bn,
                                                                                  skuName:
                                                                                    null ==
                                                                                    i
                                                                                      ? void 0
                                                                                      : i.item_spec_desc,
                                                                                  spuName:
                                                                                    null ==
                                                                                    i
                                                                                      ? void 0
                                                                                      : i.item_name,
                                                                                  fristCategory:
                                                                                    null ==
                                                                                      i ||
                                                                                    null ===
                                                                                      (t =
                                                                                        i
                                                                                          .item_category_main[0]) ||
                                                                                    void 0 ===
                                                                                      t
                                                                                      ? void 0
                                                                                      : t.category_name,
                                                                                  secondCategory:
                                                                                    null ==
                                                                                      i ||
                                                                                    null ===
                                                                                      (o =
                                                                                        i
                                                                                          .item_category_main[0]) ||
                                                                                    void 0 ===
                                                                                      o ||
                                                                                    null ===
                                                                                      (o =
                                                                                        o
                                                                                          .children[0]) ||
                                                                                    void 0 ===
                                                                                      o
                                                                                      ? void 0
                                                                                      : o.category_name,
                                                                                  thirdCategory:
                                                                                    null ==
                                                                                      i ||
                                                                                    null ===
                                                                                      (s =
                                                                                        i
                                                                                          .item_category_main[0]) ||
                                                                                    void 0 ===
                                                                                      s ||
                                                                                    null ===
                                                                                      (s =
                                                                                        s
                                                                                          .children[0]) ||
                                                                                    void 0 ===
                                                                                      s ||
                                                                                    null ===
                                                                                      (s =
                                                                                        s
                                                                                          .children[0]) ||
                                                                                    void 0 ===
                                                                                      s
                                                                                      ? void 0
                                                                                      : s.category_name,
                                                                                  brandName:
                                                                                    null ==
                                                                                    i
                                                                                      ? void 0
                                                                                      : i.brand_name,
                                                                                  discountRate:
                                                                                    null !=
                                                                                      i &&
                                                                                    i.discount_rate
                                                                                      ? i.discount_rate /
                                                                                        10
                                                                                      : "-",
                                                                                }
                                                                              )
                                                                            );
                                                                          case 2:
                                                                            n();
                                                                          case 3:
                                                                          case "end":
                                                                            return e.stop();
                                                                        }
                                                                    },
                                                                    e
                                                                  );
                                                                }
                                                              )
                                                            );
                                                            return function (
                                                              i
                                                            ) {
                                                              return e.apply(
                                                                this,
                                                                arguments
                                                              );
                                                            };
                                                          })()
                                                        )),
                                                        _.push(n);
                                                    case 5:
                                                    case "end":
                                                      return e.stop();
                                                  }
                                              },
                                              e);
                                            })),
                                            b.s();
                                        case 12:
                                          if ((x = b.n()).done) {
                                            e.next = 16;
                                            break;
                                          }
                                          return e.delegateYield(g(), "t0", 14);
                                        case 14:
                                          e.next = 12;
                                          break;
                                        case 16:
                                          e.next = 21;
                                          break;
                                        case 18:
                                          (e.prev = 18),
                                            (e.t1 = e.catch(9)),
                                            b.e(e.t1);
                                        case 21:
                                          return (
                                            (e.prev = 21), b.f(), e.finish(21)
                                          );
                                        case 24:
                                        case "end":
                                          return e.stop();
                                      }
                                  },
                                  e,
                                  null,
                                  [[9, 18, 21, 24]]
                                );
                              })),
                              (v = 0),
                              (h = u);
                          case 11:
                            if (!(v < h.length)) {
                              e.next = 16;
                              break;
                            }
                            return e.delegateYield(f(), "t0", 13);
                          case 13:
                            v++, (e.next = 11);
                            break;
                          case 16:
                            return (e.next = 18), Promise.all(_);
                          case 18:
                            (0, j.setCreateOrderGio)({
                              platformOrderNo: p,
                              orderID: d || "-",
                              orderAmount: s / 100,
                              discountAmount: l / 100,
                              paidAmount: (c - ue.freight_fee) / 100,
                              productNumber: t,
                            });
                          case 19:
                          case "end":
                            return e.stop();
                        }
                    }, e);
                  })
                );
                return function (i) {
                  return e.apply(this, arguments);
                };
              })(),
              xi = (function () {
                var e = (0, a.Z)(
                  (0, r.Z)().mark(function e() {
                    var i, t, o;
                    return (0, r.Z)().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (e.prev = 0), (e.next = 3), pi();
                            case 3:
                              return (
                                (i = e.sent),
                                "logistics" === ri &&
                                  (i.address_id =
                                    null == O ? void 0 : O.address_id),
                                (e.prev = 5),
                                (e.next = 8),
                                m.Z.trade.h5create(i)
                              );
                            case 8:
                              (o = e.sent),
                                bi(null == o ? void 0 : o.order_ids, o),
                                (t = (0, s.Z)(
                                  (0, s.Z)({}, o),
                                  {},
                                  { go_order_detail: (0, X.X)(o) }
                                )),
                                o.order_id,
                                n((0, b.tx)()),
                                (e.next = 24);
                              break;
                            case 15:
                              if (
                                ((e.prev = 15),
                                (e.t0 = e.catch(5)),
                                T(function (e) {
                                  e.submitLoading = !1;
                                }),
                                n((0, g.UK)()),
                                422 !==
                                  (null === e.t0 || void 0 === e.t0
                                    ? void 0
                                    : e.t0.status_code) ||
                                  (400503 !=
                                    (null === e.t0 || void 0 === e.t0
                                      ? void 0
                                      : e.t0.code) &&
                                    400504 !=
                                      (null === e.t0 || void 0 === e.t0
                                        ? void 0
                                        : e.t0.code)))
                              ) {
                                e.next = 23;
                                break;
                              }
                              return (
                                (e.next = 22),
                                J({
                                  title: "温馨提示",
                                  showClose: !1,
                                  content: (0, M.jsxs)(p.G7, {
                                    className: "order-modal-content",
                                    children: [" ", e.t0.message],
                                  }),
                                  renderFooter: (0, M.jsxs)(p.G7, {
                                    className:
                                      "modal-footer order-modal-footer",
                                    children: [
                                      (0, M.jsx)(p.G7, {
                                        className:
                                          "order-modal-footer-btn order-modal-footer-btn-normal",
                                        onClick: (0, a.Z)(
                                          (0, r.Z)().mark(function e() {
                                            return (0, r.Z)().wrap(function (
                                              e
                                            ) {
                                              for (;;)
                                                switch ((e.prev = e.next)) {
                                                  case 0:
                                                    return (e.next = 2), H();
                                                  case 2:
                                                    u().navigateBack();
                                                  case 3:
                                                  case "end":
                                                    return e.stop();
                                                }
                                            },
                                            e);
                                          })
                                        ),
                                        children: "确认",
                                      }),
                                      400504 ==
                                        (null === e.t0 || void 0 === e.t0
                                          ? void 0
                                          : e.t0.code) &&
                                        (0, M.jsx)(p.G7, {
                                          className:
                                            "order-modal-footer-btn order-modal-footer-btn-active",
                                          children: (0, M.jsx)(N.Z, {
                                            showIcon: !1,
                                            text: "联系客服",
                                            townTag: (0, w.vL)(
                                              ne,
                                              null == L
                                                ? void 0
                                                : L.regionauth_id
                                            ),
                                            callback: (0, a.Z)(
                                              (0, r.Z)().mark(function e() {
                                                return (0, r.Z)().wrap(
                                                  function (e) {
                                                    for (;;)
                                                      switch (
                                                        (e.prev = e.next)
                                                      ) {
                                                        case 0:
                                                          return (
                                                            (e.next = 2), H()
                                                          );
                                                        case 2:
                                                        case "end":
                                                          return e.stop();
                                                      }
                                                  },
                                                  e
                                                );
                                              })
                                            ),
                                          }),
                                        }),
                                    ],
                                  }),
                                })
                              );
                            case 22:
                            case 23:
                              return e.abrupt("return");
                            case 24:
                              A(
                                (0, s.Z)(
                                  (0, s.Z)({}, i),
                                  {},
                                  { activityType: Ke }
                                ),
                                t
                              ),
                                (e.next = 32);
                              break;
                            case 27:
                              (e.prev = 27),
                                (e.t1 = e.catch(0)),
                                console.error("提交订单失败", e.t1),
                                u().showToast({
                                  title: "提交订单失败，请重试",
                                  icon: "none",
                                }),
                                T(function (e) {
                                  e.submitLoading = !1;
                                });
                            case 32:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [
                        [0, 27],
                        [5, 15],
                      ]
                    );
                  })
                );
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
              gi = function (e) {
                return "logistics" === e ? "express" : "store";
              },
              yi =
                (null == ai ? void 0 : ai.canViewPickupOnlyGoods) &&
                "logistics" === ri;
            return (0, M.jsx)(_.nO, {
              ref: qe,
              footerHeight: 160,
              renderFooter: ci
                ? (0, M.jsx)(K, {
                    totalAmount: ue.total_fee,
                    discountAmount: ue.checkout_total_discount,
                    totalCount: ue.items_count,
                    disabled:
                      !(function () {
                        return "logistics" === ri
                          ? !!O
                          : null == Le ||
                            null === (e = Le.current) ||
                            void 0 === e
                          ? void 0
                          : e.validateZitiInfo();
                        var e;
                      })() || de,
                    onSubmit: hi,
                    loading: de,
                  })
                : null,
              renderFloatLayout: (0, M.jsxs)(M.Fragment, {
                children: [
                  (0, M.jsx)(B, {
                    visible: oe,
                    goods: le,
                    mode: se,
                    onContinue: function () {
                      T(function (e) {
                        (e.deliveryModalVisible = !1),
                          (e.receiptType = "logistics");
                      });
                    },
                    onBack: function () {
                      T(function (e) {
                        e.deliveryModalVisible = !1;
                      }),
                        u().navigateBack({ delta: 1 });
                    },
                    onClose: function () {
                      T(function (e) {
                        e.deliveryModalVisible = !1;
                      });
                    },
                  }),
                  (0, M.jsx)(Q, {
                    visible: Ne,
                    availableCoupons: ve,
                    unavailableCoupons: be,
                    selectedCoupon: fe,
                    onSelect: fi,
                    onClose: function () {
                      T(function (e) {
                        (e.validCouponList = JSON.parse(
                          JSON.stringify(he.valid_coupon_list)
                        )),
                          (e.invalidCouponList = JSON.parse(
                            JSON.stringify(he.invalid_coupon_list)
                          )),
                          (e.checkedCouponList = JSON.parse(
                            JSON.stringify(he.checked_coupon_list)
                          )),
                          (e.couponModalVisible = !1);
                      });
                    },
                    onConfirm: function (e) {
                      (Re.current = "0"),
                        T(function (i) {
                          (i.checkedCouponList = e),
                            (i.couponModalVisible = !1);
                        }),
                        n((0, b.ex)(e));
                    },
                  }),
                  (0, M.jsx)(W.Ch, {
                    visible: Ge,
                    data: Ze,
                    onClose: function () {
                      T(function (e) {
                        e.goodsReductionDetailModalVisible = !1;
                      });
                    },
                  }),
                  (0, M.jsx)(W.tF, {
                    visible: we,
                    data: Ce,
                    onClose: function () {
                      T(function (e) {
                        e.priceDetailModalVisible = !1;
                      });
                    },
                  }),
                  (0, M.jsx)(W.SE, {
                    visible: De,
                    title: Oe,
                    data: "platform" === Se ? Me : Te,
                    onClose: function () {
                      T(function (e) {
                        e.promotionDetailModalVisible = !1;
                      });
                    },
                  }),
                  (0, M.jsx)(_.EY, {
                    open: Ie,
                    allowRefreshSelect: !1,
                    initCompleted: !(null == O || !O.address_id) && O.is_def,
                    onSelect: function (e) {
                      T(function (e) {
                        e.addressPickerVisible = !1;
                      }),
                        n((0, x.Qn)(e));
                    },
                    onError: function () {
                      vi(null);
                    },
                    onDefaultSelect: (function () {
                      var e = (0, a.Z)(
                        (0, r.Z)().mark(function e(i) {
                          return (0, r.Z)().wrap(function (e) {
                            for (;;)
                              switch ((e.prev = e.next)) {
                                case 0:
                                  if (!i || R === JSON.stringify(i)) {
                                    e.next = 3;
                                    break;
                                  }
                                  return (e.next = 3), n((0, x.Qn)(i));
                                case 3:
                                  vi(i);
                                case 4:
                                case "end":
                                  return e.stop();
                              }
                          }, e);
                        })
                      );
                      return function (i) {
                        return e.apply(this, arguments);
                      };
                    })(),
                    onClose: function () {
                      return T(function (e) {
                        e.addressPickerVisible = !1;
                      });
                    },
                  }),
                ],
              }),
              className: "pages-cart-espier-checkout",
              children: (0, M.jsx)(p.pf, {
                scrollY: !0,
                style: { height: "100%" },
                className: "espier-checkout",
                enhanced: !0,
                bounces: !1,
                showScrollbar: !1,
                children: di
                  ? (0, M.jsx)(_.m6, {
                      className: "espier-checkout__page-loading",
                    })
                  : (0, M.jsxs)(M.Fragment, {
                      children: [
                        (0, M.jsx)(S, {
                          ref: Le,
                          deliveryType: gi(ri),
                          address: O,
                          pickerInfo: ke,
                          showDeliveryTabs:
                            !0 === (null == ai ? void 0 : ai.showDeliveryTabs),
                          showZitiTab:
                            !0 === (null == ai ? void 0 : ai.showZitiTab),
                          zitiTabDisabled: !(null == ai || !ai.zitiTabDisabled),
                          addressDetailOnly:
                            !(null == ai || !ai.addressDetailOnly) ||
                            (!0 ===
                              (null == ai ? void 0 : ai.showDeliveryTabs) &&
                              "logistics" === ri),
                          pickupFormOnly: !(null == ai || !ai.pickupFormOnly),
                          deliveryHint:
                            null != ai &&
                            ai.hintText &&
                            ("cross_town" === ai.hintType ||
                              "weak" === ai.hintType ||
                              ("logistics" === ri &&
                                "pickup_only_filtered" === ai.hintType))
                              ? ai.hintText
                              : "",
                          deliveryHintStyle:
                            (null != ai &&
                              ai.hintText &&
                              (null == ai ? void 0 : ai.hintStyle)) ||
                            "",
                          canViewPickupOnlyGoods: yi,
                          onViewPickupOnlyGoods: function () {
                            var e =
                              (null == ai ? void 0 : ai.pickupOnlyGoods) || [];
                            e.length &&
                              T(function (i) {
                                (i.deliveryModalVisible = !0),
                                  (i.deliveryModalMode = "view"),
                                  (i.deliveryModalGoods = e);
                              });
                          },
                          onDeliveryChange: function (e) {
                            var i = (0, C.ZS)(e, ai);
                            return "mail_only_goods" === i.reason
                              ? (T(function (e) {
                                  (e.deliveryModalVisible = !0),
                                    (e.deliveryModalMode = "block"),
                                    (e.deliveryModalGoods = i.goods);
                                }),
                                !1)
                              : !i.blocked &&
                                  (T(function (i) {
                                    i.receiptType = e;
                                  }),
                                  !0);
                          },
                          onAddressSelect: function () {
                            u().navigateTo({
                              url: "/pages/member/address/list?select=1",
                            });
                          },
                          onPickerInfoChange: function (e) {
                            T(function (i) {
                              i.pickerInfo = e;
                            });
                          },
                          setAddressPickerVisible: function () {
                            T(function (e) {
                              e.addressPickerVisible = !0;
                            });
                          },
                        }),
                        (0, M.jsxs)(p.G7, {
                          className: "espier-checkout__content",
                          children: [
                            (0, M.jsx)(z, {
                              hasAddress: !!O,
                              shops: ne,
                              remarks: xe,
                              onRemarkChange: function (e, i) {
                                return (
                                  T(function (n) {
                                    n.remarks[e] = i;
                                  }),
                                  i
                                );
                              },
                              deliveryType: gi(ri),
                              onItemDiscountClick: function (e, i) {
                                var n,
                                  t = (0, G.D)({
                                    item: e,
                                    shop: i,
                                    couponList:
                                      null === (n = U.current) || void 0 === n
                                        ? void 0
                                        : n.coupon_list,
                                  });
                                t &&
                                  T(function (e) {
                                    (e.priceDetailModalData = t),
                                      (e.priceDetailModalVisible = !0);
                                  });
                              },
                              couponList:
                                null === (i = U.current) || void 0 === i
                                  ? void 0
                                  : i.coupon_list,
                            }),
                            (0, M.jsx)(F, {
                              deliveryType: gi(ri),
                              goodsAmount: ue.market_fee,
                              discountAmount: ue.discount_fee,
                              promotionDiscount: ue.promotion_discount,
                              platformDiscount: ue.platform_reduction,
                              couponAmount: ue.coupon_discount,
                              expressFee: ue.freight_fee,
                              goodsDiscount: ue.product_reduction,
                              onCouponClick: function () {
                                T(function (e) {
                                  e.couponModalVisible = !0;
                                });
                              },
                              onGoodsDiscountClick: function () {
                                Ze &&
                                  T(function (e) {
                                    e.goodsReductionDetailModalVisible = !0;
                                  });
                              },
                              onPromotionClick: function () {
                                Te &&
                                  T(function (e) {
                                    (e.promotionDetailModalTitle = "促销优惠"),
                                      (e.promotionDetailModalType =
                                        "promotion"),
                                      (e.promotionDetailModalVisible = !0);
                                  });
                              },
                              onPlatformDiscountClick: function () {
                                Me &&
                                  T(function (e) {
                                    (e.promotionDetailModalTitle = "平台立减"),
                                      (e.promotionDetailModalType = "platform"),
                                      (e.promotionDetailModalVisible = !0);
                                  });
                              },
                              totalAmount: ue.total_fee,
                              hasCoupon: ve.length > 0,
                              freightType: ue.freight_type,
                            }),
                            (0, M.jsxs)(p.G7, {
                              className: "espier-checkout__paytype",
                              children: [
                                (0, M.jsx)(p.G7, {
                                  className: "espier-checkout__paytype-label",
                                  children: "支付方式",
                                }),
                                (0, M.jsx)(p.G7, {
                                  className: "espier-checkout__paytype-content",
                                  children: (0, M.jsx)(_.Ko, {
                                    src: "fv_wechat_pay.png",
                                    className:
                                      "espier-checkout__paytype-content-icon",
                                  }),
                                }),
                              ],
                            }),
                            (0, M.jsx)(p.G7, {
                              className: "espier-checkout__footer-space",
                            }),
                          ],
                        }),
                      ],
                    }),
              }),
            });
          };
          Page(
            (0, t.createPageConfig)(
              le,
              "subpages/cart/espier-checkout",
              { root: { cn: [] } },
              { navigationBarTitleText: "订单结算" } || {}
            )
          );
        },
      },
      function (e) {
        e.O(
          0,
          [
            6758, 7531, 2881, 6437, 5014, 3096, 6010, 8206, 9246, 5710, 6549,
            6220, 1497, 1193, 2903, 4508, 9741, 7312, 7811, 7299, 1699, 761,
            7677, 2817, 9887, 3197, 9651, 5386, 7576, 4300, 998, 2224, 2302,
            8322, 3139, 7502, 8075, 6353, 3921, 7162, 4487, 9658, 5200, 9444,
            9934, 396, 7078, 5469, 2592, 3455, 7453, 1471, 5987, 1871, 7738,
            4539, 7191, 796, 8535, 3608, 199, 6511, 2107, 1216, 8592,
          ],
          function () {
            return (function (i) {
              return e((e.s = i));
            })(66574);
          }
        ),
          e.O();
      },
    ]);
})();

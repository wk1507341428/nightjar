(wx.webpackJsonp = wx.webpackJsonp || []).push([
  [2107],
  {
    47410: function (e, t, n) {
      "use strict";
      n.d(t, {
        Z: function () {
          return g;
        },
      });
      var r = {};
      n.r(r),
        n.d(r, {
          logInterceptor: function () {
            return f;
          },
          timeoutInterceptor: function () {
            return d;
          },
        });
      var i = n(32180),
        o = n(74455),
        a = {
          WEAPP: "WEAPP",
          SWAN: "SWAN",
          ALIPAY: "ALIPAY",
          TT: "TT",
          QQ: "QQ",
          JD: "JD",
          WEB: "WEB",
          RN: "RN",
          HARMONY: "HARMONY",
          QUICKAPP: "QUICKAPP",
          HARMONYHYBRID: "HARMONYHYBRID",
        },
        u = n(15671),
        s = n(43144),
        c = (function () {
          function e(t, n, r) {
            (0, u.Z)(this, e),
              (this.index = r || 0),
              (this.requestParams = t || {}),
              (this.interceptors = n || []);
          }
          return (0, s.Z)(e, [
            {
              key: "proceed",
              value: function () {
                var e =
                  arguments.length > 0 && void 0 !== arguments[0]
                    ? arguments[0]
                    : {};
                if (
                  ((this.requestParams = e),
                  this.index >= this.interceptors.length)
                )
                  throw new Error("chain 参数错误, 请勿直接修改 request.chain");
                var t = this._getNextInterceptor(),
                  n = this._getNextChain(),
                  r = t(n),
                  i = r.catch(function (e) {
                    return Promise.reject(e);
                  });
                return (
                  Object.keys(r).forEach(function (e) {
                    return (0, o.mf)(r[e]) && (i[e] = r[e]);
                  }),
                  i
                );
              },
            },
            {
              key: "_getNextInterceptor",
              value: function () {
                return this.interceptors[this.index];
              },
            },
            {
              key: "_getNextChain",
              value: function () {
                return new e(
                  this.requestParams,
                  this.interceptors,
                  this.index + 1
                );
              },
            },
          ]);
        })(),
        l = (0, s.Z)(
          function e(t) {
            (0, u.Z)(this, e),
              (this.taroInterceptor = t),
              (this.chain = new c());
          },
          [
            {
              key: "request",
              value: function (e) {
                var t = this.chain,
                  n = this.taroInterceptor;
                return (
                  (t.interceptors = t.interceptors
                    .filter(function (e) {
                      return e !== n;
                    })
                    .concat(n)),
                  t.proceed(Object.assign({}, e))
                );
              },
            },
            {
              key: "addInterceptor",
              value: function (e) {
                this.chain.interceptors.push(e);
              },
            },
            {
              key: "cleanInterceptors",
              value: function () {
                this.chain = new c();
              },
            },
          ]
        );
      function d(e) {
        var t,
          n = e.requestParams,
          r = new Promise(function (r, i) {
            var o = setTimeout(function () {
              clearTimeout(o), i(new Error("网络链接超时,请稍后再试！"));
            }, (n && n.timeout) || 6e4);
            (t = e.proceed(n))
              .then(function (e) {
                o && (clearTimeout(o), r(e));
              })
              .catch(function (e) {
                o && clearTimeout(o), i(e);
              });
          });
        return !(0, o.o8)(t) && (0, o.mf)(t.abort) && (r.abort = t.abort), r;
      }
      function f(e) {
        var t = e.requestParams,
          n = (t.method, t.data, t.url, e.proceed(t)),
          r = n.then(function (e) {
            return e;
          });
        return (0, o.mf)(n.abort) && (r.abort = n.abort), r;
      }
      var h = n(4942),
        v = { 640: 1.17, 750: 1, 828: 0.905 };
      function p(e) {
        return function (t) {
          var n = t.designWidth,
            r = void 0 === n ? 750 : n,
            i = t.deviceRatio,
            o = void 0 === i ? v : i,
            a = t.baseFontSize,
            u = void 0 === a ? 20 : a,
            s = t.targetUnit,
            c = void 0 === s ? "rpx" : s,
            l = t.unitPrecision,
            d = void 0 === l ? 5 : l;
          (e.config = e.config || {}),
            (e.config.designWidth = r),
            (e.config.deviceRatio = o),
            (e.config.baseFontSize = u),
            (e.config.targetUnit = c),
            (e.config.unitPrecision = d);
        };
      }
      var g = {
        Behavior: function (e) {
          return e;
        },
        getEnv: function () {
          return a.WEAPP;
        },
        ENV_TYPE: a,
        Link: l,
        interceptors: r,
        Current: i.Current,
        getCurrentInstance: i.getCurrentInstance,
        options: i.options,
        nextTick: i.nextTick,
        eventCenter: i.eventCenter,
        Events: o.zW,
        getInitPxTransform: p,
        interceptorify: function (e) {
          return new l(function (t) {
            return e(t.requestParams);
          });
        },
      };
      (g.initPxTransform = p(g)),
        (g.preload = (function (e) {
          return function (t, n) {
            e.preloadData = (0, o.Kn)(t) ? t : (0, h.Z)({}, t, n);
          };
        })(i.Current)),
        (g.pxTransform = (function (e) {
          return function (t) {
            var n = e.config || {},
              r = n.baseFontSize,
              i = n.deviceRatio || v,
              a = (function () {
                var e =
                  arguments.length > 0 && void 0 !== arguments[0]
                    ? arguments[0]
                    : 0;
                return (0, o.mf)(n.designWidth)
                  ? n.designWidth(e)
                  : n.designWidth || 750;
              })(t);
            if (!(a in i))
              throw new Error(
                "deviceRatio 配置中不存在 ".concat(a, " 的设置！")
              );
            var u = n.targetUnit || "rpx",
              s = n.unitPrecision || 5,
              c = ~~t,
              l = 1 / i[a];
            switch (u) {
              case "rem":
                l *= 2 * r;
                break;
              case "px":
                l *= 2;
            }
            var d = c / l;
            return s >= 0 && s <= 100 && (d = Number(d.toFixed(s))), d + u;
          };
        })(g));
    },
    88744: function (e, t, n) {
      "use strict";
      n.d(t, {
        Ox: function () {
          return V;
        },
      });
      var r = n(4942),
        i = n(29439),
        o = n(15671),
        a = n(43144),
        u = n(58618),
        s = n(60136),
        c = n(93433),
        l = n(74455),
        d = n(32180),
        f = { PageContext: l.kT, R: l.kT },
        h = "taro-app";
      function v(e, t) {
        var n,
          r = t.prototype;
        return (
          !(null === (n = t.displayName) || void 0 === n
            ? void 0
            : n.includes("Connect")) &&
          ((0, l.mf)(t.render) ||
            !!(null == r ? void 0 : r.isReactComponent) ||
            r instanceof e.Component)
        );
      }
      function p(e) {
        return (e.writable = !0), (e.enumerable = !0), e;
      }
      function g(e) {
        d.Current.router = Object.assign(
          { params: null == e ? void 0 : e.query },
          e
        );
      }
      var m,
        b,
        y = function (e) {
          return function (t) {
            var n = f.R,
              r = f.PageContext,
              i = n.useContext(r) || h,
              o = n.useRef(),
              a = n.useRef(t);
            a.current !== t && (a.current = t),
              n.useLayoutEffect(function () {
                var t = (o.current = (0, d.getPageInstance)(i)),
                  n = !1;
                t ||
                  ((n = !0),
                  (o.current = Object.create(null)),
                  (t = o.current));
                var r = function () {
                  return a.current.apply(a, arguments);
                };
                return (
                  (0, l.mf)(t[e])
                    ? (t[e] = [t[e], r])
                    : (t[e] = [].concat((0, c.Z)(t[e] || []), [r])),
                  n && (0, d.injectPageInstance)(t, i),
                  function () {
                    var t = o.current;
                    if (t) {
                      var n = t[e];
                      n === r
                        ? (t[e] = void 0)
                        : (0, l.kJ)(n) &&
                          (t[e] = n.filter(function (e) {
                            return e !== r;
                          })),
                        (o.current = void 0);
                    }
                  }
                );
              }, []);
          };
        },
        k = y("componentDidHide"),
        w = y("componentDidShow"),
        T = y("onError"),
        E = y("onUnhandledRejection"),
        C = y("onLaunch"),
        S = y("onPageNotFound"),
        _ = y("onLoad"),
        P = y("onPageScroll"),
        x = y("onPullDownRefresh"),
        I = y("onPullIntercept"),
        A = y("onReachBottom"),
        N = y("onResize"),
        O = y("onUnload"),
        L = y("onAddToFavorites"),
        R = y("onOptionMenuClick"),
        Z = y("onSaveExitState"),
        B = y("onShareAppMessage"),
        D = y("onShareTimeline"),
        M = y("onTitleClick"),
        j = y("onReady"),
        H = y("onTabItemTap"),
        U = Object.freeze({
          __proto__: null,
          useAddToFavorites: L,
          useDidHide: k,
          useDidShow: w,
          useError: T,
          useLaunch: C,
          useLoad: _,
          useOptionMenuClick: R,
          usePageNotFound: S,
          usePageScroll: P,
          usePullDownRefresh: x,
          usePullIntercept: I,
          useReachBottom: A,
          useReady: j,
          useResize: N,
          useRouter: function () {
            var e =
                arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
              t = f.R;
            return e
              ? d.Current.router
              : t.useMemo(function () {
                  return d.Current.router;
                }, []);
          },
          useSaveExitState: Z,
          useScope: function () {},
          useShareAppMessage: B,
          useShareTimeline: D,
          useTabItemTap: H,
          useTitleClick: M,
          useUnhandledRejection: E,
          useUnload: O,
        }),
        Q = (0, d.incrementId)();
      function F(e) {
        l.PT.tap("getLifecycle", function (e, t) {
          return e[(t = t.replace(/^on(Show|Hide)$/, "componentDid$1"))];
        }),
          l.PT.tap("modifyMpEvent", function (e) {
            Object.defineProperty(e, "type", {
              value: e.type.replace(/-/g, ""),
            });
          }),
          l.PT.tap("batchedEventUpdates", function (t) {
            e.unstable_batchedUpdates(t);
          }),
          l.PT.tap("mergePageInstance", function (e, t) {
            e &&
              t &&
              ("constructor" in e ||
                Object.keys(e).forEach(function (n) {
                  var r = e[n],
                    i = (function (e) {
                      return (0, l.kJ)(e) ? e : e ? [e] : [];
                    })(t[n]);
                  t[n] = i.concat(r);
                }));
          });
      }
      function W(e, t) {
        return function (n) {
          var r = function (e) {
              return e && (0, d.injectPageInstance)(e, t);
            },
            i = v(e, n)
              ? { ref: r }
              : { forwardedRef: r, reactReduxForwardedRef: r };
          return (
            f.PageContext === l.kT && (f.PageContext = e.createContext("")),
            (function (e) {
              function r() {
                var e;
                return (
                  (0, o.Z)(this, r),
                  ((e = (0, u.Z)(this, r, arguments)).state = { hasError: !1 }),
                  e
                );
              }
              return (
                (0, s.Z)(r, e),
                (0, a.Z)(
                  r,
                  [
                    { key: "componentDidCatch", value: function (e, t) {} },
                    {
                      key: "render",
                      value: function () {
                        var e = this.state.hasError
                          ? []
                          : m(
                              f.PageContext.Provider,
                              { value: t },
                              m(
                                n,
                                Object.assign(Object.assign({}, this.props), i)
                              )
                            );
                        return m("root", { id: t }, e);
                      },
                    },
                  ],
                  [
                    {
                      key: "getDerivedStateFromError",
                      value: function (e) {
                        var t, n;
                        return (
                          null ===
                            (n =
                              null === (t = d.Current.app) || void 0 === t
                                ? void 0
                                : t.onError) ||
                            void 0 === n ||
                            n.call(t, e.message + e.stack),
                          { hasError: !0 }
                        );
                      },
                    },
                  ]
                )
              );
            })(e.Component)
          );
        };
      }
      function V(e, t, n, c) {
        (f.R = t), (m = t.createElement), (b = n), t.Fragment;
        var y,
          k,
          w = t.createRef(),
          T = v(t, e),
          E = new Promise(function (e) {
            return (k = e);
          });
        function C() {
          return w.current;
        }
        function S(e) {
          y
            ? e()
            : E.then(function () {
                return e();
              });
        }
        F(b);
        var _ = (function (n) {
          function r(e) {
            var t;
            return (
              (0, o.Z)(this, r),
              ((t = (0, u.Z)(this, r, [e])).pages = []),
              (t.elements = []),
              (y = t),
              k(t),
              t
            );
          }
          return (
            (0, s.Z)(r, n),
            (0, a.Z)(r, [
              {
                key: "mount",
                value: function (e, n, r) {
                  var i = W(t, n)(e),
                    o = n + Q();
                  this.pages.push(function () {
                    return m(i, { key: o, tid: n });
                  }),
                    this.forceUpdate(r);
                },
              },
              {
                key: "unmount",
                value: function (e, t) {
                  var n = this.elements,
                    r = n.findIndex(function (t) {
                      return t.props.tid === e;
                    });
                  n.splice(r, 1), this.forceUpdate(t);
                },
              },
              {
                key: "render",
                value: function () {
                  for (var t = this.pages, n = this.elements; t.length > 0; ) {
                    var r = t.pop();
                    n.push(r());
                  }
                  var i = null;
                  return T && (i = { ref: w }), m(e, i, n.slice());
                },
              },
            ])
          );
        })(t.Component);
        !(function () {
          var e,
            n,
            r = d.document.getElementById("app");
          if ((t.version || "").startsWith("18")) {
            var i = b.createRoot(r);
            null === (e = i.render) || void 0 === e || e.call(i, m(_));
          } else null === (n = b.render) || void 0 === n || n.call(b, m(_), r);
        })();
        var P = (0, i.Z)(l.PT.call("getMiniLifecycleImpl").app, 3),
          x = P[0],
          I = P[1],
          A = P[2],
          N = Object.create(
            {
              render: function (e) {
                y.forceUpdate(e);
              },
              mount: function (e, t, n) {
                y
                  ? y.mount(e, t, n)
                  : E.then(function (r) {
                      return r.mount(e, t, n);
                    });
              },
              unmount: function (e, t) {
                y.unmount(e, t);
              },
            },
            (0, r.Z)(
              (0, r.Z)(
                (0, r.Z)(
                  (0, r.Z)(
                    (0, r.Z)(
                      (0, r.Z)(
                        { config: p({ configurable: !0, value: c }) },
                        x,
                        p({
                          value: function (e) {
                            var t = this;
                            g(e),
                              S(function () {
                                var n,
                                  r = C();
                                if (((t.$app = r), r)) {
                                  if (r.taroGlobalData) {
                                    var i = r.taroGlobalData,
                                      o = Object.keys(i),
                                      a = Object.getOwnPropertyDescriptors(i);
                                    o.forEach(function (e) {
                                      Object.defineProperty(t, e, {
                                        configurable: !0,
                                        enumerable: !0,
                                        get: function () {
                                          return i[e];
                                        },
                                        set: function (t) {
                                          i[e] = t;
                                        },
                                      });
                                    }),
                                      Object.defineProperties(t, a);
                                  }
                                  null === (n = r.onLaunch) ||
                                    void 0 === n ||
                                    n.call(r, e);
                                }
                                O("onLaunch", e);
                              });
                          },
                        })
                      ),
                      I,
                      p({
                        value: function (e) {
                          g(e),
                            S(function () {
                              var t,
                                n = C();
                              null ===
                                (t = null == n ? void 0 : n.componentDidShow) ||
                                void 0 === t ||
                                t.call(n, e),
                                O("onShow", e);
                            });
                        },
                      })
                    ),
                    A,
                    p({
                      value: function () {
                        S(function () {
                          var e,
                            t = C();
                          null ===
                            (e = null == t ? void 0 : t.componentDidHide) ||
                            void 0 === e ||
                            e.call(t),
                            O("onHide");
                        });
                      },
                    })
                  ),
                  "onError",
                  p({
                    value: function (e) {
                      S(function () {
                        var t,
                          n = C();
                        null === (t = null == n ? void 0 : n.onError) ||
                          void 0 === t ||
                          t.call(n, e),
                          O("onError", e);
                      });
                    },
                  })
                ),
                "onUnhandledRejection",
                p({
                  value: function (e) {
                    S(function () {
                      var t,
                        n = C();
                      null ===
                        (t = null == n ? void 0 : n.onUnhandledRejection) ||
                        void 0 === t ||
                        t.call(n, e),
                        O("onUnhandledRejection", e);
                    });
                  },
                })
              ),
              "onPageNotFound",
              p({
                value: function (e) {
                  S(function () {
                    var t,
                      n = C();
                    null === (t = null == n ? void 0 : n.onPageNotFound) ||
                      void 0 === t ||
                      t.call(n, e),
                      O("onPageNotFound", e);
                  });
                },
              })
            )
          );
        function O(e) {
          for (
            var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1;
            r < t;
            r++
          )
            n[r - 1] = arguments[r];
          var i = (0, d.getPageInstance)(h);
          if (i) {
            var o = C(),
              a = l.PT.call("getLifecycle", i, e);
            Array.isArray(a) &&
              a.forEach(function (e) {
                return e.apply(o, n);
              });
          }
        }
        return (d.Current.app = N), N;
      }
      (0, d.incrementId)(),
        l.PT.tap("initNativeApi", function (e) {
          for (var t in U) e[t] = U[t];
        });
    },
    71515: function (e, t, n) {
      "use strict";
      n.d(t, {
        $o: function () {
          return f;
        },
        Ee: function () {
          return k;
        },
        G7: function () {
          return r;
        },
        Gt: function () {
          return g;
        },
        Ho: function () {
          return i;
        },
        II: function () {
          return s;
        },
        Nf: function () {
          return d;
        },
        Xz: function () {
          return T;
        },
        __: function () {
          return c;
        },
        cW: function () {
          return l;
        },
        fV: function () {
          return C;
        },
        gx: function () {
          return v;
        },
        kh: function () {
          return E;
        },
        l0: function () {
          return u;
        },
        nk: function () {
          return w;
        },
        pf: function () {
          return m;
        },
        rs: function () {
          return h;
        },
        t3: function () {
          return y;
        },
        tq: function () {
          return b;
        },
        ub: function () {
          return p;
        },
        xv: function () {
          return o;
        },
        zx: function () {
          return a;
        },
      });
      var r = "view",
        i = "rich-text",
        o = "text",
        a = "button",
        u = "form",
        s = "input",
        c = "label",
        l = "picker",
        d = "picker-view",
        f = "picker-view-column",
        h = "switch",
        v = "textarea",
        p = "movable-area",
        g = "movable-view",
        m = "scroll-view",
        b = "swiper",
        y = "swiper-item",
        k = "image",
        w = "video",
        T = "canvas",
        E = "web-view",
        C = "custom-wrapper";
    },
    17488: function (e, t, n) {
      "use strict";
      var r = n(4942),
        i = n(74455),
        o = new Set([
          "addFileToFavorites",
          "addVideoToFavorites",
          "authPrivateMessage",
          "checkIsAddedToMyMiniProgram",
          "chooseContact",
          "cropImage",
          "disableAlertBeforeUnload",
          "editImage",
          "enableAlertBeforeUnload",
          "getBackgroundFetchData",
          "getChannelsLiveInfo",
          "getChannelsLiveNoticeInfo",
          "getFuzzyLocation",
          "getGroupEnterInfo",
          "getLocalIPAddress",
          "getShareInfo",
          "getUserProfile",
          "getWeRunData",
          "join1v1Chat",
          "openChannelsActivity",
          "openChannelsEvent",
          "openChannelsLive",
          "openChannelsUserProfile",
          "openCustomerServiceChat",
          "openVideoEditor",
          "saveFileToDisk",
          "scanItem",
          "setEnable1v1Chat",
          "setWindowSize",
          "sendBizRedPacket",
          "startFacialRecognitionVerify",
        ]),
        a = "true",
        u = "false",
        s = "",
        c = "0",
        l = {
          Progress: {
            "border-radius": c,
            "font-size": "16",
            duration: "30",
            bindActiveEnd: s,
          },
          RichText: { space: s, "user-select": u },
          Text: { "user-select": u },
          Map: {
            polygons: "[]",
            subkey: s,
            rotate: c,
            skew: c,
            "max-scale": "20",
            "min-scale": "3",
            "enable-3D": u,
            "show-compass": u,
            "show-scale": u,
            "enable-overlooking": u,
            "enable-auto-max-overlooking": u,
            "enable-zoom": a,
            "enable-scroll": a,
            "enable-rotate": u,
            "enable-satellite": u,
            "enable-traffic": u,
            "enable-poi": a,
            "enable-building": a,
            setting: "[]",
            bindLabelTap: s,
            bindRegionChange: s,
            bindPoiTap: s,
            bindPolylineTap: s,
            bindAbilitySuccess: s,
            bindAbilityFailed: s,
            bindAuthSuccess: s,
            bindInterpolatePoint: s,
            bindError: s,
            bindAnchorPointTap: s,
          },
          Button: {
            lang: "en",
            "session-from": s,
            "send-message-title": s,
            "send-message-path": s,
            "send-message-img": s,
            "app-parameter": s,
            "show-message-card": u,
            "business-id": s,
            bindGetUserInfo: s,
            bindContact: s,
            bindGetPhoneNumber: s,
            bindGetRealTimePhoneNumber: s,
            bindChooseAvatar: s,
            bindError: s,
            bindOpenSetting: s,
            bindLaunchApp: s,
            bindAgreePrivacyAuthorization: s,
          },
          Form: { "report-submit-timeout": c },
          Input: {
            "always-embed": u,
            "adjust-position": a,
            "hold-keyboard": u,
            "safe-password-cert-path": "",
            "safe-password-length": "",
            "safe-password-time-stamp": "",
            "safe-password-nonce": "",
            "safe-password-salt": "",
            "safe-password-custom-hash": "",
            "auto-fill": s,
            bindKeyboardHeightChange: s,
            bindNicknameReview: s,
          },
          Picker: { "header-text": s, level: "region" },
          PickerView: {
            "immediate-change": u,
            bindPickStart: s,
            bindPickEnd: s,
          },
          Slider: { color: "'#e9e9e9'", "selected-color": "'#1aad19'" },
          Textarea: {
            "show-confirm-bar": a,
            "adjust-position": a,
            "hold-keyboard": u,
            "disable-default-padding": u,
            "confirm-type": "'return'",
            "confirm-hold": u,
            bindKeyboardHeightChange: s,
          },
          ScrollView: {
            "enable-flex": u,
            "scroll-anchoring": u,
            enhanced: u,
            "using-sticky": u,
            "paging-enabled": u,
            "enable-passive": u,
            "refresher-enabled": u,
            "refresher-threshold": "45",
            "refresher-default-style": "'black'",
            "refresher-background": "'#FFF'",
            "refresher-triggered": u,
            bounces: a,
            "show-scrollbar": a,
            "fast-deceleration": u,
            type: "'list'",
            reverse: u,
            clip: a,
            "enable-back-to-top": u,
            "cache-extent": s,
            "min-drag-distance": "18",
            "scroll-into-view-within-extent": u,
            "scroll-into-view-alignment": "'start'",
            padding: "[0,0,0,0]",
            "refresher-two-level-enabled": u,
            "refresher-two-level-triggered": u,
            "refresher-two-level-threshold": "150",
            "refresher-two-level-close-threshold": "80",
            "refresher-two-level-scroll-enabled": u,
            "refresher-ballistic-refresh-enabled": u,
            "refresher-two-level-pinned": u,
            bindDragStart: s,
            bindDragging: s,
            bindDragEnd: s,
            bindRefresherPulling: s,
            bindRefresherRefresh: s,
            bindRefresherRestore: s,
            bindRefresherAbort: s,
            bindScrollStart: s,
            bindScrollEnd: s,
            bindRefresherWillRefresh: s,
            bindRefresherStatusChange: s,
          },
          StickySection: { "push-pinned-header": a },
          GridView: {
            type: "'aligned'",
            "cross-axis-count": "2",
            "max-cross-axis-extent": c,
            "main-axis-gap": c,
            "cross-axis-gap": c,
          },
          ListView: {},
          StickyHeader: {},
          Swiper: { "snap-to-edge": u, "easing-function": "'default'" },
          SwiperItem: { "skip-hidden-item-layout": u },
          Navigator: {
            target: "'self'",
            "app-id": s,
            path: s,
            "extra-data": s,
            version: "'version'",
          },
          Camera: {
            mode: "'normal'",
            resolution: "'medium'",
            "frame-size": "'medium'",
            bindInitDone: s,
            bindScanCode: s,
          },
          Image: { webp: u, "show-menu-by-longpress": u },
          LivePlayer: {
            mode: "'live'",
            "sound-mode": "'speaker'",
            "auto-pause-if-navigate": a,
            "auto-pause-if-open-native": a,
            "picture-in-picture-mode": "[]",
            "enable-auto-rotation": u,
            "referrer-policy": "'no-referrer'",
            "enable-casting": u,
            bindstatechange: s,
            bindfullscreenchange: s,
            bindnetstatus: s,
            bindAudioVolumeNotify: s,
            bindEnterPictureInPicture: s,
            bindLeavePictureInPicture: s,
            bindCastingUserSelect: s,
            bindCastingStateChange: s,
            bindCastingInterrupt: s,
          },
          Video: {
            title: s,
            "play-btn-position": "'bottom'",
            "enable-play-gesture": u,
            "auto-pause-if-navigate": a,
            "auto-pause-if-open-native": a,
            "vslide-gesture": u,
            "vslide-gesture-in-fullscreen": a,
            "show-bottom-progress": a,
            "ad-unit-id": s,
            "poster-for-crawler": s,
            "show-casting-button": u,
            "picture-in-picture-mode": "[]",
            "enable-auto-rotation": u,
            "show-screen-lock-button": u,
            "show-snapshot-button": u,
            "show-background-playback-button": u,
            "background-poster": s,
            "referrer-policy": "'no-referrer'",
            "is-drm": u,
            "is-live": u,
            "provision-url": s,
            "certificate-url": s,
            "license-url": s,
            "preferred-peak-bit-rate": s,
            bindProgress: s,
            bindLoadedMetadata: s,
            bindControlsToggle: s,
            bindEnterPictureInPicture: s,
            bindLeavePictureInPicture: s,
            bindSeekComplete: s,
            bindCastingUserSelect: s,
            bindCastingStateChange: s,
            bindCastingInterrupt: s,
            bindAdLoad: s,
            bindAdError: s,
            bindAdClose: s,
            bindAdPlay: s,
          },
          Canvas: { type: s },
          Ad: { "ad-type": "'banner'", "ad-theme": "'white'" },
          CoverView: { "marker-id": s, slot: s },
          Editor: {
            "read-only": u,
            placeholder: s,
            "show-img-size": u,
            "show-img-toolbar": u,
            "show-img-resize": u,
            focus: u,
            bindReady: s,
            bindFocus: s,
            bindBlur: s,
            bindInput: s,
            bindStatusChange: s,
            name: s,
          },
          MatchMedia: {
            "min-width": s,
            "max-width": s,
            width: s,
            "min-height": s,
            "max-height": s,
            height: s,
            orientation: s,
          },
          FunctionalPageNavigator: {
            version: "'release'",
            name: s,
            args: s,
            bindSuccess: s,
            bindFail: s,
            bindCancel: s,
          },
          LivePusher: {
            url: s,
            mode: "'RTC'",
            autopush: u,
            muted: u,
            "enable-camera": a,
            "auto-focus": a,
            orientation: "'vertical'",
            beauty: c,
            whiteness: c,
            aspect: "'9:16'",
            "min-bitrate": "200",
            "max-bitrate": "1000",
            "audio-quality": "'high'",
            "waiting-image": s,
            "waiting-image-hash": s,
            zoom: u,
            "device-position": "'front'",
            "background-mute": u,
            mirror: u,
            "remote-mirror": u,
            "local-mirror": u,
            "audio-reverb-type": c,
            "enable-mic": a,
            "enable-agc": u,
            "enable-ans": u,
            "audio-volume-type": "'voicecall'",
            "video-width": "360",
            "video-height": "640",
            "beauty-style": "'smooth'",
            filter: "'standard'",
            "picture-in-picture-mode": "[]",
            animation: s,
            bindStateChange: s,
            bindNetStatus: s,
            bindBgmStart: s,
            bindBgmProgress: s,
            bindBgmComplete: s,
            bindAudioVolumeNotify: s,
          },
          OfficialAccount: { bindLoad: s, bindError: s },
          OpenData: {
            type: s,
            "open-gid": s,
            lang: "'en'",
            "default-text": s,
            "default-avatar": s,
            bindError: s,
          },
          NavigationBar: {
            title: s,
            loading: u,
            "front-color": "'#000000'",
            "background-color": s,
            "color-animation-duration": c,
            "color-animation-timing-func": "'linear'",
          },
          PageMeta: {
            "background-text-style": s,
            "background-color": s,
            "background-color-top": s,
            "background-color-bottom": s,
            "root-background-color": s,
            "scroll-top": "''",
            "scroll-duration": "300",
            "page-style": "''",
            "root-font-size": "''",
            "page-orientation": "''",
            bindResize: s,
            bindScroll: s,
            bindScrollDone: s,
          },
          VoipRoom: {
            openid: s,
            mode: "'camera'",
            "device-position": "'front'",
            bindError: s,
          },
          AdCustom: {
            "unit-id": s,
            "ad-intervals": s,
            bindLoad: s,
            bindError: s,
          },
          PageContainer: {
            show: u,
            duration: "300",
            "z-index": "100",
            overlay: a,
            position: "'bottom'",
            round: u,
            "close-on-slide-down": u,
            "overlay-style": s,
            "custom-style": s,
            bindBeforeEnter: s,
            bindEnter: s,
            bindAfterEnter: s,
            bindBeforeLeave: s,
            bindLeave: s,
            bindAfterLeave: s,
            bindClickOverlay: s,
          },
          ShareElement: {
            mapkey: s,
            transform: u,
            duration: "300",
            "easing-function": "'ease-out'",
          },
          KeyboardAccessory: {},
          RootPortal: { enable: a },
          ChannelLive: { "feed-id": s, "finder-user-name": s },
          ChannelVideo: {
            "feed-id": s,
            "finder-user-name": s,
            "feed-token": s,
            autoplay: u,
            loop: u,
            muted: u,
            "object-fit": "'contain'",
            bindError: s,
          },
          Snapshot: {},
        },
        d = {
          initNativeApi: function (e) {
            (0, i.Ig)(e, wx, {
              needPromiseApis: o,
              modifyApis: function (e) {
                e.delete("lanDebug");
              },
              transformMeta: function (e, t) {
                var n;
                return (
                  "showShareMenu" === e &&
                    (t.menus =
                      null === (n = t.showShareItems) || void 0 === n
                        ? void 0
                        : n.map(function (e) {
                            return "wechatFriends" === e
                              ? "shareAppMessage"
                              : "wechatMoment" === e
                              ? "shareTimeline"
                              : e;
                          })),
                  { key: e, options: t }
                );
              },
            }),
              (e.cloud = wx.cloud),
              (e.getTabBar = function (e) {
                var t;
                if ("function" == typeof (null == e ? void 0 : e.getTabBar))
                  return null === (t = e.getTabBar()) || void 0 === t
                    ? void 0
                    : t.$taroInstances;
              }),
              (e.getRenderer = function () {
                var t, n, r;
                return null !==
                  (r =
                    null ===
                      (n =
                        null === (t = e.getCurrentInstance()) || void 0 === t
                          ? void 0
                          : t.page) || void 0 === n
                      ? void 0
                      : n.renderer) && void 0 !== r
                  ? r
                  : "webview";
              });
          },
          getMiniLifecycle: function (e) {
            var t = e.page[5];
            return (
              -1 === t.indexOf("onSaveExitState") && t.push("onSaveExitState"),
              e
            );
          },
          transferHydrateData: function (e, t, n) {
            var o;
            if (t.isTransferElement) {
              var a = getCurrentPages()[0];
              return (
                (e.nn = t.dataName),
                a.setData((0, r.Z)({}, (0, i.CA)(e.nn), e)),
                (0, r.Z)(
                  (0, r.Z)({ sid: t.sid }, "v", ""),
                  "nn",
                  (null === (o = n["#text"]) || void 0 === o
                    ? void 0
                    : o._num) || "8"
                )
              );
            }
          },
        };
      (0, i.xi)(d), (0, i.ku)(l);
    },
    88967: function (e, t, n) {
      "use strict";
      n.d(t, {
        ZP: function () {
          return G;
        },
        mm: function () {
          return V;
        },
        sY: function () {
          return F;
        },
      });
      var r = n(15671),
        i = n(43144),
        o = n(4942),
        a = n(29439),
        u = n(71002),
        s = n(74455),
        c = n(32180),
        l = n(76525),
        d = n.n(l),
        f = n(32576),
        h = {
          color: !0,
          date: !0,
          datetime: !0,
          "datetime-local": !0,
          email: !0,
          month: !0,
          number: !0,
          password: !0,
          range: !0,
          search: !0,
          tel: !0,
          text: !0,
          time: !0,
          url: !0,
          week: !0,
        };
      function v(e) {
        switch (e) {
          case "cancel":
          case "click":
          case "close":
          case "contextmenu":
          case "copy":
          case "cut":
          case "dragend":
          case "dragstart":
          case "drop":
          case "input":
          case "paste":
          case "pause":
          case "play":
          case "pointercancel":
          case "pointerdown":
          case "pointerup":
          case "reset":
          case "resize":
          case "submit":
          case "touchcancel":
          case "touchend":
          case "touchstart":
          case "change":
          case "blur":
          case "focus":
          case "select":
          case "selectstart":
            return 1;
          case "drag":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "scroll":
          case "toggle":
          case "touchmove":
          case "pointerenter":
          case "pointerleave":
            return 4;
          default:
            return 16;
        }
      }
      var p = Math.random().toString(36).slice(2),
        g = "__reactProps$" + p,
        m = "__reactFiber$" + p,
        b = "__reactContainer$" + p;
      function y(e, t) {
        t[m] = e;
      }
      function k(e, t) {
        t[b] = e;
      }
      function w(e) {
        var t = e[m] || e[b];
        return !t || (5 !== t.tag && 6 !== t.tag && 13 !== t.tag && 3 !== t.tag)
          ? null
          : t;
      }
      function T(e, t) {
        e[g] = t;
      }
      function E(e) {
        return "" + e;
      }
      function C(e, t, n) {
        !(function (e, t, n) {
          var r =
            arguments.length > 3 && void 0 !== arguments[3]
              ? arguments[3]
              : "string";
          null != n
            ? "number" === r
              ? ((0 === n && "" === e.value) || t != n) && (e.value = E(n))
              : t !== E(n) && (e.value = E(n))
            : ("submit" !== r && "reset" !== r) || e.removeAttribute("value");
        })(
          e,
          t,
          (function (e) {
            return "function" == typeof e || "symbol" === (0, u.Z)(e) ? "" : e;
          })(n.value),
          n.type
        );
      }
      var S = C,
        _ = function (e, t, n) {
          var r = e;
          null == n.checked
            ? (C(e, t, n),
              (function (e, t) {
                var n = t.name;
                "radio" === t.type &&
                  null != n &&
                  console.warn("radio updateNamedCousins 未实现", e, t);
              })(e, n))
            : console.warn("updateCheck 未实现", r);
        };
      function P(e) {
        return e._valueTracker;
      }
      function x(e) {
        P(e) ||
          (e._valueTracker = (function (e) {
            var t = (function (e) {
                var t = e.type,
                  n = e.nodeName;
                return (
                  n &&
                  "input" === n.toLowerCase() &&
                  ("checkbox" === t || "radio" === t)
                );
              })(e)
                ? "checked"
                : "value",
              n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
              r = "" + e[t];
            if (
              !e.hasOwnProperty(t) &&
              void 0 !== n &&
              "function" == typeof n.get &&
              "function" == typeof n.set
            ) {
              var i = n.get,
                o = n.set;
              return (
                Object.defineProperty(e, t, {
                  configurable: !0,
                  enumerable: n.enumerable,
                  get: function () {
                    return i.call(this);
                  },
                  set: function (e) {
                    (r = "" + e), o.call(this, e);
                  },
                }),
                {
                  getValue: function () {
                    return r;
                  },
                  setValue: function (e) {
                    r = "" + e;
                  },
                  stopTracking: function () {
                    (function (e) {
                      e._valueTracker = null;
                    })(e),
                      delete e[t];
                  },
                }
              );
            }
          })(e));
      }
      var I =
        /aspect|acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
      function A(e, t, n) {
        for (var r = 0; r < n.length; r += 2) {
          var i = n[r];
          L(e, i, n[r + 1], t[i]);
        }
      }
      function N(e, t, n) {
        var r,
          i = null;
        for (r in t) r in n || (i = i || []).push(r, null);
        var o = e instanceof c.FormElement;
        for (r in n)
          (t[r] !== n[r] || (o && "value" === r)) &&
            (i = i || []).push(r, n[r]);
        return i;
      }
      function O(e, t, n) {
        "-" !== t[0]
          ? (e[t] =
              (0, s.hj)(n) && !1 === I.test(t) ? n + "px" : null == n ? "" : n)
          : e.setProperty(t, n.toString());
      }
      function L(e, t, n, r) {
        var i, o;
        if (
          "key" === (t = "className" === t ? "class" : t) ||
          "children" === t ||
          "ref" === t
        );
        else if ("style" === t) {
          var a = e.style;
          if ((0, s.HD)(n)) a.cssText = n;
          else {
            if (((0, s.HD)(r) && ((a.cssText = ""), (r = null)), (0, s.Kn)(r)))
              for (var u in r) (n && u in n) || O(a, u, "");
            if ((0, s.Kn)(n))
              for (var c in n) (r && n[c] === r[c]) || O(a, c, n[c]);
          }
        } else if (
          (function (e) {
            return "o" === e[0] && "n" === e[1];
          })(t)
        )
          !(function (e, t, n, r) {
            var i = t.endsWith("Capture"),
              o = t.toLowerCase().slice(2);
            i && (o = o.slice(0, -7));
            var a = (0, s.kC)((0, s.CA)(e.tagName.toLowerCase()));
            "click" === o && a in s.rD && (o = "tap"),
              (0, s.mf)(n)
                ? r
                  ? (e.removeEventListener(o, r, !1),
                    e.addEventListener(o, n, { isCapture: i, sideEffect: !1 }))
                  : e.addEventListener(o, n, i)
                : e.removeEventListener(o, r);
          })(e, t, n, r);
        else if ("dangerouslySetInnerHTML" === t) {
          var l =
              null !== (i = null == n ? void 0 : n.__html) && void 0 !== i
                ? i
                : "",
            d =
              null !== (o = null == r ? void 0 : r.__html) && void 0 !== o
                ? o
                : "";
          (l || d) && d !== l && (e.innerHTML = l);
        } else
          (0, s.mf)(n) ||
            (null == n ? e.removeAttribute(t) : e.setAttribute(t, n));
      }
      var R = {
          getPublicInstance: function (e) {
            return e;
          },
          getRootHostContext: function () {
            return {};
          },
          getChildHostContext: function (e) {
            return e;
          },
          prepareForCommit: function () {
            return null;
          },
          resetAfterCommit: s.ZT,
          createInstance: function (e, t, n, r, i) {
            var o = c.document.createElement(e);
            return y(i, o), T(o, t), o;
          },
          appendInitialChild: function (e, t) {
            e.appendChild(t);
          },
          finalizeInitialChildren: function (e, t, n) {
            var r = n;
            if (e instanceof c.FormElement) {
              var i = ["switch", "checkbox", "radio"].includes(t)
                  ? ["checked", "defaultChecked"]
                  : ["value", "defaultValue"],
                u = (0, a.Z)(i, 2),
                s = u[0],
                l = u[1];
              n.hasOwnProperty(l) &&
                delete (r = Object.assign(
                  Object.assign({}, r),
                  (0, o.Z)({}, s, n[l])
                ))[l];
            }
            return (
              (function (e, t, n) {
                var r = N(e, t, n);
                r && A(e, t, r);
              })(e, {}, r),
              ("input" !== t && "textarea" !== t) || x(e),
              !1
            );
          },
          prepareUpdate: function (e, t, n, r) {
            return N(e, n, r);
          },
          shouldSetTextContent: function () {
            return !1;
          },
          createTextInstance: function (e, t, n, r) {
            var i = c.document.createTextNode(e);
            return y(r, i), i;
          },
          scheduleTimeout: setTimeout,
          cancelTimeout: clearTimeout,
          noTimeout: -1,
          isPrimaryRenderer: !0,
          warnsIfNotActing: !0,
          supportsMutation: !0,
          supportsPersistence: !1,
          supportsHydration: !1,
          getInstanceFromNode: function () {
            return null;
          },
          beforeActiveInstanceBlur: s.ZT,
          afterActiveInstanceBlur: s.ZT,
          preparePortalMount: s.ZT,
          prepareScopeUpdate: s.ZT,
          getInstanceFromScope: function () {
            return null;
          },
          getCurrentEventPriority: function () {
            return f.DefaultEventPriority;
          },
          detachDeletedInstance: s.ZT,
          supportsMicrotasks: !0,
          scheduleMicrotask: (0, s.o8)(Promise)
            ? setTimeout
            : function (e) {
                return Promise.resolve(null)
                  .then(e)
                  .catch(function (e) {
                    setTimeout(function () {
                      throw e;
                    });
                  });
              },
          appendChild: function (e, t) {
            e.appendChild(t);
          },
          appendChildToContainer: function (e, t) {
            e.appendChild(t);
          },
          commitTextUpdate: function (e, t, n) {
            e.nodeValue = n;
          },
          commitMount: s.ZT,
          commitUpdate: function (e, t, n, r, i) {
            A(e, r, t), T(e, i);
          },
          insertBefore: function (e, t, n) {
            e.insertBefore(t, n);
          },
          insertInContainerBefore: function (e, t, n) {
            e.insertBefore(t, n);
          },
          removeChild: function (e, t) {
            e.removeChild(t);
          },
          removeChildFromContainer: function (e, t) {
            e.removeChild(t);
          },
          resetTextContent: s.ZT,
          hideInstance: function (e) {
            e.style.setProperty("display", "none");
          },
          hideTextInstance: function (e) {
            e.nodeValue = "";
          },
          unhideInstance: function (e, t) {
            var n = t.style,
              r = (null == n ? void 0 : n.hasOwnProperty("display"))
                ? n.display
                : null;
            (r = null == r || (0, s.jn)(r) || "" === r ? "" : ("" + r).trim()),
              (e.style.display = r);
          },
          unhideTextInstance: function (e, t) {
            e.nodeValue = t;
          },
          clearContainer: function (e) {
            e.childNodes.length > 0 && (e.textContent = "");
          },
        },
        Z = d()(R),
        B = null;
      function D(e, t) {
        var n,
          r,
          i = w(t),
          o = e.type;
        if (
          i &&
          (function (e) {
            var t = e && e.nodeName && e.nodeName.toLowerCase();
            if ("input" === t) {
              var n = e.type;
              return !n || !!h[n];
            }
            return "textarea" === t;
          })(t) &&
          ("input" === o || "change" === o)
        )
          return (function (e, t) {
            var n = (function (e) {
              if (5 === e.tag || 6 === e.tag) return e.stateNode;
            })(e);
            return (
              !!n &&
              ((function (e, t) {
                if (!e) return !1;
                var n = P(e);
                return !n || (t !== n.getValue() && (n.setValue(t), !0));
              })(n, t)
                ? e
                : void 0)
            );
          })(
            i,
            E(
              null ===
                (r =
                  null === (n = e.mpEvent) || void 0 === n
                    ? void 0
                    : n.detail) || void 0 === r
                ? void 0
                : r.value
            )
          );
      }
      function M(e) {
        B ? B.push(e) : (B = [e]);
      }
      function j() {
        null !== B &&
          (Z.flushSync(),
          (function () {
            if (B) {
              var e = B;
              B = null;
              for (var t = 0; t < e.length; t++) H(e[t]);
            }
          })());
      }
      function H(e) {
        var t = w(e.target);
        if (t) {
          var n = t.stateNode,
            r = t.type;
          if (n) {
            var i = (function (e) {
              return e[g] || null;
            })(n);
            !(function (e, t, n, r) {
              switch (t) {
                case "input":
                  _(e, n, r);
                  break;
                case "textarea":
                  S(e, n, r);
              }
            })(n, r, e.value, i);
          }
        }
      }
      var U = new WeakMap(),
        Q = (0, i.Z)(
          function e(t, n, i) {
            (0, r.Z)(this, e),
              (this.renderer = t),
              this.initInternalRoot(t, n, i);
          },
          [
            {
              key: "initInternalRoot",
              value: function (e, t, n) {
                var r = t;
                if (n) {
                  var i = !1,
                    o = "",
                    a = function (e) {
                      return console.error(e);
                    },
                    u = null;
                  !0 === n.unstable_strictMode && (i = !0),
                    void 0 !== n.identifierPrefix && (o = n.identifierPrefix),
                    void 0 !== n.onRecoverableError &&
                      (a = n.onRecoverableError),
                    void 0 !== n.unstable_transitionCallbacks &&
                      (u = n.unstable_transitionCallbacks),
                    (this.internalRoot = e.createContainer(
                      r,
                      1,
                      null,
                      i,
                      !1,
                      o,
                      a,
                      u
                    ));
                } else
                  this.internalRoot = e.createContainer(
                    r,
                    0,
                    null,
                    !1,
                    !1,
                    "",
                    function () {},
                    null
                  );
              },
            },
            {
              key: "render",
              value: function (e, t) {
                var n = this.renderer,
                  r = this.internalRoot;
                return (
                  n.updateContainer(e, r, null, t), n.getPublicRootInstance(r)
                );
              },
            },
            {
              key: "unmount",
              value: function (e) {
                this.renderer.updateContainer(null, this.internalRoot, null, e);
              },
            },
          ]
        );
      function F(e, t, n) {
        var r = U.get(t);
        if (null != r) return r.render(e, n);
        var i = new Q(Z, t);
        return U.set(t, i), i.render(e, n);
      }
      var W = !1,
        V = function (e, t) {
          if (W) return e(t);
          W = !0;
          try {
            return Z.batchedUpdates(e, t);
          } finally {
            (W = !1), j();
          }
        },
        z =
          (0, s.mf)(Symbol) && Symbol.for ? Symbol.for("react.portal") : 60106,
        G = {
          render: F,
          createRoot: function (e) {
            var t,
              n =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : {},
              r = U.get(e);
            if (null != r) return r;
            var i = new Q(Z, e, n);
            return (
              U.set(e, i),
              k(
                null === (t = null == i ? void 0 : i.internalRoot) ||
                  void 0 === t
                  ? void 0
                  : t.current,
                e
              ),
              s.PT.tap("dispatchTaroEvent", function (e, t) {
                var n = v(e.type);
                Z.runWithPriority(n, function () {
                  t.dispatchEvent(e);
                });
              }),
              s.PT.tap("modifyTaroEvent", function (e, t) {
                var n, r;
                D(e, t) &&
                  M({
                    target: t,
                    value:
                      null ===
                        (r =
                          null === (n = e.mpEvent) || void 0 === n
                            ? void 0
                            : n.detail) || void 0 === r
                        ? void 0
                        : r.value,
                  });
              }),
              i
            );
          },
          unstable_batchedUpdates: V,
          unmountComponentAtNode: function (e) {
            (0, s.zx)(
              e && [1, 8, 9, 11].includes(e.nodeType),
              "unmountComponentAtNode(...): Target container is not a DOM element."
            );
            var t = U.get(e);
            return (
              !!t &&
              (V(function () {
                t.unmount(function () {
                  U.delete(e);
                });
              }, null),
              !0)
            );
          },
          findDOMNode: function (e) {
            if (null == e) return null;
            var t = e.nodeType;
            return 1 === t || 3 === t ? e : Z.findHostInstance(e);
          },
          createPortal: function (e, t, n) {
            return {
              $$typeof: z,
              key: null == n ? null : String(n),
              children: e,
              containerInfo: t,
              implementation: null,
            };
          },
        };
    },
    32180: function (e, t, n) {
      "use strict";
      n.r(t),
        n.d(t, {
          A: function () {
            return ve;
          },
          APP: function () {
            return x;
          },
          BEHAVIORS: function () {
            return he;
          },
          BODY: function () {
            return P;
          },
          CATCHMOVE: function () {
            return re;
          },
          CATCH_VIEW: function () {
            return ie;
          },
          CHANGE: function () {
            return V;
          },
          CLASS: function () {
            return R;
          },
          COMMENT: function () {
            return oe;
          },
          COMPILE_MODE: function () {
            return ne;
          },
          CONFIRM: function () {
            return $;
          },
          CONTAINER: function () {
            return I;
          },
          CONTEXT_ACTIONS: function () {
            return r;
          },
          CURRENT_TARGET: function () {
            return Y;
          },
          CUSTOM_WRAPPER: function () {
            return z;
          },
          Current: function () {
            return Qn;
          },
          DATASET: function () {
            return U;
          },
          DATE: function () {
            return ee;
          },
          DOCUMENT_ELEMENT_NAME: function () {
            return A;
          },
          DOCUMENT_FRAGMENT: function () {
            return N;
          },
          EVENT_CALLBACK_RESULT: function () {
            return fe;
          },
          EXTERNAL_CLASSES: function () {
            return de;
          },
          Events: function () {
            return p.zW;
          },
          FOCUS: function () {
            return B;
          },
          FormElement: function () {
            return Vt;
          },
          HEAD: function () {
            return _;
          },
          HOOKS_APP_ID: function () {
            return w;
          },
          HTML: function () {
            return S;
          },
          History: function () {
            return Un;
          },
          ID: function () {
            return O;
          },
          INPUT: function () {
            return W;
          },
          KEY_CODE: function () {
            return J;
          },
          Location: function () {
            return Yn;
          },
          MutationObserver: function () {
            return ke;
          },
          OBJECT: function () {
            return Q;
          },
          ON_HIDE: function () {
            return ce;
          },
          ON_LOAD: function () {
            return ae;
          },
          ON_READY: function () {
            return ue;
          },
          ON_SHOW: function () {
            return se;
          },
          OPTIONS: function () {
            return le;
          },
          PAGE_INIT: function () {
            return E;
          },
          PROPERTY_THRESHOLD: function () {
            return y;
          },
          PROPS: function () {
            return H;
          },
          PURE_VIEW: function () {
            return j;
          },
          ROOT_STR: function () {
            return C;
          },
          SET_DATA: function () {
            return T;
          },
          SET_TIMEOUT: function () {
            return te;
          },
          STATIC_VIEW: function () {
            return M;
          },
          STYLE: function () {
            return Z;
          },
          SVGElement: function () {
            return ir;
          },
          Style: function () {
            return at;
          },
          TARGET: function () {
            return G;
          },
          TARO_RUNTIME: function () {
            return k;
          },
          TIME_STAMP: function () {
            return K;
          },
          TOUCHMOVE: function () {
            return X;
          },
          TYPE: function () {
            return q;
          },
          TaroElement: function () {
            return lt;
          },
          TaroEvent: function () {
            return Ht;
          },
          TaroNode: function () {
            return Me;
          },
          TaroRootElement: function () {
            return $t;
          },
          TaroText: function () {
            return Kt;
          },
          UID: function () {
            return L;
          },
          URL: function () {
            return pn;
          },
          URLSearchParams: function () {
            return hn;
          },
          VALUE: function () {
            return F;
          },
          VIEW: function () {
            return D;
          },
          addLeadingSlash: function () {
            return or;
          },
          cancelAnimationFrame: function () {
            return Xn;
          },
          createComponentConfig: function () {
            return Cr;
          },
          createEvent: function () {
            return Ut;
          },
          createPageConfig: function () {
            return Er;
          },
          createRecursiveComponentConfig: function () {
            return Sr;
          },
          document: function () {
            return _n;
          },
          env: function () {
            return Re;
          },
          eventCenter: function () {
            return xn;
          },
          eventHandler: function () {
            return Wt;
          },
          eventSource: function () {
            return Le;
          },
          getComputedStyle: function () {
            return Pn;
          },
          getCurrentInstance: function () {
            return Fn;
          },
          getCurrentPage: function () {
            return dr;
          },
          getHomePage: function () {
            return lr;
          },
          getOnHideEventKey: function () {
            return Tr;
          },
          getOnReadyEventKey: function () {
            return kr;
          },
          getOnShowEventKey: function () {
            return wr;
          },
          getPageInstance: function () {
            return pr;
          },
          getPath: function () {
            return yr;
          },
          handlePolyfill: function () {
            return Pr;
          },
          hasBasename: function () {
            return ar;
          },
          history: function () {
            return rr;
          },
          hooks: function () {
            return p.PT;
          },
          hydrate: function () {
            return Ze;
          },
          incrementId: function () {
            return we;
          },
          injectPageInstance: function () {
            return vr;
          },
          isHasExtractProp: function () {
            return Ce;
          },
          location: function () {
            return nr;
          },
          navigator: function () {
            return $n;
          },
          nextTick: function () {
            return _r;
          },
          now: function () {
            return Gn;
          },
          options: function () {
            return dt;
          },
          parseUrl: function () {
            return gn;
          },
          removePageInstance: function () {
            return gr;
          },
          requestAnimationFrame: function () {
            return Jn;
          },
          safeExecute: function () {
            return mr;
          },
          stringify: function () {
            return br;
          },
          stripBasename: function () {
            return ur;
          },
          stripSuffix: function () {
            return cr;
          },
          stripTrailing: function () {
            return sr;
          },
          window: function () {
            return tr;
          },
        });
      var r,
        i = n(29439),
        o = n(9092),
        a = n(21572),
        u = n(84506),
        s = n(4942),
        c = n(58618),
        l = n(60136),
        d = n(98737),
        f = n(93433),
        h = n(15671),
        v = n(43144),
        p = n(74455),
        g = n(97582),
        m = n(32180).requestAnimationFrame,
        b = n(32180).cancelAnimationFrame,
        y = (n(32180).window, n(32180).MutationObserver, 2046),
        k = "Taro runtime",
        w = "taro-app",
        T = "小程序 setData",
        E = "页面初始化",
        C = "root",
        S = "html",
        _ = "head",
        P = "body",
        x = "app",
        I = "container",
        A = "#document",
        N = "document-fragment",
        O = "id",
        L = "uid",
        R = "class",
        Z = "style",
        B = "focus",
        D = "view",
        M = "static-view",
        j = "pure-view",
        H = "props",
        U = "dataset",
        Q = "object",
        F = "value",
        W = "input",
        V = "change",
        z = "custom-wrapper",
        G = "target",
        Y = "currentTarget",
        q = "type",
        $ = "confirm",
        K = "timeStamp",
        J = "keyCode",
        X = "touchmove",
        ee = "Date",
        te = "setTimeout",
        ne = "compileMode",
        re = "catchMove",
        ie = "catch-view",
        oe = "comment",
        ae = "onLoad",
        ue = "onReady",
        se = "onShow",
        ce = "onHide",
        le = "options",
        de = "externalClasses",
        fe = "e_result",
        he = "behaviors",
        ve = "a";
      !(function (e) {
        (e.INIT = "0"), (e.RESTORE = "1"), (e.RECOVER = "2"), (e.DESTORY = "3");
      })(r || (r = {}));
      var pe = [],
        ge = function (e, t) {
          return !!e && e.sid === (null == t ? void 0 : t.sid);
        },
        me = function (e, t) {
          var n = t.characterData,
            r = t.characterDataOldValue,
            i = t.attributes,
            o = t.attributeOldValue,
            a = t.childList;
          switch (e.type) {
            case "characterData":
              return !!n && (r || (e.oldValue = null), !0);
            case "attributes":
              return !!i && (o || (e.oldValue = null), !0);
            case "childList":
              return !!a;
          }
        },
        be = !1;
      function ye(e, t) {
        e.records.push(t),
          be ||
            ((be = !0),
            Promise.resolve().then(function () {
              (be = !1),
                pe.forEach(function (e) {
                  return e.callback(e.takeRecords());
                });
            }));
      }
      var ke = (0, v.Z)(
          function e(t) {
            (0, h.Z)(this, e),
              (this.core = {
                observe: p.ZT,
                disconnect: p.ZT,
                takeRecords: p.ZT,
              });
          },
          [
            {
              key: "observe",
              value: function () {
                var e;
                (e = this.core).observe.apply(e, arguments);
              },
            },
            {
              key: "disconnect",
              value: function () {
                this.core.disconnect();
              },
            },
            {
              key: "takeRecords",
              value: function () {
                return this.core.takeRecords();
              },
            },
          ],
          [
            {
              key: "record",
              value: function (e) {
                !(function (e) {
                  pe.forEach(function (t) {
                    for (var n = t.options, r = e.target; r; r = r.parentNode) {
                      if (ge(t.target, r) && me(e, n)) {
                        ye(t, e);
                        break;
                      }
                      if (!n.subtree) break;
                    }
                  });
                })(e);
              },
            },
          ]
        ),
        we = function () {
          for (var e = [], t = 65; t <= 90; t++) e.push(t);
          for (var n = 97; n <= 122; n++) e.push(n);
          var r = e.length - 1,
            i = [0, 0];
          return function () {
            var t = i.map(function (t) {
                return e[t];
              }),
              n = String.fromCharCode.apply(String, (0, f.Z)(t)),
              o = i.length - 1;
            for (i[o]++; i[o] > r; ) {
              if (((i[o] = 0), (o -= 1) < 0)) {
                i.push(0);
                break;
              }
              i[o]++;
            }
            return n;
          };
        };
      function Te(e) {
        return 1 === e.nodeType;
      }
      function Ee(e) {
        return e.nodeName === oe;
      }
      function Ce(e) {
        var t = Object.keys(e.props).find(function (e) {
          return !(/^(class|style|id)$/.test(e) || e.startsWith("data-"));
        });
        return Boolean(t);
      }
      function Se(e) {
        switch (e) {
          case Z:
            return "st";
          case O:
            return L;
          case R:
            return "cl";
          default:
            return e;
        }
      }
      var _e,
        Pe = new Map();
      function xe(e, t, n) {
        (0, p.mf)(n) && (n = { value: n }),
          Object.defineProperty(
            e.prototype,
            t,
            Object.assign({ configurable: !0, enumerable: !0 }, n)
          );
      }
      function Ie() {
        return _e || (_e = (0, p.W)(p.rD)), _e;
      }
      var Ae,
        Ne,
        Oe = (0, v.Z)(
          function e(t, n) {
            var r = this;
            (0, h.Z)(this, e),
              (this.tokenList = []),
              (this.el = n),
              t
                .trim()
                .split(/\s+/)
                .forEach(function (e) {
                  return r.tokenList.push(e);
                });
          },
          [
            {
              key: "value",
              get: function () {
                return this.toString();
              },
            },
            {
              key: "length",
              get: function () {
                return this.tokenList.length;
              },
            },
            {
              key: "add",
              value: function () {
                var e = 0,
                  t = !1,
                  n = arguments,
                  r = n.length,
                  i = this.tokenList;
                do {
                  var o = n[e];
                  this.checkTokenIsValid(o) &&
                    !~i.indexOf(o) &&
                    (i.push(o), (t = !0));
                } while (++e < r);
                t && this._update();
              },
            },
            {
              key: "remove",
              value: function () {
                var e = 0,
                  t = !1,
                  n = arguments,
                  r = n.length,
                  i = this.tokenList;
                do {
                  var o = n[e] + "";
                  if (this.checkTokenIsValid(o)) {
                    var a = i.indexOf(o);
                    ~i.indexOf(o) && (i.splice(a, 1), (t = !0));
                  }
                } while (++e < r);
                t && this._update();
              },
            },
            {
              key: "contains",
              value: function (e) {
                return (
                  !!this.checkTokenIsValid(e) && !!~this.tokenList.indexOf(e)
                );
              },
            },
            {
              key: "toggle",
              value: function (e, t) {
                var n = this.contains(e),
                  r = n ? !0 !== t && "remove" : !1 !== t && "add";
                return r && this[r](e), !0 === t || !1 === t ? t : !n;
              },
            },
            {
              key: "replace",
              value: function (e, t) {
                if (this.checkTokenIsValid(e) && this.checkTokenIsValid(t)) {
                  var n = this.tokenList.indexOf(e);
                  ~n && (this.tokenList.splice(n, 1, t), this._update());
                }
              },
            },
            {
              key: "toString",
              value: function () {
                return this.tokenList
                  .filter(function (e) {
                    return "" !== e;
                  })
                  .join(" ");
              },
            },
            {
              key: "checkTokenIsValid",
              value: function (e) {
                return "" !== e && !/\s/.test(e);
              },
            },
            {
              key: "_update",
              value: function () {
                this.el.className = this.value;
              },
            },
          ]
        ),
        Le = new ((function (e) {
          function t() {
            return (0, h.Z)(this, t), (0, c.Z)(this, t, arguments);
          }
          return (
            (0, l.Z)(t, e),
            (0, v.Z)(t, [
              {
                key: "removeNode",
                value: function (e) {
                  var t = e.sid,
                    n = e.uid;
                  this.delete(t), n !== t && n && this.delete(n);
                },
              },
              {
                key: "removeNodeTree",
                value: function (e) {
                  var t = this;
                  this.removeNode(e),
                    e.childNodes.forEach(function (e) {
                      return t.removeNodeTree(e);
                    });
                },
              },
            ])
          );
        })((0, d.Z)(Map)))(),
        Re = { window: p.kT, document: p.kT };
      function Ze(e) {
        var t;
        Ne || (Ne = Ie()), Ae || (Ae = p.PT.call("getSpecialNodes"));
        var n = e.nodeName,
          r = null;
        if (
          (function (e) {
            return 3 === e.nodeType;
          })(e)
        )
          return (0, s.Z)(
            (0, s.Z)({ sid: e.sid }, "v", e.nodeValue),
            "nn",
            (null === (t = Ne[n]) || void 0 === t ? void 0 : t._num) || "8"
          );
        var i = (0, s.Z)((0, s.Z)({}, "nn", n), "sid", e.sid);
        e.uid !== e.sid && (i.uid = e.uid),
          !e.isAnyEventBinded() &&
            Ae.indexOf(n) > -1 &&
            ((i.nn = "static-".concat(n)), n !== D || Ce(e) || (i.nn = j));
        var o = e.props;
        for (var a in o) {
          var u = (0, p.CA)(a);
          a.startsWith("data-") ||
            a === R ||
            a === Z ||
            a === O ||
            u === re ||
            u === ne ||
            (i[u] = o[a]),
            n === D && u === re && !1 !== o[a] && (i.nn = ie),
            u === ne && (r = o[a]);
        }
        (i.cn = e.childNodes
          .filter(function (e) {
            return !Ee(e);
          })
          .map(Ze)),
          "" !== e.className && (i.cl = e.className);
        var c = e.cssText;
        "" !== c && "swiper-item" !== n && (i.st = c),
          p.PT.call("modifyHydrateData", i, e);
        var l = i.nn,
          d = Ne[l];
        if (d)
          for (var f in ((i.nn = d._num), i))
            f in d && ((i[d[f]] = i[f]), delete i[f]);
        return (
          null !== r && (i.nn = r),
          p.PT.call("transferHydrateData", i, e, d) || i
        );
      }
      var Be = (0, v.Z)(
          function e() {
            (0, h.Z)(this, e), (this.__handlers = {});
          },
          [
            {
              key: "addEventListener",
              value: function (e, t, n) {
                if (
                  ((e = e.toLowerCase()),
                  p.PT.call("onAddEvent", e, t, n, this),
                  "regionchange" === e)
                )
                  return (
                    this.addEventListener("begin", t, n),
                    void this.addEventListener("end", t, n)
                  );
                Boolean(n);
                var r = !1;
                if (
                  ((0, p.Kn)(n) && (Boolean(n.capture), (r = Boolean(n.once))),
                  r)
                ) {
                  var i = function () {
                    t.apply(this, arguments), this.removeEventListener(e, i);
                  };
                  this.addEventListener(
                    e,
                    i,
                    Object.assign(Object.assign({}, n), { once: !1 })
                  );
                } else {
                  var o = t;
                  (t = function () {
                    return o.apply(this, arguments);
                  }).oldHandler = o;
                  var a = this.__handlers[e];
                  (0, p.kJ)(a) ? a.push(t) : (this.__handlers[e] = [t]);
                }
              },
            },
            {
              key: "removeEventListener",
              value: function (e, t) {
                if ("regionchange" === (e = e.toLowerCase()))
                  return (
                    this.removeEventListener("begin", t),
                    void this.removeEventListener("end", t)
                  );
                if (t) {
                  var n = this.__handlers[e];
                  if ((0, p.kJ)(n)) {
                    var r = n.findIndex(function (e) {
                      if (e === t || e.oldHandler === t) return !0;
                    });
                    n.splice(r, 1);
                  }
                }
              },
            },
            {
              key: "isAnyEventBinded",
              value: function () {
                var e = this.__handlers,
                  t = Object.keys(e).find(function (t) {
                    return e[t].length;
                  });
                return Boolean(t);
              },
            },
          ]
        ),
        De = we(),
        Me = (function (e) {
          function t() {
            var e;
            return (
              (0, h.Z)(this, t),
              ((e = (0, c.Z)(this, t)).parentNode = null),
              (e.childNodes = []),
              (e.hydrate = function (e) {
                return function () {
                  return Ze(e);
                };
              }),
              (e.uid = "_" + De()),
              (e.sid = e.uid),
              Le.set(e.sid, e),
              e
            );
          }
          return (
            (0, l.Z)(t, e),
            (0, v.Z)(
              t,
              [
                {
                  key: "updateChildNodes",
                  value: function (e) {
                    var t = this;
                    this.enqueueUpdate({
                      path: "".concat(this._path, ".").concat("cn"),
                      value: e
                        ? function () {
                            return [];
                          }
                        : function () {
                            return t.childNodes
                              .filter(function (e) {
                                return !Ee(e);
                              })
                              .map(Ze);
                          },
                    });
                  },
                },
                {
                  key: "updateSingleChild",
                  value: function (e) {
                    var t = this;
                    this.childNodes.forEach(function (n, r) {
                      Ee(n) ||
                        (e && r < e) ||
                        t.enqueueUpdate({ path: n._path, value: t.hydrate(n) });
                    });
                  },
                },
                {
                  key: "_root",
                  get: function () {
                    var e;
                    return (
                      (null === (e = this.parentNode) || void 0 === e
                        ? void 0
                        : e._root) || null
                    );
                  },
                },
                {
                  key: "findIndex",
                  value: function (e) {
                    var t = this.childNodes.indexOf(e);
                    return (
                      (0, p.zx)(
                        -1 !== t,
                        "The node to be replaced is not a child of this node."
                      ),
                      t
                    );
                  },
                },
                {
                  key: "_path",
                  get: function () {
                    var e = this.parentNode;
                    if (e) {
                      var t = e.childNodes
                          .filter(function (e) {
                            return !Ee(e);
                          })
                          .indexOf(this),
                        n = p.PT.call("getPathIndex", t);
                      return ""
                        .concat(e._path, ".")
                        .concat("cn", ".")
                        .concat(n);
                    }
                    return "";
                  },
                },
                {
                  key: "nextSibling",
                  get: function () {
                    var e = this.parentNode;
                    return (
                      (null == e
                        ? void 0
                        : e.childNodes[e.findIndex(this) + 1]) || null
                    );
                  },
                },
                {
                  key: "previousSibling",
                  get: function () {
                    var e = this.parentNode;
                    return (
                      (null == e
                        ? void 0
                        : e.childNodes[e.findIndex(this) - 1]) || null
                    );
                  },
                },
                {
                  key: "parentElement",
                  get: function () {
                    var e = this.parentNode;
                    return 1 === (null == e ? void 0 : e.nodeType) ? e : null;
                  },
                },
                {
                  key: "firstChild",
                  get: function () {
                    return this.childNodes[0] || null;
                  },
                },
                {
                  key: "lastChild",
                  get: function () {
                    var e = this.childNodes;
                    return e[e.length - 1] || null;
                  },
                },
                {
                  key: "textContent",
                  set: function (e) {
                    for (
                      var t = this.childNodes.slice(), n = [];
                      this.firstChild;

                    )
                      this.removeChild(this.firstChild, { doUpdate: !1 });
                    if ("" === e) this.updateChildNodes(!0);
                    else {
                      var r = Re.document.createTextNode(e);
                      n.push(r), this.appendChild(r), this.updateChildNodes();
                    }
                    ke.record({
                      type: "childList",
                      target: this,
                      removedNodes: t,
                      addedNodes: n,
                    });
                  },
                },
                {
                  key: "insertBefore",
                  value: function (e, t, n) {
                    var r = this;
                    if (e.nodeName === N)
                      return (
                        e.childNodes.reduceRight(function (e, t) {
                          return r.insertBefore(t, e), t;
                        }, t),
                        e
                      );
                    e.remove({ cleanRef: !1 });
                    var i = 0;
                    (e.parentNode = this),
                      t
                        ? ((i = this.findIndex(t)),
                          this.childNodes.splice(i, 0, e))
                        : this.childNodes.push(e);
                    var o = this.childNodes.length;
                    return (
                      this._root &&
                        (t
                          ? n
                            ? this.enqueueUpdate({
                                path: e._path,
                                value: this.hydrate(e),
                              })
                            : (2 * o) / 3 > i
                            ? this.updateChildNodes()
                            : this.updateSingleChild(i)
                          : 1 === o
                          ? this.updateChildNodes()
                          : this.enqueueUpdate({
                              path: e._path,
                              value: this.hydrate(e),
                            })),
                      ke.record({
                        type: "childList",
                        target: this,
                        addedNodes: [e],
                        removedNodes: n ? [t] : [],
                        nextSibling: n ? t.nextSibling : t || null,
                        previousSibling: e.previousSibling,
                      }),
                      e
                    );
                  },
                },
                {
                  key: "appendChild",
                  value: function (e) {
                    return this.insertBefore(e);
                  },
                },
                {
                  key: "replaceChild",
                  value: function (e, t) {
                    if (t.parentNode === this)
                      return (
                        this.insertBefore(e, t, !0),
                        t.remove({ doUpdate: !1 }),
                        t
                      );
                  },
                },
                {
                  key: "removeChild",
                  value: function (e) {
                    var t =
                        arguments.length > 1 && void 0 !== arguments[1]
                          ? arguments[1]
                          : {},
                      n = t.cleanRef,
                      r = t.doUpdate;
                    !1 !== n &&
                      !1 !== r &&
                      ke.record({
                        type: "childList",
                        target: this,
                        removedNodes: [e],
                        nextSibling: e.nextSibling,
                        previousSibling: e.previousSibling,
                      });
                    var i = this.findIndex(e);
                    return (
                      this.childNodes.splice(i, 1),
                      (e.parentNode = null),
                      !1 !== n && Le.removeNodeTree(e),
                      this._root && !1 !== r && this.updateChildNodes(),
                      e
                    );
                  },
                },
                {
                  key: "remove",
                  value: function (e) {
                    var t;
                    null === (t = this.parentNode) ||
                      void 0 === t ||
                      t.removeChild(this, e);
                  },
                },
                {
                  key: "hasChildNodes",
                  value: function () {
                    return this.childNodes.length > 0;
                  },
                },
                {
                  key: "enqueueUpdate",
                  value: function (e) {
                    var t;
                    null === (t = this._root) ||
                      void 0 === t ||
                      t.enqueueUpdate(e);
                  },
                },
                {
                  key: "ownerDocument",
                  get: function () {
                    return Re.document;
                  },
                },
              ],
              [
                {
                  key: "extend",
                  value: function (e, n) {
                    xe(t, e, n);
                  },
                },
              ]
            )
          );
        })(Be),
        je = [
          "all",
          "appearance",
          "blockOverflow",
          "blockSize",
          "bottom",
          "clear",
          "contain",
          "content",
          "continue",
          "cursor",
          "direction",
          "display",
          "filter",
          "float",
          "gap",
          "height",
          "inset",
          "isolation",
          "left",
          "letterSpacing",
          "lightingColor",
          "markerSide",
          "mixBlendMode",
          "opacity",
          "order",
          "position",
          "quotes",
          "resize",
          "right",
          "rowGap",
          "tabSize",
          "tableLayout",
          "top",
          "userSelect",
          "verticalAlign",
          "visibility",
          "voiceFamily",
          "volume",
          "whiteSpace",
          "widows",
          "width",
          "zIndex",
          "pointerEvents",
          "aspectRatio",
        ];
      function He(e, t, n) {
        !n && je.push(e),
          t.forEach(function (t) {
            je.push(e + t), "webkit" === e && je.push("Webkit" + t);
          });
      }
      var Ue = "Color",
        Qe = "Style",
        Fe = "Width",
        We = "Image",
        Ve = "Size",
        ze = [Ue, Qe, Fe],
        Ge = ["FitLength", "FitWidth", We],
        Ye = [].concat(Ge, ["Radius"]),
        qe = [].concat(ze, Ge),
        $e = ["EndRadius", "StartRadius"],
        Ke = ["Bottom", "Left", "Right", "Top"],
        Je = ["End", "Start"],
        Xe = ["Content", "Items", "Self"],
        et = ["BlockSize", "Height", "InlineSize", Fe],
        tt = ["After", "Before"];
      function nt(e) {
        ke.record({
          type: "attributes",
          target: e._element,
          attributeName: "style",
          oldValue: e.cssText,
        });
      }
      function rt(e) {
        var t = e._element;
        t._root &&
          t.enqueueUpdate({
            path: "".concat(t._path, ".", "st"),
            value: e.cssText,
          });
      }
      function it(e, t) {
        this[t] !== e &&
          (!this._pending && nt(this),
          (0, p.Ft)(e) || (0, p.o8)(e) || "" === e
            ? (this._usedStyleProp.delete(t), delete this._value[t])
            : (this._usedStyleProp.add(t), (this._value[t] = e)),
          !this._pending && rt(this));
      }
      function ot(e, t) {
        for (
          var n,
            r = {},
            i = function () {
              var n = t[o];
              if (e[n]) return { v: void 0 };
              r[n] = {
                get: function () {
                  var e = this._value[n];
                  return (0, p.Ft)(e) || (0, p.o8)(e) ? "" : e;
                },
                set: function (e) {
                  it.call(this, e, n);
                },
              };
            },
            o = 0;
          o < t.length;
          o++
        )
          if ((n = i())) return n.v;
        Object.defineProperties(e.prototype, r);
      }
      He("borderBlock", ze),
        He("borderBlockEnd", ze),
        He("borderBlockStart", ze),
        He("outline", [].concat(ze, ["Offset"])),
        He(
          "border",
          [].concat(ze, ["Boundary", "Break", "Collapse", "Radius", "Spacing"])
        ),
        He("borderFit", ["Length", Fe]),
        He("borderInline", ze),
        He("borderInlineEnd", ze),
        He("borderInlineStart", ze),
        He("borderLeft", qe),
        He("borderRight", qe),
        He("borderTop", qe),
        He("borderBottom", qe),
        He("textDecoration", [Ue, Qe, "Line"]),
        He("textEmphasis", [Ue, Qe, "Position"]),
        He("scrollMargin", Ke),
        He("scrollPadding", Ke),
        He("padding", Ke),
        He("margin", [].concat(Ke, ["Trim"])),
        He("scrollMarginBlock", Je),
        He("scrollMarginInline", Je),
        He("scrollPaddingBlock", Je),
        He("scrollPaddingInline", Je),
        He("gridColumn", Je),
        He("gridRow", Je),
        He("insetBlock", Je),
        He("insetInline", Je),
        He("marginBlock", Je),
        He("marginInline", Je),
        He("paddingBlock", Je),
        He("paddingInline", Je),
        He("pause", tt),
        He("cue", tt),
        He("mask", [
          "Clip",
          "Composite",
          We,
          "Mode",
          "Origin",
          "Position",
          "Repeat",
          Ve,
          "Type",
        ]),
        He("borderImage", [
          "Outset",
          "Repeat",
          "Slice",
          "Source",
          "Transform",
          Fe,
        ]),
        He("maskBorder", ["Mode", "Outset", "Repeat", "Slice", "Source", Fe]),
        He("font", [
          "Family",
          "FeatureSettings",
          "Kerning",
          "LanguageOverride",
          "MaxSize",
          "MinSize",
          "OpticalSizing",
          "Palette",
          Ve,
          "SizeAdjust",
          "Stretch",
          Qe,
          "Weight",
          "VariationSettings",
        ]),
        He("transform", ["Box", "Origin", Qe]),
        He("background", [
          Ue,
          We,
          "Attachment",
          "BlendMode",
          "Clip",
          "Origin",
          "Position",
          "Repeat",
          Ve,
        ]),
        He("listStyle", [We, "Position", "Type"]),
        He("scrollSnap", ["Align", "Stop", "Type"]),
        He("grid", ["Area", "AutoColumns", "AutoFlow", "AutoRows"]),
        He("gridTemplate", ["Areas", "Columns", "Rows"]),
        He("overflow", ["Block", "Inline", "Wrap", "X", "Y"]),
        He("transition", ["Delay", "Duration", "Property", "TimingFunction"]),
        He("color", ["Adjust", "InterpolationFilters", "Scheme"]),
        He("textAlign", ["All", "Last"]),
        He("page", ["BreakAfter", "BreakBefore", "BreakInside"]),
        He("animation", [
          "Delay",
          "Direction",
          "Duration",
          "FillMode",
          "IterationCount",
          "Name",
          "PlayState",
          "TimingFunction",
        ]),
        He("flex", ["Basis", "Direction", "Flow", "Grow", "Shrink", "Wrap"]),
        He(
          "offset",
          [].concat(tt, Je, [
            "Anchor",
            "Distance",
            "Path",
            "Position",
            "Rotate",
          ])
        ),
        He("perspective", ["Origin"]),
        He("clip", ["Path", "Rule"]),
        He("flow", ["From", "Into"]),
        He("align", ["Content", "Items", "Self"], !0),
        He("alignment", ["Adjust", "Baseline"], !0),
        He("borderStart", $e, !0),
        He("borderEnd", $e, !0),
        He("borderCorner", ["Fit", We, "ImageTransform"], !0),
        He("borderTopLeft", Ye, !0),
        He("borderTopRight", Ye, !0),
        He("borderBottomLeft", Ye, !0),
        He("borderBottomRight", Ye, !0),
        He(
          "column",
          [
            "s",
            "Count",
            "Fill",
            "Gap",
            "Rule",
            "RuleColor",
            "RuleStyle",
            "RuleWidth",
            "Span",
            Fe,
          ],
          !0
        ),
        He("break", [].concat(tt, ["Inside"]), !0),
        He("wrap", [].concat(tt, ["Flow", "Inside", "Through"]), !0),
        He("justify", Xe, !0),
        He("place", Xe, !0),
        He("max", [].concat(et, ["Lines"]), !0),
        He("min", et, !0),
        He("line", ["Break", "Clamp", "Grid", "Height", "Padding", "Snap"], !0),
        He("inline", ["BoxAlign", Ve, "Sizing"], !0),
        He(
          "text",
          [
            "CombineUpright",
            "GroupAlign",
            "Height",
            "Indent",
            "Justify",
            "Orientation",
            "Overflow",
            "Shadow",
            "SpaceCollapse",
            "SpaceTrim",
            "Spacing",
            "Transform",
            "UnderlinePosition",
            "Wrap",
          ],
          !0
        ),
        He("shape", ["ImageThreshold", "Inside", "Margin", "Outside"], !0),
        He("word", ["Break", "Spacing", "Wrap"], !0),
        He("object", ["Fit", "Position"], !0),
        He("box", ["DecorationBreak", "Shadow", "Sizing", "Snap"], !0),
        He(
          "webkit",
          [
            "LineClamp",
            "BoxOrient",
            "TextFillColor",
            "TextStroke",
            "TextStrokeColor",
            "TextStrokeWidth",
          ],
          !0
        );
      var at = (0, v.Z)(
        function e(t) {
          (0, h.Z)(this, e),
            (this._element = t),
            (this._usedStyleProp = new Set()),
            (this._value = {});
        },
        [
          {
            key: "setCssVariables",
            value: function (e) {
              var t = this;
              this.hasOwnProperty(e) ||
                Object.defineProperty(this, e, {
                  enumerable: !0,
                  configurable: !0,
                  get: function () {
                    return t._value[e] || "";
                  },
                  set: function (n) {
                    it.call(t, n, e);
                  },
                });
            },
          },
          {
            key: "cssText",
            get: function () {
              var e = this;
              if (!this._usedStyleProp.size) return "";
              var t = [];
              return (
                this._usedStyleProp.forEach(function (n) {
                  var r = e[n];
                  if (!(0, p.Ft)(r) && !(0, p.o8)(r)) {
                    var i = (function (e) {
                      return /^--/.test(e);
                    })(n)
                      ? n
                      : (0, p.eu)(n);
                    (0 !== i.indexOf("webkit") && 0 !== i.indexOf("Webkit")) ||
                      (i = "-".concat(i)),
                      t.push("".concat(i, ": ").concat(r, ";"));
                  }
                }),
                t.join(" ")
              );
            },
            set: function (e) {
              var t = this;
              if (
                ((this._pending = !0),
                nt(this),
                this._usedStyleProp.forEach(function (e) {
                  t.removeProperty(e);
                }),
                "" === e || (0, p.o8)(e) || (0, p.Ft)(e))
              )
                return (this._pending = !1), void rt(this);
              for (var n = e.split(";"), r = 0; r < n.length; r++) {
                var i = n[r].trim();
                if ("" !== i) {
                  var o = i.split(":"),
                    a = (0, u.Z)(o),
                    s = a[0],
                    c = a.slice(1).join(":");
                  (0, p.o8)(c) || this.setProperty(s.trim(), c.trim());
                }
              }
              (this._pending = !1), rt(this);
            },
          },
          {
            key: "setProperty",
            value: function (e, t) {
              "-" === e[0] ? this.setCssVariables(e) : (e = (0, p.CA)(e)),
                (0, p.Ft)(t) || (0, p.o8)(t)
                  ? this.removeProperty(e)
                  : (this[e] = t);
            },
          },
          {
            key: "removeProperty",
            value: function (e) {
              if (((e = (0, p.CA)(e)), !this._usedStyleProp.has(e))) return "";
              var t = this[e];
              return (this[e] = void 0), t;
            },
          },
          {
            key: "getPropertyValue",
            value: function (e) {
              return this[(e = (0, p.CA)(e))] || "";
            },
          },
        ]
      );
      function ut() {
        return !0;
      }
      function st(e, t) {
        for (var n = [], r = null != t ? t : ut, i = e; i; )
          1 === i.nodeType && r(i) && n.push(i), (i = ct(i, e));
        return n;
      }
      function ct(e, t) {
        var n = e.firstChild,
          r = 1 === e.nodeType || 9 === e.nodeType;
        if (n && r) return n;
        var i = e;
        do {
          if (i === t) return null;
          var o = i.nextSibling;
          if (o) return o;
          i = i.parentElement;
        } while (i);
        return null;
      }
      ot(at, je),
        p.PT.tap("injectNewStyleProperties", function (e) {
          if ((0, p.kJ)(e)) ot(at, e);
          else {
            if ("string" != typeof e) return;
            ot(at, [e]);
          }
        });
      var lt = (function (e) {
          function t() {
            var e;
            return (
              (0, h.Z)(this, t),
              ((e = (0, c.Z)(this, t)).props = {}),
              (e.dataset = p.kT),
              (e.nodeType = 1),
              (e.style = new at(e)),
              p.PT.call("patchElement", e),
              e
            );
          }
          return (
            (0, l.Z)(t, e),
            (0, v.Z)(
              t,
              [
                {
                  key: "_stopPropagation",
                  value: function (e) {
                    for (var t = this; (t = t.parentNode); ) {
                      var n = t.__handlers[e.type];
                      if ((0, p.kJ)(n))
                        for (var r = n.length; r--; ) n[r]._stop = !0;
                    }
                  },
                },
                {
                  key: "id",
                  get: function () {
                    return this.getAttribute(O);
                  },
                  set: function (e) {
                    this.setAttribute(O, e);
                  },
                },
                {
                  key: "className",
                  get: function () {
                    return this.getAttribute(R) || "";
                  },
                  set: function (e) {
                    this.setAttribute(R, e);
                  },
                },
                {
                  key: "cssText",
                  get: function () {
                    return this.getAttribute(Z) || "";
                  },
                },
                {
                  key: "classList",
                  get: function () {
                    return new Oe(this.className, this);
                  },
                },
                {
                  key: "children",
                  get: function () {
                    return this.childNodes.filter(Te);
                  },
                },
                {
                  key: "attributes",
                  get: function () {
                    var e = this.props,
                      t = Object.keys(e),
                      n = this.style.cssText;
                    return t
                      .map(function (t) {
                        return { name: t, value: e[t] };
                      })
                      .concat(n ? { name: Z, value: n } : []);
                  },
                },
                {
                  key: "textContent",
                  get: function () {
                    for (
                      var e = "", t = this.childNodes, n = 0;
                      n < t.length;
                      n++
                    )
                      e += t[n].textContent;
                    return e;
                  },
                  set: function (e) {
                    (0, a.Z)(t, "textContent", e, this, 1, 1);
                  },
                },
                {
                  key: "hasAttribute",
                  value: function (e) {
                    return !(0, p.o8)(this.props[e]);
                  },
                },
                {
                  key: "hasAttributes",
                  value: function () {
                    return this.attributes.length > 0;
                  },
                },
                {
                  key: "focus",
                  get: function () {
                    return function () {
                      this.setAttribute(B, !0);
                    };
                  },
                  set: function (e) {
                    this.setAttribute(B, e);
                  },
                },
                {
                  key: "blur",
                  value: function () {
                    this.setAttribute(B, !1);
                  },
                },
                {
                  key: "setAttribute",
                  value: function (e, t) {
                    var n =
                      this.nodeName === D &&
                      !Ce(this) &&
                      !this.isAnyEventBinded();
                    switch (
                      (e !== Z &&
                        ke.record({
                          target: this,
                          type: "attributes",
                          attributeName: e,
                          oldValue: this.getAttribute(e),
                        }),
                      e)
                    ) {
                      case Z:
                        this.style.cssText = t;
                        break;
                      case O:
                        this.uid !== this.sid && Le.delete(this.uid),
                          (t = String(t)),
                          (this.props[e] = this.uid = t),
                          Le.set(t, this);
                        break;
                      default:
                        (this.props[e] = t),
                          e.startsWith("data-") &&
                            (this.dataset === p.kT &&
                              (this.dataset = Object.create(null)),
                            (this.dataset[(0, p.CA)(e.replace(/^data-/, ""))] =
                              t));
                    }
                    if (this._root) {
                      var r = Ie(),
                        i = r[this.nodeName],
                        o = r[D]._num,
                        a = r[M]._num,
                        u = r[ie]._num,
                        s = this._path;
                      e = Se(e);
                      var c = (0, p.CA)(e),
                        l = {
                          path: "".concat(s, ".").concat(c),
                          value: (0, p.mf)(t)
                            ? function () {
                                return t;
                              }
                            : t,
                        };
                      if (
                        (p.PT.call("modifySetAttrPayload", this, e, l, r), i)
                      ) {
                        var d = i[c] || e;
                        l.path = "".concat(s, ".").concat((0, p.CA)(d));
                      }
                      this.enqueueUpdate(l),
                        this.nodeName === D &&
                          (c === re
                            ? this.enqueueUpdate({
                                path: "".concat(s, ".", "nn"),
                                value: t ? u : this.isAnyEventBinded() ? o : a,
                              })
                            : n &&
                              Ce(this) &&
                              this.enqueueUpdate({
                                path: "".concat(s, ".", "nn"),
                                value: a,
                              }));
                    }
                  },
                },
                {
                  key: "removeAttribute",
                  value: function (e) {
                    var t =
                      this.nodeName === D &&
                      Ce(this) &&
                      !this.isAnyEventBinded();
                    if (
                      (ke.record({
                        target: this,
                        type: "attributes",
                        attributeName: e,
                        oldValue: this.getAttribute(e),
                      }),
                      e === Z)
                    )
                      this.style.cssText = "";
                    else {
                      if (p.PT.call("onRemoveAttribute", this, e)) return;
                      if (!this.props.hasOwnProperty(e)) return;
                      delete this.props[e];
                    }
                    if (this._root) {
                      var n = Ie(),
                        r = n[this.nodeName],
                        i = n[D]._num,
                        o = n[M]._num,
                        a = n[j]._num,
                        u = this._path;
                      e = Se(e);
                      var s = (0, p.CA)(e),
                        c = { path: "".concat(u, ".").concat(s), value: "" };
                      if (
                        (p.PT.call("modifyRmAttrPayload", this, e, c, n), r)
                      ) {
                        var l = r[s] || e;
                        c.path = "".concat(u, ".").concat((0, p.CA)(l));
                      }
                      this.enqueueUpdate(c),
                        this.nodeName === D &&
                          (s === re
                            ? this.enqueueUpdate({
                                path: "".concat(u, ".", "nn"),
                                value: this.isAnyEventBinded()
                                  ? i
                                  : Ce(this)
                                  ? o
                                  : a,
                              })
                            : t &&
                              !Ce(this) &&
                              this.enqueueUpdate({
                                path: "".concat(u, ".", "nn"),
                                value: a,
                              }));
                    }
                  },
                },
                {
                  key: "getAttribute",
                  value: function (e) {
                    var t = e === Z ? this.style.cssText : this.props[e];
                    return null != t ? t : "";
                  },
                },
                {
                  key: "getElementsByTagName",
                  value: function (e) {
                    var t = this;
                    return st(this, function (n) {
                      return n.nodeName === e || ("*" === e && t !== n);
                    });
                  },
                },
                {
                  key: "getElementsByClassName",
                  value: function (e) {
                    var t = e.trim().split(/\s+/);
                    return st(this, function (e) {
                      var n = e.classList;
                      return t.every(function (e) {
                        return n.contains(e);
                      });
                    });
                  },
                },
                {
                  key: "dispatchEvent",
                  value: function (e) {
                    var t = e.cancelable,
                      n = this.__handlers[e.type];
                    if (!(0, p.kJ)(n)) return !1;
                    for (var r = n.length; r--; ) {
                      var i = n[r],
                        o = void 0;
                      if (
                        (i._stop
                          ? (i._stop = !1)
                          : (p.PT.call("modifyDispatchEvent", e, this),
                            (o = i.call(this, e))),
                        (!1 === o || e._end) && t && (e.defaultPrevented = !0),
                        !(0, p.o8)(o) &&
                          e.mpEvent &&
                          p.PT.call("modifyTaroEventReturn", this, e, o) &&
                          (e.mpEvent[fe] = o),
                        e._end && e._stop)
                      )
                        break;
                    }
                    return (
                      e._stop ? this._stopPropagation(e) : (e._stop = !0),
                      null != n
                    );
                  },
                },
                {
                  key: "addEventListener",
                  value: function (e, n, r) {
                    var i = this.nodeName,
                      a = p.PT.call("getSpecialNodes"),
                      u = !0;
                    if (
                      ((0, p.Kn)(r) &&
                        !1 === r.sideEffect &&
                        ((u = !1), delete r.sideEffect),
                      p.PT.call("modifyAddEventListener", this, u, Ie),
                      !1 !== u && !this.isAnyEventBinded() && a.indexOf(i) > -1)
                    ) {
                      var s = Ie()[i]._num;
                      this.enqueueUpdate({
                        path: "".concat(this._path, ".", "nn"),
                        value: s,
                      });
                    }
                    (0, o.Z)(t, "addEventListener", this, 3)([e, n, r]);
                  },
                },
                {
                  key: "removeEventListener",
                  value: function (e, n) {
                    var r =
                      !(arguments.length > 2 && void 0 !== arguments[2]) ||
                      arguments[2];
                    (0, o.Z)(t, "removeEventListener", this, 3)([e, n]);
                    var i = this.nodeName,
                      a = p.PT.call("getSpecialNodes");
                    if (
                      (p.PT.call("modifyRemoveEventListener", this, r, Ie),
                      !1 !== r && !this.isAnyEventBinded() && a.indexOf(i) > -1)
                    ) {
                      var u = Ie(),
                        s = Ce(this) ? "static-".concat(i) : "pure-".concat(i),
                        c = u[s]._num;
                      this.enqueueUpdate({
                        path: "".concat(this._path, ".", "nn"),
                        value: c,
                      });
                    }
                  },
                },
              ],
              [
                {
                  key: "extend",
                  value: function (e, n) {
                    xe(t, e, n);
                  },
                },
              ]
            )
          );
        })(Me),
        dt = { prerender: !0, debug: !1 };
      function ft(e, t, n) {
        for (var r = e.index, i = (e.index = r + n), o = r; o < i; o++)
          "\n" === t.charAt(o) ? (e.line++, (e.column = 0)) : e.column++;
      }
      function ht(e, t, n) {
        return ft(e, t, n - e.index);
      }
      function vt(e) {
        return { index: e.index, line: e.line, column: e.column };
      }
      var pt = /\s/;
      function gt(e) {
        return pt.test(e);
      }
      var mt = /=/;
      function bt(e) {
        return mt.test(e);
      }
      function yt(e) {
        var t = e.toLowerCase();
        return !!dt.html.skipElements.has(t);
      }
      var kt = /[A-Za-z0-9]/;
      function wt(e, t, n) {
        if (!gt(n.charAt(e))) return !1;
        for (var r = n.length, i = e - 1; i > t; i--) {
          var o = n.charAt(i);
          if (!gt(o)) {
            if (bt(o)) return !1;
            break;
          }
        }
        for (var a = e + 1; a < r; a++) {
          var u = n.charAt(a);
          if (!gt(u)) return !bt(u);
        }
      }
      var Tt = (0, v.Z)(
        function e(t) {
          (0, h.Z)(this, e),
            (this.tokens = []),
            (this.position = { index: 0, column: 0, line: 0 }),
            (this.html = t);
        },
        [
          {
            key: "scan",
            value: function () {
              for (
                var e = this.html, t = this.position, n = e.length;
                t.index < n;

              ) {
                var r = t.index;
                if ((this.scanText(), t.index === r))
                  if (e.startsWith("!--", r + 1)) this.scanComment();
                  else {
                    var i = this.scanTag();
                    yt(i) && this.scanSkipTag(i);
                  }
              }
              return this.tokens;
            },
          },
          {
            key: "scanText",
            value: function () {
              var e = this.html,
                t = this.position,
                n = (function (e, t) {
                  for (;;) {
                    var n = e.indexOf("<", t);
                    if (-1 === n) return n;
                    var r = e.charAt(n + 1);
                    if ("/" === r || "!" === r || kt.test(r)) return n;
                    t = n + 1;
                  }
                })(e, t.index);
              if (n !== t.index) {
                -1 === n && (n = e.length);
                var r = vt(t),
                  i = e.slice(t.index, n);
                ht(t, e, n);
                var o = vt(t);
                this.tokens.push({
                  type: "text",
                  content: i,
                  position: { start: r, end: o },
                });
              }
            },
          },
          {
            key: "scanComment",
            value: function () {
              var e = this.html,
                t = this.position,
                n = vt(t);
              ft(t, e, 4);
              var r = e.indexOf("--\x3e", t.index),
                i = r + 3;
              -1 === r && (r = i = e.length);
              var o = e.slice(t.index, r);
              ht(t, e, i),
                this.tokens.push({
                  type: "comment",
                  content: o,
                  position: { start: n, end: vt(t) },
                });
            },
          },
          {
            key: "scanTag",
            value: function () {
              this.scanTagStart();
              var e = this.scanTagName();
              return this.scanAttrs(), this.scanTagEnd(), e;
            },
          },
          {
            key: "scanTagStart",
            value: function () {
              var e = this.html,
                t = this.position,
                n = "/" === e.charAt(t.index + 1),
                r = vt(t);
              ft(t, e, n ? 2 : 1),
                this.tokens.push({
                  type: "tag-start",
                  close: n,
                  position: { start: r },
                });
            },
          },
          {
            key: "scanTagEnd",
            value: function () {
              var e = this.html,
                t = this.position,
                n = "/" === e.charAt(t.index);
              ft(t, e, n ? 2 : 1);
              var r = vt(t);
              this.tokens.push({
                type: "tag-end",
                close: n,
                position: { end: r },
              });
            },
          },
          {
            key: "scanTagName",
            value: function () {
              for (
                var e = this.html, t = this.position, n = e.length, r = t.index;
                r < n;

              ) {
                var i = e.charAt(r);
                if (!gt(i) && "/" !== i && ">" !== i) break;
                r++;
              }
              for (var o = r + 1; o < n; ) {
                var a = e.charAt(o);
                if (gt(a) || "/" === a || ">" === a) break;
                o++;
              }
              ht(t, e, o);
              var u = e.slice(r, o);
              return this.tokens.push({ type: "tag", content: u }), u;
            },
          },
          {
            key: "scanAttrs",
            value: function () {
              for (
                var e = this.html,
                  t = this.position,
                  n = this.tokens,
                  r = t.index,
                  i = null,
                  o = r,
                  a = [],
                  u = e.length;
                r < u;

              ) {
                var s = e.charAt(r);
                if (i) s === i && (i = null), r++;
                else {
                  if ("/" === s || ">" === s) {
                    r !== o && a.push(e.slice(o, r));
                    break;
                  }
                  wt(r, o, e)
                    ? (r !== o && a.push(e.slice(o, r)), (o = r + 1), r++)
                    : "'" === s || '"' === s
                    ? ((i = s), r++)
                    : r++;
                }
              }
              ht(t, e, r);
              for (var c = a.length, l = "attribute", d = 0; d < c; d++) {
                var f = a[d];
                if (f.includes("=")) {
                  var h = a[d + 1];
                  if (h && h.startsWith("=")) {
                    if (h.length > 1) {
                      var v = f + h;
                      n.push({ type: l, content: v }), (d += 1);
                      continue;
                    }
                    var p = a[d + 2];
                    if (((d += 1), p)) {
                      var g = f + "=" + p;
                      n.push({ type: l, content: g }), (d += 1);
                      continue;
                    }
                  }
                }
                if (f.endsWith("=")) {
                  var m = a[d + 1];
                  if (m && !m.includes("=")) {
                    var b = f + m;
                    n.push({ type: l, content: b }), (d += 1);
                    continue;
                  }
                  var y = f.slice(0, -1);
                  n.push({ type: l, content: y });
                } else n.push({ type: l, content: f });
              }
            },
          },
          {
            key: "scanSkipTag",
            value: function (e) {
              for (
                var t = this.html,
                  n = this.position,
                  r = e.toLowerCase(),
                  i = t.length;
                n.index < i;

              ) {
                var o = t.indexOf("</", n.index);
                if (-1 === o) {
                  this.scanText();
                  break;
                }
                if ((ht(n, t, o), r === this.scanTag().toLowerCase())) break;
              }
            },
          },
        ]
      );
      function Et(e) {
        var t = e.charAt(0),
          n = e.length - 1;
        return ('"' !== t && "'" !== t) || t !== e.charAt(n)
          ? e
          : e.slice(1, n);
      }
      var Ct = (0, v.Z)(
        function e() {
          (0, h.Z)(this, e), (this.styles = []);
        },
        [
          {
            key: "extractStyle",
            value: function (e) {
              var t = this,
                n = e;
              return (n = n.replace(
                /<style\s?[^>]*>((.|\n|\s)+?)<\/style>/g,
                function (e, n) {
                  var r = n.trim();
                  return t.stringToSelector(r), "";
                }
              )).trim();
            },
          },
          {
            key: "stringToSelector",
            value: function (e) {
              for (
                var t = this,
                  n = e.indexOf("{"),
                  r = function () {
                    var r = e.indexOf("}"),
                      i = e.slice(0, n).trim(),
                      o = e.slice(n + 1, r);
                    (o = (o = (o = o.replace(/:(.*);/g, function (e, t) {
                      var n = t.trim().replace(/ +/g, "+++");
                      return ":".concat(n, ";");
                    })).replace(/ /g, "")).replace(/\+\+\+/g, " ")),
                      /;$/.test(o) || (o += ";"),
                      i.split(",").forEach(function (e) {
                        var n = t.parseSelector(e);
                        t.styles.push({ content: o, selectorList: n });
                      }),
                      (e = e.slice(r + 1)),
                      (n = e.indexOf("{"));
                  };
                n > -1;

              )
                r();
            },
          },
          {
            key: "parseSelector",
            value: function (e) {
              return e
                .trim()
                .replace(/ *([>~+]) */g, " $1")
                .replace(/ +/g, " ")
                .replace(
                  /\[\s*([^[\]=\s]+)\s*=\s*([^[\]=\s]+)\s*\]/g,
                  "[$1=$2]"
                )
                .split(" ")
                .map(function (e) {
                  var t = e.charAt(0),
                    n = {
                      isChild: ">" === t,
                      isGeneralSibling: "~" === t,
                      isAdjacentSibling: "+" === t,
                      tag: null,
                      id: null,
                      class: [],
                      attrs: [],
                    };
                  return (
                    "" !==
                      (e = (e = (e = e.replace(/^[>~+]/, "")).replace(
                        /\[(.+?)\]/g,
                        function (e, t) {
                          var r = t.split("="),
                            o = (0, i.Z)(r, 2),
                            a = o[0],
                            u = o[1],
                            s = -1 === t.indexOf("="),
                            c = { all: s, key: a, value: s ? null : u };
                          return n.attrs.push(c), "";
                        }
                      )).replace(/([.#][A-Za-z0-9-_]+)/g, function (e, t) {
                        return (
                          "#" === t[0]
                            ? (n.id = t.substr(1))
                            : "." === t[0] && n.class.push(t.substr(1)),
                          ""
                        );
                      })) && (n.tag = e),
                    n
                  );
                });
            },
          },
          {
            key: "matchStyle",
            value: function (e, t, n) {
              var r = this;
              return (function (e) {
                return e.sort(function (e, t) {
                  var n = _t(e.selectorList),
                    r = _t(t.selectorList);
                  if (n !== r) return n - r;
                  var i = Pt(e.selectorList),
                    o = Pt(t.selectorList);
                  return i !== o
                    ? i - o
                    : xt(e.selectorList) - xt(t.selectorList);
                });
              })(this.styles).reduce(function (i, o, a) {
                var u = o.content,
                  s = o.selectorList,
                  c = n[a],
                  l = s[c],
                  d = s[c + 1];
                ((null == d ? void 0 : d.isGeneralSibling) ||
                  (null == d ? void 0 : d.isAdjacentSibling)) &&
                  ((l = d), (c += 1), (n[a] += 1));
                var f = r.matchCurrent(e, t, l);
                if (f && l.isGeneralSibling)
                  for (var h = St(t); h; ) {
                    if (
                      h.h5tagName &&
                      r.matchCurrent(h.h5tagName, h, s[c - 1])
                    ) {
                      f = !0;
                      break;
                    }
                    (h = St(h)), (f = !1);
                  }
                if (f && l.isAdjacentSibling) {
                  var v = St(t);
                  (v &&
                    v.h5tagName &&
                    r.matchCurrent(v.h5tagName, v, s[c - 1])) ||
                    (f = !1);
                }
                if (f) {
                  if (c === s.length - 1) return i + u;
                  c < s.length - 1 && (n[a] += 1);
                } else l.isChild && c > 0 && ((n[a] -= 1), r.matchCurrent(e, t, s[n[a]]) && (n[a] += 1));
                return i;
              }, "");
            },
          },
          {
            key: "matchCurrent",
            value: function (e, t, n) {
              if (n.tag && n.tag !== e) return !1;
              if (n.id && n.id !== t.id) return !1;
              if (n.class.length)
                for (
                  var r = t.className.split(" "), i = 0;
                  i < n.class.length;
                  i++
                ) {
                  var o = n.class[i];
                  if (-1 === r.indexOf(o)) return !1;
                }
              if (n.attrs.length)
                for (var a = 0; a < n.attrs.length; a++) {
                  var u = n.attrs[a],
                    s = u.all,
                    c = u.key,
                    l = u.value;
                  if (s && !t.hasAttribute(c)) return !1;
                  if (t.getAttribute(c) !== Et(l || "")) return !1;
                }
              return !0;
            },
          },
        ]
      );
      function St(e) {
        if (!e.parentElement) return null;
        var t = e.previousSibling;
        return t ? (1 === t.nodeType ? t : St(t)) : null;
      }
      function _t(e) {
        return e.reduce(function (e, t) {
          return e + (t.id ? 1 : 0);
        }, 0);
      }
      function Pt(e) {
        return e.reduce(function (e, t) {
          return e + t.class.length + t.attrs.length;
        }, 0);
      }
      function xt(e) {
        return e.reduce(function (e, t) {
          return e + (t.tag ? 1 : 0);
        }, 0);
      }
      function It(e, t) {
        for (
          var n = Object.create(null), r = e.split(","), i = 0;
          i < r.length;
          i++
        )
          n[r[i]] = !0;
        return t
          ? function (e) {
              return !!n[e.toLowerCase()];
            }
          : function (e) {
              return !!n[e];
            };
      }
      var At = { img: "image", iframe: "web-view" },
        Nt = It(
          Object.keys(p.rD)
            .map(function (e) {
              return e.toLowerCase();
            })
            .join(","),
          !0
        ),
        Ot = It(
          "a,i,abbr,iframe,select,acronym,slot,small,span,bdi,kbd,strong,big,map,sub,sup,br,mark,mark,meter,template,canvas,textarea,cite,object,time,code,output,u,data,picture,tt,datalist,var,dfn,del,q,em,s,embed,samp,b",
          !0
        ),
        Lt = It(
          "address,fieldset,li,article,figcaption,main,aside,figure,nav,blockquote,footer,ol,details,form,p,dialog,h1,h2,h3,h4,h5,h6,pre,dd,header,section,div,hgroup,table,dl,hr,ul,dt",
          !0
        ),
        Rt = {
          li: ["ul", "ol", "menu"],
          dt: ["dl"],
          dd: ["dl"],
          tbody: ["table"],
          thead: ["table"],
          tfoot: ["table"],
          tr: ["table"],
          td: ["table"],
        };
      function Zt(e, t) {
        var n = Rt[e];
        if (n)
          for (var r = t.length - 1; r >= 0; ) {
            var i = t[r].tagName;
            if (i === e) break;
            if (n && n.includes(i)) return !0;
            r--;
          }
        return !1;
      }
      function Bt(e) {
        var t = e.indexOf("=");
        return -1 === t
          ? [e]
          : [e.slice(0, t).trim(), e.slice(t + "=".length).trim()];
      }
      function Dt(e, t, n, r) {
        return e
          .filter(function (e) {
            return (
              "comment" !== e.type && ("text" !== e.type || "" !== e.content)
            );
          })
          .map(function (e) {
            if ("text" === e.type) {
              var o = t.createTextNode(e.content);
              return (
                (0, p.mf)(dt.html.transformText) &&
                  (o = dt.html.transformText(o, e)),
                null == r || r.appendChild(o),
                o
              );
            }
            var a = t.createElement(
              (function (e) {
                return dt.html.renderHTMLTag
                  ? e
                  : At[e]
                  ? At[e]
                  : Nt(e)
                  ? e
                  : Lt(e)
                  ? "view"
                  : Ot(e)
                  ? "text"
                  : "view";
              })(e.tagName)
            );
            (a.h5tagName = e.tagName),
              null == r || r.appendChild(a),
              dt.html.renderHTMLTag || (a.className = "h5-".concat(e.tagName));
            for (var u = 0; u < e.attributes.length; u++) {
              var s = Bt(e.attributes[u]),
                c = (0, i.Z)(s, 2),
                l = c[0],
                d = c[1];
              if ("class" === l) a.className += " " + Et(d);
              else {
                if ("o" === l[0] && "n" === l[1]) continue;
                a.setAttribute(l, null == d || Et(d));
              }
            }
            var f = n.styleTagParser,
              h = n.descendantList.slice(),
              v = f.matchStyle(e.tagName, a, h);
            return (
              a.setAttribute("style", v + a.style.cssText),
              Dt(e.children, t, { styleTagParser: f, descendantList: h }, a),
              (0, p.mf)(dt.html.transformElement)
                ? dt.html.transformElement(a, e)
                : a
            );
          });
      }
      function Mt(e, t) {
        var n = new Ct();
        e = n.extractStyle(e);
        var r = { tagName: "", children: [], type: "element", attributes: [] };
        return (
          (function e(t) {
            for (
              var n = t.tokens,
                r = t.stack,
                i = t.cursor,
                o = n.length,
                a = r[r.length - 1].children;
              i < o;

            ) {
              var u = n[i];
              if ("tag-start" === u.type) {
                var s = n[++i];
                i++;
                var c = s.content.toLowerCase();
                if (u.close) {
                  for (var l = r.length, d = !1; --l > -1; )
                    if (r[l].tagName === c) {
                      d = !0;
                      break;
                    }
                  for (; i < o && "tag-end" === n[i].type; ) i++;
                  if (d) {
                    r.splice(l);
                    break;
                  }
                } else {
                  var f = dt.html.closingElements.has(c);
                  if ((f && (f = !Zt(c, r)), f))
                    for (var h = r.length - 1; h > 0; ) {
                      if (c === r[h].tagName) {
                        r.splice(h), (a = r[h - 1].children);
                        break;
                      }
                      h -= 1;
                    }
                  for (
                    var v = [], p = void 0;
                    i < o && "tag-end" !== (p = n[i]).type;

                  )
                    v.push(p.content), i++;
                  i++;
                  var g = [],
                    m = {
                      type: "element",
                      tagName: s.content,
                      attributes: v,
                      children: g,
                    };
                  if ((a.push(m), !p.close && !dt.html.voidElements.has(c))) {
                    r.push({ tagName: c, children: g });
                    var b = { tokens: n, cursor: i, stack: r };
                    e(b), (i = b.cursor);
                  }
                }
              } else a.push(u), i++;
            }
            t.cursor = i;
          })({ tokens: new Tt(e).scan(), options: dt, cursor: 0, stack: [r] }),
          Dt(r.children, t, {
            styleTagParser: n,
            descendantList: Array(n.styles.length).fill(0),
          })
        );
      }
      function jt(e, t) {
        for (; e.firstChild; ) e.removeChild(e.firstChild);
        for (var n = Mt(t, e.ownerDocument), r = 0; r < n.length; r++)
          e.appendChild(n[r]);
      }
      (dt.html = {
        skipElements: new Set(["style", "script"]),
        voidElements: new Set([
          "!doctype",
          "area",
          "base",
          "br",
          "col",
          "command",
          "embed",
          "hr",
          "img",
          "input",
          "keygen",
          "link",
          "meta",
          "param",
          "source",
          "track",
          "wbr",
        ]),
        closingElements: new Set([
          "html",
          "head",
          "body",
          "p",
          "dt",
          "dd",
          "li",
          "option",
          "thead",
          "th",
          "tbody",
          "tr",
          "td",
          "tfoot",
          "colgroup",
        ]),
        renderHTMLTag: !1,
      }),
        Me.extend("innerHTML", {
          set: function (e) {
            jt.call(this, this, e);
          },
          get: function () {
            return "";
          },
        });
      var Ht = (0, v.Z)(
        function e(t, n, r) {
          (0, h.Z)(this, e),
            (this._stop = !1),
            (this._end = !1),
            (this.defaultPrevented = !1),
            (this.button = 0),
            (this.timeStamp = Date.now()),
            (this.type = t.toLowerCase()),
            (this.mpEvent = r),
            (this.bubbles = Boolean(n && n.bubbles)),
            (this.cancelable = Boolean(n && n.cancelable));
        },
        [
          {
            key: "stopPropagation",
            value: function () {
              this._stop = !0;
            },
          },
          {
            key: "stopImmediatePropagation",
            value: function () {
              this._end = this._stop = !0;
            },
          },
          {
            key: "preventDefault",
            value: function () {
              this.defaultPrevented = !0;
            },
          },
          {
            key: "target",
            get: function () {
              var e,
                t,
                n,
                r,
                i = this.cacheTarget;
              if (i) return i;
              var o = Object.create(
                  (null === (e = this.mpEvent) || void 0 === e
                    ? void 0
                    : e.target) || null
                ),
                a = Re.document.getElementById(
                  (null === (t = o.targetDataset) || void 0 === t
                    ? void 0
                    : t.sid) ||
                    (null === (n = o.dataset) || void 0 === n
                      ? void 0
                      : n.sid) ||
                    o.id ||
                    null
                );
              for (var u in ((o.dataset = null !== a ? a.dataset : p.kT),
              null === (r = this.mpEvent) || void 0 === r ? void 0 : r.detail))
                o[u] = this.mpEvent.detail[u];
              return (this.cacheTarget = o), o;
            },
          },
          {
            key: "currentTarget",
            get: function () {
              var e,
                t,
                n,
                r,
                i,
                o,
                a,
                u,
                s = this.cacheCurrentTarget;
              if (s) return s;
              var c = Re.document,
                l = Object.create(
                  (null === (e = this.mpEvent) || void 0 === e
                    ? void 0
                    : e.currentTarget) || null
                ),
                d = c.getElementById(
                  (null === (t = l.dataset) || void 0 === t ? void 0 : t.sid) ||
                    l.id ||
                    null
                ),
                f = c.getElementById(
                  (null ===
                    (i =
                      null ===
                        (r =
                          null === (n = this.mpEvent) || void 0 === n
                            ? void 0
                            : n.target) || void 0 === r
                        ? void 0
                        : r.dataset) || void 0 === i
                    ? void 0
                    : i.sid) ||
                    (null ===
                      (a =
                        null === (o = this.mpEvent) || void 0 === o
                          ? void 0
                          : o.target) || void 0 === a
                      ? void 0
                      : a.id) ||
                    null
                );
              if (null === d || (d && d === f))
                return (this.cacheCurrentTarget = this.target), this.target;
              for (var h in ((l.dataset = d.dataset),
              null === (u = this.mpEvent) || void 0 === u ? void 0 : u.detail))
                l[h] = this.mpEvent.detail[h];
              return (this.cacheCurrentTarget = l), l;
            },
          },
        ]
      );
      function Ut(e, t) {
        if ("string" == typeof e)
          return new Ht(e, { bubbles: !0, cancelable: !0 });
        var n = new Ht(e.type, { bubbles: !0, cancelable: !0 }, e);
        for (var r in e)
          r !== Y && r !== G && r !== q && r !== K && (n[r] = e[r]);
        return (
          n.type === $ &&
            (null == t ? void 0 : t.nodeName) === W &&
            (n[J] = 13),
          n
        );
      }
      var Qt = {};
      function Ft(e) {
        var t = e[fe];
        return (0, p.o8)(t) || delete e[fe], t;
      }
      function Wt(e) {
        var t, n;
        void 0 === e.type &&
          Object.defineProperty(e, "type", { value: e._type }),
          void 0 === e.detail &&
            Object.defineProperty(e, "detail", {
              value: e._detail || Object.assign({}, e),
            }),
          (e.currentTarget =
            e.currentTarget || e.target || Object.assign({}, e)),
          p.PT.call("modifyMpEventImpl", e);
        var r = e.currentTarget,
          i =
            (null === (t = r.dataset) || void 0 === t ? void 0 : t.sid) ||
            r.id ||
            (null === (n = e.detail) || void 0 === n ? void 0 : n.id) ||
            "",
          o = Re.document.getElementById(i);
        if (o) {
          var a = function () {
            var t = Ut(e, o);
            p.PT.call("modifyTaroEvent", t, o),
              p.PT.call("dispatchTaroEvent", t, o),
              p.PT.call("dispatchTaroEventFinish", t, o);
          };
          if (!p.PT.isExist("batchedEventUpdates")) return a(), Ft(e);
          var u = e.type;
          if (
            !p.PT.call("isBubbleEvents", u) ||
            !(function (e, t) {
              for (
                var n;
                (e = (null == e ? void 0 : e.parentElement) || null);

              ) {
                if (!e || e.nodeName === C || "root-portal" === e.nodeName)
                  return !1;
                if (
                  null === (n = e.__handlers[t]) || void 0 === n
                    ? void 0
                    : n.length
                )
                  return !0;
              }
              return !1;
            })(o, u) ||
            (u === X && o.props.catchMove)
          )
            return (
              p.PT.call("batchedEventUpdates", function () {
                Qt[u] &&
                  (Qt[u].forEach(function (e) {
                    return e();
                  }),
                  delete Qt[u]),
                  a();
              }),
              Ft(e)
            );
          (Qt[u] || (Qt[u] = [])).push(a);
        }
      }
      var Vt = (function (e) {
          function t() {
            return (0, h.Z)(this, t), (0, c.Z)(this, t, arguments);
          }
          return (
            (0, l.Z)(t, e),
            (0, v.Z)(t, [
              {
                key: "type",
                get: function () {
                  var e;
                  return null !== (e = this.props[q]) && void 0 !== e ? e : "";
                },
                set: function (e) {
                  this.setAttribute(q, e);
                },
              },
              {
                key: "value",
                get: function () {
                  var e = this.props[F];
                  return null == e ? "" : e;
                },
                set: function (e) {
                  this.setAttribute(F, e);
                },
              },
              {
                key: "dispatchEvent",
                value: function (e) {
                  if (e.mpEvent) {
                    var n = e.mpEvent.detail.value;
                    e.type === V
                      ? (this.props.value = n)
                      : e.type === W && (this.value = n);
                  }
                  return (0, o.Z)(t, "dispatchEvent", this, 3)([e]);
                },
              },
            ])
          );
        })(lt),
        zt = new ((0, v.Z)(
          function e() {
            (0, h.Z)(this, e), (this.recorder = new Map());
          },
          [
            {
              key: "start",
              value: function (e) {
                dt.debug && this.recorder.set(e, Date.now());
              },
            },
            {
              key: "stop",
              value: function (e) {
                dt.debug &&
                  (Date.now(), this.recorder.get(e), this.recorder.delete(e));
              },
            },
          ]
        ))();
      function Gt(e, t) {
        var n,
          r = t.slice(1),
          i = e,
          o = "";
        if (
          (r.some(function (e, r) {
            var a = e
              .replace(/^\[(.+)\]$/, "$1")
              .replace(/\bcn\b/g, "childNodes");
            if (
              ((i = i[a]),
              (0, p.kJ)(i) &&
                (i = i.filter(function (e) {
                  return !Ee(e);
                })),
              (0, p.o8)(i))
            )
              return !0;
            if (i.nodeName === z) {
              var u = Pe.get(i.sid);
              u && ((n = u), (o = t.slice(r + 2).join(".")));
            }
          }),
          n)
        )
          return { customWrapper: n, splitedPath: o };
      }
      var Yt,
        qt,
        $t = (function (e) {
          function t() {
            var e;
            return (
              (0, h.Z)(this, t),
              ((e = (0, c.Z)(this, t)).updatePayloads = []),
              (e.updateCallbacks = []),
              (e.pendingUpdate = !1),
              (e.ctx = null),
              (e.nodeName = C),
              (e.tagName = C.toUpperCase()),
              e
            );
          }
          return (
            (0, l.Z)(t, e),
            (0, v.Z)(t, [
              {
                key: "_path",
                get: function () {
                  return C;
                },
              },
              {
                key: "_root",
                get: function () {
                  return this;
                },
              },
              {
                key: "enqueueUpdate",
                value: function (e) {
                  this.updatePayloads.push(e),
                    !this.pendingUpdate && this.ctx && this.performUpdate();
                },
              },
              {
                key: "performUpdate",
                value: function () {
                  var e = this,
                    t =
                      arguments.length > 0 &&
                      void 0 !== arguments[0] &&
                      arguments[0],
                    n = arguments.length > 1 ? arguments[1] : void 0;
                  this.pendingUpdate = !0;
                  var r = p.PT.call("proxyToRaw", this.ctx);
                  setTimeout(function () {
                    var i = "".concat(T, " 开始时间戳 ").concat(Date.now());
                    zt.start(i);
                    for (
                      var o = Object.create(null),
                        a = new Set(t ? ["root.cn.[0]", "root.cn[0]"] : []);
                      e.updatePayloads.length > 0;

                    ) {
                      var u = e.updatePayloads.shift(),
                        c = u.path,
                        l = u.value;
                      c.endsWith("cn") && a.add(c), (o[c] = l);
                    }
                    var d = function (e) {
                      a.forEach(function (t) {
                        e.includes(t) && e !== t && delete o[e];
                      });
                      var t = o[e];
                      (0, p.mf)(t) && (o[e] = t());
                    };
                    for (var f in o) d(f);
                    if ((0, p.mf)(n)) return n(o);
                    e.pendingUpdate = !1;
                    var h = {},
                      v = new Map();
                    if (t) h = o;
                    else
                      for (var g in o) {
                        var m = g.split("."),
                          b = Gt(e, m);
                        if (b) {
                          var y = b.customWrapper,
                            k = b.splitedPath;
                          v.set(
                            y,
                            Object.assign(
                              Object.assign({}, v.get(y) || {}),
                              (0, s.Z)({}, "i.".concat(k), o[g])
                            )
                          );
                        } else h[g] = o[g];
                      }
                    var w = v.size,
                      C = Object.keys(h).length > 0,
                      S = w + (C ? 1 : 0),
                      _ = 0,
                      P = function () {
                        ++_ === S &&
                          (zt.stop(i),
                          e.flushUpdateCallback(),
                          t && zt.stop(E));
                      };
                    w &&
                      v.forEach(function (e, t) {
                        t.setData(e, P);
                      }),
                      C && r.setData(h, P);
                  }, 0);
                },
              },
              {
                key: "enqueueUpdateCallback",
                value: function (e, t) {
                  this.updateCallbacks.push(function () {
                    t ? e.call(t) : e();
                  });
                },
              },
              {
                key: "flushUpdateCallback",
                value: function () {
                  var e = this.updateCallbacks;
                  if (e.length) {
                    var t = e.slice(0);
                    this.updateCallbacks.length = 0;
                    for (var n = 0; n < t.length; n++) t[n]();
                  }
                },
              },
            ])
          );
        })(lt),
        Kt = (function (e) {
          function t(e) {
            var n;
            return (
              (0, h.Z)(this, t),
              ((n = (0, c.Z)(this, t)).nodeType = 3),
              (n.nodeName = "#text"),
              (n._value = e),
              n
            );
          }
          return (
            (0, l.Z)(t, e),
            (0, v.Z)(t, [
              {
                key: "textContent",
                get: function () {
                  return this._value;
                },
                set: function (e) {
                  ke.record({
                    target: this,
                    type: "characterData",
                    oldValue: this._value,
                  }),
                    (this._value = e),
                    this.enqueueUpdate({
                      path: "".concat(this._path, ".", "v"),
                      value: e,
                    });
                },
              },
              {
                key: "nodeValue",
                get: function () {
                  return this._value;
                },
                set: function (e) {
                  this.textContent = e;
                },
              },
              {
                key: "data",
                get: function () {
                  return this._value;
                },
                set: function (e) {
                  this.textContent = e;
                },
              },
            ])
          );
        })(Me),
        Jt = /[!'()~]|%20|%00/g,
        Xt = /\+/g,
        en = {
          "!": "%21",
          "'": "%27",
          "(": "%28",
          ")": "%29",
          "~": "%7E",
          "%20": "+",
          "%00": "\0",
        };
      function tn(e) {
        return en[e];
      }
      function nn(e, t, n) {
        var r = (0, p.kJ)(n) ? n.join(",") : n;
        t in e ? e[t].push(r) : (e[t] = [r]);
      }
      function rn(e, t) {
        nn(this, t, e);
      }
      function on(e) {
        return decodeURIComponent(e.replace(Xt, " "));
      }
      function an(e) {
        return encodeURIComponent(e).replace(Jt, tn);
      }
      var un,
        sn,
        cn,
        ln,
        dn,
        fn,
        hn =
          ((qt = (0, v.Z)(
            function e(t) {
              (0, h.Z)(this, e),
                Yt.set(this, Object.create(null)),
                null != t || (t = "");
              var n = (0, g.Q_)(this, Yt, "f");
              if ("string" == typeof t) {
                "?" === t.charAt(0) && (t = t.slice(1));
                for (var r = t.split("&"), i = 0, o = r.length; i < o; i++) {
                  var a = r[i],
                    u = a.indexOf("=");
                  u > -1
                    ? nn(n, on(a.slice(0, u)), on(a.slice(u + 1)))
                    : a.length && nn(n, on(a), "");
                }
              } else if ((0, p.kJ)(t))
                for (var s = 0, c = t.length; s < c; s++) {
                  var l = t[s];
                  nn(n, l[0], l[1]);
                }
              else if (t.forEach) t.forEach(rn, n);
              else for (var d in t) nn(n, d, t[d]);
            },
            [
              {
                key: "append",
                value: function (e, t) {
                  nn((0, g.Q_)(this, Yt, "f"), e, t);
                },
              },
              {
                key: "delete",
                value: function (e) {
                  delete (0, g.Q_)(this, Yt, "f")[e];
                },
              },
              {
                key: "get",
                value: function (e) {
                  var t = (0, g.Q_)(this, Yt, "f");
                  return e in t ? t[e][0] : null;
                },
              },
              {
                key: "getAll",
                value: function (e) {
                  var t = (0, g.Q_)(this, Yt, "f");
                  return e in t ? t[e].slice(0) : [];
                },
              },
              {
                key: "has",
                value: function (e) {
                  return e in (0, g.Q_)(this, Yt, "f");
                },
              },
              {
                key: "keys",
                value: function () {
                  return Object.keys((0, g.Q_)(this, Yt, "f"));
                },
              },
              {
                key: "set",
                value: function (e, t) {
                  (0, g.Q_)(this, Yt, "f")[e] = ["" + t];
                },
              },
              {
                key: "forEach",
                value: function (e, t) {
                  var n = (0, g.Q_)(this, Yt, "f");
                  Object.getOwnPropertyNames(n).forEach(function (r) {
                    n[r].forEach(function (n) {
                      e.call(t, n, r, this);
                    }, this);
                  }, this);
                },
              },
              {
                key: "toJSON",
                value: function () {
                  return {};
                },
              },
              {
                key: "toString",
                value: function () {
                  var e = (0, g.Q_)(this, Yt, "f"),
                    t = [];
                  for (var n in e)
                    for (var r = an(n), i = 0, o = e[n]; i < o.length; i++)
                      t.push(r + "=" + an(o[i]));
                  return t.join("&");
                },
              },
            ]
          )),
          (Yt = new WeakMap()),
          qt),
        vn = (0, v.Z)(
          function e(t, n) {
            (0, h.Z)(this, e),
              un.set(this, ""),
              sn.set(this, ""),
              cn.set(this, ""),
              ln.set(this, ""),
              dn.set(this, ""),
              fn.set(this, void 0),
              (0, p.HD)(t) || (t = String(t));
            var r = (function (e, t) {
                var n = /^(https?:)\/\//i,
                  r = "",
                  i = null;
                if (!(0, p.o8)(t)) {
                  if (((t = String(t).trim()), !n.test(t)))
                    throw new TypeError(
                      "Failed to construct 'URL': Invalid base URL"
                    );
                  i = gn(t);
                }
                if (((e = String(e).trim()), n.test(e))) r = e;
                else {
                  if (!i)
                    throw new TypeError(
                      "Failed to construct 'URL': Invalid URL"
                    );
                  r = e
                    ? e.startsWith("//")
                      ? i.protocol + e
                      : i.origin + (e.startsWith("/") ? e : "/".concat(e))
                    : i.href;
                }
                return gn(r);
              })(t, n),
              i = r.hash,
              o = r.hostname,
              a = r.pathname,
              u = r.port,
              s = r.protocol,
              c = r.search;
            (0, g.YH)(this, un, i, "f"),
              (0, g.YH)(this, sn, o, "f"),
              (0, g.YH)(this, cn, a || "/", "f"),
              (0, g.YH)(this, ln, u, "f"),
              (0, g.YH)(this, dn, s, "f"),
              (0, g.YH)(this, fn, new hn(c), "f");
          },
          [
            {
              key: "protocol",
              get: function () {
                return (0, g.Q_)(this, dn, "f");
              },
              set: function (e) {
                (0, p.HD)(e) && (0, g.YH)(this, dn, e.trim(), "f");
              },
            },
            {
              key: "host",
              get: function () {
                return this.hostname + (this.port ? ":" + this.port : "");
              },
              set: function (e) {
                if (e && (0, p.HD)(e)) {
                  e = e.trim();
                  var t = gn("//".concat(e)),
                    n = t.hostname,
                    r = t.port;
                  (this.hostname = n), (this.port = r);
                }
              },
            },
            {
              key: "hostname",
              get: function () {
                return (0, g.Q_)(this, sn, "f");
              },
              set: function (e) {
                e && (0, p.HD)(e) && (0, g.YH)(this, sn, e.trim(), "f");
              },
            },
            {
              key: "port",
              get: function () {
                return (0, g.Q_)(this, ln, "f");
              },
              set: function (e) {
                (0, p.HD)(e) && (0, g.YH)(this, ln, e.trim(), "f");
              },
            },
            {
              key: "pathname",
              get: function () {
                return (0, g.Q_)(this, cn, "f");
              },
              set: function (e) {
                if ((0, p.HD)(e)) {
                  for (
                    var t = /^(\/|\.\/|\.\.\/)/, n = (e = e.trim());
                    t.test(n);

                  )
                    n = n.replace(t, "");
                  n
                    ? (0, g.YH)(this, cn, "/" + n, "f")
                    : (0, g.YH)(this, cn, "/", "f");
                }
              },
            },
            {
              key: "search",
              get: function () {
                var e = (0, g.Q_)(this, fn, "f").toString();
                return 0 === e.length || e.startsWith("?") ? e : "?".concat(e);
              },
              set: function (e) {
                (0, p.HD)(e) &&
                  ((e = e.trim()), (0, g.YH)(this, fn, new hn(e), "f"));
              },
            },
            {
              key: "hash",
              get: function () {
                return (0, g.Q_)(this, un, "f");
              },
              set: function (e) {
                (0, p.HD)(e) &&
                  ((e = e.trim())
                    ? (0, g.YH)(
                        this,
                        un,
                        e.startsWith("#") ? e : "#".concat(e),
                        "f"
                      )
                    : (0, g.YH)(this, un, "", "f"));
              },
            },
            {
              key: "href",
              get: function () {
                return ""
                  .concat(this.protocol, "//")
                  .concat(this.host)
                  .concat(this.pathname)
                  .concat(this.search)
                  .concat(this.hash);
              },
              set: function (e) {
                if (e && (0, p.HD)(e)) {
                  var t = gn((e = e.trim())),
                    n = t.protocol,
                    r = t.hostname,
                    i = t.port,
                    o = t.hash,
                    a = t.search,
                    u = t.pathname;
                  (this.protocol = n),
                    (this.hostname = r),
                    (this.pathname = u),
                    (this.port = i),
                    (this.hash = o),
                    (this.search = a);
                }
              },
            },
            {
              key: "origin",
              get: function () {
                return "".concat(this.protocol, "//").concat(this.host);
              },
              set: function (e) {
                if (e && (0, p.HD)(e)) {
                  var t = gn((e = e.trim())),
                    n = t.protocol,
                    r = t.hostname,
                    i = t.port;
                  (this.protocol = n), (this.hostname = r), (this.port = i);
                }
              },
            },
            {
              key: "searchParams",
              get: function () {
                return (0, g.Q_)(this, fn, "f");
              },
            },
            {
              key: "toString",
              value: function () {
                return this.href;
              },
            },
            {
              key: "toJSON",
              value: function () {
                return this.toString();
              },
            },
            {
              key: "_toRaw",
              value: function () {
                return {
                  protocol: this.protocol,
                  port: this.port,
                  host: this.host,
                  hostname: this.hostname,
                  pathname: this.pathname,
                  hash: this.hash,
                  search: this.search,
                  origin: this.origin,
                  href: this.href,
                };
              },
            },
          ],
          [
            {
              key: "createObjectURL",
              value: function () {
                throw new Error(
                  "Oops, not support URL.createObjectURL() in miniprogram."
                );
              },
            },
            {
              key: "revokeObjectURL",
              value: function () {
                throw new Error(
                  "Oops, not support URL.revokeObjectURL() in miniprogram."
                );
              },
            },
          ]
        );
      (un = new WeakMap()),
        (sn = new WeakMap()),
        (cn = new WeakMap()),
        (ln = new WeakMap()),
        (dn = new WeakMap()),
        (fn = new WeakMap());
      var pn = vn;
      function gn() {
        var e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "",
          t = {
            href: "",
            origin: "",
            protocol: "",
            hostname: "",
            host: "",
            port: "",
            pathname: "",
            search: "",
            hash: "",
          };
        if (!e || !(0, p.HD)(e)) return t;
        var n =
            /^(([^:/?#]+):)?\/\/(([^/?#]+):(.+)@)?([^/?#:]*)(:(\d+))?([^?#]*)(\?([^#]*))?(#(.*))?/,
          r = (e = e.trim()).match(n);
        return r
          ? ((t.protocol = r[1] || "https:"),
            (t.hostname = r[6] || "taro.com"),
            (t.port = r[8] || ""),
            (t.pathname = r[9] || "/"),
            (t.search = r[10] || ""),
            (t.hash = r[12] || ""),
            (t.href = e),
            (t.origin = t.protocol + "//" + t.hostname),
            (t.host = t.hostname + (t.port ? ":".concat(t.port) : "")),
            t)
          : t;
      }
      var mn,
        bn,
        yn,
        kn,
        wn,
        Tn,
        En = (function (e) {
          function t() {
            return (0, h.Z)(this, t), (0, c.Z)(this, t, arguments);
          }
          return (
            (0, l.Z)(t, e),
            (0, v.Z)(t, [
              {
                key: "href",
                get: function () {
                  var e;
                  return null !== (e = this.props.href) && void 0 !== e
                    ? e
                    : "";
                },
                set: function (e) {
                  this.setAttribute("href", e);
                },
              },
              {
                key: "protocol",
                get: function () {
                  var e;
                  return null !== (e = this.props.protocol) && void 0 !== e
                    ? e
                    : "";
                },
              },
              {
                key: "host",
                get: function () {
                  var e;
                  return null !== (e = this.props.host) && void 0 !== e
                    ? e
                    : "";
                },
              },
              {
                key: "search",
                get: function () {
                  var e;
                  return null !== (e = this.props.search) && void 0 !== e
                    ? e
                    : "";
                },
              },
              {
                key: "hash",
                get: function () {
                  var e;
                  return null !== (e = this.props.hash) && void 0 !== e
                    ? e
                    : "";
                },
              },
              {
                key: "hostname",
                get: function () {
                  var e;
                  return null !== (e = this.props.hostname) && void 0 !== e
                    ? e
                    : "";
                },
              },
              {
                key: "port",
                get: function () {
                  var e;
                  return null !== (e = this.props.port) && void 0 !== e
                    ? e
                    : "";
                },
              },
              {
                key: "pathname",
                get: function () {
                  var e;
                  return null !== (e = this.props.pathname) && void 0 !== e
                    ? e
                    : "";
                },
              },
              {
                key: "setAttribute",
                value: function (e, n) {
                  if ("href" === e) {
                    var r = gn(n);
                    for (var i in r)
                      (0, o.Z)(t, "setAttribute", this, 3)([i, r[i]]);
                  } else (0, o.Z)(t, "setAttribute", this, 3)([e, n]);
                },
              },
            ])
          );
        })(lt),
        Cn = (function (e) {
          function t(e) {
            var n;
            return (
              (0, h.Z)(this, t),
              ((n = (0, c.Z)(this, t)).dataName = e),
              (n.isTransferElement = !0),
              n
            );
          }
          return (
            (0, l.Z)(t, e),
            (0, v.Z)(t, [
              {
                key: "_path",
                get: function () {
                  return this.dataName;
                },
              },
            ])
          );
        })(lt),
        Sn = (function (e) {
          function t() {
            var e;
            return (
              (0, h.Z)(this, t),
              ((e = (0, c.Z)(this, t)).createEvent = Ut),
              (e.nodeType = 9),
              (e.nodeName = A),
              e
            );
          }
          return (
            (0, l.Z)(t, e),
            (0, v.Z)(t, [
              {
                key: "createElement",
                value: function (e) {
                  var t,
                    n = e.toLowerCase();
                  switch (!0) {
                    case n === C:
                      return (t = new $t());
                    case p._c.has(n):
                      t = new Vt();
                      break;
                    case n === ve:
                      t = new En();
                      break;
                    case "page-meta" === n:
                    case "navigation-bar" === n:
                      t = new Cn((0, p.CA)(n));
                      break;
                    default:
                      t = new lt();
                  }
                  return (t.nodeName = n), (t.tagName = e.toUpperCase()), t;
                },
              },
              {
                key: "createElementNS",
                value: function (e, t) {
                  return this.createElement(t);
                },
              },
              {
                key: "createTextNode",
                value: function (e) {
                  return new Kt(e);
                },
              },
              {
                key: "getElementById",
                value: function (e) {
                  var t = Le.get(e);
                  return (0, p.o8)(t) ? null : t;
                },
              },
              {
                key: "querySelector",
                value: function (e) {
                  return /^#/.test(e) ? this.getElementById(e.slice(1)) : null;
                },
              },
              {
                key: "querySelectorAll",
                value: function () {
                  return [];
                },
              },
              {
                key: "createComment",
                value: function () {
                  var e = new Kt("");
                  return (e.nodeName = oe), e;
                },
              },
              {
                key: "defaultView",
                get: function () {
                  return Re.window;
                },
              },
            ])
          );
        })(lt),
        _n = (Re.document = (function () {
          var e = new Sn(),
            t = e.createElement.bind(e),
            n = t(S),
            r = t(_),
            i = t(P),
            o = t(x);
          o.id = x;
          var a = t(I);
          return (
            e.appendChild(n),
            n.appendChild(r),
            n.appendChild(i),
            i.appendChild(a),
            a.appendChild(o),
            (e.documentElement = n),
            (e.head = r),
            (e.body = i),
            e
          );
        })()),
        Pn = function (e) {
          return e.style;
        },
        xn = p.PT.call("getEventCenter", p.zW),
        In = (0, v.Z)(
          function e(t) {
            (0, h.Z)(this, e), (this.cache = new Map()), (this.name = t);
          },
          [
            {
              key: "has",
              value: function (e) {
                return this.cache.has(e);
              },
            },
            {
              key: "set",
              value: function (e, t) {
                e && t && this.cache.set(e, t);
              },
            },
            {
              key: "get",
              value: function (e) {
                if (this.has(e)) return this.cache.get(e);
              },
            },
            {
              key: "delete",
              value: function (e) {
                this.cache.delete(e);
              },
            },
          ]
        ),
        An = new In("history"),
        Nn = (function (e) {
          function t(e, n) {
            var i;
            return (
              (0, h.Z)(this, t),
              (i = (0, c.Z)(this, t)),
              mn.add(i),
              bn.set(i, void 0),
              yn.set(i, []),
              kn.set(i, 0),
              wn.set(i, void 0),
              (0, g.YH)(i, wn, n.window, "f"),
              (0, g.YH)(i, bn, e, "f"),
              (0, g.Q_)(i, bn, "f").on(
                "__record_history__",
                function (e) {
                  var t;
                  (0, g.YH)(i, kn, ((t = (0, g.Q_)(i, kn, "f")), ++t), "f"),
                    (0, g.YH)(
                      i,
                      yn,
                      (0, g.Q_)(i, yn, "f").slice(0, (0, g.Q_)(i, kn, "f")),
                      "f"
                    ),
                    (0, g.Q_)(i, yn, "f").push({
                      state: null,
                      title: "",
                      url: e,
                    });
                },
                null
              ),
              (0, g.Q_)(i, bn, "f").on(
                "__reset_history__",
                function (e) {
                  (0, g.Q_)(i, mn, "m", Tn).call(i, e);
                },
                null
              ),
              i.on(
                r.INIT,
                function () {
                  (0, g.Q_)(i, mn, "m", Tn).call(i);
                },
                null
              ),
              i.on(
                r.RESTORE,
                function (e) {
                  An.set(e, {
                    location: (0, g.Q_)(i, bn, "f"),
                    stack: (0, g.Q_)(i, yn, "f").slice(),
                    cur: (0, g.Q_)(i, kn, "f"),
                  });
                },
                null
              ),
              i.on(
                r.RECOVER,
                function (e) {
                  if (An.has(e)) {
                    var t = An.get(e);
                    (0, g.YH)(i, bn, t.location, "f"),
                      (0, g.YH)(i, yn, t.stack, "f"),
                      (0, g.YH)(i, kn, t.cur, "f");
                  }
                },
                null
              ),
              i.on(
                r.DESTORY,
                function (e) {
                  An.delete(e);
                },
                null
              ),
              (0, g.Q_)(i, mn, "m", Tn).call(i),
              i
            );
          }
          return (
            (0, l.Z)(t, e),
            (0, v.Z)(t, [
              {
                key: "length",
                get: function () {
                  return (0, g.Q_)(this, yn, "f").length;
                },
              },
              {
                key: "state",
                get: function () {
                  return (0, g.Q_)(this, yn, "f")[(0, g.Q_)(this, kn, "f")]
                    .state;
                },
              },
              {
                key: "go",
                value: function (e) {
                  if ((0, p.hj)(e) && !isNaN(e)) {
                    var t = (0, g.Q_)(this, kn, "f") + e;
                    (t = Math.min(Math.max(t, 0), this.length - 1)),
                      (0, g.YH)(this, kn, t, "f"),
                      (0, g.Q_)(this, bn, "f").trigger(
                        "__set_href_without_history__",
                        (0, g.Q_)(this, yn, "f")[(0, g.Q_)(this, kn, "f")].url
                      ),
                      (0, g.Q_)(this, wn, "f").trigger(
                        "popstate",
                        (0, g.Q_)(this, yn, "f")[(0, g.Q_)(this, kn, "f")]
                      );
                  }
                },
              },
              {
                key: "back",
                value: function () {
                  this.go(-1);
                },
              },
              {
                key: "forward",
                value: function () {
                  this.go(1);
                },
              },
              {
                key: "pushState",
                value: function (e, t, n) {
                  n &&
                    (0, p.HD)(n) &&
                    ((0, g.YH)(
                      this,
                      yn,
                      (0, g.Q_)(this, yn, "f").slice(
                        0,
                        (0, g.Q_)(this, kn, "f") + 1
                      ),
                      "f"
                    ),
                    (0, g.Q_)(this, yn, "f").push({
                      state: e,
                      title: t,
                      url: n,
                    }),
                    (0, g.YH)(this, kn, this.length - 1, "f"),
                    (0, g.Q_)(this, bn, "f").trigger(
                      "__set_href_without_history__",
                      n
                    ));
                },
              },
              {
                key: "replaceState",
                value: function (e, t, n) {
                  n &&
                    (0, p.HD)(n) &&
                    (((0, g.Q_)(this, yn, "f")[(0, g.Q_)(this, kn, "f")] = {
                      state: e,
                      title: t,
                      url: n,
                    }),
                    (0, g.Q_)(this, bn, "f").trigger(
                      "__set_href_without_history__",
                      n
                    ));
                },
              },
              {
                key: "cache",
                get: function () {
                  return An;
                },
              },
            ])
          );
        })(p.zW);
      (bn = new WeakMap()),
        (yn = new WeakMap()),
        (kn = new WeakMap()),
        (wn = new WeakMap()),
        (mn = new WeakSet()),
        (Tn = function () {
          var e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
          (0, g.YH)(
            this,
            yn,
            [
              {
                state: null,
                title: "",
                url: e || (0, g.Q_)(this, bn, "f").href,
              },
            ],
            "f"
          ),
            (0, g.YH)(this, kn, 0, "f");
        });
      var On,
        Ln,
        Rn,
        Zn,
        Bn,
        Dn,
        Mn,
        jn,
        Hn,
        Un = Nn,
        Qn = { app: null, router: null, page: null },
        Fn = function () {
          return Qn;
        },
        Wn = "https://taro.com",
        Vn = new In("location"),
        zn = (function (e) {
          function t(e) {
            var n;
            return (
              (0, h.Z)(this, t),
              (n = (0, c.Z)(this, t)),
              On.add(n),
              Ln.set(n, new pn(Wn)),
              Rn.set(n, !1),
              Zn.set(n, void 0),
              (0, g.YH)(n, Zn, e.window, "f"),
              (0, g.Q_)(n, On, "m", Bn).call(n),
              n.on(
                "__set_href_without_history__",
                function (e) {
                  (0, g.YH)(n, Rn, !0, "f");
                  var t = (0, g.Q_)(n, Ln, "f").hash;
                  ((0, g.Q_)(n, Ln, "f").href = (function () {
                    var e =
                        arguments.length > 0 && void 0 !== arguments[0]
                          ? arguments[0]
                          : "",
                      t = Wn;
                    return /^[/?#]/.test(e) ? t + e : e;
                  })(e)),
                    t !== (0, g.Q_)(n, Ln, "f").hash &&
                      (0, g.Q_)(n, Zn, "f").trigger("hashchange"),
                    (0, g.YH)(n, Rn, !1, "f");
                },
                null
              ),
              n.on(
                r.INIT,
                function () {
                  (0, g.Q_)(n, On, "m", Bn).call(n);
                },
                null
              ),
              n.on(
                r.RESTORE,
                function (e) {
                  Vn.set(e, { lastHref: n.href });
                },
                null
              ),
              n.on(
                r.RECOVER,
                function (e) {
                  if (Vn.has(e)) {
                    var t = Vn.get(e);
                    (0, g.YH)(n, Rn, !0, "f"),
                      ((0, g.Q_)(n, Ln, "f").href = t.lastHref),
                      (0, g.YH)(n, Rn, !1, "f");
                  }
                },
                null
              ),
              n.on(
                r.DESTORY,
                function (e) {
                  Vn.delete(e);
                },
                null
              ),
              n
            );
          }
          return (
            (0, l.Z)(t, e),
            (0, v.Z)(t, [
              {
                key: "protocol",
                get: function () {
                  return (0, g.Q_)(this, Ln, "f").protocol;
                },
                set: function (e) {
                  if (e && (0, p.HD)(e) && /^(http|https):$/i.test(e.trim())) {
                    e = e.trim();
                    var t = (0, g.Q_)(this, On, "m", Dn).call(this);
                    ((0, g.Q_)(this, Ln, "f").protocol = e),
                      (0, g.Q_)(this, On, "m", Hn).call(this, t) &&
                        (0, g.Q_)(this, On, "m", jn).call(this);
                  }
                },
              },
              {
                key: "host",
                get: function () {
                  return (0, g.Q_)(this, Ln, "f").host;
                },
                set: function (e) {
                  if (e && (0, p.HD)(e)) {
                    e = e.trim();
                    var t = (0, g.Q_)(this, On, "m", Dn).call(this);
                    ((0, g.Q_)(this, Ln, "f").host = e),
                      (0, g.Q_)(this, On, "m", Hn).call(this, t) &&
                        (0, g.Q_)(this, On, "m", jn).call(this);
                  }
                },
              },
              {
                key: "hostname",
                get: function () {
                  return (0, g.Q_)(this, Ln, "f").hostname;
                },
                set: function (e) {
                  if (e && (0, p.HD)(e)) {
                    e = e.trim();
                    var t = (0, g.Q_)(this, On, "m", Dn).call(this);
                    ((0, g.Q_)(this, Ln, "f").hostname = e),
                      (0, g.Q_)(this, On, "m", Hn).call(this, t) &&
                        (0, g.Q_)(this, On, "m", jn).call(this);
                  }
                },
              },
              {
                key: "port",
                get: function () {
                  return (0, g.Q_)(this, Ln, "f").port;
                },
                set: function (e) {
                  var t = Number((e = e.trim()));
                  if ((0, p.hj)(t) && !(t <= 0)) {
                    var n = (0, g.Q_)(this, On, "m", Dn).call(this);
                    ((0, g.Q_)(this, Ln, "f").port = e),
                      (0, g.Q_)(this, On, "m", Hn).call(this, n) &&
                        (0, g.Q_)(this, On, "m", jn).call(this);
                  }
                },
              },
              {
                key: "pathname",
                get: function () {
                  return (0, g.Q_)(this, Ln, "f").pathname;
                },
                set: function (e) {
                  if (e && (0, p.HD)(e)) {
                    e = e.trim();
                    var t = (0, g.Q_)(this, On, "m", Dn).call(this);
                    ((0, g.Q_)(this, Ln, "f").pathname = e),
                      (0, g.Q_)(this, On, "m", Hn).call(this, t) &&
                        (0, g.Q_)(this, On, "m", jn).call(this);
                  }
                },
              },
              {
                key: "search",
                get: function () {
                  return (0, g.Q_)(this, Ln, "f").search;
                },
                set: function (e) {
                  if (e && (0, p.HD)(e)) {
                    e = (e = e.trim()).startsWith("?") ? e : "?".concat(e);
                    var t = (0, g.Q_)(this, On, "m", Dn).call(this);
                    ((0, g.Q_)(this, Ln, "f").search = e),
                      (0, g.Q_)(this, On, "m", Hn).call(this, t) &&
                        (0, g.Q_)(this, On, "m", jn).call(this);
                  }
                },
              },
              {
                key: "hash",
                get: function () {
                  return (0, g.Q_)(this, Ln, "f").hash;
                },
                set: function (e) {
                  if (e && (0, p.HD)(e)) {
                    e = (e = e.trim()).startsWith("#") ? e : "#".concat(e);
                    var t = (0, g.Q_)(this, On, "m", Dn).call(this);
                    ((0, g.Q_)(this, Ln, "f").hash = e),
                      (0, g.Q_)(this, On, "m", Hn).call(this, t) &&
                        (0, g.Q_)(this, On, "m", jn).call(this);
                  }
                },
              },
              {
                key: "href",
                get: function () {
                  return (0, g.Q_)(this, Ln, "f").href;
                },
                set: function (e) {
                  if (
                    e &&
                    (0, p.HD)(e) &&
                    /^(http:|https:)?\/\/.+/.test((e = e.trim()))
                  ) {
                    var t = (0, g.Q_)(this, On, "m", Dn).call(this);
                    ((0, g.Q_)(this, Ln, "f").href = e),
                      (0, g.Q_)(this, On, "m", Hn).call(this, t) &&
                        (0, g.Q_)(this, On, "m", jn).call(this);
                  }
                },
              },
              {
                key: "origin",
                get: function () {
                  return (0, g.Q_)(this, Ln, "f").origin;
                },
                set: function (e) {
                  if (
                    e &&
                    (0, p.HD)(e) &&
                    /^(http:|https:)?\/\/.+/.test((e = e.trim()))
                  ) {
                    var t = (0, g.Q_)(this, On, "m", Dn).call(this);
                    ((0, g.Q_)(this, Ln, "f").origin = e),
                      (0, g.Q_)(this, On, "m", Hn).call(this, t) &&
                        (0, g.Q_)(this, On, "m", jn).call(this);
                  }
                },
              },
              {
                key: "assign",
                value: function () {
                  (0, p.ZK)(!0, "小程序环境中调用location.assign()无效.");
                },
              },
              {
                key: "reload",
                value: function () {
                  (0, p.ZK)(!0, "小程序环境中调用location.reload()无效.");
                },
              },
              {
                key: "replace",
                value: function (e) {
                  this.trigger("__set_href_without_history__", e);
                },
              },
              {
                key: "toString",
                value: function () {
                  return this.href;
                },
              },
              {
                key: "cache",
                get: function () {
                  return Vn;
                },
              },
            ])
          );
        })(p.zW);
      (Ln = new WeakMap()),
        (Rn = new WeakMap()),
        (Zn = new WeakMap()),
        (On = new WeakSet()),
        (Bn = function () {
          var e = Fn().router;
          if (e) {
            var t = e.path,
              n = e.params,
              r = Object.keys(n).map(function (e) {
                return "".concat(e, "=").concat(n[e]);
              }),
              i = r.length > 0 ? "?" + r.join("&") : "",
              o = ""
                .concat(Wn)
                .concat(t.startsWith("/") ? t : "/" + t)
                .concat(i);
            (0, g.YH)(this, Ln, new pn(o), "f"),
              this.trigger("__reset_history__", this.href);
          }
        }),
        (Dn = function () {
          return (0, g.Q_)(this, Ln, "f")._toRaw();
        }),
        (Mn = function (e) {
          (0, g.Q_)(this, Ln, "f").href = e;
        }),
        (jn = function () {
          this.trigger("__record_history__", this.href);
        }),
        (Hn = function (e) {
          if ((0, g.Q_)(this, Rn, "f")) return !1;
          var t = (0, g.Q_)(this, Ln, "f")._toRaw(),
            n = t.protocol,
            r = t.hostname,
            i = t.port,
            o = t.pathname,
            a = t.search,
            u = t.hash;
          return n !== e.protocol || r !== e.hostname || i !== e.port
            ? ((0, g.Q_)(this, On, "m", Mn).call(this, e.href), !1)
            : o !== e.pathname ||
                a !== e.search ||
                (u !== e.hash
                  ? ((0, g.Q_)(this, Zn, "f").trigger("hashchange"), !0)
                  : ((0, g.Q_)(this, On, "m", Mn).call(this, e.href), !1));
        });
      var Gn,
        Yn = zn,
        qn =
          "(Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/534.36 (KHTML, like Gecko) NodeJS/v4.1.0 Chrome/76.0.3809.132 Safari/534.36",
        $n = {
          appCodeName: "Mozilla",
          appName: "Netscape",
          appVersion: "5.0 " + qn,
          cookieEnabled: !0,
          mimeTypes: [],
          onLine: !0,
          platform: "MacIntel",
          plugins: [],
          product: "Taro",
          productSub: "20030107",
          userAgent: "Mozilla/5.0 " + qn,
          vendor: "Joyent",
          vendorSub: "",
        };
      !(function () {
        var e;
        "undefined" != typeof performance &&
        null !== performance &&
        performance.now
          ? (Gn = function () {
              return performance.now();
            })
          : Date.now
          ? ((e = Date.now()),
            (Gn = function () {
              return Date.now() - e;
            }))
          : ((e = new Date().getTime()),
            (Gn = function () {
              return new Date().getTime() - e;
            }));
      })();
      var Kn = 0,
        Jn =
          null != m
            ? m
            : function (e) {
                var t = Gn(),
                  n = Math.max(Kn + 16, t);
                return setTimeout(function () {
                  e((Kn = n));
                }, n - t);
              },
        Xn =
          null != b
            ? b
            : function (e) {
                clearTimeout(e);
              },
        er = (function (e) {
          function t() {
            var e;
            return (
              (0, h.Z)(this, t),
              ((e = (0, c.Z)(this, t)).navigator = $n),
              (e.requestAnimationFrame = Jn),
              (e.cancelAnimationFrame = Xn),
              (e.getComputedStyle = Pn),
              []
                .concat(
                  (0, f.Z)(Object.getOwnPropertyNames(n.g || {})),
                  (0, f.Z)(Object.getOwnPropertySymbols(n.g || {}))
                )
                .forEach(function (t) {
                  if (
                    "atob" !== t &&
                    "document" !== t &&
                    !Object.prototype.hasOwnProperty.call(e, t)
                  )
                    try {
                      e[t] = n.g[t];
                    } catch (e) {}
                }),
              e.Date || (e.Date = Date),
              (e.location = new Yn({ window: e })),
              (e.history = new Un(e.location, { window: e })),
              e.initEvent(),
              e
            );
          }
          return (
            (0, l.Z)(t, e),
            (0, v.Z)(t, [
              {
                key: "initEvent",
                value: function () {
                  var e = this.location,
                    t = this.history;
                  this.on(
                    r.INIT,
                    function (t) {
                      e.trigger(r.INIT, t);
                    },
                    null
                  ),
                    this.on(
                      r.RECOVER,
                      function (n) {
                        e.trigger(r.RECOVER, n), t.trigger(r.RECOVER, n);
                      },
                      null
                    ),
                    this.on(
                      r.RESTORE,
                      function (n) {
                        e.trigger(r.RESTORE, n), t.trigger(r.RESTORE, n);
                      },
                      null
                    ),
                    this.on(
                      r.DESTORY,
                      function (n) {
                        e.trigger(r.DESTORY, n), t.trigger(r.DESTORY, n);
                      },
                      null
                    );
                },
              },
              {
                key: "document",
                get: function () {
                  return Re.document;
                },
              },
              {
                key: "addEventListener",
                value: function (e, t) {
                  (0, p.HD)(e) && this.on(e, t, null);
                },
              },
              {
                key: "removeEventListener",
                value: function (e, t) {
                  (0, p.HD)(e) && this.off(e, t, null);
                },
              },
              {
                key: "setTimeout",
                value: (function (e) {
                  function t() {
                    return e.apply(this, arguments);
                  }
                  return (
                    (t.toString = function () {
                      return e.toString();
                    }),
                    t
                  );
                })(function () {
                  return setTimeout.apply(void 0, arguments);
                }),
              },
              {
                key: "clearTimeout",
                value: (function (e) {
                  function t() {
                    return e.apply(this, arguments);
                  }
                  return (
                    (t.toString = function () {
                      return e.toString();
                    }),
                    t
                  );
                })(function () {
                  return clearTimeout.apply(void 0, arguments);
                }),
              },
            ])
          );
        })(p.zW),
        tr = (Re.window = new er()),
        nr = tr.location,
        rr = tr.history,
        ir = (function (e) {
          function t() {
            return (0, h.Z)(this, t), (0, c.Z)(this, t, arguments);
          }
          return (0, l.Z)(t, e), (0, v.Z)(t);
        })(lt),
        or = function () {
          var e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
          return "/" === e.charAt(0) ? e : "/" + e;
        },
        ar = function () {
          var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : "",
            t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : "";
          return new RegExp("^" + t + "(\\/|\\?|#|$)", "i").test(e) || e === t;
        },
        ur = function () {
          var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : "",
            t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : "";
          return ar(e, t) ? e.substring(t.length) : e;
        },
        sr = function () {
          var e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
          return e.replace(/[?#][\s\S]*$/, "");
        },
        cr = function () {
          var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : "",
            t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : "";
          return e.includes(t) ? e.substring(0, e.length - t.length) : e;
        },
        lr = function () {
          var e,
            t =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : "",
            n =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : "",
            r =
              arguments.length > 2 && void 0 !== arguments[2]
                ? arguments[2]
                : {},
            o =
              arguments.length > 3 && void 0 !== arguments[3]
                ? arguments[3]
                : "",
            a = or(ur(t, n)),
            u =
              (null ===
                (e = Object.entries(r).find(function (e) {
                  return (0, i.Z)(e, 1)[0] === a;
                })) || void 0 === e
                ? void 0
                : e[1]) || a;
          return o || ("string" == typeof u ? u : u[0]) || n;
        },
        dr = function () {
          var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : "hash",
            t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : "/",
            n = "hash" === e ? nr.hash.slice(1).split("?")[0] : nr.pathname;
          return or(ur(n, t));
        },
        fr = new Map(),
        hr = we();
      function vr(e, t) {
        p.PT.call("mergePageInstance", fr.get(t), e), fr.set(t, e);
      }
      function pr(e) {
        return fr.get(e);
      }
      function gr(e) {
        fr.delete(e);
      }
      function mr(e, t) {
        for (
          var n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), i = 2;
          i < n;
          i++
        )
          r[i - 2] = arguments[i];
        var o = fr.get(e);
        if (null != o) {
          var a = p.PT.call("getLifecycle", o, t);
          if ((0, p.kJ)(a)) {
            var u = a.map(function (e) {
              return e.apply(o, r);
            });
            return u[0];
          }
          if ((0, p.mf)(a)) return a.apply(o, r);
        }
      }
      function br(e) {
        if (null == e) return "";
        var t = Object.keys(e)
          .map(function (t) {
            return t + "=" + e[t];
          })
          .join("&");
        return "" === t ? t : "?" + t;
      }
      function yr(e, t) {
        var n = e.indexOf("?");
        return "".concat(n > -1 ? e.substring(0, n) : e).concat(br(t));
      }
      function kr(e) {
        return e + "." + ue;
      }
      function wr(e) {
        return e + "." + se;
      }
      function Tr(e) {
        return e + "." + ce;
      }
      function Er(e, t, n, o) {
        var a,
          u,
          c = null != t ? t : "taro_page_".concat(hr()),
          l = (0, i.Z)(p.PT.call("getMiniLifecycleImpl").page, 7),
          d = l[0],
          h = l[1],
          v = l[2],
          g = l[3],
          m = l[4],
          b = l[5],
          y = l[6],
          k = null,
          w = !1,
          T = [];
        function C(e) {
          var t = e.route || e.__route__ || e.$taroPath;
          (Qn.router = {
            params: e.$taroParams,
            path: or(t),
            $taroPath: e.$taroPath,
            onReady: kr(c),
            onShow: wr(c),
            onHide: Tr(c),
          }),
            (0, p.o8)(e.exitState) || (Qn.router.exitState = e.exitState);
        }
        var S = (0, s.Z)(
          (0, s.Z)(
            (0, s.Z)(
              (0, s.Z)(
                (0, s.Z)({}, d, function () {
                  var t = this,
                    n =
                      arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : {},
                    i = arguments.length > 1 ? arguments[1] : void 0;
                  (u = new Promise(function (e) {
                    a = e;
                  })),
                    zt.start(E),
                    (Qn.page = this),
                    (this.config = o || {});
                  var s = Object.assign({}, n, { $taroTimestamp: Date.now() }),
                    l = (this.$taroPath = yr(c, s));
                  null == this.$taroParams && (this.$taroParams = s),
                    C(this),
                    tr.trigger(r.INIT, l);
                  var d = function () {
                    Qn.app.mount(e, l, function () {
                      (k = Re.document.getElementById(l)),
                        (0, p.zx)(null !== k, "没有找到页面实例。"),
                        mr(l, ae, t.$taroParams),
                        a(),
                        (k.ctx = t),
                        k.performUpdate(!0, i);
                    });
                  };
                  w ? T.push(d) : d();
                }),
                h,
                function () {
                  var e = this.$taroPath;
                  tr.trigger(r.DESTORY, e),
                    mr(e, h),
                    (w = !0),
                    Qn.app.unmount(e, function () {
                      (w = !1),
                        fr.delete(e),
                        k && ((k.ctx = null), (k = null)),
                        T.length &&
                          (T.forEach(function (e) {
                            return e();
                          }),
                          (T = []));
                    });
                }
              ),
              v,
              function () {
                var e = this;
                u.then(function () {
                  mr(e.$taroPath, ue),
                    Jn(function () {
                      return xn.trigger(kr(c));
                    }),
                    (e.onReady.called = !0);
                });
              }
            ),
            g,
            function () {
              var e = this,
                t =
                  arguments.length > 0 && void 0 !== arguments[0]
                    ? arguments[0]
                    : {};
              u.then(function () {
                (Qn.page = e),
                  C(e),
                  tr.trigger(r.RECOVER, e.$taroPath),
                  mr(e.$taroPath, se, t),
                  Jn(function () {
                    return xn.trigger(wr(c));
                  });
              });
            }
          ),
          m,
          function () {
            tr.trigger(r.RESTORE, this.$taroPath),
              Qn.page === this && ((Qn.page = null), (Qn.router = null)),
              mr(this.$taroPath, ce),
              xn.trigger(Tr(c));
          }
        );
        return (
          b.forEach(function (e) {
            var t = !1;
            (e = e.replace(/^defer:/, function () {
              return (t = !0), "";
            })),
              (S[e] = function () {
                var n = arguments,
                  r = this,
                  i = function () {
                    return mr.apply(
                      void 0,
                      [r.$taroPath, e].concat((0, f.Z)(n))
                    );
                  };
                if (!t) return i();
                u.then(i);
              });
          }),
          y.forEach(function (t) {
            var n;
            (e[t] ||
              (null === (n = e.prototype) || void 0 === n ? void 0 : n[t]) ||
              e[t.replace(/^on/, "enable")] ||
              (null == o ? void 0 : o[t.replace(/^on/, "enable")])) &&
              (S[t] = function () {
                for (
                  var e, n = arguments.length, r = new Array(n), i = 0;
                  i < n;
                  i++
                )
                  r[i] = arguments[i];
                var o = null === (e = r[0]) || void 0 === e ? void 0 : e.target;
                if (null == o ? void 0 : o.id) {
                  var a = o.id,
                    u = Re.document.getElementById(a);
                  u && (o.dataset = u.dataset);
                }
                return mr.apply(void 0, [this.$taroPath, t].concat(r));
              });
          }),
          (S.eh = Wt),
          (0, p.o8)(n) || (S.data = n),
          p.PT.call("modifyPageObject", S),
          S
        );
      }
      function Cr(e, t, n) {
        var r = null != t ? t : "taro_component_".concat(hr()),
          o = null,
          a = (0, i.Z)(p.PT.call("getMiniLifecycleImpl").component, 2),
          u = a[0],
          c = a[1],
          l = (0, s.Z)(
            (0, s.Z)(
              (0, s.Z)({}, u, function () {
                var t,
                  n = this;
                zt.start(E),
                  (this.pageIdCache =
                    (null === (t = this.getPageId) || void 0 === t
                      ? void 0
                      : t.call(this)) || hr());
                var i = yr(r, { id: this.pageIdCache });
                Qn.app.mount(e, i, function () {
                  (o = Re.document.getElementById(i)),
                    (0, p.zx)(null !== o, "没有找到组件实例。"),
                    (n.$taroInstances = fr.get(i)),
                    mr(i, ae),
                    (o.ctx = n),
                    o.performUpdate(!0);
                });
              }),
              c,
              function () {
                var e = yr(r, { id: this.pageIdCache });
                Qn.app.unmount(e, function () {
                  fr.delete(e), o && (o.ctx = null);
                });
              }
            ),
            "methods",
            { eh: Wt }
          );
        return (
          (0, p.o8)(n) || (l.data = n),
          [le, de, he].forEach(function (t) {
            var n;
            l[t] = null !== (n = e[t]) && void 0 !== n ? n : p.kT;
          }),
          l
        );
      }
      function Sr(e) {
        var t = e === z,
          n = (0, i.Z)(p.PT.call("getMiniLifecycleImpl").component, 2),
          r = n[0],
          o = n[1],
          a = t
            ? (0, s.Z)(
                (0, s.Z)({}, r, function () {
                  var e,
                    t,
                    n =
                      (null === (e = this.data.i) || void 0 === e
                        ? void 0
                        : e.sid) ||
                      (null === (t = this.props.i) || void 0 === t
                        ? void 0
                        : t.sid);
                  if ((0, p.HD)(n)) {
                    Pe.set(n, this);
                    var r = Re.document.getElementById(n);
                    r && (r.ctx = this);
                  }
                }),
                o,
                function () {
                  var e,
                    t,
                    n =
                      (null === (e = this.data.i) || void 0 === e
                        ? void 0
                        : e.sid) ||
                      (null === (t = this.props.i) || void 0 === t
                        ? void 0
                        : t.sid);
                  if ((0, p.HD)(n)) {
                    Pe.delete(n);
                    var r = Re.document.getElementById(n);
                    r && (r.ctx = null);
                  }
                }
              )
            : p.kT;
        return p.PT.call(
          "modifyRecursiveComponentConfig",
          Object.assign(
            {
              properties: {
                i: {
                  type: Object,
                  value: (0, s.Z)({}, "nn", (0, p.W)(p.rD)[D]._num),
                },
                l: { type: String, value: "" },
              },
              options: { addGlobalClass: !0, virtualHost: !t },
              methods: { eh: Wt },
            },
            a
          ),
          { isCustomWrapper: t }
        );
      }
      var _r = function (e, t) {
        var n = Date.now(),
          r = Qn.router,
          i = function () {
            setTimeout(function () {
              t ? e.call(t) : e();
            }, 1);
          };
        if (null === r) return i();
        var o = r.$taroPath;
        !(function r() {
          var a = Re.document.getElementById(o);
          (null == a ? void 0 : a.pendingUpdate)
            ? a.enqueueUpdateCallback(e, t)
            : Date.now() - n > 100
            ? i()
            : setTimeout(function () {
                return r();
              }, 20);
        })();
      };
      function Pr() {
        (0, p.mf)(Object.assign) ||
          (Object.assign = function (e) {
            if (null == e)
              throw new TypeError("Cannot convert undefined or null to object");
            for (var t = Object(e), n = 1; n < arguments.length; n++) {
              var r = arguments[n];
              if (null != r)
                for (var i in r)
                  Object.prototype.hasOwnProperty.call(r, i) && (t[i] = r[i]);
            }
            return t;
          }),
          (0, p.mf)(Object.entries) ||
            (Object.entries = function (e) {
              if (null == e)
                throw new TypeError(
                  "Cannot convert undefined or null to object"
                );
              var t = [];
              if (null != e)
                for (var n in e)
                  Object.prototype.hasOwnProperty.call(e, n) &&
                    t.push([n, e[n]]);
              return t;
            }),
          (0, p.mf)(Object.defineProperties) ||
            (Object.defineProperties = function (e, t) {
              function n(e) {
                function t(e, t) {
                  return Object.prototype.hasOwnProperty.call(e, t);
                }
                if (!(0, p.Kn)(e)) throw new TypeError("bad desc");
                var n = {};
                if (
                  (t(e, "enumerable") && (n.enumerable = !!e.enumerable),
                  t(e, "configurable") && (n.configurable = !!e.configurable),
                  t(e, "value") && (n.value = e.value),
                  t(e, "writable") && (n.writable = !!e.writable),
                  t(e, "get"))
                ) {
                  var r = e.get;
                  if (!(0, p.mf)(r) && !(0, p.o8)(r))
                    throw new TypeError("bad get");
                  n.get = r;
                }
                if (t(e, "set")) {
                  var i = e.set;
                  if (!(0, p.mf)(i) && !(0, p.o8)(i))
                    throw new TypeError("bad set");
                  n.set = i;
                }
                if (
                  ("get" in n || "set" in n) &&
                  ("value" in n || "writable" in n)
                )
                  throw new TypeError("identity-confused descriptor");
                return n;
              }
              if (!(0, p.Kn)(e)) throw new TypeError("bad obj");
              t = Object(t);
              for (var r = Object.keys(t), i = [], o = 0; o < r.length; o++)
                i.push([r[o], n(t[r[o]])]);
              for (var a = 0; a < i.length; a++)
                Object.defineProperty(e, i[a][0], i[a][1]);
              return e;
            }),
          (0, p.mf)(Array.prototype.find) ||
            Object.defineProperty(Array.prototype, "find", {
              value: function (e) {
                if (null == this)
                  throw new TypeError('"this" is null or not defined');
                var t = Object(this),
                  n = t.length >>> 0;
                if (!(0, p.mf)(e))
                  throw new TypeError("predicate must be a function");
                for (var r = arguments[1], i = 0; i < n; ) {
                  var o = t[i];
                  if (e.call(r, o, i, t)) return o;
                  i++;
                }
              },
            }),
          (0, p.mf)(Array.prototype.includes) ||
            Object.defineProperty(Array.prototype, "includes", {
              value: function (e, t) {
                if (null == this)
                  throw new TypeError('"this" is null or not defined');
                var n = Object(this),
                  r = n.length >>> 0;
                if (0 === r) return !1;
                for (
                  var i = 0 | t, o = Math.max(i >= 0 ? i : r - Math.abs(i), 0);
                  o < r;

                ) {
                  if (n[o] === e) return !0;
                  o++;
                }
                return !1;
              },
            });
      }
      Pr();
    },
    74455: function (e, t, n) {
      "use strict";
      n.d(t, {
        CA: function () {
          return U;
        },
        Ft: function () {
          return x;
        },
        HD: function () {
          return _;
        },
        Ig: function () {
          return ne;
        },
        Kn: function () {
          return I;
        },
        PT: function () {
          return D;
        },
        W: function () {
          return Y;
        },
        ZK: function () {
          return W;
        },
        ZT: function () {
          return j;
        },
        _c: function () {
          return T;
        },
        eu: function () {
          return H;
        },
        hj: function () {
          return O;
        },
        jn: function () {
          return A;
        },
        kC: function () {
          return Q;
        },
        kJ: function () {
          return R;
        },
        kT: function () {
          return M;
        },
        ku: function () {
          return G;
        },
        mf: function () {
          return N;
        },
        o8: function () {
          return P;
        },
        rD: function () {
          return w;
        },
        xi: function () {
          return q;
        },
        zW: function () {
          return E;
        },
        zx: function () {
          return F;
        },
      });
      var r = n(93433),
        i = n(58618),
        o = n(9092),
        a = n(60136),
        u = n(71002),
        s = n(15671),
        c = n(43144),
        l = "[]",
        d = "",
        f = "!0",
        h = "!1",
        v = {
          bindTouchStart: d,
          bindTouchMove: d,
          bindTouchEnd: d,
          bindTouchCancel: d,
          bindLongTap: d,
        },
        p = {
          animation: d,
          bindAnimationStart: d,
          bindAnimationIteration: d,
          bindAnimationEnd: d,
          bindTransitionEnd: d,
        };
      function g(e) {
        return "'".concat(e, "'");
      }
      var m,
        b = Object.assign(
          Object.assign(
            {
              "hover-class": g("none"),
              "hover-stop-propagation": h,
              "hover-start-time": "50",
              "hover-stay-time": "400",
            },
            v
          ),
          p
        ),
        y = { type: d, size: "23", color: d },
        k = Object.assign(
          {
            longitude: d,
            latitude: d,
            scale: "16",
            markers: l,
            covers: d,
            polyline: l,
            circles: l,
            controls: l,
            "include-points": l,
            "show-location": d,
            "layer-style": "1",
            bindMarkerTap: d,
            bindControlTap: d,
            bindCalloutTap: d,
            bindUpdated: d,
          },
          v
        ),
        w = {
          View: b,
          Icon: y,
          Progress: {
            percent: d,
            "stroke-width": "6",
            color: g("#09BB07"),
            activeColor: g("#09BB07"),
            backgroundColor: g("#EBEBEB"),
            active: h,
            "active-mode": g("backwards"),
            "show-info": h,
          },
          RichText: { nodes: l },
          Text: Object.assign({ selectable: h, space: d, decode: h }, v),
          Button: Object.assign(
            {
              size: g("default"),
              type: d,
              plain: h,
              disabled: d,
              loading: h,
              "form-type": d,
              "open-type": d,
              "hover-class": g("button-hover"),
              "hover-stop-propagation": h,
              "hover-start-time": "20",
              "hover-stay-time": "70",
              name: d,
              bindagreeprivacyauthorization: d,
            },
            v
          ),
          Checkbox: {
            value: d,
            disabled: d,
            checked: h,
            color: g("#09BB07"),
            name: d,
          },
          CheckboxGroup: { bindChange: d, name: d },
          Form: { "report-submit": h, bindSubmit: d, bindReset: d, name: d },
          Input: {
            value: d,
            type: g(d),
            password: h,
            placeholder: d,
            "placeholder-style": d,
            "placeholder-class": g("input-placeholder"),
            disabled: d,
            maxlength: "140",
            "cursor-spacing": "0",
            focus: h,
            "confirm-type": g("done"),
            "confirm-hold": h,
            cursor: "-1",
            "selection-start": "-1",
            "selection-end": "-1",
            bindInput: d,
            bindFocus: d,
            bindBlur: d,
            bindConfirm: d,
            name: d,
          },
          Label: Object.assign({ for: d, name: d }, v),
          Picker: {
            mode: g("selector"),
            disabled: d,
            range: d,
            "range-key": d,
            value: d,
            start: d,
            end: d,
            fields: g("day"),
            "custom-item": d,
            name: d,
            bindCancel: d,
            bindChange: d,
            bindColumnChange: d,
          },
          PickerView: {
            value: d,
            "indicator-style": d,
            "indicator-class": d,
            "mask-style": d,
            "mask-class": d,
            bindChange: d,
            name: d,
          },
          PickerViewColumn: { name: d },
          Radio: {
            value: d,
            checked: h,
            disabled: d,
            color: g("#09BB07"),
            name: d,
          },
          RadioGroup: { bindChange: d, name: d },
          Slider: {
            min: "0",
            max: "100",
            step: "1",
            disabled: d,
            value: "0",
            activeColor: g("#1aad19"),
            backgroundColor: g("#e9e9e9"),
            "block-size": "28",
            "block-color": g("#ffffff"),
            "show-value": h,
            bindChange: d,
            bindChanging: d,
            name: d,
          },
          Switch: {
            checked: h,
            disabled: d,
            type: g("switch"),
            color: g("#04BE02"),
            bindChange: d,
            name: d,
          },
          CoverImage: { src: d, bindLoad: "eh", bindError: "eh" },
          Textarea: {
            value: d,
            placeholder: d,
            "placeholder-style": d,
            "placeholder-class": g("textarea-placeholder"),
            disabled: d,
            maxlength: "140",
            "auto-focus": h,
            focus: h,
            "auto-height": h,
            fixed: h,
            "cursor-spacing": "0",
            cursor: "-1",
            "selection-start": "-1",
            "selection-end": "-1",
            bindFocus: d,
            bindBlur: d,
            bindLineChange: d,
            bindInput: d,
            bindConfirm: d,
            name: d,
          },
          CoverView: Object.assign({ "scroll-top": h }, v),
          MovableArea: { "scale-area": h },
          MovableView: Object.assign(
            Object.assign(
              {
                direction: "none",
                inertia: h,
                "out-of-bounds": h,
                x: d,
                y: d,
                damping: "20",
                friction: "2",
                disabled: d,
                scale: h,
                "scale-min": "0.5",
                "scale-max": "10",
                "scale-value": "1",
                bindChange: d,
                bindScale: d,
                bindHTouchMove: d,
                bindVTouchMove: d,
                width: g("10px"),
                height: g("10px"),
              },
              v
            ),
            p
          ),
          ScrollView: Object.assign(
            Object.assign(
              {
                "scroll-x": h,
                "scroll-y": h,
                "upper-threshold": "50",
                "lower-threshold": "50",
                "scroll-top": d,
                "scroll-left": d,
                "scroll-into-view": d,
                "scroll-with-animation": h,
                "enable-back-to-top": h,
                bindScrollToUpper: d,
                bindScrollToLower: d,
                bindScroll: d,
              },
              v
            ),
            p
          ),
          Swiper: Object.assign(
            {
              "indicator-dots": h,
              "indicator-color": g("rgba(0, 0, 0, .3)"),
              "indicator-active-color": g("#000000"),
              autoplay: h,
              current: "0",
              interval: "5000",
              duration: "500",
              circular: h,
              vertical: h,
              "previous-margin": g("0px"),
              "next-margin": g("0px"),
              "display-multiple-items": "1",
              bindChange: d,
              bindTransition: d,
              bindAnimationFinish: d,
            },
            v
          ),
          SwiperItem: { "item-id": d },
          Navigator: {
            url: d,
            "open-type": g("navigate"),
            delta: "1",
            "hover-class": g("navigator-hover"),
            "hover-stop-propagation": h,
            "hover-start-time": "50",
            "hover-stay-time": "600",
            bindSuccess: d,
            bindFail: d,
            bindComplete: d,
          },
          Audio: {
            id: d,
            src: d,
            loop: h,
            controls: h,
            poster: d,
            name: d,
            author: d,
            bindError: d,
            bindPlay: d,
            bindPause: d,
            bindTimeUpdate: d,
            bindEnded: d,
          },
          Camera: {
            "device-position": g("back"),
            flash: g("auto"),
            bindStop: d,
            bindError: d,
          },
          Image: Object.assign(
            {
              src: d,
              mode: g("scaleToFill"),
              "lazy-load": h,
              bindError: d,
              bindLoad: d,
            },
            v
          ),
          LivePlayer: Object.assign(
            {
              src: d,
              autoplay: h,
              muted: h,
              orientation: g("vertical"),
              "object-fit": g("contain"),
              "background-mute": h,
              "min-cache": "1",
              "max-cache": "3",
              bindStateChange: d,
              bindFullScreenChange: d,
              bindNetStatus: d,
            },
            p
          ),
          Video: Object.assign(
            {
              src: d,
              duration: d,
              controls: f,
              "danmu-list": d,
              "danmu-btn": d,
              "enable-danmu": d,
              autoplay: h,
              loop: h,
              muted: h,
              "initial-time": "0",
              "page-gesture": h,
              direction: d,
              "show-progress": f,
              "show-fullscreen-btn": f,
              "show-play-btn": f,
              "show-center-play-btn": f,
              "enable-progress-gesture": f,
              "object-fit": g("contain"),
              poster: d,
              "show-mute-btn": h,
              bindPlay: d,
              bindPause: d,
              bindEnded: d,
              bindTimeUpdate: d,
              bindFullScreenChange: d,
              bindWaiting: d,
              bindError: d,
            },
            p
          ),
          Canvas: Object.assign(
            { "canvas-id": d, "disable-scroll": h, bindError: d },
            v
          ),
          Ad: {
            "unit-id": d,
            "ad-intervals": d,
            bindLoad: d,
            bindError: d,
            bindClose: d,
          },
          WebView: { src: d, bindMessage: d, bindLoad: d, bindError: d },
          Block: {},
          Map: k,
          Slot: { name: d },
          SlotView: { name: d },
          NativeSlot: { name: d },
          Script: {},
        },
        T = new Set([
          "input",
          "checkbox",
          "picker",
          "picker-view",
          "radio",
          "slider",
          "switch",
          "textarea",
        ]);
      new Set(["input", "textarea"]),
        new Set([
          "progress",
          "icon",
          "rich-text",
          "input",
          "textarea",
          "slider",
          "switch",
          "audio",
          "ad",
          "official-account",
          "open-data",
          "navigation-bar",
        ]),
        new Map([
          ["view", -1],
          ["catch-view", -1],
          ["cover-view", -1],
          ["static-view", -1],
          ["pure-view", -1],
          ["block", -1],
          ["text", -1],
          ["static-text", 6],
          ["slot", 8],
          ["slot-view", 8],
          ["label", 6],
          ["form", 4],
          ["scroll-view", 4],
          ["swiper", 4],
          ["swiper-item", 4],
        ]),
        (function (e) {
          (e.MINI = "mini"),
            (e.WEB = "web"),
            (e.RN = "rn"),
            (e.HARMONY = "harmony"),
            (e.QUICK = "quickapp");
        })(m || (m = {})),
        m.WEB,
        m.HARMONY,
        m.MINI,
        m.RN,
        m.QUICK;
      var E = (function () {
        function e(t) {
          var n;
          (0, s.Z)(this, e),
            (this.callbacks =
              null !== (n = null == t ? void 0 : t.callbacks) && void 0 !== n
                ? n
                : {});
        }
        return (0, c.Z)(e, [
          {
            key: "on",
            value: function (t, n, r) {
              var i, o, a;
              if (!n) return this;
              (a = "symbol" === (0, u.Z)(t) ? [t] : t.split(e.eventSplitter)),
                this.callbacks || (this.callbacks = {});
              for (var s = this.callbacks; (i = a.shift()); ) {
                var c = s[i],
                  l = c ? c.tail : {};
                (l.next = o = {}),
                  (l.context = r),
                  (l.callback = n),
                  (s[i] = { tail: o, next: c ? c.next : l });
              }
              return this;
            },
          },
          {
            key: "once",
            value: function (e, t, n) {
              var r = this,
                i = function () {
                  for (
                    var o = arguments.length, a = new Array(o), u = 0;
                    u < o;
                    u++
                  )
                    a[u] = arguments[u];
                  t.apply(r, a), r.off(e, i, n);
                };
              return this.on(e, i, n), this;
            },
          },
          {
            key: "off",
            value: function (t, n, r) {
              var i, o, a;
              if (!(o = this.callbacks)) return this;
              if (!(t || n || r)) return delete this.callbacks, this;
              for (
                a =
                  "symbol" === (0, u.Z)(t)
                    ? [t]
                    : t
                    ? t.split(e.eventSplitter)
                    : Object.keys(o);
                (i = a.shift());

              ) {
                var s = o[i];
                if ((delete o[i], s && (n || r)))
                  for (var c = s.tail; (s = s.next) !== c; ) {
                    var l = s.callback,
                      d = s.context;
                    ((n && l !== n) || (r && d !== r)) && this.on(i, l, d);
                  }
              }
              return this;
            },
          },
          {
            key: "trigger",
            value: function (t) {
              var n, r, i, o;
              if (!(i = this.callbacks)) return this;
              o = "symbol" === (0, u.Z)(t) ? [t] : t.split(e.eventSplitter);
              for (
                var a = arguments.length,
                  s = new Array(a > 1 ? a - 1 : 0),
                  c = 1;
                c < a;
                c++
              )
                s[c - 1] = arguments[c];
              for (; (n = o.shift()); )
                if ((r = i[n]))
                  for (var l = r.tail; (r = r.next) !== l; )
                    r.callback.apply(r.context || this, s);
              return this;
            },
          },
        ]);
      })();
      E.eventSplitter = ",";
      var C = new ((function (e) {
          function t() {
            var e;
            return (
              (0, s.Z)(this, t),
              ((e = (0, i.Z)(this, t, arguments)).exeList = []),
              e
            );
          }
          return (
            (0, a.Z)(t, e),
            (0, c.Z)(t, [
              {
                key: "on",
                value: function (e, n) {
                  var r = this;
                  return (
                    (0, o.Z)(t, "on", this, 3)([e, n, this]),
                    (this.exeList = this.exeList.reduce(function (n, i) {
                      return (
                        i.eventName === e
                          ? (0, o.Z)(t, "trigger", r, 3)([i.eventName, i.data])
                          : n.push(i),
                        n
                      );
                    }, [])),
                    this
                  );
                },
              },
              {
                key: "emit",
                value: function (e, t) {
                  S.trigger(e, t);
                },
              },
            ])
          );
        })(E))(),
        S = new ((function (e) {
          function t() {
            return (0, s.Z)(this, t), (0, i.Z)(this, t, arguments);
          }
          return (
            (0, a.Z)(t, e),
            (0, c.Z)(t, [
              {
                key: "emit",
                value: function (e, t) {
                  C.off(e), C.exeList.push({ eventName: e, data: t });
                },
              },
              {
                key: "addEvents",
                value: function (e) {
                  var t = this;
                  e &&
                    "object" === (0, u.Z)(e) &&
                    Object.keys(e).forEach(function (n) {
                      t.off(n), t.on(n, e[n], t);
                    });
                },
              },
            ])
          );
        })(E))();
      function _(e) {
        return "string" == typeof e;
      }
      function P(e) {
        return void 0 === e;
      }
      function x(e) {
        return null === e;
      }
      function I(e) {
        return null !== e && "object" === (0, u.Z)(e);
      }
      function A(e) {
        return !0 === e || !1 === e;
      }
      function N(e) {
        return "function" == typeof e;
      }
      function O(e) {
        return "number" == typeof e;
      }
      var L,
        R = Array.isArray;
      !(function (e) {
        (e[(e.SINGLE = 0)] = "SINGLE"),
          (e[(e.MULTI = 1)] = "MULTI"),
          (e[(e.WATERFALL = 2)] = "WATERFALL");
      })(L || (L = {}));
      var Z = {
        app: ["onLaunch", "onShow", "onHide"],
        page: [
          "onLoad",
          "onUnload",
          "onReady",
          "onShow",
          "onHide",
          [
            "onPullDownRefresh",
            "onReachBottom",
            "onPageScroll",
            "onResize",
            "defer:onTabItemTap",
            "onTitleClick",
            "onOptionMenuClick",
            "onPopMenuClick",
            "onPullIntercept",
            "onAddToFavorites",
          ],
          ["onShareAppMessage", "onShareTimeline"],
        ],
        component: ["attached", "detached"],
      };
      function B(e, t) {
        return { type: e, initial: t || null };
      }
      var D = new ((function (e) {
          function t(e, n) {
            var r;
            for (var o in ((0, s.Z)(this, t),
            ((r = (0, i.Z)(this, t, [n])).hooks = e),
            e)) {
              var a = e[o].initial;
              N(a) && r.on(o, a);
            }
            return r;
          }
          return (
            (0, a.Z)(t, e),
            (0, c.Z)(t, [
              {
                key: "tapOneOrMany",
                value: function (e, t) {
                  var n = this;
                  (N(t) ? [t] : t).forEach(function (t) {
                    return n.on(e, t);
                  });
                },
              },
              {
                key: "tap",
                value: function (e, t) {
                  var n = this.hooks[e],
                    r = n.type,
                    i = n.initial;
                  r === L.SINGLE
                    ? (this.off(e), this.on(e, N(t) ? t : t[t.length - 1]))
                    : (i && this.off(e, i), this.tapOneOrMany(e, t));
                },
              },
              {
                key: "call",
                value: function (e) {
                  var t,
                    n = this.hooks[e];
                  if (n) {
                    var r = n.type,
                      i = this.callbacks;
                    if (i) {
                      var o = i[e];
                      if (o) {
                        for (
                          var a = o.tail,
                            u = o.next,
                            s = arguments.length,
                            c = new Array(s > 1 ? s - 1 : 0),
                            l = 1;
                          l < s;
                          l++
                        )
                          c[l - 1] = arguments[l];
                        for (var d, f = c; u !== a; ) {
                          if (
                            ((d =
                              null === (t = u.callback) || void 0 === t
                                ? void 0
                                : t.apply(u.context || this, f)),
                            r === L.WATERFALL)
                          ) {
                            var h = [d];
                            f = h;
                          }
                          u = u.next;
                        }
                        return d;
                      }
                    }
                  }
                },
              },
              {
                key: "isExist",
                value: function (e) {
                  var t;
                  return Boolean(
                    null === (t = this.callbacks) || void 0 === t
                      ? void 0
                      : t[e]
                  );
                },
              },
            ])
          );
        })(E))({
          getMiniLifecycle: B(L.SINGLE, function (e) {
            return e;
          }),
          getMiniLifecycleImpl: B(L.SINGLE, function () {
            return this.call("getMiniLifecycle", Z);
          }),
          getLifecycle: B(L.SINGLE, function (e, t) {
            return e[t];
          }),
          modifyRecursiveComponentConfig: B(L.SINGLE, function (e) {
            return e;
          }),
          getPathIndex: B(L.SINGLE, function (e) {
            return "[".concat(e, "]");
          }),
          getEventCenter: B(L.SINGLE, function (e) {
            return new e();
          }),
          isBubbleEvents: B(L.SINGLE, function (e) {
            return new Set([
              "touchstart",
              "touchmove",
              "touchcancel",
              "touchend",
              "touchforcechange",
              "tap",
              "longpress",
              "longtap",
              "transitionend",
              "animationstart",
              "animationiteration",
              "animationend",
            ]).has(e);
          }),
          getSpecialNodes: B(L.SINGLE, function () {
            return ["view", "text", "image"];
          }),
          onRemoveAttribute: B(L.SINGLE),
          batchedEventUpdates: B(L.SINGLE),
          mergePageInstance: B(L.SINGLE),
          modifyPageObject: B(L.SINGLE),
          createPullDownComponent: B(L.SINGLE),
          getDOMNode: B(L.SINGLE),
          modifyHydrateData: B(L.SINGLE),
          transferHydrateData: B(L.SINGLE),
          modifySetAttrPayload: B(L.SINGLE),
          modifyRmAttrPayload: B(L.SINGLE),
          onAddEvent: B(L.SINGLE),
          proxyToRaw: B(L.SINGLE, function (e) {
            return e;
          }),
          modifyMpEvent: B(L.MULTI),
          modifyMpEventImpl: B(L.SINGLE, function (e) {
            try {
              this.call("modifyMpEvent", e);
            } catch (e) {
              console.warn(
                "[Taro modifyMpEvent hook Error]: " +
                  (null == e ? void 0 : e.message)
              );
            }
          }),
          injectNewStyleProperties: B(L.SINGLE),
          modifyTaroEvent: B(L.MULTI),
          dispatchTaroEvent: B(L.SINGLE, function (e, t) {
            t.dispatchEvent(e);
          }),
          dispatchTaroEventFinish: B(L.MULTI),
          modifyTaroEventReturn: B(L.SINGLE, function () {}),
          modifyDispatchEvent: B(L.MULTI),
          initNativeApi: B(L.MULTI),
          patchElement: B(L.MULTI),
          modifyAddEventListener: B(L.SINGLE),
          modifyRemoveEventListener: B(L.SINGLE),
        }),
        M = {},
        j = function () {};
      function H(e) {
        return e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
      }
      function U(e) {
        for (var t = "", n = !1, r = 0; r < e.length; r++)
          "-" !== e[r]
            ? ((t += n ? e[r].toUpperCase() : e[r]), (n = !1))
            : (n = !0);
        return t;
      }
      function Q(e) {
        return e.charAt(0).toUpperCase() + e.slice(1);
      }
      function F(e, t) {
        if (!e) throw new Error(t);
      }
      function W(e, t) {}
      Object.prototype.hasOwnProperty;
      var V = 1,
        z = new Date().getTime().toString();
      function G(e) {
        return (
          Object.keys(e).forEach(function (t) {
            t in w ? Object.assign(w[t], e[t]) : (w[t] = e[t]);
          }),
          w
        );
      }
      function Y(e) {
        var t = {},
          n = e.View,
          r = {
            "#text": {},
            StaticView: n,
            StaticImage: e.Image,
            StaticText: e.Text,
            PureView: n,
            CatchView: n,
          };
        return (
          (e = Object.assign(Object.assign({}, e), r)),
          Object.keys(e)
            .sort(function (e, t) {
              var n = /^(Static|Pure|Catch)*(View|Image|Text)$/,
                r = n.test(e),
                i = n.test(t);
              return r && i ? (e > t ? 1 : -1) : r ? -1 : i || e >= t ? 1 : -1;
            })
            .forEach(function (n, r) {
              var i = { _num: String(r) };
              Object.keys(e[n])
                .filter(function (e) {
                  return !/^bind/.test(e) && !["focus", "blur"].includes(e);
                })
                .sort()
                .forEach(function (e, t) {
                  i[U(e)] = "p" + t;
                }),
                (t[H(n)] = i);
            }),
          t
        );
      }
      function q(e, t) {
        var n = t || D;
        Object.keys(e).forEach(function (t) {
          n.tap(t, e[t]);
        });
      }
      function $(e) {
        return function () {
          console.warn("小程序暂不支持 ".concat(e));
        };
      }
      function K(e, t) {
        if (
          ["navigateTo", "redirectTo", "reLaunch", "switchTab"].indexOf(e) > -1
        ) {
          var n = (t.url = t.url || "").indexOf("?") > -1,
            r = z + V++;
          t.url += (n ? "&" : "?") + "".concat("__key_", "=").concat(r);
        }
      }
      var J,
        X = new Set([
          "addPhoneContact",
          "authorize",
          "canvasGetImageData",
          "canvasPutImageData",
          "canvasToTempFilePath",
          "checkSession",
          "chooseAddress",
          "chooseImage",
          "chooseInvoiceTitle",
          "chooseLocation",
          "chooseVideo",
          "clearStorage",
          "closeBLEConnection",
          "closeBluetoothAdapter",
          "closeSocket",
          "compressImage",
          "connectSocket",
          "createBLEConnection",
          "downloadFile",
          "exitMiniProgram",
          "getAvailableAudioSources",
          "getBLEDeviceCharacteristics",
          "getBLEDeviceServices",
          "getBatteryInfo",
          "getBeacons",
          "getBluetoothAdapterState",
          "getBluetoothDevices",
          "getClipboardData",
          "getConnectedBluetoothDevices",
          "getConnectedWifi",
          "getExtConfig",
          "getFileInfo",
          "getImageInfo",
          "getLocation",
          "getNetworkType",
          "getSavedFileInfo",
          "getSavedFileList",
          "getScreenBrightness",
          "getSetting",
          "getStorage",
          "getStorageInfo",
          "getSystemInfo",
          "getUserInfo",
          "getWifiList",
          "hideHomeButton",
          "hideShareMenu",
          "hideTabBar",
          "hideTabBarRedDot",
          "loadFontFace",
          "login",
          "makePhoneCall",
          "navigateBack",
          "navigateBackMiniProgram",
          "navigateTo",
          "navigateToBookshelf",
          "navigateToMiniProgram",
          "notifyBLECharacteristicValueChange",
          "hideKeyboard",
          "hideLoading",
          "hideNavigationBarLoading",
          "hideToast",
          "openBluetoothAdapter",
          "openDocument",
          "openLocation",
          "openSetting",
          "pageScrollTo",
          "previewImage",
          "queryBookshelf",
          "reLaunch",
          "readBLECharacteristicValue",
          "redirectTo",
          "removeSavedFile",
          "removeStorage",
          "removeTabBarBadge",
          "requestSubscribeMessage",
          "saveFile",
          "saveImageToPhotosAlbum",
          "saveVideoToPhotosAlbum",
          "scanCode",
          "sendSocketMessage",
          "setBackgroundColor",
          "setBackgroundTextStyle",
          "setClipboardData",
          "setEnableDebug",
          "setInnerAudioOption",
          "setKeepScreenOn",
          "setNavigationBarColor",
          "setNavigationBarTitle",
          "setScreenBrightness",
          "setStorage",
          "setTabBarBadge",
          "setTabBarItem",
          "setTabBarStyle",
          "showActionSheet",
          "showFavoriteGuide",
          "showLoading",
          "showModal",
          "showShareMenu",
          "showTabBar",
          "showTabBarRedDot",
          "showToast",
          "startBeaconDiscovery",
          "startBluetoothDevicesDiscovery",
          "startDeviceMotionListening",
          "startPullDownRefresh",
          "stopBeaconDiscovery",
          "stopBluetoothDevicesDiscovery",
          "stopCompass",
          "startCompass",
          "startAccelerometer",
          "stopAccelerometer",
          "showNavigationBarLoading",
          "stopDeviceMotionListening",
          "stopPullDownRefresh",
          "switchTab",
          "uploadFile",
          "vibrateLong",
          "vibrateShort",
          "writeBLECharacteristicValue",
        ]);
      function ee(e) {
        return function () {
          var t,
            n =
              null === (t = e.getSystemInfoSync) || void 0 === t
                ? void 0
                : t.call(e);
          if (!n) return !1;
          var r = n.platform.toLowerCase();
          return "android" === r || "devtools" === r;
        };
      }
      function te(e) {
        return function (t) {
          var n,
            r = (t = t ? (_(t) ? { url: t } : t) : {}).success,
            i = t.fail,
            o = t.complete,
            a = new Promise(function (a, u) {
              (t.success = function (e) {
                r && r(e), a(e);
              }),
                (t.fail = function (e) {
                  i && i(e), u(e);
                }),
                (t.complete = function (e) {
                  o && o(e);
                }),
                (n = e.request(t));
            });
          return (
            ie(n, a),
            (a.abort = function (e) {
              return e && e(), n && n.abort(), a;
            }),
            a
          );
        };
      }
      function ne(e, t) {
        var n =
            arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
          i = n.needPromiseApis || [],
          o = new Set([].concat((0, r.Z)(i), (0, r.Z)(X))),
          a = [
            "getEnv",
            "interceptors",
            "Current",
            "getCurrentInstance",
            "options",
            "nextTick",
            "eventCenter",
            "Events",
            "preload",
            "webpackJsonp",
          ],
          u = new Set(
            n.isOnlyPromisify
              ? i
              : Object.keys(t).filter(function (e) {
                  return -1 === a.indexOf(e);
                })
          );
        n.modifyApis && n.modifyApis(u),
          u.forEach(function (r) {
            if (o.has(r)) {
              var i = r;
              e[i] = function () {
                for (
                  var e =
                      arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : {},
                    r = arguments.length,
                    o = new Array(r > 1 ? r - 1 : 0),
                    a = 1;
                  a < r;
                  a++
                )
                  o[a - 1] = arguments[a];
                var u = i;
                if ("string" == typeof e)
                  return o.length ? t[u].apply(t, [e].concat(o)) : t[u](e);
                if (n.transformMeta) {
                  var s = n.transformMeta(u, e);
                  if (((u = s.key), (e = s.options), !t.hasOwnProperty(u)))
                    return $(u)();
                }
                var c = null,
                  l = Object.assign({}, e);
                K(u, e);
                var d = new Promise(function (r, i) {
                  (l.success = function (t) {
                    var i, o;
                    null === (i = n.modifyAsyncResult) ||
                      void 0 === i ||
                      i.call(n, u, t),
                      null === (o = e.success) || void 0 === o || o.call(e, t),
                      r(
                        "connectSocket" === u
                          ? Promise.resolve().then(function () {
                              return c ? Object.assign(c, t) : t;
                            })
                          : t
                      );
                  }),
                    (l.fail = function (t) {
                      var n;
                      null === (n = e.fail) || void 0 === n || n.call(e, t),
                        i(t);
                    }),
                    (l.complete = function (t) {
                      var n;
                      null === (n = e.complete) || void 0 === n || n.call(e, t);
                    }),
                    (c = o.length ? t[u].apply(t, [l].concat(o)) : t[u](l));
                });
                return (
                  ["uploadFile", "downloadFile"].includes(u) &&
                    (ie(c, d),
                    (d.progress = function (e) {
                      return null == c || c.onProgressUpdate(e), d;
                    }),
                    (d.abort = function (e) {
                      return null == e || e(), null == c || c.abort(), d;
                    })),
                  d
                );
              };
            } else {
              var a = r;
              if (
                (n.transformMeta && (a = n.transformMeta(r, {}).key),
                !t.hasOwnProperty(a))
              )
                return void (e[r] = $(r));
              N(t[r])
                ? (e[r] = function () {
                    for (
                      var e = arguments.length, i = new Array(e), o = 0;
                      o < e;
                      o++
                    )
                      i[o] = arguments[o];
                    return n.handleSyncApis
                      ? n.handleSyncApis(r, t, i)
                      : t[a].apply(t, i);
                  })
                : (e[r] = t[a]);
            }
          }),
          !n.isOnlyPromisify && re(e, t, n);
      }
      function re(e, t) {
        var n =
          arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
        (e.canIUseWebp = ee(e)),
          (e.getCurrentPages = getCurrentPages || $("getCurrentPages")),
          (e.getApp = getApp || $("getApp")),
          (e.env = t.env || {});
        try {
          e.requirePlugin = requirePlugin || $("requirePlugin");
        } catch (t) {
          e.requirePlugin = $("requirePlugin");
        }
        var r = n.request || te(t);
        function i(e) {
          return r(e.requestParams);
        }
        var o = new e.Link(i);
        (e.request = o.request.bind(o)),
          (e.addInterceptor = o.addInterceptor.bind(o)),
          (e.cleanInterceptors = o.cleanInterceptors.bind(o)),
          (e.miniGlobal = e.options.miniGlobal = t),
          (e.getAppInfo = function () {
            return {
              platform: "mini",
              taroVersion: "3.6.25",
              designWidth: e.config.designWidth,
            };
          }),
          (e.createSelectorQuery = oe(e, t, "createSelectorQuery", "exec")),
          (e.createIntersectionObserver = oe(
            e,
            t,
            "createIntersectionObserver",
            "observe"
          ));
      }
      function ie(e, t) {
        e &&
          t &&
          e &&
          [
            "abort",
            "onHeadersReceived",
            "offHeadersReceived",
            "onProgressUpdate",
            "offProgressUpdate",
            "onChunkReceived",
            "offChunkReceived",
          ].forEach(function (n) {
            n in e && (t[n] = e[n].bind(e));
          });
      }
      function oe(e, t, n, r) {
        return function () {
          var i = t[n].apply(t, arguments),
            o = i[r].bind(i);
          return (
            (i[r] = function () {
              for (
                var t = arguments.length, n = new Array(t), r = 0;
                r < t;
                r++
              )
                n[r] = arguments[r];
              e.nextTick(function () {
                return o.apply(void 0, n);
              });
            }),
            i
          );
        };
      }
      !(function (e) {
        (e.Container = "container"),
          (e.Childnodes = "cn"),
          (e.Text = "v"),
          (e.NodeType = "nt"),
          (e.NodeName = "nn"),
          (e.Style = "st"),
          (e.Class = "cl"),
          (e.Src = "src");
      })(J || (J = {}));
    },
    92954: function (e, t, n) {
      var r = n(32180).hooks,
        i = n(47410).Z;
      r.isExist("initNativeApi") && r.call("initNativeApi", i),
        (e.exports = i),
        (e.exports.default = e.exports);
    },
    44560: function (e, t, n) {
      "use strict";
      var r = n(32180);
      Component((0, r.createRecursiveComponentConfig)());
    },
    99313: function (e, t, n) {
      "use strict";
      var r = n(32180);
      Component((0, r.createRecursiveComponentConfig)("custom-wrapper"));
    },
  },
]);

!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [2903],
    {
      73816: function (e, o, l) {
        l.d(o, {
          Z: function () {
            return m;
          },
        });
        var t = l(15671),
          s = l(43144),
          n = l(58618),
          r = l(60136),
          c = l(93967),
          a = l.n(c),
          i = l(45697),
          p = l.n(i),
          u = l(67294),
          h = l(71515),
          d = l(889),
          m = (function (e) {
            function o(e) {
              var l;
              (0, t.Z)(this, o),
                ((l = (0, n.Z)(this, o, [e])).handleClose = function () {
                  "function" == typeof l.props.onClose && l.props.onClose();
                }),
                (l.close = function () {
                  l.setState({ _isOpened: !1 }, l.handleClose);
                }),
                (l.handleTouchMove = function (e) {
                  e.stopPropagation();
                });
              var s = e.isOpened;
              return (l.state = { _isOpened: s }), l;
            }
            return (
              (0, r.Z)(o, e),
              (0, s.Z)(o, [
                {
                  key: "UNSAFE_componentWillReceiveProps",
                  value: function (e) {
                    var o = e.isOpened;
                    this.props.isOpened !== o && (0, d.Em)(o),
                      o !== this.state._isOpened &&
                        this.setState({ _isOpened: o });
                  },
                },
                {
                  key: "render",
                  value: function () {
                    var e = this.state._isOpened,
                      o = this.props,
                      l = o.title,
                      t = o.scrollY,
                      s = o.scrollX,
                      n = o.scrollTop,
                      r = o.scrollLeft,
                      c = o.upperThreshold,
                      i = o.lowerThreshold,
                      p = o.scrollWithAnimation,
                      d = a()(
                        "at-float-layout",
                        { "at-float-layout--active": e },
                        this.props.className
                      );
                    return u.createElement(
                      h.G7,
                      { className: d, onTouchMove: this.handleTouchMove },
                      u.createElement(h.G7, {
                        onClick: this.close,
                        className: "at-float-layout__overlay",
                      }),
                      u.createElement(
                        h.G7,
                        { className: "at-float-layout__container layout" },
                        l
                          ? u.createElement(
                              h.G7,
                              { className: "layout-header" },
                              u.createElement(
                                h.xv,
                                { className: "layout-header__title" },
                                l
                              ),
                              u.createElement(h.G7, {
                                className: "layout-header__btn-close",
                                onClick: this.close,
                              })
                            )
                          : null,
                        u.createElement(
                          h.G7,
                          { className: "layout-body" },
                          u.createElement(
                            h.pf,
                            {
                              scrollY: t,
                              scrollX: s,
                              scrollTop: n,
                              scrollLeft: r,
                              upperThreshold: c,
                              lowerThreshold: i,
                              scrollWithAnimation: p,
                              onScroll: this.props.onScroll,
                              onScrollToLower: this.props.onScrollToLower,
                              onScrollToUpper: this.props.onScrollToUpper,
                              className: "layout-body__content",
                            },
                            this.props.children
                          )
                        )
                      )
                    );
                  },
                },
              ])
            );
          })(u.Component);
        (m.defaultProps = {
          title: "",
          isOpened: !1,
          scrollY: !0,
          scrollX: !1,
          scrollWithAnimation: !1,
        }),
          (m.propTypes = {
            title: p().string,
            isOpened: p().bool,
            scrollY: p().bool,
            scrollX: p().bool,
            scrollTop: p().number,
            scrollLeft: p().number,
            upperThreshold: p().number,
            lowerThreshold: p().number,
            scrollWithAnimation: p().bool,
            onClose: p().func,
            onScroll: p().func,
            onScrollToLower: p().func,
            onScrollToUpper: p().func,
          });
      },
    },
  ]);
})();

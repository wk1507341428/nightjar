!(function () {
  "use strict";
  (wx.webpackJsonp = wx.webpackJsonp || []).push([
    [9651],
    {
      12868: function (t, e, i) {
        i.d(e, {
          k: function () {
            return r;
          },
        });
        var a = i(29439),
          n = i(93433),
          u = i(96856),
          r = function (t) {
            var e,
              i = t.category_list,
              r = t.discount_rate,
              l = t.item_spec,
              c = t.distributor_list,
              o = t.item_params,
              d =
                null == o
                  ? void 0
                  : o.map(function (t) {
                      return {
                        type: t.attribute_id,
                        title: t.attribute_name,
                        options: {
                          label: t.attribute_name,
                          value: t.attribute_id,
                          children: (0, u.D9)(t.values || [], {
                            id: "attribute_value_id",
                            name: "attribute_value",
                            value: "attribute_value_id",
                          }),
                        },
                      };
                    });
            return [
              {
                type: "category",
                title: "分类",
                options: {
                  label: "商品分类",
                  value: "category",
                  children: (0, u.D9)(i || [], {
                    id: "category_id",
                    name: "category_name",
                    value: "category_id",
                    children: function (t) {
                      var e = t.children,
                        i = void 0 === e ? [] : e;
                      return (0, u.D9)(i, {
                        id: "category_id",
                        name: "category_name",
                        value: "category_id",
                      });
                    },
                  }),
                },
              },
              {
                type: "discount",
                title: "折扣",
                options: {
                  label: "SALE折扣",
                  value: "discount",
                  children:
                    null === (e = r || []) || void 0 === e
                      ? void 0
                      : e.map(function (t, e) {
                          var i = t.split(","),
                            n = (0, a.Z)(i, 2),
                            u = n[0],
                            r = n[1];
                          return "0" === u
                            ? {
                                id: "discount-".concat(e),
                                name: "".concat(r / 10, "折以下"),
                                value: t,
                              }
                            : {
                                id: "discount-".concat(e),
                                name: ""
                                  .concat(u / 10, "-")
                                  .concat(r / 10, "折"),
                                value: t,
                              };
                        }),
                },
              },
              {
                type: "price",
                title: "价格",
                options: { label: "价格范围", value: "price", children: [] },
              },
              {
                type: "brand",
                title: "品牌",
                options: {
                  label: "热门品牌",
                  value: "brand",
                  children: (0, u.D9)(c || [], {
                    id: "distributor_id",
                    name: "name",
                    value: "distributor_id",
                    code: "shop_code",
                  }),
                },
              },
              {
                type: "spec",
                title: "规格",
                options: {
                  label: "商品规格",
                  value: "spec",
                  children: (0, u.D9)(l || [], {
                    id: "attribute_id",
                    name: "attribute_name",
                    value: "attribute_id",
                    is_image: "is_image",
                    children: function (t) {
                      var e = t.values,
                        i = void 0 === e ? [] : e;
                      return (0, u.D9)(i, {
                        id: "attribute_value_id",
                        attribute_value_id: "attribute_value_id",
                        name: "attribute_value",
                        value: "attribute_value_id",
                        image_url: "image_url",
                      });
                    },
                  }),
                },
              },
            ].concat((0, n.Z)(d));
          };
      },
    },
  ]);
})();

const ShippingRoleConfigConst = {};

/** Service type */
ShippingRoleConfigConst.SERVICE_TYPE_TAKE_AWAY = 1;
ShippingRoleConfigConst.SERVICE_TYPE_DELIVERY = 2;

/** Service key dùng trong UI */
ShippingRoleConfigConst.SERVICE_KEYS = {
  [ShippingRoleConfigConst.SERVICE_TYPE_TAKE_AWAY]: "take_away",
  [ShippingRoleConfigConst.SERVICE_TYPE_DELIVERY]: "delivery",
};

/** Label hiển thị */
ShippingRoleConfigConst.SERVICE_TYPE_LABEL_MAP = {
  [ShippingRoleConfigConst.SERVICE_TYPE_TAKE_AWAY]: "Take Away",
  [ShippingRoleConfigConst.SERVICE_TYPE_DELIVERY]: "Delivery",
};

export default ShippingRoleConfigConst;

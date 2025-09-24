import { SHOP_TYPE, CART_TYPE_ID } from "../consts/consts";
export const typeStore = [
  {
    id: CART_TYPE_ID[SHOP_TYPE.RETAIL],
    key: SHOP_TYPE.RETAIL,
    name: "Retail Store",
  },
  {
    id: CART_TYPE_ID[SHOP_TYPE.POPUP_RESERVATION],
    key: SHOP_TYPE.POPUP_RESERVATION,
    name: "Popup Reservation",
  },
];

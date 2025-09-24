// src/helper/typeStoreHelper.js
import { typeStore } from "../../../web/js/helper/typeStore";

const typeStoreHelper = {
  getTypeName: (typeId) => {
    const type = typeStore.find((t) => t.id == typeId);
    return type ? type.name : "N/A";
  },

  getTypeKey: (typeId) => {
    const type = typeStore.find((t) => t.id == typeId);
    return type ? type.key : null;
  },
};

export default typeStoreHelper;

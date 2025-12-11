import React from "react";
import { Route, Routes, useLocation } from "react-router";
import PriceBooks from "./PriceBooks";
import PriceBookDetails from "./PriceBooksDetail";
const PriceBooksPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get("page");
  const priceBooksId = searchParams.get("id");

  return (
    <>
      {page === "price_books" && (
        <Routes>
          {!priceBooksId && <Route path="/wp-admin/admin.php" element={<PriceBooks />} />}
          {priceBooksId && (
            <Route
              path="/wp-admin/admin.php"
              element={<PriceBookDetails priceBooksId={priceBooksId} />}
            />
          )}
        </Routes>
      )}
    </>
  );
};

export default PriceBooksPage;

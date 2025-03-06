import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { webApi } from "../../api";
import { toast } from "react-toastify";
import CustomLoader from "../CustomLoader";
import Message from "./Message";

const BookingStep1 = ({ handleNextStep }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(-1);
  const [activeProductIndex, setActiveProductIndex] = useState(-1);

  const fetchCategoriesAndProducts = async () => {
    try {
      setIsLoading(true);
      const { data } = await webApi.getBookingSupports();

      if (data.status !== "success" || !data.data?.length) {
        toast.error("Failed to retrieve categories or products.");
        return;
      }

      setCategories(
        data.data.filter((item) => item.mapping_type === "category")
      );
      setProducts(data.data.filter((item) => item.mapping_type === "product"));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndProducts();
  }, []);

  const handleCategorySelect = async (category, index) => {
    try {
      setIsProductLoading(true);
      setActiveCategoryIndex(index);
      setSelectedCategory(category);

      const { data } = await webApi.getBookingSupports({
        category: category.items_id,
      });
      setProducts(data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("An error occurred while fetching products.");
    } finally {
      setIsProductLoading(false);
    }
  };

  const handleProductSelect = (product, index) => {
    setSelectedProduct(product);
    setActiveProductIndex(index);
  };

  const handleNext = () => {
    if (!selectedProduct) {
      toast.warn("Please select a product to continue.");
      return;
    }
    handleNextStep(1, selectedProduct);
  };

  const renderCategories = () => {
    if (!categories.length) {
      return <Message message="No categories found!" />;
    }

    return categories.map((category, index) => (
      <div
        key={category.items_id}
        className={`category-item ${
          activeCategoryIndex === index ? "active" : ""
        }`}
        role="button"
        aria-pressed={activeCategoryIndex === index}
        onClick={() => handleCategorySelect(category, index)}
      >
        {category.item_name}
      </div>
    ));
  };

  const renderProducts = () => {
    if (isProductLoading) {
      return <CustomLoader />;
    }

    if (!products.length) {
      return <Message message="No products found!" />;
    }

    return products.map((product, index) => (
      <div
        key={product.items_id}
        className={`product-item ${
          activeProductIndex === index ? "active" : ""
        }`}
        role="button"
        aria-pressed={activeProductIndex === index}
        onClick={() => handleProductSelect(product, index)}
      >
        <h5 className="product-title">{product.item_name}</h5>
        <span className="product-price">Price: ${product.item_price}</span>
      </div>
    ));
  };

  return (
    <div className="booking-step-1">
      {isLoading ? (
        <CustomLoader />
      ) : (
        <>
          <div className="booking-conent">
            <div>
              <h4>Field Categories</h4>
              <div className="list-category">{renderCategories()}</div>
            </div>
            <div>
              <h4>Field Avalible</h4>
              <div className="list-product">{renderProducts()}</div>
            </div>
          </div>
          <div className="booking-footer">
            <div className="booking-ctn-button">
              <span
                role="button"
                id="next-step-btn"
                className="next-step-btn"
                onClick={handleNext}
              >
                Continue
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingStep1;

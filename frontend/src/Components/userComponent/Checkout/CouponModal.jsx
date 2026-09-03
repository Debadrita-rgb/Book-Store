const CouponModal = ({ coupons, subtotal, closeModal, applyCoupon }) => {
  const validateCoupon = (coupon) => {
    const today = new Date();

    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (!coupon.isActive) {
      return {
        valid: false,
        message: "Coupon is inactive",
      };
    }

    if (today < startDate || today > endDate) {
      return {
        valid: false,
        message: "Coupon expired",
      };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return {
        valid: false,
        message: "Coupon usage limit reached",
      };
    }

    if (subtotal < coupon.minimumOrderAmount) {
      return {
        valid: false,
        message: `Minimum order ₹${coupon.minimumOrderAmount}`,
      };
    }

    return {
      valid: true,
      message: "Available",
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="coupon-modal w-[90%] max-w-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="coupon-title text-2xl font-bold">
            Available Coupons 🎁
          </h2>

          <button onClick={closeModal} className="coupon-close text-xl">
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {coupons.map((coupon) => {
            const validation = validateCoupon(coupon);

            return (
              <div
                key={coupon._id}
                className="coupon-card rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <div className="flex gap-2 items-center">
                    <h3 className="font-bold text-lg text-red-500">
                      {coupon.code}
                    </h3>

                    {coupon.isFeatured && (
                      <span className="coupon-featured text-xs px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  <p className="coupon-text">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} OFF`}
                  </p>

                  <p className="coupon-muted text-xs">
                    Minimum order ₹{coupon.minimumOrderAmount}
                  </p>

                  {!validation.valid && (
                    <p className="text-xs text-red-500 mt-1">
                      {validation.message}
                    </p>
                  )}
                </div>

                <button
                  disabled={!validation.valid}
                  onClick={() => applyCoupon(coupon)}
                  className={`px-4 py-2 rounded-lg text-white ${
                    validation.valid
                      ? "coupon-btn-active"
                      : "coupon-btn-disabled"
                  }`}
                >
                  {validation.valid ? "Apply" : "Not Available"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CouponModal;

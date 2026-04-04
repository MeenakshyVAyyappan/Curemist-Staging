import { useCart } from "@/lib/cart";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

interface ProductCardProps {
  slug: string;
  title: string;
  size: string;
  price: string;
  originalPrice?: string;
  discount: string;
  image: string;
}

function AddToCartButton({
  slug,
  title,
  size,
  price,
  originalPrice,
  image,
}: {
  slug: string;
  title: string;
  size: string;
  price: string;
  originalPrice?: string;
  image: string;
}) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const numericPrice = Number(price.replace(/[^\d]/g, "")) || 0;
    const numericOriginalPrice = originalPrice
      ? Number(originalPrice.replace(/[^\d]/g, "")) || 0
      : numericPrice;
    addItem(
      {
        id: slug,
        title,
        image,
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        quantity: 1,
        size,
      },
      1,
    );
    try {
      toast({ title: "Added to cart" });
    } catch { }
  };

  return (
    <button
      onClick={handleAdd}
      className="w-full xl:flex-1 bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue px-2 py-2.5 rounded-lg text-[11px] md:text-xs lg:text-sm font-bold transition-all whitespace-nowrap text-center"
    >
      ADD TO CART
    </button>
  );
}

export default function ProductCard({
  slug,
  title,
  size,
  price,
  originalPrice,
  discount,
  image,
}: ProductCardProps) {
  const navigate = useNavigate();

  const goToDetails = () => navigate(`/product/${slug}`);

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl transition-all duration-300 hover:shadow-xl border border-[#252c74] p-2 sm:p-3 md:p-4">
      {/* Product Image Container */}
      <div
        className="group/image relative w-full aspect-[4/5] mb-3 md:mb-4 cursor-pointer overflow-hidden rounded-xl bg-gray-50 flex-shrink-0"
        onClick={goToDetails}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover/image:scale-110"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-all flex items-center justify-center">
          <span className="text-white font-bold text-xs md:text-lg opacity-0 group-hover/image:opacity-100 transition-opacity bg-brand-blue/90 px-3 md:px-4 py-1.5 md:py-2 rounded-lg translate-y-4 group-hover/image:translate-y-0 duration-300">
            View Details
          </span>
        </div>
        {/* ✅ FREE SHIPPING banner — top right (like "BESTSELLER" in reference) */}
        <div className="absolute top-0 right-0 bg-brand-yellow text-brand-blue px-2 py-1 md:px-3 md:py-1.5 rounded-bl-xl rounded-tr-xl shadow-sm">
          <span className="text-[8px] md:text-[10px] font-extrabold uppercase tracking-wide leading-tight block text-center">
            Free Shipping
          </span>
        </div>

        {/* ✅ Size Badge — bottom right */}
        <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-white/80 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm">
          <span className="text-purple-badge text-[10px] md:text-sm font-bold">
            {size}
          </span>
        </div>
      </div>

      {/* Product Info (Flex Grow to align buttons at bottom) */}
      <div className="flex flex-col flex-grow justify-between gap-3 md:gap-4">
        <div className="flex justify-between items-start gap-1 md:gap-2">
          <h3 
            className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-black leading-snug flex-1 pr-1 cursor-pointer hover:underline"
            onClick={goToDetails}
          >
            {title}
          </h3>
          <div className="flex flex-col items-end flex-shrink-0 text-right">
            <span className="text-discount text-[10px] md:text-sm font-bold bg-discount/10 px-1.5 py-0.5 rounded text-discount mb-1">
              {discount}
            </span>
            <span className="text-black text-base sm:text-lg md:text-2xl font-bold leading-none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
              {price}
            </span>
            {originalPrice && (
              <span className="text-gray-400 text-[10px] md:text-sm font-semibold line-through mt-0.5">
                {originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col xl:flex-row gap-2 w-full mt-auto">
          <button
            className="w-full xl:w-auto xl:flex-1 bg-gray-100 hover:bg-gray-200 text-black px-2 py-2.5 rounded-lg text-[11px] md:text-xs lg:text-sm font-bold transition-all whitespace-nowrap text-center"
            onClick={goToDetails}
          >
            DETAILS
          </button>
          <AddToCartButton
            slug={slug}
            title={title}
            size={size}
            price={price}
            originalPrice={originalPrice}
            image={image}
          />
        </div>
      </div>
    </div>
  );
}

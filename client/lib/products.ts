export interface Product {
  slug: string;
  title: string;
  size: string;
  price: string;
  originalPrice?: string;
  discount: string;
  image: string;
  images?: string[];
  benefit?: string;
  form?: string;
  description?: string;
}

export const products: Product[] = [
  {
    slug: "curemist-ayurvedic-first-aid-wound-spray-50g",
    title: "CureMist Ayurvedic First Aid Wound Spray 50g",
    size: "50 gm",
    price: "₹345",
    originalPrice: "₹363",
    discount: "5% Off",
    image: "/Products/homeproduct4.png",
    images: [
      "/Products/Product4.0.png",
      "/Products/Product4.1.png",
      "/Products/CommonProduct.jpg",
      "/Products/Product3.4.png",
    ],
    benefit: "Anti Microbial",
    form: "Spray",
    description:
      "CureMist – The World's First Ayurvedic Wound Spray. 100% Ayurvedic and AYUSH-approved, it delivers fast, hands-free healing with a waterproof, dust-proof protective layer, harnessing turmeric's anti-bacterial, anti-fungal, and anti-inflammatory power for safe use across all ages.",
  },
  {
    slug: "curemist-ayurvedic-first-aid-wound-spray-25g",
    title: "CureMist Ayurvedic First Aid Wound Spray 25g",
    size: "25 gm",
    price: "₹260",
    originalPrice: "₹271",
    discount: "4% Off",
    image: "/Products/homeproduct2.png",
    images: [
      "/Products/Product2.2.JPG",
      "/Products/CommonProduct1.JPG",
      "/Products/Product2.3.JPG",
      "/Products/CommonProduct2.jpg",
      "/Products/CommonProduct.jpg",
      "/Products/CommonProduct3.jpg",
      "/Products/Product2.5.JPG",
    ],
    benefit: "AAnti Microbial",
    form: "Spray",
    description:
      "CureMist – The World's First Ayurvedic Wound Spray. 100% Ayurvedic and AYUSH-approved, it delivers fast, hands-free healing with a waterproof, dust-proof protective layer, harnessing turmeric's anti-bacterial, anti-fungal, and anti-inflammatory power for safe use across all ages.",
  },
  {
    slug: "curemist-ayurvedic-first-aid-wound-spray-12-5g",
    title: "CureMist Ayurvedic First Aid Wound Spray 12.5g",
    size: "12.5 gm",
    price: "₹161",
    originalPrice: "₹168",
    discount: "4% Off",
    image: "/Products/homeproduct1.png",
    images: [
      "/Products/Product1.1.jpg",
      "/Products/CommonProduct1.JPG",
      "/Products/Product1.3.png",
      "/Products/CommonProduct2.jpg",
      "/Products/Product1.2.png",
      "/Products/CommonProduct3.jpg",
      "/Products/CommonProduct.jpg",
    ],
    benefit: "Anti Microbial",
    form: "Spray",
    description:
      "CureMist – The World's First Ayurvedic Wound Spray. 100% Ayurvedic and AYUSH-approved, it delivers fast, hands-free healing with a waterproof, dust-proof protective layer, harnessing turmeric's anti-bacterial, anti-fungal, and anti-inflammatory power for safe use across all ages.",
  },
  {
    slug: "curemist-ayurvedic-first-aid-wound-spray-combo-37-5g",
    title: "CureMist Ayurvedic First Aid Wound Spray Combo Pack(12.5g + 25g)",
    size: "Combo",
    price: "₹418",
    originalPrice: "₹439",
    discount: "5% Off",
    image: "/Products/homeproduct3.png",
    images: [
      "/Products/Product3.0.jpeg",
      "/Products/Product3.1.jpeg",
      "/Products/CommonProduct.jpg",
      "/Products/Product3.3.png",
    ],
    benefit: "Anti Microbial",
    form: "Spray",
    description:
      "CureMist – The World's First Ayurvedic Wound Spray. 100% Ayurvedic and AYUSH-approved, it delivers fast, hands-free healing with a waterproof, dust-proof protective layer, harnessing turmeric's anti-bacterial, anti-fungal, and anti-inflammatory power for safe use across all ages.",
  },
];

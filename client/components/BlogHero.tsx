import { Link } from "react-router-dom";
import {
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
} from "./ui/breadcrumb";

interface HeroProps {
  title: string;
  subtitle?: string;
  breadcrumbItems?: { label: string; href?: string }[];
}

const BlogHero = ({ title, subtitle, breadcrumbItems = [] }: HeroProps) => {
  return (
    <section className="bg-gradient-to-r from-[#f5ce59] to-[#faebbf] py-4 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col items-center gap-6">
          <BreadcrumbList>
            {breadcrumbItems.map((b, idx) => (
              <BreadcrumbItem key={idx}>
                {b.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={b.href}>{b.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="font-normal text-foreground">{b.label}</span>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </div>
      </div>
    </section>
  );
};

export default BlogHero;

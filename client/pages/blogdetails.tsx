import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Share2 } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts } from "@/lib/blogs";
import { Button } from "@/components/ui/button";
import {
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Blog post not found</p>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title.substring(0, 25) + "..." },
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />

      {/* Breadcrumb Section */}
      <section className="py-2 px-4 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6 lg:px-24">
          <BreadcrumbList className="text-xs md:text-sm">
            {breadcrumbItems.map((b, idx) => (
              <BreadcrumbItem key={idx}>
                {b.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={b.href}>{b.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{b.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </div>
      </section>

      <main className="flex-1 bg-background py-6 md:py-8 lg:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-24 max-w-4xl">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-curemist-purple text-center mb-6 md:mb-8 leading-tight mt-4 md:mt-8">
            {post.title}
          </h1>

          {/* Featured Image */}
          <div className="aspect-video overflow-hidden rounded-lg mb-6 md:mb-8">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Meta Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
            <p className="text-xs md:text-sm font-medium text-blog-date">
              {post.date}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {post.content.map((item, index) => {
              // Backward compatibility for plain string paragraphs
              if (typeof item === "string") {
                return (
                  <div key={index} className="mb-6">
                    {index > 0 && index % 2 === 0 && (
                      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                        Sed ut perspiciatis unde omnis iste natus error sit
                      </h2>
                    )}
                    <p className="text-foreground/80 leading-relaxed">{item}</p>
                  </div>
                );
              }

              // Handle structured content
              switch (item.type) {
                case "mainheading":
                  return (
                    <h2
                      key={index}
                      className="text-2xl md:text-3xl font-bold text-foreground mt-10 mb-6"
                    >
                      {item.text}
                    </h2>
                  );
                case "subheading":
                  return (
                    <h3
                      key={index}
                      className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4"
                    >
                      {item.text}
                    </h3>
                  );
                case "paragraph":
                case "description":
                  return (
                    <p
                      key={index}
                      className="text-foreground/80 leading-relaxed mb-6"
                    >
                      {item.text}
                    </p>
                  );
                case "list":
                  return (
                    <ul
                      key={index}
                      className="list-disc pl-6 mb-6 text-foreground/80 leading-relaxed space-y-2"
                    >
                      {item.items?.map((listItem: string, i: number) => (
                        <li key={i}>{listItem}</li>
                      ))}
                    </ul>
                  );
                default:
                  return null;
              }
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between sm:justify-start gap-4 mt-12 pt-8">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none sm:w-auto border-2 border-muted-foreground/30 text-foreground font-semibold hover:bg-muted px-12 py-6"
            >
              BACK
            </Button>

            <button
              onClick={handleShare}
              className="p-3 shrink-0 rounded-full sm:rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-2 border-2 border-muted-foreground/30 sm:border-none"
              aria-label="Share Blog"
              title="Share Blog"
            >
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
              <span className="font-semibold text-foreground text-sm sm:text-base">Share</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;

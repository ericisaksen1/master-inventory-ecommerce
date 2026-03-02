export interface FieldDef {
  key: string
  label: string
  type: "text" | "number" | "select" | "toggle" | "product" | "textarea" | "repeater" | "image" | "color"
  options?: { label: string; value: string }[]
  subFields?: FieldDef[]
  group?: string
}

export interface ComponentDef {
  label: string
  defaultSettings: Record<string, any>
  fields: FieldDef[]
}


// Reusable color field definitions
const colorDefaults = { bgColor: "", headlineColor: "", textColor: "" }
const colorDefaultsNoText = { bgColor: "", headlineColor: "" }
const buttonColorDefaults = { buttonColor: "", buttonTextColor: "", buttonHoverColor: "", buttonHoverTextColor: "" }
const linkColorDefaults = { linkColor: "", linkHoverColor: "" }

const baseColorFields: FieldDef[] = [
  { key: "bgColor", label: "Background", type: "color", group: "Colors" },
  { key: "headlineColor", label: "Headline", type: "color", group: "Colors" },
  { key: "textColor", label: "Text", type: "color", group: "Colors" },
]
const baseColorFieldsNoText: FieldDef[] = [
  { key: "bgColor", label: "Background", type: "color", group: "Colors" },
  { key: "headlineColor", label: "Headline", type: "color", group: "Colors" },
]
const buttonColorFields: FieldDef[] = [
  { key: "buttonColor", label: "Button", type: "color", group: "Colors" },
  { key: "buttonTextColor", label: "Button Text", type: "color", group: "Colors" },
  { key: "buttonHoverColor", label: "Button Hover", type: "color", group: "Colors" },
  { key: "buttonHoverTextColor", label: "Button Hover Text", type: "color", group: "Colors" },
]
const linkColorFields: FieldDef[] = [
  { key: "linkColor", label: "Link", type: "color", group: "Colors" },
  { key: "linkHoverColor", label: "Link Hover", type: "color", group: "Colors" },
]

export const componentRegistry: Record<string, ComponentDef> = {
  hero_banner: {
    label: "Hero Banner",
    defaultSettings: {
      heading: "Welcome to the Store",
      subtext: "Discover our curated collection of products.",
      primaryButtonText: "Shop Now",
      primaryButtonUrl: "/products",
      secondaryButtonText: "Become an Affiliate",
      secondaryButtonUrl: "/affiliate/apply",
      showSecondaryButton: true,
      layout: "centered",
      textAlign: "center",
      imageUrl: "",
      imageAlt: "",
      backgroundImageUrl: "",
      overlayOpacity: "50",
      minHeight: "default",
      verticalAlign: "center",
      headingFontSize: "7xl",
      subtextFontSize: "xl",
      ...colorDefaults,
      ...buttonColorDefaults,
    },
    fields: [
      { key: "layout", label: "Layout", type: "select", options: [
        { label: "Centered (Text Only)", value: "centered" },
        { label: "Split - Image Right", value: "split_image_right" },
        { label: "Split - Image Left", value: "split_image_left" },
        { label: "Background Image", value: "background_image" },
      ], group: "Layout" },
      { key: "textAlign", label: "Text Alignment", type: "select", options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ], group: "Layout" },
      { key: "minHeight", label: "Minimum Height", type: "select", options: [
        { label: "Default", value: "default" },
        { label: "Medium (500px)", value: "medium" },
        { label: "Tall (600px)", value: "tall" },
        { label: "Full Screen", value: "screen" },
      ], group: "Layout" },
      { key: "verticalAlign", label: "Vertical Alignment", type: "select", options: [
        { label: "Top", value: "top" },
        { label: "Center", value: "center" },
        { label: "Bottom", value: "bottom" },
      ], group: "Layout" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "headingFontSize", label: "Heading Font Size", type: "select", options: [
        { label: "Small (2xl)", value: "2xl" },
        { label: "Medium (3xl)", value: "3xl" },
        { label: "Large (4xl)", value: "4xl" },
        { label: "XL (5xl)", value: "5xl" },
        { label: "2XL (6xl)", value: "6xl" },
        { label: "3XL (7xl)", value: "7xl" },
      ] },
      { key: "subtext", label: "Subtext", type: "text" },
      { key: "subtextFontSize", label: "Subtext Font Size", type: "select", options: [
        { label: "Small (sm)", value: "sm" },
        { label: "Base", value: "base" },
        { label: "Large (lg)", value: "lg" },
        { label: "XL", value: "xl" },
        { label: "2XL", value: "2xl" },
        { label: "3XL", value: "3xl" },
      ] },
      { key: "primaryButtonText", label: "Primary Button Text", type: "text" },
      { key: "primaryButtonUrl", label: "Primary Button URL", type: "text" },
      { key: "secondaryButtonText", label: "Secondary Button Text", type: "text" },
      { key: "secondaryButtonUrl", label: "Secondary Button URL", type: "text" },
      { key: "showSecondaryButton", label: "Show Secondary Button", type: "toggle" },
      { key: "imageUrl", label: "Split Image", type: "image", group: "Images" },
      { key: "imageAlt", label: "Split Image Alt Text", type: "text", group: "Images" },
      { key: "backgroundImageUrl", label: "Background Image", type: "image", group: "Images" },
      { key: "overlayOpacity", label: "Background Overlay", type: "select", options: [
        { label: "None (0%)", value: "0" },
        { label: "Light (25%)", value: "25" },
        { label: "Medium (50%)", value: "50" },
        { label: "Dark (75%)", value: "75" },
        { label: "Very Dark (90%)", value: "90" },
      ], group: "Images" },
      ...baseColorFields,
      ...buttonColorFields,
    ],
  },
  category_grid: {
    label: "Category Grid",
    defaultSettings: {
      heading: "Shop by Category",
      maxCategories: 8,
      ...colorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "maxCategories", label: "Max Categories", type: "number" },
      ...baseColorFields,
    ],
  },
  featured_products_grid: {
    label: "Featured Products Grid",
    defaultSettings: {
      heading: "Featured Products",
      maxProducts: 8,
      source: "featured",
      showViewAll: true,
      ...colorDefaults,
      ...linkColorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "maxProducts", label: "Max Products", type: "number" },
      {
        key: "source",
        label: "Product Source",
        type: "select",
        options: [
          { label: "Featured Products", value: "featured" },
          { label: "Newest Products", value: "newest" },
          { label: "On Sale", value: "on_sale" },
        ],
      },
      { key: "showViewAll", label: "Show 'View All' Link", type: "toggle" },
      ...baseColorFields,
      ...linkColorFields,
    ],
  },
  featured_products_carousel: {
    label: "Featured Products Carousel",
    defaultSettings: {
      heading: "Featured Products",
      maxProducts: 8,
      showViewAll: true,
      source: "featured",
      autoPlay: false,
      ...colorDefaults,
      ...linkColorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "maxProducts", label: "Max Products", type: "number" },
      { key: "showViewAll", label: "Show 'View All' Link", type: "toggle" },
      {
        key: "source",
        label: "Product Source",
        type: "select",
        options: [
          { label: "Featured Products", value: "featured" },
          { label: "Newest Products", value: "newest" },
          { label: "On Sale", value: "on_sale" },
        ],
      },
      { key: "autoPlay", label: "Auto-Play", type: "toggle" },
      ...baseColorFields,
      ...linkColorFields,
    ],
  },
  featured_product_hero: {
    label: "Featured Product Hero",
    defaultSettings: {
      productSlug: "",
      layout: "image_right",
      ctaText: "Add to Cart",
      showPrice: true,
      showDescription: true,
      ...colorDefaults,
      ...buttonColorDefaults,
    },
    fields: [
      { key: "productSlug", label: "Product", type: "product" },
      {
        key: "layout",
        label: "Layout",
        type: "select",
        options: [
          { label: "Image on Right", value: "image_right" },
          { label: "Image on Left", value: "image_left" },
        ],
      },
      { key: "ctaText", label: "Button Text", type: "text" },
      { key: "showPrice", label: "Show Price", type: "toggle" },
      { key: "showDescription", label: "Show Description", type: "toggle" },
      ...baseColorFields,
      ...buttonColorFields,
    ],
  },
  payment_methods: {
    label: "Payment Methods",
    defaultSettings: {
      heading: "Flexible Payment Options",
      ...colorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      ...baseColorFields,
    ],
  },
  rich_text_block: {
    label: "Rich Text Block",
    defaultSettings: {
      heading: "",
      content: "",
      maxWidth: "medium",
      ...colorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "content", label: "Content", type: "textarea" },
      {
        key: "maxWidth",
        label: "Max Width",
        type: "select",
        options: [
          { label: "Narrow (640px)", value: "narrow" },
          { label: "Medium (768px)", value: "medium" },
          { label: "Wide (1024px)", value: "wide" },
          { label: "Full Width", value: "full" },
        ],
      },
      ...baseColorFields,
    ],
  },
  cta_banner: {
    label: "CTA Banner",
    defaultSettings: {
      heading: "Special Offer",
      subtext: "Don't miss out on our latest deals.",
      buttonText: "Shop Now",
      buttonUrl: "/products",
      style: "primary",
      ...colorDefaults,
      ...buttonColorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtext", label: "Subtext", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonUrl", label: "Button URL", type: "text" },
      {
        key: "style",
        label: "Style",
        type: "select",
        options: [
          { label: "Primary", value: "primary" },
          { label: "Dark", value: "dark" },
          { label: "Accent", value: "accent" },
        ],
      },
      ...baseColorFields,
      ...buttonColorFields,
    ],
  },
  newsletter_signup: {
    label: "Newsletter Signup",
    defaultSettings: {
      heading: "Stay in the Loop",
      description: "Subscribe for exclusive deals and new product updates.",
      buttonText: "Subscribe",
      placeholder: "Enter your email",
      ...colorDefaults,
      ...buttonColorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "description", label: "Description", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "placeholder", label: "Placeholder Text", type: "text" },
      ...baseColorFields,
      ...buttonColorFields,
    ],
  },
  countdown_timer: {
    label: "Countdown Timer",
    defaultSettings: {
      heading: "Sale Ends In",
      endDate: "",
      buttonText: "Shop the Sale",
      buttonUrl: "/products",
      expiredMessage: "This sale has ended.",
      ...colorDefaults,
      ...buttonColorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "endDate", label: "End Date (YYYY-MM-DD HH:MM)", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonUrl", label: "Button URL", type: "text" },
      { key: "expiredMessage", label: "Expired Message", type: "text" },
      ...baseColorFields,
      ...buttonColorFields,
    ],
  },
  testimonials: {
    label: "Testimonials",
    defaultSettings: {
      heading: "What Our Customers Say",
      items: [],
      ...colorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Testimonials",
        type: "repeater",
        subFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role / Location", type: "text" },
          { key: "quote", label: "Quote", type: "text" },
        ],
      },
      ...baseColorFields,
    ],
  },
  trust_badges: {
    label: "Trust Badges",
    defaultSettings: {
      heading: "",
      items: [
        { icon: "truck", title: "Free Shipping", description: "On orders over $50" },
        { icon: "refresh", title: "Easy Returns", description: "30-day return policy" },
        { icon: "shield", title: "Secure Checkout", description: "SSL encrypted payments" },
      ],
      ...colorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Badges",
        type: "repeater",
        subFields: [
          {
            key: "icon",
            label: "Icon",
            type: "select",
            options: [
              { label: "Truck", value: "truck" },
              { label: "Refresh/Returns", value: "refresh" },
              { label: "Shield/Security", value: "shield" },
              { label: "Clock", value: "clock" },
              { label: "Star", value: "star" },
              { label: "Heart", value: "heart" },
            ],
          },
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "text" },
        ],
      },
      ...baseColorFields,
    ],
  },
  brand_logos: {
    label: "Brand / Partner Logos",
    defaultSettings: {
      heading: "Trusted By",
      items: [],
      ...colorDefaultsNoText,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Logos",
        type: "repeater",
        subFields: [
          { key: "name", label: "Brand Name", type: "text" },
          { key: "imageUrl", label: "Logo Image", type: "image" },
          { key: "linkUrl", label: "Link URL (optional)", type: "text" },
        ],
      },
      ...baseColorFieldsNoText,
    ],
  },
  collection_links: {
    label: "Collection Links",
    defaultSettings: {
      heading: "Shop Our Collections",
      items: [],
      ...colorDefaults,
      ...linkColorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Links",
        type: "repeater",
        subFields: [
          { key: "title", label: "Title", type: "text" },
          { key: "url", label: "URL", type: "text" },
          { key: "description", label: "Description", type: "text" },
        ],
      },
      ...baseColorFields,
      ...linkColorFields,
    ],
  },
  image_text_split: {
    label: "Image + Text Split",
    defaultSettings: {
      heading: "",
      content: "",
      imageUrl: "",
      imageAlt: "",
      layout: "image_left",
      buttonText: "",
      buttonUrl: "",
      showButton: false,
      ...colorDefaults,
      ...buttonColorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "content", label: "Content", type: "textarea" },
      { key: "imageUrl", label: "Image", type: "image" },
      { key: "imageAlt", label: "Image Alt Text", type: "text" },
      {
        key: "layout",
        label: "Layout",
        type: "select",
        options: [
          { label: "Image on Left", value: "image_left" },
          { label: "Image on Right", value: "image_right" },
        ],
      },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonUrl", label: "Button URL", type: "text" },
      { key: "showButton", label: "Show Button", type: "toggle" },
      ...baseColorFields,
      ...buttonColorFields,
    ],
  },
  video_embed: {
    label: "Video Embed",
    defaultSettings: {
      heading: "",
      description: "",
      videoUrl: "",
      ...colorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "description", label: "Description", type: "text" },
      { key: "videoUrl", label: "YouTube or Vimeo URL", type: "text" },
      ...baseColorFields,
    ],
  },
  faq_accordion: {
    label: "FAQ Accordion",
    defaultSettings: {
      heading: "Frequently Asked Questions",
      items: [],
      ...colorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Questions",
        type: "repeater",
        subFields: [
          { key: "question", label: "Question", type: "text" },
          { key: "answer", label: "Answer", type: "text" },
        ],
      },
      ...baseColorFields,
    ],
  },
  recent_blog_posts: {
    label: "Recent Blog Posts",
    defaultSettings: {
      heading: "From the Blog",
      maxPosts: 3,
      showViewAll: true,
      ...colorDefaultsNoText,
      ...linkColorDefaults,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "maxPosts", label: "Max Posts", type: "number" },
      { key: "showViewAll", label: "Show 'View All' Link", type: "toggle" },
      ...baseColorFieldsNoText,
      ...linkColorFields,
    ],
  },
  marquee_banner: {
    label: "Marquee Banner",
    defaultSettings: {
      mode: "text",
      content: "Welcome to our store — Free shipping on orders over $50",
      source: "featured",
      maxProducts: 10,
      speed: "medium",
      direction: "left",
      bgColor: "#000000",
      textColor: "#ffffff",
      separator: "·",
      pauseOnHover: true,
      fontSize: "sm",
      fontFamily: "",
    },
    fields: [
      {
        key: "mode",
        label: "Content Mode",
        type: "select",
        options: [
          { label: "Custom Text", value: "text" },
          { label: "Product Names", value: "products" },
        ],
      },
      { key: "content", label: "Text Content", type: "textarea" },
      {
        key: "source",
        label: "Product Source",
        type: "select",
        options: [
          { label: "All Products", value: "all" },
          { label: "Featured Products", value: "featured" },
          { label: "Newest Products", value: "newest" },
          { label: "On Sale", value: "on_sale" },
        ],
      },
      { key: "maxProducts", label: "Max Products", type: "number" },
      {
        key: "speed",
        label: "Scroll Speed",
        type: "select",
        options: [
          { label: "Slow", value: "slow" },
          { label: "Medium", value: "medium" },
          { label: "Fast", value: "fast" },
        ],
      },
      {
        key: "direction",
        label: "Direction",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      },
      { key: "bgColor", label: "Background Color", type: "color", group: "Colors" },
      { key: "textColor", label: "Text Color", type: "color", group: "Colors" },
      {
        key: "fontSize",
        label: "Font Size",
        type: "select",
        options: [
          { label: "Extra Small", value: "xs" },
          { label: "Small", value: "sm" },
          { label: "Normal", value: "base" },
          { label: "Large", value: "lg" },
          { label: "Extra Large", value: "xl" },
          { label: "2X Large", value: "2xl" },
        ],
      },
      {
        key: "fontFamily",
        label: "Font",
        type: "select",
        options: [
          { label: "Theme Default", value: "" },
          { label: "Inter", value: "Inter, sans-serif" },
          { label: "Roboto", value: "Roboto, sans-serif" },
          { label: "Open Sans", value: "Open Sans, sans-serif" },
          { label: "Lato", value: "Lato, sans-serif" },
          { label: "Poppins", value: "Poppins, sans-serif" },
          { label: "Montserrat", value: "Montserrat, sans-serif" },
          { label: "Nunito", value: "Nunito, sans-serif" },
          { label: "Raleway", value: "Raleway, sans-serif" },
          { label: "Source Sans 3", value: "Source Sans 3, sans-serif" },
          { label: "Work Sans", value: "Work Sans, sans-serif" },
          { label: "DM Sans", value: "DM Sans, sans-serif" },
          { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans, sans-serif" },
          { label: "Playfair Display", value: "Playfair Display, serif" },
          { label: "Merriweather", value: "Merriweather, serif" },
          { label: "Lora", value: "Lora, serif" },
          { label: "PT Serif", value: "PT Serif, serif" },
          { label: "Libre Baskerville", value: "Libre Baskerville, serif" },
          { label: "Space Mono", value: "Space Mono, monospace" },
          { label: "JetBrains Mono", value: "JetBrains Mono, monospace" },
          { label: "Fira Code", value: "Fira Code, monospace" },
        ],
      },
      { key: "separator", label: "Separator Character", type: "text" },
      { key: "pauseOnHover", label: "Pause on Hover", type: "toggle" },
    ],
  },
  product_listing: {
    label: "Product Listing",
    defaultSettings: {
      heading: "All Products",
      showFilters: true,
      showSort: true,
      showCategoryNav: true,
      ...colorDefaultsNoText,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "showFilters", label: "Show Filters", type: "toggle" },
      { key: "showSort", label: "Show Sort", type: "toggle" },
      { key: "showCategoryNav", label: "Show Category Nav", type: "toggle" },
      ...baseColorFieldsNoText,
    ],
  },
  spacer_divider: {
    label: "Spacer / Divider",
    defaultSettings: {
      height: "medium",
      showLine: false,

    },
    fields: [
      {
        key: "height",
        label: "Height",
        type: "select",
        options: [
          { label: "Small (32px)", value: "small" },
          { label: "Medium (64px)", value: "medium" },
          { label: "Large (96px)", value: "large" },
        ],
      },
      { key: "showLine", label: "Show Divider Line", type: "toggle" },

    ],
  },
}

export function getComponentDef(type: string): ComponentDef | undefined {
  return componentRegistry[type]
}

export function getComponentLabel(type: string): string {
  return componentRegistry[type]?.label || type
}

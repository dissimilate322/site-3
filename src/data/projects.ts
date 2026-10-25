/** Public project metadata from otherlife.xyz/work, inspected 25 October 2026. */
export type Project = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  year: string;
  services: string;
  href: string;
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
    source: string;
  };
};

export const projects: readonly Project[] = [
  {
    "slug": "artist-accelerator",
    "title": "Artist Accelerator",
    "subtitle": "Mastercard",
    "description": "Fully accessible, WebGL experience integrating Mastercard’s sonic brand into a dynamic digital pass.",
    "year": "2024",
    "services": "Visual Design, Engineering, Strategy, Interactive",
    "href": "https://www.otherlife.xyz/work/artist-accelerator",
    "image": {
      "src": "/assets/artist-accelerator.jpeg",
      "width": 2880,
      "height": 1652,
      "alt": "Mastercard",
      "source": "https://incredible-wonder-2edce76da7.media.strapiapp.com/e118407778716a5f51695fb49abaeaa4298d730f_2880x1652_6aae9c1bf8.jpeg"
    }
  },
  {
    "slug": "onramper",
    "title": "Onramper",
    "subtitle": "Simplifying Transaction Success",
    "description": "Rebranding Onramper for Scale",
    "year": "2025",
    "services": "Branding, Visual Design, Strategy, Website",
    "href": "https://www.otherlife.xyz/work/onramper",
    "image": {
      "src": "/assets/onramper.png",
      "width": 3413,
      "height": 1920,
      "alt": "Onramper",
      "source": "https://incredible-wonder-2edce76da7.media.strapiapp.com/382b48b2932fcf4e5e886849ad7f07d9d1f76fc7_3413x1920_afcad47168.png"
    }
  },
  {
    "slug": "christies",
    "title": "Christie's",
    "subtitle": "Art + Tech Summit",
    "description": " The Christie's Art+Tech Summit 2024",
    "year": "2024",
    "services": "Visual Design, Engineering, Strategy",
    "href": "https://www.otherlife.xyz/work/christies",
    "image": {
      "src": "/assets/christies.jpeg",
      "width": 2880,
      "height": 1652,
      "alt": "Christie's",
      "source": "https://incredible-wonder-2edce76da7.media.strapiapp.com/5c57855ea4bade775cf83aa248eff2b40278c291_2880x1652_45d928b910.jpeg"
    }
  },
  {
    "slug": "cake-wallet",
    "title": "Cake Wallet",
    "subtitle": "Cake Wallet",
    "description": "Creating a brand is a piece of cake",
    "year": "2025",
    "services": "Branding, Visual Design, Strategy",
    "href": "https://www.otherlife.xyz/work/cake-wallet",
    "image": {
      "src": "/assets/cake-wallet.png",
      "width": 2880,
      "height": 1652,
      "alt": "Cake Wallet",
      "source": "https://incredible-wonder-2edce76da7.media.strapiapp.com/9122b3f2b6b63a42e06758dc110ff23d97a461b8_2880x1652_9b1b1f9ea7.png"
    }
  },
  {
    "slug": "narcos",
    "title": "Narcos",
    "subtitle": "Locke Holdings / Dazzy",
    "description": "Immersive NARCOS storefront and digital collectibles.",
    "year": "2024",
    "services": "Visual Design, Engineering, Strategy",
    "href": "https://www.otherlife.xyz/work/narcos",
    "image": {
      "src": "/assets/narcos.jpeg",
      "width": 2880,
      "height": 1652,
      "alt": "Narcos",
      "source": "https://incredible-wonder-2edce76da7.media.strapiapp.com/db7e0aef0938a920b826ab28f3a155ae5028689c_2880x1652_98b9f6b2f6.jpeg"
    }
  },
  {
    "slug": "hypernative",
    "title": "Hypernative",
    "subtitle": null,
    "description": "Rebranded and expanded website with a modern elevated presence.",
    "year": "2024",
    "services": "Branding, Visual Design, Engineering, Interactive",
    "href": "https://www.otherlife.xyz/work/hypernative",
    "image": {
      "src": "/assets/hypernative.jpeg",
      "width": 2880,
      "height": 1652,
      "alt": "Hypernative",
      "source": "https://incredible-wonder-2edce76da7.media.strapiapp.com/76048874ec72a8fbca6310ef7dd75308e4a902a2_2880x1652_4db939d13d.jpeg"
    }
  }
];

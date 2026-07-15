import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  srcExclude: ["parts/**"],
  base: "/compose-md/",
  title: "Compose-MD ",
  description: "Compose markdown docs from fragments of other markdown docs ",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/overview" },
      {
        text: "GitHub",
        link: "https://github.com/dwjohnston/compose-md",
      },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Overview", link: "/overview" },
          { text: "Getting Started", link: "/get-started" },
        ],
      },
      {
        text: "Guide",
        items: [
          { text: "Core Concepts", link: "/core-concepts" },
          { text: "How It Works", link: "/how-it-works" },
          { text: "CLI Command Reference", link: "/cli-reference" },
          { text: "Schema Reference", link: "/schema-reference" },
        ],
      },
      {
        text: "Reference",
        items: [{ text: "Limitations", link: "/limitations" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/dwjohnston/compose-md" },
    ],

    search: {
      provider: "local",
    },

    footer: {
      message: "Released under the MIT License.",
    },
  }
})

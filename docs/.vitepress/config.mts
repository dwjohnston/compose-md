import { defineConfig } from "vitepress";

export default defineConfig({
  title: "compose-md",
  description: "A Bun CLI for composing markdown files from a fragment pool",
  // Served at https://<owner>.github.io/compose-md/ by the GitHub Pages workflow.
  base: "/compose-md/",
  cleanUrls: true,

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
        items: [{ text: "Overview", link: "/overview" }],
      },
      {
        text: "Guide",
        items: [
          { text: "Core Concepts", link: "/core-concepts" },
          { text: "Directory Structure", link: "/directory-structure" },
          { text: "Starting Prompts & Skills", link: "/starting-prompts" },
          { text: "CLI Command Reference", link: "/cli-reference" },
          { text: "Schema Reference", link: "/schema-reference" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Constraints", link: "/constraints" },
          { text: "Known Limitations", link: "/known-limitations" },
        ],
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
  },
});

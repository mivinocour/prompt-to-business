We are going to create a working prototype of Google AI Studio, I want you to:
- Study the mockups I provided 
- The UI features a left navigation panel, a main canvas area, and a right settings panel/model config area
- The right also has a slide out panel when certain things are clicked, like model, where the user can then browse and select a model
- in the middle of the UI there is the the Chat canvas area
- Here the user can interact with a model and chat with it 
- We will add functionality later, create the UI for now

##Helpful files
Landing.png - this is the landing page
Model panel.png - this is mock with landing page open
figma-styles.png - the CSS styles from Figma


##Other helpful notes if using ShadCN:
Install Tailwind using the Tailwind docs, then go to ShadCN and pickup where “npx shadcn@latest init “ starts. The ShadCN docs are missing a step or two with setting up Tailwind. Had the same issue the other day.


ShadCN docs
Monorepo
Previous
Next
Using shadcn/ui components and CLI in a monorepo.

Until now, using shadcn/ui in a monorepo was a bit of a pain. You could add components using the CLI, but you had to manage where the components were installed and manually fix import paths.

With the new monorepo support in the CLI, we've made it a lot easier to use shadcn/ui in a monorepo.

The CLI now understands the monorepo structure and will install the components, dependencies and registry dependencies to the correct paths and handle imports for you.

Getting started
Create a new monorepo project
To create a new monorepo project, run the init command. You will be prompted to select the type of project you are creating.

pnpm
npm
yarn
bun
npx shadcn@canary init
Copy
Select the Next.js (Monorepo) option.

Copy
? Would you like to start a new project?
    Next.js
❯   Next.js (Monorepo)
This will create a new monorepo project with two workspaces: web and ui, and Turborepo as the build system.

Everything is set up for you, so you can start adding components to your project.

Note: The monorepo uses React 19 and Tailwind CSS v4.

Add components to your project
To add components to your project, run the add command in the path of your app.

Copy
cd apps/web
pnpm
npm
yarn
bun
npx shadcn@canary add [COMPONENT]
Copy
The CLI will figure out what type of component you are adding and install the correct files to the correct path.

For example, if you run npx shadcn@canary add button, the CLI will install the button component under packages/ui and update the import path for components in apps/web.

If you run npx shadcn@canary add login-01, the CLI will install the button, label, input and card components under packages/ui and the login-form component under apps/web/components.

Importing components
You can import components from the @workspace/ui package as follows:

Copy
import { Button } from "@workspace/ui/components/button"
You can also import hooks and utilities from the @workspace/ui package.

Copy
import { useTheme } from "@workspace/ui/hooks/use-theme"
import { cn } from "@workspace/ui/lib/utils"
File Structure
When you create a new monorepo project, the CLI will create the following file structure:

Copy
apps
└── web         # Your app goes here.
    ├── app
    │   └── page.tsx
    ├── components
    │   └── login-form.tsx
    ├── components.json
    └── package.json
packages
└── ui          # Your components and dependencies are installed here.
    ├── src
    │   ├── components
    │   │   └── button.tsx
    │   ├── hooks
    │   ├── lib
    │   │   └── utils.ts
    │   └── styles
    │       └── globals.css
    ├── components.json
    └── package.json
package.json
turbo.json
Requirements
Every workspace must have a components.json file. A package.json file tells npm how to install the dependencies. A components.json file tells the CLI how and where to install components.

The components.json file must properly define aliases for the workspace. This tells the CLI how to import components, hooks, utilities, etc.

apps/web/components.json
Copy
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/ui/src/styles/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "utils": "@workspace/ui/lib/utils",
    "ui": "@workspace/ui/components"
  }
}
packages/ui/components.json
Copy
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@workspace/ui/components",
    "utils": "@workspace/ui/lib/utils",
    "hooks": "@workspace/ui/hooks",
    "lib": "@workspace/ui/lib",
    "ui": "@workspace/ui/components"
  }
}
Ensure you have the same style, iconLibrary and baseColor in both components.json files.

For Tailwind CSS v4, leave the tailwind config empty in the components.json file.

By following these requirements, the CLI will be able to install ui components, blocks, libs and hooks to the correct paths and handle imports for you.
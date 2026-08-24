
# LLM-Friendly README for Google AI Studio Prototype

This document provides a comprehensive overview of the Google AI Studio prototype, designed to be easily understood by a large language model. Its purpose is to equip an LLM with the necessary context to effectively assist in the development, extension, and maintenance of this project.

## 1. Project Overview

This application is a functional prototype of the Google AI Studio, a web-based interface for interacting with Google's Gemini family of AI models. It's built using Next.js, TypeScript, and Tailwind CSS, and it faithfully recreates the core user experience of the official tool.

The primary goal of this project is to provide a clean, well-structured, and easily extensible foundation for building advanced AI-powered chat applications.

### Core Features:

*   **Responsive Design**: The UI is fully responsive and adapts to various screen sizes, from mobile devices to large desktop monitors.
*   **Chat Interface**: A central, intuitive chat interface allows users to send prompts and receive responses from the selected AI model.
*   **Model Selection**: Users can browse and select from a list of available Gemini models.
*   **Model Configuration**: A dedicated panel provides granular control over the model's parameters, such as temperature, top-p, and top-k.
*   **Conversation History**: The chat interface maintains a history of the current conversation.
*   **Build Interface**: A dedicated Build section for creating and managing AI applications with full-screen carousel showcasing demo apps.
*   **Dark Theme**: The application uses a sleek, dark-themed design consistent with modern developer tools.

## 2. Architecture

The project follows a standard Next.js application structure, with a clear separation of concerns between pages, components, and utility functions.

### Key Directories:

*   `src/app/`: This directory contains the main entry point of the application, including the root layout (`layout.tsx`) and the home page (`page.tsx`). The application follows the Next.js App Router paradigm.
*   `src/components/`: This is the heart of the application's UI. It contains all the React components, organized by feature or functionality.
*   `src/lib/`: This directory holds utility functions and the logic for interacting with the Gemini API.
*   `src/hooks/`: This contains custom React hooks used for managing state and side effects.
*   `src/types/`: This directory contains TypeScript type definitions used throughout the application.

## 3. Key Components

The UI is broken down into several modular and reusable components. Understanding the role of each is crucial for making effective contributions.

### `src/app/page.tsx`

This is the main page of the application. It renders the `LandingPage` component, which in turn displays the `ChatInterface`.

### `src/components/landing-page.tsx`

This component serves as the initial view when a user visits the application. It's responsible for displaying the `ModelBrowser` and transitioning to the main `ChatInterface` once a model is selected.

### `src/components/sidebar.tsx`

This component renders the collapsible navigation sidebar on the left side of the screen. It provides links to create new chats and access different sections of the application. Key features include:

*   **Main Navigation**: Playground, Build, Documentation, and Dashboard sections
*   **Nested Build Navigation**: When the Build tab is clicked, a sliding overlay appears within the same sidebar showing Build-specific options (Start, Demo apps, Your apps, Shared with you, FAQ)
*   **State Management**: Manages both the main tab state and the nested Build navigation state
*   **Responsive Design**: Adapts to mobile devices with appropriate touch targets and interactions
*   **Theme Integration**: Supports light/dark theme switching through the settings dropdown

### `src/components/chat-interface.tsx`

This is the central component of the application. It orchestrates the entire chat experience, including:

*   Displaying the conversation history (`Conversation` component).
*   Managing the user input field.
*   Handling the submission of prompts to the Gemini API.
*   Rendering the `ChatHeader` component.

### `src/components/chat-header.tsx`

This component sits at the top of the chat interface and displays the name of the current chat or model. It also contains action buttons for sharing, comparing, and resetting the chat. It is designed to be responsive, with a condensed layout on mobile devices.

### `src/components/model-config-panel.tsx`

Located on the right side of the screen, this panel allows users to fine-tune the behavior of the selected AI model. It includes sliders and input fields for adjusting parameters like:

*   **Temperature**: Controls the randomness of the model's output.
*   **Top-P**: Sets a threshold for nucleus sampling.
*   **Top-K**: Limits the number of next-word choices the model considers.
*   **Max Output Tokens**: Defines the maximum length of the model's response.

### `src/components/model-browser.tsx`

This component displays a list of available Gemini models in a card-based layout. Users can select a model from this browser to start a new chat session.

### `src/components/build/build-interface.tsx`

This component renders the main Build interface, switching between different sections (Start, Demo apps, Your apps, Shared with you, FAQ) based on the active navigation item. It includes:

*   **Start Section**: Welcome page with app icons and introduction text
*   **Demo Apps Section**: Full-screen carousel showcasing live demo applications
*   **Your Apps Section**: Placeholder for user-created applications
*   **Shared with You Section**: Placeholder for shared applications
*   **FAQ Section**: Frequently asked questions about the Build feature

### `src/components/build/build-carousel.tsx`

A full-screen carousel component that displays demo applications. Features include:

*   **Full-screen presentation**: Each app takes up the entire viewport for maximum impact
*   **Navigation controls**: Arrow buttons and dot indicators for easy navigation
*   **App metadata**: Displays title, description, author, category, and live status
*   **Interactive elements**: "Try it out" and "View code" buttons for each app
*   **Responsive design**: Adapts to different screen sizes while maintaining visual appeal

## 4. State Management

The application primarily uses React's built-in state management capabilities (`useState`, `useReducer`, and `useContext`) to manage the UI state. There are no external state management libraries like Redux or Zustand.

*   **Component-Level State**: Most of the state is localized to the components that use it. For example, the `Sidebar` component manages its own collapsed/expanded state.
*   **Prop Drilling**: In some cases, state is passed down through component props from parent to child components. This is intentional to maintain a clear data flow.
*   **Custom Hooks**: The `src/hooks/` directory contains custom hooks that encapsulate reusable stateful logic.

## 5. API Integration

The application communicates with the Google Gemini API to send user prompts and receive AI-generated responses.

### `src/lib/gemini.ts`

This file is responsible for all interactions with the Gemini API. It contains functions that:

1.  Retrieve the API key from environment variables (`process.env.NEXT_PUBLIC_GEMINI_API_KEY`).
2.  Format the user's prompt and conversation history into the required structure.
3.  Send the request to the appropriate Gemini API endpoint.
4.  Parse the response and return the generated text to the application.

**Important**: The API key is stored in a `.env.local` file and should not be committed to version control.

## 6. Styling

The application is styled using **Tailwind CSS**, a utility-first CSS framework.

*   **Utility Classes**: Most of the styling is done directly in the JSX of the components using Tailwind's utility classes (e.g., `flex`, `p-4`, `text-white`).
*   **`clsx`**: The `clsx` library is used to conditionally apply classes, making it easier to manage dynamic styles based on component state.
*   **`tailwind.config.js`**: This file contains the project's Tailwind CSS configuration, including custom colors, fonts, and other design tokens.
*   **`src/app/globals.css`**: This file defines global styles and imports the necessary Tailwind CSS layers.

## 7. How to Extend the Application

When adding new features or modifying existing ones, please adhere to the following principles:

*   **Component-Based Architecture**: Create new, single-responsibility components for new UI elements.
*   **Follow Existing Patterns**: Emulate the patterns used in the existing codebase for state management, styling, and API integration.
*   **Use TypeScript**: Ensure all new code is strongly typed to maintain code quality and prevent runtime errors.
*   **Keep it LLM-Friendly**: When adding new components or complex logic, add comments to explain the "why" behind your implementation choices. This will help future LLMs (and human developers) understand the codebase more effectively.

### Example: Adding a "Copy to Clipboard" Button

1.  **Create a new component**: `src/components/ui/copy-button.tsx`.
2.  **Add the button's JSX and styling**: Use Tailwind CSS classes to style the button.
3.  **Implement the copy logic**: Use the `navigator.clipboard.writeText` API to copy the desired text.
4.  **Integrate the component**: Add the `CopyButton` to the `Conversation` component, next to each AI-generated message.

By following this guide, an LLM should have all the necessary context to understand, navigate, and contribute to this project effectively. 
# Green Refactor (Mistral)

**Green Refactor** is a powerful VS Code extension designed to help developers write more efficient, eco-friendly code. Powered by **Mistral AI**, it analyzes your code for algorithmic inefficiencies and resource waste, providing intelligent refactoring suggestions to reduce your software's carbon footprint.

## Features

-   **Deep Eco-Analysis**: Uses the advanced `mistral-large` model to audit your code for performance bottlenecks and energy inefficiencies.
-   **Algorithmic Complexity Check**: Automatically detects Big O complexity (e.g., identifying $O(N^2)$ loops that can be optimized to $O(N)$).
-   **Green Score & Impact**: Get a "Green Score" before and after optimization, along with estimated resource gains (CPU, Memory, CO2).
-   **One-Click Refactoring**: Receive ready-to-use optimized code snippets that maintain your business logic while improving performance.
-   **Gamified Progress**: Track your contribution to the planet with a running total of "CO2 Saved" and successful optimizations.
-   **Interactive Reports**: View detailed analysis summaries in a dedicated side panel.

## ⚙️ How It Works

1.  **Select Code**: Highlight the code snippet you want to optimize in your editor.
2.  **Run Analysis**: Right-click and choose **"🌿 Green Refactor (Mistral)"**, or use the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search for `Green Refactor`.
3.  **Review Report**: A detailed report panel will appear, showing:
    -   Original vs. Optimized Score.
    -   Complexity analysis (Before vs. After).
    -   Plain English explanation of the improvements.
    -   Refactored code block.
4.  **Apply Fix**: Use the suggested code to instantly improve your application's efficiency.

## 🛠️ Getting Started

### 1. Installation
Install the extension from the VS Code Marketplace (or load the `.vsix` file if installing manually).

### 2. Configuration
You need a valid **Mistral AI API Key** to use the analysis features.

1.  Go to the [Mistral AI Console](https://console.mistral.ai) to generate your API Key.
2.  Open VS Code Settings (`Ctrl+,` / `Cmd+,`).
3.  Search for `Green Refactor`.
4.  Enter your key in the **Api Key** field (`greenRefactor.apiKey`).

## 🔧 Extension Settings

This extension contributes the following settings:

*   `greenRefactor.apiKey`: Your Mistral AI API Key. Required for the extension to communicate with the Mistral API.

## 📝 Release Notes

### 0.0.1
-   Inital release of Green Refactor.
-   Added support for algorithmic complexity analysis.
-   Integrated Mistral Large for code optimization suggestions.
-   Added Green Score and Gamification tracking.

---

**Enjoy coding greener!**

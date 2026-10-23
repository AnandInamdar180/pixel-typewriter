# pixel-typewriter

Typewriter is a desktop checklist app that turns Markdown plans into an interactive pixel-art typewriter.

## About Electron

Typewriter is built with Electron, a framework for making desktop apps with web technologies. Electron combines Chromium for displaying the interface with Node.js for desktop functionality. This lets Typewriter use JavaScript, HTML, and CSS while running as a desktop app.

The project uses Electron’s main process to create the app window, a renderer process for the interface, and a preload script to provide a controlled bridge between them.

## Features

- Import Markdown plans by dropping a `.md` file or pasting its text
- Track tasks in focused or full-list views
- Save and restore task progress
- Switch between saved plans
- Record task completion times
- Add a session note when completing a plan
- Use optional sound effects
- Connect to an Obsidian vault by storing plans in a folder inside the vault

## Built With

- Electron
- JavaScript
- HTML
- CSS
- Markdown

## Use with Obsidian

Typewriter stores plans as Markdown files. To access the same files in Obsidian, set Typewriter’s records folder to a folder inside your Obsidian vault. For example:

    /path/to/YourVault/Typewriter

Then open that folder in Obsidian. Your plans will appear as Markdown notes and can be opened in either app.

Typewriter also creates `.progress.json` files beside plans to save checklist progress. Keep these files in the vault so Typewriter can restore progress. There is no direct Obsidian plugin or automatic sync; both apps work with the files in the shared folder.

## Run Locally

### Requirements

- [Node.js](https://nodejs.org/)
- npm

### Steps

    git clone https://github.com/AnandInamdar180/pixel-typewriter.git
    cd typewriter
    npm install
    npm start

## Markdown Plan Format

Plans need a title and at least one checklist item:

    # My Study Plan

    ## Week 1
    - [ ] Review the basics
    - [x] Set up my workspace

    ## Week 2
    - [ ] Build a small project

## Project Files

- `main.js` — creates and manages the Electron desktop window and file operations
- `preload.js` — provides a controlled bridge between Electron and the app interface
- `renderer.js` — handles checklist behavior and interface logic
- `index.html` — defines the app interface structure
- `style.css` — styles the pixel-art interface
- `Typewriter.command` — launcher script for macOS

## Launch on macOS

Start Typewriter from Terminal with:

    ./Typewriter.command

## About This Project

Typewriter is a personal project for exploring Electron desktop app development and creating a playful way to work through Markdown checklists.

## Prompt for Creating a Typewriter Plan

Copy this prompt into an AI assistant and replace the bracketed details with your own:

> Create a Markdown checklist plan that I can use with the Typewriter app.
>
> **Plan topic:** [What do you want to work on?]  
> **Time frame:** [How long do you have?]  
> **Available time:** [How much time can you spend each day or week?]  
> **Current level:** [Beginner, intermediate, or advanced]  
> **Goal:** [What would you like to accomplish?]
>
> Format the plan like this:
>
> - Start with one plan title using a single `#` heading.
> - Organize tasks under optional sections using `##` headings.
> - Write every task as `- [ ] Task description`.
> - Make tasks clear, specific, and achievable.
> - Include at least one task.
> - Return only the Markdown content, ready to save as a `.md` file.

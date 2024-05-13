# Diabolical Launcher

![Diabolical Launcher Logo](https://repository-images.githubusercontent.com/792842580/16442e04-f598-4024-b5b7-1cd3de882534)

Diabolical Launcher is a highly customizable game launcher designed for indie developers. Built on Electron, it supports auto-updates, integration with cloud storage solutions, and a dynamic UI for displaying game titles available for download.

## Features

### 🚀 Auto Updates
The launcher uses GitHub Actions and releases to automatically update clients to the latest version upon launch, ensuring all users have the latest features and security updates.

### 🎮 Dynamic Game Addition
Games can be added and updated through a database backend, with changes reflecting immediately in the launcher. Game cards are automatically created in the UI, complete with download buttons based on unique game IDs.

### 🔄 CI/CD Integration
Support for continuous integration and delivery with GitHub Actions for Unity projects. Automatically builds and uploads game files to Oracle Cloud buckets, facilitating seamless updates and distribution.

### 💾 Flexible Storage Solutions
While the launcher integrates seamlessly with Oracle Cloud for storing game builds, it also allows manual uploads to any cloud storage service, offering flexibility for different deployment needs.

### 🎨 Customizable UI
The UI is designed to be highly customizable, allowing developers to tailor the launcher to match their branding and aesthetic preferences.

## Installation

Provide detailed step-by-step installation instructions.

```bash
# Example command to clone the repo
git clone https://github.com/Diabolical-Studios/DiabolicalGameLauncher.git
```
```bash
# Installing dependencies
npm install
```
```bash
# Running the application
npm start
```

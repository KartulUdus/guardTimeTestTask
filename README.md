# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Prerequisites

* Have node JS v8 or later installed
* Have Yarn installed

Once you clone the project, you can run these commands in the project directory:

### `yarn install`

Installs the node modules needed to run th project.

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Description

The page is based on a test task for Guardtime. 
When Page is loaded, it fetches the first page of documents. From there on it will automatically load the next page of documents
before the user scrolls to the end.
The user can click 3 separate checks for each document which will make new REST calls to validate checksum, schema or signature. 
Timeout for errors are presented in red on the top right and for document fetches, it tries up to 5 additional times with increasing delay between requests.

on the top-left of the page, there is a "check all" button that will run the needed checks for any document that has not yet failed any checks


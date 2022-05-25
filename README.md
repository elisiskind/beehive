# Beehive
Chrome extension for making the [NY Times Spelling Bee](https://www.nytimes.com/puzzles/spelling-bee) social by allowing you to login with your chrome account, add friends, and see each other's scores. Sometimes it can be fun to discuss words in the puzzle, but it's hard to do that without accidentally spoiling it for someone else. Now you can also see which words you have found that your friends haven't found, and see how many words they have found that you haven't. 

# Project Structure
Most of the interesting code is in the `src` folder, which is broken into a few sections. `app` contains a React app which is injected into the Spelling Bee page and actually makes up the extension, and `background` is the script that chrome will run in the background that allows for access to chrome auth tokens. `lib` contains code shared between the two, which at this point is just messaging utility functions.

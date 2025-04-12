# Fiction Character Creator

A web-based tool for writers, role-players, and storytellers to create, manage, and export fictional characters. This application helps 
streamline the character creation process by providing a user-friendly interface and organized storage system for character profiles.

## TODO
1. integration with barcode reader app

## Key Features

- Create and manage multiple character profiles
- User-friendly dashboard interface
- Image upload support for character visuals
- Export characters in Character AI compatible format
- Local storage for privacy and easy access
- Customizable character attributes
- Edit and update existing characters

## How it works

1. we have local database(no SQL as content is per user)
2. user goes onto website and sees a dashboard of previously created characters
3. he goes to click a "New" button and it leads him to a small survey (all the questions are about a new character)
4. it allows to upload a picture of a character too (or provide a guide how to do it)
5. after all info is filled out, charater is created -> when accessing character via dashboard, you can see a raw file entry for Aharacter AI + image download button
6. character AI style in order to match the aestetics

## Technical details

1. React.js (maybe vanilla)
2. tailwind css
3. website animation + transition + scrolling + hovering animation libraries
4. json
5. dynamic objects to manipulate character info
6. locally stored files for chatacters (different folder)

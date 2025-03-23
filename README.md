# fiction_char_creator

tool that helps creating characters

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
5. dynamic objects
6. locally stored files for chatacters (different folder)

## List of bugs

3. When creating a character(all sections), when I type one letter or number it clicks out of the box making it impossible to properly type in the box, so I need to click on the box over and over again to type a full message
5. need to scrap all light/dark mode buttons that are still on the website
8. When accessing "background" of character creation, no matter where do I click, website automatically creates a character without letting me finish my character creation (as soon as user access the section, create character button autmatically getting triggered without user click)
13. buttons are still purple even tho main color of the website should be gray
14. "settings" tab does not work at all, page does not exist + its not needed
17. when choosing to export in character ai format, it gives nonsense information, it should directly follow the format that was provided while text format removes all the brackets and such(mini feature)
18. disclaimer should be a one time thing appearing for the user, and as user explore the website, it should not appear anymore, unless website was closed and opened again, then disclaimer should appear again
19. glow for character cards is purple which is not the main nor secondary color of the website, make it white
20. in CharacterForm file, i cannot drag it as i try to move it, the website "unclicks" my mouse and it does not drag the image anymore, and it does it every time i click and hold, it dosent hold. Same problem with typing, i cannot continuously type as website "unclicks" my tab when I try to type a word and a sentence into the text box. it affects all text boxes in this file.
21. for all the pages, hover over animations are pretty slow, which takes time to animate. make it faster so the website look dynamic
22. depeding on the amount of cards, the size of dashboard character's card is being different, sometimes it is correct and is small but when adding 2 or more characters, the character card in the dashboard becomes big and takes up a lot of space on the dashboard, fix it
23. when editing characters, system creates duplicates, as well as false characters that do appear in the dashboard but do not exist in the system. create a better handling logic to keep the character list in check and do not allow accidental duplicates when editing characters or fantom characters that user cannot access because it does not exist.


Note: never use @apply when doing css, apply css directly in js files, since we use tailwind OR do css in old fashioned way

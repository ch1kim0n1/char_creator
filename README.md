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

1. in CharacterForm file, i cannot drag it as i try to move it, the website "unclicks" my mouse and it does not drag the image anymore, and it does it every time i click and hold, it dosent hold. Same problem with typing, i cannot continuously type as website "unclicks" my tab when I try to type a word and a sentence into the text box. it affects all text boxes in this file.

2. when choosing to export in character ai format, it gives nonsense information, it should directly follow the format that was provided while text format removes all the brackets and such(new mini feature)

3. depeding on the amount of cards, the size of dashboard character's card is being different, sometimes it is correct and is small but when adding 2 or more characters, the character card in the dashboard becomes big and takes up a lot of space on the dashboard, fix it

4. when editing characters, system creates duplicates, as well as false characters that do appear in the dashboard but do not exist in the system. create a better handling logic to keep the character list in check and do not allow accidental

Note: never use @apply when doing css, apply css directly in js files, since we use tailwind OR do css in old fashioned way

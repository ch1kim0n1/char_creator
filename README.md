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

1. the disclaimer animation is too slow, moreover I would like to remove any animation so user has this notification head on
2. buttons do not have any background or outline, just text, fix it and make it look like a button(all buttons in fact)
3. When creating a character(all sections), when I type one letter or number it clicks out of the box making it impossible to properly type in the box, so I need to click on the box over and over again to type a full message
4. some text colors merge with the main colors, making it hard to read
5. the switch between dark mode and light mode dont work, even tho icons switch the website color stays the same with no switch
6. user cannot pick what part of 500x500 to keep in the profile picture, I want to add this mini feature
7. no smooth transition between dashboard and "about me" and "feedback" pages, making it abrupt and choppy
8. When accessing "background" of character creation, no matter where do I click, website automatically creates a character without letting me finish my character creation (as soon as user access the section, create character button autmatically getting triggered without user click)
9. when using seach/sort bar, list does not update properly, creating copies of characters that are already created
10. seach/sort bar dosent sort properly, meaning when in typing a name of a character, character that dosent match the name on the seach bar still appears on the screen
11. deisgn in "about" page looks horrible, make it look presentable by adding colors and maybe some new layout and design choises to make it look good
12. in feedback tab, all the text "enter your..." are mixing with the color of the page, making it really hard to read.
13. buttons are still purple even tho main color of the website should be gray
14. "settings" tab does not work at all, page does not exist + its not needed
15. when I click to access my character on the dashboard it takes me to a different page, but this page is broken when it comes to design, as background is just white(which should not be happening), export setting appearing without user clicking it
16. there is no picture download button in the format that was saved
17. when choosing to export in character ai format, it gives nonsense information, it should directly follow the format that was provided while text format removes all the brackets and such
18. disclaimer should be a one time thing appearing for the user, and as user explore the website, it should not appear anymore, unless website was closed and opened again, then disclaimer should appear again
19. gray accent color needs to be implemented instead of purple
20. never use @apply when doing css, apply css directly in js files, since we use tailwind OR do css in old fashioned way

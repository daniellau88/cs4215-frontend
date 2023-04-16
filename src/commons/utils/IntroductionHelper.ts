import { Chapter, Variant } from 'c-slang/dist/types';

import Constants, { Links } from './Constants';

const MAIN_INTRODUCTION = `
Welcome to the ${Constants.sourceAcademyDeploymentName} playground!
`;

const HOTKEYS_INTRODUCTION = `

In the editor on the left, you can use the [_Ace keyboard shortcuts_](${Links.aceHotkeys}) 
and also the [_Source Academy keyboard shortcuts_](${Links.sourceHotkeys}).

`;


const generateIntroductionText = (sourceChapter: Chapter, sourceVariant: Variant) => {
  return (
    MAIN_INTRODUCTION +  HOTKEYS_INTRODUCTION
  );
};

export const generateSourceIntroduction = (sourceChapter: Chapter, sourceVariant: Variant) => {
  return generateIntroductionText(sourceChapter, sourceVariant);
};

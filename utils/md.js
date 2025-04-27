import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
import parse from 'html-react-parser';

const md = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {
      }
    }

    return ''; // use external default escaping
  },
});

export const mdRender = mdContent => {
  return parse(md.render(mdContent));
};

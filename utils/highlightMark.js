import Mark from 'mark.js';

const options = note => {
  return {
    acrossElements: true,
    exclude: ['.shark-eagle-note-chrome-ext-wxt *'],
    separateWordSearch: false,
    each: node => {
      node.setAttribute('title', note.comment);
      node.setAttribute('id', note.id);
      if (note.highlightColor) {
        node.setAttribute('style', 'background-color:' + note.highlightColor + ';');
      }
      if (note.clickCallback) {
        node.addEventListener('click', event => note.clickCallback(event, note));
      }
    },
  };
};
const context = document.querySelector('body');
const instance = new Mark(context);

export function highlightAll(notes) {
  if (!notes || !notes.length) return;
  instance.unmark({
    done: () => {
      notes.forEach(note => {
        if (!note.isPageOnly) {
          instance.mark(note.highlightText, options(note));
        }
      });
    },
  });
}

export function highlight(note) {
  instance.unmark({
    done: () => {
      instance.mark(note.highlightText, options(note));
    },
  });
}

export function unmark() {
  instance.unmark();
}

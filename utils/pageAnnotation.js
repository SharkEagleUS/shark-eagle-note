import * as types from './actionTypes';
import * as baseUtils from './base';

/* pageAnnotation = {
   text: web page selected content
   note: User comment about above selected text
   isPageOnly: if true, it means this annotation is added manually, not from selecting text, e.g. for google docs, annotation on selected text does not work
   highlightColor: the color used to highlight the selected text in web page
 }

 valid pageAnnotation should have at least text or note.
 */

const isPageAnnotationValid = pageAnnotation => {
  return pageAnnotation && (pageAnnotation.highlightText || pageAnnotation.note);
};

export const submitPageAnnotationBackground = pageAnnotation => {
  return new Promise(function (resolve, reject) {
    if (!isPageAnnotationValid(pageAnnotation)) {
      reject(new Error('pageAnnotation should have at least selected text or comment.'));
      return;
    }
    const payload = {
      action: types.ADD_NOTE,
      pageAnnotation: pageAnnotation,
    };
    browser.runtime.sendMessage(payload).then(response => {
      console.log(response);
      resolve();
    });
  });
};

export const updatePageAnnotationBackground = pageAnnotation => {
  return new Promise(function (resolve, reject) {
    if (!isPageAnnotationValid(pageAnnotation) || !pageAnnotation.id) {
      reject(new Error('pageAnnotation to update should have its id and at least selected text or custom note(comment).'));
      return;
    }
    browser.runtime.sendMessage({pageAnnotation: pageAnnotation, action: types.UPDATE_NOTE}).then(response => {
      console.log(response);
      resolve();
    });
  });
};

export const deletePageAnnotationBackground = pageAnnotationId => {
  return new Promise(function (resolve, reject) {
    if (!pageAnnotationId || pageAnnotationId < 0) {
      reject(new Error('Page Annotation id is not valid!'));
      return;
    }
    browser.runtime.sendMessage({id: pageAnnotationId, action: types.DELETE_NOTE}).then(response => {
      console.log(response);
      resolve();
    });
  });
};

export const searchPageAnnotationsBackground = keyword => {
  return new Promise(function (resolve, reject) {
    if (baseUtils.isBlank(keyword)) {
      reject(new Error('Keyword should not be empty!'));
      return;
    }
    browser.runtime.sendMessage({keyword: keyword, action: types.SEARCH}, response => {
      resolve(response);
    });
  });
};

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import { genId, getCurrentTimestampInMs, removeScriptTags } from './base';
import { defaultColor } from './color';

PouchDB.plugin(PouchDBFind);
const db = new PouchDB('metanote');
db.createIndex({
  index: { fields: ['url'] },
});

export const fetchAllMyNotes = keyword => {
  return new Promise((resolve, reject) => {
    db.allDocs({ include_docs: true, descending: true })
      .then(doc => {
        resolve(doc.rows);
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

export const fetchAllMyAnnotationsByUrl = url => {
  return new Promise((resolve, reject) => {
    db.find({
      selector: { url: url },
    })
      .then(doc => resolve(doc.rows))
      .catch(function(err) {
        console.error(err);
      });
  });
};

export const savePageAnnotation = pageAnnotation => {
  return new Promise((resolve, reject) => {
    const id = genId();
    pageAnnotation._id = String(id);
    pageAnnotation.createdAt = getCurrentTimestampInMs();
    db.put(pageAnnotation)
      .then(_ => {
        resolve(db.get(id));
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

export const updatePageAnnotation = pageAnnotation => {
  return new Promise((resolve, reject) => {
    if (!pageAnnotation.id) {
      reject(new Error('Page annotation update: Missing id field.'));
    }

    const id = pageAnnotation.id;
    db.get(id)
      .then(doc => {
        // https://pouchdb.com/guides/documents.html#updating-documents%E2%80%93correctly

        doc.selectedText = pageAnnotation.text;
        doc.note = pageAnnotation.note;
        doc.highlightColor = pageAnnotation.highlightColor;
        doc.pageAnnotation = pageAnnotation.tags;
        db.put(doc).then(_ => {
          db.get(id).then(doc => resolve(doc));
        });
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

export const deletePageAnnotation = pageAnnotationId => {
  return new Promise((resolve, reject) => {
    if (!pageAnnotationId || pageAnnotationId < 0) {
      reject(new Error('Page annotation id to delete is not valid'));
    }

    db.get(pageAnnotationId)
      .then(doc => {
        db.remove(doc).then(_ => resolve());
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

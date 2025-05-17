import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import {getCurrentTimestampInMs} from './base.js';
import {monotonicFactory} from "ulid";

// Create a singleton ULID generator
const uuid = monotonicFactory();
PouchDB.plugin(PouchDBFind);
const pouchdb = new PouchDB('shark-eagle-note');
pouchdb.createIndex({
  index: {fields: ['url']},
});

const idPrefix = 'pd';

export const fetchAllMyNotesPouchdb = keyword => {
  return new Promise((resolve, reject) => {
    pouchdb.allDocs({include_docs: true, descending: true})
      .then(doc => {
        resolve(
          doc.rows
            .filter(r => r.id.startsWith(idPrefix))
            .map(r => {
              r.doc.id = r.doc._id;
              return r.doc;
            })
        );
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

export const fetchAllMyAnnotationsByUrlPouchdb = url => {
  return new Promise((resolve, reject) => {
    pouchdb.find({
      selector: {url: url},
      limit: 500,
    })
      .then(result => {
        resolve(
          result.docs.map(d => {
            d.id = d._id;
            return d;
          })
        );
      })
      .catch(function (err) {
        console.error(err);
      });
  });
};

export const savePageAnnotationPouchdb = pageAnnotation => {
  return new Promise((resolve, reject) => {
    const id = idPrefix + '-' + uuid();
    const now = getCurrentTimestampInMs();
    pageAnnotation._id = id;
    pageAnnotation.createdAt = now;
    pageAnnotation.updatedAt = now;

    pouchdb.put(pageAnnotation)
      .then(_ => {
        resolve(pouchdb.get(id));
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

export const updatePageAnnotationPouchdb = pageAnnotation => {
  return new Promise((resolve, reject) => {
    if (!pageAnnotation.id) {
      reject(new Error('Page annotation update: Missing id field.'));
    }

    const id = pageAnnotation.id;
    pouchdb.get(id)
      .then(doc => {
        // https://pouchdb.com/guides/documents.html#updating-documents%E2%80%93correctly
        doc.comment = pageAnnotation.comment;
        doc.highlightColor = pageAnnotation.highlightColor;
        doc.tags = pageAnnotation.tags;
        doc.updatedAt = getCurrentTimestampInMs();
        pouchdb.put(doc).then(_ => {
          pouchdb.get(id).then(doc => resolve(doc));
        });
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

export const deletePageAnnotationPouchdb = pageAnnotationId => {
  return new Promise((resolve, reject) => {
    if (!pageAnnotationId || pageAnnotationId < 0) {
      reject(new Error('Page annotation id to delete is not valid'));
    }

    pouchdb.get(pageAnnotationId)
      .then(doc => {
        pouchdb.remove(doc).then(_ => resolve());
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

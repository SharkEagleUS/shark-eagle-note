import {TableSort} from './TableSort.jsx';
import {Container} from '@mantine/core';
import {useEffect, useState} from 'react';
import {fetchAllMyNotesPouchdb} from '/utils/pouchdb.js';

export function Content() {

  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === SHOW_SIDE_BAR) {
        // setAnnotations(request.data);
        location.reload();
      }
      sendResponse({done: true});
      return true;
    });

    fetchAllMyNotesPouchdb().then(notes => {
      setAnnotations(notes);
    }).catch(e => {
      console.log("error", e)
    });
  }, []);

  return (
    <>
      <Container p='xl' fluid>
        <TableSort rawAnnotations={annotations}/>
      </Container>
    </>
  );
}
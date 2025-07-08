import {TableSort} from './TableSort.jsx';
import {Tags} from './Tags.jsx';
import {Container} from '@mantine/core';
import {useEffect, useState} from 'react';
import {fetchAllMyNotesPouchdb} from '/utils/pouchdb.js';

export function Content({currentView, selectedTag, onTagClick, onClearTag}) {

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

  const renderContent = () => {
    switch (currentView) {
      case 0: // All Notes
        return <TableSort rawAnnotations={annotations} selectedTag={selectedTag} onTagClick={onTagClick} onClearTag={onClearTag} />;
      case 1: // Tags
        return <Tags annotations={annotations} onTagClick={onTagClick} />;
      default:
        return <TableSort rawAnnotations={annotations} selectedTag={selectedTag} onTagClick={onTagClick} onClearTag={onClearTag} />;
    }
  };

  return (
    <>
      <Container p='xl' fluid>
        {renderContent()}
      </Container>
    </>
  );
}

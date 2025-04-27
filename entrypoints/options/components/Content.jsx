import {TableSort} from './TableSort.jsx';
import {Container} from '@mantine/core';
import {useEffect, useState} from 'react';
import {Login} from '../../components/Login.jsx';

export function Content() {

  const [showLogin, setShowLogin] = useState(false);
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === SHOW_SIDE_BAR) {
        setShowLogin(false);
        // setAnnotations(request.data);
        location.reload();
      }
      sendResponse({done: true});
      return true;
    });

    fetchAllMyNotes().then(notes => {
      setAnnotations(notes);
    }).catch(e => {
      setShowLogin(true);
      console.log("error", e)
    });
  }, []);

  return (
    <>
      <Container p='xl' fluid>
        {showLogin ? <Login/> : <TableSort rawAnnotations={annotations}/>}
      </Container>
    </>
  );
}
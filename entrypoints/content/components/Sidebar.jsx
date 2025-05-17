import {useEffect, useState} from "react";
import {Button, Card, CloseButton, Container, Group, Image, Text} from '@mantine/core';
import {IconPlus} from '@tabler/icons-react';
import icon from '/assets/32.png';
import NoAnnotationPlaceholder from './NoAnnotationPlaceholder.jsx';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {AnnotationItem} from './AnnotationItem.jsx';
import AnnotationCard from './AnnotationCard.jsx';
import PageAnnotationCard from './PageAnnotationCard.jsx';

function Sidebar() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPageNoteCard, setShowPageNoteCard] = useState(false);
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("request event", request.action, request.subAction);
      if (request.action === SHOW_SIDE_BAR) {
        setShowSidebar(true);
        request.data.forEach(note => (note.clickCallback = () => {
          console.log(note.id);
        }));
        setAnnotations(request.data);
        highlightAll(request.data);
      } else if (request.action === HIGHLIGHT_ALL) {
        request.data.forEach(note => (note.clickCallback = () => {
          console.log(note.id);
        }));
        setAnnotations(request.data);
        highlightAll(request.data);
      }
      sendResponse({done: true});
      return true;
    });

    return () => {

    };
  }, []);

  const closeSidebar = () => {
    setShowSidebar(false);
    console.log("side bar closed");
  }

  const showNoNotePlaceholder = () => {
    return !annotations || annotations.length === 0;
  }

  const onDelete = (ant) => {
    setAnnotations(annotations.filter(a => a.id !== ant.id));
  }

  const listView = () => {
    console.log("list view");
    return (
      <>
        {showNoNotePlaceholder() ? <NoAnnotationPlaceholder/> : (
          <Container style={{overflowY: "auto"}} pb={5}>
            {annotations.map(ant => (
              <AnnotationItem annotation={ant} onDelete={onDelete} key={ant.id}/>
            ))}
          </Container>
        )
        }
      </>

    );
  }

  return (
    <>
      <ToastContainer theme="colored"/>
      {showSidebar &&
        <Card shadow="sm" className="shark-eagle-note-root-card" w={400} style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}>
          <Card.Section inheritPadding py="xs" style={{
            backgroundColor: "var(--mantine-primary-color-filled)",
          }}>
            <Group justify="space-between" style={{padding: '0 16px'}}>
              <Image src={icon} w={24} alt="logo"/>
              <Text fw={500} c='#FFF'>Shark Eagle Note</Text>
              <CloseButton size={20} position="bottom-end" onClick={closeSidebar}/>
            </Group>
          </Card.Section>

          <div style={{flex: 1, overflowY: 'auto'}}>
            {listView()}
          </div>

          <Card.Section>
            {showPageNoteCard ?
              <PageAnnotationCard showCard={setShowPageNoteCard}/> :
              <Button
                fullWidth
                leftSection={<IconPlus size={16}/>}
                onClick={() => {
                  setShowPageNoteCard(true);
                }}
              >
                Add Page Note
              </Button>}
          </Card.Section>
        </Card>}

      <AnnotationCard/>
    </>
  );
}

export default Sidebar;

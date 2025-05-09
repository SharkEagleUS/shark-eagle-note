import {useEffect, useState} from "react";
import {Card, CloseButton, Container, Group, Image, Text} from '@mantine/core';
import icon from '/assets/32.png';
import NoAnnotationPlaceholder from './NoAnnotationPlaceholder.jsx';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {AnnotationItem} from './AnnotationItem.jsx';
import AnnotationCard from './AnnotationCard.jsx';

function Sidebar() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

  const handleMouseUp = (event) => {
    setPositionX(event.pageX);
    setPositionY(event.pageY);
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("request event", request.action, request.subAction);
      if (request.action === SHOW_SIDE_BAR) {
        setShowSidebar(true);

        setAnnotations(request.data);
        highlightAll(request.data);
      } else if (request.action === HIGHLIGHT_ALL) {
        setAnnotations(request.data);
        // annotations.forEach(note => (note.clickCallback = () => {
        // }));
        highlightAll(request.data);
      }
      sendResponse({done: true});
      return true;
    });

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
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
        <Card shadow="sm" className="shark-eagle-note-root-card" w={400}>
          <Card.Section inheritPadding py="xs" style={{
            backgroundColor: "var(--mantine-primary-color-filled)",
          }}>
            <Group justify="space-between" style={{padding: '0 16px'}}>
              <Image src={icon} w={24} alt="logo"/>
              <Text fw={500} c='#FFF'>Shark Eagle Note</Text>
              <CloseButton size={20} position="bottom-end" onClick={closeSidebar}/>
            </Group>
          </Card.Section>

          {listView()}

        </Card>}

      <AnnotationCard positionX={positionX} positionY={positionY}/>
    </>
  );
}

export default Sidebar;

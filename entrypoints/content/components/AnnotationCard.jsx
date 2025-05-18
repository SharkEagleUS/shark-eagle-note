import {useEffect, useState, useRef} from 'react';
import {Blockquote, Button, Card, CloseButton, ColorPicker, Group, Image, TagsInput, Text, Textarea} from '@mantine/core';
import icon from '/public/icon/32.png';
import Draggable from 'react-draggable';
import {toast} from 'react-toastify';
import {getSelectedText} from '/utils/base.js';

function AnnotationCard() {

  const [showCard, setShowCard] = useState(false);
  const [color, setColor] = useState(defaultColor);
  const [comment, setComment] = useState('');
  const [highlightText, setHighlightText] = useState('');
  const [tags, setTags] = useState([]);
  const myRef = useRef(null);

  const positionXRef = useRef(0);
  const positionYRef = useRef(0);

  const handleMouseUp = (event) => {
    positionXRef.current = event.pageX;
    positionYRef.current = event.pageY;
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("request event 2", request.action, request.subAction);
      if (request.action === RIGHT_CLICK) {
        setShowCard(true);
        setHighlightText(getSelectedText());
      }
      sendResponse({done: true});
      return true;
    });

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);


  const closeCard = () => {
    setShowCard(false);
  }

  const saveNote = () => {
    const pageAnnotation = {
      highlightText: highlightText,
      comment: comment,
      highlightColor: color,
      tags: tags,
    };

    submitPageAnnotationBackground(pageAnnotation)
      .then(() => {
        // cleanup
        setComment('');
        setColor(defaultColor);
        setHighlightText('');
        setTags([]);
        closeCard();
      })
      .catch(err => {
        toast.error("Error when saving: " + err.message);
      });

  }

  return showCard ? (
      <>
        <Draggable nodeRef={myRef} defaultPosition={{x: positionXRef.current, y: positionYRef.current}}>
          <Card ref={myRef} shadow="sm" className="new-card" w={400} pos='absolute'
                style={{
                  boxShadow: '18px 25px 16px 0 rgba(0, 0, 0, 0.49)',
                  zIndex: 2147483637,
                }}>
            <Card.Section inheritPadding py="xs" style={{
              backgroundColor: "var(--mantine-primary-color-filled)",
            }}>
              <Group justify="space-between" style={{padding: '0 16px'}}>
                <Image src={icon} w={24} alt="logo"/>
                <Text fw={500} c='#FFF'>Shark Eagle Note</Text>
                <CloseButton size={20} position="bottom-end" onClick={closeCard}/>
              </Group>
            </Card.Section>
            <Blockquote color={color} mt="md" p='md'>
              {highlightText}
            </Blockquote>
            <ColorPicker format="hex" withPicker={false} value={color} mt="md"
                         onChange={setColor}
                         swatches={colors}/>
            <Textarea
              placeholder="Your Perosnal Note here" mt="md"
              autosize
              minRows={3}
              value={comment}
              onChange={(event) => setComment(event.currentTarget.value)}
            />
            <TagsInput mt="md" placeholder="Enter tag" data={[]} value={tags} onChange={setTags}/>
            <Card.Section inheritPadding my='xs'>
              <Button display={'block'} style={{float: 'right'}} onClick={saveNote}> Save </Button>
            </Card.Section>

          </Card>

        </Draggable>
      </>
    ) :
    null;
}

export default AnnotationCard;

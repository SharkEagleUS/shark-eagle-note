import {useState} from 'react';
import {Button, Card, TagsInput, Textarea, TextInput} from '@mantine/core';
import {toast} from 'react-toastify';
import {useInputState} from '@mantine/hooks';

function PageAnnotationCard({showCard}) {

  const DEFAULT_COLOR = '#fd7e14';
  const [comment, setComment] = useState('');
  const [highlightText, setHighlightText] = useInputState('');
  const [tags, setTags] = useState([]);


  const cleanup = () => {
    setComment('');
    setHighlightText('');
    setTags([]);
  }

  const saveNote = () => {
    const pageAnnotation = {
      highlightText: highlightText,
      comment: comment,
      highlightColor: DEFAULT_COLOR,
      tags: tags,
      isPageOnly: true,
    };

    submitPageAnnotationBackground(pageAnnotation)
      .then(() => {
        cleanup();
        showCard(false);
      })
      .catch(err => {
        toast.error("Error when saving: " + err.message);
      });

  }

  const cancel = () => {
    cleanup();
    showCard(false);
  }

  return (<>
    <Card withBorder radius="md" mt="xs" p="lg">
      <Card.Section p="lg">
        <TextInput value={highlightText} onChange={setHighlightText} placeholder="Title"/>
        <Textarea
          placeholder="Your Perosnal Note here" mt="md"
          autosize
          minRows={3}
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
        />
        <TagsInput mt="md" placeholder="Enter tag" data={[]} value={tags} onChange={setTags}/>
      </Card.Section>
      <Card.Section inheritPadding my='xs'>
        <Button color="yellow" display={'block'} style={{float: 'left'}} onClick={cancel}> Cancel </Button>
        <Button display={'block'} style={{float: 'right'}} onClick={saveNote}> Submit </Button>
      </Card.Section>

    </Card>

  </>);
}

export default PageAnnotationCard;

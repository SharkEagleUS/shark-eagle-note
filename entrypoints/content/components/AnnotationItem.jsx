import {ActionIcon, Badge, Blockquote, Button, Card, ColorPicker, Container, Group, TagsInput, Text, Textarea} from '@mantine/core';
import {IconPencilBolt, IconTrashX} from '@tabler/icons-react';
import {useState} from 'react';
import {toast} from 'react-toastify';

export function AnnotationItem({annotation, onDelete}) {
  const [inEdit, setInEdit] = useState(false);
  const [color, setColor] = useState('#fd7e14');
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState([]);

  const deleteAnnotation = (ant) => {
    if (confirm('Sure to delete this annotation?')) {
      deletePageAnnotationBackground(ant.id).then(() => {
        toast.success('Page annotation is deleted');
        onDelete(ant)
      });
    }
  }
  const updateAnnotation = (ant) => {
    ant.highlightColor = color;
    ant.comment = comment;
    ant.tags = tags;
    updatePageAnnotationBackground(ant).then(() => {
      cancelEdit();
    });
  }

  const enterEdit = (ant) => {
    setColor(ant.highlightColor);
    setComment(ant.comment);
    setTags(ant.tags);
    setInEdit(true);
  }

  const cancelEdit = () => {
    setInEdit(false);
  }

  const navigateToAnnotation = (ant) => {
    const el = document.getElementById(ant.id);
    if (el) {
      el.scrollIntoView();
    }
  }

  const displayAnnotation = (ant) => {
    return (<Card withBorder radius="md" mt="xs" p="md">
      <Card.Section p="md" onClick={() => navigateToAnnotation(ant)}>
        <Blockquote color={ant.highlightColor} p='xs'>
          {ant.highlightText}
        </Blockquote>
      </Card.Section>

      <Card.Section px="md">
        <Container style={{
          border: '1px solid var(--mantine-color-gray-3)',
          borderRadius: '5px',
        }}>{mdRender(ant.comment)}</Container>
        <Group gap={7} mt="md">
          {
            ant.tags.map((tag) => (
              <Badge color="blue" radius="sm" key={tag}>{tag}</Badge>
            ))
          }

        </Group>
      </Card.Section>

      <Group mt="xs">
        <Text>{readableTimestamp(ant.createdAt)}</Text>
        <Group justify="flex-end" spacing={0} ml="auto">
          <ActionIcon variant="transparent" color="red" size={24} title='Delete Current Annotation'
                      onClick={() => deleteAnnotation(ant)}>
            <IconTrashX/>
          </ActionIcon>
          <ActionIcon variant="transparent" color="blue" size={24} title='Update Current Annotation'
                      onClick={() => enterEdit(ant)}>
            <IconPencilBolt/>
          </ActionIcon>
        </Group>
      </Group>
    </Card>);
  }

  const editAnnotation = (ant) => {
    return (
      <Card withBorder radius="md" mt="xs" p="md">
        <Blockquote color={color} p="xs">
          {ant.highlightText}
        </Blockquote>
        <ColorPicker format="hex" withPicker={false} value={color} mt="md"
                     onChange={setColor}
                     swatches={['#fa5252', '#be4bdb', '#228be6', '#40c057', '#fab005', '#fd7e14']}/>
        <Textarea
          placeholder="Your Perosnal Note here" mt="md"
          autosize
          minRows={3}
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
        />
        <TagsInput mt="md" placeholder="Enter tag" data={[]} value={tags} onChange={setTags}/>
        <Card.Section inheritPadding my='xs'>
          <Button display={'block'} style={{float: 'right'}}
                  onClick={() => updateAnnotation(ant)}> Save </Button>
          <Button display={'block'} color='yellow' style={{float: 'right'}} mx='xs'
                  onClick={cancelEdit}> Cancel </Button>
        </Card.Section>

      </Card>);
  }
  return (
    <>
      {inEdit ? editAnnotation(annotation) : displayAnnotation(annotation)}
    </>
  );
}
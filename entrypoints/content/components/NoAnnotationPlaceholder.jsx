import {Card, Container, Image, Paper, Text} from '@mantine/core';
import notFoundImage from '/public/icon/notfound.png';
import {useState} from 'react';

function NoAnnotationPlaceholder() {
  const [count, setCount] = useState(0);
  return (

    <Container w={380}>
      <Paper withBorder shadow="md" mt={30} radius="md">
        <Card>
          <Image src={notFoundImage} alt="No Note Found"/>
          <Text c='blue' mt={5} ta='center'>
            You do not have any annotation for this page! ;-)
          </Text>
        </Card>
      </Paper>
    </Container>
  );
}

export default NoAnnotationPlaceholder;
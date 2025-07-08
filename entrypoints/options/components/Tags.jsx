import {useEffect, useState} from 'react';
import {Badge, Container, Group, Text, Title} from '@mantine/core';

export function Tags({annotations, onTagClick}) {
  const [tagCounts, setTagCounts] = useState({});

  useEffect(() => {
    // Calculate tag counts
    const counts = {};
    annotations.forEach(annotation => {
      if (annotation.tags && Array.isArray(annotation.tags)) {
        annotation.tags.forEach(tag => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      }
    });
    setTagCounts(counts);
  }, [annotations]);

  // Get font size based on note count
  const getFontSize = (count) => {
    const maxCount = Math.max(...Object.values(tagCounts));
    const minCount = Math.min(...Object.values(tagCounts));
    
    if (maxCount === minCount) return 16; // Default size if all counts are the same
    
    // Scale font size between 12px and 32px based on count
    const minSize = 12;
    const maxSize = 32;
    const ratio = (count - minCount) / (maxCount - minCount);
    return Math.round(minSize + ratio * (maxSize - minSize));
  };

  const handleTagClick = (tag) => {
    onTagClick(tag);
  };

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  return (
    <Container p='xl' fluid>
      <Title order={2} mb="lg">All Tags</Title>
      
      {sortedTags.length === 0 ? (
        <Text c="dimmed">No tags found</Text>
      ) : (
        <Group gap="md">
          {sortedTags.map(([tag, count]) => (
            <Badge
              key={tag}
              variant="light"
              size="lg"
              style={{
                fontSize: `${getFontSize(count)}px`,
                cursor: 'pointer',
                padding: '8px 12px',
                height: 'auto',
                lineHeight: '1.2'
              }}
              onClick={() => handleTagClick(tag)}
            >
              {tag} ({count})
            </Badge>
          ))}
        </Group>
      )}
    </Container>
  );
}
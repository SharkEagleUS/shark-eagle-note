import {useEffect, useState} from 'react';
import {IconChevronDown, IconChevronUp, IconSearch, IconSelector} from '@tabler/icons-react';
import {Anchor, Badge, Blockquote, Button, Center, Container, Group, Modal, Pagination, Select, Table, Text, TextInput, UnstyledButton,} from '@mantine/core';
import classes from './TableSort.module.css';
import {toast} from 'react-toastify';
import {deletePageAnnotationBackground} from '/utils/pageAnnotation.js';
import {formatDate} from '/utils/base.js';

const searchableKeys = ['highlightText', 'comment'];

function Th({children, reversed, sorted, onSort, width}) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th className={classes.th} w={width}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={16} stroke={1.5}/>
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

function filterData(data, search, selectedTag = null) {
  const query = search.toLowerCase().trim();
  return data.filter((item) => {
    // Filter by search query if there is one
    const matchesSearch = query === '' || searchableKeys.some((key) => item[key] && item[key].toLowerCase().includes(query));

    // Filter by selected tag if one is selected
    const matchesTag = selectedTag 
      ? item.tags && item.tags.includes(selectedTag)
      : true;

    return matchesSearch && matchesTag;
  });
}

const columnCompare = (a, b) => {
  if (typeof a === 'number') {
    return a - b;
  }
  if (typeof a === 'string') {
    return a.localeCompare(b);
  }
  return String(a).localeCompare(String(b));
}

function sortData(
  data,
  payload
) {
  const {sortBy, selectedTag} = payload;

  if (!sortBy) {
    return filterData(data, payload.search, selectedTag);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return columnCompare(b[sortBy], a[sortBy])
      }

      return columnCompare(a[sortBy], b[sortBy]);
    }),
    payload.search,
    selectedTag
  );
}

export function TableSort({rawAnnotations, selectedTag = null, onTagClick, onClearTag}) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [displayAnnotations, setDisplayAnnotations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('100');
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);

  useEffect(() => {
    // Apply filters (search and tag)
    const filteredData = sortData(rawAnnotations, {
      sortBy,
      reversed: reverseSortDirection,
      search,
      selectedTag
    });

    setDisplayAnnotations(filteredData);
    setCurrentPage(1); // Reset to first page when data changes

    // Calculate total pages based on page size
    if (pageSize === 'all') {
      setTotalPages(1);
    } else {
      setTotalPages(Math.max(1, Math.ceil(filteredData.length / Number(pageSize))));
    }
  }, [rawAnnotations, pageSize, selectedTag, search, sortBy, reverseSortDirection]);


  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    const sortedData = sortData(displayAnnotations, {sortBy: field, reversed, search, selectedTag});
    setDisplayAnnotations(sortedData);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleSearchChange = (event) => {
    const {value} = event.currentTarget;
    setSearch(value);
    const searchedData = sortData(rawAnnotations, {sortBy, reversed: reverseSortDirection, search: value, selectedTag});
    setDisplayAnnotations(searchedData);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleTagClick = (tag, event) => {
    event.stopPropagation(); // Prevent row click event
    // Call the onTagClick callback to filter notes by the clicked tag
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  const deleteById = (id) => {
    if (confirm('Are you sure to delete this?')) {
      deletePageAnnotationBackground(id)
        .then(res => {
          const updatedAnnotations = displayAnnotations.filter((annotation) => annotation.id !== id);
          setDisplayAnnotations(updatedAnnotations);

          // Handle pagination after deletion
          if (pageSize !== 'all') {
            const newTotalPages = Math.max(1, Math.ceil(updatedAnnotations.length / Number(pageSize)));
            setTotalPages(newTotalPages);

            // If current page is now empty and not the first page, go to previous page
            if (currentPage > newTotalPages) {
              setCurrentPage(newTotalPages);
            }
          }
        })
        .catch(err => {
          console.log(err.message);
          toast.error("Error when deleting, please try again later");
        });
    }
  }

  // Get current page data
  const getPaginatedData = () => {
    if (pageSize === 'all') return displayAnnotations;

    const startIndex = (currentPage - 1) * Number(pageSize);
    const endIndex = startIndex + Number(pageSize);
    return displayAnnotations.slice(startIndex, endIndex);
  };

  const handleRowClick = (annotation) => {
    setSelectedAnnotation(annotation);
    setModalOpened(true);
  };

  const rows = getPaginatedData().map((row) => (
    <Table.Tr 
      key={row.id} 
      style={{ cursor: 'pointer' }}
      onClick={() => handleRowClick(row)}
    >
      <Table.Td>
        <Anchor href={row.url} target="_blank" onClick={(e) => e.stopPropagation()} style={{ wordBreak: 'break-all' }}> {row.url} </Anchor>
      </Table.Td>
      <Table.Td p={0}>
        <Blockquote color={row.highlightColor} p='xs' m={0}>
          {row.highlightText}
        </Blockquote>
      </Table.Td>
      <Table.Td>{row.comment}</Table.Td>
      <Table.Td>
        <Group gap={7} mt={5}>
          {
            row.tags && row.tags.map((tag) => (
              <Badge 
                color={selectedTag === tag ? "green" : "blue"} 
                radius="sm" 
                key={tag}
                style={{ cursor: 'pointer' }}
                onClick={(e) => handleTagClick(tag, e)}
              >
                {tag}
              </Badge>
            ))
          }
        </Group>
      </Table.Td>
      <Table.Td>{formatDate(row.createdAt)}</Table.Td>
      <Table.Td><Button color='red' onClick={(e) => { e.stopPropagation(); deleteById(row.id); }}>Delete</Button></Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={<Text fw={700} size="xl">Annotation Details</Text>}
        size="lg"
        radius="md"
        padding="xl"
        overlayProps={{
          blur: 3,
          opacity: 0.55,
        }}
      >
        {selectedAnnotation && (
          <div style={{ padding: '10px' }}>
            <Text fw={700} size="lg" mb="xs" c="blue.7">URL</Text>
            <Anchor 
              href={selectedAnnotation.url} 
              target="_blank" 
              mb="md" 
              display="block" 
              style={{ 
                wordBreak: 'break-all', 
                padding: '10px',
                backgroundColor: 'var(--mantine-color-gray-0)',
                borderRadius: 'var(--mantine-radius-sm)',
                border: '1px solid var(--mantine-color-gray-3)'
              }}
            >
              {selectedAnnotation.url}
            </Anchor>

            <Text fw={700} size="lg" mb="xs" mt="lg" c="blue.7">Highlight Text</Text>
            <Blockquote 
              color={selectedAnnotation.highlightColor} 
              p="md" 
              mb="md"
              style={{
                borderRadius: 'var(--mantine-radius-sm)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              {selectedAnnotation.highlightText}
            </Blockquote>

            <Text fw={700} size="lg" mb="xs" c="blue.7">Your Note</Text>
            <Text 
              mb="md" 
              style={{ 
                padding: '10px',
                backgroundColor: 'var(--mantine-color-gray-0)',
                borderRadius: 'var(--mantine-radius-sm)',
                border: '1px solid var(--mantine-color-gray-3)'
              }}
            >
              {mdRender(selectedAnnotation.comment || "No comment")}
            </Text>

            <Text fw={700} size="lg" mb="xs" c="blue.7">Tags</Text>
            <Group mb="md" style={{ 
              padding: selectedAnnotation.tags && selectedAnnotation.tags.length > 0 ? '10px' : '0',
              backgroundColor: selectedAnnotation.tags && selectedAnnotation.tags.length > 0 ? 'var(--mantine-color-gray-0)' : 'transparent',
              borderRadius: 'var(--mantine-radius-sm)',
              border: selectedAnnotation.tags && selectedAnnotation.tags.length > 0 ? '1px solid var(--mantine-color-gray-3)' : 'none'
            }}>
              {selectedAnnotation.tags && selectedAnnotation.tags.length > 0 ? (
                selectedAnnotation.tags.map((tag) => (
                  <Badge 
                    color={selectedTag === tag ? "green" : "blue"} 
                    radius="md" 
                    key={tag} 
                    size="lg"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      handleTagClick(tag, e);
                      setModalOpened(false); // Close modal after selecting a tag
                    }}
                  >
                    {tag}
                  </Badge>
                ))
              ) : (
                <Text c="dimmed">No tags</Text>
              )}
            </Group>

            <Text fw={700} size="lg" mb="xs" c="blue.7">Created At</Text>
            <Text 
              mb="md" 
              style={{ 
                padding: '10px',
                backgroundColor: 'var(--mantine-color-gray-0)',
                borderRadius: 'var(--mantine-radius-sm)',
                border: '1px solid var(--mantine-color-gray-3)'
              }}
            >
              {formatDate(selectedAnnotation.createdAt)}
            </Text>

            <Group justify="flex-end" mt="xl">
              <Button 
                color="red" 
                onClick={() => { deleteById(selectedAnnotation.id); setModalOpened(false); }}
                radius="md"
              >
                Delete
              </Button>
              <Button 
                onClick={() => setModalOpened(false)}
                variant="outline"
                radius="md"
              >
                Close
              </Button>
            </Group>
          </div>
        )}
      </Modal>

      <TextInput
        placeholder="Search by any field"
        mb="md"
        leftSection={<IconSearch size={18} stroke={1.5}/>}
        value={search}
        onChange={handleSearchChange}
        size="md"
        radius="md"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      />

      {selectedTag && (
        <Group mb="xl">
          <Text fw={500}>Filtered by tag:</Text>
          <Badge 
            color="green" 
            radius="md" 
            size="lg"
            style={{ cursor: 'pointer' }}
            onClick={() => onClearTag && onClearTag()}
          >
            {selectedTag} ×
          </Badge>
          <Text size="sm" c="dimmed">(Click to clear filter)</Text>
        </Group>
      )}
      <Container fluid p={0} style={{
        display: 'flex',
        flexDirection: 'column',
      }}>

        <Table 
          miw={700} 
          layout="fixed" 
          striped 
          highlightOnHover 
          withTableBorder 
          withColumnBorders
        >
          <Table.Tbody>
            <Table.Tr bg="var(--mantine-color-blue-2)">
              <Th
                width={300}
                sorted={sortBy === 'url'}
                reversed={reverseSortDirection}
                onSort={() => setSorting('url')}
              >
                <Text fw={700}>URL</Text>
              </Th>
              <Th
                width='25%'
                sorted={sortBy === 'highlightText'}
                reversed={reverseSortDirection}
                onSort={() => setSorting('highlightText')}
              >
                <Text fw={700}>Highlight Text</Text>
              </Th>
              <Th
                sorted={sortBy === 'comment'}
                reversed={reverseSortDirection}
                onSort={() => setSorting('comment')}
              >
                <Text fw={700}>Your Note</Text>
              </Th>
              <Table.Th className={classes.th} w={250}>
                <Text fw={700}>Tags</Text>
              </Table.Th>
              <Th
                width={180}
                sorted={sortBy === 'createdAt'}
                reversed={reverseSortDirection}
                onSort={() => setSorting('createdAt')}
              >
                <Text fw={700}>Created At</Text>
              </Th>
              <Table.Th className={classes.th} w={120}>
                <Text fw={700}>Actions</Text>
              </Table.Th>
            </Table.Tr>
          </Table.Tbody>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text fw={500} ta="center" p="xl">
                    Nothing found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Container>

      <Group justify="space-between" mt="xl" mb="md">
        <Select
          label={<Text fw={500}>Page Size</Text>}
          value={String(pageSize)}
          onChange={(value) => setPageSize(value)}
          data={[
            { value: '25', label: '25' },
            { value: '50', label: '50' },
            { value: '100', label: '100' },
            { value: '500', label: '500' },
            { value: 'all', label: 'All' }
          ]}
          w={100}
          size="md"
          radius="md"
          style={{
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}
        />
        <Group>
          <Text fz="sm" c="dimmed">Total: {displayAnnotations.length} rows</Text>
          {pageSize !== 'all' && (
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={setCurrentPage}
              radius="md"
              size="md"
              withEdges
            />
          )}
        </Group>
      </Group>
    </>
  );
}

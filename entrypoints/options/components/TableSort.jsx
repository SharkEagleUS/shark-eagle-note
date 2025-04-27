import {useEffect, useState} from 'react';
import {IconChevronDown, IconChevronUp, IconSearch, IconSelector} from '@tabler/icons-react';
import {
  Anchor,
  Badge,
  Blockquote,
  Button,
  Center,
  Container,
  Group,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import classes from './TableSort.module.css';
import {toast} from 'react-toastify';

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

function filterData(data, search) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    searchableKeys.some((key) => item[key].toLowerCase().includes(query))
  );
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
  const {sortBy} = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return columnCompare(b[sortBy], a[sortBy])
      }

      return columnCompare(a[sortBy], b[sortBy]);
    }),
    payload.search
  );
}

export function TableSort({rawAnnotations}) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [displayAnnotations, setDisplayAnnotations] = useState([]);

  useEffect(() => {
    setDisplayAnnotations(rawAnnotations);
  }, [rawAnnotations]);


  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setDisplayAnnotations(sortData(displayAnnotations, {sortBy: field, reversed, search}));
  };

  const handleSearchChange = (event) => {
    const {value} = event.currentTarget;
    setSearch(value);
    setDisplayAnnotations(sortData(rawAnnotations, {sortBy, reversed: reverseSortDirection, search: value}));
  };

  const deleteById = (id) => {

    if (confirm('Are you sure to delete this?')) {
      deletePageAnnotationBackground(id)
        .then(res => {
          setDisplayAnnotations(
            displayAnnotations.filter((annotation) => annotation.id !== id)
          )
        })
        .catch(err => {
          console.log(err.message);
          toast.error("Error when deleting, please try again later");
        });
    }
  }

  const rows = displayAnnotations.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td>
        <Anchor href={row.url} target="_blank"> {getUrlHostname(row.url)} </Anchor>
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
              <Badge color="blue" radius="sm" key={tag}>{tag}</Badge>
            ))
          }
        </Group>
      </Table.Td>
      <Table.Td>{formatDate(row.createdAt)}</Table.Td>
      <Table.Td><Button color='red' onClick={() => deleteById(row.id)}>Delete</Button></Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <TextInput
        placeholder="Search by any field"
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5}/>}
        value={search}
        onChange={handleSearchChange}
      />
      <Container fluid p={0} style={{
        display: 'flex',
        flexDirection: 'column',
        height: '85vh',
        overflowY: 'auto',
      }}>

        <Table miw={700} layout="fixed" striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Tbody>
            <Table.Tr bg="var(--mantine-color-blue-1)">
              <Th
                width={250}
                sorted={sortBy === 'url'}
                reversed={reverseSortDirection}
                onSort={() => setSorting('url')}
              >
                Url
              </Th>
              <Th
                width='25%'
                sorted={sortBy === 'highlightText'}
                reversed={reverseSortDirection}
                onSort={() => setSorting('highlightText')}
              >
                Highlight Text
              </Th>
              <Th
                sorted={sortBy === 'comment'}
                reversed={reverseSortDirection}
                onSort={() => setSorting('comment')}
              >
                Your Note
              </Th>
              <Table.Th className={classes.th} w={250}> Tags</Table.Th>
              <Th
                width={150}
                sorted={sortBy === ' createdAt'}
                reversed={reverseSortDirection}
                onSort={() => setSorting('createdAt')}
              >
                Created At
              </Th>
              <Table.Th className={classes.th} w={120}></Table.Th>
            </Table.Tr>
          </Table.Tbody>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text fw={500} ta="center">
                    Nothing found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Container>

      {/*<Pagination total={10} mt='md' pos='fixed' right={80}/>*/}
    </>
  );
}
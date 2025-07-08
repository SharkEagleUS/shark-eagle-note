import React, {useState} from "react";
import ReactDOM from "react-dom/client";
import {Container, MantineProvider} from "@mantine/core";
// Remember to import Mantine's styles
import "@mantine/core/styles.css";
import {Nav} from './components/Nav.jsx';
import {Content} from './components/Content.jsx';
import {ToastContainer} from 'react-toastify';

function App() {
  const [currentView, setCurrentView] = useState(0);
  const [selectedTag, setSelectedTag] = useState(null);

  const handleViewChange = (viewIndex) => {
    setCurrentView(viewIndex);
    // Clear selected tag when switching views manually
    if (viewIndex !== 0) {
      setSelectedTag(null);
    }
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setCurrentView(0); // Switch to All Notes view
  };

  return (
    <Container fluid p={0} display="flex">
      <ToastContainer theme="colored"/>
      <Nav onViewChange={handleViewChange} currentView={currentView}/>
      <Content currentView={currentView} selectedTag={selectedTag} onTagClick={handleTagClick}/>
    </Container>
  );
}

// Nothing special here
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider>
      <App/>
    </MantineProvider>
  </React.StrictMode>,
);

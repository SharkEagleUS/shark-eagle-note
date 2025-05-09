import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

export const removeScriptTags = text => {
  while (SCRIPT_REGEX.test(text)) {
    text = text.replace(SCRIPT_REGEX, '');
  }
  return text;
};

export const addZero = value => ('0' + value).slice(-2);

export const formatDate = value => {
  if (value) {
    const dt = new Date(value);
    return `${dt.getFullYear()}/${addZero(dt.getMonth() + 1)}/${addZero(dt.getDate())} ${addZero(dt.getHours())}:${addZero(dt.getMinutes())}:${addZero(dt.getSeconds())}`;
  }
  return '';
};

export const isBlank = str => {
  return !str || !str.trim();
};

export const readableTimestamp = ts => dayjs(ts).fromNow();

export const getCurrentTimestampInMs = () => {
  return new Date().getTime();
};

export const getSelectedText = () => {
  let selectedText = '';

  // For the main window
  if (window.getSelection) {
    selectedText = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    selectedText = document.selection.createRange().text;
  }

  // If no text is selected in the main window, check iframes
  if (!selectedText) {
    let iframes = document.getElementsByTagName('iframe');
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i];
      try {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDocument.getSelection) {
          selectedText = iframeDocument.getSelection().toString();
        } else if (iframeDocument.selection && iframeDocument.selection.type != "Control") {
          selectedText = iframeDocument.selection.createRange().text;
        }
        if (selectedText) break;  // Exit loop if text is found
      } catch (e) {
        // Handle potential cross-origin issues
        console.error("Cannot access iframe content due to same-origin policy");
      }
    }
  }

  return selectedText;
};

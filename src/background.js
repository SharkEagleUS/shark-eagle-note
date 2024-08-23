import * as types from './utils/action-types';
import * as DB from './utils/db';
import { getSanitizedUrl } from './utils/urls';
import { removeScriptTags } from './utils/base';
import { defaultColor } from './utils/color';

const getNotes = (tab, actionType, iconClick = false) => {
  const url = getSanitizedUrl(tab.url);
  DB.fetchAllMyAnnotationsByUrl(url)
    .then(notes => {
      chrome.tabs.sendMessage(tab.id, { action: actionType, iconClick: iconClick, data: notes }, response => {
        console.log(response);
      });
    })
    .catch(err => {
      console.error(err);
    });
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: 'Annotate in MetaNote',
    id: types.SALTYNOTE_RIGHT_CLICK_MENU_ID,
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    title: 'Toggle Global Search',
    id: types.TOGGLE_GLOBAL_SEARCH,
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === types.SALTYNOTE_RIGHT_CLICK_MENU_ID) {
    console.log('right click triggered');

    chrome.tabs.sendMessage(tab.id, { action: types.RIGHT_CLICK }, response => {
      console.log(response);
    });
  } else if (info.menuItemId === types.TOGGLE_GLOBAL_SEARCH) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: types.CMD_GLOBAL_SEARCH }, response => {
        console.log(response);
      });
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.toLowerCase().startsWith('http')) {
    getNotes(tab, types.HIGHLIGHT_ALL);
  }
});

chrome.action.onClicked.addListener(tab => {
  getNotes(tab, types.SHOW_SIDE_BAR, true);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === types.ADD_NOTE) {
    const pa = request.pageAnnotation;
    const pageAnnotation = {
      selectedText: pa.text,
      note: removeScriptTags(pa.note),
      highlightColor: pa.highlightColor || defaultColor,
      isPageOnly: pa.isPageOnly || false,
      tags: pa.tags || [],
      url: getSanitizedUrl(sender.tab.url),
    };
    DB.savePageAnnotation(pageAnnotation)
      .then(res => {
        console.log('save new page annotation successfully!');
        getNotes(sender.tab, types.SHOW_SIDE_BAR);
        sendResponse({ done: true });
      })
      .catch(err => {
        console.error(err);
        sendResponse({ done: false, message: err });
      });
  }

  if (request.action === types.UPDATE_NOTE) {
    const pa = request.pageAnnotation;
    const pageAnnotation = {
      id: pa.id,
      selectedText: pa.text,
      note: removeScriptTags(pa.note),
      highlightColor: pa.highlightColor || defaultColor,
      tags: pa.tags || [],
    };
    DB.updatePageAnnotation(pageAnnotation)
      .then(res => {
        console.log('Page annotation is updated successfully!');
        sendResponse({ done: true });
      })
      .catch(err => {
        console.error(err);
        sendResponse({ done: false, message: err });
      });
  }

  if (request.action === types.DELETE_NOTE) {
    DB.deletePageAnnotation(request.id)
      .then(res => {
        console.log('Page annotation is deleted successfully!');
        sendResponse({ done: true });
      })
      .catch(err => {
        console.error(err);
        sendResponse({ done: false, message: err });
      });
  }

  if (request.action === types.LOGOUT) {
    chrome.storage.local.clear(() => {
      sendResponse({ done: true });
    });
  }

  if (request.action === types.SEARCH) {
    DB.fetchAllMyNotes(request.keyword)
      .then(notes => {
        sendResponse(notes);
      })
      .catch(e => {
        console.error(e);
        sendResponse({ done: false, message: e });
      });
  }

  return true;
});

chrome.commands.onCommand.addListener(command => {
  if (command === types.CMD_HIGHLIGHT_TOGGLE) {
    console.log(types.CMD_HIGHLIGHT_TOGGLE);
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: types.CMD_HIGHLIGHT_TOGGLE }, response => {
        console.log(response);
      });
    });
  } else if (command === types.CMD_OPEN_OPTIONS_PAGE) {
    chrome.runtime.openOptionsPage(() => console.log('Options page is opened'));
  } else if (command === types.CMD_GLOBAL_SEARCH) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: types.CMD_GLOBAL_SEARCH }, response => {
        console.log(response);
      });
    });
  }
});

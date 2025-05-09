import * as pouchdb from '/utils/pouchdb.js';

export default defineBackground(() => {

  const getNotes = (tab, actionType, iconClick = false) => {
    const url = getSanitizedUrl(tab.url);
    pouchdb.fetchAllMyAnnotationsByUrlPouchdb(url)
      .then(notes => {
        console.log(JSON.stringify(notes));
        browser.tabs.sendMessage(tab.id, {action: actionType, iconClick: iconClick, data: notes}, response => {
          console.log(JSON.stringify(response));
        });
      })
      .catch(err => {
        console.error(err);
      });
  };

  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      title: 'Annotate in Shark Eagle Note',
      id: SHARK_EAGLE_NOTE_RIGHT_CLICK_MENU_ID,
      contexts: ['selection'],
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === SHARK_EAGLE_NOTE_RIGHT_CLICK_MENU_ID) {
      console.log('right click triggered');

      browser.tabs.sendMessage(tab.id, {action: RIGHT_CLICK}).then(response => {
        console.log(JSON.stringify(response));
      });
    } else if (info.menuItemId === TOGGLE_GLOBAL_SEARCH) {
      browser.tabs.query({active: true, currentWindow: true}, tabs => {
        browser.tabs.sendMessage(tabs[0].id, {action: CMD_GLOBAL_SEARCH}, response => {
          console.log(JSON.stringify(response));
        });
      });
    }
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.toLowerCase().startsWith('http')) {
      getNotes(tab, HIGHLIGHT_ALL);
    }
  });

  browser.action.onClicked.addListener(tab => {
    getNotes(tab, SHOW_SIDE_BAR, true);
  });

  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === ADD_NOTE) {
      const pa = request.pageAnnotation;
      const pageAnnotation = {
        highlightText: pa.highlightText,
        comment: removeScriptTags(pa.comment),
        highlightColor: pa.highlightColor || defaultColor,
        isPageOnly: pa.isPageOnly || false,
        tags: pa.tags || [],
        url: getSanitizedUrl(sender.tab.url),
      };
      pouchdb.savePageAnnotationPouchdb(pageAnnotation)
        .then(res => {
          console.log('save new page annotation successfully!');
          getNotes(sender.tab, SHOW_SIDE_BAR);
          sendResponse({done: true});
        })
        .catch(err => {
          console.error(err);
          sendResponse({done: false, message: err});
        });
    }

    if (request.action === UPDATE_NOTE) {
      const pa = request.pageAnnotation;
      const pageAnnotation = {
        id: pa.id,
        comment: removeScriptTags(pa.comment),
        highlightColor: pa.highlightColor || defaultColor,
        tags: pa.tags || [],
      };
      pouchdb.updatePageAnnotationPouchdb(pageAnnotation)
        .then(res => {
          console.log('Page annotation is updated successfully!');
          sendResponse({done: true});
        })
        .catch(err => {
          console.error(err);
          sendResponse({done: false, message: err});
        });
    }

    if (request.action === DELETE_NOTE) {
      pouchdb.deletePageAnnotationPouchdb(request.id)
        .then(res => {
          console.log('Page annotation is deleted successfully!');
          sendResponse({done: true});
        })
        .catch(err => {
          console.error(err);
          sendResponse({done: false, message: err});
        });
    }

    if (request.action === LOGOUT) {
      browser.storage.local.clear(() => {
        sendResponse({done: true});
      });
    }

    if (request.action === SEARCH) {
      pouchdb.fetchAllMyNotesPouchdb(request.keyword)
        .then(notes => {
          sendResponse(notes);
        })
        .catch(e => {
          console.error(e);
          sendResponse({done: false, message: e});
        });
    }

    return true;
  });

});

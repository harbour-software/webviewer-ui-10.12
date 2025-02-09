import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import selectors from 'selectors';
import core from 'core';
import { useTranslation } from 'react-i18next';
import FileListPanel from './FileListPanel';
import FileInputPanel from './FileInputPanel';
import FilePickerPanel from './FilePickerPanel';
import { Tabs, Tab, TabPanel } from 'components/Tabs';
import Button from 'components/Button';
import FileSelectedPanel from './FileSelectedPanel';
import { exitPageReplacementWarning } from 'helpers/pageManipulationFunctions';
import { useDispatch, useSelector } from 'react-redux';
import ModalWrapper from '../ModalWrapper';
import getRootNode, { getInstanceNode } from 'helpers/getRootNode';

import './PageReplacementModal.scss';

const isValidUrlRegex = new RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/, 'm');
const options = { loadAsPDF: true, l: window.sampleL /* license key here */ };

const PageReplacementModal = ({
  closeModal,
  selectableFiles,
  isOpen,
  selectedThumbnailPageIndexes,
  selectedTab,
}) => {
  const [t] = useTranslation();
  const [source, setSource] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [selectedTabInternal, setSelectedTabInternal] = useState(null);

  const fileInputId = 'pageReplacementFileInputId';

  const dispatch = useDispatch();
  const customizableUI = useSelector((state) => selectors.getFeatureFlags(state)?.customizableUI);

  useEffect(() => {
    if (isOpen && selectedTabInternal !== selectedTab) {
      setSelectedTabInternal(selectedTab);
    }
  }, [isOpen, selectedTabInternal, selectedTab]);

  const closeThisModal = () => {
    setSelectedDoc(null);
    setIsFileSelected(false);
    const el = getRootNode().querySelector(`#${fileInputId}`);
    if (el) {
      el.value = null;
    }
    closeModal();
    setSelectedTabInternal(null);
    setSource({});
  };

  const closeModalWarning = () => exitPageReplacementWarning(closeThisModal, dispatch);

  const modalClass = classNames({
    Modal: true,
    PageReplacementModal: true,
    open: isOpen,
    closed: !isOpen,
    'modular-ui': customizableUI,
  });

  const srcString = source[selectedTabInternal];
  const handleSelection = async () => {
    setIsFileSelected(true);
    let document;
    if (srcString && selectedTabInternal === 'customFileListPanelButton') {
      if (srcString.onSelect) {
        document = await srcString.onSelect();
        setSelectedDoc(document);
      }
    } else if (srcString) {
      document = await core.createDocument(srcString, options);
      setSelectedDoc(document);
    }
  };

  // File picker can merge docs, in which case the callback gets
  // executed with a Document not a file
  const fileProcessedHandler = async (file) => {
    let document;
    // eslint-disable-next-line no-undef
    if (file instanceof getInstanceNode().instance.Core.Document) {
      document = file;
    } else {
      document = await core.createDocument(file, options);
    }
    setSelectedDoc(document);
    setIsFileSelected(true);
  };

  let isSelectBtnDisabled = srcString === undefined;

  if (selectedTabInternal === 'urlInputPanelButton' && !isValidUrlRegex.test(srcString)) {
    isSelectBtnDisabled = true;
  }

  const clearDocument = () => {
    setSelectedDoc(null);
    setIsFileSelected(false);
  };

  const renderFileSelectedPanel = () => {
    return (
      <FileSelectedPanel
        closeThisModal={closeThisModal}
        clearLoadedFile={clearDocument}
        pageIndicesToReplace={selectedThumbnailPageIndexes}
        sourceDocument={selectedDoc}
        closeModalWarning={closeModalWarning}
      />
    );
  };

  const renderSelectionTabs = () => {
    const isFilePanelEnabled = selectableFiles && selectableFiles.length > 0;

    return (
      <div className="container tabs" onMouseDown={(e) => e.stopPropagation()}>
        <ModalWrapper
          isOpen={isOpen}
          title={t('component.pageReplaceModalTitle')}
          closeButtonDataElement={'pageReplacementModalClose'}
          onCloseClick={closeThisModal}
          swipeToClose
          closeHandler={closeThisModal}
        >
          <div className="swipe-indicator" />
          <Tabs className="page-replacement-tabs" id="pageReplacementModal">
            <div className="tabs-header-container">
              <div className="tab-list">
                {isFilePanelEnabled &&
                  <>
                    <Tab dataElement="customFileListPanelButton">
                      <button className="tab-options-button">
                        {t('option.pageReplacementModal.yourFiles')}
                      </button>
                    </Tab>
                    <div className="tab-options-divider" />
                  </>
                }
                <Tab dataElement="urlInputPanelButton">
                  <button className="tab-options-button">
                    {t('link.url')}
                  </button>
                </Tab>
                <div className="tab-options-divider" />
                <Tab dataElement="filePickerPanelButton">
                  <button className="tab-options-button">
                    {t('option.pageReplacementModal.localFile')}
                  </button>
                </Tab>
              </div>
            </div>
            <TabPanel dataElement="customFileListPanel">
              <div className="panel-body">
                <FileListPanel
                  onFileSelect={(selection) => {
                    setSource({ [selectedTabInternal]: selection });
                  }}
                  list={selectableFiles}
                  defaultValue={srcString}
                />
              </div>
            </TabPanel>
            <TabPanel dataElement="urlInputPanel">
              <div className="panel-body">
                <FileInputPanel
                  onFileSelect={(url) => {
                    setSource({ [selectedTabInternal]: url });
                  }}
                  defaultValue={source['urlInputPanelButton']}
                />
              </div>
            </TabPanel>
            <TabPanel dataElement="filePickerPanel">
              <div className="panel-body upload">
                <FilePickerPanel
                  fileInputId={fileInputId}
                  onFileProcessed={(file) => fileProcessedHandler(file)}
                />
              </div>
            </TabPanel>
          </Tabs>
          <div className="page-replacement-divider" />
          <div className="footer">
            <Button
              className={classNames('modal-btn', { noFile: isSelectBtnDisabled })}
              onClick={() => (isSelectBtnDisabled ? null : handleSelection())}
              label={t('action.select')}
              disabled={isSelectBtnDisabled}
            />
          </div>
        </ModalWrapper>
      </div>
    );
  };

  return isOpen ? (
    <div
      className={modalClass}
      data-element="pageReplacementModal"
      onMouseDown={isFileSelected ? closeModalWarning : closeThisModal}
      id="pageReplacementModal"
    >
      {isFileSelected ? renderFileSelectedPanel() : renderSelectionTabs()}
    </div>
  ) : null;
};

export default PageReplacementModal;

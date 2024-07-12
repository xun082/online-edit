import React, { useRef } from 'react';
import { editor } from 'monaco-editor';
import { useDraggable } from '@dnd-kit/core';

import {
  useActiveEditorStore,
  useActiveModelStore,
  useEditorStore,
  useModelsStore,
  useMonacoStore,
  useSplitStore,
} from '@/store/editorStore';
import { useDragIconStore } from '@/store/dragIconStore';
import { addNewModel } from '@/components/editor/utils';
interface FileItemProps {
  file: any;
}

export const FileItem: React.FC<FileItemProps> = ({ file }) => {
  // used for editor
  const { splitState } = useSplitStore();
  const { editors } = useEditorStore();
  const { activeEditor, activeEditorId } = useActiveEditorStore();
  const { monacos } = useMonacoStore();
  const { setActiveModel } = useActiveModelStore();
  const { models, setModels } = useModelsStore();
  //  used for dnd
  const clickClient = useRef({
    x: 0,
    y: 0,
  });
  const { dragIconRef } = useDragIconStore();

  const { listeners, setNodeRef, transform } = useDraggable({
    id: file.filename,
    data: {
      file,
      monacos,
    },
  });

  if (
    clickClient.current.x !== 0 &&
    clickClient.current.y !== 0 &&
    transform &&
    transform.x > 10 &&
    transform.y > 10 &&
    dragIconRef
  ) {
    dragIconRef.style.display = 'block';
    dragIconRef.style.left = `${transform.x + clickClient.current.x + 5}px`;
    dragIconRef.style.top = `${transform.y + clickClient.current.y + 5}px`;
    dragIconRef.innerHTML = `${file.filename}`;
  }

  function handleFileItemMouseUp(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    e.preventDefault();
    e.stopPropagation();
    clickClient.current = {
      x: 0,
      y: 0,
    };

    const willChangeEditor = activeEditor ?? editors[splitState.findIndex((item) => item)];

    const willChangeEditorId = activeEditor ? activeEditorId : splitState.findIndex((item) => item);

    const mathModel = models.filter((model) => model.filename === file.filename);
    // console.log(splitState, mathModel[0], willChangeEditor, willChangeEditorId);

    if (mathModel.length > 0) {
      mathModel[0].model &&
        setActiveModel(mathModel[0].filename, mathModel[0].model, willChangeEditorId);
      mathModel[0].model &&
        setModels(
          { filename: mathModel[0].filename, value: '', language: 'typescript' },
          mathModel[0].model,
          willChangeEditorId,
        );
      willChangeEditor?.setModel(mathModel[0].model);
    } else {
      const monaco = monacos[willChangeEditorId];
      addNewModel(
        file,
        monaco as any,
        willChangeEditor as editor.IStandaloneCodeEditor,
        setModels,
        setActiveModel,
        willChangeEditorId,
      );
    }
  }

  return (
    <div className=" px-3 py-[1px] text-[14px] hover:bg-[#3c4453]">
      <span
        className=" cursor-pointer"
        ref={setNodeRef}
        {...listeners}
        onMouseUp={(e) => handleFileItemMouseUp(e)}
        onMouseDown={(e) => {
          clickClient.current = {
            x: e.clientX,
            y: e.clientY,
          };
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {file.filename}
      </span>
    </div>
  );
};